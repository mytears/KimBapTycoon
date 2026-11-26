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
  sun: "M16 12a4 4 0 1 1-8 0 4 4 0 1 1 8 0z M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l-2-2",
  sunrise: "M2 16h20M5 20h14M7 16a5 5 0 0 1 10 0M12 9V2m-3 3 3-3 3 3M3 10l2 1m14 0 2-1",
  sunset: "M2 16h20M5 20h14M7 16a5 5 0 0 1 10 0M12 2v7m-3-3 3 3 3-3M3 10l2 1m14 0 2-1",
  ticket: "M4 5h16v5a2 2 0 0 0 0 4v5H4v-5a2 2 0 0 0 0-4z M14 6v2m0 3v2m0 3v2",
  coin: "M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0z M10 9h4v6h-4z",
  people: "M14 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M4 20v-2a6 6 0 0 1 12 0v2z M17 5a3 3 0 0 1 0 6m1 3q3 1 3 5",
  star: "M12 3l2.7 5.8 6.3.8-4.6 4.5 1.1 6.4-5.5-3.1-5.5 3.1 1.1-6.4L3 9.6l6.3-.8z",
  trophy: "M7 3h10v7a5 5 0 0 1-10 0z M7 5H3v2a4 4 0 0 0 4 4 M17 5h4v2a4 4 0 0 1-4 4 M12 15v5m-4 1h8",
  target: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0z M12 12h.01",
  pan: "M3 10h13v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z M16 11l5-5 M6 6q-2-2 0-4m4 4q-2-2 0-4",
  chevron: "M9 5l7 7-7 7", clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z M12 7v6h4",
  close: "M5 5l14 14M19 5L5 19", check: "M4 12l5 5L20 6", menu: "M5 3v7m3-7v7m3-7v7M5 8v1a3 3 0 0 0 6 0 M8 12v9 M19 3q-5 3-4 10h4m0-10v18",
  fire: "M13 3q1 5 4 7l1-3q6 10-2 14H8Q1 18 5 11l3-3q-1 5 2 5 3-4 3-10z",
  leaf: "M20 4Q3 3 4 14q2 8 10 3 4-3 6-13z M5 20l10-11",
  bell: "M3 16h18 M5 14a7 7 0 0 1 14 0z M12 5V3 M3 20h18",
  timer: "M12 5a8 8 0 1 1 0 16 8 8 0 0 1 0-16z M9 2h6m-3 0v3m0 4v4l3 2",
  stove: "M3 12h18v8H3z M6 12V9h12v3 M9 6q-2-2 0-4m5 4q-2-2 0-4 M6 16h1m4 0h1",
  heart: "M12 20s-7-4.4-9-8.7C1.5 8.1 3.7 5 6.9 5c1.9 0 3.5 1 5.1 2.7C13.6 6 15.2 5 17.1 5c3.2 0 5.4 3.1 3.9 6.3C19 15.6 12 20 12 20z",
  rain: "M7 14h10a4 4 0 0 0 .5-8A5.5 5.5 0 0 0 6.8 5 3.8 3.8 0 0 0 7 14z M8 17l-1 3 M12 17l-1 3 M16 17l-1 3",
  wind: "M3 8h11a2.5 2.5 0 1 0-2.5-2.5 M3 13h15a2.5 2.5 0 1 1-2.5 2.5 M3 18h8a2 2 0 1 1-2 2",
  flag: "M5 21V4m0 1h12l-2.5 4L17 13H5",
  spark: "M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2z"
};
function icon(key) {
  return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="' + icons[key] + '"/></svg>';
}
function load() {
  try { return restore(JSON.parse(localStorage.getItem(storageKey))); } catch { return fresh(); }
}
let game = load(), page = "play", noticeTimeout, audio;
let adPending = false;
let lastFrame = performance.now(), lastSave = lastFrame, running = !document.hidden;
const bgm = $("bgm");
bgm.volume = .65;
let musicActivated = false;
const markup = new WeakMap();
function paint(el, html) {
  if (markup.get(el) !== html) { el.innerHTML = html; markup.set(el, html); }
}
function positionNotice() {
  const notice = $("notice");
  if (!notice.classList.contains("visible")) return;
  notice.classList.toggle("in-play", page === "play");
  if (page !== "play") return;
  const main = document.querySelector("main").getBoundingClientRect();
  const queue = document.querySelector(".queue-panel").getBoundingClientRect();
  const storefrontBottom = document.querySelector("#play .storefront").getBoundingClientRect().bottom;
  const top = Math.max(0, main.top, storefrontBottom) + 8;
  const bottom = Math.min(innerHeight, main.bottom) - 8;

  notice.style.setProperty("--notice-left", queue.left + queue.width / 2 + "px");
  notice.style.setProperty("--notice-width", queue.width - 16 + "px");
  const height = notice.offsetHeight;
  const queueTop = Math.max(top, queue.top + 8);
  const queueBottom = Math.min(bottom, queue.bottom - 8);
  // If the queue has scrolled out of view, use the space just below the shop.
  const y = queueBottom - queueTop >= height ? (queueTop + queueBottom - height) / 2 : top;
  notice.style.setProperty("--notice-top", y + "px");
  notice.classList.toggle("offscreen", y + height > bottom);
}
function notify(message, variant = "") {
  const notice = $("notice");
  notice.textContent = message;
  notice.dataset.variant = variant;
  notice.classList.add("visible");
  positionNotice();
  clearTimeout(noticeTimeout);
  noticeTimeout = setTimeout(() => $("notice").classList.remove("visible"), 2800);
}
function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(game)); }
  catch { notify("진행 상황을 저장할 수 없어요."); }
  lastSave = performance.now();
}
function updateMusic() {
  if (!game.music || document.hidden) bgm.pause();
  else if (musicActivated && bgm.paused) bgm.play().catch(() => {});
}
function playNotes(notes) {
  if (!game.sound) return;
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    audio.resume().catch(() => {});
    const now = audio.currentTime;
    for (const [hz, offset, dur, type = "sine", vol = .1, glide = null] of notes) {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      const t = now + offset;
      osc.type = type;
      osc.frequency.setValueAtTime(hz, t);
      if (glide) osc.frequency.exponentialRampToValueAtTime(glide, t + dur);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(vol, t + Math.min(0.015, dur * 0.25));
      gain.gain.exponentialRampToValueAtTime(0.0008, t + dur);
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    }
  } catch {}
}
function sfx(kind) {
  const patterns = {
    place: [[360, 0, .08, "triangle", .09], [480, .055, .1, "triangle", .09]],
    step: [[440, 0, .08, "sine", .09], [554, .05, .09, "sine", .08]],
    prepared: [[660, 0, .09, "sine", .08], [880, .065, .13, "sine", .09]],
    "timing-hit": [[784, 0, .09, "triangle", .1], [988, .055, .09, "triangle", .1], [1318, .11, .16, "triangle", .11]],
    "timing-miss": [[270, 0, .1, "triangle", .09], [200, .07, .14, "triangle", .08]],
    serve: [[587, 0, .08, "triangle", .1], [880, .05, .1, "triangle", .1], [1175, .11, .18, "sine", .1]],
    fever: [[523, 0, .09, "triangle", .1], [659, .06, .09, "triangle", .1], [784, .12, .09, "triangle", .1], [1046, .18, .22, "triangle", .12]],
    burnt: [[195, 0, .16, "sawtooth", .07, 130], [140, .12, .22, "sawtooth", .06, 95]],
    arrival: [[1046, 0, .09, "sine", .05], [1318, .07, .14, "sine", .05]],
    upgrade: [[523, 0, .08, "triangle", .09], [659, .06, .09, "triangle", .09], [784, .12, .16, "triangle", .1]],
    celebrate: [[523, 0, .09, "triangle", .09], [659, .07, .09, "triangle", .09], [784, .14, .1, "triangle", .1], [1046, .21, .24, "sine", .11]],
    "rank-up": [[659, 0, .09, "sine", .09], [880, .07, .1, "sine", .09], [1175, .14, .2, "triangle", .1]],
    "staff-auto": [[523, 0, .07, "sine", .06], [659, .055, .09, "sine", .06]],
    error: [[230, 0, .1, "triangle", .08, 185]]
  };
  playNotes(patterns[kind] || [[560, 0, .12, "sine", .09]]);
}
function spawnFloat(text, variant = "gold", x = 42, y = 44, delay = 0) {
  const host = $("float-layer");
  if (!host || page !== "play") return;
  const el = document.createElement("span");
  el.className = "float-pop " + variant;
  el.textContent = text;
  el.style.left = x + "%";
  el.style.top = y + "%";
  if (delay) el.style.animationDelay = delay + "ms";
  host.append(el);
  const cleanup = () => el.remove();
  el.addEventListener("animationend", cleanup, { once: true });
  setTimeout(cleanup, 1700 + delay);
}
function stoveAnchorX(slot) {
  return game.stoveLevels.length === 2 ? (slot === 0 ? 73 : 84) : 78;
}
const dish = (index, cls = "") => '<img class="' + cls + '" src="' + art("dish", index) + '" alt="">';
const portrait = q => '<span class="portrait guest-' + q.guest + '"><img src="' + art("guest", q.guest) + '" alt=""></span>';
const temperament = q => '<span class="temper ' + q.temper + '">' + icon({ hasty: "fire", easy: "leaf", regular: "clock" }[q.temper]) + tempers[q.temper].name + '</span>';
const meter = q => '<div class="meter" data-meter="' + q.id + '"><span></span></div>';
const timer = q => '<span class="remaining" data-time="' + q.id + '"></span>';
const shortTime = ms => { const sec = Math.ceil(Math.max(0, ms) / 1000); return Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0"); };

function drawDecor(host, choice) {
  const title = achievements.find(a => a.id === choice.title);
  host.dataset.awning = choice.awning;
  host.dataset.sign = choice.sign;
  host.dataset.interior = game.interior;
  host.setAttribute("role", "img");
  host.setAttribute("aria-label", (choice.name || defaultName) + ", " + interiors[game.interior] + " 인테리어, " + shopStyles.awning.find(item => item.id === choice.awning).name + " 차양, " +
    shopStyles.sign.find(item => item.id === choice.sign).name + " 간판" + (title ? ", 칭호 " + title.title : ""));
  paint(host, (choice.awning === "red" ? "" : '<span class="awning-fabric"></span>') +
    '<span class="shop-lettering"><i>✦</i><b></b><i>✦</i></span>' +
    (game.interior ? '<span class="counter-finish"></span><span class="kitchen-wall"></span>' : '') +
    (title ? '<span class="shop-plaque">' + icon("trophy") + title.title + '</span>' : ""));
  host.querySelector(".shop-lettering b").textContent = choice.name;
}
const storefrontArt = part => "assets/art/" + part.image + ".webp";

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let ownerStation = -1, ownerDestination = null, ownerWalk = null;
reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches && ownerWalk) ownerWalk.finish();
});
function renderOwner(orders) {
  const owner = $("shop-owner");
  const busy = k => k && !k.burnt && k.finish != null;
  let slot = game.stations.findIndex(busy);
  // Finish tending the current burner before crossing to another active one.
  if (busy(game.stations[ownerStation])) slot = ownerStation;
  if (slot < 0) {
    // Between two manual recipe steps, wait beside the unfinished dish.
    const unfinished = (k, i) => k && !k.burnt && k.step < menus[orders[i].menu].steps.length;
    slot = unfinished(game.stations[ownerStation], ownerStation) ? ownerStation : game.stations.findIndex(unfinished);
  }
  if (game.closed) slot = -1;
  const stirring = busy(game.stations[slot]);
  owner.dataset.action = stirring ? "cook" : "rest";
  const atBoard = orders[slot]?.menu === 0;
  owner.setAttribute("aria-label", slot < 0 ? "주문을 기다리는 사장님" :
    (atBoard ? "김밥 조리대에서 " : (slot + 1) + "번 화구에서 ") + (stirring ? "요리하는 사장님" : "다음 조리 단계를 기다리는 사장님"));
  ownerStation = slot;
  const target = slot < 0 ? "var(--owner-home)" : "calc(var(" + (atBoard ? "--prep-board" : "--burner-" + (slot + 1)) + ") - 3.6%)";
  if (target === ownerDestination) return;

  const worldWidth = owner.offsetParent.clientWidth;
  const from = parseFloat(getComputedStyle(owner).left) * 100 / worldWidth;
  const firstRender = ownerDestination === null;
  ownerDestination = target;
  ownerWalk?.cancel();
  ownerWalk = null;
  delete owner.dataset.walk;
  owner.style.left = target;
  if (firstRender || game.closed || !worldWidth || reducedMotion.matches) return;
  const distance = parseFloat(getComputedStyle(owner).left) * 100 / worldWidth - from;
  if (Math.abs(distance) < .4) return;
  owner.dataset.walk = distance < 0 ? "left" : "right";
  ownerWalk = owner.animate([{ left: from + "%" }, { left: target }], {
    duration: Math.min(1050, 300 + Math.abs(distance) * 31), easing: "cubic-bezier(.38,.04,.28,1)"
  });
  ownerWalk.onfinish = () => { delete owner.dataset.walk; ownerWalk = null; };
  if (!running) ownerWalk.pause();
}

function renderScene() {
  drawDecor($("shop-decor"), game.decor);
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
    const fav = guestProfiles[q.guest].favorite === q.menu;
    el.title = (i + 1) + "번째 · " + (q.special ? "특별 손님 · " : "") + guests[q.guest] + " · " + menus[q.menu].name + (fav ? " (최애)" : "");
    el.classList.toggle("special", !!q.special);
    el.setAttribute("role", "img"); el.setAttribute("aria-label", el.title);
    paint(el.querySelector(".bubble"), i === 0 ? dish(q.menu) : String(i + 1));
  });
  const orders = game.stations.map(k => k && game.queue.find(q => q.id === k.ticket));
  const board = orders.some(q => q?.menu === 0) ? '<img class="prep-board" src="assets/art/board.webp" alt="김밥을 마는 도마">' : '';
  paint($("equipment"), board + game.stations.map((k, slot) => {
    const menu = orders[slot]?.menu;
    const vessel = menu === undefined || menu === 0 ? "" : [1, 2, 3, 5].includes(menu) ? "pot" : "pan";
    const heat = vessel && (k.burnt ? ' smoking' : k.finish != null ? ' cooking' : '');
    return '<div class="stove' + heat + '"><img src="' + art("stove", game.stoveLevels[slot]) + '" alt="' +
      (slot + 1) + '번 조리대 · ' + equipment[game.stoveLevels[slot]] + '">' +
      (vessel ? '<img class="cookware" src="assets/art/' + vessel + '.webp" alt="">' : '') + '</div>';
  }).join(""));
  const scene = $("scene");
  scene.dataset.stoves = game.stoveLevels.length;
  scene.dataset.weather = game.weather;
  scene.dataset.fever = isFever(game) ? "true" : "false";
  renderOwner(orders);
  $("staff-sprite").hidden = !game.staff || game.closed;
}

function showGuestReaction(ticket, stars) {
  const patron = $("patrons").querySelector('[data-id="' + ticket + '"]');
  if (!patron) return;
  const happy = stars >= 4;
  const label = (happy ? "만족" : "실망") + " · " + stars + "점";
  patron.classList.remove("first");
  patron.classList.add("leaving");
  patron.dataset.mood = happy ? "happy" : "sad";
  patron.setAttribute("aria-label", label);
  const bubble = patron.querySelector(".bubble");
  bubble.textContent = happy ? "😊" : "😞";
  bubble.title = label;
  $("departures").append(patron);
  patron.addEventListener("animationend", event => {
    if (event.animationName === "guest-exit") patron.remove();
  });
}

function orderTags(q) {
  const tags = [];
  const rank = guestRank(game.records.guestAffinity[q.guest] || 0);
  if (rank.level >= 1) tags.push('<span class="order-tag rank-tag">' + rank.name + '</span>');
  if (guestProfiles[q.guest].favorite === q.menu) tags.push('<span class="order-tag fav-tag">' + icon("heart") + '최애</span>');
  if (game.featuredMenu === q.menu) tags.push('<span class="order-tag feat-tag">추천</span>');
  if (weathers[game.weather]?.menus.includes(q.menu)) tags.push('<span class="order-tag weather-tag">인기</span>');
  return tags.length ? '<div class="order-tags">' + tags.join("") + '</div>' : '';
}

function renderQueue() {
  const head = game.queue[0];
  $("queue-count").textContent = game.queue.length + " / " + capacity + "명";
  paint($("current-order"), head ? '<div class="ticket' + (head.special ? ' special-ticket' : '') + '"><div class="ticket-top"><span class="first-label">' + icon(head.special ? "star" : "ticket") +
    (head.special ? '특별 손님' : '첫 주문') + '</span><span class="order-id">NO. ' + serial(head.id) + '</span></div><div class="ticket-main">' + portrait(head) +
    '<div class="customer"><small>' + guests[head.guest] + '</small><h3>' + menus[head.menu].name + '</h3>' + orderTags(head) + '</div>' +
    '<b class="ticket-price">' + money(salePrice(game, head.menu)) + '</b></div><div class="patience-line">' + temperament(head) +
    '<span class="deadline">' + icon("timer") + '남은 시간 ' + timer(head) + '</span></div>' + meter(head) + '</div>'
    : '<div class="empty-ticket">' + icon(game.closed ? "moon" : "store") +
    '<b>' + (game.closed ? "오늘 영업을 마쳤어요" : "다음 손님을 기다리는 중") + '</b></div>');
  paint($("waiting"), Array.from({ length: capacity - 1 }, (_, i) => {
    const q = game.queue[i + 1], rank = '<span class="rank">' + String(i + 2).padStart(2, "0") + '</span>';
    if (!q) return '<li class="waiting-order vacant" aria-hidden="true">' + rank + '<span>빈 자리</span></li>';
    const fav = guestProfiles[q.guest].favorite === q.menu ? ' ♥' : '';
    return '<li class="waiting-order' + (q.special ? ' special' : '') + '">' + rank + portrait(q) +
    '<div class="queued-dish"><b>' + menus[q.menu].name + fav + '</b><small>' + (q.special ? '★ 특별 손님 · ' : '') + guests[q.guest] + '</small></div>' +
    '<div class="queued-time">' + temperament(q) + timer(q) + meter(q) + '</div></li>';
  }).join(""));
}

function timingButton(station, menu) {
  const label = station.timingResult === "missed" ? "일반" : "노란 구간";
  const to = Math.min(100, menu.timing.from + timingWindowFor(game));
  return '<button class="step-button active timing-button" data-timing="' + station.ticket + '" ' +
    (station.timingResult ? 'disabled' : '') + ' style="--timing-from:' + menu.timing.from + '%;--timing-to:' +
    to + '%"><strong>' + menu.timing.action + '</strong><span class="timing-label">' +
    label + '</span><span class="timing-track" aria-hidden="true"></span></button>';
}

function stationMarkup(k, slot) {
  const title = (slot + 1) + "번 조리대";
  if (!k) {
    const available = pendingOrders(game).length > 0;
    const autoHint = game.staff >= 3 && available ? ' · 직원 준비 중' : '';
    return '<button class="empty-station" data-choose="' + slot + '" aria-label="' + title + ' 메뉴 선택" ' +
      (available ? '' : 'disabled') + '><span class="station-title">' + title + autoHint + '</span><img src="' +
      art("stove", game.stoveLevels[slot]) + '" alt=""><b>' + (available ? '메뉴 선택 ' + icon("chevron") : '주문 대기 중') + '</b></button>';
  }
  const order = game.queue.find(q => q.id === k.ticket), menu = menus[order.menu];
  const step = k.step, busy = k.finish != null, ready = k.burnt || step >= menu.steps.length;
  const first = game.queue[0] === order;
  const controls = ready ? '<button class="primary ready" data-serve="' + order.id + '" ' + (first ? '' : 'disabled') + '>' + icon("bell") + '손님에게 건네기</button>'
    : '<div class="step-controls" aria-label="조리 동작">' + menu.steps.map((name, i) =>
      i === step && timingProgress(game, k) !== null ? timingButton(k, menu) :
        '<button class="step-button ' + (i === step ? 'active' : '') + '" data-ticket="' + order.id + '" data-step="' + i +
      '" ' + (i < step || busy ? "disabled" : "") + '><span class="step-num">' + (i < step ? icon("check") : "0" + (i + 1)) + '</span><b>' +
      name + '</b>' + (i === step ? icon(busy ? "timer" : "chevron") : "") + '</button>').join("") + '</div>';
  const heat = k.burnt ? '평점 1점 · 0원' : '<span class="heat" data-heat="' + k.ticket + '">타기까지 <b></b></span>';
  const actions = k.burnt
    ? '<div class="burnt-actions">' + controls + '<button class="remake" data-remake="' + order.id + '">다시 조리하기</button></div>'
    : controls;
  const timingHit = !k.burnt && k.timingResult === "hit";
  const stageLabel = k.burnt ? "음식이 탔어요" : timingHit ? icon("check") + "타이밍 성공 (팁 +" + money(dishTimingTip(game, order.menu)) + ")" :
    ready ? "조리 완료" : (step + 1) + ' / ' + menu.steps.length + '단계';
  const nextStepClass = timingHit && step === 2 && !busy ? ' timing-complete' : '';
  return '<section class="loaded-station' + (k.burnt ? ' burnt' : '') + nextStepClass + '" aria-label="' + title + '"><div class="station-title">' + title + '<small>NO. ' +
    serial(order.id) + '</small></div><div class="recipe"><div class="plated">' + dish(order.menu) + '</div><div><small>' + guests[order.guest] + '</small><h3>' +
    menu.name + '</h3><span class="stage-label' + (timingHit ? ' timing-success' : '') + '">' + stageLabel +
    '</span></div></div><div class="prep-heading"><h3>' + (ready ? (first ? "서빙 가능" : "앞 주문 대기") : busy ? "조리 중…" : "조리 순서") +
    '</h3><small>' + heat + '</small></div>' + actions + '</section>';
}
function renderKitchen() {
  const panel = document.querySelector(".kitchen-panel");
  panel?.classList.toggle("fever-active", isFever(game));
  if (game.closed) {
    paint($("kitchen"), '<div class="empty-kitchen">' + icon("moon") + '<h3>오늘의 조리 완료</h3></div>' +
      '<button class="primary" data-settle>오늘의 정산 ' + icon("chevron") + '</button>');
    return;
  }
  paint($("kitchen"), '<div class="stations" data-count="' + game.stations.length + '">' +
    game.stations.map(() => '<div class="station-slot"></div>').join("") + '</div>');
  $("kitchen").querySelectorAll(".station-slot").forEach((el, slot) => paint(el, stationMarkup(game.stations[slot], slot)));
}

function refreshSceneBadges() {
  const host = $("scene-badges");
  if (!host) return;
  const fever = isFever(game);
  const feat = menus[game.featuredMenu];
  const badges = [];
  if (feat) {
    const synergy = weathers[game.weather]?.menus.includes(game.featuredMenu);
    badges.push('<span class="scene-badge featured' + (synergy ? ' synergy' : '') + '" title="오늘의 추천 메뉴 · 판매가 +' + money(featuredPriceBonus) + '">' +
      icon("star") + '추천 ' + feat.name + '</span>');
  }
  if (fever) {
    const sec = Math.max(1, Math.ceil((game.feverUntil - game.elapsed) / 1000));
    badges.push('<span class="scene-badge fever">' + icon("fire") + '피버 ' + sec + '초 · ' + game.combo + '콤보</span>');
  } else if (game.combo >= 2) {
    badges.push('<span class="scene-badge combo">' + icon("spark") + game.combo + ' 콤보</span>');
  }
  paint(host, badges.join(""));
}

function refreshClock() {
  const minutes = clockMinutes(game), part = daypartAt(minutes);
  const time = String(Math.floor(minutes / 60)).padStart(2, "0") + ":" + String(minutes % 60).padStart(2, "0");
  if ($("time").textContent !== time) $("time").textContent = time;
  const image = $("shop-image"), src = storefrontArt(part);
  if (image.getAttribute("src") !== src) image.src = src;
  const scene = $("scene");
  if (scene.dataset.period !== part.image) {
    scene.dataset.period = part.image;
    scene.style.setProperty("--shop-art", 'url("' + src + '")');
  }
  scene.dataset.weather = game.weather;
  scene.dataset.fever = isFever(game) ? "true" : "false";
  image.alt = part.name + "의 " + game.decor.name + " 가게와 골목";
  paint($("shift-icon"), icon(part.icon));
  const w = weathers[game.weather] || weathers.clear;
  const periodHtml = icon(w.icon) + '<span>' + w.name + ' · ' + part.name + ' · ' + crowds[game.crowd].name + '</span>';
  paint($("scene-period"), periodHtml);
  $("scene-period").title = w.name + ": " + w.desc;
  refreshSceneBadges();
}
function refreshTimers() {
  refreshClock();
  refreshPickerOrders();
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
  for (const [slot, k] of game.stations.entries()) {
    if (k && !k.burnt) {
      const heat = $("kitchen").querySelector('[data-heat="' + k.ticket + '"]');
      if (heat) {
        const left = Math.max(0, k.burnAt - game.elapsed);
        heat.firstElementChild.textContent = (Math.ceil(left / 100) / 10).toFixed(1) + "초";
        heat.classList.toggle("urgent", left <= 3000);
      }
    }
    if (k?.finish == null) continue;
    const order = game.queue.find(q => q.id === k.ticket);
    const timing = $("kitchen").querySelector('[data-timing="' + k.ticket + '"]');
    if (timing && order) {
      const progress = timingProgress(game, k);
      timing.style.setProperty("--timing-progress", progress + "%");
      if (!timing.disabled) {
        const inWindow = hitTimingWindow(order.menu, progress, timingWindowFor(game));
        const label = inWindow ? "지금!" : progress > menus[order.menu].timing.from ? "지났어요" : "노란 구간";
        timing.classList.toggle("in-window", inWindow);
        const text = timing.querySelector(".timing-label");
        if (text.textContent !== label) text.textContent = label;
      }
      continue;
    }
    const active = $("kitchen").querySelector('.step-button.active[data-ticket="' + k.ticket + '"]');
    if (active && order) {
      const dur = stepDuration(game, slot, order.menu);
      active.style.setProperty("--cooked", Math.min(100, Math.max(0, 100 * (1 - (k.finish - game.elapsed) / dur))) + "%");
    }
  }
}
const row = (label, value) => '<div class="stat"><span>' + label + '</span><b>' + value + '</b></div>';
const ratingText = s => s.reviewCount ? (s.reviewStars / s.reviewCount).toFixed(1) + " / 5" : "평가 없음";
const goalProgressText = goal => goal.progress + "/" + dailyGoals[goal.id].target;
function goalStats(s) {
  if (!s.goal) return "";
  const title = dailyGoals[s.goal.id].name + " " + goalProgressText(s.goal);
  const reward = goalReward(s.goal);
  return row("오늘 목표", title) + row("목표 보상", reward ? money(reward) : s.closed ? "미달성" : "달성 시 " + money(dailyGoalReward));
}
function dayStats(s) {
  const w = weathers[s.weather] || weathers.clear;
  return row("오늘 날씨", w.name) + row("오늘 추천 메뉴", menus[s.featuredMenu]?.name || "—") +
    row("판매 완료", s.served + "건") + row("최고 콤보", (s.dayBestCombo || 0) + "콤보") +
    row("탄 음식 제공", s.burntServed + "건") +
    row("시간 초과", s.missed + "건") + row("마감 미제공", s.unservedAtClose + "건") +
    row("오늘 평점", ratingText(s) + " · " + s.reviewCount + "건") + row("오늘 매출", money(s.sales));
}
function staffLevelDesc(level) {
  if (level === 0) return 'Lv.1 채용 · 모든 조리대 단계당 -0.5초 단축';
  if (level === 1) return 'Lv.2 불 조절 · 음식 타기 +3초 · 타이밍 구간 +12%';
  if (level === 2) return 'Lv.3 자동 밑준비 · 빈 화구 1.5초 후 첫 주문 자동 시작';
  return '최고 숙련 · 단계 -0.5초 · 보온 +3초 · 구간 +12% · 자동 밑준비';
}
function renderManage() {
  const busy = game.stations.some(Boolean);
  const stoves = game.stoveLevels.map((level, slot) => {
    const max = level === equipment.length - 1, cost = stoveUpgradeCost(level);
    return '<div class="item"><div class="upgrade-art"><img src="' + art("stove", level) + '" alt=""></div>' +
      '<div class="item-copy"><b>' + (slot + 1) + '번 · ' + equipment[level] + '</b><small>' + (level + 1) +
      '단계 · 화구 1개 · 기본 단계당 ' + stepDuration(game, slot) / 1000 + '초</small></div>' +
      '<button class="buy" data-stove="' + slot + '" ' + (max || game.stations[slot] || game.balance < cost ? 'disabled' : '') + '>' +
      (max ? '최고 단계' : game.stations[slot] ? '조리 중' : '개선 ' + money(cost)) + '</button></div>';
  }).join("");
  const descriptions = {
    interior: interiors[game.interior] + (game.interior < 2 ? ' → ' + interiors[game.interior + 1] : '') + ' · 카운터와 주방 벽 마감',
    quality: '레벨당 모든 메뉴 판매가 +' + money(menuPriceBoost),
    staff: staffLevelDesc(game.staff),
    promotion: '레벨당 손님 입장 간격 ' + promotionBoost + '% 단축',
    hospitality: '레벨당 정상 음식 평점 +' + hospitalityBonus / 10 + '점 · 최대 5점'
  };
  const immediateFeatured = !game.closed && game.arrived === 0 && game.served === 0;
  const activeFeatured = immediateFeatured ? game.featuredMenu : (game.nextFeaturedMenu ?? game.featuredMenu);
  const forecast = weathers[immediateFeatured ? game.weather : game.nextWeather] || weathers.clear;
  const featuredGrid = '<div class="featured-box"><div class="featured-head"><b>' +
    (immediateFeatured ? '오늘의 추천 메뉴 선택' : '내일의 추천 메뉴 예약') +
    '</b><small>' + (immediateFeatured ? '오늘 날씨: ' : '내일 예보: ') + forecast.name + ' (' + forecast.desc + ')</small></div>' +
    '<div class="featured-grid">' + menus.map((m, i) => {
      const selected = activeFeatured === i;
      const synergy = forecast.menus.includes(i);
      return '<button class="featured-tile' + (selected ? ' active' : '') + (synergy ? ' synergy' : '') +
        '" data-featured="' + i + '" aria-pressed="' + selected + '">' + dish(i) +
        '<span>' + m.name + '</span>' + (synergy ? '<em>시너지</em>' : '<small>+' + money(featuredPriceBonus) + '</small>') + '</button>';
    }).join("") + '</div></div>';
  $("manage").innerHTML = '<h2>' + icon("upgrade") + '가게 관리</h2><div class="summary">' +
    row("조리 직원", game.staff ? "Lv." + game.staff + " / 3" : "미채용") +
    row("오늘 추천 메뉴", menus[game.featuredMenu].name) +
    row("보유 자금", money(game.balance)) + '</div>' +
    '<button class="decor-entry" id="open-decor"><span class="upgrade-art">' + icon("store") +
    '</span><span class="item-copy"><b>가게 꾸미기</b><small>가게 이름 · 차양 · 간판 · 업적 칭호</small></span>' + icon("chevron") + '</button>' +
    '<h3>추천 메뉴</h3>' + featuredGrid + '<h3>가스레인지</h3>' + stoves +
    (game.stoveLevels.length < stoveLimit ? '<div class="item"><div class="item-copy"><b>2번 렌지 설치</b><small>1단계 단일 화구 · 두 주문 동시 조리</small></div><button class="buy" data-install ' +
      (game.balance < installCost ? 'disabled' : '') + '>설치 ' + money(installCost) + '</button></div>' : '') + '<h3>가게 개선</h3>' +
    upgrades.map(u => {
      const max = game[u.key] >= u.max;
      const level = ' <em>Lv.' + game[u.key] + '/' + u.max + '</em>';
      const done = u.key === "staff" ? "최고 숙련" : "개선 완료";
      const cost = upgradeCost(game, u);
      return '<div class="item"><div class="upgrade-art">' + icon(u.icon) +
        '</div><div class="item-copy"><b>' + u.name + level + '</b><small>' + descriptions[u.key] +
        '</small></div><button class="buy" data-buy="' + u.key + '" ' + (max || (busy && u.key !== "interior") || game.balance < cost ? "disabled" : "") + '>' +
        (max ? done : money(cost)) + '</button></div>';
    }).join("") + (busy ? '<p>조리 중인 주문을 마치면 개선할 수 있어요.</p>' : '');
}

function renderRegulars() {
  const visits = game.records.guestVisits;
  const affinities = game.records.guestAffinity;
  const metCount = visits.filter(v => v > 0).length;
  const regularCount = affinities.filter(a => guestRank(a).level >= 1).length;
  const familyCount = affinities.filter(a => guestRank(a).level >= 3).length;
  const cards = guestProfiles.map((profile, idx) => {
    const visited = (visits[idx] || 0) > 0;
    const aff = affinities[idx] || 0;
    const rank = guestRank(aff);
    const nextRank = affinityRanks.find(r => r.min > aff);
    const progressMax = nextRank ? nextRank.min : affinityRanks[affinityRanks.length - 1].min;
    const rankLabel = !visited ? "미방문" : rank.name;
    const perk = rank.level === 0 ? "만족 서빙으로 친밀도 쌓기" :
      rank.level === 1 ? "최애 메뉴 서빙 팁 +" + money(rank.tip) :
      rank.level === 2 ? "모든 메뉴 서빙 팁 +" + money(rank.tip) :
      "모든 메뉴 팁 +" + money(rank.tip) + " · 평점 +0.2";
    return '<li class="regular-card rank-' + (visited ? rank.level : 'none') + '">' +
      '<div class="regular-top"><span class="portrait guest-' + idx + '"><img src="' + art("guest", idx) + '" alt=""></span>' +
      '<div class="regular-meta"><div class="regular-title"><strong>' + profile.name + '</strong><span class="regular-badge">' + rankLabel + '</span></div>' +
      '<small class="regular-bio">' + profile.bio + '</small>' +
      '<div class="regular-fav">' + dish(profile.favorite) + '<span>최애: <b>' + menus[profile.favorite].name + '</b></span></div></div></div>' +
      '<div class="regular-progress"><progress value="' + Math.min(aff, progressMax) + '" max="' + progressMax + '"></progress>' +
      '<span>' + (nextRank ? '호감도 ' + aff + ' / ' + nextRank.min : '최고 친밀도 (' + aff + ')') + ' · 방문 ' + (visits[idx] || 0) + '회</span></div>' +
      '<p class="regular-perk">' + perk + '</p>' +
      '<blockquote class="regular-quote' + (rank.level >= 1 ? '' : ' locked') + '">' +
      (rank.level >= 1 ? '“' + profile.quote + '”' : '단골(호감도 3)이 되면 한마디가 해금돼요.') + '</blockquote></li>';
  }).join("");
  $("regulars").innerHTML = '<div class="achievement-head"><h2>' + icon("heart") + '단골 도감</h2><b>단골 ' +
    regularCount + ' / ' + guestProfiles.length + '명</b></div><div class="summary">' +
    row("만난 이웃", metCount + " / " + guestProfiles.length + "명") +
    row("단골 손님", regularCount + "명") +
    row("골목 가족", familyCount + "명") +
    row("역대 최고 콤보", (game.records.bestCombo || 0) + "콤보") +
    '</div><p>평점 4점 이상 서빙 시 호감도 +1, 손님의 최애 메뉴를 만족시키면 호감도가 +2 오릅니다.</p><ul class="regular-list">' + cards + '</ul>';
}

function openDecor() {
  const titles = earnedTitles(game);
  const choice = { name: game.decor.name, awning: game.decor.awning, sign: game.decor.sign, title: game.decor.title };
  const groupNames = { awning: "차양", sign: "간판" };
  const groups = Object.entries(shopStyles).map(([group, options]) =>
    '<fieldset class="decor-group"><legend>' + groupNames[group] + '</legend><div class="decor-options">' +
    options.map(item => '<label><input type="radio" name="' + group + '" value="' + item.id + '"' +
      (choice[group] === item.id ? " checked" : "") + '><span class="decor-option"><i class="swatch ' + item.id + '"></i><b>' +
      item.name + '</b><small>' + (game.decor.owned.includes(item.id) ? "보유" : money(item.cost)) +
      '</small></span></label>').join("") + '</div></fieldset>').join("");
  dialog("가게 꾸미기", '<div class="decor-preview"><div class="shop-decor" id="preview-decor"></div>' +
    '<div class="shop-owner" aria-hidden="true"><span class="owner-figure"></span></div><div class="counter-edge"></div></div>' +
    '<label class="title-select">가게 이름 (1~4글자)<input id="shop-name" type="text" autocomplete="off"></label>' + groups +
    '<label class="title-select">칭호 명패<select id="decor-title"><option value="">걸지 않기</option>' +
    titles.map(a => '<option value="' + a.id + '"' + (choice.title === a.id ? " selected" : "") + '>' + a.title + '</option>').join("") +
    '</select></label>' + (titles.length ? '' : '<p class="decor-hint">첫 주문을 판매하면 ‘첫 장사’ 명패를 걸 수 있어요.</p>') +
    '<div class="decor-wallet">보유 자금 <b>' + money(game.balance) + '</b></div><button class="primary" id="apply-decor"></button>', "decor");
  const preview = $("preview-decor"), apply = $("apply-decor");
  const part = daypartAt(clockMinutes(game));
  preview.parentElement.dataset.period = part.image;
  preview.parentElement.style.setProperty("--shop-art", 'url("' + storefrontArt(part) + '")');
  function updatePreview() {
    drawDecor(preview, choice);
    const cost = decorPrice(game, choice);
    const changed = Object.keys(choice).some(key => game.decor[key] !== choice[key]);
    apply.disabled = !changed || cost === null || cost > game.balance;
    apply.textContent = !shopName(choice.name) ? "이름을 1~4글자로 입력하세요" : !changed ? "현재 가게 모습" : cost > game.balance ? money(cost - game.balance) + " 부족" :
      cost ? money(cost) + "에 구매하고 적용" : "가게에 적용";
  }
  $("shop-name").value = choice.name;
  $("shop-name").oninput = e => { choice.name = e.target.value.trim().normalize("NFC"); updatePreview(); };
  for (const radio of $("dialog-body").querySelectorAll('input[type="radio"]')) {
    radio.onchange = () => { choice[radio.name] = radio.value; updatePreview(); };
  }
  $("decor-title").onchange = e => { choice.title = e.target.value; updatePreview(); };
  apply.onclick = () => {
    if (apply.disabled || !applyDecor(game, choice)) return;
    save(); render(); $("modal").close(); sfx("upgrade"); notify("가게 꾸미기를 적용했어요.");
    $("open-decor").focus();
  };
  updatePreview();
}
function renderJournal() {
  $("journal").innerHTML = '<h2>' + icon("book") + '영업 일지</h2><h3>' + game.day + '일차 장부</h3><div class="summary">' +
    row("방문한 손님", game.arrived + "명") + dayStats(game) + goalStats(game) +
    row("누적 판매", game.total + "건") + row("역대 최고 콤보", (game.records.bestCombo || 0) + "콤보") + '</div><h3>지난 영업</h3>' +
    (game.history.length ? game.history.slice().reverse().map(d => {
      const w = d.weather && weathers[d.weather] ? ' · ' + weathers[d.weather].name : '';
      const comboText = d.bestCombo ? ' · 최고 ' + d.bestCombo + '콤보' : '';
      return '<div class="item"><div class="item-copy"><b>' + d.day + '일차' + w + '</b><small>판매 ' +
        d.served + '건 · 시간 초과 ' + d.missed + '건' + comboText + (d.bonus ? ' · 분점 수익 ' + money(d.bonus) : '') + '</small>' +
        (d.reviewCount === undefined ? '' : '<small>평점 ' + ratingText(d) + ' (' + d.reviewCount + '건) · 탄 음식 ' + d.burntServed +
          '건 · 마감 미제공 ' + d.unservedAtClose + '건</small>') +
        (d.goalReward ? '<small>목표 보상 +' + money(d.goalReward) + '</small>' : '') +
        '</div><strong>' + money(d.sales + (d.bonus || 0) + (d.goalReward || 0)) + '</strong></div>';
    }).join("")
      : '<p>하루를 정산하면 영업 기록이 남아요.</p>');
}
function renderAchievements() {
  const counts = achievementCounts(game);
  const completed = achievements.filter(a => achievementProgress(counts, a) >= a.target).length;
  const renderCard = a => {
    const progress = Math.min(achievementProgress(counts, a), a.target);
    const unlocked = progress === a.target;
    return '<li class="achievement-card' + (unlocked ? ' unlocked' : '') + '"><span class="achievement-icon">' + icon(a.icon) +
      '</span><div><strong class="achievement-title">' + a.title + '</strong><p class="achievement-condition">' + a.name +
      '</p><progress value="' + progress + '" max="' + a.target + '" aria-label="' + a.name +
      ' 진행도"></progress></div><b>' + (unlocked ? icon("check") + " 달성" : progress + " / " + a.target) + '</b></li>';
  };
  $("achievements").innerHTML = '<div class="achievement-head"><h2>' + icon("trophy") + '업적</h2><b>' +
    completed + ' / ' + achievements.length + ' 달성</b></div><h3>가게 운영</h3><ul class="achievement-list">' +
    achievements.filter(a => a.menu === undefined).map(renderCard).join("") +
    '</ul><h3>메뉴별 판매</h3><ul class="achievement-list">' +
    achievements.filter(a => a.menu !== undefined).map(renderCard).join("") + '</ul>';
}
function menuTiles(selected = null) {
  return menus.map((m, i) => {
    const feat = game.featuredMenu === i;
    const hot = weathers[game.weather]?.menus.includes(i);
    const mark = feat ? ' ★추천' : hot ? ' ·인기' : '';
    return '<button class="menu-tile' + (feat ? ' featured' : '') + '" data-menu="' + i + '" aria-pressed="' + (selected === i) + '">' +
      dish(i) + '<span>' + m.name + '</span><small>' + money(salePrice(game, i)) + mark + '</small></button>';
  }).join("");
}
function render() {
  $("day").textContent = game.day + "일차";
  const goal = game.goal;
  const done = goalReward(goal) > 0;
  const goalBar = $("daily-goal");
  paint(goalBar, goal ? '<span class="goal-kicker">오늘 목표</span><span class="goal-name">' + dailyGoals[goal.id].name +
    '</span><b>' + (done ? '✓ ' : '') + goalProgressText(goal) + '</b>' : '');
  goalBar.classList.toggle("complete", done);
  goalBar.title = goal ? (done ? "목표 달성 · " : "달성 시 ") + "마감 보상 " + money(dailyGoalReward) : "";
  $("served").textContent = game.served + "건";
  const reviews = game.history.reduce((n, d) => n + (d.reviewCount || 0), game.reviewCount);
  const stars = game.history.reduce((n, d) => n + (d.reviewStars || 0), game.reviewStars);
  $("rating").textContent = reviews ? (stars / reviews).toFixed(1) : "—";
  $("rating").parentElement.title = "가게 평점 " + (reviews ? $("rating").textContent + " / 5 · " + reviews + "건" : "평가 없음");
  $("balance").textContent = money(game.balance);
  $("sound").title = game.sound ? "효과음 끄기" : "효과음 켜기";
  $("sound").setAttribute("aria-label", $("sound").title);
  paint($("sound"), icon(game.sound ? "sound" : "muted"));
  if (page === "manage") { renderManage(); return; }
  if (page === "regulars") { renderRegulars(); return; }
  if (page === "journal") { renderJournal(); return; }
  if (page === "achievements") { renderAchievements(); return; }
  renderScene(); renderQueue(); renderKitchen();
  refreshTimers();
  positionNotice();
}

function sync() {
  const now = performance.now(), delta = now - lastFrame;
  lastFrame = now;
  if (!running || game.closed) return;
  const events = advance(game, delta);
  if (events.length) {
    const left = events.filter(e => e.type === "left");
    for (const event of left) showGuestReaction(event.order.id, 1);
    save(); render();
    const burntEvent = events.find(e => e.type === "burnt");
    const autoEvent = events.find(e => e.type === "staff-auto");
    if (burntEvent) {
      sfx("burnt");
      const slot = game.stations.findIndex(k => k?.ticket === burntEvent.ticket);
      spawnFloat("음식이 탔어요!", "burnt", stoveAnchorX(slot < 0 ? 0 : slot), 42);
      notify("음식이 탔어요! 다시 조리하거나 손님에게 건넬 수 있어요.");
    } else if (left.length === 1) {
      sfx("error");
      spawnFloat("★1 시간 초과", "burnt", 41, 44);
      notify(guests[left[0].order.guest] + " 손님이 기다리다 떠났어요. ★ 1점");
    } else if (left.length > 1) {
      sfx("error");
      spawnFloat("손님 " + left.length + "명 퇴장", "burnt", 41, 44);
      notify("손님 " + left.length + "명이 기다리다 떠났어요. 각각 ★ 1점");
    } else if (autoEvent) {
      sfx("staff-auto");
      spawnFloat("직원 자동 준비!", "mint", stoveAnchorX(autoEvent.slot), 42);
      notify("직원이 " + menus[autoEvent.order.menu].name + " 1단계를 시작했어요.");
    } else if (events.some(e => e.type === "prepared")) {
      sfx("prepared");
    } else if (events.some(e => e.type === "arrival")) {
      sfx("arrival");
    }
    if (game.closed) settlement();
  } else {
    refreshTimers();
    if (now - lastSave > 3000) save();
  }
}
function setClock() {
  const modal = $("modal");
  running = !document.hidden && page === "play" && !game.celebration && !game.pendingTip &&
    (!modal.open || modal.dataset.kind === "picker");
  $("scene").toggleAttribute("data-paused", !running || game.closed);
  if (ownerWalk) {
    if (running) ownerWalk.play();
    else ownerWalk.pause();
  }
  lastFrame = performance.now();
}
function changePage(next) {
  sync(); page = next;
  document.querySelectorAll("nav button").forEach(b => {
    $(b.dataset.page).hidden = b.dataset.page !== next;
    if (b.dataset.page === next) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
  });
  setClock(); save(); render(); document.querySelector("main").scrollTop = 0; window.scrollTo(0, 0);
  positionNotice();
}
function dialog(title, html, kind = "") {
  $("dialog-title").textContent = title;
  $("dialog-body").innerHTML = html;
  $("modal").dataset.kind = kind;
  if (!$("modal").open) $("modal").showModal();
  setClock();
}
function showCelebration() {
  const pending = game.celebration;
  if (!pending || $("modal").open) return;
  const goal = dailyGoals[pending.goalId];
  const unlocked = achievements.filter(a => pending.unlocked.includes(a.id));
  const title = goal ? (unlocked.length ? "목표와 업적 달성!" : "오늘 목표 달성!") : "업적 달성!";
  const entries = (goal ? '<li>' + icon("target") + '<div><strong>' + goal.name + '</strong><small>마감 정산 보상 +' +
    money(dailyGoalReward) + '</small></div></li>' : '') + unlocked.map(a =>
    '<li>' + icon("trophy") + '<div><strong>' + a.title + '</strong><small class="achievement-condition">' + a.name +
    '</small></div></li>').join("");
  sfx("celebrate");
  dialog(title, '<ul class="celebration-list">' + entries + '</ul><p>확인할 때까지 영업이 멈춰요.</p>' +
    '<button class="primary" id="confirm-celebration">확인하고 계속하기</button>', "celebration");
  const confirm = $("confirm-celebration");
  confirm.onclick = () => $("modal").close();
  confirm.focus();
}
function showSpecialTip() {
  const pending = game.pendingTip;
  if (!pending || $("modal").open) return;
  const available = !!window.AndroidAds?.showRewardedAd;
  dialog("특별 손님의 팁", '<div class="special-reward">' + icon("star") + '<strong>팁 +' +
    money(pending.amount) + '</strong><span>' + guests[pending.guest] + ' 손님이 ' + menus[pending.menu].name +
    ' 음식값의 ' + specialTipMultiplier + '배를 팁으로 드려요.</span></div><p>광고를 끝까지 보면 팁을 받아요. 선택하는 동안 영업 시간은 멈춥니다.</p>' +
    '<button class="primary" id="watch-special-ad"' + (available ? '' : ' disabled') + '>광고 보고 팁 받기</button>' +
    (available ? '<p id="ad-status" role="status"></p>' : '<p>광고 시청은 Android 앱에서 이용할 수 있어요.</p>') +
    '<button class="secondary" id="skip-special-ad">취소하고 계속하기</button>', "special-tip");
  $("watch-special-ad").onclick = () => {
    if (adPending || !game.pendingTip) return;
    adPending = true;
    $("watch-special-ad").disabled = true;
    $("skip-special-ad").disabled = true;
    $("dismiss").disabled = true;
    $("ad-status").textContent = "광고를 준비하고 있어요…";
    try { window.AndroidAds.showRewardedAd(pending.ticket); }
    catch { window.onRewardedAdResult(pending.ticket, false, "unavailable"); }
  };
  $("skip-special-ad").onclick = () => $("modal").close();
  $("watch-special-ad").focus();
}
window.onRewardedAdResult = (ticket, rewarded, reason) => {
  if (!adPending || !game.pendingTip || game.pendingTip.ticket !== ticket) return;
  adPending = false;
  if (rewarded) {
    const amount = resolveSpecialTip(game, ticket, true);
    save();
    $("modal").close();
    render();
    sfx("celebrate");
    spawnFloat("특별 팁 +" + money(amount), "fever", 42, 36);
    notify("특별 손님 팁 +" + money(amount) + "을 받았어요!");
  } else if ($("modal").open && $("modal").dataset.kind === "special-tip") {
    $("watch-special-ad").disabled = false;
    $("skip-special-ad").disabled = false;
    $("dismiss").disabled = false;
    $("ad-status").textContent = reason === "unavailable" ? "광고를 불러오지 못했어요. 다시 시도하거나 취소하세요." :
      "광고 시청이 완료되지 않았어요. 다시 시도하거나 취소하세요.";
    $("watch-special-ad").focus();
  } else showSpecialTip();
  setClock();
};
function settlement() {
  const forecast = weathers[game.nextWeather] || weathers.clear;
  let chosen = game.nextFeaturedMenu ?? (forecast.menus[0] ?? game.featuredMenu);
  const pickerHtml = '<div class="forecast-card">' + icon(forecast.icon) + '<div><strong>내일 예보 · ' +
    forecast.name + '</strong><small>' + forecast.desc + '</small></div></div>' +
    '<h3>내일의 추천 메뉴 선택 (+' + money(featuredPriceBonus) + ')</h3><div class="featured-grid" id="settle-featured">' +
    menus.map((m, i) => {
      const synergy = forecast.menus.includes(i);
      return '<button type="button" class="featured-tile' + (chosen === i ? ' active' : '') + (synergy ? ' synergy' : '') +
        '" data-pick-featured="' + i + '" aria-pressed="' + (chosen === i) + '">' + dish(i) +
        '<span>' + m.name + '</span>' + (synergy ? '<em>시너지</em>' : '<small>+' + money(featuredPriceBonus) + '</small>') + '</button>';
    }).join("") + '</div>';
  dialog(game.day + "일차 영업 마감", '<div class="summary">' + row("방문한 손님", game.arrived + "명") +
    dayStats(game) + goalStats(game) + '</div>' + pickerHtml +
    '<button class="primary" id="next-day">다음 날 영업 시작 ' + icon("chevron") + '</button>', "settlement");
  $("settle-featured").onclick = e => {
    const btn = e.target.closest("[data-pick-featured]");
    if (!btn) return;
    chosen = +btn.dataset.pickFeatured;
    for (const tile of $("settle-featured").querySelectorAll("[data-pick-featured]")) {
      const active = +tile.dataset.pickFeatured === chosen;
      tile.classList.toggle("active", active);
      tile.setAttribute("aria-pressed", active);
    }
    sfx("step");
  };
  $("next-day").onclick = () => {
    if (!game.closed) return;
    settleDay(game, chosen);
    save(); $("modal").close(); render();
    sfx("upgrade");
    notify(game.day + "일차 영업 시작! " + weathers[game.weather].name + " · 추천 " + menus[game.featuredMenu].name);
  };
}
function cookbook(selected = 0) {
  const m = menus[selected];
  const stepSec = (stepDuration(game, 0, selected) / 1000).toFixed(2).replace(/\.?0+$/, "");
  const burnSec = (burnDuration(game, selected) / 1000).toFixed(1).replace(/\.0$/, "");
  const tipVal = dishTimingTip(game, selected);
  const badges = [];
  if (game.featuredMenu === selected) badges.push('<span class="order-tag feat-tag">오늘의 추천 +' + money(featuredPriceBonus) + '</span>');
  if (weathers[game.weather]?.menus.includes(selected)) badges.push('<span class="order-tag weather-tag">' + weathers[game.weather].name + ' +' + money(weathers[game.weather].priceBonus) + '</span>');
  const timingHint = '<p>특징: <b>' + m.trait + '</b> · 단계당 ' + stepSec + '초 · 타기까지 ' + burnSec + '초 · 타이밍 성공 팁 ' + money(tipVal) + '</p>' +
    '<p>두 번째 단계의 표시가 노란 구간에 오면 ‘' + m.timing.action + '’ 버튼을 누르세요. 성공하면 바로 3단계로 넘어가고, 서빙할 때 팁을 받아요.</p>';
  dialog("메뉴판", '<div class="book-grid">' + menuTiles(selected) + '</div><div class="book-detail"><div class="book-detail-head"><b>' +
    m.name + '</b>' + (badges.length ? '<div class="order-tags">' + badges.join("") + '</div>' : '') + '</div><ol>' +
    m.steps.map(s => '<li>' + s + '</li>').join("") + '</ol>' + timingHint + '</div>', "book");
  for (const b of $("dialog-body").querySelectorAll("[data-menu]")) {
    b.onclick = () => cookbook(+b.dataset.menu);
  }
}
function toggleSound() { game.sound = !game.sound; save(); render(); sfx("prepared"); }

function refreshPickerOrders() {
  if (!$("modal").open || $("modal").dataset.kind !== "picker") return;
  const orders = pendingOrders(game);
  const list = $("picker-orders");
  const html = orders.length ? orders.map(order => menus[order.menu].name +
    ' <small data-picker-time="' + order.id + '" aria-hidden="true"></small>').join(" · ") : "새 주문 대기 중";
  if (markup.get(list) !== html) {
    paint(list, html);
    const hint = $("picker-hint");
    hint.hidden = !orders.length;
    hint.textContent = "조리할 주문";
    $("dialog-body").querySelectorAll("[data-menu]").forEach(tile => { tile.disabled = !orders.length; });
  }
  for (const order of orders) {
    const timer = list.querySelector('[data-picker-time="' + order.id + '"]');
    const remaining = shortTime(order.expires - game.elapsed);
    if (timer.textContent !== remaining) timer.textContent = remaining;
  }
}

function chooseDish(slot) {
  if (game.stations[slot] !== null || !pendingOrders(game).length) return;
  dialog((slot + 1) + "번 조리대 · 메뉴 선택", '<p class="picker-orders"><span id="picker-hint" role="status">조리할 주문</span>' +
    '<b id="picker-orders" role="status"></b></p><div class="book-grid">' + menuTiles() + '</div>', "picker");
  refreshPickerOrders();
  $("dialog-body").querySelector(".book-grid").onclick = e => {
    const tile = e.target.closest("[data-menu]");
    if (!tile || tile.disabled) return;
    sync();
    if (!$("modal").open || $("modal").dataset.kind !== "picker") return;
    if (!placeDish(game, slot, +tile.dataset.menu)) {
      $("picker-hint").textContent = "주문을 확인하세요";
      sfx("error"); return;
    }
    save(); $("modal").close(); sfx("place"); render();
  };
}

function settings() {
  dialog("설정", '<div class="stat"><span>배경음악</span><button id="toggle-music" class="buy" aria-label="배경음악" aria-pressed="' +
    game.music + '">' + (game.music ? "켜짐" : "꺼짐") +
    '</button></div><div class="stat"><span>효과음</span><button id="toggle-audio" class="buy">' + (game.sound ? "켜짐" : "꺼짐") +
    '</button></div><h3>영업 방법</h3><p>오전 7시부터 밤 10시까지 영업해요. 하루는 플레이 시간 3분이고, 매일 날씨와 골목 소식에 따라 인기 메뉴와 보너스가 달라집니다.</p>' +
    '<p>마감 정산에서 내일 예보를 보고 <b>추천 메뉴</b>를 고르면 판매가 +500원 보너스를 받아요. 각 메뉴마다 조리 시간, 보온 시간, 타이밍 팁이 다릅니다.</p>' +
    '<p>별점 5점 또는 타이밍 성공을 이어가면 <b>연속 콤보</b>가 쌓이고, 3콤보부터 추가 팁, 5콤보마다 20초간 <b>피버 타임</b>(조리 속도↑ · 타이밍 팁 2배)이 발동해요.</p>' +
    '<p>21명 이웃마다 최애 메뉴가 있어요. 만족 서빙으로 친밀도를 높이면 <b>단골 도감</b> 대사와 추가 팁이 해금됩니다. 직원은 최대 Lv.3까지 성장해 보온 시간·타이밍 구간·자동 밑준비를 도와줘요.</p>' +
    '<p>가끔 특별 손님이 방문해요. 음식을 정상적으로 서빙한 뒤 광고를 끝까지 보면 음식값의 5배를 팁으로 받습니다.</p><button id="reset" class="secondary">처음부터 시작</button>');
  $("toggle-music").onclick = e => {
    game.music = !game.music;
    e.currentTarget.textContent = game.music ? "켜짐" : "꺼짐";
    e.currentTarget.setAttribute("aria-pressed", game.music);
    save(); updateMusic();
  };
  $("toggle-audio").onclick = () => { toggleSound(); settings(); };
  $("reset").onclick = () => {
    dialog("처음부터 시작할까요?", '<p>가게 자금과 영업 기록을 지우고 1일차부터 시작합니다.</p><button id="cancel-reset" class="primary">계속 플레이</button><button id="confirm-reset" class="secondary">기록 지우고 새로 시작</button>');
    $("cancel-reset").onclick = () => $("modal").close();
    $("confirm-reset").onclick = () => { game = fresh(); save(); $("modal").close(); changePage("play"); updateMusic(); };
  };
}
$("kitchen").addEventListener("click", e => {
  const button = e.target.closest("button");
  if (!button || button.disabled) return;
  sync();
  if (button.hasAttribute("data-settle")) { if (game.closed) settlement(); return; }
  if (button.hasAttribute("data-choose")) { chooseDish(+button.dataset.choose); return; }
  if (button.hasAttribute("data-remake")) {
    if (remakeDish(game, +button.dataset.remake)) { save(); render(); sfx("place"); }
    return;
  }
  if (button.hasAttribute("data-timing")) {
    const ticket = +button.dataset.timing;
    const slot = game.stations.findIndex(k => k?.ticket === ticket);
    const order = game.queue.find(q => q.id === ticket);
    const result = tryTiming(game, ticket);
    if (!result) return;
    save(); render();
    if (result === "hit") {
      sfx("timing-hit");
      const bonus = order ? dishTimingTip(game, order.menu) : timingTip;
      spawnFloat("완벽! +" + money(bonus), "mint", stoveAnchorX(slot < 0 ? 0 : slot), 42);
      notify("타이밍 성공! 3단계로 넘어갔어요.", "timing-success");
    } else {
      sfx("timing-miss");
      notify("타이밍을 놓쳤어요. 일반 메뉴로 완성돼요.");
    }
    return;
  }
  if (button.hasAttribute("data-serve")) {
    const result = serve(game, +button.dataset.serve);
    if (!result) return;
    showGuestReaction(+button.dataset.serve, result.stars);
    save(); render();
    if (result.burnt) {
      sfx("burnt");
      spawnFloat("탄 음식 ★1", "burnt", 41, 44);
    } else {
      sfx(result.feverTriggered ? "fever" : result.rankUp ? "rank-up" : "serve");
      spawnFloat("+" + money(result.amount), "gold", 41, 44, 0);
      if (result.tip > 0) spawnFloat("TIP +" + money(result.tip), "mint", 45, 34, 120);
      if (result.feverTriggered) spawnFloat("🔥 피버 타임!", "fever", 54, 24, 200);
      else if (result.combo >= 3) spawnFloat(result.combo + " COMBO!", "coral", 36, 32, 200);
      if (result.rankUp) spawnFloat("♥ " + result.rankUp.name + " 달성!", "heart", 48, 22, 280);
      else if (result.favorite && result.stars >= 4) spawnFloat("♥ 최애 만족!", "heart", 35, 24, 260);
    }
    const payout = result.burnt ? "탄 음식 0원" : "+" + money(result.amount);
    const extras = [];
    if (result.tip) extras.push("팁 " + money(result.tip));
    if (result.combo >= 3) extras.push(result.combo + "콤보");
    if (result.feverTriggered) extras.push("피버 발동!");
    if (result.rankUp) extras.push(guests[result.guest] + " " + result.rankUp.name + " 승급!");
    const suffix = extras.length ? " (" + extras.join(" · ") + ")" : "";
    notify(guests[result.guest] + " · " + result.stars + "점 · " + payout + suffix, result.feverTriggered ? "timing-success" : "");
    showSpecialTip(); showCelebration();
  } else {
    const ticket = +button.dataset.ticket, order = game.queue.find(q => q.id === ticket);
    const k = game.stations.find(k => k?.ticket === ticket);
    if (!k || !order) return;
    if (!prepareStep(game, ticket, +button.dataset.step)) {
      const next = menus[order.menu].steps[k.step];
      if (next) notify("먼저 ‘" + next + "’ 단계를 진행하세요.");
      sfx("error");
      return;
    }
    sfx("step"); save(); render();
  }
});
$("manage").onclick = e => {
  if (e.target.closest("#open-decor")) { openDecor(); return; }
  const feat = e.target.closest("[data-featured]");
  if (feat) {
    const menuIndex = +feat.dataset.featured;
    const immediate = !game.closed && game.arrived === 0 && game.served === 0;
    if (setFeaturedMenu(game, menuIndex, !immediate)) {
      save(); render(); sfx("step");
      notify(immediate
        ? "오늘의 추천 메뉴를 " + menus[menuIndex].name + "(으)로 바꿨어요."
        : "내일의 추천 메뉴를 " + menus[menuIndex].name + "(으)로 예약했어요.");
    }
    return;
  }
  const stove = e.target.closest("[data-stove], [data-install]");
  if (stove && !stove.disabled) {
    const install = stove.hasAttribute("data-install");
    if (install ? installStove(game) : upgradeStove(game, Number(stove.dataset.stove))) {
      save(); render(); sfx("upgrade"); notify(install ? "두 번째 렌지를 설치했어요." : "렌지를 한 단계 개선했어요.");
    }
    return;
  }
  const btn = e.target.closest("[data-buy]");
  if (!btn || btn.disabled) return;
  const u = upgrades.find(v => v.key === btn.dataset.buy);
  if (!u || !buyUpgrade(game, u.key)) return;
  save(); render(); sfx("upgrade");
  if (u.key === "staff") {
    const msgs = [
      "",
      "직원을 채용했어요! 모든 조리 단계가 0.5초 짧아져요.",
      "직원 불 조절 숙련! 음식 보온 +3초 · 타이밍 구간이 넓어져요.",
      "직원 자동 밑준비 습득! 빈 화구에서 첫 주문을 자동으로 시작해요."
    ];
    notify(msgs[game.staff] || "직원 숙련도가 올랐어요!");
  } else if (u.key === "interior") notify(interiors[game.interior] + " 인테리어를 완성했어요!");
  else notify(u.name + " 개선 완료!");
};
document.querySelectorAll("i[data-icon]").forEach(el => el.innerHTML = icon(el.dataset.icon));
document.querySelectorAll("nav button").forEach(b => b.onclick = () => changePage(b.dataset.page));
$("cookbook").onclick = () => { sync(); cookbook(); };
$("settings").onclick = () => { sync(); settings(); };
$("sound").onclick = toggleSound;
$("dismiss").onclick = () => { if (!adPending) $("modal").close(); };
$("modal").onclick = e => { if (e.target === $("modal") && !adPending) $("modal").close(); };
$("modal").addEventListener("cancel", e => { if (adPending) e.preventDefault(); });
$("modal").addEventListener("close", () => {
  const modal = $("modal");
  if (modal.open) return;
  if (modal.dataset.kind === "special-tip" && game.pendingTip && !adPending) {
    resolveSpecialTip(game, game.pendingTip.ticket, false);
    save();
  }
  if (modal.dataset.kind === "celebration" && game.celebration) {
    game.celebration = null;
    save();
  }
  showSpecialTip(); showCelebration();
  setClock();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && running) { sync(); save(); }
  setClock();
  updateMusic();
});
document.addEventListener("click", e => {
  if (!e.isTrusted) return;
  musicActivated = true;
  updateMusic();
});
window.addEventListener("pagehide", () => {
  if (running) { sync(); save(); }
  running = false;
  bgm.pause();
});
window.addEventListener("pageshow", () => { setClock(); updateMusic(); });
window.addEventListener("scroll", positionNotice, { capture: true, passive: true });
window.addEventListener("resize", positionNotice);
window.addEventListener("storage", e => {
  if (e.key !== storageKey) return;
  game = load();
  if ($("modal").open) {
    $("modal").dataset.kind = "";
    $("modal").close();
  }
  adPending = false;
  render(); showSpecialTip(); showCelebration(); setClock(); updateMusic();
});
save(); render(); showSpecialTip(); showCelebration(); setInterval(sync, 100);
