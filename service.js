"use strict";

const menus = [
  { name: "야채김밥", price: 3000, steps: ["김에 밥 펴기", "속재료 올리기", "말아서 썰기"] },
  { name: "떡볶이", price: 4000, steps: ["양념장 풀기", "떡과 어묵 넣기", "양념에 졸이기"] },
  { name: "라면", price: 3500, steps: ["육수 끓이기", "면 풀어 넣기", "달걀 올리기"] },
  { name: "꼬치어묵", price: 3000, steps: ["어묵 접어 끼우기", "육수에 익히기", "국물 담기"] },
  { name: "모둠튀김", price: 4500, steps: ["재료 손질하기", "튀김옷 입히기", "바삭하게 튀기기"] },
  { name: "순대", price: 4500, steps: ["찜기에 물 붓기", "순대 찌기", "썰어 소금 곁들이기"] },
  { name: "불고기덮밥", price: 6500, steps: ["고기 양념하기", "불고기 볶기", "밥 위에 담기"] },
  { name: "군만두", price: 4000, steps: ["팬에 기름 두르기", "만두 굽기", "초간장 곁들이기"] },
  { name: "김치볶음밥", price: 5500, steps: ["김치 볶기", "밥 넣고 볶기", "달걀프라이 올리기"] }
];
const guests = ["단골 학생", "퇴근길 회사원", "동네 책방 주인", "자전거 배달원", "시장 단골 할머니", "이웃 빵집 사장",
  "꽃집 사장", "골목 사진가", "퇴근길 간호사", "택시 기사", "바이올린 연주자", "낚시꾼 할아버지"];
const tempers = {
  regular: { name: "보통", seconds: 60 },
  hasty: { name: "성미 급함", seconds: 35 },
  easy: { name: "느긋함", seconds: 90 }
};
const equipment = ["휴대용 가스레인지", "스테인리스 2구 레인지", "황동 조리 스테이션"];
const capacity = 5;
const stationCount = s => s.speed > 0 ? 2 : 1;
const stepDuration = s => 1500 - 400 * s.speed;
const openMinute = 7 * 60;
const closeMinute = 22 * 60;
const shiftDuration = 180_000;
const burnDelay = 12_000;
const fastService = 10_000;
const crowds = {
  quiet: { name: "한산한 날", min: 11_000, max: 18_000 },
  usual: { name: "평소 같은 날", min: 7_000, max: 13_000 },
  busy: { name: "붐비는 날", min: 4_500, max: 9_000 }
};
const dayparts = [
  { from: 7, name: "아침", image: "storefront-morning", icon: "sunrise" },
  { from: 11, name: "점심", image: "storefront-midday", icon: "sun" },
  { from: 17, name: "저녁", image: "storefront-evening", icon: "sunset" },
  { from: 20, name: "밤", image: "storefront", icon: "moon" }
];
const clockMinutes = s => openMinute + Math.floor(Math.min(shiftDuration, s.elapsed) * (closeMinute - openMinute) / shiftDuration);
const daypartAt = minutes => dayparts.reduce((part, next) => minutes >= next.from * 60 ? next : part);
const emptyReviewStats = () => ({ reviewCount: 0, reviewStars: 0, burntServed: 0, unservedAtClose: 0 });
const storageKey = "byeolbam.bunsik.v1";
const pick = items => items[Math.floor(Math.random() * items.length)];

function menuDeck(first) {
  const deck = menus.map((_, index) => index).filter(index => index !== first);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  if (first !== undefined) deck.unshift(first);
  return deck;
}

function scheduleArrival(s) {
  s.nextArrival = null;
  if (s.closed || s.elapsed >= shiftDuration || s.queue.length >= capacity) return;
  const { min, max } = crowds[s.crowd];
  const hour = clockMinutes(s) / 60;
  const rush = (hour >= 11 && hour < 14) || (hour >= 17 && hour < 20);
  const delay = s.arrived === 0 ? 1800 + Math.random() * 2500 : (min + Math.random() * (max - min)) * (rush ? .78 : 1);
  const next = s.elapsed + Math.round(delay);
  if (next < shiftDuration) s.nextArrival = next;
}

function admit(s) {
  if (s.closed || s.elapsed >= shiftDuration || s.queue.length >= capacity) return;
  if (s.returning) {
    const { order, pausedAt } = s.returning;
    order.entered += s.elapsed - pausedAt;
    order.expires += s.elapsed - pausedAt;
    s.queue.push(order);
    s.returning = null;
    scheduleArrival(s);
    return;
  }
  if (s.arrived > 0 && s.arrived % menus.length === 0) s.deck = menuDeck();
  const first = s.lastTicket === 0;
  const free = guests.map((_, i) => i).filter(i => !s.queue.some(q => q.guest === i));
  const roll = Math.random();
  const temper = first ? "regular" : roll < .2 ? "hasty" : roll < .48 ? "easy" : "regular";
  const order = {
    id: ++s.lastTicket, menu: s.deck[s.arrived % menus.length], guest: first ? 0 : pick(free),
    temper, entered: s.elapsed, expires: s.elapsed + tempers[temper].seconds * 1000
  };
  s.queue.push(order);
  s.arrived++;
  scheduleArrival(s);
}

function startDay(s) {
  Object.assign(s, emptyReviewStats(), { served: 0, missed: 0, sales: 0, elapsed: 0, arrived: 0,
    queue: [], returning: null, stations: Array(stationCount(s)).fill(null),
    closed: false, crowd: pick(["quiet", "usual", "usual", "busy"]), deck: menuDeck(s.day === 1 ? 0 : undefined) });
  scheduleArrival(s);
  return s;
}
function fresh() {
  return startDay({ version: 4, day: 1, balance: 10000, total: 0, lastTicket: 0,
    branches: 1, speed: 0, quality: 0, history: [], sound: false });
}
const salePrice = (s, menu) => menus[menu].price + s.quality * 500;
const branchBonus = s => (s.branches - 1) * 5000;

function removeOrder(s, order) {
  const wasFull = s.queue.length === capacity;
  s.queue.splice(s.queue.indexOf(order), 1);
  const slot = s.stations.findIndex(k => k?.ticket === order.id);
  if (slot >= 0) s.stations[slot] = null;
  if (wasFull) scheduleArrival(s);
}

// Resolve events at their actual play times, including simultaneous deadlines.
function advance(s, delta) {
  const events = [];
  const target = s.elapsed + Math.max(0, delta);
  while (!s.closed) {
    const next = Math.min(shiftDuration, s.nextArrival ?? Infinity, ...s.stations.map(k => k?.finish ?? Infinity),
      ...s.stations.map(k => k && !k.burnt ? k.burnAt : Infinity),
      ...s.queue.map(q => q.expires));
    if (next > target) { s.elapsed = target; break; }
    s.elapsed = next;
    if (next === shiftDuration) {
      s.unservedAtClose = s.queue.length + (s.returning ? 1 : 0);
      s.queue = []; s.stations.fill(null); s.returning = null; s.nextArrival = null;
      s.closed = true;
      events.push({ type: "closed" });
      break;
    }
    for (const q of s.queue.filter(q => q.expires <= next)) {
      removeOrder(s, q);
      s.missed++;
      events.push({ type: "left", order: q });
    }
    for (const k of s.stations) {
      if (k && !k.burnt && k.burnAt <= next) {
        k.burnt = true;
        k.finish = null;
        events.push({ type: "burnt", ticket: k.ticket });
      } else if (k?.finish != null && k.finish <= next) {
        k.finish = null;
        k.step++;
        events.push({ type: "prepared" });
      }
    }
    if (s.nextArrival !== null && s.nextArrival <= next) {
      admit(s);
      events.push({ type: "arrival" });
    }
  }
  return events;
}

function pendingOrders(s) {
  // Reserve capacity for earlier tickets even if the second dish is placed first.
  return s.queue.filter(q => !s.stations.some(k => k?.ticket === q.id))
    .slice(0, s.stations.filter(k => k === null).length);
}
function placeDish(s, slot, menu) {
  if (s.stations[slot] !== null || s.closed) return false;
  const order = pendingOrders(s).find(q => q.menu === menu);
  if (!order) return false;
  s.stations[slot] = startCooking(s, order.id);
  return true;
}
function startCooking(s, ticket) {
  return { ticket, step: 0, finish: s.elapsed + stepDuration(s), burnAt: s.elapsed + burnDelay, burnt: false };
}
function remakeDish(s, ticket) {
  const slot = s.stations.findIndex(k => k?.ticket === ticket && k.burnt);
  if (slot < 0) return false;
  s.stations[slot] = startCooking(s, ticket);
  return true;
}
function prepareStep(s, ticket, step) {
  const k = s.stations.find(k => k?.ticket === ticket);
  const order = s.queue.find(q => q.id === ticket);
  if (!k || k.burnt || !order || k.step !== step || k.finish != null || !menus[order.menu].steps[step]) return false;
  k.finish = s.elapsed + stepDuration(s);
  return true;
}

function serve(s, ticket) {
  const head = s.queue[0];
  const k = s.stations.find(k => k?.ticket === ticket);
  if (!head || head.id !== ticket || !k || head.expires <= s.elapsed ||
      (!k.burnt && k.step !== menus[head.menu].steps.length)) return null;
  const amount = k.burnt ? 0 : salePrice(s, head.menu);
  const stars = k.burnt ? 1 : s.elapsed - head.entered <= fastService ? 5 : pick([3, 4]);
  s.balance += amount;
  s.sales += amount;
  if (k.burnt) s.burntServed++;
  else { s.total++; s.served++; }
  s.reviewCount++;
  s.reviewStars += stars;
  removeOrder(s, head);
  return { amount, stars, burnt: k.burnt, guest: head.guest };
}

function settleDay(s) {
  if (!s.closed) return;
  const bonus = branchBonus(s);
  s.history.push({ day: s.day, sales: s.sales, served: s.served, missed: s.missed, bonus, arrived: s.arrived,
    reviewCount: s.reviewCount, reviewStars: s.reviewStars, burntServed: s.burntServed, unservedAtClose: s.unservedAtClose });
  s.balance += bonus;
  s.day++;
  startDay(s);
}

function restore(raw) {
  if (!raw || !Number.isInteger(raw.day) || raw.day < 1 || !Array.isArray(raw.history)) return fresh();
  if ([2, 3, 4].includes(raw.version)) {
    if (!Array.isArray(raw.queue) || raw.queue.length > (raw.version === 2 ? 6 : capacity) || !Array.isArray(raw.deck) ||
        raw.deck.length !== menus.length || !raw.deck.every(i => menus[i]) ||
        !raw.queue.every(q => q && menus[q.menu] && guests[q.guest] && tempers[q.temper] &&
          Number.isFinite(q.expires) && q.expires >= raw.elapsed)) return fresh();
    if (raw.version === 2) {
      raw.stations = Array(stationCount(raw)).fill(null);
      raw.stations[0] = raw.kitchen ?? null;
      delete raw.kitchen;
      delete raw.selected;
      raw.returning = raw.queue.length > capacity ? { order: raw.queue.pop(), pausedAt: raw.elapsed } : null;
      if (raw.queue.length === capacity) raw.nextArrival = null;
      raw.version = 3;
    }
    if (!Array.isArray(raw.stations) || raw.stations.length !== stationCount(raw)) return fresh();
    if (raw.version === 3) {
      // Older days ended after nine tickets. Rebase every active deadline together
      // to retain the guests' patience and the progress of a running recipe.
      const elapsed = raw.closed ? shiftDuration : Math.min(raw.elapsed, shiftDuration * 2 / 3);
      const offset = elapsed - raw.elapsed;
      for (const q of raw.queue) { q.entered += offset; q.expires += offset; }
      if (raw.returning) {
        raw.returning.pausedAt += offset;
        raw.returning.order.entered += offset;
        raw.returning.order.expires += offset;
      }
      for (const k of raw.stations.filter(Boolean)) {
        if (k.finish !== null) k.finish += offset;
        k.burnAt = elapsed + burnDelay;
        k.burnt = false;
      }
      Object.assign(raw, emptyReviewStats(), { version: 4, crowd: "usual", elapsed });
      scheduleArrival(raw);
    }
    return raw;
  }
  // Keep the original shop economy and honor an order already cooking or ready.
  const legacySequence = [0, 1, 2, 0, 2, 1, 1, 0, 2, 1, 0];
  const s = fresh();
  for (const key of ["day", "balance", "total", "branches", "speed", "quality", "sales", "served", "sound"])
    if (raw[key] !== undefined) s[key] = raw[key];
  s.history = raw.history.map(entry => ({ ...entry, served: 8, missed: 0 }));
  s.queue = [];
  s.stations = Array(stationCount(s)).fill(null);
  s.lastTicket = s.total;
  s.arrived = s.served;
  if (raw.phase === "closed") {
    s.closed = true;
    s.elapsed = shiftDuration;
    s.nextArrival = null;
  } else {
    const menu = legacySequence[s.total % legacySequence.length];
    s.deck = menuDeck(menu);
    [s.deck[0], s.deck[s.arrived]] = [s.deck[s.arrived], s.deck[0]];
    admit(s);
    if (raw.phase === "ready" || raw.phase === "cooking") {
      const remaining = Math.max(0, (raw.end || 0) - Date.now());
      const done = raw.phase === "ready" || !remaining;
      s.stations[0] = { ...startCooking(s, s.queue[0].id), step: done ? 3 : 2, finish: done ? null : remaining };
    }
  }
  return s;
}
