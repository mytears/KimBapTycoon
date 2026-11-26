"use strict";

const menus = [
  { name: "야채김밥", price: 3000, steps: ["김에 밥 펴기", "속재료 올리기", "말아서 썰기"],
    timing: { action: "속재료 정돈", from: 25 }, stepDelta: -300, burnDelta: 3000, tip: 500, trait: "빠른 손질 · 넉넉한 보온" },
  { name: "떡볶이", price: 4000, steps: ["양념장 풀기", "떡과 어묵 넣기", "양념에 졸이기"],
    timing: { action: "양념 섞기", from: 35 }, stepDelta: 0, burnDelta: 0, tip: 600, trait: "균형 조리 · 팁 우수" },
  { name: "라면", price: 3500, steps: ["육수 끓이기", "면 풀어 넣기", "달걀 올리기"],
    timing: { action: "면 저어주기", from: 30 }, stepDelta: -300, burnDelta: -1500, tip: 500, trait: "빠른 조리 · 빨리 불음" },
  { name: "꼬치어묵", price: 3000, steps: ["어묵 접어 끼우기", "육수에 익히기", "국물 담기"],
    timing: { action: "꼬치 뒤집기", from: 50 }, stepDelta: -400, burnDelta: 4000, tip: 500, trait: "초고속 · 오래 보온" },
  { name: "모둠튀김", price: 4500, steps: ["재료 손질하기", "튀김옷 입히기", "바삭하게 튀기기"],
    timing: { action: "튀김옷 털기", from: 45 }, stepDelta: 100, burnDelta: -1000, tip: 800, trait: "바삭 타이밍 고보너스" },
  { name: "순대", price: 4500, steps: ["찜기에 물 붓기", "순대 찌기", "썰어 소금 곁들이기"],
    timing: { action: "불 조절", from: 40 }, stepDelta: -100, burnDelta: 2500, tip: 500, trait: "여유로운 찜기 보온" },
  { name: "불고기덮밥", price: 6500, steps: ["고기 양념하기", "불고기 볶기", "밥 위에 담기"],
    timing: { action: "고기 뒤집기", from: 45 }, stepDelta: 300, burnDelta: 1000, tip: 800, trait: "고수익 · 정성 조리" },
  { name: "군만두", price: 4000, steps: ["팬에 기름 두르기", "만두 굽기", "초간장 곁들이기"],
    timing: { action: "만두 뒤집기", from: 40 }, stepDelta: 0, burnDelta: -1000, tip: 800, trait: "노릇 타이밍 고보너스" },
  { name: "김치볶음밥", price: 5500, steps: ["김치 볶기", "밥 넣고 볶기", "달걀프라이 올리기"],
    timing: { action: "밥 뒤집기", from: 35 }, stepDelta: 200, burnDelta: 0, tip: 700, trait: "고수익 · 화력 요리" }
];
const guestProfiles = [
  { name: "단골 학생", favorite: 1, bio: "하교길마다 친구들과 들르는 골목 붙박이", quote: "여기 떡볶이 양념이 제일 중독성 있어요!" },
  { name: "퇴근길 회사원", favorite: 2, bio: "야근 후 따끈한 국물로 하루를 푸는 직장인", quote: "하루 피로가 라면 국물 한 모금에 싹 풀려요." },
  { name: "동네 책방 주인", favorite: 0, bio: "책 냄새를 풍기며 한 줄 포장해 가는 이웃", quote: "책 읽으면서 한 입씩 먹기엔 김밥이 최고죠." },
  { name: "자전거 배달원", favorite: 6, bio: "언덕길을 달린 뒤 든든한 한 끼를 찾는 라이더", quote: "불고기덮밥 먹고 나면 페달이 가벼워져요!" },
  { name: "시장 단골 할머니", favorite: 3, bio: "장바구니를 들고 정겹게 안부를 묻는 할머니", quote: "추운 날엔 역시 어묵 국물이 속을 데워주지." },
  { name: "이웃 빵집 사장", favorite: 8, bio: "오븐 불을 끄고 매콤한 밥을 찾으러 오는 이웃", quote: "달콤한 빵 굽고 나면 김치볶음밥이 딱 당겨요." },
  { name: "꽃집 사장", favorite: 0, bio: "꽃다발 손질 틈틈이 가볍게 들르는 플로리스트", quote: "속재료가 알록달록해서 꽃다발처럼 예쁘네요!" },
  { name: "골목 사진가", favorite: 7, bio: "노을과 간판 불빛을 필름에 담는 사진가", quote: "노릇하게 구운 군만두는 찍어도 예쁘고 먹어도 최고예요." },
  { name: "퇴근길 간호사", favorite: 5, bio: "교대근무를 마치고 따뜻한 분식을 찾는 간호사", quote: "따뜻한 순대 한 접시가 늘 큰 위로가 돼요." },
  { name: "택시 기사", favorite: 8, bio: "야간 운행 전 골목에 잠깐 들르는 베테랑 기사님", quote: "화력 좋게 볶은 밥이라 마지막 한 숟갈까지 맛있어요." },
  { name: "바이올린 연주자", favorite: 4, bio: "연습실이 끝나면 바삭한 간식을 찾는 연주자", quote: "바삭한 튀김 소리가 꼭 경쾌한 리듬 같아요." },
  { name: "낚시꾼 할아버지", favorite: 3, bio: "새벽 출조를 마치고 골목에서 몸을 녹이는 어르신", quote: "강바람 쐬고 와서 먹는 꼬치어묵은 못 참지!" },
  { name: "도예가", favorite: 5, bio: "가마 앞 작업을 끝내고 느긋하게 찾아오는 작가", quote: "정성 들여 쪄낸 순대라 식감이 남다르네요." },
  { name: "스케이트보더", favorite: 1, bio: "골목 어귀에서 보드를 옆에 끼고 들르는 청년", quote: "매콤달콤 떡볶이 먹고 한 판 더 타러 가야죠!" },
  { name: "우편집배원", favorite: 0, bio: "동네 구석구석 소식을 전하는 부지런한 집배원", quote: "배달 중간에 챙겨 먹기엔 이 집 김밥이 으뜸이에요." },
  { name: "태권도 선수", favorite: 6, bio: "도장 훈련 뒤 든든한 고기 반찬을 찾는 선수", quote: "불고기덮밥 한 그릇이면 기합이 절로 들어갑니다!" },
  { name: "과일 가게 사장", favorite: 7, bio: "저녁 정리를 마치고 바삭한 만두를 즐기는 이웃", quote: "겉은 바삭하고 속은 촉촉해서 자꾸 생각나요." },
  { name: "첼리스트", favorite: 2, bio: "늦은 합주 후 따뜻한 면 요리를 즐기는 연주자", quote: "깊은 육수 맛이 첼로 저음처럼 마음을 울리네요." },
  { name: "버스 기사", favorite: 6, bio: "종점 회차 시간에 맞춰 찾아오는 친절한 기사님", quote: "늘 변함없는 손맛 덕분에 오늘도 힘내서 운행해요." },
  { name: "캠핑 여행자", favorite: 2, bio: "여행 다녀오는 길에 골목 라면을 꼭 들르는 여행객", quote: "산에서 먹던 라면보다 사장님 라면이 한 수 위예요!" },
  { name: "동네 파티시에", favorite: 4, bio: "디저트 마감 후 짭짤한 튀김을 찾는 제과사", quote: "튀김옷이 얇고 바삭해서 식감이 완벽해요!" }
];
const guests = guestProfiles.map(g => g.name);
const affinityRanks = [
  { level: 0, name: "방문", min: 0, tip: 0, starBonus: 0 },
  { level: 1, name: "단골", min: 3, tip: 200, starBonus: 0, favoriteOnlyTip: true },
  { level: 2, name: "찐단골", min: 8, tip: 300, starBonus: 0 },
  { level: 3, name: "골목 가족", min: 15, tip: 500, starBonus: 2 }
];
const tempers = {
  regular: { name: "보통", seconds: 40 },
  hasty: { name: "성미 급함", seconds: 30 },
  easy: { name: "느긋함", seconds: 50 }
};
const waitDeadline = (temper, entered) => entered + tempers[temper].seconds * 1000;
const equipment = ["휴대용 가스레인지", "스테인리스 레인지", "황동 레인지"];
const stoveLimit = 2;
const installCost = 12000;
const stoveUpgradeCost = level => (level + 1) * 12000;
const interiors = ["나무", "벽돌", "대리석"];
const capacity = 5;
const equipmentStepReduction = 250;
const staffStepReduction = 500;
const staffBurnBonus = 3000;
const staffTimingBonus = 12;
const staffAutoDelay = 1500;
const feverComboThreshold = 5;
const feverDuration = 20_000;
const feverSpeedMultiplier = 0.85;
const featuredPriceBonus = 500;
const comboTipStep = 200;
const comboTipCap = 1000;
const weathers = {
  clear: {
    id: "clear", name: "맑은 날", icon: "sun",
    desc: "평온한 골목 영업이에요.",
    menus: [], priceBonus: 0, arrivalFactor: 1, fiveStarTip: 0
  },
  rainy: {
    id: "rainy", name: "비 오는 날", icon: "rain",
    desc: "라면·꼬치어묵 주문 증가 및 판매가 +500원",
    menus: [2, 3], priceBonus: 500, arrivalFactor: 1.05, fiveStarTip: 0
  },
  chilly: {
    id: "chilly", name: "쌀쌀한 바람", icon: "wind",
    desc: "떡볶이·순대 주문 증가 및 판매가 +500원",
    menus: [1, 5], priceBonus: 500, arrivalFactor: 1, fiveStarTip: 0
  },
  festival: {
    id: "festival", name: "동네 운동회", icon: "flag",
    desc: "손님 입장 15% 빠름 · 김밥·군만두 +400원",
    menus: [0, 7], priceBonus: 400, arrivalFactor: 0.85, fiveStarTip: 0
  },
  payday: {
    id: "payday", name: "월급날 저녁", icon: "coin",
    desc: "덮밥·볶음밥·튀김 인기 및 판매가 +600원",
    menus: [4, 6, 8], priceBonus: 600, arrivalFactor: 0.94, fiveStarTip: 0
  },
  critic: {
    id: "critic", name: "맛집 소문", icon: "star",
    desc: "별점 5점 서빙마다 추가 팁 +300원",
    menus: [], priceBonus: 0, arrivalFactor: 0.92, fiveStarTip: 300
  }
};
const weatherIds = Object.keys(weathers);
const isFever = s => s.feverUntil != null && s.elapsed < s.feverUntil;
function stepDuration(s, slot = 0, menu = null) {
  const base = 2500 - equipmentStepReduction * s.stoveLevels[slot] - (s.staff >= 1 ? staffStepReduction : 0);
  const delta = menu != null && menus[menu] ? menus[menu].stepDelta : 0;
  const raw = Math.max(600, base + delta);
  return isFever(s) ? Math.max(500, Math.round(raw * feverSpeedMultiplier)) : raw;
}
function burnDuration(s, menu = null) {
  const delta = menu != null && menus[menu] ? menus[menu].burnDelta : 0;
  const staffBonus = s.staff >= 2 ? staffBurnBonus : 0;
  return burnDelay + delta + staffBonus;
}
function timingWindowFor(s) {
  return timingWindowWidth + (s.staff >= 2 ? staffTimingBonus : 0);
}
function dishTimingTip(s, menu) {
  const base = menus[menu]?.tip ?? timingTip;
  return isFever(s) ? base * 2 : base;
}
function guestRank(affinity) {
  let rank = affinityRanks[0];
  for (const item of affinityRanks) if (affinity >= item.min) rank = item;
  return rank;
}
const menuPriceBoost = 500;
const promotionBoost = 10;
const hospitalityBonus = 2;
const upgrades = [
  { key: "interior", name: "가게 인테리어", max: 2, base: 50000, icon: "store" },
  { key: "quality", name: "메뉴 연구", max: 6, base: 15000, icon: "menu" },
  { key: "staff", name: "직원 채용 · 교육", max: 3, base: 30000, icon: "people" },
  { key: "promotion", name: "동네 홍보", max: 3, base: 20000, icon: "store" },
  { key: "hospitality", name: "서비스 개선", max: 3, base: 18000, icon: "star" }
];
const upgradeCost = (s, upgrade) => upgrade.base * (s[upgrade.key] + 1);
const shopStyles = {
  awning: [
    { id: "red", name: "앵두빛", cost: 0 },
    { id: "mugwort", name: "쑥빛", cost: 40000 },
    { id: "indigo", name: "쪽빛", cost: 60000 }
  ],
  sign: [
    { id: "painted", name: "손글씨", cost: 0 },
    { id: "enamel", name: "청록 법랑", cost: 50000 },
    { id: "neon", name: "달빛 네온", cost: 90000 }
  ]
};
const defaultName = "별밤분식";
const defaultDecor = () => ({ name: defaultName, awning: "red", sign: "painted", title: "", owned: ["red", "painted"] });
const nameSegmenter = typeof Intl.Segmenter === "function" ? new Intl.Segmenter("ko") : null;
function shopName(value) {
  if (typeof value !== "string") return "";
  const name = value.trim().normalize("NFC");
  const letters = nameSegmenter ? nameSegmenter.segment(name) : name;
  return Array.from(letters).length <= 4 && !/[\u0000-\u001f\u007f]/u.test(name) ? name : "";
}
const arrivalFactor = s => ((100 - s.promotion * promotionBoost) / 100) * (weathers[s.weather]?.arrivalFactor ?? 1);
const openMinute = 7 * 60;
const closeMinute = 22 * 60;
const shiftDuration = 180_000;
const burnDelay = 12_000;
const fastService = 10_000;
const dumplingMenu = 7;
const timingWindowWidth = 40;
const timingTip = 500;
const specialTipMultiplier = 5;
const specialGuestChance = .15;
const dailyGoalReward = 3000;
const dailyGoals = {
  crispy: { name: "바삭한 군만두 판매", target: 1, counts: result => result.menu === dumplingMenu && result.timingTip > 0 },
  lunch: { name: "점심(11~14시) 판매", target: 2, counts: (_, minute) => minute >= 11 * 60 && minute < 14 * 60 },
  fast: { name: "10초 이내 서빙", target: 3, counts: result => result.fast },
  dinner: { name: "저녁(17~20시) 판매", target: 3, counts: (_, minute) => minute >= 17 * 60 && minute < 20 * 60 },
  timing3: { name: "타이밍 성공 서빙", target: 3, counts: result => result.timingTip > 0 },
  fiveStar4: { name: "별점 5점 서빙", target: 4, counts: result => result.stars === 5 },
  combo3: { name: "연속 3콤보 달성", target: 1, counts: result => result.combo >= 3 },
  featured2: { name: "오늘의 추천 메뉴 판매", target: 2, counts: result => result.featured },
  favorite2: { name: "손님 최애 메뉴 만족", target: 2, counts: result => result.favorite && result.stars >= 4 },
  served8: { name: "하루 8건 판매", target: 8, counts: () => true },
  soup2: { name: "라면·꼬치어묵 판매", target: 2, counts: result => result.menu === 2 || result.menu === 3 },
  noBurn5: { name: "탄 음식 없이 5건 판매", target: 5, counts: (result, _, s) => s.burntServed === 0 }
};
const menuAchievementTitles = [
  { id: "gimbap", unit: "줄", titles: ["김밥 솜씨", "김밥 장인"] },
  { id: "tteokbokki", unit: "접시", titles: ["매콤한 한 접시", "떡볶이의 달인"] },
  { id: "ramen", unit: "그릇", titles: ["보글보글 한 그릇", "라면의 달인"] },
  { id: "fish-cake", unit: "인분", titles: ["따끈한 어묵", "어묵꼬치 장인"] },
  { id: "fritters", unit: "접시", titles: ["바삭한 첫걸음", "튀김의 달인"] },
  { id: "sundae", unit: "접시", titles: ["찜기 앞 단골", "순대의 달인"] },
  { id: "bulgogi", unit: "그릇", titles: ["한 그릇 든든하게", "불고기덮밥 장인"] },
  { id: "dumplings", unit: "접시", titles: ["노릇한 한 접시", "만두 굽기의 달인"] },
  { id: "fried-rice", unit: "접시", titles: ["볶음밥 손맛", "김치볶음밥 장인"] }
];
const achievements = [
  { id: "first-sale", title: "첫 장사", name: "첫 주문 판매", metric: "sales", target: 1, icon: "ticket" },
  { id: "sales-50", title: "골목의 인기 가게", name: "음식 50개 판매", metric: "sales", target: 50, icon: "ticket" },
  { id: "sales-200", title: "동네 분식 명가", name: "음식 200개 판매", metric: "sales", target: 200, icon: "ticket" },
  { id: "sales-500", title: "분식의 전설", name: "음식 500개 판매", metric: "sales", target: 500, icon: "ticket" },
  { id: "five-stars-10", title: "칭찬받는 주방", name: "별점 5점 손님 10명", metric: "fiveStars", target: 10, icon: "star" },
  { id: "five-stars-100", title: "별 다섯 맛집", name: "별점 5점 손님 100명", metric: "fiveStars", target: 100, icon: "star" },
  { id: "timing-10", title: "손끝 감각", name: "타이밍 성공 음식 10개 판매", metric: "timed", target: 10, icon: "timer" },
  { id: "timing-100", title: "타이밍의 달인", name: "타이밍 성공 음식 100개 판매", metric: "timed", target: 100, icon: "timer" },
  { id: "goal-1", title: "목표 첫걸음", name: "오늘 목표 첫 달성", metric: "goals", target: 1, icon: "target" },
  { id: "goal-10", title: "꾸준한 사장님", name: "오늘 목표 10회 달성", metric: "goals", target: 10, icon: "target" },
  { id: "days-7", title: "일주일 단골집", name: "영업 7일 마감", metric: "days", target: 7, icon: "moon" },
  { id: "days-30", title: "한 달의 땀방울", name: "영업 30일 마감", metric: "days", target: 30, icon: "moon" },
  ...menuAchievementTitles.flatMap(({ id, unit, titles }, menu) => [25, 200].map((target, tier) => ({
    id: id + "-" + target,
    title: titles[tier],
    name: menus[menu].name + " " + target + unit + " 판매",
    menu,
    target,
    icon: "pan"
  })))
];
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
const emptyAchievementRecords = () => ({
  fiveStars: 0, timed: 0, dishSales: Array(menus.length).fill(0),
  bestCombo: 0, guestVisits: Array(guests.length).fill(0), guestAffinity: Array(guests.length).fill(0)
});
const storageKey = "byeolbam.bunsik.v1";
const pick = items => items[Math.floor(Math.random() * items.length)];

function pickWeather(exclude = null) {
  const pool = weatherIds.filter(id => id !== exclude);
  return pick(pool);
}

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
  const next = s.elapsed + Math.round(delay * arrivalFactor(s));
  if (next < shiftDuration) s.nextArrival = next;
}

function syncStaffAuto(s) {
  if (s.staff < 3 || s.closed || s.elapsed >= shiftDuration) {
    s.staffAutoAt = null;
    return;
  }
  const hasSlot = s.stations.includes(null);
  const hasPending = pendingOrders(s).length > 0;
  if (hasSlot && hasPending) {
    if (s.staffAutoAt == null) s.staffAutoAt = s.elapsed + staffAutoDelay;
  } else {
    s.staffAutoAt = null;
  }
}

function chooseOrderMenu(s, guest, first) {
  if (first) return s.deck[0];
  const base = s.deck[s.arrived % menus.length];
  if (s.day === 1 && s.arrived === 1 && s.goal?.id === "crispy") return base;
  const profile = guestProfiles[guest];
  const rank = guestRank(s.records.guestAffinity[guest] || 0);
  const weather = weathers[s.weather];
  const roll = Math.random();
  const favChance = rank.level >= 2 ? 0.35 : rank.level >= 1 ? 0.25 : 0.16;
  if (roll < favChance) return profile.favorite;
  if (s.featuredMenu != null && menus[s.featuredMenu] && roll < favChance + 0.18) return s.featuredMenu;
  if (weather?.menus.length && roll < favChance + 0.34) return pick(weather.menus);
  return base;
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
    syncStaffAuto(s);
    return;
  }
  if (s.arrived > 0 && s.arrived % menus.length === 0) s.deck = menuDeck();
  const first = s.lastTicket === 0;
  const free = guests.map((_, i) => i).filter(i => !s.queue.some(q => q.guest === i));
  const roll = Math.random();
  const temper = first ? "regular" : roll < .2 ? "hasty" : roll < .48 ? "easy" : "regular";
  const special = !first && s.arrived >= 2 && s.arrived - s.lastSpecialArrival >= 4 &&
    Math.random() < specialGuestChance;
  const guest = first ? 0 : pick(free);
  const menu = chooseOrderMenu(s, guest, first);
  const order = {
    id: ++s.lastTicket, menu, guest,
    temper, special, entered: s.elapsed, expires: waitDeadline(temper, s.elapsed)
  };
  if (special) s.lastSpecialArrival = s.arrived;
  s.records.guestVisits[guest] = (s.records.guestVisits[guest] || 0) + 1;
  s.queue.push(order);
  s.arrived++;
  scheduleArrival(s);
  syncStaffAuto(s);
}

function pickGoalId(day, previousGoalId = null) {
  const ids = Object.keys(dailyGoals);
  if (day <= 3) return ids[day - 1];
  const pool = ids.filter(id => id !== previousGoalId);
  return pick(pool);
}

function startDay(s) {
  const prevGoal = s.goal?.id ?? null;
  const goalId = pickGoalId(s.day, prevGoal);
  const weather = s.day === 1 ? "clear" : (weathers[s.nextWeather] ? s.nextWeather : pickWeather(s.weather));
  const nextWeather = pickWeather(weather);
  const featuredMenu = Number.isInteger(s.nextFeaturedMenu) && menus[s.nextFeaturedMenu]
    ? s.nextFeaturedMenu
    : (Number.isInteger(s.featuredMenu) && menus[s.featuredMenu] ? s.featuredMenu : 0);
  const deck = menuDeck(s.day === 1 ? 0 : undefined);
  if (goalId === "crispy") {
    const index = deck.indexOf(dumplingMenu);
    [deck[index], deck[1]] = [deck[1], deck[index]];
  }
  Object.assign(s, emptyReviewStats(), { served: 0, missed: 0, sales: 0, elapsed: 0, arrived: 0,
    queue: [], returning: null, pendingTip: null, lastSpecialArrival: -2,
    combo: 0, dayBestCombo: 0, feverUntil: null, staffAutoAt: null,
    weather, nextWeather, featuredMenu, nextFeaturedMenu: null,
    stations: s.stoveLevels.map(() => null),
    closed: false, crowd: pick(["quiet", "usual", "usual", "busy"]), deck,
    goal: { id: goalId, progress: 0 } });
  scheduleArrival(s);
  return s;
}
function fresh() {
  return startDay({ version: 14, day: 1, balance: 10000, total: 0, lastTicket: 0,
    staff: 0, stoveLevels: [0], interior: 0, quality: 0, promotion: 0, hospitality: 0, history: [], sound: false, music: true,
    records: emptyAchievementRecords(), celebration: null, decor: defaultDecor(),
    featuredMenu: 0, nextFeaturedMenu: null, weather: "clear", nextWeather: null });
}
function salePrice(s, menu) {
  const weatherBonus = weathers[s.weather]?.menus.includes(menu) ? weathers[s.weather].priceBonus : 0;
  const featuredBonus = s.featuredMenu === menu ? featuredPriceBonus : 0;
  return menus[menu].price + s.quality * menuPriceBoost + weatherBonus + featuredBonus;
}
function setFeaturedMenu(s, menu, forTomorrow = false) {
  if (!Number.isInteger(menu) || !menus[menu]) return false;
  if (!forTomorrow && !s.closed && s.arrived === 0 && s.served === 0) {
    s.featuredMenu = menu;
    s.nextFeaturedMenu = null;
  } else {
    s.nextFeaturedMenu = menu;
  }
  return true;
}

function installStove(s) {
  if (s.stoveLevels.length >= stoveLimit || s.balance < installCost) return false;
  s.balance -= installCost;
  s.stoveLevels.push(0);
  s.stations.push(null);
  syncStaffAuto(s);
  return true;
}

function upgradeStove(s, slot) {
  const level = s.stoveLevels[slot];
  if (!Number.isInteger(slot) || level === undefined || level >= equipment.length - 1 || s.stations[slot]) return false;
  const cost = stoveUpgradeCost(level);
  if (s.balance < cost) return false;
  s.balance -= cost;
  s.stoveLevels[slot]++;
  return true;
}

function buyUpgrade(s, key) {
  const upgrade = upgrades.find(item => item.key === key);
  if (!upgrade || s[key] >= upgrade.max || (key !== "interior" && s.stations.some(Boolean))) return false;
  const cost = upgradeCost(s, upgrade);
  if (s.balance < cost) return false;
  const previousArrivalFactor = arrivalFactor(s);
  s.balance -= cost;
  s[key]++;
  if (key === "promotion") {
    if (s.nextArrival === null) scheduleArrival(s);
    else s.nextArrival = s.elapsed + Math.round((s.nextArrival - s.elapsed) * arrivalFactor(s) / previousArrivalFactor);
  }
  if (key === "staff") syncStaffAuto(s);
  return true;
}

function removeOrder(s, order) {
  const wasFull = s.queue.length === capacity;
  s.queue.splice(s.queue.indexOf(order), 1);
  const slot = s.stations.findIndex(k => k?.ticket === order.id);
  if (slot >= 0) s.stations[slot] = null;
  if (wasFull) scheduleArrival(s);
  syncStaffAuto(s);
}

function completeStep(station) {
  station.finish = null;
  station.step++;
}

function recordReview(s, stars) {
  s.reviewCount++;
  s.reviewStars = Math.round((s.reviewStars + stars) * 10) / 10;
}

function resetCombo(s) {
  s.combo = 0;
  s.feverUntil = null;
}

// Resolve events at their actual play times, including simultaneous deadlines.
function advance(s, delta) {
  const events = [];
  if (s.pendingTip) return events;
  const target = s.elapsed + Math.max(0, delta);
  while (!s.closed) {
    const next = Math.min(shiftDuration, s.nextArrival ?? Infinity,
      s.staffAutoAt ?? Infinity,
      s.feverUntil ?? Infinity,
      ...s.stations.map(k => k?.finish ?? Infinity),
      ...s.stations.map(k => k && !k.burnt ? k.burnAt : Infinity),
      ...s.queue.map(q => q.expires));
    if (next > target) { s.elapsed = target; break; }
    s.elapsed = next;
    if (next === shiftDuration) {
      s.unservedAtClose = s.queue.length + (s.returning ? 1 : 0);
      s.queue = []; s.stations.fill(null); s.returning = null; s.nextArrival = null;
      s.feverUntil = null; s.staffAutoAt = null;
      s.closed = true;
      events.push({ type: "closed" });
      break;
    }
    if (s.feverUntil != null && s.feverUntil <= next) {
      s.feverUntil = null;
      events.push({ type: "fever-end" });
    }
    for (const q of s.queue.filter(q => q.expires <= next)) {
      removeOrder(s, q);
      s.missed++;
      resetCombo(s);
      recordReview(s, 1);
      events.push({ type: "left", order: q });
    }
    for (const k of s.stations) {
      if (k && !k.burnt && k.burnAt <= next) {
        k.burnt = true;
        k.finish = null;
        events.push({ type: "burnt", ticket: k.ticket });
      } else if (k?.finish != null && k.finish <= next) {
        completeStep(k);
        events.push({ type: "prepared" });
      }
    }
    if (s.nextArrival != null && s.nextArrival <= next) {
      admit(s);
      events.push({ type: "arrival" });
    }
    if (s.staffAutoAt != null && s.staffAutoAt <= next) {
      s.staffAutoAt = null;
      const slot = s.stations.indexOf(null);
      const pending = pendingOrders(s)[0];
      if (slot >= 0 && pending) {
        s.stations[slot] = startCooking(s, pending.id, slot, pending.menu);
        events.push({ type: "staff-auto", slot, order: pending });
      }
      syncStaffAuto(s);
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
  s.stations[slot] = startCooking(s, order.id, slot, order.menu);
  syncStaffAuto(s);
  return true;
}
function startCooking(s, ticket, slot = 0, menu = null) {
  const resolvedMenu = menu ?? s.queue.find(q => q.id === ticket)?.menu ?? null;
  return {
    ticket, step: 0,
    finish: s.elapsed + stepDuration(s, slot, resolvedMenu),
    burnAt: s.elapsed + burnDuration(s, resolvedMenu),
    burnt: false
  };
}
function remakeDish(s, ticket) {
  const slot = s.stations.findIndex(k => k?.ticket === ticket && k.burnt);
  if (slot < 0) return false;
  const order = s.queue.find(q => q.id === ticket);
  s.stations[slot] = startCooking(s, ticket, slot, order?.menu ?? null);
  return true;
}
function prepareStep(s, ticket, step) {
  const slot = s.stations.findIndex(k => k?.ticket === ticket);
  const k = s.stations[slot];
  const order = s.queue.find(q => q.id === ticket);
  if (!k || k.burnt || !order || k.step !== step || k.finish != null || !menus[order.menu].steps[step]) return false;
  k.finish = s.elapsed + stepDuration(s, slot, order.menu);
  if (step === 1) k.timingStarted = s.elapsed;
  return true;
}

function timingProgress(s, station) {
  if (station.burnt || station.step !== 1 || station.finish == null || station.timingStarted == null) return null;
  return 100 * (s.elapsed - station.timingStarted) / (station.finish - station.timingStarted);
}

function hitTimingWindow(menu, progress, width = timingWindowWidth) {
  const from = menus[menu].timing.from;
  const end = Math.min(100, from + width);
  return progress >= from && progress <= end;
}

function tryTiming(s, ticket) {
  const station = s.stations.find(k => k?.ticket === ticket);
  const order = s.queue.find(q => q.id === ticket);
  if (!station || !order || station.timingResult) return null;
  const progress = timingProgress(s, station);
  if (progress === null || progress < 0 || progress >= 100) return null;
  station.timingResult = hitTimingWindow(order.menu, progress, timingWindowFor(s)) ? "hit" : "missed";
  if (station.timingResult === "hit") completeStep(station);
  return station.timingResult;
}

function goalReward(goal) {
  return goal && goal.progress >= dailyGoals[goal.id].target ? dailyGoalReward : 0;
}

function achievementCounts(s) {
  return {
    sales: s.total,
    fiveStars: s.records.fiveStars,
    dishSales: s.records.dishSales.slice(),
    timed: s.records.timed,
    goals: s.history.filter(day => day.goalReward > 0).length + Number(goalReward(s.goal) > 0),
    days: s.history.length
  };
}

function achievementProgress(counts, achievement) {
  return achievement.menu === undefined ? counts[achievement.metric] : counts.dishSales[achievement.menu];
}

function earnedTitles(s) {
  const counts = achievementCounts(s);
  return achievements.filter(a => achievementProgress(counts, a) >= a.target);
}

function decorPrice(s, choice) {
  if (!shopName(choice.name ?? s.decor.name)) return null;
  if (choice.title !== "" && !earnedTitles(s).some(a => a.id === choice.title)) return null;
  let cost = 0;
  for (const [group, options] of Object.entries(shopStyles)) {
    const item = options.find(o => o.id === choice[group]);
    if (!item) return null;
    if (!s.decor.owned.includes(item.id)) cost += item.cost;
  }
  return cost;
}

function applyDecor(s, choice) {
  const cost = decorPrice(s, choice);
  if (cost === null || cost > s.balance) return false;
  const { awning, sign, title } = choice;
  s.balance -= cost;
  s.decor = { name: shopName(choice.name ?? s.decor.name), awning, sign, title, owned: [...new Set([...s.decor.owned, awning, sign])] };
  return true;
}

function restoreDecor(s) {
  const decor = defaultDecor(), saved = s.decor;
  if (!saved) return decor;
  decor.name = shopName(saved.name) || defaultName;
  for (const [group, options] of Object.entries(shopStyles)) {
    for (const item of options) {
      if (item.cost && Array.isArray(saved.owned) && saved.owned.includes(item.id)) decor.owned.push(item.id);
      if (saved[group] === item.id && decor.owned.includes(item.id)) decor[group] = item.id;
    }
  }
  if (saved.title && earnedTitles(s).some(a => a.id === saved.title)) decor.title = saved.title;
  return decor;
}

function recordCelebration(s, before, goalId = null) {
  const after = achievementCounts(s);
  const unlocked = achievements.filter(a =>
    achievementProgress(before, a) < a.target && achievementProgress(after, a) >= a.target).map(a => a.id);
  if (!goalId && !unlocked.length) return;
  const pending = s.celebration;
  s.celebration = { goalId: goalId ?? pending?.goalId ?? null, unlocked: [...(pending?.unlocked ?? []), ...unlocked] };
}

function serve(s, ticket) {
  const head = s.queue[0];
  const k = s.stations.find(k => k?.ticket === ticket);
  if (!head || head.id !== ticket || !k || head.expires <= s.elapsed ||
      (!k.burnt && k.step !== menus[head.menu].steps.length)) return null;
  const before = achievementCounts(s);
  const goalWasDone = goalReward(s.goal) > 0;
  const profile = guestProfiles[head.guest];
  const favorite = profile.favorite === head.menu;
  const featured = s.featuredMenu === head.menu;
  const prevAffinity = s.records.guestAffinity[head.guest] || 0;
  const rankBefore = guestRank(prevAffinity);
  const fast = !k.burnt && s.elapsed - head.entered <= fastService;
  const baseStars = k.burnt ? 1 : fast ? 5 : pick([3, 4, 5]);
  const stars = k.burnt ? baseStars : Math.min(50, baseStars * 10 + s.hospitality * hospitalityBonus + rankBefore.starBonus) / 10;

  let timingBonus = 0, comboTip = 0, regularTip = 0, weatherTip = 0;
  let feverTriggered = false, rankUp = null;
  if (k.burnt) {
    resetCombo(s);
  } else {
    timingBonus = k.timingResult === "hit" ? dishTimingTip(s, head.menu) : 0;
    if (stars === 5 || timingBonus > 0) {
      s.combo++;
      if (s.combo > s.dayBestCombo) s.dayBestCombo = s.combo;
      if (s.combo > s.records.bestCombo) s.records.bestCombo = s.combo;
      if (s.combo >= 3) comboTip = Math.min(comboTipCap, (s.combo - 2) * comboTipStep);
      if (s.combo >= feverComboThreshold && s.combo % feverComboThreshold === 0) {
        s.feverUntil = Math.min(shiftDuration, s.elapsed + feverDuration);
        feverTriggered = true;
      }
    } else {
      resetCombo(s);
    }
    if (rankBefore.tip > 0 && (!rankBefore.favoriteOnlyTip || favorite)) regularTip = rankBefore.tip;
    if (stars === 5 && weathers[s.weather]?.fiveStarTip) weatherTip = weathers[s.weather].fiveStarTip;
    if (stars >= 4) {
      const gain = favorite ? 2 : 1;
      s.records.guestAffinity[head.guest] = prevAffinity + gain;
      const rankAfter = guestRank(s.records.guestAffinity[head.guest]);
      if (rankAfter.level > rankBefore.level) rankUp = rankAfter;
    }
  }
  const tip = timingBonus + comboTip + regularTip + weatherTip;
  const price = k.burnt ? 0 : salePrice(s, head.menu);
  const amount = k.burnt ? 0 : price + tip;
  s.balance += amount;
  s.sales += amount;
  if (k.burnt) s.burntServed++;
  else {
    s.total++; s.served++;
    s.records.dishSales[head.menu]++;
    if (stars === 5) s.records.fiveStars++;
    if (timingBonus) s.records.timed++;
  }
  recordReview(s, stars);
  const result = {
    amount, price, stars, fast, burnt: k.burnt, guest: head.guest, menu: head.menu,
    tip, timingTip: timingBonus, comboTip, regularTip, weatherTip,
    combo: s.combo, feverTriggered, favorite, featured, rankUp
  };
  if (head.special && !k.burnt) {
    s.pendingTip = { ticket: head.id, guest: head.guest, menu: head.menu,
      amount: salePrice(s, head.menu) * specialTipMultiplier };
  }
  if (s.goal && !k.burnt) {
    const goal = dailyGoals[s.goal.id];
    if (goal && s.goal.progress < goal.target && goal.counts(result, clockMinutes(s), s)) s.goal.progress++;
  }
  removeOrder(s, head);
  recordCelebration(s, before, !goalWasDone && goalReward(s.goal) > 0 ? s.goal.id : null);
  return result;
}

function resolveSpecialTip(s, ticket, rewarded) {
  const pending = s.pendingTip;
  if (!pending || pending.ticket !== ticket) return 0;
  s.pendingTip = null;
  if (!rewarded) return 0;
  s.balance += pending.amount;
  s.sales += pending.amount;
  return pending.amount;
}

function settleDay(s, chosenFeaturedMenu = null) {
  if (!s.closed) return;
  if (Number.isInteger(chosenFeaturedMenu) && menus[chosenFeaturedMenu]) {
    s.nextFeaturedMenu = chosenFeaturedMenu;
  }
  const before = achievementCounts(s);
  const reward = goalReward(s.goal);
  s.history.push({ day: s.day, sales: s.sales, served: s.served, missed: s.missed, arrived: s.arrived,
    reviewCount: s.reviewCount, reviewStars: s.reviewStars, burntServed: s.burntServed, unservedAtClose: s.unservedAtClose,
    goal: s.goal, goalReward: reward, weather: s.weather, featuredMenu: s.featuredMenu, bestCombo: s.dayBestCombo });
  s.balance += reward;
  s.day++;
  startDay(s);
  recordCelebration(s, before);
}

function legacyStoves(speed) {
  const level = Number.isInteger(speed) ? Math.max(0, Math.min(2, speed)) : 0;
  return level ? [level, level] : [0];
}
function ensureRecords(records) {
  const base = emptyAchievementRecords();
  if (!records || typeof records !== "object") return base;
  base.fiveStars = Number.isFinite(records.fiveStars) ? records.fiveStars : 0;
  base.timed = Number.isFinite(records.timed) ? records.timed : 0;
  if (Array.isArray(records.dishSales) && records.dishSales.length === menus.length) {
    base.dishSales = records.dishSales.map(n => Number.isFinite(n) ? n : 0);
  }
  base.bestCombo = Number.isFinite(records.bestCombo) ? records.bestCombo : 0;
  if (Array.isArray(records.guestVisits) && records.guestVisits.length === guests.length) {
    base.guestVisits = records.guestVisits.map(n => Number.isFinite(n) ? n : 0);
  }
  if (Array.isArray(records.guestAffinity) && records.guestAffinity.length === guests.length) {
    base.guestAffinity = records.guestAffinity.map(n => Number.isFinite(n) ? n : 0);
  }
  return base;
}
function restore(raw) {
  if (!raw || !Number.isInteger(raw.day) || raw.day < 1 || !Array.isArray(raw.history)) return fresh();
  // Finish steps already in progress using the timing of the original migration.
  const legacyStaffMultiplier = 1.5;
  if ([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].includes(raw.version)) {
    if (raw.version < 12) {
      raw.stoveLevels = legacyStoves(raw.speed);
      raw.interior = 0;
      delete raw.speed;
    }
    if (!Array.isArray(raw.stoveLevels) || !raw.stoveLevels.length || raw.stoveLevels.length > stoveLimit ||
        !raw.stoveLevels.every(level => Number.isInteger(level) && level >= 0 && level < equipment.length)) return fresh();
    if (!Number.isInteger(raw.interior) || !interiors[raw.interior]) raw.interior = 0;
    if (!Array.isArray(raw.queue) || raw.queue.length > (raw.version === 2 ? 6 : capacity) || !Array.isArray(raw.deck) ||
        raw.deck.length !== menus.length || !raw.deck.every(i => menus[i]) ||
        !raw.queue.every(q => q && menus[q.menu] && guests[q.guest] && tempers[q.temper] &&
          Number.isFinite(q.expires) && q.expires >= raw.elapsed)) return fresh();
    if (raw.version === 2) {
      raw.stations = raw.stoveLevels.map(() => null);
      raw.stations[0] = raw.kitchen ?? null;
      delete raw.kitchen;
      delete raw.selected;
      raw.returning = raw.queue.length > capacity ? { order: raw.queue.pop(), pausedAt: raw.elapsed } : null;
      if (raw.queue.length === capacity) raw.nextArrival = null;
      raw.version = 3;
    }
    if (!Array.isArray(raw.stations) || raw.stations.length !== raw.stoveLevels.length) return fresh();
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
      raw.promotion = 0;
      scheduleArrival(raw);
    }
    if (raw.version === 4) {
      // Give owners of the retired branch upgrade an employee and keep their sales history.
      raw.staff = raw.branches > 1 ? 1 : 0;
      for (const station of raw.stations) {
        if (raw.staff && station?.finish != null) {
          station.finish = raw.elapsed + (station.finish - raw.elapsed) / legacyStaffMultiplier;
        }
      }
      delete raw.branches;
      raw.version = 5;
    }
    if (raw.version === 5) {
      raw.goal = raw.closed ? null : { id: "fast", progress: 0 };
      raw.version = 6;
    }
    if (raw.version === 6) {
      raw.promotion = 0;
      raw.hospitality = 0;
      for (const station of raw.stations) {
        if (!station) continue;
        if (station.step === 1 && station.finish != null) {
          station.timingStarted = station.flipStarted ?? station.finish - stepDuration(raw);
        }
        if (station.flip) station.timingResult = station.flip === "crispy" ? "hit" : "missed";
        delete station.flipStarted;
        delete station.flip;
      }
      raw.version = 7;
    }
    if (raw.version === 7 || raw.version === 8) {
      for (const order of raw.queue) {
        order.expires = Math.max(raw.elapsed, waitDeadline(order.temper, order.entered));
      }
      if (raw.returning) {
        const { order, pausedAt } = raw.returning;
        order.expires = waitDeadline(order.temper, order.entered);
        if (order.expires <= pausedAt) {
          raw.returning = null;
          raw.missed++;
          recordReview(raw, 1);
        }
      }
      for (const station of raw.stations) {
        if (station?.step === 1 && !station.burnt && station.timingResult === "hit") completeStep(station);
      }
      raw.version = 9;
      advance(raw, 0);
    }
    if (raw.version === 9) {
      raw.records = emptyAchievementRecords();
      raw.celebration = null;
      raw.version = 10;
    }
    raw.records = ensureRecords(raw.records);
    raw.decor = restoreDecor(raw);
    raw.music ??= true;
    if (raw.version < 13) {
      raw.pendingTip = null;
      raw.lastSpecialArrival = -2;
    }
    if (raw.version < 14) {
      raw.combo = 0;
      raw.dayBestCombo = 0;
      raw.feverUntil = null;
      raw.staffAutoAt = null;
      raw.weather = "clear";
      raw.nextWeather = pickWeather("clear");
      raw.featuredMenu = 0;
      raw.nextFeaturedMenu = null;
    }
    if (!Number.isInteger(raw.staff) || raw.staff < 0 || raw.staff > 3) raw.staff = 0;
    if (!weathers[raw.weather]) raw.weather = "clear";
    if (!weathers[raw.nextWeather]) raw.nextWeather = pickWeather(raw.weather);
    if (!Number.isInteger(raw.featuredMenu) || !menus[raw.featuredMenu]) raw.featuredMenu = 0;
    if (raw.nextFeaturedMenu != null && (!Number.isInteger(raw.nextFeaturedMenu) || !menus[raw.nextFeaturedMenu])) raw.nextFeaturedMenu = null;
    if (raw.goal && !dailyGoals[raw.goal.id]) raw.goal = { id: "fast", progress: 0 };
    if (!Number.isFinite(raw.combo) || raw.combo < 0) raw.combo = 0;
    if (!Number.isFinite(raw.dayBestCombo) || raw.dayBestCombo < 0) raw.dayBestCombo = 0;
    if (raw.feverUntil != null && (!Number.isFinite(raw.feverUntil) || raw.feverUntil <= raw.elapsed)) raw.feverUntil = null;
    if (raw.staffAutoAt != null && !Number.isFinite(raw.staffAutoAt)) raw.staffAutoAt = null;
    raw.version = 14;
    syncStaffAuto(raw);
    return raw;
  }
  // Keep the original shop economy and honor an order already cooking or ready.
  const legacySequence = [0, 1, 2, 0, 2, 1, 1, 0, 2, 1, 0];
  const s = fresh();
  for (const key of ["day", "balance", "total", "quality", "sales", "served", "sound"])
    if (raw[key] !== undefined) s[key] = raw[key];
  s.staff = raw.branches > 1 ? 1 : 0;
  s.goal = raw.phase === "closed" ? null : { id: "fast", progress: 0 };
  s.history = raw.history.map(entry => ({ ...entry, served: 8, missed: 0 }));
  s.queue = [];
  s.stoveLevels = legacyStoves(raw.speed);
  s.stations = s.stoveLevels.map(() => null);
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
      s.stations[0] = { ...startCooking(s, s.queue[0].id), step: done ? 3 : 2,
        finish: done ? null : remaining / (s.staff ? legacyStaffMultiplier : 1) };
    }
  }
  return s;
}
