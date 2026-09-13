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

function populateSelect(select, selectedId) {
  const groups = new Map();
  knowledge.nodes.forEach((node) => {
    const group = node.kind;
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(node);
  });
  for (const [kind, nodes] of groups) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = kindMeta[kind]?.label || kind;
    nodes.sort((a, b) => a.name.localeCompare(b.name, 'ja')).forEach((node) => {
      const option = document.createElement('option');
      option.value = node.id;
      option.textContent = node.name;
      option.selected = node.id === selectedId;
      optgroup.append(option);
    });
    select.append(optgroup);
  }
}

function findPath(from, to) {
  if (from === to) return [from];
  const queue = [[from]];
  const visited = new Set([from]);
  while (queue.length) {
    const path = queue.shift();
    const current = path[path.length - 1];
    const neighbors = connectedEdges(current).map((edge) => edge.from === current ? edge.to : edge.from);
    for (const neighbor of neighbors) {
      if (visited.has(neighbor)) continue;
      const nextPath = [...path, neighbor];
      if (neighbor === to) return nextPath;
      visited.add(neighbor);
      queue.push(nextPath);
    }
  }
  return null;
}

function relationBetween(from, to) {
  const edge = knowledge.edges.find((item) =>
    (item.from === from && item.to === to) || (item.from === to && item.to === from));
  if (!edge) return { label: 'つながる', reason: '' };
  const meta = relationMeta[edge.type] || relationMeta.related;
  return {
    label: edge.from === from ? meta.forward : meta.reverse,
    reason: edge.reason,
  };
}

function renderOverviewMap(path, index) {
  const article = document.createElement('article');
  article.className = 'overview-map';
  const heading = document.createElement('header');
  heading.className = 'overview-map-heading';
  const number = document.createElement('span');
  number.textContent = `MAP 0${index + 1}`;
  const title = document.createElement('h2');
  const first = nodesById.get(path.nodes[0]);
  const last = nodesById.get(path.nodes[path.nodes.length - 1]);
  title.textContent = `${first?.name ?? ''}から${last?.name ?? ''}へ`;
  const caption = document.createElement('p');
  caption.textContent = path.label;
  heading.append(number, title, caption);

  const flow = document.createElement('div');
  flow.className = 'map-flow';
  path.nodes.forEach((id, stepIndex) => {
    const node = nodesById.get(id);
    if (!node) return;
    const card = document.createElement('section');
    card.className = 'map-node-card';
    card.dataset.kind = node.kind;
    const meta = document.createElement('small');
    meta.textContent = `${kindMeta[node.kind]?.label ?? node.kind}・${node.curriculum}`;
    const name = document.createElement('h3');
    name.textContent = node.name;
    const summary = document.createElement('p');
    summary.textContent = node.summary;
    const detail = document.createElement('a');
    detail.href = `#node=${encodeURIComponent(node.id)}`;
    detail.textContent = 'マップで広げる';
    card.append(meta, name, summary, detail);
    flow.append(card);

    if (stepIndex < path.nodes.length - 1) {
      const relation = relationBetween(id, path.nodes[stepIndex + 1]);
      const connector = document.createElement('div');
      connector.className = 'map-connector';
      const line = document.createElement('span');
      line.setAttribute('aria-hidden', 'true');
      const label = document.createElement('strong');
      label.textContent = relation.label;
      const reason = document.createElement('p');
      reason.textContent = relation.reason;
      connector.append(line, label, reason);
      flow.append(connector);
    }
  });
  article.append(heading, flow);
  if (path.branches?.length) {
    const branches = document.createElement('div');
    branches.className = 'map-branches';
    const branchesTitle = document.createElement('strong');
    branchesTitle.className = 'map-branches-title';
    branchesTitle.textContent = '枝分かれする知識';
    branches.append(branchesTitle);
    path.branches.forEach((branch) => {
      const group = document.createElement('div');
      group.className = 'map-branch-group';
      const source = document.createElement('span');
      source.className = 'map-branch-source';
      source.textContent = nodesById.get(branch.from)?.name ?? branch.from;
      group.append(source);
      branch.nodes.forEach((id) => {
        const node = nodesById.get(id);
        if (!node) return;
        const relation = relationBetween(branch.from, id);
        const branchCard = document.createElement('div');
        branchCard.className = 'map-branch-card';
        branchCard.dataset.kind = node.kind;
        const branchName = document.createElement('b');
        branchName.textContent = node.name;
        const branchRelation = document.createElement('small');
        branchRelation.textContent = relation.label;
        const branchReason = document.createElement('p');
        branchReason.textContent = relation.reason;
        branchCard.append(branchName, branchRelation, branchReason);
        group.append(branchCard);
      });
      branches.append(group);
    });
    article.append(branches);
  }
  return article;
}

function displayPath(container, ids, note = 'つながりが短い順に見つけた経路です。') {
  container.replaceChildren();
  if (!ids) {
    const message = document.createElement('p');
    message.className = 'path-note';
    message.textContent = 'この2つを結ぶ経路は、まだ登録されていません。';
    container.append(message);
    return;
  }
  const trail = document.createElement('div');
  trail.className = 'path-trail';
  ids.forEach((id, index) => {
    const node = nodesById.get(id);
    if (!node) return;
    trail.append(makeButton('', node.name, () => navigateToNode(id)));
    if (index < ids.length - 1) {
      const arrow = document.createElement('span');
      arrow.textContent = '→';
      trail.append(arrow);
    }
  });
  const caption = document.createElement('p');
  caption.className = 'path-note';
  caption.textContent = note;
  container.append(trail, caption);
}

function renderHome() {
  app.replaceChildren(homeTemplate.content.cloneNode(true));
  document.title = 'どうして勉強しないといけないの？';

  const overviewMaps = app.querySelector('#overview-maps');
  knowledge.featuredPaths.forEach((path, index) => overviewMaps.append(renderOverviewMap(path, index)));

  const entryConfig = [
    { key: 'school', symbol: '学', title: '学校から探す', text: '算数・数学・理科・物理・情報。いま習っていることの続きを見る。' },
    { key: 'academic', symbol: '∑', title: '学問から探す', text: '数学、物理学、情報科学、工学。専門分野の前後をたどる。' },
    { key: 'interest', symbol: '◎', title: '興味から探す', text: 'AI、スマートフォン、ゲーム、野球。好きなものの仕組みへ戻る。' },
  ];
  const entryGrid = app.querySelector('#entry-grid');
  entryConfig.forEach((entry, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'entry-card';
    button.dataset.number = `0${index + 1}`;
    button.innerHTML = `<span class="entry-symbol">${entry.symbol}</span><h3>${entry.title}</h3><p>${entry.text}</p><span class="entry-link">見てみる →</span>`;
    button.addEventListener('click', () => applyFilter(entry.key, true));
    entryGrid.append(button);
  });

  const filters = [
    { key: 'all', label: 'すべて' },
    { key: 'school', label: '学校' },
    { key: 'academic', label: '学問' },
    { key: 'technology', label: '技術' },
    { key: 'interest', label: '興味' },
    { key: 'career', label: '仕事' },
  ];
  const filterRow = app.querySelector('#filter-row');
  filters.forEach((filter) => filterRow.append(makeButton(`filter-button${filter.key === 'all' ? ' active' : ''}`, filter.label, () => applyFilter(filter.key))));
  renderNodeGrid('all');

  const from = app.querySelector('#path-from');
  const to = app.querySelector('#path-to');
  populateSelect(from, 'ratio');
  populateSelect(to, 'ai');
  app.querySelector('#find-path').addEventListener('click', () => displayPath(app.querySelector('#path-result'), findPath(from.value, to.value)));
  displayPath(app.querySelector('#path-result'), knowledge.featuredPaths[0]?.nodes, '最初の例を表示しています。出発点と行き先は自由に変えられます。');
}

function applyFilter(key, scroll = false) {
  app.querySelectorAll('.filter-button').forEach((button) => button.classList.toggle('active', button.textContent === ({ all: 'すべて', school: '学校', academic: '学問', technology: '技術', interest: '興味', career: '仕事' }[key])));
  renderNodeGrid(key);
  if (scroll) app.querySelector('#browse-section').scrollIntoView({ behavior: 'smooth' });
}

function renderNodeGrid(kind) {
  const grid = app.querySelector('#node-grid');
  grid.replaceChildren();
  const nodes = kind === 'all' ? knowledge.nodes : knowledge.nodes.filter((node) => node.kind === kind);
  nodes.forEach((node) => grid.append(renderNodeCard(node)));
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
  const back = makeButton('mindmap-back', '← テーマ一覧', () => { location.hash = ''; });
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
  inspector.append(inspectorKind, inspectorTitle, summary, meta, relationTitle, relationList);
  layout.append(canvasWrap, inspector);
  page.append(toolbar, layout);
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
  const query = searchInput.value.trim().toLocaleLowerCase('ja');
  searchResults.replaceChildren();
  if (!query) {
    searchResults.hidden = true;
    return;
  }
  const matches = knowledge.nodes.filter((node) => `${node.name} ${node.summary} ${node.field}`.toLocaleLowerCase('ja').includes(query)).slice(0, 8);
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
