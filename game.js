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
  sun: "M16 12a4 4 0 1 1-8 0 4 4 0 1 1 8 0z M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2",
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
function notify(message, variant = "") {
  const notice = $("notice");
  notice.textContent = message;
  notice.dataset.variant = variant;
  notice.classList.add("visible");
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
    el.title = (i + 1) + "번째 · " + guests[q.guest] + " · " + menus[q.menu].name;
    el.setAttribute("role", "img"); el.setAttribute("aria-label", el.title);
    paint(el.querySelector(".bubble"), i === 0 ? dish(q.menu) : String(i + 1));
  });
  paint($("equipment"), game.stations.map((k, slot) => '<div class="stove' + (k?.burnt ? ' smoking' : k?.finish != null ? ' cooking' : '') +
    '"><img src="' + art("stove", game.stoveLevels[slot]) + '" alt="' + (slot + 1) + '번 조리대 · ' + equipment[game.stoveLevels[slot]] + '"></div>').join(""));
  $("scene").dataset.stoves = game.stoveLevels.length;
  $("staff-sprite").hidden = !game.staff || game.closed;
  $("staff-sign").hidden = !game.staff || game.closed;
  $("open-sign").textContent = game.closed ? "영업 마감" : "영업 중";
  $("open-sign").classList.toggle("closed", game.closed);
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
  paint($("waiting"), Array.from({ length: capacity - 1 }, (_, i) => {
    const q = game.queue[i + 1], rank = '<span class="rank">' + String(i + 2).padStart(2, "0") + '</span>';
    if (!q) return '<li class="waiting-order vacant" aria-hidden="true">' + rank + '<span>빈 자리</span></li>';
    return '<li class="waiting-order">' + rank + portrait(q) +
    '<div class="queued-dish"><b>' + menus[q.menu].name + '</b><small>' + guests[q.guest] + '</small></div>' +
    '<div class="queued-time">' + temperament(q) + timer(q) + meter(q) + '</div></li>';
  }).join(""));
}

function timingButton(station, menu) {
  const label = station.timingResult === "missed" ? "일반" : "노란 구간";
  return '<button class="step-button active timing-button" data-timing="' + station.ticket + '" ' +
    (station.timingResult ? 'disabled' : '') + ' style="--timing-from:' + menu.timing.from + '%;--timing-to:' +
    (menu.timing.from + timingWindowWidth) + '%"><strong>' + menu.timing.action + '</strong><span class="timing-label">' +
    label + '</span><span class="timing-track" aria-hidden="true"></span></button>';
}

function stationMarkup(k, slot) {
  const title = (slot + 1) + "번 조리대";
  if (!k) {
    const available = pendingOrders(game).length > 0;
    return '<button class="empty-station" data-choose="' + slot + '" aria-label="' + title + ' 메뉴 선택" ' +
      (available ? '' : 'disabled') + '><span class="station-title">' + title + '</span><img src="' +
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
  const stageLabel = k.burnt ? "음식이 탔어요" : timingHit ? icon("check") + "타이밍 성공" :
    ready ? "조리 완료" : (step + 1) + ' / ' + menu.steps.length + '단계';
  const nextStepClass = timingHit && step === 2 && !busy ? ' timing-complete' : '';
  return '<section class="loaded-station' + (k.burnt ? ' burnt' : '') + nextStepClass + '" aria-label="' + title + '"><div class="station-title">' + title + '<small>NO. ' +
    serial(order.id) + '</small></div><div class="recipe"><div class="plated">' + dish(order.menu) + '</div><div><small>' + guests[order.guest] + '</small><h3>' +
    menu.name + '</h3><span class="stage-label' + (timingHit ? ' timing-success' : '') + '">' + stageLabel +
    '</span></div></div><div class="prep-heading"><h3>' + (ready ? (first ? "서빙 가능" : "앞 주문 대기") : busy ? "조리 중…" : "조리 순서") +
    '</h3><small>' + heat + '</small></div>' + actions + '</section>';
}
function renderKitchen() {
  if (game.closed) {
    paint($("kitchen"), '<div class="empty-kitchen">' + icon("moon") + '<h3>오늘의 조리 완료</h3></div>' +
      '<button class="primary" data-settle>오늘의 정산 ' + icon("chevron") + '</button>');
    return;
  }
  paint($("kitchen"), '<div class="stations" data-count="' + game.stations.length + '">' +
    game.stations.map(() => '<div class="station-slot"></div>').join("") + '</div>');
  $("kitchen").querySelectorAll(".station-slot").forEach((el, slot) => paint(el, stationMarkup(game.stations[slot], slot)));
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
  image.alt = part.name + "의 " + game.decor.name + " 가게와 골목";
  paint($("shift-icon"), icon(part.icon));
  const label = part.name + " · " + crowds[game.crowd].name;
  if ($("scene-period").textContent !== label) $("scene-period").textContent = label;
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
    const timing = $("kitchen").querySelector('[data-timing="' + k.ticket + '"]');
    if (timing) {
      const progress = timingProgress(game, k);
      timing.style.setProperty("--timing-progress", progress + "%");
      if (!timing.disabled) {
        const order = game.queue.find(q => q.id === k.ticket);
        const inWindow = hitTimingWindow(order.menu, progress);
        const label = inWindow ? "지금!" : progress > menus[order.menu].timing.from ? "지났어요" : "노란 구간";
        timing.classList.toggle("in-window", inWindow);
        const text = timing.querySelector(".timing-label");
        if (text.textContent !== label) text.textContent = label;
      }
      continue;
    }
    const active = $("kitchen").querySelector('.step-button.active[data-ticket="' + k.ticket + '"]');
    active?.style.setProperty("--cooked", Math.min(100, 100 * (1 - (k.finish - game.elapsed) / stepDuration(game, slot))) + "%");
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
  return row("판매 완료", s.served + "건") + row("탄 음식 제공", s.burntServed + "건") +
    row("시간 초과", s.missed + "건") + row("마감 미제공", s.unservedAtClose + "건") +
    row("오늘 평점", ratingText(s) + " · " + s.reviewCount + "건") + row("오늘 매출", money(s.sales));
}
function renderManage() {
  const busy = game.stations.some(Boolean);
  const stoves = game.stoveLevels.map((level, slot) => {
    const max = level === equipment.length - 1, cost = stoveUpgradeCost(level);
    return '<div class="item"><div class="upgrade-art"><img src="' + art("stove", level) + '" alt=""></div>' +
      '<div class="item-copy"><b>' + (slot + 1) + '번 · ' + equipment[level] + '</b><small>' + (level + 1) +
      '단계 · 화구 1개 · 단계당 ' + stepDuration(game, slot) / 1000 + '초</small></div>' +
      '<button class="buy" data-stove="' + slot + '" ' + (max || game.stations[slot] || game.balance < cost ? 'disabled' : '') + '>' +
      (max ? '최고 단계' : game.stations[slot] ? '조리 중' : '개선 ' + money(cost)) + '</button></div>';
  }).join("");
  const descriptions = {
    interior: interiors[game.interior] + (game.interior < 2 ? ' → ' + interiors[game.interior + 1] : '') + ' · 카운터와 주방 벽 마감',
    quality: '레벨당 모든 메뉴 판매가 +' + money(menuPriceBoost),
    staff: '모든 조리대 · 각 단계 ' + staffStepReduction / 1000 + '초 단축',
    promotion: '레벨당 손님 입장 간격 ' + promotionBoost + '% 단축',
    hospitality: '레벨당 정상 음식 평점 +' + hospitalityBonus / 10 + '점 · 최대 5점'
  };
  $("manage").innerHTML = '<h2>' + icon("upgrade") + '가게 관리</h2><div class="summary">' +
    row("조리 직원", game.staff ? "1명" : "미채용") + row("보유 자금", money(game.balance)) + '</div>' +
    '<button class="decor-entry" id="open-decor"><span class="upgrade-art">' + icon("store") +
    '</span><span class="item-copy"><b>가게 꾸미기</b><small>가게 이름 · 차양 · 간판 · 업적 칭호</small></span>' + icon("chevron") + '</button><h3>가스레인지</h3>' + stoves +
    (game.stoveLevels.length < stoveLimit ? '<div class="item"><div class="item-copy"><b>2번 렌지 설치</b><small>1단계 단일 화구 · 두 주문 동시 조리</small></div><button class="buy" data-install ' +
      (game.balance < installCost ? 'disabled' : '') + '>설치 ' + money(installCost) + '</button></div>' : '') + '<h3>가게 개선</h3>' +
    upgrades.map(u => {
      const max = game[u.key] >= u.max;
      const level = u.key === "staff" ? "" : ' <em>Lv.' + game[u.key] + '/' + u.max + '</em>';
      const done = u.key === "staff" ? "채용 완료" : "개선 완료";
      const cost = upgradeCost(game, u);
      return '<div class="item"><div class="upgrade-art">' + icon(u.icon) +
        '</div><div class="item-copy"><b>' + u.name + level + '</b><small>' + descriptions[u.key] +
        '</small></div><button class="buy" data-buy="' + u.key + '" ' + (max || (busy && u.key !== "interior") || game.balance < cost ? "disabled" : "") + '>' +
        (max ? done : money(cost)) + '</button></div>';
    }).join("") + (busy ? '<p>조리 중인 주문을 마치면 개선할 수 있어요.</p>' : '');
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
  dialog("가게 꾸미기", '<div class="decor-preview"><div class="shop-decor" id="preview-decor"></div></div>' +
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
    save(); render(); $("modal").close(); tone(750); notify("가게 꾸미기를 적용했어요.");
    $("open-decor").focus();
  };
  updatePreview();
}
function renderJournal() {
  $("journal").innerHTML = '<h2>' + icon("book") + '영업 일지</h2><h3>' + game.day + '일차 장부</h3><div class="summary">' +
    row("방문한 손님", game.arrived + "명") + dayStats(game) + goalStats(game) + row("누적 판매", game.total + "건") + '</div><h3>지난 영업</h3>' +
    (game.history.length ? game.history.slice().reverse().map(d => '<div class="item"><div class="item-copy"><b>' + d.day + '일차</b><small>판매 ' +
      d.served + '건 · 시간 초과 ' + d.missed + '건' + (d.bonus ? ' · 분점 수익 ' + money(d.bonus) : '') + '</small>' +
      (d.reviewCount === undefined ? '' : '<small>평점 ' + ratingText(d) + ' (' + d.reviewCount + '건) · 탄 음식 ' + d.burntServed +
        '건 · 마감 미제공 ' + d.unservedAtClose + '건</small>') +
      (d.goalReward ? '<small>목표 보상 +' + money(d.goalReward) + '</small>' : '') +
      '</div><strong>' + money(d.sales + (d.bonus || 0) + (d.goalReward || 0)) + '</strong></div>').join("")
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
  return menus.map((m, i) => '<button class="menu-tile" data-menu="' + i + '" aria-pressed="' + (selected === i) + '">' +
    dish(i) + '<span>' + m.name + '</span><small>' + money(salePrice(game, i)) + '</small></button>').join("");
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
  if (page === "journal") { renderJournal(); return; }
  if (page === "achievements") { renderAchievements(); return; }
  renderScene(); renderQueue(); renderKitchen();
  refreshTimers();
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
    if (events.some(e => e.type === "burnt")) { tone(185); notify("음식이 탔어요! 다시 조리하거나 손님에게 건넬 수 있어요."); }
    else if (left.length === 1) notify(guests[left[0].order.guest] + " 손님이 기다리다 떠났어요. ★ 1점");
    else if (left.length > 1) notify("손님 " + left.length + "명이 기다리다 떠났어요. 각각 ★ 1점");
    if (game.closed) settlement();
    else if (events.some(e => e.type === "prepared")) tone(640);
  } else {
    refreshTimers();
    if (now - lastSave > 3000) save();
  }
}
function setClock() {
  const modal = $("modal");
  running = !document.hidden && page === "play" && !game.celebration && (!modal.open || modal.dataset.kind === "picker");
  lastFrame = performance.now();
}
function changePage(next) {
  sync(); page = next;
  document.querySelectorAll("nav button").forEach(b => {
    $(b.dataset.page).hidden = b.dataset.page !== next;
    if (b.dataset.page === next) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
  });
  setClock(); save(); render(); document.querySelector("main").scrollTop = 0; window.scrollTo(0, 0);
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
  dialog(title, '<ul class="celebration-list">' + entries + '</ul><p>확인할 때까지 영업이 멈춰요.</p>' +
    '<button class="primary" id="confirm-celebration">확인하고 계속하기</button>', "celebration");
  const confirm = $("confirm-celebration");
  confirm.onclick = () => $("modal").close();
  confirm.focus();
}
function settlement() {
  dialog(game.day + "일차 영업 마감", '<div class="summary">' + row("방문한 손님", game.arrived + "명") +
    dayStats(game) + goalStats(game) +
    '</div><button class="primary" id="next-day">다음 날 영업 시작 ' + icon("chevron") + '</button>');
  $("next-day").onclick = () => { if (!game.closed) return; settleDay(game); save(); $("modal").close(); render(); notify(game.day + "일차 영업을 시작해요."); };
}
function cookbook(selected = 0) {
  const m = menus[selected];
  const timingHint = '<p>두 번째 단계의 표시가 노란 구간에 오면 ‘' + m.timing.action + '’ 버튼을 누르세요. 성공하면 바로 3단계로 넘어가고, 서빙할 때 팁 ' + money(timingTip) + '을 받아요.</p>';
  dialog("메뉴판", '<div class="book-grid">' + menuTiles(selected) + '</div><div class="book-detail"><b>' + m.name + '</b><ol>' +
    m.steps.map(s => '<li>' + s + '</li>').join("") + '</ol>' + timingHint + '</div>', "book");
  for (const b of $("dialog-body").querySelectorAll("[data-menu]")) {
    b.onclick = () => cookbook(+b.dataset.menu);
  }
}
function toggleSound() { game.sound = !game.sound; save(); render(); tone(640); }

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
      tone(230); return;
    }
    save(); $("modal").close(); tone(410); render();
  };
}

function settings() {
  dialog("설정", '<div class="stat"><span>효과음</span><button id="toggle-audio" class="buy">' + (game.sound ? "켜짐" : "꺼짐") +
    '</button></div><h3>영업 방법</h3><p>오전 7시부터 밤 10시까지 영업해요. 하루는 플레이 시간 3분이고, 손님은 점심과 저녁 식사 시간에 더 자주 찾아와요.</p>' +
    '<p>두 번째 조리 단계의 노란 구간에 맞춰 누르면 서빙할 때 팁 ' + money(timingTip) + '을 받아요. 조리 시작 후 12초가 지나면 음식이 타요. 탄 음식은 1점과 0원, 주문 후 10초 안에 내면 5점, 그 밖의 정상 음식은 3·4·5점 중 하나를 기본 평점으로 받아요.</p>' +
    '<p>최대 5명이 기다려요. 성미 급한 손님은 ' +
    tempers.hasty.seconds + '초, 보통 손님은 ' + tempers.regular.seconds + '초, 느긋한 손님은 ' + tempers.easy.seconds +
    '초 동안 기다려요. 기다리다 떠난 손님은 1점을 남겨요. 조리대에서 메뉴를 고르는 동안에도 영업 시간이 흐릅니다.</p><button id="reset" class="secondary">처음부터 시작</button>');
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
  if (button.hasAttribute("data-choose")) { chooseDish(+button.dataset.choose); return; }
  if (button.hasAttribute("data-remake")) {
    if (remakeDish(game, +button.dataset.remake)) { save(); render(); tone(410); }
    return;
  }
  if (button.hasAttribute("data-timing")) {
    const result = tryTiming(game, +button.dataset.timing);
    if (!result) return;
    save(); render();
    if (result === "hit") {
      tone(880); notify("타이밍 성공! 3단계로 넘어갔어요.", "timing-success");
    } else {
      tone(230); notify("타이밍을 놓쳤어요. 일반 메뉴로 완성돼요.");
    }
    return;
  }
  if (button.hasAttribute("data-serve")) {
    const result = serve(game, +button.dataset.serve);
    if (!result) return;
    showGuestReaction(+button.dataset.serve, result.stars);
    save(); render();
    tone(result.burnt ? 185 : 880);
    const payout = result.burnt ? "탄 음식 0원" : "+" + money(result.amount);
    const tip = result.tip ? " (팁 " + money(result.tip) + " 포함)" : "";
    notify(guests[result.guest] + " · " + result.stars + "점 · " + payout + tip);
    showCelebration();
  } else {
    const ticket = +button.dataset.ticket, order = game.queue.find(q => q.id === ticket);
    const k = game.stations.find(k => k?.ticket === ticket);
    if (!k || !order) return;
    if (!prepareStep(game, ticket, +button.dataset.step)) {
      const next = menus[order.menu].steps[k.step];
      if (next) notify("먼저 ‘" + next + "’ 단계를 진행하세요.");
      return;
    }
    tone(410); save(); render();
  }
});
$("manage").onclick = e => {
  if (e.target.closest("#open-decor")) { openDecor(); return; }
  const stove = e.target.closest("[data-stove], [data-install]");
  if (stove && !stove.disabled) {
    const install = stove.hasAttribute("data-install");
    if (install ? installStove(game) : upgradeStove(game, Number(stove.dataset.stove))) {
      save(); render(); tone(750); notify(install ? "두 번째 렌지를 설치했어요." : "렌지를 한 단계 개선했어요.");
    }
    return;
  }
  const btn = e.target.closest("[data-buy]");
  if (!btn || btn.disabled) return;
  const u = upgrades.find(v => v.key === btn.dataset.buy);
  if (!u || !buyUpgrade(game, u.key)) return;
  save(); render(); tone(750);
  if (u.key === "staff") notify("직원을 채용했어요. 각 조리 단계가 " + staffStepReduction / 1000 + "초 짧아져요!");
  else if (u.key === "interior") notify(interiors[game.interior] + " 인테리어를 완성했어요!");
  else notify(u.name + " 개선 완료!");
};
document.querySelectorAll("i[data-icon]").forEach(el => el.innerHTML = icon(el.dataset.icon));
document.querySelectorAll("nav button").forEach(b => b.onclick = () => changePage(b.dataset.page));
$("cookbook").onclick = () => { sync(); cookbook(); };
$("settings").onclick = () => { sync(); settings(); };
$("sound").onclick = toggleSound;
$("dismiss").onclick = () => $("modal").close();
$("modal").onclick = e => { if (e.target === $("modal")) $("modal").close(); };
$("modal").addEventListener("close", () => {
  const modal = $("modal");
  if (modal.open) return;
  if (modal.dataset.kind === "celebration" && game.celebration) {
    game.celebration = null;
    save();
  }
  showCelebration();
  setClock();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && running) { sync(); save(); }
  setClock();
});
window.addEventListener("pagehide", () => { if (running) { sync(); save(); } running = false; });
window.addEventListener("pageshow", setClock);
window.addEventListener("storage", e => {
  if (e.key !== storageKey) return;
  game = load();
  if ($("modal").open) {
    $("modal").dataset.kind = "";
    $("modal").close();
  }
  render(); showCelebration(); setClock();
});
save(); render(); showCelebration(); setInterval(sync, 100);
