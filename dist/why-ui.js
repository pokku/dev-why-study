import { whyAnswers, whyConnections, whyLabs, schoolRoutes, stages, firstStage } from './why-data.js';
import { labs } from './lab-catalog.js';
import { learning } from './learning-data.js';

const kindLabel = { school: '学校で習う', academic: '学問', technology: '技術', interest: '身近なもの', career: '仕事' };
function el(tag, className, text) { const e = document.createElement(tag); if (className) e.className = className; if (text !== undefined) e.textContent = text; return e; }
function link(text, href, className) { const a = el('a', className, text); a.href = href; return a; }
const firstSentence = text => text.split('。')[0] + '。';

function orderedUnits(nodes) {
  return nodes.filter(n => n.kind === 'school' && whyAnswers[n.id]).map(node => ({ node, ...firstStage(node.id) }))
    .sort((a, b) => stages.indexOf(a.stage) - stages.indexOf(b.stage) || a.course.localeCompare(b.course, 'ja', { numeric: true }));
}

export function createWhyIndex(knowledge) {
  const units = orderedUnits(knowledge.nodes);
  const page = el('article', 'string-lab learning-page why-page');
  page.append(link('← 探索ルートへ', '#', 'lab-back'));
  const header = el('header', 'lab-heading');
  header.append(el('p', 'micro-label', 'WHY DO WE LEARN THIS?'), el('h1', '', '「これ、何の役に立つの？」に答える'),
    el('p', '', `学校で習う${units.length}の単元に、短い答え・身近な使い道・この先の勉強・その知識を使う仕事をまとめました。使い道や仕事は、理由つきの知識マップのつながりから選んでいます。`));
  page.append(header);
  const filter = el('div', 'why-stage-filter');
  filter.setAttribute('role', 'group'); filter.setAttribute('aria-label', '学校段階で絞り込む');
  const sections = [];
  for (const stage of stages) {
    const inStage = units.filter(u => u.stage === stage);
    if (!inStage.length) continue;
    const section = el('section', 'why-stage');
    section.dataset.stage = stage;
    section.append(el('h2', '', `${stage}で習う（${inStage.length}単元）`));
    const grid = el('div', 'why-grid');
    for (const { node, course } of inStage) {
      const card = link('', `#why=${node.id}`, 'why-card');
      card.append(el('small', '', course), el('h3', '', node.name), el('p', '', firstSentence(whyAnswers[node.id][0])), el('b', '', '答えを見る →'));
      grid.append(card);
    }
    section.append(grid);
    sections.push(section);
  }
  const buttons = [];
  for (const label of ['すべて', ...stages]) {
    const b = el('button', 'why-filter', label); b.type = 'button';
    b.addEventListener('click', () => { sections.forEach(s => { s.hidden = label !== 'すべて' && s.dataset.stage !== label; }); buttons.forEach(x => x.setAttribute('aria-pressed', String(x === b))); });
    b.setAttribute('aria-pressed', String(label === 'すべて'));
    buttons.push(b); filter.append(b);
  }
  page.append(filter, ...sections);
  page.append(el('p', 'learning-fine', '答えは「必ず役に立つ」という約束ではなく、その単元がどこへつながっているかの案内です。直接使われる場面と、学問を通して間接的につながる場面を区別して表示します。'));
  return page;
}

function connectionCard(item, fromName) {
  const card = link('', `#node=${item.node.id}`, `why-use-card kind-${item.node.kind}`);
  card.append(el('small', '', item.path.length > 1 ? `${item.path[0].name}を通して` : kindLabel[item.node.kind]), el('h3', '', item.node.name));
  if (item.path.length > 1) {
    const chain = el('p', 'why-chain');
    chain.append(el('span', '', fromName), el('i', '', ' → '), el('span', '', item.path[0].name), el('i', '', ' → '), el('span', '', item.node.name));
    card.append(chain);
  }
  card.append(el('p', '', item.reasons.at(-1)));
  return card;
}

export function createWhyPage(id, knowledge) {
  const node = knowledge.nodes.find(n => n.id === id);
  if (!node || node.kind !== 'school' || !whyAnswers[id]) return null;
  const [answer, scene] = whyAnswers[id], c = whyConnections(id, knowledge.nodes, knowledge.edges), stage = firstStage(id);
  const page = el('article', 'string-lab learning-page why-page why-detail');
  page.append(link('← 単元の一覧へ', '#why', 'lab-back'));
  const header = el('header', 'lab-heading');
  header.append(el('p', 'micro-label', `${stage ? (schoolRoutes[id] || []).map(r => r[1]).join(' / ') : node.curriculum}　${node.field}`), el('h1', '', `どうして「${node.name}」を習うの？`));
  page.append(header);

  const answerBox = el('section', 'why-answer');
  answerBox.append(el('p', 'why-answer-text', answer));
  const sceneBox = el('div', 'why-scene');
  sceneBox.append(el('strong', '', 'たとえば'), el('p', '', scene));
  answerBox.append(sceneBox);
  page.append(answerBox);

  if (c.uses.length) {
    const section = el('section', 'why-section');
    section.append(el('h2', '', '身近なところで使われている'), el('p', 'learning-fine', '直接使われるものに加え、少ないときは一段先の学問を通したつながりも表示します。押すと知識マップへ進みます。'));
    const grid = el('div', 'why-use-grid');
    c.uses.forEach(item => grid.append(connectionCard(item, node.name)));
    section.append(grid);
    page.append(section);
  }

  const relatedLabs = whyLabs(id, labs, learning);
  if (relatedLabs.length) {
    const section = el('section', 'why-section why-labs');
    section.append(el('h2', '', '触って確かめる'));
    const list = el('div', 'why-lab-list');
    relatedLabs.forEach(lab => { const a = link('', `#lab=${lab.id}`, 'why-lab'); a.append(el('span', 'why-lab-icon', lab.icon), el('strong', '', lab.title), el('small', '', lab.category)); list.append(a); });
    section.append(list);
    page.append(section);
  }

  const study = el('section', 'why-section why-study');
  study.append(el('h2', '', 'この先の勉強とのつながり'));
  for (const [title, items] of [['この単元を土台にして学ぶこと', c.next], ['先に知っておくと分かりやすいこと', c.before], ['関連が深いこと', c.side]]) {
    if (!items.length) continue;
    const group = el('div', 'why-study-group');
    group.append(el('h3', '', title));
    const list = el('ul', '');
    items.forEach(item => { const li = el('li', ''); li.append(link(item.node.name, `#node=${item.node.id}`), el('span', '', item.reason)); list.append(li); });
    group.append(list);
    study.append(group);
  }
  page.append(study);

  if (c.careers.length) {
    const section = el('section', 'why-section');
    section.append(el('h2', '', 'この知識を使う仕事'), el('p', 'learning-fine', 'この単元から学問や技術を通ってたどり着く仕事です。その仕事に就くのに必ず必要という意味ではありません。'));
    const grid = el('div', 'why-use-grid');
    c.careers.forEach(item => {
      const card = link('', `#node=${item.node.id}`, 'why-use-card kind-career');
      card.append(el('small', '', '仕事'), el('h3', '', item.node.name));
      const chain = el('p', 'why-chain');
      [node, ...item.path].forEach((step, index) => { if (index) chain.append(el('i', '', ' → ')); chain.append(el('span', '', step.name)); });
      card.append(chain, el('p', '', item.reasons.at(-1)));
      grid.append(card);
    });
    section.append(grid);
    page.append(section);
  }

  const units = orderedUnits(knowledge.nodes), index = units.findIndex(u => u.node.id === id);
  const nav = el('nav', 'why-next-nav');
  nav.setAttribute('aria-label', '単元の移動');
  if (index > 0) nav.append(link(`← ${units[index - 1].node.name}`, `#why=${units[index - 1].node.id}`));
  nav.append(link('知識マップで全部のつながりを見る', `#node=${id}`, 'learning-cta'));
  if (index < units.length - 1) nav.append(link(`${units[index + 1].node.name} →`, `#why=${units[index + 1].node.id}`));
  page.append(nav);
  return page;
}
