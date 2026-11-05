'use strict';

/* =========================================================
   Cloud sync: Google sign-in + one Firestore document per user
   - users/{uid} = { data: JSON string, rev, client, updatedAt }
   - only the document data is synced; view position / open page stay per device
   - edits upload a moment after they happen; other devices apply them live
   ========================================================= */
const SDK = 'https://www.gstatic.com/firebasejs/10.14.1/';
const SYNC_META = 'plan-canvas-sync';
const sync = {
  state: 'unconfigured', user: null, auth: null, db: null, ref: null, unsub: null,
  timer: null, lastSent: null, lastRev: 0, ready: false, clientId: uid(),
};

const syncPayload = () => JSON.stringify({ nodes: data.nodes, blocks: data.blocks, presets: data.presets, notes: data.notes });
function hashStr(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h * 33 + str.charCodeAt(i)) | 0;
  return String(h >>> 0);
}
function loadMeta() { try { return JSON.parse(localStorage.getItem(SYNC_META)) || {}; } catch (e) { return {}; } }
function saveMeta(rev, payload) {
  try { localStorage.setItem(SYNC_META, JSON.stringify({ uid: sync.user.uid, rev, hash: hashStr(payload) })); } catch (e) { /* ignore */ }
}
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(src));
    document.head.append(s);
  });
}

async function initSync() {
  if (!window.FIREBASE_CONFIG) { setSyncState('unconfigured'); return; }
  setSyncState('loading');
  try {
    for (const f of ['firebase-app-compat.js', 'firebase-auth-compat.js', 'firebase-firestore-compat.js']) await loadScript(SDK + f);
  } catch (e) {
    setSyncState('offline');
    return;
  }
  firebase.initializeApp(window.FIREBASE_CONFIG);
  sync.auth = firebase.auth();
  sync.db = firebase.firestore();
  sync.auth.getRedirectResult().catch(err => toast(`ログインできませんでした（${err.code}）`));
  sync.auth.onAuthStateChanged(user => {
    sync.user = user;
    if (user) startSync(); else stopSync();
  });
  window.addEventListener('online', () => { if (sync.ready) syncNotify(true); });
}

async function signIn() {
  if (!sync.auth) return;
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await sync.auth.signInWithPopup(provider);
  } catch (e) {
    if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') {
      await sync.auth.signInWithRedirect(provider);
    } else if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') {
      toast(`ログインできませんでした（${e.code}）`);
    }
  }
}
async function signOut() {
  if (sync.timer) await upload();
  await sync.auth.signOut();
  toast('ログアウトしました（この端末のデータはそのまま残ります）');
}

async function startSync() {
  setSyncState('syncing');
  sync.ref = sync.db.collection('users').doc(sync.user.uid);
  let snap;
  try {
    snap = await sync.ref.get();
  } catch (e) {
    setSyncState(navigator.onLine ? 'error' : 'offline');
    toast(`同期できませんでした（${e.code || e.message}）`);
    return;
  }
  const local = syncPayload();
  const meta = loadMeta();
  if (!snap.exists) {
    await upload();
  } else {
    const remote = snap.data();
    const sameUser = meta.uid === sync.user.uid;
    if (remote.data === local) {
      sync.lastSent = local; sync.lastRev = remote.rev; saveMeta(remote.rev, local);
    } else if (sameUser && meta.hash === hashStr(local)) {
      applyRemote(remote, false); // nothing changed here since the last sync → take the cloud version
    } else if (sameUser && meta.rev === remote.rev) {
      await upload(); // the cloud hasn't changed → this device's edits are newer
    } else {
      // both sides changed (or first sign-in on this device with other data)
      const useCloud = await chooseVersion(remote);
      if (useCloud) applyRemote(remote, false); else await upload();
    }
  }
  sync.ready = true;
  if (sync.state !== 'error') setSyncState('synced');
  sync.unsub = sync.ref.onSnapshot(s => {
    if (!s.exists || s.metadata.hasPendingWrites) return;
    const r = s.data();
    if (r.client === sync.clientId || r.rev <= sync.lastRev) return;
    if (sync.timer) return; // this device has unsent edits; they go up next and win
    applyRemote(r, true);
  }, err => { setSyncState('error'); toast(`同期が止まりました（${err.code}）`); });
}
function stopSync() {
  if (sync.unsub) sync.unsub();
  clearTimeout(sync.timer);
  Object.assign(sync, { unsub: null, ref: null, timer: null, ready: false, lastSent: null, lastRev: 0 });
  setSyncState(sync.auth ? 'signedout' : 'unconfigured');
}

function applyRemote(r, live) {
  let o;
  try { o = JSON.parse(r.data); } catch (e) { return; }
  data.nodes = o.nodes || {};
  data.blocks = o.blocks || {};
  data.presets = o.presets || data.presets;
  data.notes = o.notes || {};
  sel = new Set([...sel].filter(id => data.nodes[id]));
  if (selBlock && !data.blocks[selBlock]) selBlock = null;
  if (selMemo && !data.notes[selMemo]) selMemo = null;
  sync.lastSent = r.data;
  sync.lastRev = r.rev;
  saveMeta(r.rev, r.data);
  flushSave();
  renderAll();
  if (live) toast('ほかの端末の変更を反映しました');
}

// called after every local save
function syncNotify(now) {
  if (!sync.ready) return;
  if (!now && syncPayload() === sync.lastSent) return;
  clearTimeout(sync.timer);
  setSyncState('pending');
  sync.timer = setTimeout(upload, now ? 0 : 1200);
}
async function upload() {
  clearTimeout(sync.timer);
  sync.timer = null;
  const payload = syncPayload();
  if (payload.length > 900000) { setSyncState('error'); toast('データが大きすぎて同期できません'); return; }
  const rev = Math.max(Date.now(), sync.lastRev + 1);
  setSyncState('syncing');
  try {
    await sync.ref.set({ data: payload, rev, client: sync.clientId, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    sync.lastSent = payload;
    sync.lastRev = rev;
    saveMeta(rev, payload);
    setSyncState(syncPayload() === payload ? 'synced' : 'pending');
  } catch (e) {
    setSyncState(navigator.onLine ? 'error' : 'offline');
    sync.timer = setTimeout(upload, 15000);
  }
}

function chooseVersion(remote) {
  return new Promise(resolve => {
    const count = s => { try { const o = JSON.parse(s); return Object.keys(o.nodes || {}).length; } catch (e) { return 0; } };
    const when = remote.updatedAt && remote.updatedAt.toDate ? remote.updatedAt.toDate() : new Date(remote.rev);
    const fmt = `${when.getMonth() + 1}/${when.getDate()} ${when.getHours()}:${pad(when.getMinutes())}`;
    const done = v => { modal.remove(); resolve(v); };
    const modal = el('div', { class: 'modal-wrap' }, el('div', { class: 'modal' },
      el('h3', null, 'どちらのデータを使いますか？'),
      el('p', { class: 'muted' }, 'クラウドに保存されたデータと、この端末のデータが違います。選ばなかった方は上書きされます。'),
      el('button', { class: 'choice', onclick: () => done(true) },
        el('b', null, 'クラウドのデータを使う'), el('span', { class: 'muted small' }, `最終更新 ${fmt}・タスク ${count(remote.data)}件`)),
      el('button', { class: 'choice', onclick: () => done(false) },
        el('b', null, 'この端末のデータを使う'), el('span', { class: 'muted small' }, `タスク ${Object.keys(data.nodes).length}件（クラウドを上書き）`)),
    ));
    document.body.append(modal);
  });
}

/* ---------- top bar button ---------- */
const SYNC_UI = {
  unconfigured: null,
  loading: { ic: 'cloud', txt: '準備中', tip: '同期の準備中' },
  signedout: { ic: 'cloud', txt: 'ログイン', tip: 'Googleでログインしてスマホ・PCで同期' },
  syncing: { ic: 'cloud', txt: '同期中', tip: '同期しています' },
  pending: { ic: 'cloud', txt: '同期待ち', tip: '変更をまもなく送ります' },
  synced: { ic: 'cloudOk', txt: '同期済み', tip: 'クラウドと同期しています' },
  offline: { ic: 'cloudOff', txt: 'オフライン', tip: 'オフラインです。つながったら自動で送ります' },
  error: { ic: 'cloudOff', txt: '同期エラー', tip: '同期できていません。タップで詳細' },
};
function setSyncState(st) {
  sync.state = st;
  const b = $('#btnSync');
  if (!b) return;
  const ui = SYNC_UI[st];
  b.hidden = !ui;
  if (!ui) return;
  b.className = 'sync-btn ' + st;
  b.title = ui.tip;
  b.textContent = '';
  b.append(icon(ui.ic), el('span', { class: 'sync-txt' }, ui.txt));
}
function openSyncMenu() {
  if (sync.state === 'signedout') { signIn(); return; }
  if (!sync.user) return;
  const old = $('#syncMenu');
  if (old) { old.remove(); return; }
  const m = el('div', { class: 'menu', id: 'syncMenu' },
    el('div', { class: 'menu-info' }, el('b', null, sync.user.displayName || 'ログイン中'), el('span', { class: 'muted small' }, sync.user.email || '')),
    el('div', { class: 'menu-info muted small' }, SYNC_UI[sync.state] ? SYNC_UI[sync.state].tip : ''),
    el('hr'),
    el('button', { onclick: () => { m.remove(); syncNotify(true); } }, '今すぐ同期'),
    el('button', { onclick: () => { m.remove(); signOut(); } }, 'ログアウト'));
  $('.top-actions').append(m);
  setTimeout(() => document.addEventListener('click', function close(e) {
    if (!m.contains(e.target)) { m.remove(); document.removeEventListener('click', close); }
  }));
}

ICONS.cloud = '<path d="M4.6 12.5h6.9a3 3 0 00.3-6 4 4 0 00-7.5-.9 3.5 3.5 0 00.3 6.9z"/>';
ICONS.cloudOk = ICONS.cloud + '<path d="M6.3 9.3l1.3 1.3 2.3-2.6"/>';
ICONS.cloudOff = ICONS.cloud + '<path d="M2.5 2.5l11 11"/>';
$('#btnSync').addEventListener('click', e => { e.stopPropagation(); openSyncMenu(); });
initSync();
