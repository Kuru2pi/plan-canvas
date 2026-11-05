'use strict';

/* =========================================================
   Utilities
   ========================================================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function el(tag, props, ...kids) {
  const e = document.createElement(tag);
  let value;
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'style') {
      for (const [sk, sv] of Object.entries(v)) {
        if (sv == null) continue;
        if (sk.startsWith('--')) e.style.setProperty(sk, sv); else e.style[sk] = sv;
      }
    } else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'value') value = v;
    else if (typeof v !== 'string' && k in e) e[k] = v;
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat(Infinity)) {
    if (k == null || k === false) continue;
    e.append(k instanceof Node ? k : document.createTextNode(String(k)));
  }
  if (value !== undefined) e.value = value;
  return e;
}

const uid = () => Math.random().toString(36).slice(2, 10);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const pad = n => String(n).padStart(2, '0');
const toISO = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseISO = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseISO(s); d.setDate(d.getDate() + n); return toISO(d); };
const diffDays = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 86400000);
const todayISO = () => toISO(new Date());
const fmtMD = s => { const d = parseISO(s); return `${d.getMonth() + 1}/${d.getDate()}`; };
const WD = ['日', '月', '火', '水', '木', '金', '土'];
const fmtMDW = s => { const d = parseISO(s); return `${d.getMonth() + 1}/${d.getDate()}(${WD[d.getDay()]})`; };
const fmtHM = m => `${Math.floor(m / 60)}:${pad(m % 60)}`;
const fmtH = m => `${Math.round(m / 6) / 10}h`;
const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const mondayOf = s => { const d = parseISO(s); return addDays(s, -((d.getDay() + 6) % 7)); };
const minISO = (a, b) => (a < b ? a : b);
const maxISO = (a, b) => (a > b ? a : b);

const ICONS = {
  check: '<path d="M3.5 8.5l3 3 6-7"/>',
  plus: '<path d="M8 3v10M3 8h10"/>',
  minus: '<path d="M3 8h10"/>',
  x: '<path d="M4 4l8 8M12 4l-8 8"/>',
  cursor: '<path d="M4 2.5l8.5 5.2-3.8 1-1.6 3.8z" fill="currentColor"/>',
  hand: '<path d="M5.5 8.5V4.2a1 1 0 012 0V7.5M7.5 7V3a1 1 0 012 0v4M9.5 7V4.2a1 1 0 012 0V9.5c0 2.5-1.7 4.3-4.1 4.3-1.7 0-2.8-.8-3.6-2.3L2.6 9a1 1 0 011.7-1l1.2 1.5"/>',
  layout: '<rect x="1.5" y="6" width="4" height="4" rx="1"/><rect x="10.5" y="2" width="4" height="4" rx="1"/><rect x="10.5" y="10" width="4" height="4" rx="1"/><path d="M5.5 8H8m0-4v8m0-8h2.5M8 12h2.5"/>',
  fit: '<path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4"/>',
  chev: '<path d="M6 4l4 4-4 4"/>',
  chevL: '<path d="M10 4L6 8l4 4"/>',
  trash: '<path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.7 8.5h5.6l.7-8.5"/>',
  undo: '<path d="M5.5 3L2.5 6l3 3"/><path d="M2.5 6h7a3.5 3.5 0 010 7H6"/>',
  redo: '<path d="M10.5 3l3 3-3 3"/><path d="M13.5 6h-7a3.5 3.5 0 000 7H10"/>',
  more: '<circle cx="3.5" cy="8" r="1.1" fill="currentColor"/><circle cx="8" cy="8" r="1.1" fill="currentColor"/><circle cx="12.5" cy="8" r="1.1" fill="currentColor"/>',
  flag: '<path d="M4 14V2.5M4 3h7.5L10 5.7 11.5 8.5H4"/>',
  cal: '<rect x="2.5" y="3.5" width="11" height="10" rx="1.5"/><path d="M2.5 6.5h11M5.5 2v3M10.5 2v3"/>',
  clock: '<circle cx="8" cy="8" r="5.8"/><path d="M8 4.8V8l2.2 1.5"/>',
  mindmap: '<circle cx="3.8" cy="8" r="2"/><circle cx="12.2" cy="3.8" r="2"/><circle cx="12.2" cy="12.2" r="2"/><path d="M5.6 7.1l4.8-2.4M5.6 8.9l4.8 2.4"/>',
  gantt: '<path d="M2.5 4h6M5 8h8M3.5 12h5" stroke-width="2.4"/>',
  copy: '<rect x="5.5" y="5.5" width="8" height="8" rx="1.5"/><path d="M3 10.5V3.8A1.3 1.3 0 014.3 2.5H10.5"/>',
  target: '<circle cx="8" cy="8" r="5.5"/><circle cx="8" cy="8" r="2"/>',
  note: '<path d="M3 2.5h10v7.5l-3.5 3.5H3z"/><path d="M9.5 13.5V10H13"/>',
  week: '<rect x="2" y="3" width="12" height="10.5" rx="1.5"/><path d="M2 6.5h12M6 6.5v7M10 6.5v7"/>',
  month: '<rect x="2" y="3" width="12" height="10.5" rx="1.5"/><path d="M2 6.5h12M2 10h12M6 6.5v7M10 6.5v7"/>',
};
function icon(name) {
  const s = document.createElement('span');
  s.className = 'ic';
  s.innerHTML = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;
  return s;
}

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

// window-level pointer tracking so DOM re-renders mid-drag don't break the gesture
function trackPointer(e, move, up) {
  const sx = e.clientX, sy = e.clientY;
  const mv = ev => move && move(ev, ev.clientX - sx, ev.clientY - sy);
  const done = ev => {
    window.removeEventListener('pointermove', mv);
    window.removeEventListener('pointerup', done);
    window.removeEventListener('pointercancel', done);
    up && up(ev, ev.clientX - sx, ev.clientY - sy);
  };
  window.addEventListener('pointermove', mv);
  window.addEventListener('pointerup', done);
  window.addEventListener('pointercancel', done);
}

/* =========================================================
   Data
   ========================================================= */
const KEY = 'plan-canvas-v1';
// muted project colors: used only as small markers and soft tints
const COLORS = ['#4F7FD9', '#8A63D2', '#CF5C8E', '#D4643F', '#C8962B', '#4F9673', '#3A8FA3', '#737985'];
const DEFAULT_COLOR = '#737985';
const ROUTINE_COLOR = '#9A968F';
const DEFAULT_PRESETS = [
  { title: '睡眠', color: '#737985' },
  { title: '食事', color: '#C8962B' },
  { title: '授業', color: '#8A63D2' },
  { title: 'バイト', color: '#CF5C8E' },
  { title: '移動', color: ROUTINE_COLOR },
  { title: '休憩', color: '#4F9673' },
  { title: '自由時間', color: '#3A8FA3' },
];
// colors from the first version, mapped onto the muted palette
const LEGACY_COLORS = {
  '#0D99FF': '#4F7FD9', '#9747FF': '#8A63D2', '#FF24BD': '#CF5C8E', '#F24822': '#D4643F', '#FFA629': '#C8962B',
  '#E8B500': '#C8962B', '#14AE5C': '#4F9673', '#00B5CE': '#3A8FA3', '#667799': '#737985', '#8C8C8C': ROUTINE_COLOR,
};
const MEMO_COLORS = ['#FFF3BF', '#FFE1E7', '#DCEBFF', '#DDF4E4', '#ECE6FF'];
const migrateColor = c => (c && LEGACY_COLORS[c.toUpperCase()]) || c;

function sampleData() {
  const t = todayISO();
  const D = n => addDays(t, n);
  const d = {
    nodes: {}, blocks: {}, view: { x: 140, y: 120, z: 0.9 },
    settings: { autoLayout: true }, presets: DEFAULT_PRESETS.map(p => ({ ...p })), ui: { page: 'map', stack: true },
  };
  let y = 0;
  const add = (parentId, title, props = {}) => {
    const id = uid();
    d.nodes[id] = { id, parentId, title, x: 0, y: y++, done: false, ...props };
    return id;
  };
  const sot = add(null, '卒業制作', { color: '#9747FF', x: 0, y: 0, due: D(70) });
  const r = add(sot, 'リサーチ', { start: D(-20), end: D(-6) });
  add(r, '先行事例の調査', { done: true, start: D(-20), end: D(-14) });
  add(r, 'ユーザーインタビュー', { done: true, start: D(-13), end: D(-6) });
  const c = add(sot, 'コンセプト設計', { start: D(-4), end: D(6) });
  add(c, 'ペルソナ作成', { done: true, start: D(-4), end: D(-1) });
  const sheet = add(c, 'コンセプトシート', { start: D(0), end: D(4), estimate: 8 });
  add(c, '指導教員に相談', { due: D(5) });
  const m = add(sot, '制作', { start: D(7), end: D(50) });
  add(m, 'プロトタイプ', { start: D(7), end: D(20), estimate: 20 });
  add(m, 'ユーザーテスト', { start: D(21), end: D(28) });
  add(m, '本制作', { start: D(29), end: D(50) });
  add(sot, '中間発表', { due: D(10) });
  add(sot, '最終提出', { due: D(70) });

  const job = add(null, '就職活動', { color: '#0D99FF', x: 0, y: 1000 });
  const es = add(job, 'ES作成');
  const esA = add(es, 'A社 ES', { due: D(3), estimate: 3 });
  add(es, 'B社 ES', { due: D(9), estimate: 3 });
  const iv = add(job, '面接対策', { start: D(0), end: D(21) });
  add(iv, '自己PRを整理', { start: D(0), end: D(3) });
  add(iv, '模擬面接', { due: D(12) });
  const pf = add(job, 'ポートフォリオ更新', { start: D(1), end: D(14), estimate: 10 });
  add(job, 'C社 説明会', { due: D(6) });

  const blk = (s, e, props) => {
    const id = uid();
    d.blocks[id] = { id, date: t, start: s * 60, end: e * 60, nodeId: null, title: '', color: null, memo: '', ...props };
  };
  blk(0, 7, { title: '睡眠', color: '#667799' });
  blk(7.5, 8, { title: '食事', color: '#FFA629' });
  blk(9, 12, { nodeId: sheet });
  blk(12, 13, { title: '食事', color: '#FFA629' });
  blk(13, 14.5, { nodeId: esA });
  blk(15, 18, { title: 'バイト', color: '#FF24BD' });
  blk(19, 19.5, { title: '食事', color: '#FFA629' });
  blk(20, 21.5, { nodeId: pf });
  const memo = uid();
  d.notes = { [memo]: { id: memo, x: -300, y: -40, w: 220, color: MEMO_COLORS[0], text: '中間発表までに\n・先生にコンセプトを見せる\n・参考作品を3つ集める' } };
  return normalize(d);
}

function normalize(d) {
  d.nodes = d.nodes || {};
  d.blocks = d.blocks || {};
  d.view = d.view || { x: 120, y: 120, z: 1 };
  d.settings = Object.assign({}, d.settings, { autoLayout: false }); // nodes are placed freely; 整列 is on demand
  d.notes = d.notes || {};
  d.presets = d.presets || DEFAULT_PRESETS.map(p => ({ ...p }));
  d.ui = d.ui || { page: 'map' };
  for (const n of Object.values(d.nodes)) n.color = migrateColor(n.color);
  for (const b of Object.values(d.blocks)) b.color = migrateColor(b.color);
  for (const p of d.presets) p.color = migrateColor(p.color);
  return d;
}

function load() {
  try {
    const s = localStorage.getItem(KEY);
    if (s) return normalize(JSON.parse(s));
  } catch (e) { /* fall through */ }
  return null;
}

let data = load() || sampleData();
let saveTimer;
function flushSave() {
  clearTimeout(saveTimer);
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { toast('保存できませんでした'); }
}
function save() { clearTimeout(saveTimer); saveTimer = setTimeout(flushSave, 200); }
window.addEventListener('beforeunload', flushSave);

const undoStack = [], redoStack = [];
const docState = () => JSON.stringify({ nodes: data.nodes, blocks: data.blocks, presets: data.presets, notes: data.notes });
function snapshot() {
  undoStack.push(docState());
  if (undoStack.length > 200) undoStack.shift();
  redoStack.length = 0;
  updateUndoButtons();
}
function restore(s) {
  const o = JSON.parse(s);
  data.nodes = o.nodes; data.blocks = o.blocks; data.presets = o.presets; data.notes = o.notes || {};
  sel = new Set([...sel].filter(id => data.nodes[id]));
  if (selMemo && !data.notes[selMemo]) selMemo = null;
  if (selBlock && !data.blocks[selBlock]) selBlock = null;
  save(); renderAll(); updateUndoButtons();
}
function undo() { if (!undoStack.length) return; redoStack.push(docState()); restore(undoStack.pop()); }
function redo() { if (!redoStack.length) return; undoStack.push(docState()); restore(redoStack.pop()); }
function updateUndoButtons() {
  $('#btnUndo').disabled = !undoStack.length;
  $('#btnRedo').disabled = !redoStack.length;
}
function mutate(fn, render = true) {
  snapshot();
  fn();
  save();
  if (render) renderAll();
}

/* ---------- tree helpers ---------- */
const allNodes = () => Object.values(data.nodes);
const parentOf = n => (n.parentId && data.nodes[n.parentId] ? n.parentId : null);
function childrenOf(id) {
  return allNodes().filter(n => parentOf(n) === id).sort((a, b) => a.y - b.y || a.x - b.x);
}
const roots = () => childrenOf(null);
function descendants(id) {
  const out = [];
  const walk = p => { for (const c of childrenOf(p)) { out.push(c); walk(c.id); } };
  walk(id);
  return out;
}
function ancestors(n) {
  const out = [];
  let p = parentOf(n);
  while (p) { out.unshift(data.nodes[p]); p = parentOf(data.nodes[p]); }
  return out;
}
function rootOf(n) { let c = n; while (parentOf(c)) c = data.nodes[c.parentId]; return c; }
function colorOf(n) {
  let c = n;
  while (c) { if (c.color) return c.color; c = parentOf(c) ? data.nodes[c.parentId] : null; }
  return DEFAULT_COLOR;
}
function isAncestor(a, b) {
  let c = data.nodes[b];
  while (c && parentOf(c)) { if (c.parentId === a) return true; c = data.nodes[c.parentId]; }
  return false;
}
const hasDate = n => !!(n.start || n.end || n.due);
function scheduledMin(ids) {
  const s = new Set(ids);
  let m = 0;
  for (const b of Object.values(data.blocks)) if (b.nodeId && s.has(b.nodeId)) m += b.end - b.start;
  return m;
}
function dueInfo(d, done) {
  const left = diffDays(todayISO(), d);
  if (done) return { cls: '', txt: '完了' };
  if (left < 0) return { cls: 'overdue', txt: `${-left}日超過` };
  if (left === 0) return { cls: 'soon', txt: '今日' };
  return { cls: left <= 3 ? 'soon' : '', txt: `あと${left}日` };
}
function treeList() {
  // depth-first list of every node, used by selects
  const out = [];
  const walk = (pid, depth) => { for (const c of childrenOf(pid)) { out.push({ n: c, depth }); walk(c.id, depth + 1); } };
  walk(null, 0);
  return out;
}
function nextRootColor() {
  const used = new Set(roots().map(r => r.color));
  return COLORS.find(c => !used.has(c)) || COLORS[roots().length % COLORS.length];
}

/* =========================================================
   App state
   ========================================================= */
let page = data.ui.page || 'map';
let sel = new Set();
let selBlock = null;
let selMemo = null;

function setPage(p) {
  page = p;
  data.ui.page = p;
  save();
  $$('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.page === p));
  $$('.page').forEach(s => s.classList.toggle('on', s.id === 'page-' + p));
  renderAll();
}
function renderPage() {
  if (page === 'map') renderMap();
  else if (page === 'schedule') renderSchedule();
  else renderDay();
}
function renderAll() { renderPage(); renderInspector(); }

function selectOnly(id) { sel = new Set(id ? [id] : []); updateSelection(); }
function updateSelection(inspector = true) {
  if (page === 'map') {
    for (const [id, e] of Object.entries(mm.nodeEls)) e.classList.toggle('selected', sel.has(id));
    for (const [id, e] of Object.entries(mm.memoEls)) e.classList.toggle('selected', selMemo === id);
    $$('#layers .layer-row').forEach(r => r.classList.toggle('selected', sel.has(r.dataset.id)));
  } else if (page === 'schedule') {
    $$('#sched [data-row]').forEach(r => r.classList.toggle('selected', sel.has(r.dataset.row)));
    $$('#sched .g-bar, #sched .cal-bar').forEach(r => r.classList.toggle('sel', sel.has(r.dataset.id)));
  }
  if (inspector) renderInspector();
}
function revealNode(id) {
  // jump to a node on the mind map from any page
  const n = data.nodes[id];
  if (!n) return;
  for (const a of ancestors(n)) a.collapsed = false;
  sel = new Set([id]);
  if (page !== 'map') setPage('map'); else renderAll();
  centerOn(id);
}

/* ---------- node operations (shared) ---------- */
function toggleDone(ids) {
  ids = [].concat(ids).filter(id => data.nodes[id]);
  if (!ids.length) return;
  const to = !data.nodes[ids[0]].done;
  mutate(() => ids.forEach(id => { data.nodes[id].done = to; }));
}
function deleteNodes(ids) {
  ids = ids.filter(id => data.nodes[id]);
  if (!ids.length) return;
  const first = data.nodes[ids[0]];
  const fallback = parentOf(first);
  let count = 0;
  mutate(() => {
    for (const id of ids) {
      if (!data.nodes[id]) continue;
      for (const d of [data.nodes[id], ...descendants(id)]) {
        for (const b of Object.values(data.blocks)) {
          if (b.nodeId === d.id) { b.title = d.title; b.color = colorOf(d); b.nodeId = null; }
        }
        delete data.nodes[d.id];
        count++;
      }
    }
    sel = new Set(fallback && data.nodes[fallback] ? [fallback] : []);
  });
  toast(`${count}件を削除しました（⌘Z で元に戻す）`);
}
function toggleFold(id) {
  const n = data.nodes[id];
  mutate(() => { n.collapsed = !n.collapsed; });
}

/* =========================================================
   Mind map
   ========================================================= */
const mm = { el: null, world: null, svg: null, layer: null, marquee: null, nodeEls: {}, memoEls: {}, tool: 'select', space: false };
let editingId = null;

function visibleNodes() {
  const out = [];
  const walk = pid => { for (const c of childrenOf(pid)) { out.push(c); if (!c.collapsed) walk(c.id); } };
  walk(null);
  return out;
}

function initMap() {
  mm.el = $('#mm');
  mm.world = $('#mm .world');
  mm.svg = $('#mm .edges');
  mm.layer = $('#mm .nodes');
  mm.marquee = $('#mm .marquee');

  mm.el.addEventListener('pointerdown', onMapDown);
  mm.edgeAdd = el('button', { class: 'edge-add', title: 'ここにタスクを挿入', onpointerdown: e => e.stopPropagation(), onclick: () => { if (mm.edgeAddFor) insertBetween(mm.edgeAddFor); } }, icon('plus'));
  mm.el.append(mm.edgeAdd);
  mm.el.addEventListener('pointermove', e => {
    if (e.buttons || editingId || mm.space || mm.tool === 'hand') return;
    if (e.target.closest('.edge-add')) return;
    let ed = null;
    if (!e.target.closest('.node, .memo, .dock')) {
      const w = screenToWorld(e.clientX, e.clientY);
      ed = edgeAt(w.x, w.y, 10 / data.view.z);
    }
    showEdgeAdd(ed);
  });
  mm.el.addEventListener('pointerleave', () => showEdgeAdd(null));
  mm.el.addEventListener('wheel', e => {
    e.preventDefault();
    const k = e.deltaMode === 1 ? 16 : 1;
    if (e.ctrlKey || e.metaKey) zoomAt(Math.exp(-e.deltaY * k * 0.01), e.clientX, e.clientY);
    else { data.view.x -= e.deltaX * k; data.view.y -= e.deltaY * k; applyView(); save(); }
  }, { passive: false });
  mm.el.addEventListener('dblclick', e => {
    if (e.target.closest('button') || e.target.closest('.dock')) return;
    const me = e.target.closest('.memo');
    if (me) { startMemoEdit(me.dataset.memo); return; }
    const ne = e.target.closest('.node');
    if (ne) startEdit(ne.dataset.id);
    else { const p = screenToWorld(e.clientX, e.clientY); createRoot(p.x, p.y - 20); }
  });
  buildDock();
}

function buildDock() {
  const dock = $('#dock');
  dock.textContent = '';
  const tool = (name, ic, tip) => el('button', {
    class: mm.tool === name ? 'on' : '', title: tip,
    onclick: () => { mm.tool = name; mm.el.classList.toggle('hand', name === 'hand'); buildDock(); },
  }, icon(ic));
  dock.append(
    tool('select', 'cursor', '選択 (V)'),
    tool('hand', 'hand', '手のひら (H)'),
    el('div', { class: 'sep' }),
    el('button', { title: '新しいプロジェクト', onclick: () => createRootAtCenter() }, icon('plus'), 'プロジェクト'),
    el('button', { title: 'メモを置く (M)', onclick: () => createMemoAtCenter() }, icon('note'), 'メモ'),
    el('div', { class: 'sep' }),
    el('button', { title: 'ツリーをきれいに並べ直す (⇧A)', onclick: () => tidyAll() }, icon('layout'), '整列'),
    el('div', { class: 'sep' }),
    el('button', { title: 'ズームアウト', onclick: () => zoomAt(1 / 1.2) }, icon('minus')),
    el('button', { class: 'zoom', id: 'zoomLbl', title: '100%に戻す (⇧0)', onclick: () => zoomTo(1) }, Math.round(data.view.z * 100) + '%'),
    el('button', { title: 'ズームイン', onclick: () => zoomAt(1.2) }, icon('plus')),
    el('button', { title: '全体を表示 (⇧1)', onclick: () => fitView() }, icon('fit')),
  );
}

function showEdgeAdd(ed) {
  const b = mm.edgeAdd;
  if (!ed) { b.style.display = 'none'; mm.edgeAddFor = null; if (mm.hotEdge && !mm.el.classList.contains('dragging')) setHotEdge(null); return; }
  const pt = edgePoint(ed, 0.5), v = data.view;
  b.style.display = 'flex';
  b.style.left = pt.x * v.z + v.x + 'px';
  b.style.top = pt.y * v.z + v.y + 'px';
  mm.edgeAddFor = ed.c;
  setHotEdge(ed.c);
}
function screenToWorld(cx, cy) {
  const r = mm.el.getBoundingClientRect(), v = data.view;
  return { x: (cx - r.left - v.x) / v.z, y: (cy - r.top - v.y) / v.z };
}
function applyView() {
  const v = data.view;
  if (mm.edgeAdd) mm.edgeAdd.style.display = 'none';
  mm.world.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.z})`;
  const g = 20 * v.z;
  mm.el.style.backgroundSize = `${g}px ${g}px`;
  mm.el.style.backgroundPosition = `${v.x}px ${v.y}px`;
  const zl = $('#zoomLbl');
  if (zl) zl.textContent = Math.round(v.z * 100) + '%';
}
function zoomAt(f, cx, cy) {
  const v = data.view, r = mm.el.getBoundingClientRect();
  const mx = (cx ?? r.left + r.width / 2) - r.left, my = (cy ?? r.top + r.height / 2) - r.top;
  const nz = clamp(v.z * f, 0.15, 3);
  v.x = mx - (mx - v.x) * nz / v.z;
  v.y = my - (my - v.y) * nz / v.z;
  v.z = nz;
  applyView(); save();
}
const zoomTo = z => zoomAt(z / data.view.z);
function nodeBox(id) {
  const n = data.nodes[id], e = mm.nodeEls[id];
  return { x: n.x, y: n.y, w: e ? e.offsetWidth : 160, h: e ? e.offsetHeight : 40 };
}
function fitView() {
  const boxes = Object.keys(mm.nodeEls).map(nodeBox).concat(Object.keys(mm.memoEls).map(memoBox));
  if (!boxes.length) return;
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  for (const b of boxes) {
    x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y); x2 = Math.max(x2, b.x + b.w); y2 = Math.max(y2, b.y + b.h);
  }
  const r = mm.el.getBoundingClientRect();
  const z = clamp(Math.min((r.width - 120) / (x2 - x1), (r.height - 160) / (y2 - y1)), 0.15, 1);
  data.view = { z, x: (r.width - (x2 - x1) * z) / 2 - x1 * z, y: (r.height - 40 - (y2 - y1) * z) / 2 - y1 * z };
  applyView(); save();
}
function centerOn(id) {
  if (!mm.nodeEls[id]) return;
  const b = nodeBox(id), r = mm.el.getBoundingClientRect(), v = data.view;
  v.x = r.width / 2 - (b.x + b.w / 2) * v.z;
  v.y = r.height / 2 - (b.y + b.h / 2) * v.z;
  applyView(); save();
}
function ensureVisible(id) {
  if (!mm.nodeEls[id]) return;
  const b = nodeBox(id), r = mm.el.getBoundingClientRect(), v = data.view;
  const sx = b.x * v.z + v.x, sy = b.y * v.z + v.y, m = 60;
  if (sx < m || sy < m || sx + b.w * v.z > r.width - m || sy + b.h * v.z > r.height - 90) centerOn(id);
}

function isUrgent(n) {
  if (!n.due || n.done) return false;
  return diffDays(todayISO(), n.due) <= 3;
}
function metaChips(n) {
  const parts = [];
  if (n.start || n.end) {
    const s = n.start || n.end, e = n.end || n.start;
    parts.push(el('span', null, s === e ? fmtMD(s) : `${fmtMD(s)}–${fmtMD(e)}`));
  }
  if (n.due) {
    const i = dueInfo(n.due, n.done);
    parts.push(isUrgent(n)
      ? el('span', { class: 'hot ' + i.cls }, `締切 ${i.txt}`)
      : el('span', null, `締切 ${fmtMD(n.due)}`));
  }
  const ds = descendants(n.id);
  if (ds.length) parts.push(el('span', null, `${ds.filter(k => k.done).length}/${ds.length}`));
  if (n.note && n.note.trim()) parts.push(el('span', { class: 'has-note', title: n.note.slice(0, 120) }, icon('note')));
  return parts.length ? el('div', { class: 'meta' }, parts) : null;
}

function nodeEl(n) {
  const isRoot = !parentOf(n);
  const kids = childrenOf(n.id);
  const stop = e => e.stopPropagation();
  const e = el('div', {
    class: `node${isRoot ? ' root' : ''}${sel.has(n.id) ? ' selected' : ''}${n.done ? ' done' : ''}${dueInfo(n.due || '9999-01-01', n.done).cls === 'overdue' ? ' urgent' : ''}`,
    'data-id': n.id,
    style: { left: n.x + 'px', top: n.y + 'px', '--c': colorOf(n) },
  },
    isRoot
      ? el('span', { class: 'proj' })
      : el('button', { class: 'chk', title: '完了にする (⌘Enter)', onpointerdown: stop, ondblclick: stop, onclick: () => toggleDone(n.id) }, icon('check')),
    el('div', { class: 'body' }, el('div', { class: 'title' }, n.title || '無題'), metaChips(n)),
    el('button', { class: 'add', title: '子タスクを追加 (Tab)', onpointerdown: stop, ondblclick: stop, onclick: () => addChild(n.id) }, icon('plus')),
    kids.length ? el('button', {
      class: 'fold' + (n.collapsed ? ' on' : ''), title: n.collapsed ? '展開' : '折りたたむ',
      onpointerdown: stop, ondblclick: stop, onclick: () => toggleFold(n.id),
    }, n.collapsed ? String(descendants(n.id).length) : icon('minus')) : null,
  );
  return e;
}

function renderMap() {
  if (editingId) return;
  mm.layer.textContent = '';
  mm.nodeEls = {};
  mm.memoEls = {};
  const vis = visibleNodes();
  for (const n of vis) {
    const e = nodeEl(n);
    mm.layer.append(e);
    mm.nodeEls[n.id] = e;
  }
  // memos sit on top of the tree, like sticky notes
  for (const m of Object.values(data.notes)) {
    const e = memoEl(m);
    mm.layer.append(e);
    mm.memoEls[m.id] = e;
  }
  if (data.ui.stack) {
    layoutAll(true);
    delete data.ui.stack;
    requestAnimationFrame(fitView);
    for (const n of vis) {
      const e = mm.nodeEls[n.id];
      e.style.left = n.x + 'px';
      e.style.top = n.y + 'px';
    }
  }
  drawEdges();
  applyView();
  renderLayers();
}

function drawEdges() {
  let out = '';
  mm.edges = [];
  for (const [id, e] of Object.entries(mm.nodeEls)) {
    const n = data.nodes[id];
    const pid = parentOf(n);
    if (!pid || !mm.nodeEls[pid]) continue;
    const p = data.nodes[pid], pe = mm.nodeEls[pid];
    const pw = pe.offsetWidth, ph = pe.offsetHeight, cw = e.offsetWidth, ch = e.offsetHeight;
    const y1 = p.y + ph / 2, y2 = n.y + ch / 2;
    let x1, x2;
    if (n.x + cw / 2 >= p.x + pw / 2) { x1 = p.x + pw; x2 = n.x; } else { x1 = p.x; x2 = n.x + cw; }
    const dx = (x2 - x1) / 2;
    mm.edges.push({ c: id, p: pid, x1, y1, x2, y2, dx });
    const cls = [n.done ? 'done' : '', mm.hotEdge === id ? 'hot' : ''].filter(Boolean).join(' ');
    out += `<path${cls ? ` class="${cls}"` : ''} stroke="${colorOf(n)}" d="M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}"/>`;
  }
  mm.svg.innerHTML = out;
}
// point on an edge's bezier at t (0..1)
function edgePoint(ed, t) {
  const u = 1 - t;
  const cx1 = ed.x1 + ed.dx, cx2 = ed.x2 - ed.dx;
  return {
    x: u * u * u * ed.x1 + 3 * u * u * t * cx1 + 3 * u * t * t * cx2 + t * t * t * ed.x2,
    y: u * u * u * ed.y1 + 3 * u * u * t * ed.y1 + 3 * u * t * t * ed.y2 + t * t * t * ed.y2,
  };
}
// nearest edge to a world point within `tol` world px; skips edges touching `skip`
function edgeAt(wx, wy, tol, skip) {
  let best = null, bd = tol;
  for (const ed of mm.edges || []) {
    if (skip && (skip.has(ed.c) || skip.has(ed.p))) continue;
    if (wx < Math.min(ed.x1, ed.x2) - tol || wx > Math.max(ed.x1, ed.x2) + tol) continue;
    for (let i = 1; i < 24; i++) {
      const pt = edgePoint(ed, i / 24);
      const d = Math.hypot(pt.x - wx, pt.y - wy);
      if (d < bd) { bd = d; best = ed; }
    }
  }
  return best;
}
function setHotEdge(id) {
  if (mm.hotEdge === id) return;
  mm.hotEdge = id;
  drawEdges();
}

/* ---------- insert between / pull out ---------- */
function subtreeRight(id) {
  return Math.max(...[data.nodes[id], ...descendants(id)].map(d => d.x + (mm.nodeEls[d.id] ? nodeBox(d.id).w : 160)));
}
function shiftSubtree(id, dx, dy = 0) {
  for (const d of [data.nodes[id], ...descendants(id)]) { d.x = Math.round(d.x + dx); d.y = Math.round(d.y + dy); }
}
// new empty task between a child and its parent
function insertBetween(cid) {
  const c = data.nodes[cid];
  const pid = c && parentOf(c);
  if (!pid) { toast('プロジェクトの上には挿入できません'); return; }
  const n = { id: uid(), parentId: pid, title: '新しいタスク', done: false, x: c.x, y: c.y };
  sel = new Set([n.id]);
  mutate(() => {
    shiftSubtree(cid, 190);
    c.parentId = n.id;
    data.nodes[n.id] = n;
  });
  mm.hotEdge = null;
  if (page === 'map') { ensureVisible(n.id); startEdit(n.id); }
}
// put an existing task (with its own children) between parent and child of an edge
function placeOnEdge(sid, ed) {
  const s = data.nodes[sid], c = data.nodes[ed.c];
  s.parentId = ed.p;
  shiftSubtree(sid, c.x - s.x, c.y - s.y);
  const room = subtreeRight(sid) - s.x + 56;
  shiftSubtree(ed.c, room);
  c.parentId = sid;
}
// detach a task from the middle of a branch: its children move up to its parent
function liftChildren(id) {
  const n = data.nodes[id];
  const pid = parentOf(n);
  const kids = childrenOf(id);
  const w = (mm.nodeEls[id] ? nodeBox(id).w : 160) + 56;
  for (const k of kids) {
    if (!pid) k.color = k.color || colorOf(n);
    k.parentId = pid;
    shiftSubtree(k.id, -w);
  }
  return kids;
}
// delete only these tasks; anything after them reconnects to the task before them
function removeKeepChildren(ids) {
  ids = [].concat(ids).filter(id => data.nodes[id]);
  if (!ids.length) return;
  const names = ids.map(id => data.nodes[id].title);
  let kept = 0, next = null;
  mutate(() => {
    for (const id of ids) {
      const n = data.nodes[id];
      if (!n) continue;
      const kids = liftChildren(id);
      kept += kids.length;
      for (const b of Object.values(data.blocks)) if (b.nodeId === id) { b.title = n.title; b.color = colorOf(n); b.nodeId = null; }
      delete data.nodes[id];
      next = kids[0] ? kids[0].id : parentOf(n) && data.nodes[n.parentId] ? n.parentId : next;
    }
    sel = new Set(next && data.nodes[next] ? [next] : []);
  });
  const what = names.length === 1 ? `「${names[0]}」` : `${names.length}件`;
  toast(kept ? `${what}を削除しました（後ろの${kept}件はつなぎ直しました・⌘Z で元に戻す）` : `${what}を削除しました（⌘Z で元に戻す）`);
}

/* ---------- auto layout: children fan out to the right, roots stay put ---------- */
function layoutTree(root) {
  const GX = 56, GY = 14, memo = {};
  const kids = id => (data.nodes[id].collapsed ? [] : childrenOf(id));
  const sz = id => nodeBox(id);
  const H = id => {
    if (memo[id] != null) return memo[id];
    let s = 0;
    kids(id).forEach((c, i) => { s += H(c.id) + (i ? GY : 0); });
    return (memo[id] = Math.max(sz(id).h, s));
  };
  const place = (id, x, top) => {
    const n = data.nodes[id], s = sz(id), h = H(id), k = kids(id);
    n.x = Math.round(x);
    n.y = Math.round(top + h / 2 - s.h / 2);
    let sum = 0;
    k.forEach((c, i) => { sum += H(c.id) + (i ? GY : 0); });
    let y = top + (h - sum) / 2;
    for (const c of k) { place(c.id, x + s.w + GX, y); y += H(c.id) + GY; }
  };
  const s = sz(root.id), h = H(root.id);
  place(root.id, root.x, root.y + s.h / 2 - h / 2);
  return h;
}
function layoutAll(stack) {
  const rs = roots();
  if (!stack) { rs.forEach(layoutTree); return; }
  let cursor = null;
  for (const r of rs) {
    const h = layoutTree(r);
    const s = nodeBox(r.id);
    const top = r.y + s.h / 2 - h / 2;
    if (cursor == null) cursor = top;
    r.y = Math.round(cursor + h / 2 - s.h / 2);
    layoutTree(r);
    cursor += h + 72;
  }
}
function tidyAll() {
  mutate(() => { data.ui.stack = true; });
  toast('整列しました');
}

/* ---------- pointer interactions ---------- */
function onMapDown(e) {
  if (e.target.closest('.dock')) return;
  if (editingId) {
    if (e.target.closest('.title[contenteditable="true"]')) return;
    document.activeElement && document.activeElement.blur();
  }
  if (e.button === 1 || mm.space || mm.tool === 'hand') { e.preventDefault(); startPan(e); return; }
  if (e.button !== 0) return;
  const me = e.target.closest('.memo');
  if (me) { startMemoDrag(e, me.dataset.memo); return; }
  if (selMemo) { selMemo = null; updateSelection(false); }
  const ne = e.target.closest('.node');
  if (ne) startNodeDrag(e, ne.dataset.id);
  else startMarquee(e);
}

function startPan(e) {
  const sx = data.view.x, sy = data.view.y;
  mm.el.classList.add('panning');
  trackPointer(e, (ev, dx, dy) => {
    data.view.x = sx + dx; data.view.y = sy + dy; applyView();
  }, () => { mm.el.classList.remove('panning'); save(); });
}

function startNodeDrag(e, id) {
  if (e.shiftKey) { sel.has(id) ? sel.delete(id) : sel.add(id); }
  else if (!sel.has(id)) sel = new Set([id]);
  updateSelection();
  if (!sel.has(id)) return;

  // Alt/Option-drag: pull just this task out, leaving its children connected to its parent
  const pullOut = e.altKey && sel.size === 1 && childrenOf(id).length > 0;
  const moving = new Set();
  for (const s of sel) { moving.add(s); if (!pullOut) descendants(s).forEach(d => moving.add(d.id)); }
  const start = {};
  let dragging = false, target = null, edge = null;
  const single = sel.size === 1;

  trackPointer(e, (ev, dx, dy) => {
    if (!dragging) {
      if (Math.hypot(dx, dy) < 4) return;
      dragging = true;
      snapshot();
      if (pullOut) {
        liftChildren(id);
        renderMap();
      }
      moving.forEach(m => { start[m] = { x: data.nodes[m].x, y: data.nodes[m].y }; });
      mm.el.classList.add('dragging');
      moving.forEach(m => mm.nodeEls[m] && mm.nodeEls[m].classList.add('moving'));
    }
    const z = data.view.z;
    moving.forEach(m => {
      const n = data.nodes[m];
      n.x = Math.round(start[m].x + dx / z);
      n.y = Math.round(start[m].y + dy / z);
      const ne = mm.nodeEls[m];
      if (ne) { ne.style.left = n.x + 'px'; ne.style.top = n.y + 'px'; }
    });
    let t = null;
    for (const x of document.elementsFromPoint(ev.clientX, ev.clientY)) {
      const ne = x.closest && x.closest('.node');
      if (ne && !moving.has(ne.dataset.id)) { t = ne.dataset.id; break; }
    }
    if (t !== target) {
      if (target && mm.nodeEls[target]) mm.nodeEls[target].classList.remove('drop');
      target = t;
      if (target) mm.nodeEls[target].classList.add('drop');
    }
    drawEdges();
    // over a connection line? → insert between
    edge = null;
    if (!target && single) {
      const w = screenToWorld(ev.clientX, ev.clientY);
      edge = edgeAt(w.x, w.y, 14 / z, moving);
    }
    setHotEdge(edge ? edge.c : null);
  }, () => {
    mm.el.classList.remove('dragging');
    setHotEdge(null);
    if (!dragging) {
      if (!e.shiftKey && sel.size > 1) selectOnly(id);
      return;
    }
    if (target) {
      const tops = [...sel].filter(s => !sel.has(data.nodes[s].parentId));
      const t = data.nodes[target];
      t.collapsed = false;
      for (const s of tops) {
        if (s === target || isAncestor(s, target)) continue;
        const sibs = childrenOf(target).filter(c => c.id !== s);
        const last = sibs[sibs.length - 1];
        const n = data.nodes[s];
        n.parentId = target;
        const tb = nodeBox(target);
        shiftSubtree(s, (last ? last.x : t.x + tb.w + 56) - n.x, (last ? last.y + nodeBox(last.id).h + 14 : t.y) - n.y);
      }
      toast(`「${t.title}」の下に移動しました`);
    } else if (edge) {
      const p = data.nodes[edge.p], c = data.nodes[edge.c];
      placeOnEdge(id, edge);
      toast(`「${p.title}」と「${c.title}」の間にはめました`);
    } else if (pullOut) {
      toast('抜き出しました（子タスクは元の親につながっています）');
    }
    save();
    renderAll();
  });
}

function startMarquee(e) {
  const r = mm.el.getBoundingClientRect();
  const base = e.shiftKey ? new Set(sel) : new Set();
  let moved = false;
  const mq = mm.marquee;
  trackPointer(e, (ev, dx, dy) => {
    if (!moved && Math.hypot(dx, dy) < 3) return;
    moved = true;
    const x1 = Math.min(e.clientX, ev.clientX), y1 = Math.min(e.clientY, ev.clientY);
    const x2 = Math.max(e.clientX, ev.clientX), y2 = Math.max(e.clientY, ev.clientY);
    Object.assign(mq.style, { display: 'block', left: x1 - r.left + 'px', top: y1 - r.top + 'px', width: x2 - x1 + 'px', height: y2 - y1 + 'px' });
    const a = screenToWorld(x1, y1), b = screenToWorld(x2, y2);
    const s = new Set(base);
    for (const id of Object.keys(mm.nodeEls)) {
      const nb = nodeBox(id);
      if (nb.x < b.x && nb.x + nb.w > a.x && nb.y < b.y && nb.y + nb.h > a.y) s.add(id);
    }
    sel = s;
    updateSelection(false);
  }, () => {
    mq.style.display = 'none';
    if (!moved) sel = base;
    updateSelection();
  });
}

/* ---------- editing ---------- */
function startEdit(id) {
  if (page !== 'map') return;
  const ne = mm.nodeEls[id];
  if (!ne) return;
  const t = ne.querySelector('.title');
  editingId = id;
  sel = new Set([id]);
  updateSelection();
  ne.classList.add('editing');
  t.contentEditable = 'true';
  t.textContent = data.nodes[id].title;
  t.focus();
  const range = document.createRange();
  range.selectNodeContents(t);
  const s = getSelection();
  s.removeAllRanges();
  s.addRange(range);

  const finish = (commit, next) => {
    if (editingId !== id) return;
    editingId = null;
    t.contentEditable = 'false';
    const v = t.textContent.replace(/\s+/g, ' ').trim();
    if (commit && v && data.nodes[id] && v !== data.nodes[id].title) mutate(() => { data.nodes[id].title = v; });
    else renderAll();
    if (next === 'child') addChild(id);
    if (next === 'sibling') addSibling(id);
  };
  t.onkeydown = ev => {
    ev.stopPropagation();
    if (ev.isComposing || ev.keyCode === 229) return;
    if (ev.key === 'Enter') { ev.preventDefault(); finish(true); }
    else if (ev.key === 'Escape') { ev.preventDefault(); finish(false); }
    else if (ev.key === 'Tab') { ev.preventDefault(); finish(true, 'child'); }
  };
  t.onblur = () => finish(true);
  t.onpaste = ev => {
    ev.preventDefault();
    document.execCommand('insertText', false, ev.clipboardData.getData('text/plain'));
  };
}

function addChild(pid) {
  const p = data.nodes[pid];
  if (!p) return;
  const kids = childrenOf(pid);
  const last = kids[kids.length - 1];
  const pb = mm.nodeEls[pid] ? nodeBox(pid) : { w: 160 };
  const n = {
    id: uid(), parentId: pid, title: '新しいタスク', done: false,
    x: p.x + pb.w + 56,
    y: last ? last.y + (mm.nodeEls[last.id] ? nodeBox(last.id).h : 40) + 14 : p.y,
  };
  sel = new Set([n.id]);
  mutate(() => { p.collapsed = false; data.nodes[n.id] = n; });
  if (page === 'map') { ensureVisible(n.id); startEdit(n.id); }
}
function addSibling(id) {
  const n = data.nodes[id];
  if (!n) return;
  const pid = parentOf(n);
  if (!pid) {
    const bottom = Math.max(...[n, ...descendants(id)].map(d => mm.nodeEls[d.id] ? d.y + nodeBox(d.id).h : d.y));
    createRoot(n.x, bottom + 80);
    return;
  }
  const h = mm.nodeEls[id] ? nodeBox(id).h : 40;
  const s = { id: uid(), parentId: pid, title: '新しいタスク', done: false, x: n.x, y: n.y + 1 };
  sel = new Set([s.id]);
  mutate(() => {
    if (!data.settings.autoLayout) {
      s.y = n.y + h + 14;
      for (const sib of childrenOf(pid)) {
        if (sib.y > n.y) for (const d of [sib, ...descendants(sib.id)]) d.y += h + 14;
      }
    }
    data.nodes[s.id] = s;
  });
  if (page === 'map') { ensureVisible(s.id); startEdit(s.id); }
}
function createRoot(x, y) {
  const n = { id: uid(), parentId: null, title: '新しいプロジェクト', done: false, color: nextRootColor(), x: Math.round(x), y: Math.round(y) };
  sel = new Set([n.id]);
  mutate(() => { data.nodes[n.id] = n; });
  if (page === 'map') startEdit(n.id);
}
function createRootAtCenter() {
  const r = mm.el.getBoundingClientRect();
  const p = screenToWorld(r.left + r.width / 2 - 80, r.top + r.height / 2 - 20);
  createRoot(p.x, p.y);
}

function navigate(dir) {
  const id = [...sel][0];
  if (!id) { const r = roots()[0]; if (r) selectOnly(r.id); return; }
  const n = data.nodes[id];
  let to = null;
  if (dir === 'ArrowLeft') to = parentOf(n);
  else if (dir === 'ArrowRight') {
    const k = childrenOf(id);
    if (k.length) {
      if (n.collapsed) { n.collapsed = false; save(); renderMap(); }
      to = k[0].id;
    }
  } else {
    const sibs = childrenOf(parentOf(n));
    const i = sibs.findIndex(s => s.id === id);
    const j = sibs[i + (dir === 'ArrowUp' ? -1 : 1)];
    if (j) to = j.id;
  }
  if (to) { selectOnly(to); ensureVisible(to); }
}

function mapKey(e) {
  const mod = e.metaKey || e.ctrlKey;
  const ids = [...sel].filter(id => data.nodes[id]);
  const one = ids.length === 1 ? ids[0] : null;
  const k = e.key;
  if (k === ' ') { e.preventDefault(); if (!mm.space) { mm.space = true; mm.el.classList.add('space'); } return; }
  if (k === 'Tab' && e.shiftKey) { e.preventDefault(); if (one) insertBetween(one); return; }
  if (k === 'Tab') { e.preventDefault(); if (one) addChild(one); return; }
  if (k === 'Enter' && mod) { e.preventDefault(); toggleDone(ids); return; }
  if (k === 'Enter') { e.preventDefault(); if (one) addSibling(one); else if (!ids.length) createRootAtCenter(); return; }
  if (k === 'F2') { e.preventDefault(); if (one) startEdit(one); return; }
  if ((k === 'Delete' || k === 'Backspace') && selMemo) { e.preventDefault(); deleteMemo(selMemo); return; }
  if ((k === 'Delete' || k === 'Backspace') && e.shiftKey) { e.preventDefault(); deleteNodes(ids); return; }
  if (k === 'Delete' || k === 'Backspace') { e.preventDefault(); removeKeepChildren(ids); return; }
  if (!mod && !e.shiftKey && k.toLowerCase() === 'm') { e.preventDefault(); createMemoAtCenter(); return; }
  if (k.startsWith('Arrow')) { e.preventDefault(); navigate(k); return; }
  if (k === 'Escape') { selMemo = null; selectOnly(null); return; }
  if (mod && k.toLowerCase() === 'a') { e.preventDefault(); sel = new Set(Object.keys(mm.nodeEls)); updateSelection(); return; }
  if (e.shiftKey && e.code === 'Digit1') { e.preventDefault(); fitView(); return; }
  if (e.shiftKey && e.code === 'Digit0') { e.preventDefault(); zoomTo(1); return; }
  if (e.shiftKey && e.code === 'KeyA') { e.preventDefault(); tidyAll(); return; }
  if (mod && (k === '=' || k === '+')) { e.preventDefault(); zoomAt(1.2); return; }
  if (mod && k === '-') { e.preventDefault(); zoomAt(1 / 1.2); return; }
  if (!mod && !e.shiftKey && k.toLowerCase() === 'v') { mm.tool = 'select'; mm.el.classList.remove('hand'); buildDock(); return; }
  if (!mod && !e.shiftKey && k.toLowerCase() === 'h') { mm.tool = 'hand'; mm.el.classList.add('hand'); buildDock(); }
}

/* ---------- sticky memos ---------- */
function memoEl(m) {
  return el('div', {
    class: 'memo' + (selMemo === m.id ? ' selected' : ''), 'data-memo': m.id,
    style: { left: m.x + 'px', top: m.y + 'px', width: (m.w || 200) + 'px', '--m': m.color || MEMO_COLORS[0] },
  }, el('div', { class: 'memo-text' }, m.text || ''), el('div', { class: 'memo-rz', title: '幅を変更' }));
}
function memoBox(id) {
  const m = data.notes[id], e = mm.memoEls[id];
  return { x: m.x, y: m.y, w: e ? e.offsetWidth : m.w || 200, h: e ? e.offsetHeight : 80 };
}
function selectMemo(id) {
  selMemo = id;
  sel = new Set();
  updateSelection();
}
function createMemo(x, y) {
  const m = { id: uid(), x: Math.round(x), y: Math.round(y), w: 200, text: '', color: MEMO_COLORS[0] };
  selMemo = m.id;
  sel = new Set();
  mutate(() => { data.notes[m.id] = m; });
  startMemoEdit(m.id);
}
function createMemoAtCenter() {
  if (page !== 'map') return;
  const r = mm.el.getBoundingClientRect();
  const p = screenToWorld(r.left + r.width / 2 - 100, r.top + r.height / 2 - 40);
  createMemo(p.x, p.y);
}
function deleteMemo(id) {
  if (!data.notes[id]) return;
  mutate(() => { delete data.notes[id]; selMemo = null; });
  toast('メモを削除しました（⌘Z で元に戻す）');
}
function startMemoDrag(e, id) {
  if (selMemo !== id) selectMemo(id);
  const m = data.notes[id], me = mm.memoEls[id];
  const resize = !!e.target.closest('.memo-rz');
  if (e.target.closest('.memo-text[contenteditable="true"]')) return;
  const o = { x: m.x, y: m.y, w: m.w || me.offsetWidth };
  let moved = false;
  trackPointer(e, (ev, dx, dy) => {
    if (!moved) { if (Math.hypot(dx, dy) < 3) return; moved = true; snapshot(); me.classList.add('moving'); }
    const z = data.view.z;
    if (resize) { m.w = Math.round(clamp(o.w + dx / z, 120, 520)); me.style.width = m.w + 'px'; }
    else { m.x = Math.round(o.x + dx / z); m.y = Math.round(o.y + dy / z); me.style.left = m.x + 'px'; me.style.top = m.y + 'px'; }
  }, () => { me.classList.remove('moving'); if (moved) save(); });
}
function startMemoEdit(id) {
  if (page !== 'map') return;
  const me = mm.memoEls[id];
  if (!me) return;
  const t = me.querySelector('.memo-text');
  editingId = 'memo:' + id;
  if (selMemo !== id) selectMemo(id);
  me.classList.add('editing');
  t.contentEditable = 'true';
  t.focus();
  const r = document.createRange();
  r.selectNodeContents(t);
  r.collapse(false);
  const s = getSelection();
  s.removeAllRanges();
  s.addRange(r);
  const finish = () => {
    if (editingId !== 'memo:' + id) return;
    editingId = null;
    t.contentEditable = 'false';
    const v = t.innerText.replace(/\n+$/, '');
    if (data.notes[id] && v !== data.notes[id].text) mutate(() => { data.notes[id].text = v; });
    else renderAll();
  };
  t.onkeydown = ev => {
    ev.stopPropagation();
    if (ev.isComposing || ev.keyCode === 229) return;
    if (ev.key === 'Escape' || (ev.key === 'Enter' && (ev.metaKey || ev.ctrlKey))) { ev.preventDefault(); finish(); }
  };
  t.onblur = finish;
  t.onpaste = ev => {
    ev.preventDefault();
    document.execCommand('insertText', false, ev.clipboardData.getData('text/plain'));
  };
}

/* ---------- layers panel ---------- */
function renderLayers() {
  const box = $('#layers');
  box.textContent = '';
  box.append(el('div', { class: 'panel-head' }, 'レイヤー',
    el('button', { class: 'icon-btn', title: '新しいプロジェクト', onclick: () => createRootAtCenter() }, icon('plus'))));
  const list = el('div', { class: 'layers' });
  const walk = (pid, depth) => {
    for (const c of childrenOf(pid)) {
      const hasKids = childrenOf(c.id).length > 0;
      const isRoot = !pid;
      list.append(el('div', {
        class: `layer-row${isRoot ? ' root' : ''}${sel.has(c.id) ? ' selected' : ''}${c.done ? ' done' : ''}`,
        'data-id': c.id,
        style: { paddingLeft: 6 + depth * 14 + 'px' },
        onclick: ev => {
          if (ev.shiftKey) { sel.has(c.id) ? sel.delete(c.id) : sel.add(c.id); updateSelection(); }
          else { selectOnly(c.id); ensureVisible(c.id); }
        },
        ondblclick: () => { centerOn(c.id); startEdit(c.id); },
      },
        hasKids
          ? el('button', { class: 'arrow' + (c.collapsed ? '' : ' open'), onclick: ev => { ev.stopPropagation(); toggleFold(c.id); } }, icon('chev'))
          : el('span', { class: 'arrow' }),
        el('span', { class: isRoot ? 'sq' : 'dot', style: { background: colorOf(c) } }),
        el('span', { class: 'lt' }, c.title),
        c.due ? el('span', { class: 'ld' + (isUrgent(c) ? ' hot' : '') }, fmtMD(c.due)) : null,
      ));
      if (!c.collapsed) walk(c.id, depth + 1);
    }
  };
  walk(null, 0);
  if (!list.childElementCount) list.append(el('div', { class: 'layers-empty' }, 'キャンバスをダブルクリックして、最初のプロジェクトを作りましょう。'));
  box.append(list);
}

/* =========================================================
   Schedule (Gantt + month calendar)
   ========================================================= */
const sunday = s => addDays(s, -parseISO(s).getDay());
const sch = {
  mode: 'gantt', scale: 'day', showAll: false, fold: new Set(),
  month: todayISO().slice(0, 8) + '01', week: sunday(todayISO()), scroll: null, ctx: null, weekScroll: null,
};
const LW = 260;

function renderSchedule() {
  const box = $('#sched');
  const wrap = box.querySelector('.g-wrap');
  if (wrap && wrap.dataset.ready) sch.scroll = { l: wrap.scrollLeft, t: wrap.scrollTop };
  box.textContent = '';

  const tb = el('div', { class: 's-toolbar' });
  const seg = (opts, cur, on, cls = '') => el('div', { class: 'seg ' + cls },
    opts.map(([v, label, ic]) => el('button', { class: v === cur ? 'on' : '', onclick: () => on(v) }, ic ? icon(ic) : null, label)));
  tb.append(seg([['gantt', 'タイムライン', 'gantt'], ['week', '週', 'week'], ['cal', '月', 'month']], sch.mode, v => { sch.mode = v; renderSchedule(); }, 'view'));
  if (sch.mode === 'week') {
    const ws = sch.week, we = addDays(ws, 6), a = parseISO(ws), b = parseISO(we);
    tb.append(
      el('button', { class: 'icon-btn', title: '前の週', onclick: () => { sch.week = addDays(sch.week, -7); renderSchedule(); } }, icon('chevL')),
      el('div', { class: 'title' }, `${a.getMonth() + 1}月${a.getDate()}日 – ${a.getMonth() === b.getMonth() ? '' : b.getMonth() + 1 + '月'}${b.getDate()}日`),
      el('button', { class: 'icon-btn', title: '次の週', onclick: () => { sch.week = addDays(sch.week, 7); renderSchedule(); } }, icon('chev')),
      el('button', { class: 'btn', onclick: () => { sch.week = sunday(todayISO()); renderSchedule(); } }, '今日'),
      el('div', { class: 'spacer' }),
      el('span', { class: 'muted small' }, '予定をクリックで「1日の計画」へ'),
    );
    box.append(tb, buildWeek());
    return;
  }
  if (sch.mode === 'gantt') {
    tb.append(
      seg([['day', '日'], ['week', '週'], ['month', '月']], sch.scale, v => { sch.scale = v; sch.scroll = null; renderSchedule(); }),
      el('button', { class: 'btn', onclick: () => { sch.scroll = null; renderSchedule(); } }, '今日'),
      el('div', { class: 'spacer' }),
      el('label', { class: 'toggle' }, el('input', { type: 'checkbox', checked: sch.showAll, onchange: e => { sch.showAll = e.target.checked; renderSchedule(); } }), '日付のないタスクも表示'),
    );
    box.append(tb, buildGantt());
  } else {
    const d = parseISO(sch.month);
    tb.append(
      el('button', { class: 'icon-btn', title: '前の月', onclick: () => { sch.month = shiftMonth(sch.month, -1); renderSchedule(); } }, icon('chevL')),
      el('div', { class: 'title' }, `${d.getFullYear()}年 ${d.getMonth() + 1}月`),
      el('button', { class: 'icon-btn', title: '次の月', onclick: () => { sch.month = shiftMonth(sch.month, 1); renderSchedule(); } }, icon('chev')),
      el('button', { class: 'btn', onclick: () => { sch.month = todayISO().slice(0, 8) + '01'; renderSchedule(); } }, '今日'),
      el('div', { class: 'spacer' }),
      el('span', { class: 'muted small' }, '日付をクリックで「1日の計画」へ'),
    );
    box.append(tb, buildCalendar());
  }
}
function shiftMonth(m, k) { const d = parseISO(m); d.setMonth(d.getMonth() + k, 1); return toISO(d); }

function ganttRows() {
  const rows = [];
  const walk = (pid, depth) => {
    for (const c of childrenOf(pid)) {
      const ds = descendants(c.id);
      if (!(sch.showAll || !pid || hasDate(c) || ds.some(hasDate))) continue;
      rows.push({ n: c, depth, hasKids: ds.length > 0 });
      if (!sch.fold.has(c.id)) walk(c.id, depth + 1);
    }
  };
  walk(null, 0);
  return rows;
}

function buildGantt() {
  const dayW = { day: 36, week: 16, month: 6 }[sch.scale];
  const today = todayISO();
  let min = addDays(today, -21), max = addDays(today, 90);
  for (const n of allNodes()) for (const d of [n.start, n.end, n.due]) if (d) { min = minISO(min, d); max = maxISO(max, d); }
  const start = mondayOf(addDays(min, -7));
  const days = diffDays(start, addDays(max, 35)) + 1;
  const W = days * dayW;
  sch.ctx = { start, dayW, days };

  const wrap = el('div', { class: 'g-wrap' });
  const inner = el('div', { class: 'g-inner', style: { width: LW + W + 'px' } });

  // header
  const th = el('div', { class: 'g-timehead', style: { width: W + 'px' } });
  let segStart = 0;
  for (let i = 0; i <= days; i++) {
    const iso = i < days ? addDays(start, i) : null;
    if (i === days || (i > 0 && iso.endsWith('-01'))) {
      const d0 = parseISO(addDays(start, segStart));
      const w = (i - segStart) * dayW;
      th.append(el('div', { class: 'g-month', style: { left: segStart * dayW + 'px', width: w + 'px' } },
        w > 50 ? `${d0.getFullYear()}年${d0.getMonth() + 1}月` : `${d0.getMonth() + 1}月`));
      segStart = i;
    }
    if (i === days) break;
    const d = parseISO(iso);
    const showDay = dayW >= 20 || (dayW >= 12 && d.getDay() === 1);
    if (showDay || iso === today) {
      const we = d.getDay() === 0 || d.getDay() === 6;
      th.append(el('div', {
        class: `g-day${we ? ' we' : ''}${iso === today ? ' today' : ''}`,
        style: { left: i * dayW + 'px', width: dayW + 'px' },
        title: fmtMDW(iso),
      }, el('span', null, dayW >= 20 ? d.getDate() : `${d.getMonth() + 1}/${d.getDate()}`)));
    }
  }
  inner.append(el('div', { class: 'g-head' }, el('div', { class: 'g-corner', style: { width: LW + 'px' } }, 'タスク'), th));

  // background columns
  const body = el('div', { class: 'g-body' });
  const bg = [`repeating-linear-gradient(90deg, transparent 0 ${5 * dayW}px, rgba(0,0,0,.028) ${5 * dayW}px ${7 * dayW}px)`];
  if (dayW >= 16) bg.unshift(`repeating-linear-gradient(90deg, transparent 0 ${dayW - 1}px, #f3f3f3 ${dayW - 1}px ${dayW}px)`);
  const cols = el('div', { class: 'g-cols', style: { left: LW + 'px', width: W + 'px', backgroundImage: bg.join(',') } },
    el('div', { class: 'g-today', style: { left: diffDays(start, today) * dayW + dayW / 2 - 1 + 'px' } }));
  body.append(cols);

  const rows = ganttRows();
  for (const r of rows) body.append(ganttRow(r, W));
  if (!rows.length) body.append(el('div', { class: 'g-empty', style: { width: LW + 'px' } }, 'タスクがありません。マインドマップで追加してください。'));
  inner.append(body);
  wrap.append(inner);

  wrap.addEventListener('pointerdown', onGanttDown);
  requestAnimationFrame(() => {
    if (sch.scroll) { wrap.scrollLeft = sch.scroll.l; wrap.scrollTop = sch.scroll.t; }
    else wrap.scrollLeft = Math.max(0, (diffDays(start, today) - 4) * dayW);
    wrap.dataset.ready = '1';
  });
  return wrap;
}

function ganttRow({ n, depth, hasKids }, W) {
  const { start, dayW } = sch.ctx;
  const c = colorOf(n);
  const isRoot = !parentOf(n);
  const folded = sch.fold.has(n.id);
  const label = el('div', { class: 'g-label', style: { width: LW + 'px', paddingLeft: 8 + depth * 16 + 'px', '--c': c } },
    hasKids
      ? el('button', { class: 'fold-btn' + (folded ? '' : ' open'), 'data-fold': n.id }, icon('chev'))
      : el('span', { class: 'fold-btn' }),
    isRoot ? el('span', { class: 'sq', style: { background: c } })
      : el('button', { class: 'chk' + (n.done ? ' on' : ''), 'data-done': n.id }, icon('check')),
    el('span', { class: 'gl-t', title: n.title }, n.title),
    n.due ? el('span', { class: 'gl-d' + (isUrgent(n) ? ' hot' : '') }, fmtMD(n.due)) : null,
  );
  const track = el('div', { class: 'g-track', style: { width: W + 'px' } });

  if (n.start || n.end) {
    const s = n.start || n.end, e = n.end || n.start;
    const w = (diffDays(s, e) + 1) * dayW;
    track.append(el('div', {
      class: `g-bar${n.done ? ' done' : ''}${w < 90 ? ' narrow' : ''}${sel.has(n.id) ? ' sel' : ''}`,
      'data-id': n.id, 'data-mode': 'move',
      style: { left: diffDays(start, s) * dayW + 'px', width: w + 'px', '--c': c },
      title: `${n.title}  ${fmtMDW(s)} – ${fmtMDW(e)}`,
    }, el('div', { class: 'h l', 'data-mode': 'l' }), el('span', { class: 'lbl' }, n.title), el('div', { class: 'h r', 'data-mode': 'r' })));
  } else {
    // summary span of children
    const ds = descendants(n.id);
    const dates = ds.flatMap(d => [d.start, d.end, d.due]).filter(Boolean);
    if (dates.length) {
      const s = dates.reduce(minISO), e = dates.reduce(maxISO);
      track.append(el('div', { class: 'g-sum', style: { left: diffDays(start, s) * dayW + 'px', width: (diffDays(s, e) + 1) * dayW + 'px', '--c': c } }));
    }
  }
  if (n.due) {
    const x = diffDays(start, n.due) * dayW + dayW / 2;
    const info = dueInfo(n.due, n.done);
    track.append(
      el('div', { class: `g-due${isUrgent(n) ? ' hot' : ''}${n.done ? ' done' : ''}`, 'data-id': n.id, 'data-mode': 'due', style: { left: x - 7 + 'px', '--c': c }, title: `締切 ${fmtMDW(n.due)}（${info.txt}）` }),
      !(n.start || n.end) ? el('div', { class: 'g-due-lbl' + (isUrgent(n) ? ' hot' : ''), style: { left: x + 12 + 'px' } }, isUrgent(n) ? `${n.title}・締切 ${info.txt}` : n.title) : null,
    );
  }
  return el('div', {
    class: `g-row${isRoot ? ' root' : ''}${n.done ? ' done' : ''}${sel.has(n.id) ? ' selected' : ''}`,
    'data-row': n.id, 'data-id': n.id,
  }, label, track);
}

function onGanttDown(e) {
  if (e.button !== 0) return;
  const row = e.target.closest('.g-row');
  if (!row) return;
  const id = row.dataset.row;
  const n = data.nodes[id];
  const fold = e.target.closest('[data-fold]');
  if (fold) { sch.fold.has(id) ? sch.fold.delete(id) : sch.fold.add(id); renderSchedule(); return; }
  if (e.target.closest('[data-done]')) { toggleDone(id); return; }
  selectOnly(id);
  if (e.target.closest('.g-label')) return;

  const { dayW } = sch.ctx;
  const modeEl = e.target.closest('[data-mode]');
  let mode = modeEl ? modeEl.dataset.mode : null;
  if (!mode) {
    if (n.start || n.end) return;
    mode = 'create';
  }
  e.preventDefault();
  const orig = { start: n.start || n.end, end: n.end || n.start, due: n.due };
  const track = row.querySelector('.g-track');
  const dayAt = x => addDays(sch.ctx.start, Math.floor((x - track.getBoundingClientRect().left) / dayW));
  const d0 = dayAt(e.clientX);
  let last = 0, changed = false, ghost = null;

  trackPointer(e, (ev, dx) => {
    const dd = Math.round(dx / dayW);
    if (mode === 'create') {
      const d1 = dayAt(ev.clientX);
      if (!changed && d1 === d0 && Math.abs(dx) < 6) return;
      const s = minISO(d0, d1), en = maxISO(d0, d1);
      if (!ghost) { ghost = el('div', { class: 'g-ghost' }); track.append(ghost); }
      ghost.style.left = diffDays(sch.ctx.start, s) * dayW + 'px';
      ghost.style.width = (diffDays(s, en) + 1) * dayW + 'px';
      ghost.textContent = '';
      changed = true;
      ghost.dataset.s = s; ghost.dataset.e = en;
      return;
    }
    if (dd === last) return;
    if (!changed) { snapshot(); changed = true; }
    last = dd;
    if (mode === 'move') { n.start = addDays(orig.start, dd); n.end = addDays(orig.end, dd); }
    else if (mode === 'l') { n.start = minISO(addDays(orig.start, dd), orig.end); n.end = orig.end; }
    else if (mode === 'r') { n.end = maxISO(addDays(orig.end, dd), orig.start); n.start = orig.start; }
    else if (mode === 'due') n.due = addDays(orig.due, dd);
    renderSchedule();
  }, () => {
    if (mode === 'create') {
      if (ghost && ghost.dataset.s) {
        const s = ghost.dataset.s, en = ghost.dataset.e;
        mutate(() => { n.start = s; n.end = en; });
        toast(`期間を ${fmtMD(s)}–${fmtMD(en)} に設定しました`);
      }
      return;
    }
    if (changed) { save(); renderAll(); }
  });
}

function calItems() {
  const items = [];
  for (const n of allNodes()) {
    // a parent's period just summarises its children, so only show the most detailed level
    const summarised = descendants(n.id).some(d => d.start || d.end);
    if ((n.start || n.end) && !summarised) items.push({ n, s: n.start || n.end, e: n.end || n.start, kind: 'period' });
    if (n.due) items.push({ n, s: n.due, e: n.due, kind: 'due' });
  }
  return items;
}
// lays out one week's task bars into lanes; returns { bars, lanes }
function weekBars(items, ws, { top, laneH, maxLanes, gutter = 0 }) {
  const we = addDays(ws, 6);
  const segs = items.filter(it => it.s <= we && it.e >= ws)
    .map(it => ({ ...it, a: maxISO(it.s, ws), b: minISO(it.e, we) }))
    .sort((x, y) => (x.a < y.a ? -1 : x.a > y.a ? 1 : diffDays(y.a, y.b) - diffDays(x.a, x.b)));
  const lanes = [], bars = [];
  const hidden = Array(7).fill(0);
  const col = i => (gutter ? `calc(${gutter}px + (100% - ${gutter}px) * ${i / 7})` : `${i / 7 * 100}%`);
  const span = k => (gutter ? `calc((100% - ${gutter}px) * ${k / 7} - 6px)` : `calc(${k / 7 * 100}% - 6px)`);
  for (const sg of segs) {
    const ai = diffDays(ws, sg.a), bi = diffDays(ws, sg.b);
    let li = lanes.findIndex(end => end < ai);
    if (li < 0) { li = lanes.length; lanes.push(-1); }
    lanes[li] = bi;
    if (li >= maxLanes) { for (let i = ai; i <= bi; i++) hidden[i]++; continue; }
    const n = sg.n;
    bars.push(el('div', {
      class: `cal-bar${sg.kind === 'due' ? ' due' : ''}${sg.kind === 'due' && isUrgent(n) ? ' hot' : ''}${n.done ? ' done' : ''}${sg.a > sg.s ? ' cont-l' : ''}${sg.b < sg.e ? ' cont-r' : ''}${sel.has(n.id) ? ' sel' : ''}`,
      'data-id': n.id,
      style: { '--c': colorOf(n), top: top + li * laneH + 'px', left: `calc(${col(ai)} + 3px)`, width: span(bi - ai + 1) },
      title: sg.kind === 'due' ? `締切: ${n.title}` : `${n.title}  ${fmtMD(sg.s)}–${fmtMD(sg.e)}`,
      onclick: () => selectOnly(n.id),
      ondblclick: () => revealNode(n.id),
    }, n.title));
  }
  hidden.forEach((h, i) => {
    if (h) bars.push(el('div', { class: 'cal-more', style: { top: top + maxLanes * laneH + 'px', left: col(i) } }, `+${h}件`));
  });
  return { bars, lanes: Math.min(lanes.length, maxLanes + (hidden.some(Boolean) ? 1 : 0)) };
}

function buildWeek() {
  const ws = sch.week, today = todayISO();
  const H = 40, G = 56;
  const days = [...Array(7)].map((_, i) => addDays(ws, i));
  const wrap = el('div', { class: 'wv' });

  const head = el('div', { class: 'wv-head', style: { paddingLeft: G + 'px' } });
  for (const d of days) {
    const dt = parseISO(d);
    const mins = blocksOn(d).reduce((a, b) => a + b.end - b.start, 0);
    head.append(el('button', { class: `wv-day${d === today ? ' today' : ''}`, title: 'この日の計画を開く', onclick: () => { setDayDate(d); setPage('day'); } },
      el('span', { class: 'wd' }, WD[dt.getDay()]), el('span', { class: 'wn' }, dt.getDate()),
      mins ? el('span', { class: 'wh' }, fmtH(mins)) : null));
  }
  const { bars, lanes } = weekBars(calItems(), ws, { top: 6, laneH: 22, maxLanes: 4, gutter: G });
  const allday = el('div', { class: 'wv-allday', style: { height: Math.max(34, 12 + lanes * 22) + 'px' } },
    el('div', { class: 'wv-gutter-lbl' }, 'タスク'), bars);
  wrap.append(head, allday);

  const scroll = el('div', { class: 'wv-scroll' });
  const grid = el('div', { class: 'wv-grid', style: { height: 24 * H + 'px', marginLeft: G + 'px' } });
  for (let h = 1; h < 24; h++) grid.append(el('div', { class: 'hour', style: { top: h * H + 'px', left: -G + 'px' } }, el('span', null, `${pad(h)}:00`)));
  days.forEach((d, i) => {
    const colEl = el('div', { class: `wv-col${d === today ? ' today' : ''}`, style: { left: `${i / 7 * 100}%`, width: `${100 / 7}%` },
      ondblclick: e => { if (!e.target.closest('.blk')) { setDayDate(d); setPage('day'); } } });
    const bl = blocksOn(d);
    const lay = layoutBlocks(bl);
    for (const b of bl) {
      const { col, n: cnt } = lay.get(b.id);
      const node = linkedNode(b), dur = b.end - b.start;
      colEl.append(el('div', {
        class: `blk${node ? '' : ' routine'}${dur < 45 ? ' small' : ''}${node && node.done ? ' done' : ''}`,
        style: { '--c': blockColor(b), top: b.start / 60 * H + 'px', height: Math.max(dur / 60 * H - 2, 9) + 'px', left: `calc(${col / cnt * 100}% + 1px)`, width: `calc(${100 / cnt}% - 3px)` },
        title: `${blockTitle(b)}  ${fmtHM(b.start)}–${fmtHM(b.end)}`,
        onclick: () => { setDayDate(d); selBlock = b.id; setPage('day'); },
      }, el('div', { class: 'bt' }, blockTitle(b)), dur >= 60 ? el('div', { class: 'bm' }, `${fmtHM(b.start)}–${fmtHM(b.end)}`) : null));
    }
    if (d === today) colEl.append(el('div', { class: 'now', style: { top: nowMin() / 60 * H + 'px', left: 0 } }));
    grid.append(colEl);
  });
  scroll.append(grid);
  wrap.append(scroll);
  requestAnimationFrame(() => {
    scroll.scrollTop = sch.weekScroll ?? (days.includes(today) ? Math.max(0, nowMin() / 60 * H - 140) : 8 * H);
  });
  scroll.addEventListener('scroll', () => { sch.weekScroll = scroll.scrollTop; });
  return wrap;
}

function buildCalendar() {
  const m = sch.month;
  const first = parseISO(m);
  const gridStart = addDays(m, -first.getDay());
  const dim = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const weeks = Math.ceil((first.getDay() + dim) / 7);
  const today = todayISO();
  const wrap = el('div', { class: 'cal' });
  wrap.append(el('div', { class: 'cal-head' }, WD.map(w => el('div', null, w))));

  const items = calItems();
  const minutesByDay = {};
  for (const b of Object.values(data.blocks)) minutesByDay[b.date] = (minutesByDay[b.date] || 0) + b.end - b.start;

  const LANE_TOP = 32, LANE_H = 22, MAX_LANES = 4;
  for (let w = 0; w < weeks; w++) {
    const ws = addDays(gridStart, w * 7);
    const row = el('div', { class: 'cal-week' });
    for (let i = 0; i < 7; i++) {
      const d = addDays(ws, i);
      const mins = minutesByDay[d];
      row.append(el('div', { class: `cal-day${d.slice(0, 7) !== m.slice(0, 7) ? ' out' : ''}${d === today ? ' today' : ''}` },
        el('div', { class: 'cal-dh' },
          el('button', { class: 'cal-num', title: 'この日の計画を開く', onclick: () => { dayS.date = d; setPage('day'); } }, parseISO(d).getDate()),
          mins ? el('span', { class: 'cal-hrs' }, fmtH(mins)) : null)));
    }
    const { bars, lanes } = weekBars(items, ws, { top: LANE_TOP, laneH: LANE_H, maxLanes: MAX_LANES });
    row.append(...bars);
    row.style.minHeight = Math.max(128, LANE_TOP + lanes * LANE_H + 8) + 'px';
    wrap.append(row);
  }
  return wrap;
}

/* =========================================================
   Day planner
   ========================================================= */
const dayS = { date: todayISO(), hourH: 48, scrollEl: null, lane: null, ghost: null, scrolledFor: null, query: '' };
const SNAP = 15;
const blocksOn = date => Object.values(data.blocks).filter(b => b.date === date);
const linkedNode = b => (b.nodeId && data.nodes[b.nodeId]) || null;
const blockColor = b => { const n = linkedNode(b); return n ? colorOf(n) : (b.color || ROUTINE_COLOR); };
const blockTitle = b => { const n = linkedNode(b); return n ? n.title : (b.title || '無題の予定'); };

function renderDay() { renderPalette(); renderDayMain(); }

function setDayDate(d) { dayS.date = d; selBlock = null; renderAll(); }

function renderDayMain() {
  const box = $('#day');
  const keep = dayS.scrollEl && dayS.scrolledFor === dayS.date ? dayS.scrollEl.scrollTop : null;
  box.textContent = '';
  const d = dayS.date, today = todayISO(), dt = parseISO(d);

  box.append(el('div', { class: 'day-head' },
    el('button', { class: 'icon-btn', title: '前の日', onclick: () => setDayDate(addDays(d, -1)) }, icon('chevL')),
    el('button', { class: 'icon-btn', title: '次の日', onclick: () => setDayDate(addDays(d, 1)) }, icon('chev')),
    el('div', { class: 'dtitle' }, `${dt.getMonth() + 1}月${dt.getDate()}日（${WD[dt.getDay()]}）`),
    d === today ? el('span', { class: 'tag' }, '今日') : el('button', { class: 'btn sm', onclick: () => setDayDate(today) }, '今日へ'),
    el('div', { class: 'spacer' }),
    el('input', { class: 'inp', type: 'date', value: d, onchange: e => e.target.value && setDayDate(e.target.value) }),
    el('button', { class: 'btn', title: '前日の予定をこの日にコピー', onclick: copyPrevDay }, icon('copy'), '前日をコピー'),
    el('button', { class: 'btn danger', title: 'この日の予定をすべて削除', onclick: clearDay }, icon('trash')),
  ));

  // week strip
  const ws = mondayOf(d);
  const strip = el('div', { class: 'week-strip' });
  for (let i = 0; i < 7; i++) {
    const day = addDays(ws, i);
    const bl = blocksOn(day);
    const total = bl.reduce((s, b) => s + b.end - b.start, 0);
    const bar = el('div', { class: 'wb' }, el('i', { style: { width: Math.min(100, total / 1440 * 100) + '%' } }));
    strip.append(el('div', { class: `wk${day === d ? ' on' : ''}${day === today ? ' today' : ''}`, onclick: () => setDayDate(day) },
      el('div', { class: 'wd' }, WD[parseISO(day).getDay()]),
      el('div', { class: 'wn' }, fmtMD(day)),
      bar));
  }
  box.append(strip);

  // timeline
  const H = dayS.hourH;
  const scroll = el('div', { class: 'day-scroll' });
  const grid = el('div', { class: 'day-grid', style: { height: 24 * H + 'px' } });
  for (let h = 0; h <= 24; h++) {
    grid.append(el('div', { class: 'hour', style: { top: h * H + 'px' } }, el('span', null, `${pad(h)}:00`)));
    if (h < 24) grid.append(el('div', { class: 'hour half', style: { top: h * H + H / 2 + 'px' } }));
  }
  const lane = el('div', { class: 'day-lane' });
  grid.append(lane);
  if (d === today) grid.append(el('div', { class: 'now', style: { top: nowMin() / 60 * H + 'px' } }));
  scroll.append(grid);
  box.append(scroll);
  dayS.scrollEl = scroll;
  dayS.lane = lane;
  dayS.ghost = el('div', { class: 'ghost' });

  lane.addEventListener('pointerdown', onLaneDown);
  lane.addEventListener('dblclick', e => {
    if (e.target.closest('.blk')) return;
    const m = Math.floor(minuteAt(e.clientY) / 30) * 30;
    createBlock({ start: clamp(m, 0, 1380), end: clamp(m, 0, 1380) + 60 });
  });
  lane.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    const s = clamp(Math.round((minuteAt(e.clientY) - 30) / SNAP) * SNAP, 0, 1380);
    showGhost(s, s + 60, '');
  });
  lane.addEventListener('dragleave', e => { if (!lane.contains(e.relatedTarget)) hideGhost(); });
  lane.addEventListener('drop', e => {
    e.preventDefault();
    hideGhost();
    let p;
    try { p = JSON.parse(e.dataTransfer.getData('text/plain')); } catch (err) { return; }
    const s = clamp(Math.round((minuteAt(e.clientY) - 30) / SNAP) * SNAP, 0, 1380);
    createBlock({ ...p, start: s, end: s + 60 });
  });

  renderBlocks();
  requestAnimationFrame(() => {
    if (keep != null) scroll.scrollTop = keep;
    else scroll.scrollTop = d === today ? Math.max(0, nowMin() / 60 * H - 160) : 7 * H;
    dayS.scrolledFor = d;
  });
}

function minuteAt(clientY) {
  return clamp((clientY - dayS.lane.getBoundingClientRect().top) / dayS.hourH * 60, 0, 1440);
}
function showGhost(s, e, label) {
  const g = dayS.ghost;
  if (!g.parentNode) dayS.lane.append(g);
  Object.assign(g.style, { display: 'block', top: s / 60 * dayS.hourH + 'px', height: (e - s) / 60 * dayS.hourH - 2 + 'px' });
  g.textContent = label || `${fmtHM(s)} – ${fmtHM(e)}`;
}
function hideGhost() { if (dayS.ghost) dayS.ghost.style.display = 'none'; }

function layoutBlocks(list) {
  list.sort((a, b) => a.start - b.start || b.end - a.end);
  const res = new Map();
  let cluster = [], clusterEnd = -1;
  const flush = () => {
    const cols = [];
    for (const b of cluster) {
      let i = cols.findIndex(end => end <= b.start);
      if (i < 0) { i = cols.length; cols.push(0); }
      cols[i] = b.end;
      res.set(b.id, { col: i });
    }
    for (const b of cluster) res.get(b.id).n = cols.length;
    cluster = [];
  };
  for (const b of list) {
    if (cluster.length && b.start >= clusterEnd) { flush(); clusterEnd = -1; }
    cluster.push(b);
    clusterEnd = Math.max(clusterEnd, b.end);
  }
  if (cluster.length) flush();
  return res;
}

function renderBlocks() {
  const lane = dayS.lane, H = dayS.hourH;
  lane.textContent = '';
  const bl = blocksOn(dayS.date);
  const lay = layoutBlocks(bl);
  for (const b of bl) {
    const { col, n: cnt } = lay.get(b.id);
    const dur = b.end - b.start, small = dur < 45;
    const node = linkedNode(b);
    const proj = node && parentOf(node) ? rootOf(node).title : null;
    lane.append(el('div', {
      class: `blk${node ? '' : ' routine'}${selBlock === b.id ? ' sel' : ''}${small ? ' small' : ''}${node && node.done ? ' done' : ''}`,
      'data-id': b.id,
      style: {
        '--c': blockColor(b), top: b.start / 60 * H + 'px', height: Math.max(dur / 60 * H - 2, 10) + 'px',
        left: `calc(${col / cnt * 100}% + 2px)`, width: `calc(${100 / cnt}% - 4px)`,
      },
      title: `${blockTitle(b)}  ${fmtHM(b.start)}–${fmtHM(b.end)}`,
    },
      el('div', { class: 'rz-t' }),
      el('div', { class: 'bt' }, blockTitle(b), small ? el('span', { class: 'bm' }, `  ${fmtHM(b.start)}–${fmtHM(b.end)}`) : null),
      small ? null : el('div', { class: 'bm' }, `${fmtHM(b.start)}–${fmtHM(b.end)}・${fmtH(dur)}${proj ? '・' + proj : ''}`),
      el('div', { class: 'rz-b' }),
    ));
  }
  if (dayS.ghost) lane.append(dayS.ghost);
}

function onLaneDown(e) {
  if (e.button !== 0) return;
  const H = dayS.hourH;
  const be = e.target.closest('.blk');
  if (be) {
    e.preventDefault();
    const id = be.dataset.id, b = data.blocks[id];
    if (selBlock !== id) { selBlock = id; $$('.blk', dayS.lane).forEach(x => x.classList.toggle('sel', x.dataset.id === id)); renderInspector(); }
    const mode = e.target.closest('.rz-t') ? 'top' : e.target.closest('.rz-b') ? 'bottom' : 'move';
    const o = { start: b.start, end: b.end };
    let last = 0, changed = false;
    trackPointer(e, (ev, dx, dy) => {
      const dm = Math.round(dy / H * 60 / SNAP) * SNAP;
      if (dm === last) return;
      if (!changed) { snapshot(); changed = true; }
      last = dm;
      if (mode === 'move') { const dur = o.end - o.start; b.start = clamp(o.start + dm, 0, 1440 - dur); b.end = b.start + dur; }
      else if (mode === 'top') b.start = clamp(o.start + dm, 0, b.end - SNAP);
      else b.end = clamp(o.end + dm, b.start + SNAP, 1440);
      renderBlocks();
    }, () => { if (changed) { save(); renderAll(); } });
    return;
  }
  // drag on empty space to create
  const m0 = Math.floor(minuteAt(e.clientY) / SNAP) * SNAP;
  let created = false;
  trackPointer(e, (ev, dx, dy) => {
    if (!created && Math.abs(dy) < 6) return;
    created = true;
    const m1 = Math.round(minuteAt(ev.clientY) / SNAP) * SNAP;
    const s = Math.min(m0, m1), en = Math.max(m0 + SNAP, m1);
    showGhost(s, en);
  }, ev => {
    hideGhost();
    if (!created) {
      if (selBlock) { selBlock = null; renderBlocks(); renderInspector(); }
      return;
    }
    const m1 = Math.round(minuteAt(ev.clientY) / SNAP) * SNAP;
    createBlock({ start: Math.min(m0, m1), end: Math.max(m0 + SNAP, m1) });
  });
}

function createBlock(props) {
  const b = { id: uid(), date: dayS.date, start: 540, end: 600, nodeId: null, title: '', color: null, memo: '', ...props };
  b.end = Math.min(b.end, 1440);
  if (b.end <= b.start) b.start = b.end - SNAP;
  selBlock = b.id;
  mutate(() => { data.blocks[b.id] = b; });
  if (!b.nodeId && !b.title) {
    const inp = $('#inspector .title-inp');
    if (inp) inp.focus();
  }
}
function findFreeSlot(date, dur) {
  const bl = blocksOn(date);
  const from = date === todayISO() ? Math.ceil(nowMin() / SNAP) * SNAP : 540;
  const free = s => !bl.some(b => b.start < s + dur && b.end > s);
  for (let s = from; s + dur <= 1440; s += SNAP) if (free(s)) return s;
  for (let s = 0; s + dur <= 1440; s += SNAP) if (free(s)) return s;
  return clamp(from, 0, 1440 - dur);
}
function quickAdd(payload) {
  const s = findFreeSlot(dayS.date, 60);
  createBlock({ ...payload, start: s, end: s + 60 });
  toast(`${fmtHM(s)}–${fmtHM(s + 60)} に追加しました`);
  const H = dayS.hourH;
  if (dayS.scrollEl) dayS.scrollEl.scrollTop = Math.max(0, s / 60 * H - 120);
}
function copyPrevDay() {
  const prev = blocksOn(addDays(dayS.date, -1));
  if (!prev.length) { toast('前日に予定がありません'); return; }
  mutate(() => {
    for (const b of prev) { const id = uid(); data.blocks[id] = { ...b, id, date: dayS.date }; }
  });
  toast(`${prev.length}件の予定をコピーしました`);
}
function clearDay() {
  const bl = blocksOn(dayS.date);
  if (!bl.length) return;
  if (!confirm(`${fmtMDW(dayS.date)} の予定 ${bl.length}件 を削除しますか？`)) return;
  mutate(() => { for (const b of bl) delete data.blocks[b.id]; selBlock = null; });
}

function dayKey(e) {
  const b = selBlock && data.blocks[selBlock];
  const mod = e.metaKey || e.ctrlKey;
  if (!b) return;
  if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); mutate(() => { delete data.blocks[b.id]; selBlock = null; }); }
  else if (e.key === 'Escape') { selBlock = null; renderBlocks(); renderInspector(); }
  else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    const dm = (e.key === 'ArrowUp' ? -1 : 1) * SNAP;
    const dur = b.end - b.start;
    mutate(() => { b.start = clamp(b.start + dm, 0, 1440 - dur); b.end = b.start + dur; });
  } else if (mod && e.key.toLowerCase() === 'd') {
    e.preventDefault();
    duplicateBlock(b);
  }
}
function duplicateBlock(b) {
  const dur = b.end - b.start;
  const s = clamp(b.end, 0, 1440 - dur);
  const id = uid();
  selBlock = id;
  mutate(() => { data.blocks[id] = { ...b, id, start: s, end: s + dur }; });
}

/* ---------- palette ---------- */
function relevantOn(n, d) {
  if (n.done) return false;
  const s = n.start || n.end, e = n.end || n.start;
  if (s && s <= d && d <= e) return true;
  if (n.due && d <= n.due && diffDays(d, n.due) <= 7) return true;
  return false;
}
function palItem(n, depth, opts = {}) {
  const c = colorOf(n);
  const isRoot = !parentOf(n);
  let meta = null;
  if (n.due) meta = el('span', { class: 'pm' + (isUrgent(n) ? ' soon' : '') }, isUrgent(n) ? `締切 ${dueInfo(n.due, n.done).txt}` : `締切 ${fmtMD(n.due)}`);
  else if (n.end) meta = el('span', { class: 'pm' }, `〜${fmtMD(n.end)}`);
  const it = el('div', {
    class: `pal-item${isRoot ? ' root' : ''}`, draggable: 'true',
    style: { paddingLeft: 8 + depth * 14 + 'px' },
    title: 'ドラッグで時間割に配置／クリックで空き時間に追加',
    onclick: () => quickAdd({ nodeId: n.id }),
  },
    isRoot ? el('span', { class: 'sq', style: { background: c } }) : el('span', { class: 'dot', style: { background: c } }),
    el('span', { class: 'pt' }, opts.path ? el('span', { class: 'muted' }, rootOf(n).title + ' / ') : null, n.title),
    meta);
  it.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ nodeId: n.id }));
    e.dataTransfer.effectAllowed = 'copy';
  });
  return it;
}
function renderPalette() {
  const list = $('#palList');
  const keep = list.scrollTop;
  list.textContent = '';
  const q = dayS.query.trim().toLowerCase();
  const d = dayS.date;

  if (q) {
    const hits = allNodes().filter(n => n.title.toLowerCase().includes(q));
    list.append(el('div', { class: 'pal-sec' }, el('h5', null, `検索結果 ${hits.length}件`),
      hits.length ? hits.map(n => palItem(n, 0, { path: !!parentOf(n) })) : el('div', { class: 'empty', style: { padding: '4px 8px' } }, '見つかりません')));
    return;
  }

  const rel = allNodes().filter(n => parentOf(n) && relevantOn(n, d))
    .sort((a, b) => (a.due || a.end || '9') < (b.due || b.end || '9') ? -1 : 1);
  list.append(el('div', { class: 'pal-sec' },
    el('h5', null, 'この日に関わるタスク', el('span', { class: 'muted' }, rel.length)),
    rel.length ? rel.map(n => palItem(n, 0, { path: true })) : el('div', { class: 'empty', style: { padding: '4px 8px' } }, '期間・締切が近いタスクはありません')));

  const presets = el('div', { class: 'presets' });
  data.presets.forEach((p, i) => {
    const chip = el('div', {
      class: 'preset', draggable: 'true', style: { '--c': p.color }, title: 'ドラッグで配置／クリックで追加／右クリックで削除',
      onclick: () => quickAdd({ title: p.title, color: p.color }),
      oncontextmenu: e => {
        e.preventDefault();
        if (confirm(`ルーティン「${p.title}」を削除しますか？`)) mutate(() => data.presets.splice(i, 1));
      },
    }, el('span', { class: 'dot' }), p.title);
    chip.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', JSON.stringify({ title: p.title, color: p.color }));
      e.dataTransfer.effectAllowed = 'copy';
    });
    presets.append(chip);
  });
  presets.append(el('button', {
    class: 'preset add', onclick: () => {
      const t = prompt('ルーティンの名前（例: ジム、通学）');
      if (t && t.trim()) mutate(() => data.presets.push({ title: t.trim(), color: COLORS[data.presets.length % COLORS.length] }));
    },
  }, '＋ 追加'));
  list.append(el('div', { class: 'pal-sec' }, el('h5', null, 'ルーティン・予定'), presets));

  const all = el('div', { class: 'pal-sec' }, el('h5', null, 'すべてのタスク'));
  const walk = (pid, depth) => {
    for (const c of childrenOf(pid)) {
      if (c.done) continue;
      all.append(palItem(c, depth));
      walk(c.id, depth + 1);
    }
  };
  walk(null, 0);
  list.append(all);
  list.scrollTop = keep;
}

/* =========================================================
   Inspector (right panel)
   ========================================================= */
function sec(title, ...kids) {
  return el('div', { class: 'sec' }, title ? el('h4', null, title) : null, kids);
}
function row(label, control, extra) {
  return el('div', { class: 'row' }, el('label', null, label), control, extra || el('span'));
}
// text/date inputs: snapshot once per focus, live-update the page without re-rendering the panel
function live(input, apply) {
  let snapped = false;
  input.addEventListener('focus', () => { snapped = false; });
  input.addEventListener('input', () => {
    if (!snapped) { snapshot(); snapped = true; }
    apply(input.value);
    save();
    renderPage();
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && input.tagName === 'INPUT' && !e.isComposing) input.blur();
    e.stopPropagation();
  });
  return input;
}

function renderInspector() {
  const box = $('#inspector');
  const focused = document.activeElement && box.contains(document.activeElement);
  if (focused && document.activeElement.matches('input[type=text], textarea')) return;
  box.textContent = '';
  if (page === 'day') {
    const b = selBlock && data.blocks[selBlock];
    box.append(b ? blockInspector(b) : daySummary());
    return;
  }
  if (page === 'map' && selMemo && data.notes[selMemo]) { box.append(memoInspector(data.notes[selMemo])); return; }
  const ids = [...sel].filter(id => data.nodes[id]);
  if (ids.length === 1) box.append(nodeInspector(data.nodes[ids[0]]));
  else if (ids.length > 1) box.append(multiInspector(ids));
  else box.append(overviewInspector());
}

function dateRow(label, n, key, onChange) {
  const inp = live(el('input', { class: 'inp', type: 'date', value: n[key] || '' }), v => {
    n[key] = v || null;
    onChange && onChange();
  });
  return row(label, inp, el('button', {
    class: 'x-btn', title: 'クリア',
    onclick: () => { if (n[key]) mutate(() => { n[key] = null; }); },
  }, icon('x')));
}

function nodeInspector(n) {
  const frag = document.createDocumentFragment();
  const c = colorOf(n);
  const isRoot = !parentOf(n);
  const anc = ancestors(n);

  const head = sec(null);
  if (anc.length) {
    head.append(el('div', { class: 'crumb' }, anc.map((a, i) => [
      i ? ' / ' : '', el('button', { onclick: () => selectOnly(a.id) }, a.title),
    ])));
  }
  head.append(live(el('input', { class: 'inp title-inp', type: 'text', value: n.title, placeholder: 'タスク名' }), v => { n.title = v || '無題'; }));
  head.append(el('label', { class: 'check-row', style: { marginTop: '8px' } },
    el('input', { type: 'checkbox', checked: !!n.done, onchange: () => toggleDone(n.id) }), '完了'));
  frag.append(head);

  // dates
  const dsec = sec('日付');
  const fix = () => {
    if (n.start && n.end && n.end < n.start) n.end = n.start;
  };
  dsec.append(
    dateRow('開始', n, 'start', fix),
    dateRow('終了', n, 'end', () => { if (n.start && n.end && n.end < n.start) n.start = n.end; }),
    dateRow('締切', n, 'due'),
  );
  const t = todayISO();
  dsec.append(el('div', { class: 'btns', style: { marginTop: '8px' } },
    el('button', { class: 'btn sm ghost', onclick: () => mutate(() => { n.due = t; }) }, '今日'),
    el('button', { class: 'btn sm ghost', onclick: () => mutate(() => { n.due = addDays(t, 7); }) }, '1週間後'),
    el('button', { class: 'btn sm ghost', onclick: () => mutate(() => { n.start = t; n.end = addDays(t, 6); }) }, '今日から1週間'),
  ));
  if (n.due) {
    const i = dueInfo(n.due, n.done);
    dsec.append(el('div', { class: 'small ' + (i.cls === 'overdue' ? '' : 'muted'), style: { marginTop: '8px', color: i.cls === 'overdue' ? 'var(--danger)' : null } },
      `締切 ${fmtMDW(n.due)}（${i.txt}）`));
  }
  frag.append(dsec);

  // time
  const ids = [n.id, ...descendants(n.id).map(d => d.id)];
  const own = scheduledMin([n.id]), total = scheduledMin(ids);
  const tsec = sec('作業時間');
  tsec.append(row('見積', live(el('input', { class: 'inp', type: 'number', min: '0', step: '0.5', value: n.estimate ?? '', placeholder: '時間' }), v => {
    n.estimate = v === '' ? null : Math.max(0, Number(v));
  }), el('span', { class: 'muted' }, 'h')));
  tsec.append(el('div', { class: 'small muted', style: { marginTop: '6px' } },
    `時間割に入れた時間: ${fmtH(own)}${total !== own ? `（子タスク含め ${fmtH(total)}）` : ''}`));
  if (n.estimate) {
    tsec.append(el('div', { class: 'prog-big', style: { '--c': c } }, el('b', { style: { width: Math.min(100, own / 60 / n.estimate * 100) + '%' } })));
  }
  tsec.append(el('button', {
    class: 'btn sm', style: { marginTop: '6px' },
    onclick: () => { dayS.date = todayISO(); setPage('day'); },
  }, icon('clock'), '1日の計画で時間を割り当てる'));
  frag.append(tsec);

  // color
  const csec = sec('カラー');
  const sw = el('div', { class: 'swatches' });
  if (!isRoot) sw.append(el('button', { class: 'sw inherit' + (!n.color ? ' on' : ''), title: '親と同じ', onclick: () => mutate(() => { n.color = null; }) }));
  for (const col of COLORS) sw.append(el('button', { class: 'sw' + (n.color === col ? ' on' : ''), style: { background: col }, onclick: () => mutate(() => { n.color = col; }) }));
  csec.append(sw);
  frag.append(csec);

  // children
  const kids = childrenOf(n.id);
  const ds = descendants(n.id);
  const ksec = sec(null);
  ksec.append(el('h4', null, '子タスク', el('span', { class: 'sub' }, ds.length ? `${ds.filter(d => d.done).length}/${ds.length} 完了` : '')));
  if (ds.length) ksec.append(el('div', { class: 'prog-big', style: { '--c': c } }, el('b', { style: { width: ds.filter(d => d.done).length / ds.length * 100 + '%' } })));
  for (const k of kids) {
    ksec.append(el('div', { class: 'list-item' },
      el('input', { type: 'checkbox', checked: !!k.done, style: { accentColor: c, margin: 0 }, onclick: e => e.stopPropagation(), onchange: () => toggleDone(k.id) }),
      el('span', { class: 'li-t', style: k.done ? { textDecoration: 'line-through', color: 'var(--text-3)' } : null, onclick: () => selectOnly(k.id) }, k.title),
      k.due ? el('span', { class: 'li-m ' + dueInfo(k.due, k.done).cls }, fmtMD(k.due)) : null));
  }
  ksec.append(el('button', { class: 'btn sm', style: { marginTop: '6px' }, onclick: () => { if (page !== 'map') setPage('map'); addChild(n.id); } }, icon('plus'), '子タスクを追加'));
  frag.append(ksec);

  // memo
  frag.append(sec('メモ', live(el('textarea', { class: 'inp', placeholder: 'メモ・リンクなど', value: n.note || '' }), v => { n.note = v; })));

  // actions
  frag.append(sec(null, el('div', { class: 'btns' },
    page !== 'map' ? el('button', { class: 'btn', onclick: () => revealNode(n.id) }, icon('mindmap'), 'マップで表示') : null,
    page !== 'schedule' ? el('button', { class: 'btn', onclick: () => setPage('schedule') }, icon('gantt'), 'スケジュール') : null,
    !isRoot ? el('button', { class: 'btn', title: '親との間に新しいタスクを挿入 (⇧Tab)', onclick: () => { if (page !== 'map') setPage('map'); insertBetween(n.id); } }, icon('plus'), '親との間に挿入') : null,
    !isRoot ? el('button', {
      class: 'btn', title: '親から切り離して独立したプロジェクトにする',
      onclick: () => mutate(() => { n.color = n.color || colorOf(n); n.parentId = null; }),
    }, '独立させる') : null,
    el('button', { class: 'btn danger', title: kids.length ? 'このタスクだけ削除し、後ろのタスクは前のタスクにつなぎ直す (Delete)' : '削除 (Delete)', onclick: () => removeKeepChildren(n.id) }, icon('trash'), '削除'),
    kids.length ? el('button', { class: 'btn danger', title: '後ろのタスクもまとめて削除 (⇧Delete)', onclick: () => deleteNodes([n.id]) }, '後ろもまとめて削除') : null,
  )));
  if (page === 'map' && !isRoot) frag.append(el('div', { class: 'muted small', style: { padding: '0 18px 16px' } }, 'ヒント: タスクを線の上にドラッグすると間にはめられます。⌥(Option)を押しながらドラッグすると、子タスクを残して抜き出せます。'));
  return frag;
}

function memoInspector(m) {
  const frag = document.createDocumentFragment();
  frag.append(sec('メモ', live(el('textarea', { class: 'inp', placeholder: 'メモを入力', value: m.text || '', style: { minHeight: '160px' } }), v => { m.text = v; })));
  const sw = el('div', { class: 'swatches' });
  for (const col of MEMO_COLORS) sw.append(el('button', { class: 'sw' + (m.color === col ? ' on' : ''), style: { background: col, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.12)' }, onclick: () => mutate(() => { m.color = col; }) }));
  frag.append(sec('色', sw));
  frag.append(sec(null, el('div', { class: 'muted small', style: { marginBottom: '10px' } }, 'ダブルクリックでキャンバス上でも編集できます。右下の角をドラッグで幅を変更。'),
    el('button', { class: 'btn danger', onclick: () => deleteMemo(m.id) }, icon('trash'), '削除')));
  return frag;
}

function multiInspector(ids) {
  const frag = document.createDocumentFragment();
  frag.append(sec(`${ids.length}件を選択中`,
    el('div', { class: 'btns' },
      el('button', { class: 'btn', onclick: () => mutate(() => ids.forEach(id => { data.nodes[id].done = true; })) }, icon('check'), 'すべて完了'),
      el('button', { class: 'btn', onclick: () => mutate(() => ids.forEach(id => { data.nodes[id].done = false; })) }, '未完了に戻す'),
      el('button', { class: 'btn danger', onclick: () => removeKeepChildren(ids) }, icon('trash'), '削除'),
      el('button', { class: 'btn danger', onclick: () => deleteNodes(ids) }, '後ろもまとめて削除'))));
  const dsec = sec('締切をまとめて設定');
  const inp = el('input', { class: 'inp', type: 'date' });
  dsec.append(row('締切', inp, el('button', { class: 'btn sm', onclick: () => inp.value && mutate(() => ids.forEach(id => { data.nodes[id].due = inp.value; })) }, '適用')));
  frag.append(dsec);
  const sw = el('div', { class: 'swatches' });
  for (const col of COLORS) sw.append(el('button', { class: 'sw', style: { background: col }, onclick: () => mutate(() => ids.forEach(id => { data.nodes[id].color = col; })) }));
  frag.append(sec('カラー', sw));
  return frag;
}

function taskListItem(n, metaText, cls) {
  return el('div', { class: 'list-item', onclick: () => { if (page === 'map') { selectOnly(n.id); centerOn(n.id); } else selectOnly(n.id); } },
    el('span', { class: 'dot', style: { background: colorOf(n) } }),
    el('span', { class: 'li-t' }, n.title, parentOf(n) ? el('span', { class: 'muted' }, `  ${rootOf(n).title}`) : null),
    el('span', { class: 'li-m ' + (cls || '') }, metaText));
}

function overviewInspector() {
  const frag = document.createDocumentFragment();
  const t = todayISO();
  const ns = allNodes();
  const open = ns.filter(n => !n.done && parentOf(n));
  frag.append(sec(null,
    el('div', { class: 'muted small' }, fmtMDW(t)),
    el('div', { class: 'stat-big' }, open.length, el('small', null, 'タスク残り')),
    el('div', { class: 'muted small' }, `完了 ${ns.filter(n => n.done).length} ・ 全 ${ns.length}`)));

  const due = ns.filter(n => n.due && !n.done && diffDays(t, n.due) <= 14).sort((a, b) => (a.due < b.due ? -1 : 1));
  const dsec = sec('締切が近いタスク（2週間以内）');
  if (due.length) due.forEach(n => { const i = dueInfo(n.due, false); dsec.append(taskListItem(n, `${fmtMD(n.due)}・${i.txt}`, i.cls)); });
  else dsec.append(el('div', { class: 'empty' }, 'なし'));
  frag.append(dsec);

  const act = ns.filter(n => !n.done && (n.start || n.end) && (n.start || n.end) <= t && t <= (n.end || n.start));
  const asec = sec('進行中');
  if (act.length) act.forEach(n => asec.append(taskListItem(n, `〜${fmtMD(n.end || n.start)}`)));
  else asec.append(el('div', { class: 'empty' }, 'なし'));
  frag.append(asec);

  if (page === 'map') {
    const keys = [
      ['ダブルクリック', '新しいプロジェクト'], ['Tab', '子タスクを追加'], ['Enter', '同じ階層に追加'],
      ['F2', '名前を変更'], ['⌘ Enter', '完了/未完了'], ['矢印キー', 'タスク間を移動'],
      ['Space+ドラッグ', 'キャンバス移動'], ['⌘+スクロール', 'ズーム'], ['⇧1', '全体を表示'], ['⇧A', '整列し直す'],
      ['M', 'メモを置く'], ['ドラッグ', '自由に配置'], ['ドラッグ→タスク上', '親を変更'],
      ['ドラッグ→線の上', '間にはめる'], ['線にカーソル→＋', '間に新しいタスク'], ['⇧Tab', '親との間に挿入'],
      ['⌥+ドラッグ', '子を残して抜き出す'], ['Delete', '削除（後ろはつなぎ直す）'], ['⇧Delete', '後ろもまとめて削除'],
    ];
    frag.append(el('details', { class: 'sec' }, el('summary', null, 'ショートカット'),
      el('div', { class: 'kbd-list' }, keys.map(([k, v]) => [el('span', { class: 'muted' }, v), el('kbd', null, k)]))));
  } else {
    frag.append(sec('操作', el('div', { class: 'muted small' },
      'バーをドラッグで移動、両端で期間を伸縮。◆ は締切です。日付のない行をドラッグすると期間を作成できます。')));
  }
  return frag;
}

function timeSelect(value, min, max, onChange) {
  const s = el('select', { class: 'inp', onchange: e => onChange(Number(e.target.value)) });
  for (let m = min; m <= max; m += SNAP) s.append(el('option', { value: String(m) }, fmtHM(m)));
  s.value = String(value);
  return s;
}

function blockInspector(b) {
  const frag = document.createDocumentFragment();
  const n = linkedNode(b);
  const head = sec(null);
  if (n) {
    head.append(el('div', { class: 'crumb' }, ancestors(n).map(a => a.title).join(' / ')));
    head.append(el('div', { style: { fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' } },
      el('span', { style: { width: '10px', height: '10px', borderRadius: '3px', background: colorOf(n), flex: 'none' } }), n.title));
    head.append(el('label', { class: 'check-row', style: { marginTop: '8px' } },
      el('input', { type: 'checkbox', checked: !!n.done, onchange: () => toggleDone(n.id) }), 'タスクを完了にする'));
  } else {
    head.append(live(el('input', { class: 'inp title-inp', type: 'text', value: b.title, placeholder: '予定の名前（例: 授業、移動）' }), v => { b.title = v; }));
  }
  frag.append(head);

  const tsec = sec('時間');
  tsec.append(
    row('開始', timeSelect(b.start, 0, 1440 - SNAP, v => mutate(() => { b.start = v; if (b.end <= v) b.end = Math.min(1440, v + 60); }))),
    row('終了', timeSelect(b.end, SNAP, 1440, v => mutate(() => { b.end = v; if (b.start >= v) b.start = Math.max(0, v - 60); }))),
    el('div', { class: 'muted small' }, `${fmtH(b.end - b.start)}・${fmtMDW(b.date)}`),
  );
  frag.append(tsec);

  const lsec = sec('タスクと紐づける');
  const s = el('select', {
    class: 'inp',
    onchange: e => mutate(() => {
      const v = e.target.value;
      if (!v && b.nodeId) { b.title = b.title || blockTitle(b); b.color = b.color || blockColor(b); }
      b.nodeId = v || null;
    }),
  }, el('option', { value: '' }, '（紐づけない）'));
  for (const { n: x, depth } of treeList()) s.append(el('option', { value: x.id }, '　'.repeat(depth) + x.title + (x.done ? '（完了）' : '')));
  s.value = b.nodeId || '';
  lsec.append(s);
  if (n) {
    const tot = scheduledMin([n.id]);
    lsec.append(el('div', { class: 'small muted', style: { marginTop: '8px' } },
      `このタスクの合計: ${fmtH(tot)}${n.estimate ? ` / 見積 ${n.estimate}h` : ''}`));
    if (n.estimate) lsec.append(el('div', { class: 'prog-big', style: { '--c': colorOf(n) } }, el('b', { style: { width: Math.min(100, tot / 60 / n.estimate * 100) + '%' } })));
    if (n.due) lsec.append(el('div', { class: 'small muted' }, `締切 ${fmtMDW(n.due)}（${dueInfo(n.due, n.done).txt}）`));
  }
  frag.append(lsec);

  frag.append(sec('メモ', live(el('textarea', { class: 'inp', placeholder: 'この時間にやること', value: b.memo || '' }), v => { b.memo = v; })));
  frag.append(sec(null, el('div', { class: 'btns' },
    n ? el('button', { class: 'btn', onclick: () => revealNode(n.id) }, icon('mindmap'), 'マップで表示') : null,
    el('button', { class: 'btn', title: '⌘D', onclick: () => duplicateBlock(b) }, icon('copy'), '複製'),
    el('button', { class: 'btn danger', onclick: () => mutate(() => { delete data.blocks[b.id]; selBlock = null; }) }, icon('trash'), '削除'),
  )));
  return frag;
}

function daySummary() {
  const frag = document.createDocumentFragment();
  const bl = blocksOn(dayS.date);
  const covered = new Uint8Array(1440);
  const groups = new Map();
  const tasks = new Map();
  for (const b of bl) {
    for (let m = b.start; m < b.end; m++) covered[m] = 1;
    const n = linkedNode(b);
    const root = n ? rootOf(n) : null;
    const key = root ? 'p:' + root.id : 't:' + (b.title || '無題');
    const g = groups.get(key) || { label: root ? root.title : (b.title || '無題の予定'), color: root ? colorOf(root) : blockColor(b), min: 0 };
    g.min += b.end - b.start;
    groups.set(key, g);
    if (n) tasks.set(n.id, (tasks.get(n.id) || 0) + b.end - b.start);
  }
  const used = covered.reduce((a, v) => a + v, 0);
  const list = [...groups.values()].sort((a, b) => b.min - a.min);

  const s1 = sec(null,
    el('div', { class: 'muted small' }, fmtMDW(dayS.date)),
    el('div', { class: 'stat-big' }, fmtH(used), el('small', null, '計画済み')),
    el('div', { class: 'muted small' }, `未計画 ${fmtH(1440 - used)}`));
  const stack = el('div', { class: 'stack' });
  for (const g of list) stack.append(el('i', { style: { width: g.min / 1440 * 100 + '%', background: g.color }, title: `${g.label} ${fmtH(g.min)}` }));
  s1.append(stack);
  for (const g of list) s1.append(el('div', { class: 'legend-row' }, el('span', { class: 'dot', style: { background: g.color } }), el('span', { class: 'lt' }, g.label), el('span', { class: 'lh' }, fmtH(g.min))));
  s1.append(el('div', { class: 'legend-row' }, el('span', { class: 'dot', style: { background: '#e6e6e6' } }), el('span', { class: 'lt muted' }, '未計画'), el('span', { class: 'lh' }, fmtH(1440 - used))));
  frag.append(s1);

  const ts = sec('この日に取り組むタスク');
  if (tasks.size) {
    for (const [id, m] of tasks) {
      const n = data.nodes[id];
      const tot = scheduledMin([id]);
      ts.append(taskListItem(n, `${fmtH(m)}${n.estimate ? `（計${fmtH(tot)}/${n.estimate}h）` : ''}`));
    }
  } else ts.append(el('div', { class: 'empty' }, 'まだありません'));
  frag.append(ts);

  frag.append(sec('操作', el('div', { class: 'muted small', style: { lineHeight: 1.7 } },
    '・左のタスクを時間割にドラッグ（クリックで空き時間に追加）', el('br'),
    '・空いている所をドラッグ／ダブルクリックで予定を作成', el('br'),
    '・予定の上下端をドラッグで時間を伸縮（15分単位）', el('br'),
    '・選択して Delete で削除、↑↓ で15分移動、⌘D で複製')));
  return frag;
}

/* =========================================================
   Boot
   ========================================================= */
function initTop() {
  $$('.ic-slot').forEach(s => s.replaceWith(icon(s.dataset.icon)));
  $$('#tabs button').forEach(b => b.addEventListener('click', () => setPage(b.dataset.page)));
  $('#btnUndo').addEventListener('click', undo);
  $('#btnRedo').addEventListener('click', redo);
  const menu = $('#menu');
  $('#btnMenu').addEventListener('click', e => { e.stopPropagation(); menu.hidden = !menu.hidden; });
  document.addEventListener('click', e => { if (!menu.contains(e.target)) menu.hidden = true; });
  menu.addEventListener('click', e => {
    const act = e.target.dataset.act;
    if (!act) return;
    menu.hidden = true;
    if (act === 'export') {
      flushSave();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = el('a', { href: URL.createObjectURL(blob), download: `plan-canvas-${todayISO()}.json` });
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } else if (act === 'import') $('#fileImport').click();
    else if (act === 'sample') {
      if (!confirm('サンプルデータに置き換えますか？（⌘Z で元に戻せます）')) return;
      snapshot();
      const s = sampleData();
      data.nodes = s.nodes; data.blocks = s.blocks; data.presets = s.presets; data.notes = s.notes; data.ui.stack = true;
      sel = new Set(); selBlock = null; save(); renderAll();
    } else if (act === 'clear') {
      if (!confirm('すべてのタスクと予定を削除しますか？（⌘Z で元に戻せます）')) return;
      mutate(() => { data.nodes = {}; data.blocks = {}; data.notes = {}; sel = new Set(); selBlock = null; selMemo = null; });
    }
  });
  $('#fileImport').addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const o = JSON.parse(r.result);
        if (!o || typeof o.nodes !== 'object') throw new Error('bad');
        snapshot();
        const page0 = page;
        data = normalize(o);
        page = page0;
        sel = new Set(); selBlock = null;
        save(); renderAll();
        toast('読み込みました');
      } catch (err) { toast('読み込めませんでした（形式が違います）'); }
    };
    r.readAsText(f);
    e.target.value = '';
  });

  $('#palSearch').addEventListener('input', e => { dayS.query = e.target.value; renderPalette(); });
  $('#palSearch').addEventListener('keydown', e => e.stopPropagation());

  document.addEventListener('keydown', e => {
    const t = e.target;
    const typing = t.closest && t.closest('input, textarea, select, [contenteditable="true"]');
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === 'z' && !typing) { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
    if (mod && e.key.toLowerCase() === 'y' && !typing) { e.preventDefault(); redo(); return; }
    if (typing) return;
    if (!mod && !e.shiftKey && !e.altKey && ['1', '2', '3'].includes(e.key) && !(page === 'map' && sel.size)) {
      setPage(['map', 'schedule', 'day'][Number(e.key) - 1]);
      return;
    }
    if (page === 'map') mapKey(e);
    else if (page === 'day') dayKey(e);
    else if (e.key === 'Escape') selectOnly(null);
  });
  document.addEventListener('keyup', e => {
    if (e.key === ' ') { mm.space = false; mm.el.classList.remove('space'); }
  });
  window.addEventListener('blur', () => { mm.space = false; mm.el.classList.remove('space'); });
  // keep the "now" line roughly current
  setInterval(() => { if (page === 'day' && dayS.date === todayISO()) { const n = $('.now'); if (n) n.style.top = nowMin() / 60 * dayS.hourH + 'px'; } }, 60000);
}

initTop();
initMap();
updateUndoButtons();
setPage(page);
