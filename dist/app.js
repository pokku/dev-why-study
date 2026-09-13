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

const groupMeta = {
  before: { title: 'これを理解する前に', subtitle: '先に知っておくと、ここが分かりやすくなる', icon: '←' },
  after: { title: 'ここからつながる', subtitle: 'この知識を足場に、次へ進める', icon: '→' },
  uses: { title: '使われるところ', subtitle: '技術や身近なものの中で生きている', icon: '↗' },
  side: { title: '横につながる知識', subtitle: '一緒に見ると理解が広がる', icon: '＋' },
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

  const featured = app.querySelector('#featured-paths');
  knowledge.featuredPaths.forEach((path) => {
    const label = path.nodes.map((id) => nodesById.get(id)?.name).filter(Boolean).join(' → ');
    featured.append(makeButton('path-chip', label, () => {
      const from = app.querySelector('#path-from');
      const to = app.querySelector('#path-to');
      from.value = path.nodes[0];
      to.value = path.nodes[path.nodes.length - 1];
      displayPath(app.querySelector('#path-result'), path.nodes, path.label);
      app.querySelector('.route-finder').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }));
  });

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

function renderRelationCard(connection) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'relation-card';
  button.addEventListener('click', () => navigateToNode(connection.other.id));
  const title = document.createElement('strong');
  title.textContent = connection.other.name;
  const label = document.createElement('small');
  label.textContent = connection.label;
  const reason = document.createElement('p');
  reason.textContent = connection.reason;
  button.append(title, label, reason);
  return button;
}

function renderNode(id) {
  const node = nodesById.get(id);
  if (!node) return renderNotFound();
  document.title = `${node.name}｜どうして勉強しないといけないの？`;
  app.replaceChildren();
  const page = document.createElement('article');
  page.className = 'detail-page';
  const hero = document.createElement('header');
  hero.className = 'detail-hero';
  const back = makeButton('back-button', '← 知識を見渡す', () => { location.hash = ''; });
  const layout = document.createElement('div');
  layout.className = 'detail-layout';
  const copy = document.createElement('div');
  const kind = document.createElement('span');
  kind.className = 'detail-kind';
  kind.style.color = kindMeta[node.kind]?.color === '#2962ff' ? '#7fa5ff' : (kindMeta[node.kind]?.color || '#3bd3c6');
  kind.textContent = kindMeta[node.kind]?.label || node.kind;
  const title = document.createElement('h1');
  title.textContent = node.name;
  const summary = document.createElement('p');
  summary.className = 'detail-summary';
  summary.textContent = node.summary;
  copy.append(kind, title, summary);
  const curriculum = document.createElement('aside');
  curriculum.className = 'curriculum-card';
  const levelLabel = document.createElement('span');
  levelLabel.textContent = '学ぶ目安';
  const level = document.createElement('strong');
  level.textContent = node.curriculum || node.level || '学びのどこからでも';
  const fieldLabel = document.createElement('span');
  fieldLabel.style.marginTop = '15px';
  fieldLabel.textContent = '分野';
  const field = document.createElement('strong');
  field.textContent = node.field;
  curriculum.append(levelLabel, level, fieldLabel, field);
  layout.append(copy, curriculum);
  hero.append(back, layout);

  const content = document.createElement('div');
  content.className = 'detail-content';
  const context = document.createElement('div');
  context.className = 'context-line';
  context.append(document.createTextNode('この概念から'));
  const count = document.createElement('span');
  count.textContent = `${connectedEdges(id).length}個のつながり`;
  context.append(count, document.createTextNode('をたどれます'));
  content.append(context);

  const grouped = { before: [], after: [], uses: [], side: [] };
  connectedEdges(id).map((edge) => connectionFor(edge, id)).filter((item) => item.other).forEach((item) => grouped[item.group].push(item));
  Object.entries(groupMeta).forEach(([groupKey, meta]) => {
    if (!grouped[groupKey].length) return;
    const section = document.createElement('section');
    section.className = 'relation-section';
    const heading = document.createElement('div');
    heading.className = 'relation-title';
    const icon = document.createElement('i');
    icon.textContent = meta.icon;
    const headingCopy = document.createElement('div');
    const h2 = document.createElement('h2');
    h2.textContent = meta.title;
    const subtitle = document.createElement('p');
    subtitle.textContent = meta.subtitle;
    headingCopy.append(h2, subtitle);
    heading.append(icon, headingCopy);
    const list = document.createElement('div');
    list.className = 'relation-list';
    grouped[groupKey].forEach((connection) => list.append(renderRelationCard(connection)));
    section.append(heading, list);
    content.append(section);
  });
  page.append(hero, content);
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
  if (id) renderNode(id);
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
