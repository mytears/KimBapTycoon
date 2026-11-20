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
const guests = ["단골 학생", "퇴근길 회사원", "동네 책방 주인", "자전거 배달원", "시장 단골 할머니", "이웃 빵집 사장"];
const tempers = {
  regular: { name: "보통", seconds: 60 },
  hasty: { name: "성미 급함", seconds: 35 },
  easy: { name: "느긋함", seconds: 90 }
};
const equipment = ["휴대용 가스레인지", "스테인리스 2구 레인지", "황동 조리 스테이션"];
const capacity = 6;
const dailyOrders = menus.length;
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
  s.nextArrival = s.arrived < dailyOrders && s.queue.length < capacity
    ? s.elapsed + 5900 + Math.floor(Math.random() * 2100) : null;
}

function admit(s) {
  const first = s.lastTicket === 0;
  const free = guests.map((_, i) => i).filter(i => !s.queue.some(q => q.guest === i));
  const roll = Math.random();
  const temper = first ? "regular" : roll < .2 ? "hasty" : roll < .48 ? "easy" : "regular";
  const order = {
    id: ++s.lastTicket, menu: s.deck[s.arrived++], guest: first ? 0 : pick(free),
    temper, entered: s.elapsed, expires: s.elapsed + tempers[temper].seconds * 1000
  };
  s.queue.push(order);
  if (s.queue.length === 1) s.selected = order.menu;
  scheduleArrival(s);
}

function startDay(s) {
  Object.assign(s, { served: 0, missed: 0, sales: 0, elapsed: 0, arrived: 0,
    queue: [], kitchen: null, closed: false, deck: menuDeck(s.day === 1 ? 0 : undefined) });
  admit(s);
  return s;
}
function fresh() {
  return startDay({ version: 2, day: 1, balance: 10000, total: 0, lastTicket: 0,
    branches: 1, speed: 0, quality: 0, history: [], sound: false });
}
const salePrice = (s, menu) => menus[menu].price + s.quality * 500;
const branchBonus = s => (s.branches - 1) * 5000;

function removeOrder(s, order) {
  const wasHead = s.queue[0].id === order.id;
  s.queue.splice(s.queue.indexOf(order), 1);
  if (wasHead) {
    s.kitchen = null;
    if (s.queue.length) s.selected = s.queue[0].menu;
  }
  if (s.nextArrival === null) scheduleArrival(s);
  s.closed = s.arrived === dailyOrders && s.queue.length === 0;
}

// Resolve events at their actual play times, including simultaneous deadlines.
function advance(s, delta) {
  const events = [];
  const target = s.elapsed + Math.max(0, delta);
  while (!s.closed) {
    const next = Math.min(s.nextArrival ?? Infinity, s.kitchen?.finish ?? Infinity,
      ...s.queue.map(q => q.expires));
    if (next > target) { s.elapsed = target; break; }
    s.elapsed = next;
    for (const q of s.queue.filter(q => q.expires <= next)) {
      removeOrder(s, q);
      s.missed++;
      events.push({ type: "left", order: q });
    }
    if (s.kitchen?.finish != null && s.kitchen.finish <= next) {
      s.kitchen.finish = null;
      s.kitchen.step++;
      events.push({ type: "prepared" });
    }
    if (s.nextArrival !== null && s.nextArrival <= next) {
      admit(s);
      events.push({ type: "arrival" });
    }
  }
  return events;
}

function prepareStep(s, ticket, step) {
  const head = s.queue[0];
  if (!head || head.id !== ticket || head.menu !== s.selected) return false;
  const k = s.kitchen;
  if ((k?.step ?? 0) !== step || k?.finish != null || !menus[head.menu].steps[step]) return false;
  s.kitchen = { ticket, step, finish: s.elapsed + 1500 - 400 * s.speed };
  return true;
}

function serve(s, ticket) {
  const head = s.queue[0];
  if (!head || head.id !== ticket || s.kitchen?.ticket !== ticket ||
      s.kitchen.step !== menus[head.menu].steps.length || head.expires <= s.elapsed) return 0;
  const amount = salePrice(s, head.menu);
  s.balance += amount;
  s.sales += amount;
  s.total++;
  s.served++;
  removeOrder(s, head);
  return amount;
}

function settleDay(s) {
  if (!s.closed) return;
  const bonus = branchBonus(s);
  s.history.push({ day: s.day, sales: s.sales, served: s.served, missed: s.missed, bonus });
  s.balance += bonus;
  s.day++;
  startDay(s);
}

function restore(raw) {
  if (!raw || !Number.isInteger(raw.day) || raw.day < 1 || !Array.isArray(raw.history)) return fresh();
  if (raw.version === 2) {
    if (!Array.isArray(raw.queue) || raw.queue.length > capacity || !Array.isArray(raw.deck) ||
        raw.deck.length !== dailyOrders || !raw.deck.every(i => menus[i]) ||
        !raw.queue.every(q => q && menus[q.menu] && guests[q.guest] && tempers[q.temper] &&
          Number.isFinite(q.expires) && q.expires >= raw.elapsed)) return fresh();
    return raw;
  }
  // Keep the original shop economy and honor an order already cooking or ready.
  const legacySequence = [0, 1, 2, 0, 2, 1, 1, 0, 2, 1, 0];
  const s = fresh();
  for (const key of ["day", "balance", "total", "branches", "speed", "quality", "sales", "served", "sound"])
    if (raw[key] !== undefined) s[key] = raw[key];
  s.history = raw.history.map(entry => ({ ...entry, served: 8, missed: 0 }));
  s.queue = [];
  s.lastTicket = s.total;
  s.arrived = s.served;
  if (raw.phase === "closed") {
    s.closed = true;
    s.nextArrival = null;
  } else {
    const menu = legacySequence[s.total % legacySequence.length];
    s.deck = menuDeck(menu);
    [s.deck[0], s.deck[s.arrived]] = [s.deck[s.arrived], s.deck[0]];
    admit(s);
    if (raw.phase === "ready" || raw.phase === "cooking") {
      const remaining = Math.max(0, (raw.end || 0) - Date.now());
      const done = raw.phase === "ready" || !remaining;
      s.kitchen = { ticket: s.queue[0].id, step: done ? 3 : 2, finish: done ? null : remaining };
    }
  }
  return s;
}
