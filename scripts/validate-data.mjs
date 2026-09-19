import { readFile } from 'node:fs/promises';
import { formulas, scenes } from '../dist/discoveries.js';

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
