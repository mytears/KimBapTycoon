"use strict";

const $ = id => document.getElementById(id);
const money = v => v.toLocaleString("ko-KR") + "원";
const serial = id => String(id).padStart(3, "0");
const art = (type, n) => "assets/art/" + type + "-" + n + ".webp";
const icons = {
  store: "M3 9l2-5h14l2 5v2a3 3 0 0 1-5 2 3 3 0 0 1-4 0 3 3 0 0 1-4 0 3 3 0 0 1-5-2z M5 14v6h14v-6 M10 20v-5h4v5",
  upgrade: "M4 20V12h3v8z M10 20V8h3v12z M16 20V4h3v16z",
  book: "M12 6C9 4 6 4 3 5v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1z M12 6v14",
  sound: "M3 9h4l5-4v14l-5-4H3z M15 8q4 4 0 8 M18 5q7 7 0 14",
  muted: "M3 9h4l5-4v14l-5-4H3z M16 9l5 6 M21 9l-5 6",
  gear: "M10 3h4l1 3 3-1 2 3-2 3 2 2-1 4-4 0-1 3h-4l-1-3-3 0-2-3 2-3-2-3 2-3 3 1z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
  moon: "M19 15A8 8 0 0 1 9 4a8.5 8.5 0 1 0 10 11z M17 3v4m-2-2h4",
  ticket: "M4 5h16v5a2 2 0 0 0 0 4v5H4v-5a2 2 0 0 0 0-4z M14 6v2m0 3v2m0 3v2",
  coin: "M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0z M10 9h4v6h-4z",
  people: "M14 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M4 20v-2a6 6 0 0 1 12 0v2z M17 5a3 3 0 0 1 0 6m1 3q3 1 3 5",
  pan: "M3 10h13v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z M16 11l5-5 M6 6q-2-2 0-4m4 4q-2-2 0-4",
  chevron: "M9 5l7 7-7 7", clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z M12 7v6h4",
  close: "M5 5l14 14M19 5L5 19", check: "M4 12l5 5L20 6", menu: "M5 3v7m3-7v7m3-7v7M5 8v1a3 3 0 0 0 6 0 M8 12v9 M19 3q-5 3-4 10h4m0-10v18",
  fire: "M13 3q1 5 4 7l1-3q6 10-2 14H8Q1 18 5 11l3-3q-1 5 2 5 3-4 3-10z",
  leaf: "M20 4Q3 3 4 14q2 8 10 3 4-3 6-13z M5 20l10-11",
  bell: "M3 16h18 M5 14a7 7 0 0 1 14 0z M12 5V3 M3 20h18",
  timer: "M12 5a8 8 0 1 1 0 16 8 8 0 0 1 0-16z M9 2h6m-3 0v3m0 4v4l3 2",
  stove: "M3 12h18v8H3z M6 12V9h12v3 M9 6q-2-2 0-4m5 4q-2-2 0-4 M6 16h1m4 0h1"
};
function icon(key) {
  return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="' + icons[key] + '"/></svg>';
}
function load() {
  try { return restore(JSON.parse(localStorage.getItem(storageKey))); } catch { return fresh(); }
}
let game = load(), page = "play", noticeTimeout, audio;
let lastFrame = performance.now(), lastSave = lastFrame, running = !document.hidden;
const markup = new WeakMap();
function paint(el, html) {
  if (markup.get(el) !== html) { el.innerHTML = html; markup.set(el, html); }
}
function notify(message) {
  $("notice").textContent = message;
  $("notice").classList.add("visible");
  clearTimeout(noticeTimeout);
  noticeTimeout = setTimeout(() => $("notice").classList.remove("visible"), 2800);
}
function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(game)); }
  catch { notify("진행 상황을 저장할 수 없어요."); }
  lastSave = performance.now();
}
function tone(hz = 560) {
  if (!game.sound) return;
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    audio.resume().catch(() => {});
    const osc = audio.createOscillator(), gain = audio.createGain(), t = audio.currentTime;
    osc.type = "sine"; osc.frequency.value = hz;
    gain.gain.setValueAtTime(.11, t); gain.gain.exponentialRampToValueAtTime(.001, t + .13);
    osc.connect(gain); gain.connect(audio.destination); osc.start(); osc.stop(t + .14);
  } catch {}
}
const dish = (index, cls = "") => '<img class="' + cls + '" src="' + art("dish", index) + '" alt="">';
const portrait = q => '<span class="portrait guest-' + q.guest + '"><img src="' + art("guest", q.guest) + '" alt=""></span>';
const temperament = q => '<span class="temper ' + q.temper + '">' + icon({ hasty: "fire", easy: "leaf", regular: "clock" }[q.temper]) + tempers[q.temper].name + '</span>';
const meter = q => '<div class="meter" data-meter="' + q.id + '"><span></span></div>';
const timer = q => '<span class="remaining" data-time="' + q.id + '"></span>';
const shortTime = ms => { const sec = Math.ceil(Math.max(0, ms) / 1000); return Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0"); };

function renderScene() {
  const host = $("patrons");
  for (const el of Array.from(host.children))
    if (!game.queue.some(q => q.id === +el.dataset.id)) el.remove();
  game.queue.forEach((q, i) => {
    let el = host.querySelector('[data-id="' + q.id + '"]');
    if (!el) {
      el = document.createElement("div"); el.className = "patron"; el.dataset.id = q.id;
      el.innerHTML = '<div class="person"><span class="bubble"></span><img class="sprite" src="' + art("guest", q.guest) + '" alt=""></div>';
      host.append(el);
    }
    el.style.setProperty("--place", i);
    el.classList.toggle("first", i === 0);
    el.title = (i + 1) + "번째 · " + guests[q.guest] + " · " + menus[q.menu].name;
    el.setAttribute("role", "img"); el.setAttribute("aria-label", el.title);
    paint(el.querySelector(".bubble"), i === 0 ? dish(q.menu) : String(i + 1));
  });
  $("equipment").src = art("stove", game.speed);
  $("equipment").alt = equipment[game.speed];
  $("equipment").parentElement.title = equipment[game.speed];
  $("scene").dataset.level = game.speed;
  $("scene").classList.toggle("cooking", game.kitchen?.finish != null);
  $("branch-name").textContent = "별밤 " + game.branches + "호점";
  $("open-sign").textContent = game.closed ? "영업 마감" : "영업 중";
  $("open-sign").classList.toggle("closed", game.closed);
}

function renderQueue() {
  const head = game.queue[0];
  $("queue-count").textContent = game.queue.length + " / " + capacity + "명";
  paint($("current-order"), head ? '<div class="ticket"><div class="ticket-top"><span class="first-label">' + icon("ticket") +
    '첫 주문</span><span class="order-id">NO. ' + serial(head.id) + '</span></div><div class="ticket-main">' + portrait(head) +
    '<div class="customer"><small>' + guests[head.guest] + '</small><h3>' + menus[head.menu].name + '</h3></div>' +
    '<b class="ticket-price">' + money(salePrice(game, head.menu)) + '</b></div><div class="patience-line">' + temperament(head) +
    '<span class="deadline">' + icon("timer") + '남은 시간 ' + timer(head) + '</span></div>' + meter(head) + '</div>'
    : '<div class="empty-ticket">' + icon(game.closed ? "moon" : "store") +
    '<b>' + (game.closed ? "오늘 영업을 마쳤어요" : "다음 손님을 기다리는 중") + '</b></div>');
  paint($("waiting"), game.queue.length > 1 ? game.queue.slice(1).map((q, i) =>
    '<li class="waiting-order"><span class="rank">' + String(i + 2).padStart(2, "0") + '</span>' + portrait(q) +
    '<div class="queued-dish"><b>' + menus[q.menu].name + '</b><small>' + guests[q.guest] + '</small></div>' +
    '<div class="queued-time">' + temperament(q) + timer(q) + meter(q) + '</div></li>').join("")
    : '<li class="empty-line">' + (game.closed ? "모든 주문이 끝났어요." : "아직 뒤에 기다리는 손님이 없어요.") + '</li>');
}

function renderKitchen() {
  const head = game.queue[0], menu = menus[game.selected], k = game.kitchen;
  if (!head) {
    paint($("kitchen"), '<div class="empty-kitchen">' + icon(game.closed ? "moon" : "pan") + '<h3>' +
      (game.closed ? "오늘의 조리 완료" : "주문 대기 중") + '</h3><p>' +
      (game.closed ? "정산하고 다음 영업을 준비하세요." : "손님이 오면 조리를 시작할 수 있어요.") + '</p></div>' +
      (game.closed ? '<button class="primary" data-settle>오늘의 정산 ' + icon("chevron") + '</button>' : ''));
    return;
  }
  const step = k?.step ?? 0, busy = k?.finish != null, ready = step >= menu.steps.length;
  const controls = ready ? '<button class="primary ready" data-serve="' + head.id + '">' + icon("bell") + '첫 손님에게 건네기</button>'
    : '<div class="step-controls" aria-label="조리 동작">' + menu.steps.map((name, i) =>
      '<button class="step-button ' + (i === step ? 'active' : '') + '" data-ticket="' + head.id + '" data-step="' + i +
      '" ' + (i < step || busy ? "disabled" : "") + '><span class="step-num">' + (i < step ? icon("check") : "0" + (i + 1)) + '</span><b>' +
      (busy && i === step ? '조리 중…' : name) + '</b>' + (i === step ? icon("chevron") : "") + '</button>').join("") + '</div>';
  paint($("kitchen"), '<div class="recipe"><div class="plated">' + dish(game.selected) + '</div><div><small>선택한 레시피</small><h3>' +
    menu.name + '</h3><span class="stage-label">' + (ready ? "전 단계 완료" : (step + 1) + ' / ' + menu.steps.length + '단계') +
    '</span></div></div><div class="prep-heading"><h3>' + (ready ? "조리 완료" : "조리 순서") + '</h3><small>' +
    (ready ? "따뜻할 때 내어 주세요" : "순서대로 눌러 주세요") + '</small></div>' + controls);
}

function refreshTimers() {
  for (const q of game.queue) {
    const remain = q.expires - game.elapsed;
    const bar = document.querySelector('[data-meter="' + q.id + '"]');
    if (!bar) continue;
    const fraction = Math.max(0, remain / (q.expires - q.entered));
    bar.firstElementChild.style.transform = "scaleX(" + fraction + ")";
    bar.dataset.urgency = fraction < .25 ? "low" : fraction < .55 ? "mid" : "high";
    document.querySelector('[data-time="' + q.id + '"]').textContent = shortTime(remain);
  }
  $("arrival").textContent = game.closed ? "마감" : game.queue.length >= capacity ? "만석" :
    game.nextArrival === null ? "입장 마감" : "다음 입장 " + Math.max(1, Math.ceil((game.nextArrival - game.elapsed) / 1000)) + "초";
  if (game.kitchen?.finish != null) {
    const active = $("kitchen").querySelector(".step-button.active");
    active?.style.setProperty("--cooked", Math.min(100, 100 * (1 - (game.kitchen.finish - game.elapsed) / (1500 - 400 * game.speed))) + "%");
  }
}
const upgrades = [
  { key: "speed", name: "조리 장비", max: 2, base: 12000, icon: "stove" },
  { key: "quality", name: "메뉴 연구", max: 4, base: 15000, icon: "menu" },
  { key: "branches", name: "분점 열기", max: 5, base: 60000, icon: "store" }
];
const cost = u => u.base * (game[u.key] + (u.key === "branches" ? 0 : 1));
const row = (label, value) => '<div class="stat"><span>' + label + '</span><b>' + value + '</b></div>';
function renderManage() {
  const descriptions = [equipment[Math.min(2, game.speed + 1)] + ' · 단계마다 조리 시간 0.4초 단축', '모든 메뉴 판매가 500원 상승', '분점마다 정산 수익 5,000원 추가'];
  $("manage").innerHTML = '<h2>' + icon("upgrade") + '가게 관리</h2><div class="summary">' +
    row("운영 중인 매장", game.branches + "곳") + row("보유 자금", money(game.balance)) + '</div><h3>가게 개선</h3>' +
    upgrades.map((u, i) => {
      const max = game[u.key] >= u.max;
      return '<div class="item"><div class="upgrade-art">' + (i === 0 ? '<img src="' + art("stove", Math.min(2, game.speed + 1)) + '" alt="">' : icon(u.icon)) +
        '</div><div class="item-copy"><b>' + u.name + ' <em>Lv.' + game[u.key] + '</em></b><small>' + descriptions[i] +
        '</small></div><button class="buy" data-buy="' + u.key + '" ' + (max || game.kitchen || game.balance < cost(u) ? "disabled" : "") + '>' +
        (max ? "개선 완료" : money(cost(u))) + '</button></div>';
    }).join("") + (game.kitchen ? '<p>조리 중인 주문을 마치면 개선할 수 있어요.</p>' : '');
}
function renderJournal() {
  $("journal").innerHTML = '<h2>' + icon("book") + '영업 일지</h2><h3>' + game.day + '일차 장부</h3><div class="summary">' +
    row("방문한 손님", game.arrived + "명") + row("판매 완료", game.served + "건") + row("시간 초과", game.missed + "건") +
    row("오늘 매출", money(game.sales)) + row("누적 판매", game.total + "건") + '</div><h3>지난 영업</h3>' +
    (game.history.length ? game.history.slice().reverse().map(d => '<div class="item"><div class="item-copy"><b>' + d.day + '일차</b><small>판매 ' +
      d.served + '건 · 시간 초과 ' + d.missed + '건 · 분점 수익 ' + money(d.bonus) + '</small></div><strong>' + money(d.sales + d.bonus) + '</strong></div>').join("")
      : '<p>하루를 정산하면 영업 기록이 남아요.</p>');
}
function menuTiles() {
  return menus.map((m, i) => '<button class="menu-tile" data-menu="' + i + '" aria-pressed="' + (game.selected === i) + '">' +
    dish(i) + '<span>' + m.name + '</span><small>' + money(salePrice(game, i)) + '</small></button>').join("");
}
function render() {
  $("day").textContent = game.day + "일차";
  const minutes = 18 * 60 + (game.served + game.missed) * 30;
  $("time").textContent = Math.floor(minutes / 60) + ":" + String(minutes % 60).padStart(2, "0");
  $("served").textContent = game.served + " / " + (game.closed ? game.arrived : dailyOrders);
  $("balance").textContent = money(game.balance);
  $("sound").title = game.sound ? "효과음 끄기" : "효과음 켜기";
  $("sound").setAttribute("aria-label", $("sound").title);
  paint($("sound"), icon(game.sound ? "sound" : "muted"));
  if (page === "manage") { renderManage(); return; }
  if (page === "journal") { renderJournal(); return; }
  renderScene(); renderQueue(); renderKitchen();
  paint($("menu-shelf"), menuTiles());
  refreshTimers();
}

function sync() {
  const now = performance.now(), delta = now - lastFrame;
  lastFrame = now;
  if (!running || game.closed) return;
  const events = advance(game, delta);
  if (events.length) {
    save(); render();
    const left = events.filter(e => e.type === "left");
    if (left.length) notify(guests[left[0].order.guest] + " 손님이 기다리다 떠났어요.");
    if (game.closed) settlement();
    else if (events.some(e => e.type === "prepared")) tone(640);
  } else {
    refreshTimers();
    if (now - lastSave > 3000) save();
  }
}
function setClock() {
  running = !document.hidden && page === "play" && !$("modal").open;
  lastFrame = performance.now();
}
function changePage(next) {
  sync(); page = next;
  for (const key of ["play", "manage", "journal"]) $(key).hidden = key !== next;
  document.querySelectorAll("nav button").forEach(b => {
    if (b.dataset.page === next) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
  });
  setClock(); save(); render(); window.scrollTo(0, 0);
}
function dialog(title, html, kind = "") {
  $("dialog-title").textContent = title;
  $("dialog-body").innerHTML = html;
  $("modal").dataset.kind = kind;
  if (!$("modal").open) $("modal").showModal();
  setClock();
}
function settlement() {
  dialog(game.day + "일차 영업 마감", '<div class="summary">' + row("판매한 메뉴", game.served + "개") +
    row("시간 초과", game.missed + "건") + row("오늘 매출", money(game.sales)) + row("분점 수익", money(branchBonus(game))) +
    '</div><button class="primary" id="next-day">다음 날 영업 시작 ' + icon("chevron") + '</button>');
  $("next-day").onclick = () => { if (!game.closed) return; settleDay(game); save(); $("modal").close(); render(); notify(game.day + "일차 영업을 시작해요."); };
}
function cookbook(selected = game.selected) {
  const m = menus[selected];
  dialog("메뉴판", '<div class="book-grid">' + menuTiles() + '</div><div class="book-detail"><b>' + m.name + '</b><ol>' +
    m.steps.map(s => '<li>' + s + '</li>').join("") + '</ol></div><button class="primary" id="select-menu" ' +
    (game.kitchen || !game.queue.length ? "disabled" : "") + '>' + (game.kitchen ? "주문 조리 중" : !game.queue.length ? "주문 대기 중" : "이 메뉴 선택") + '</button>', "book");
  for (const b of $("dialog-body").querySelectorAll("[data-menu]")) {
    b.setAttribute("aria-pressed", String(+b.dataset.menu === selected));
    b.onclick = () => cookbook(+b.dataset.menu);
  }
  $("select-menu").onclick = () => { game.selected = selected; save(); $("modal").close(); render(); tone(420); };
}
function toggleSound() { game.sound = !game.sound; save(); render(); tone(640); }
function settings() {
  dialog("설정", '<div class="stat"><span>효과음</span><button id="toggle-audio" class="buy">' + (game.sound ? "켜짐" : "꺼짐") +
    '</button></div><h3>영업 방법</h3><p>하루에 손님 9명이 찾아와요. 가장 먼저 주문한 손님의 메뉴를 레시피 순서대로 눌러 조리하고, 시간이 다 되기 전에 건네세요.</p><p>성미 급한 손님은 ' +
    tempers.hasty.seconds + '초, 보통 손님은 ' + tempers.regular.seconds + '초, 느긋한 손님은 ' + tempers.easy.seconds +
    '초 동안 기다려요. 메뉴판이나 다른 화면을 열면 영업 시간이 잠시 멈춰요.</p><button id="reset" class="secondary">처음부터 시작</button>');
  $("toggle-audio").onclick = () => { toggleSound(); settings(); };
  $("reset").onclick = () => {
    dialog("처음부터 시작할까요?", '<p>가게 자금과 영업 기록을 지우고 1일차부터 시작합니다.</p><button id="cancel-reset" class="primary">계속 플레이</button><button id="confirm-reset" class="secondary">기록 지우고 새로 시작</button>');
    $("cancel-reset").onclick = () => $("modal").close();
    $("confirm-reset").onclick = () => { game = fresh(); save(); $("modal").close(); changePage("play"); };
  };
}
$("kitchen").addEventListener("click", e => {
  const button = e.target.closest("button");
  if (!button || button.disabled) return;
  sync();
  if (button.hasAttribute("data-settle")) { if (game.closed) settlement(); return; }
  const head = game.queue[0];
  if (!head) return;
  if (button.hasAttribute("data-serve")) {
    const amount = serve(game, +button.dataset.serve);
    if (!amount) return;
    tone(880); notify("판매 완료! +" + money(amount)); save(); render();
    if (game.closed) settlement();
  } else if (+button.dataset.ticket === head.id) {
    if (game.selected !== head.menu) { notify("첫 손님이 주문한 메뉴는 " + menus[head.menu].name + "이에요."); return; }
    if (!prepareStep(game, head.id, +button.dataset.step)) {
      notify("먼저 ‘" + menus[head.menu].steps[game.kitchen?.step ?? 0] + "’ 단계를 진행하세요."); return;
    }
    tone(410); save(); render();
  }
});
$("menu-shelf").onclick = e => {
  const btn = e.target.closest("[data-menu]");
  if (btn) { sync(); cookbook(+btn.dataset.menu); }
};
$("manage").onclick = e => {
  const btn = e.target.closest("[data-buy]");
  if (!btn || btn.disabled) return;
  const u = upgrades.find(v => v.key === btn.dataset.buy);
  if (!u || game[u.key] >= u.max || game.kitchen || game.balance < cost(u)) return;
  game.balance -= cost(u); game[u.key]++; save(); render(); tone(750);
  notify(u.key === "speed" ? equipment[game.speed] + " 설치 완료!" : u.name + " 완료!");
};
document.querySelectorAll("i[data-icon]").forEach(el => el.innerHTML = icon(el.dataset.icon));
document.querySelectorAll("nav button").forEach(b => b.onclick = () => changePage(b.dataset.page));
$("cookbook").onclick = () => { sync(); cookbook(); };
$("settings").onclick = () => { sync(); settings(); };
$("sound").onclick = toggleSound;
$("dismiss").onclick = () => $("modal").close();
$("modal").onclick = e => { if (e.target === $("modal")) $("modal").close(); };
$("modal").addEventListener("close", setClock);
document.addEventListener("visibilitychange", () => {
  if (document.hidden && running) { sync(); save(); }
  setClock();
});
window.addEventListener("pagehide", () => { if (running) { sync(); save(); } running = false; });
window.addEventListener("pageshow", setClock);
window.addEventListener("storage", e => {
  if (e.key !== storageKey) return;
  game = load();
  if ($("modal").open) $("modal").close();
  setClock(); render();
});
save(); render(); setInterval(sync, 100);
