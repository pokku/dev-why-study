import { formulas, scenes, formulaMarkup } from './discoveries.js';
import { createStringLab } from './string-lab.js';
import { labs } from './lab-catalog.js';
import { createLabGallery, createScienceLab } from './science-labs.js';

const app = document.querySelector('#app');
const homeTemplate = document.querySelector('#home-template');
const searchInput = document.querySelector('#global-search');
const searchResults = document.querySelector('#search-results');

const kindMeta = {
  school: { label: '学校で習う', color: '#2962ff' },
  academic: { label: '学問・専門知識', color: '#7567ee' },
  technology: { label: '技術', color: '#07998e' },
  interest: { label: '身近なもの・興味', color: '#df8b00' },
  career: { label: '仕事', color: '#e34f78' },
};

const relationMeta = {
  prerequisite: { forward: '前提になる', reverse: '理解に必要', group: 'after' },
  develops: { forward: '発展する', reverse: '基礎になっている', group: 'after' },
  toolFor: { forward: '道具として使われる', reverse: '理解に使う', group: 'after' },
  usedIn: { forward: '直接使われる', reverse: '技術を支えている', group: 'uses' },
  application: { forward: '応用される', reverse: 'もとになる知識', group: 'uses' },
  example: { forward: '身近な利用例', reverse: '仕組みにつながる', group: 'uses' },
  related: { forward: '関連が深い', reverse: '関連が深い', group: 'side' },
};

let knowledge = { nodes: [], edges: [], featuredPaths: [] };
let nodesById = new Map();
let lastExplorer = 'formula';
let disposeLab = null;

function navigateToNode(id) {
  location.hash = `node=${encodeURIComponent(id)}`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function makeButton(className, label, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  button.addEventListener('click', onClick);
  return button;
}

function getRoute() {
  const params = new URLSearchParams(location.hash.slice(1));
  return params.get('node');
}

function connectedEdges(id) {
  return knowledge.edges.filter((edge) => edge.from === id || edge.to === id);
}

function connectionFor(edge, currentId) {
  const outgoing = edge.from === currentId;
  const other = nodesById.get(outgoing ? edge.to : edge.from);
  const meta = relationMeta[edge.type] || relationMeta.related;
  let group = meta.group;
  if (!outgoing) {
    if (meta.group === 'after') group = 'before';
    else if (meta.group === 'before') group = 'after';
    else if (meta.group === 'uses') group = other?.kind === 'school' || other?.kind === 'academic' ? 'before' : 'uses';
  }
  return { other, group, label: outgoing ? meta.forward : meta.reverse, reason: edge.reason };
}

function renderNodeCard(node) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'node-card';
  button.style.setProperty('--dot', kindMeta[node.kind]?.color || '#2962ff');
  button.addEventListener('click', () => navigateToNode(node.id));

  const kind = document.createElement('span');
  kind.className = 'node-kind';
  kind.textContent = kindMeta[node.kind]?.label || node.kind;
  const title = document.createElement('h3');
  title.textContent = node.name;
  const summary = document.createElement('p');
  summary.textContent = node.summary;
  button.append(kind, title, summary);
  return button;
}

const academicClusters = {
  'heat-equation': '物理',
  'image-frequency': '情報・AI',
  'mass-energy': '物理',
  'wave-equation': '物理',
  'maxwell-equations': '電気・通信',
  'schrodinger-equation': '物理',
  'nuclear-fusion': '物理',
  'exponential-function': '数学',
  logarithm: '数学',
  matrix: '数学',
  'linear-algebra': '数学',
  'differential-equation': '数学',
  fourier: '数学',
  optimization: '数学',
  mechanics: '物理',
  fluid: '物理',
  'navier-stokes': '物理',
  magnus: '物理',
  'data-analysis': '情報・AI',
  'signal-processing': '情報・AI',
  'information-theory': '情報・AI',
  'computer-science': '情報・AI',
  'machine-learning': '情報・AI',
  'neural-network': '情報・AI',
  'computer-graphics': '情報・AI',
  'communication-engineering': '電気・通信',
};

const schoolRoutes = {
  dispersion: [['高校', '高校・物理']],
  beats: [['高校', '高校・物理']],
  gravity: [['高校', '高校・物理']],
  resonance: [['高校', '高校・物理']],
  interference: [['高校', '高校・物理']],
  'inverse-proportion': [['小学校', '小6・算数'], ['中学校', '中1・数学']],
  'ohms-law': [['中学校', '中2・理科'], ['高校', '高校・物理']],
  multiplication: [['小学校', '小2・算数'], ['小学校', '小3・算数']],
  division: [['小学校', '小3・算数'], ['小学校', '小4・算数']],
  fraction: [['小学校', '小3・算数'], ['小学校', '小4・算数'], ['小学校', '小5・算数'], ['小学校', '小6・算数']],
  decimal: [['小学校', '小3・算数'], ['小学校', '小4・算数'], ['小学校', '小5・算数']],
  ratio: [['小学校', '小5・算数']],
  percentage: [['小学校', '小5・算数']],
  proportion: [['小学校', '小6・算数']],
  speed: [['小学校', '小5・算数'], ['小学校', '小6・算数']],
  circle: [['小学校', '小6・算数'], ['中学校', '中1・数学'], ['中学校', '中3・数学']],
  coordinates: [['中学校', '中1・数学']],
  equation: [['中学校', '中1・数学'], ['中学校', '中2・数学'], ['中学校', '中3・数学']],
  function: [['中学校', '中1・数学'], ['中学校', '中2・数学'], ['中学校', '中3・数学'], ['高校', '高校・数学I']],
  'exponential-function': [['高校', '高校・数学II']],
  logarithm: [['高校', '高校・数学II']],
  probability: [['中学校', '中2・数学'], ['高校', '高校・数学A']],
  statistics: [['中学校', '中2・数学'], ['中学校', '中3・数学'], ['高校', '高校・数学I']],
  pythagorean: [['中学校', '中3・数学']],
  atom: [['中学校', '中2・理科'], ['高校', '高校・化学']],
  molecule: [['中学校', '中2・理科'], ['高校', '高校・化学']],
  'chemical-reaction': [['中学校', '中2・理科'], ['高校', '高校・化学']],
  cell: [['中学校', '中2・理科'], ['高校', '高校・生物']],
  force: [['中学校', '中1・理科'], ['中学校', '中3・理科'], ['高校', '高校・物理']],
  electricity: [['中学校', '中2・理科'], ['高校', '高校・物理']],
  dna: [['中学校', '中3・理科'], ['高校', '高校・生物']],
  programming: [['中学校', '中学・技術／情報'], ['高校', '高校・情報I']],
  vector: [['高校', '高校・数学C']],
  trigonometry: [['高校', '高校・数学II']],
  calculus: [['高校', '高校・数学II'], ['高校', '高校・数学III']],
  motion: [['高校', '高校・物理']],
  rotation: [['高校', '高校・物理']],
  wave: [['高校', '高校・物理']],
  electromagnetism: [['高校', '高校・物理']],
  binary: [['高校', '高校・情報I']],
  algorithm: [['高校', '高校・情報I']],
};

const explorerMeta = {
  formula: { label: '公式・方程式から探す', steps: [{ title: 'この式、どこにつながる？', guide: 'まだ読めなくても大丈夫。気になる形を押して、身近な世界とのつながりを見てみよう。' }] },
  science: { label: '科学の図から探す', steps: [{ title: 'この景色の向こうに、何がある？', guide: '波や流れの図から、現象を表す式、身近な技術、その土台の勉強へ。' }] },
  school: {
    label: '学校から探す',
    steps: [
      { title: '学校を選ぶ', guide: '小学校・中学校・高校から、いま学んでいる段階を選びます。' },
      { title: '学年・科目を選ぶ', guide: 'カリキュラムに沿って、学年と科目を絞ります。' },
      { title: '単元を選ぶ', guide: '単元を選ぶと、その知識からマインドマップが広がります。' },
    ],
  },
  academic: {
    label: '学問から探す',
    steps: [
      { title: '分野を選ぶ', guide: '数学・物理・情報・通信の大きな分野から入ります。' },
      { title: 'テーマを選ぶ', guide: 'テーマを選ぶと、関連する基礎や応用が地図になります。' },
    ],
  },
  interest: {
    label: '興味から探す',
    steps: [
      { title: '興味のある分野を選ぶ', guide: '身近なものや好きなことから入口を選びます。' },
      { title: 'テーマを選ぶ', guide: 'テーマを選ぶと、仕組みを支える知識へ戻れます。' },
    ],
  },
};

function makeFormulaVisual(formula) {
  const visual = document.createElement('div');
  visual.className = `formula-visual formula-${formula.nodeId}`;
  visual.innerHTML = formulaMarkup(formula);
  visual.querySelector('math').setAttribute('aria-label', formula.spoken);
  return visual;
}

function renderDiscoveryCard(item, isFormula) {
  const node = nodesById.get(item.nodeId);
  const button = makeButton('discovery-card', '', () => navigateToNode(item.nodeId));
  button.setAttribute('aria-label', `${isFormula ? node.name : item.title}のマップを開く`);
  const art = isFormula ? makeFormulaVisual(item) : document.createElement('div');
  if (!isFormula) { art.className = 'science-visual'; art.innerHTML = item.image; }
  const text = document.createElement('div');
  text.className = 'discovery-copy';
  const title = document.createElement('h3');
  title.textContent = isFormula ? node.name : item.title;
  const hook = document.createElement('p');
  hook.textContent = item.hook;
  const link = document.createElement('span');
  link.textContent = 'つながりを見にいく ↗';
  text.append(title, hook, link);
  if (!isFormula) {
    const caption = document.createElement('small');
    caption.textContent = item.caption;
    text.append(caption);
  }
  button.append(art, text);
  return button;
}

function explorerPaths(kind) {
  const nodes = kind === 'interest'
    ? knowledge.nodes.filter((node) => ['interest', 'technology', 'career'].includes(node.kind))
    : kind === 'academic'
      ? knowledge.nodes.filter((node) => node.kind === 'academic' || academicClusters[node.id])
      : knowledge.nodes.filter((node) => node.kind === kind);
  if (kind === 'school') {
    return nodes.flatMap((node) => (schoolRoutes[node.id] || []).map(([stage, course]) => ({
      labels: [stage, course],
      node,
    })));
  }
  if (kind === 'academic') {
    return nodes.map((node) => ({ labels: [academicClusters[node.id] || 'その他'], node }));
  }
  return nodes.map((node) => ({ labels: [node.field], node }));
}

function renderExplorer(kind, selection = [], shouldScroll = false) {
  lastExplorer = kind;
  const section = app.querySelector('#explorer-section');
  const breadcrumbs = app.querySelector('#explorer-breadcrumbs');
  const options = app.querySelector('#explorer-options');
  const heading = app.querySelector('#explorer-title');
  const guide = app.querySelector('#explorer-guide');
  const meta = explorerMeta[kind];
  const paths = explorerPaths(kind).filter((path) => selection.every((value, index) => path.labels[index] === value));
  const depth = selection.length;
  const nextLabels = [...new Set(paths.map((path) => path.labels[depth]).filter(Boolean))];
  const stepIndex = nextLabels.length ? depth : meta.steps.length - 1;

  section.hidden = false;
  breadcrumbs.replaceChildren();
  options.replaceChildren();
  const discovery = kind === 'formula' || kind === 'science';
  options.classList.toggle('discovery-grid', discovery);
  app.querySelectorAll('[data-entry]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.entry === kind));
  });
  heading.textContent = meta.steps[stepIndex].title;
  guide.textContent = meta.steps[stepIndex].guide;

  const root = makeButton('explorer-crumb', meta.label, () => renderExplorer(kind));
  breadcrumbs.append(root);
  selection.forEach((value, index) => {
    const arrow = document.createElement('span');
    arrow.textContent = '›';
    breadcrumbs.append(arrow, makeButton('explorer-crumb', value, () => renderExplorer(kind, selection.slice(0, index + 1))));
  });

  if (discovery) {
    (kind === 'formula' ? formulas : scenes).forEach((item) => options.append(renderDiscoveryCard(item, kind === 'formula')));
  } else if (nextLabels.length) {
    const preferredOrder = ['小学校', '中学校', '高校', '数学', '物理', '情報・AI', '電気・通信'];
    nextLabels.sort((a, b) => {
      const aIndex = preferredOrder.indexOf(a);
      const bIndex = preferredOrder.indexOf(b);
      if (aIndex !== -1 || bIndex !== -1) return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
      return a.localeCompare(b, 'ja', { numeric: true });
    });
    nextLabels.forEach((label) => {
      const matching = paths.filter((path) => path.labels[depth] === label);
      const uniqueNodes = new Set(matching.map((path) => path.node.id)).size;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'explorer-choice';
      const name = document.createElement('strong');
      name.textContent = label;
      const count = document.createElement('span');
      count.textContent = `${uniqueNodes}単元`;
      button.append(name, count);
      button.addEventListener('click', () => renderExplorer(kind, [...selection, label]));
      options.append(button);
    });
  } else {
    const uniqueNodes = [...new Map(paths.map((path) => [path.node.id, path.node])).values()];
    uniqueNodes.forEach((node) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'explorer-topic';
      button.dataset.kind = node.kind;
      const text = document.createElement('span');
      const name = document.createElement('strong');
      name.textContent = node.name;
      const summary = document.createElement('small');
      summary.textContent = node.summary;
      text.append(name, summary);
      const open = document.createElement('i');
      open.textContent = '地図を開く →';
      button.append(text, open);
      button.addEventListener('click', () => navigateToNode(node.id));
      options.append(button);
    });
  }

  if (shouldScroll) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderHome() {
  app.replaceChildren(homeTemplate.content.cloneNode(true));
  document.title = 'どうして勉強しないといけないの？';

  const entryConfig = [
    { key: 'formula', symbol: 'E=mc²', title: '公式・方程式から', text: '見覚えのある式。まだ読めない式。その先にある世界へ。' },
    { key: 'science', symbol: '∿', title: '科学の図から', text: '波、風、振動。目に留まった図から、仕組みをたどる。' },
    { key: 'school', symbol: '学', title: '学校から探す', text: '小学校・中学校・高校から、学年と科目、単元の順にたどる。' },
    { key: 'academic', symbol: '∑', title: '学問から探す', text: '数学・物理・情報・通信の分野から、知りたいテーマを選ぶ。' },
    { key: 'interest', symbol: '◎', title: '興味から探す', text: 'AI、スマートフォン、ゲーム、野球など、好きなものから戻る。' },
  ];
  const entryGrid = app.querySelector('#entry-grid');
  entryConfig.forEach((entry) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'entry-card';
    button.dataset.entry = entry.key;
    button.innerHTML = `<span class="entry-symbol">${entry.symbol}</span><h2>${entry.title}</h2><p>${entry.text}</p><span class="entry-link">順にたどる →</span>`;
    button.addEventListener('click', () => {
      const hash = `#explore=${entry.key}`;
      if (location.hash === hash) renderExplorer(entry.key, [], true);
      else location.hash = hash;
    });
    entryGrid.append(button);
  });
  const requested = new URLSearchParams(location.hash.slice(1)).get('explore');
  renderExplorer(explorerMeta[requested] ? requested : 'formula', [], Boolean(requested));
  const invitation = document.createElement('a');
  invitation.className = 'lab-invitation';
  invitation.href = '#labs';
  invitation.innerHTML = `<span>触って、聞いて、わかる</span><strong>光・音・宇宙・熱・画像の${labs.length}つの体験。</strong><span>体験一覧を開く →</span>`;
  app.querySelector('#explorer-section').before(invitation);
}

function buildMindMap(rootId, limit = 15) {
  const direct = connectedEdges(rootId)
    .map((edge) => ({ edge, connection: connectionFor(edge, rootId) }))
    .filter((item) => item.connection.other)
    .slice(0, 8);
  const visibleIds = new Set([rootId, ...direct.map((item) => item.connection.other.id)]);
  const second = [];

  for (let round = 0; visibleIds.size < limit; round += 1) {
    let added = false;
    for (const parent of direct) {
      const candidates = connectedEdges(parent.connection.other.id)
        .map((edge) => ({ edge, connection: connectionFor(edge, parent.connection.other.id) }))
        .filter((item) => item.connection.other && !visibleIds.has(item.connection.other.id));
      const candidate = candidates[round];
      if (!candidate) continue;
      visibleIds.add(candidate.connection.other.id);
      second.push({ ...candidate, parentId: parent.connection.other.id });
      added = true;
      if (visibleIds.size >= limit) break;
    }
    if (!added) break;
  }

  const positioned = [];
  const placeRing = (items, radiusX, radiusY, level, phase = -Math.PI / 2) => {
    items.forEach((item, index) => {
      const angle = phase + (Math.PI * 2 * index) / Math.max(items.length, 1);
      positioned.push({
        ...item,
        level,
        x: 500 + Math.cos(angle) * radiusX,
        y: 325 + Math.sin(angle) * radiusY,
      });
    });
  };
  placeRing(direct, 245, 185, 1);
  const outerRadiusX = window.matchMedia('(max-width: 720px)').matches ? 365 : 410;
  placeRing(second, outerRadiusX, 275, 2, -Math.PI / 2 + (second.length > 1 ? Math.PI / second.length : 0));
  return positioned;
}

function makeMindMapNode(node, position, isRoot = false) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `mindmap-node${isRoot ? ' is-root' : ''}${position?.level === 2 ? ' is-outer' : ''}`;
  button.dataset.kind = node.kind;
  button.style.left = `${(position?.x ?? 500) / 10}%`;
  button.style.top = `${(position?.y ?? 325) / 6.5}%`;
  button.style.setProperty('--delay', `${isRoot ? 0 : (position.level * 80 + position.order * 32)}ms`);
  button.setAttribute('aria-label', isRoot ? `${node.name}（現在の中心）` : `${node.name}を中心に広げる`);
  if (isRoot) button.disabled = true;
  else button.addEventListener('click', () => navigateToNode(node.id));

  const dot = document.createElement('i');
  dot.setAttribute('aria-hidden', 'true');
  const name = document.createElement('strong');
  name.textContent = node.name;
  button.append(dot, name);
  if (isRoot) {
    const count = document.createElement('small');
    count.textContent = `${connectedEdges(node.id).length}本のつながり`;
    button.append(count);
  }
  return button;
}

function renderMindMap(id) {
  const node = nodesById.get(id);
  if (!node) return renderNotFound();
  document.title = `${node.name}の知識マップ｜どうして勉強しないといけないの？`;
  app.replaceChildren();

  const page = document.createElement('article');
  page.className = 'mindmap-page';
  const toolbar = document.createElement('header');
  toolbar.className = 'mindmap-toolbar';
  const back = makeButton('mindmap-back', '← 入口へ戻る', () => { location.hash = `explore=${lastExplorer}`; });
  const heading = document.createElement('div');
  const eyebrow = document.createElement('span');
  eyebrow.textContent = '2段先までを一望';
  const title = document.createElement('h1');
  title.textContent = `${node.name}から広がる地図`;
  heading.append(eyebrow, title);
  const guide = document.createElement('p');
  guide.textContent = '気になる丸を押すと、そこを中心に地図が広がります。';
  toolbar.append(back, heading, guide);

  const layout = document.createElement('div');
  layout.className = 'mindmap-layout';
  const canvasWrap = document.createElement('section');
  canvasWrap.className = 'mindmap-canvas-wrap';
  const canvas = document.createElement('div');
  canvas.className = 'mindmap-canvas';
  canvas.setAttribute('aria-label', `${node.name}を中心にした知識マップ`);

  const nodeLimit = window.matchMedia('(max-width: 720px)').matches ? 11 : 15;
  const positions = buildMindMap(id, nodeLimit).map((item, index) => ({ ...item, order: index }));
  const positionsById = new Map(positions.map((item) => [item.connection.other.id, item]));
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'mindmap-lines');
  svg.setAttribute('viewBox', '0 0 1000 650');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');

  positions.forEach((position) => {
    const source = position.level === 1 ? { x: 500, y: 325 } : positionsById.get(position.parentId);
    if (!source) return;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', source.x);
    line.setAttribute('y1', source.y);
    line.setAttribute('x2', position.x);
    line.setAttribute('y2', position.y);
    line.setAttribute('class', `mindmap-line level-${position.level}`);
    line.style.setProperty('--delay', `${position.level * 70 + position.order * 28}ms`);
    svg.append(line);
  });
  canvas.append(svg, makeMindMapNode(node, null, true));

  positions.forEach((position) => {
    const relatedNode = position.connection.other;
    canvas.append(makeMindMapNode(relatedNode, position));
    if (position.level !== 1) return;
    const label = document.createElement('span');
    label.className = 'mindmap-edge-label';
    label.textContent = position.connection.label;
    label.style.left = `${(500 + (position.x - 500) * 0.56) / 10}%`;
    label.style.top = `${(325 + (position.y - 325) * 0.56) / 6.5}%`;
    label.style.setProperty('--delay', `${position.level * 70 + position.order * 28}ms`);
    canvas.append(label);
  });

  const legend = document.createElement('div');
  legend.className = 'mindmap-legend';
  Object.entries(kindMeta).forEach(([kind, meta]) => {
    const item = document.createElement('span');
    item.dataset.kind = kind;
    item.textContent = meta.label;
    legend.append(item);
  });
  canvasWrap.append(canvas, legend);

  const inspector = document.createElement('aside');
  inspector.className = 'mindmap-inspector';
  const inspectorKind = document.createElement('span');
  inspectorKind.className = 'inspector-kind';
  inspectorKind.dataset.kind = node.kind;
  inspectorKind.textContent = kindMeta[node.kind]?.label || node.kind;
  const inspectorTitle = document.createElement('h2');
  inspectorTitle.textContent = node.name;
  const summary = document.createElement('p');
  summary.className = 'inspector-summary';
  summary.textContent = node.summary;
  const meta = document.createElement('dl');
  meta.innerHTML = `<div><dt>学ぶ目安</dt><dd>${node.curriculum || node.level || 'どこからでも'}</dd></div><div><dt>分野</dt><dd>${node.field}</dd></div>`;
  const relationTitle = document.createElement('h3');
  relationTitle.textContent = '直接つながる理由';
  const relationList = document.createElement('div');
  relationList.className = 'inspector-relations';
  connectedEdges(id).map((edge) => connectionFor(edge, id)).filter((item) => item.other).forEach((connection) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.addEventListener('click', () => navigateToNode(connection.other.id));
    const relationHeading = document.createElement('span');
    relationHeading.innerHTML = `<b>${connection.other.name}</b><small>${connection.label}</small>`;
    const reason = document.createElement('p');
    reason.textContent = connection.reason;
    button.append(relationHeading, reason);
    relationList.append(button);
  });
  inspector.append(inspectorKind, inspectorTitle, summary);
  const formula = formulas.find((item) => item.nodeId === id);
  if (formula) {
    inspector.append(makeFormulaVisual(formula));
    const symbols = document.createElement('p');
    symbols.className = 'formula-explanation';
    symbols.textContent = formula.symbols;
    const condition = document.createElement('p');
    condition.className = 'formula-condition';
    condition.textContent = formula.condition;
    inspector.append(symbols, condition);
  }
  inspector.append(meta, relationTitle, relationList);
  layout.append(canvasWrap, inspector);
  page.append(toolbar);
  const relatedLabs = labs.filter(lab => lab.nodes.includes(id));
  if (relatedLabs.length) {
    const experiment = document.createElement('div');
    experiment.className = 'lab-invitation is-map';
    const title = document.createElement('strong');
    title.textContent = 'この知識を、触って試そう。';
    experiment.append(title);
    relatedLabs.forEach(lab => {
      const link = document.createElement('a');
      link.href = `#lab=${lab.id}`;
      link.textContent = `${lab.title} ↗`;
      experiment.append(link);
    });
    page.append(experiment);
    page.classList.add('has-experiment');
  }
  if (formula) {
    const discovery = document.createElement('section');
    discovery.className = 'discovery-trail';
    discovery.setAttribute('aria-label', '身近な世界と勉強のつながり');
    const heading = document.createElement('strong');
    heading.textContent = formula.hook;
    discovery.append(heading);
    for (const [label, ids] of [['身近な世界へ', formula.trail], ['学校の勉強へ', formula.basics]]) {
      const line = document.createElement('div');
      const caption = document.createElement('span');
      caption.textContent = label;
      line.append(caption);
      ids.forEach((nodeId, index) => {
        if (index) { const arrow = document.createElement('span'); arrow.textContent = label === '身近な世界へ' ? '→' : '・'; line.append(arrow); }
        const button = makeButton('trail-node', nodesById.get(nodeId).name, () => navigateToNode(nodeId));
        if (nodeId === id) { button.disabled = true; button.setAttribute('aria-current', 'true'); }
        line.append(button);
      });
      discovery.append(line);
    }
    page.append(discovery);
  }
  page.append(layout);
  app.append(page);
  app.focus({ preventScroll: true });
}

function renderNotFound() {
  app.replaceChildren();
  const card = document.createElement('div');
  card.className = 'error-card';
  const title = document.createElement('h1');
  title.textContent = 'その知識は、まだ地図にありません';
  const text = document.createElement('p');
  text.textContent = 'トップに戻って、別の言葉からたどってみてください。';
  card.append(title, text, makeButton('primary-button', 'トップへ戻る', () => { location.hash = ''; }));
  app.append(card);
}

function updateSearch() {
  const normalize = (value) => value.normalize('NFKC').replace(/[\s^]/g, '').toLocaleLowerCase('ja');
  const query = normalize(searchInput.value.trim());
  searchResults.replaceChildren();
  if (!query) {
    searchResults.hidden = true;
    return;
  }
  const matches = knowledge.nodes.filter((node) => {
    const formula = formulas.find((item) => item.nodeId === node.id);
    return normalize(`${node.name} ${node.summary} ${node.field} ${formula?.spoken || ''}`).includes(query);
  }).slice(0, 8);
  if (!matches.length) {
    const empty = document.createElement('div');
    empty.className = 'search-result';
    empty.textContent = '一致する知識が見つかりません';
    searchResults.append(empty);
  } else {
    matches.forEach((node) => {
      const button = makeButton('search-result', node.name, () => {
        navigateToNode(node.id);
        searchInput.value = '';
        searchResults.hidden = true;
      });
      const meta = document.createElement('small');
      meta.textContent = `${kindMeta[node.kind]?.label}・${node.field}`;
      button.append(meta);
      searchResults.append(button);
    });
  }
  searchResults.hidden = false;
}

function renderRoute() {
  if (disposeLab) { disposeLab(); disposeLab = null; }
  const route = new URLSearchParams(location.hash.slice(1));
  if (route.has('labs')) {
    app.replaceChildren(createLabGallery());
    document.title = '触ってわかる体験一覧｜どうして勉強しないといけないの？';
    window.scrollTo({ top: 0, behavior: 'instant' });
    app.focus({ preventScroll: true });
    return;
  }
  if (route.has('lab')) {
    const definition = labs.find(lab => lab.id === route.get('lab'));
    if (!definition) return renderNotFound();
    const lab = definition.id === 'string' ? createStringLab() : createScienceLab(definition.id, nodesById);
    disposeLab = lab.dispose;
    app.replaceChildren(lab.element);
    document.title = `${definition.title}｜どうして勉強しないといけないの？`;
    window.scrollTo({ top: 0, behavior: 'instant' });
    app.focus({ preventScroll: true });
    return;
  }
  const id = getRoute();
  if (id) renderMindMap(id);
  else renderHome();
}

document.querySelector('[data-go-home]').addEventListener('click', () => { location.hash = ''; });
searchInput.addEventListener('input', updateSearch);
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') { searchInput.value = ''; searchResults.hidden = true; }
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('.header-search')) searchResults.hidden = true;
});
window.addEventListener('hashchange', renderRoute);

fetch('./data/knowledge.json')
  .then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then((data) => {
    knowledge = data;
    nodesById = new Map(data.nodes.map((node) => [node.id, node]));
    document.querySelector('#data-count').textContent = `${data.nodes.length}の概念・${data.edges.length}のつながり`;
    renderRoute();
  })
  .catch((error) => {
    console.error(error);
    app.innerHTML = '<div class="error-card"><h1>データを読み込めませんでした</h1><p>ページを再読み込みしてください。</p></div>';
  });
