import { readFile } from 'node:fs/promises';
import { formulas, scenes } from '../dist/discoveries.js';
import { labs } from '../dist/lab-catalog.js';
import { journeys, learning, everydayLinks } from '../dist/learning-data.js';
import { interestGroups } from '../dist/interest-groups.js';
import { intuition } from '../dist/intuition.js';
import { connectionTrails, edgeBetween } from '../dist/map-play.js';

const source = new URL('../dist/data/knowledge.json', import.meta.url);
const data = JSON.parse(await readFile(source, 'utf8'));
const allowedKinds = new Set(['school', 'academic', 'technology', 'interest', 'career']);
const allowedRelations = new Set(['prerequisite', 'develops', 'toolFor', 'usedIn', 'application', 'example', 'related']);
const ids = new Set();
const problems = [];

for (const node of data.nodes ?? []) {
  if (!node.id || !node.name || !node.summary || !node.kind || !node.field) problems.push(`必須項目が足りないノード: ${JSON.stringify(node)}`);
  if (ids.has(node.id)) problems.push(`重複したノードID: ${node.id}`);
  if (!allowedKinds.has(node.kind)) problems.push(`未定義の種類: ${node.id} (${node.kind})`);
  ids.add(node.id);
}

const edgeKeys = new Set();
for(const trail of connectionTrails){
  for(const id of trail.nodes)if(!ids.has(id))problems.push(`意外な道の参照不正: ${trail.id}/${id}`);
  for(let i=1;i<trail.nodes.length;i++)if(!edgeBetween(data.edges,trail.nodes[i-1],trail.nodes[i]))problems.push(`意外な道の断絶: ${trail.id}/${i}`);
}
const interestIds = new Set();
for (const group of interestGroups) {
  if (group.nodes.length < 4 || new Set(group.nodes).size !== group.nodes.length) problems.push(`興味の分類が不足・重複: ${group.title}`);
  for (const id of group.nodes) { if (!ids.has(id)) problems.push(`興味の分類の参照不正: ${id}`); interestIds.add(id); }
}
for (const node of data.nodes) if (['interest','technology','career'].includes(node.kind) && !interestIds.has(node.id)) problems.push(`興味の入口にないテーマ: ${node.id}`);
for (const edge of data.edges ?? []) {
  if (!ids.has(edge.from)) problems.push(`存在しない接続元: ${edge.from}`);
  if (!ids.has(edge.to)) problems.push(`存在しない接続先: ${edge.to}`);
  if (!allowedRelations.has(edge.type)) problems.push(`未定義の関係: ${edge.type}`);
  if (!edge.reason) problems.push(`理由がない関係: ${edge.from} -> ${edge.to}`);
  const key = `${edge.from}|${edge.to}|${edge.type}`;
  if (edgeKeys.has(key)) problems.push(`重複した関係: ${key}`);
  edgeKeys.add(key);
}

const connected = new Set(data.edges.flatMap((edge) => [edge.from, edge.to]));
const labIds = new Set();
for (const lab of labs) {
  const explanation = intuition[lab.id];
  if (!explanation || !explanation[0] || !explanation[2] || explanation[1]?.length !== 3 || explanation[1].some(step => step.length !== 2 || step.some(text => !text))) problems.push(`具体例の説明不足: ${lab.id}`);
  if (labIds.has(lab.id)) problems.push(`体験IDの重複: ${lab.id}`);
  labIds.add(lab.id);
  for (const node of lab.nodes) if (!ids.has(node)) problems.push(`体験のリンク切れ: ${lab.id} -> ${node}`);
  for (const [key,,min,max,step,value] of lab.controls ?? []) {
    if (!(step > 0 && min <= value && value <= max)) problems.push(`体験の設定範囲が不正: ${lab.id}/${key}`);
  }
}
const labSource = await readFile(new URL('../dist/string-lab.js', import.meta.url), 'utf8');
const routeIds = new Set();
for (const journey of journeys) {
  if (routeIds.has(journey.id)) problems.push(`探索ルートIDの重複: ${journey.id}`);
  routeIds.add(journey.id);
  for (const [lab,question] of journey.steps) if (!labIds.has(lab) || !question) problems.push(`探索ルートの参照不正: ${journey.id}/${lab}`);
}
for (const lab of labs) {
  const entry = learning[lab.id];
  if (!everydayLinks[lab.id] || !ids.has(everydayLinks[lab.id][0])) problems.push(`身近な世界の参照不正: ${lab.id}`);
  if (!entry || entry.length !== 6 || entry.some(item=>!item)) problems.push(`体験の学習ガイド不足: ${lab.id}`);
  else {
    if (!ids.has(entry[3])) problems.push(`学習ガイドの知識参照不正: ${lab.id}/${entry[3]}`);
    if (!labIds.has(entry[4]) || entry[4] === lab.id) problems.push(`次の疑問の参照不正: ${lab.id}`);
  }
  if (!journeys.some(j=>j.steps.some(([id])=>id===lab.id))) problems.push(`探索ルートに登場しない体験: ${lab.id}`);
}
for (const [, id] of labSource.matchAll(/href="#node=([a-z0-9-]+)"/g)) {
  if (!ids.has(id)) problems.push(`弦の体験からのリンク先が存在しない: ${id}`);
}
for (const id of ids) {
  if (!connected.has(id)) problems.push(`孤立したノード: ${id}`);
}

const formulaIds = new Set();
const linked = (a, b) => data.edges.some((edge) =>
  (edge.from === a && edge.to === b) || (edge.from === b && edge.to === a));
for (const formula of formulas) {
  if (formulaIds.has(formula.nodeId)) problems.push(`重複した公式: ${formula.nodeId}`);
  formulaIds.add(formula.nodeId);
  if (!ids.has(formula.nodeId) || !formula.expression || !formula.spoken || !formula.symbols || !formula.condition) problems.push(`公式の情報不足: ${formula.nodeId}`);
  if (formula.trail[0] !== formula.nodeId) problems.push(`公式の経路の起点が不一致: ${formula.nodeId}`);
  for (const id of [...formula.trail, ...formula.basics]) {
    if (!ids.has(id)) problems.push(`公式からの参照先が存在しない: ${id}`);
  }
  formula.trail.slice(1).forEach((id, index) => {
    if (!linked(formula.trail[index], id)) problems.push(`身近な世界への経路が途切れている: ${formula.nodeId} -> ${id}`);
  });
  for (const id of formula.basics) {
    if (!linked(formula.nodeId, id)) problems.push(`学校の勉強との関係がない: ${formula.nodeId} -> ${id}`);
  }
}
for (const scene of scenes) {
  if (!formulaIds.has(scene.nodeId) || !scene.caption || !scene.image) problems.push(`科学の図の情報不足: ${scene.id}`);
}

for (const path of data.featuredPaths ?? []) {
  for (const id of path.nodes) {
    if (!ids.has(id)) problems.push(`代表経路に存在しないノード: ${id}`);
  }
  for (let index = 0; index < path.nodes.length - 1; index += 1) {
    const from = path.nodes[index];
    const to = path.nodes[index + 1];
    const linked = data.edges.some((edge) => (edge.from === from && edge.to === to) || (edge.from === to && edge.to === from));
    if (!linked) problems.push(`代表経路が途切れている: ${from} -> ${to}`);
  }
  for (const branch of path.branches ?? []) {
    if (!ids.has(branch.from)) problems.push(`枝の起点が存在しない: ${branch.from}`);
    for (const id of branch.nodes) {
      if (!ids.has(id)) problems.push(`枝に存在しないノード: ${id}`);
      const linked = data.edges.some((edge) =>
        (edge.from === branch.from && edge.to === id) || (edge.from === id && edge.to === branch.from));
      if (!linked) problems.push(`枝がつながっていない: ${branch.from} -> ${id}`);
    }
  }
}

const neighbors = new Map([...ids].map((id) => [id, []]));
for (const edge of data.edges) {
  neighbors.get(edge.from)?.push(edge.to);
  neighbors.get(edge.to)?.push(edge.from);
}

function hasPath(from, to) {
  const queue = [from];
  const visited = new Set(queue);
  while (queue.length) {
    const current = queue.shift();
    if (current === to) return true;
    for (const neighbor of neighbors.get(current) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return false;
}

for (const [from, to] of [['ratio', 'ai'], ['trigonometry', 'wifi'], ['baseball', 'mechanics']]) {
  if (!hasPath(from, to)) problems.push(`必須ルートを探索できない: ${from} -> ${to}`);
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}

console.log(`OK: ${ids.size} nodes, ${data.edges.length} edges, ${data.featuredPaths.length} featured paths`);
console.log(`OK: ${formulas.length} formulas, ${scenes.length} science illustrations, discovery paths connected`);
console.log(`OK: ${labIds.size} interactive experiences, links and controls checked`);
console.log(`OK: ${journeys.length} learning journeys, every experiment has a mission and a next question`);
