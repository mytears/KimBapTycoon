const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// Load the same plain script used by the browser and the offline WebView.
const source = fs.readFileSync(path.join(__dirname, "../service.js"), "utf8");
function engine(random = () => .5) {
  const math = Object.create(Math);
  math.random = random;
  return vm.runInNewContext(source + `
    ;({ fresh, restore, advance, placeDish, prepareStep, remakeDish, serve, settleDay,
        clockMinutes, daypartAt, burnDelay, burnDuration, stepDuration, shiftDuration, scheduleArrival,
        tryTiming, timingProgress, timingWindowFor, timingTip, dishTimingTip, specialTipMultiplier, resolveSpecialTip,
        dumplingMenu, menus, buyUpgrade, salePrice, setFeaturedMenu, featuredPriceBonus,
        isFever, feverDuration, guestProfiles, guestRank, weathers, dailyGoals, staffAutoDelay,
        achievements, achievementCounts, achievementProgress, goalReward, dailyGoalReward,
        earnedTitles, decorPrice, applyDecor, installStove, upgradeStove, shopName, guests })
  `, { Math: math });
}
function withOrder(e) {
  const s = e.fresh();
  e.advance(s, s.nextArrival);
  assert.ok(e.placeDish(s, 0, s.queue[0].menu));
  return s;
}
function finish(e, s, ticket) {
  const slot = s.stations.findIndex(k => k?.ticket === ticket);
  const order = s.queue.find(q => q.id === ticket);
  e.advance(s, e.stepDuration(s, slot, order.menu));
  for (const step of [1, 2]) {
    assert.ok(e.prepareStep(s, ticket, step));
    e.advance(s, e.stepDuration(s, slot, order.menu));
  }
}

test("the clock and four backgrounds follow play time, including quiet gaps and closing", () => {
  const e = engine(), s = e.fresh();
  for (const [elapsed, hour, name] of [[0, 7, "아침"], [48000, 11, "점심"], [120000, 17, "저녁"], [156000, 20, "밤"]]) {
    e.advance(s, elapsed - s.elapsed);
    assert.equal(e.clockMinutes(s), hour * 60);
    assert.equal(e.daypartAt(e.clockMinutes(s)).name, name);
    assert.ok(s.queue.length <= 5);
    assert.equal(s.closed, false);
  }
  e.advance(s, e.shiftDuration - 1 - s.elapsed);
  const waiting = s.queue.length;
  assert.equal(s.closed, false);
  e.advance(s, 2000);
  assert.equal(e.clockMinutes(s), 22 * 60);
  assert.equal(s.closed, true);
  assert.equal(s.unservedAtClose, waiting);
  assert.equal(s.arrived, s.missed + waiting);
  assert.equal(s.nextArrival, null);
  assert.ok(s.stations.every(k => k === null));
  e.settleDay(s); e.settleDay(s);
  assert.equal(s.history.length, 1);
  assert.equal(s.day, 2);
  assert.equal(e.clockMinutes(s), 7 * 60);
});

test("decorating buys the whole selection once and keeps purchases through closing and reload", () => {
  const e = engine(), s = e.fresh();
  const basic = { ...s.decor };
  s.balance = 91000;
  const choice = { awning: "mugwort", sign: "enamel", title: "" };
  assert.equal(e.decorPrice(s, choice), 90000);
  assert.equal(e.decorPrice(s, { ...choice, awning: "indigo", sign: "neon" }), 150000);
  const before = JSON.stringify(s);
  assert.equal(e.applyDecor(s, { ...choice, sign: "neon" }), false);
  assert.equal(e.applyDecor(s, { ...choice, awning: "missing" }), false);
  assert.equal(e.applyDecor(s, { ...choice, title: "ramen-200" }), false);
  assert.equal(JSON.stringify(s), before);
  assert.ok(e.applyDecor(s, choice));
  assert.equal(s.balance, 1000);
  assert.equal(e.decorPrice(s, choice), 0);
  assert.ok(e.applyDecor(s, choice));
  assert.ok(e.applyDecor(s, basic));
  e.advance(s, e.shiftDuration);
  e.settleDay(s);
  const restored = e.restore(JSON.parse(JSON.stringify(s)));
  assert.ok(e.applyDecor(restored, choice));
  assert.equal(restored.balance, 1000);
  assert.equal(restored.decor.sign, "enamel");
  assert.equal(restored.decor.owned.length, 4);
});

test("existing achievements unlock wearable titles and older shops keep their active orders", () => {
  const e = engine(), s = withOrder(e);
  s.version = 10;
  delete s.decor;
  s.total = 200;
  s.records.dishSales[2] = 200;
  const restored = e.restore(JSON.parse(JSON.stringify(s)));
  assert.equal(restored.stations[0].finish, s.stations[0].finish);
  assert.equal(restored.queue[0].expires, s.queue[0].expires);
  assert.equal(restored.balance, s.balance);
  assert.equal(restored.decor.title, "");
  assert.ok(e.earnedTitles(restored).some(a => a.id === "ramen-200"));
  assert.ok(e.applyDecor(restored, { ...restored.decor, title: "ramen-200" }));
  const saved = JSON.parse(JSON.stringify(restored));
  assert.equal(e.restore(saved).decor.title, "ramen-200");
  saved.decor = { awning: "indigo", sign: "missing", title: "goals-999", owned: ["unknown"] };
  assert.deepEqual(JSON.parse(JSON.stringify(e.restore(saved).decor)), JSON.parse(JSON.stringify(e.fresh().decor)));
});

test("legacy paired stoves keep their levels, purchases, and in-flight timers", () => {
  const e = engine(), old = withOrder(e);
  old.version = 11; old.speed = 1; delete old.stoveLevels; delete old.interior;
  old.stations.push(null);
  old.decor.owned.push("enamel"); old.decor.sign = "enamel"; delete old.decor.name;
  const deadline = old.stations[0].finish;
  const s = e.restore(old);
  assert.deepEqual(Array.from(s.stoveLevels), [1, 1]);
  assert.equal(s.stations[0].finish, deadline);
  assert.equal(s.decor.sign, "enamel");
  assert.equal(s.decor.name, "별밤분식");
  assert.equal(e.decorPrice(s, s.decor), 0);
  assert.equal(e.upgradeStove(s, 1), false);
  s.balance = 24000;
  assert.ok(e.upgradeStove(s, 1));
  assert.equal(e.upgradeStove(s, 1), false);
  assert.equal(s.balance, 0);
  assert.equal(s.stations[0].finish, deadline);
  assert.deepEqual(Array.from(e.restore(JSON.parse(JSON.stringify(s))).stoveLevels), [1, 2]);
});

test("shop names and sequential interior upgrades survive a day change and reload", () => {
  const e = engine(), s = e.fresh();
  assert.equal(new Set(e.guests).size, 21);
  for (const name of ["", "  ", "다섯글자야"]) assert.equal(e.applyDecor(s, { ...s.decor, name }), false);
  assert.ok(e.applyDecor(s, { ...s.decor, name: " 달빛김밥 " }));
  assert.equal(e.shopName("🌙김밥집"), "🌙김밥집");
  assert.equal(s.balance, 10000);
  assert.equal(e.buyUpgrade(s, "interior"), false);
  s.balance = 150000;
  assert.ok(e.buyUpgrade(s, "interior")); assert.equal(s.interior, 1); assert.equal(s.balance, 100000);
  assert.ok(e.buyUpgrade(s, "interior")); assert.equal(s.interior, 2); assert.equal(s.balance, 0);
  assert.equal(e.buyUpgrade(s, "interior"), false);
  e.advance(s, e.shiftDuration); e.settleDay(s);
  const reloaded = e.restore(JSON.parse(JSON.stringify(s)));
  assert.equal(reloaded.interior, 2);
  assert.equal(reloaded.decor.name, "달빛김밥");
});

test("daily traffic, meal rushes and jitter affect arrival intervals", () => {
  let roll = 0;
  const e = engine(() => roll), s = e.fresh();
  s.arrived = 1;
  function gap(crowd, elapsed, sample) {
    s.crowd = crowd; s.elapsed = elapsed; roll = sample;
    e.scheduleArrival(s);
    return s.nextArrival - elapsed;
  }
  assert.ok(gap("quiet", 0, .5) > gap("usual", 0, .5));
  assert.ok(gap("usual", 0, .5) > gap("busy", 0, .5));
  assert.ok(gap("usual", 48000, .5) < gap("usual", 0, .5));
  assert.notEqual(gap("busy", 0, .1), gap("busy", 0, .9));
});

test("visitors can keep ordering from another menu deck until closing", () => {
  const counts = ["quiet", "usual", "busy"].map(crowd => {
    const e = engine(), s = e.fresh();
    s.crowd = crowd;
    while (!s.closed) {
      if (!s.queue.length) e.advance(s, (s.nextArrival ?? e.shiftDuration) - s.elapsed);
      if (s.closed) break;
      const q = s.queue[0];
      assert.ok(e.placeDish(s, 0, q.menu));
      for (let step = 0; step < 3; step++) {
        if (step) assert.ok(e.prepareStep(s, q.id, step));
        e.advance(s, e.stepDuration(s, 0, q.menu));
        if (s.closed) break;
      }
      if (!s.closed) assert.ok(e.serve(s, q.id).amount > 0);
    }
    assert.equal(s.arrived, s.served + s.unservedAtClose);
    assert.ok(s.served > 9);
    return s.served;
  });
  assert.ok(counts[0] < counts[1] && counts[1] < counts[2]);
});

test("burning wins at precisely 12 seconds, even for finished food; one angry review, zero revenue", () => {
  const e = engine(), s = withOrder(e), id = s.queue[0].id;
  finish(e, s, id);
  e.advance(s, s.stations[0].burnAt - s.elapsed - 1);
  assert.equal(s.stations[0].burnt, false);
  const loaded = e.restore(JSON.parse(JSON.stringify(s)));
  e.advance(loaded, 1);
  assert.equal(loaded.stations[0].burnt, true);
  const result = e.serve(loaded, id);
  assert.equal(result.stars, 1); assert.equal(result.amount, 0);
  assert.equal(loaded.balance, 10000); assert.equal(loaded.sales, 0); assert.equal(loaded.total, 0);
  assert.equal(loaded.reviewCount, 1); assert.equal(loaded.reviewStars, 1); assert.equal(loaded.burntServed, 1);
  assert.equal(loaded.records.dishSales[loaded.deck[0]], 0);
  assert.equal(loaded.records.fiveStars, 0);
  assert.equal(e.serve(loaded, id), null);
  assert.equal(loaded.reviewCount, 1);
});

test("ratings use time since arrival, including a remake, while each station has its own burn deadline", () => {
  for (const [roll, expected] of [[.1, 3], [.5, 4], [.9, 5]]) {
    const e = engine(() => roll), s = withOrder(e), head = s.queue[0];
    s.stoveLevels.push(0); s.stations.push(null);
    e.advance(s, s.nextArrival - s.elapsed);
    const next = s.queue[1];
    assert.ok(e.placeDish(s, 1, next.menu));
    e.advance(s, s.stations[0].burnAt - s.elapsed);
    assert.equal(s.stations[0].burnt, true); assert.equal(s.stations[1].burnt, false);
    assert.equal(e.serve(s, next.id), null);
    const expiry = head.expires;
    assert.ok(e.remakeDish(s, head.id));
    assert.equal(head.expires, expiry);
    finish(e, s, head.id);
    const result = e.serve(s, head.id);
    assert.equal(result.stars, expected);
    assert.equal(result.fast, false);
    assert.ok(s.sales > 0);
  }
  const e = engine(), s = withOrder(e), head = s.queue[0];
  finish(e, s, head.id);
  e.advance(s, head.entered + 10000 - s.elapsed);
  const result = e.serve(s, head.id);
  assert.equal(result.stars, 5);
  assert.equal(result.fast, true);
});

test("old shifts keep money and recipe progress and apply new patience to elapsed waiting time", () => {
  const e = engine(), old = withOrder(e);
  old.version = 3; old.balance = 48000; old.elapsed = 200000; old.served = 3;
  old.queue[0].entered = 190000; old.queue[0].expires = 250000; old.stations[0].finish = 200900;
  delete old.stations[0].burnAt; delete old.stations[0].burnt;
  const s = e.restore(old);
  assert.equal(s.version, 14); assert.equal(s.balance, 48000); assert.equal(s.served, 3);
  assert.equal(s.promotion, 0); assert.equal(s.hospitality, 0);
  assert.equal(s.goal.id, "fast"); assert.equal(s.goal.progress, 0);
  assert.equal(s.staff, 0);
  assert.equal(s.reviewCount, 0);
  assert.equal(s.queue[0].expires - s.elapsed, 30000);
  assert.equal(s.stations[0].finish - s.elapsed, 900);
  assert.equal(s.stations[0].burnAt - s.elapsed, e.burnDelay);
});

test("guests leave after 30, 40 or 50 seconds and each records one one-star review", () => {
  for (const [roll, temper, wait] of [[.1, "hasty", 30000], [.5, "regular", 40000], [.3, "easy", 50000]]) {
    const e = engine(() => roll), s = e.fresh();
    e.advance(s, s.nextArrival);
    e.advance(s, s.nextArrival - s.elapsed);
    const order = s.queue[1];
    assert.equal(order.temper, temper);
    assert.equal(order.expires - order.entered, wait);
    e.advance(s, wait - 1);
    assert.ok(s.queue.includes(order));
    const reviews = s.reviewCount, stars = s.reviewStars;
    const events = e.advance(s, 1);
    assert.ok(events.some(event => event.type === "left" && event.order === order));
    const departures = events.filter(event => event.type === "left").length;
    assert.equal(s.queue.includes(order), false);
    assert.equal(s.reviewCount, reviews + departures);
    assert.equal(s.reviewStars, stars + departures);
    assert.equal(s.balance, 10000);
    const restored = e.restore(JSON.parse(JSON.stringify(s)));
    e.advance(restored, 0);
    assert.equal(restored.reviewCount, s.reviewCount);
  }
});

test("an overdue saved order expires on upgrade without rewinding the shift", () => {
  const e = engine(), old = withOrder(e), order = old.queue[0];
  old.version = 7;
  old.elapsed = order.entered + 41_000;
  old.nextArrival = null;
  order.expires = order.entered + 60_000;
  old.stations[0].finish = old.elapsed + 1500;
  old.stations[0].burnAt = old.elapsed + 12_000;
  const elapsed = old.elapsed;
  const restored = e.restore(old);
  assert.equal(restored.elapsed, elapsed);
  assert.equal(restored.queue.length, 0);
  assert.equal(restored.stations[0], null);
  assert.equal(restored.missed, 1);
  assert.equal(restored.reviewCount, 1);
  assert.equal(restored.reviewStars, 1);
});

test("already waiting orders use the new deadline measured from their original arrival", () => {
  const e = engine(), old = withOrder(e), order = old.queue[0];
  old.version = 8;
  order.expires = order.entered + 35_000;
  e.advance(old, 5000);
  const restored = e.restore(old);
  assert.equal(restored.queue[0].expires - restored.elapsed, 35_000);
  assert.equal(restored.reviewCount, 0);
});

test("an employee speeds up each recipe step on every stove while keeping the burn deadline", () => {
  const e = engine(), s = e.fresh();
  assert.equal(e.stepDuration(s), 2500);
  assert.equal(e.stepDuration({ ...s, staff: 1 }), 2000);
  assert.equal(e.stepDuration({ ...s, stoveLevels: [1] }), 2250);
  assert.equal(e.stepDuration({ ...s, stoveLevels: [2], staff: 1 }), 1500);
  s.balance = 100000;
  assert.ok(e.upgradeStove(s, 0));
  assert.equal(s.stations.length, 1);
  assert.ok(e.installStove(s));
  assert.ok(e.buyUpgrade(s, "staff"));
  assert.equal(e.installStove(s), false);
  e.advance(s, s.nextArrival);
  e.advance(s, s.nextArrival - s.elapsed);
  for (const [slot, order] of s.queue.entries()) {
    assert.ok(e.placeDish(s, slot, order.menu));
    assert.equal(s.stations[slot].finish - s.elapsed, e.stepDuration(s, slot, order.menu));
    assert.equal(s.stations[slot].burnAt - s.elapsed, e.burnDuration(s, order.menu));
  }
  const maxStep = Math.max(...s.queue.map((order, slot) => e.stepDuration(s, slot, order.menu)));
  e.advance(s, maxStep);
  for (const [slot, order] of s.queue.entries()) {
    assert.ok(e.prepareStep(s, order.id, 1));
    assert.equal(s.stations[slot].finish - s.elapsed, e.stepDuration(s, slot, order.menu));
  }
});

test("old branch owners get one employee and keep past earnings without a new closing bonus", () => {
  const e = engine(), old = withOrder(e);
  old.version = 4; old.branches = 3; delete old.staff;
  old.stations[0].finish = old.elapsed + 1500;
  old.history.push({ day: 1, sales: 25000, bonus: 10000 });
  const burnAt = old.stations[0].burnAt;
  const s = e.restore(old);
  assert.equal(s.staff, 1);
  assert.equal(s.stations[0].finish - s.elapsed, 1000);
  assert.equal(s.stations[0].burnAt, burnAt);
  assert.equal(e.restore(JSON.parse(JSON.stringify(s))).stations[0].finish, s.stations[0].finish);
  e.advance(s, e.shiftDuration - s.elapsed);
  e.settleDay(s);
  assert.equal(s.balance, 10000);
  assert.equal(s.staff, 1);
  assert.equal(s.history[0].bonus, 10000);
});

test("a timing hit makes the third step available immediately on every menu and tips on serving", () => {
  const e = engine();
  for (const [menu, dish] of e.menus.entries()) {
    for (const [percent, expected] of [[0, "missed"], [dish.timing.from, "hit"], [dish.timing.from + 40, "hit"], [96, "missed"], [null, null]]) {
      let s = e.fresh();
      s.deck[0] = menu;
      e.advance(s, s.nextArrival);
      const ticket = s.queue[0].id;
      assert.ok(e.placeDish(s, 0, menu));
      assert.equal(e.tryTiming(s, ticket), null);
      e.advance(s, e.stepDuration(s, 0, menu));
      assert.ok(e.prepareStep(s, ticket, 1));
      if (percent !== null) {
        e.advance(s, e.stepDuration(s, 0, menu) * percent / 100);
        assert.equal(e.tryTiming(s, ticket), expected);
        assert.equal(e.tryTiming(s, ticket), null);
      }
      assert.equal(s.balance, 10000);
      assert.equal(s.goal.progress, 0);
      const successful = expected === "hit";
      assert.equal(s.stations[0].step, successful ? 2 : 1);
      if (successful) assert.equal(s.stations[0].finish, null);
      s = e.restore(JSON.parse(JSON.stringify(s)));
      if (!successful) e.advance(s, s.stations[0].finish - s.elapsed);
      assert.ok(e.prepareStep(s, ticket, 2));
      e.advance(s, e.stepDuration(s, 0, menu));
      const expectedPrice = e.salePrice(s, menu);
      const result = e.serve(s, ticket);
      assert.equal(result.tip, successful ? e.dishTimingTip(s, menu) : 0);
      assert.equal(s.balance, 10000 + expectedPrice + result.tip);
      assert.equal(s.goal.progress, Number(successful && menu === e.dumplingMenu));
    }
  }
});

test("saving from the dumpling-only version advances a successful flip and initializes new upgrades", () => {
  const e = engine(), old = e.fresh();
  old.deck[0] = e.dumplingMenu;
  e.advance(old, old.nextArrival);
  const ticket = old.queue[0].id;
  assert.ok(e.placeDish(old, 0, e.dumplingMenu));
  e.advance(old, e.stepDuration(old));
  assert.ok(e.prepareStep(old, ticket, 1));
  const station = old.stations[0];
  old.version = 6; delete old.promotion; delete old.hospitality;
  station.flipStarted = station.timingStarted; delete station.timingStarted;
  station.flip = "crispy";
  e.advance(old, e.stepDuration(old) / 2);
  const restored = e.restore(old);
  assert.equal(e.timingProgress(restored, station), null);
  assert.equal(station.step, 2);
  assert.equal(station.finish, null);
  assert.equal(station.timingResult, "hit");
  assert.equal(e.tryTiming(restored, ticket), null);
  assert.equal(restored.promotion, 0);
  assert.equal(restored.hospitality, 0);
});

test("menu research and promotion apply at purchase and stop at their level caps", () => {
  const e = engine(), s = e.fresh();
  assert.equal(e.buyUpgrade(s, "quality"), false);
  s.balance = 1_000_000;
  for (let level = 1; level <= 6; level++) {
    assert.ok(e.buyUpgrade(s, "quality"));
    assert.equal(e.salePrice(s, 0), 3000 + e.featuredPriceBonus + 500 * level);
  }
  assert.equal(e.buyUpgrade(s, "quality"), false);
  const firstArrival = s.nextArrival;
  assert.ok(e.buyUpgrade(s, "promotion"));
  assert.equal(s.nextArrival, Math.round(firstArrival * .9));
  e.advance(s, s.nextArrival);
  assert.equal(s.nextArrival - s.elapsed, 9000);
  assert.ok(e.buyUpgrade(s, "promotion"));
  assert.ok(e.buyUpgrade(s, "promotion"));
  assert.equal(s.nextArrival - s.elapsed, 7000);
  assert.equal(e.buyUpgrade(s, "promotion"), false);
});

test("service training adds 0.2 stars per level with a five-star cap and keeps burnt orders at one star", () => {
  for (const [roll, expected] of [[.1, 3.6], [.5, 4.6], [.9, 5]]) {
    const e = engine(() => roll), s = e.fresh();
    s.balance = 150_000;
    for (let level = 1; level <= 3; level++) assert.ok(e.buyUpgrade(s, "hospitality"));
    assert.equal(e.buyUpgrade(s, "hospitality"), false);
    e.advance(s, s.nextArrival);
    const order = s.queue[0];
    assert.ok(e.placeDish(s, 0, order.menu));
    assert.equal(e.upgradeStove(s, 0), false);
    finish(e, s, order.id);
    e.advance(s, order.entered + 10_100 - s.elapsed);
    assert.equal(e.serve(s, order.id).stars, expected);
    if (!s.queue.length) e.advance(s, s.nextArrival - s.elapsed);
    const next = s.queue[0];
    assert.ok(e.placeDish(s, 0, next.menu));
    e.advance(s, e.burnDuration(s, next.menu));
    assert.equal(e.serve(s, next.id).stars, 1);
  }
});

test("a completed goal pays once at settlement and rotates the next day", () => {
  const e = engine(), s = e.fresh();
  s.deck[0] = e.dumplingMenu;
  e.advance(s, s.nextArrival);
  const ticket = s.queue[0].id;
  assert.ok(e.placeDish(s, 0, e.dumplingMenu));
  e.advance(s, e.stepDuration(s));
  assert.ok(e.prepareStep(s, ticket, 1));
  e.advance(s, e.stepDuration(s) / 2);
  assert.equal(e.tryTiming(s, ticket), "hit");
  assert.ok(e.prepareStep(s, ticket, 2));
  e.advance(s, e.stepDuration(s));
  e.serve(s, ticket);
  const balance = s.balance;
  assert.equal(e.goalReward(s.goal), e.dailyGoalReward);
  e.settleDay(s);
  assert.equal(s.balance, balance);
  e.advance(s, e.shiftDuration - s.elapsed);
  e.settleDay(s);
  e.settleDay(s);
  assert.equal(s.balance, balance + e.dailyGoalReward);
  assert.equal(s.history[0].goalReward, e.dailyGoalReward);
  assert.equal(s.history[0].goal.progress, 1);
  assert.equal(s.goal.id, "lunch"); assert.equal(s.goal.progress, 0);
});

test("one sale can finish a daily goal and multiple achievements and keeps the confirmation across reload", () => {
  const e = engine(), s = e.fresh();
  const ramen = e.achievements.find(a => a.id === "ramen-200");
  s.total = 199;
  s.records.dishSales[ramen.menu] = 199;
  s.records.fiveStars = 99;
  s.goal = { id: "fast", progress: 2 };
  s.deck[0] = ramen.menu;
  e.advance(s, s.nextArrival);
  const order = s.queue[0];
  assert.ok(e.placeDish(s, 0, order.menu));
  finish(e, s, order.id);
  assert.equal(e.serve(s, order.id).stars, 5);
  assert.equal(e.achievementProgress(e.achievementCounts(s), ramen), 200);
  assert.equal(e.achievementCounts(s).fiveStars, 100);
  assert.equal(s.celebration.goalId, "fast");
  assert.deepEqual(Array.from(s.celebration.unlocked).sort(), ["sales-200", "five-stars-100", "ramen-200", "goal-1"].sort());
  const restored = e.restore(JSON.parse(JSON.stringify(s)));
  assert.equal(restored.celebration.goalId, "fast");
  assert.equal(e.serve(restored, order.id), null);
  assert.equal(restored.records.dishSales[ramen.menu], 200);
});

test("known milestones carry over from older saves and the seventh closing unlocks only once", () => {
  const e = engine(), s = e.fresh();
  s.version = 9;
  s.day = 7;
  s.total = 80;
  s.history = Array.from({ length: 6 }, (_, i) => ({ day: i + 1, goalReward: i < 2 ? 3000 : 0 }));
  const restored = e.restore(JSON.parse(JSON.stringify(s)));
  const counts = e.achievementCounts(restored);
  assert.equal(counts.sales, 80);
  assert.equal(counts.goals, 2);
  assert.equal(counts.days, 6);
  assert.ok(counts.dishSales.every(count => count === 0));
  assert.equal(counts.fiveStars, 0);
  assert.equal(restored.celebration, null);
  e.advance(restored, e.shiftDuration);
  e.settleDay(restored);
  e.settleDay(restored);
  assert.deepEqual(Array.from(restored.celebration.unlocked), ["days-7"]);
  assert.equal(restored.day, 8);
});

test("thirty achievements have unique titles and both milestones use each dish's own saved count", () => {
  const e = engine(), catalog = e.achievements;
  assert.equal(catalog.length, 30);
  assert.equal(new Set(catalog.map(a => a.id)).size, 30);
  assert.equal(new Set(catalog.map(a => a.title)).size, 30);
  assert.equal(catalog.find(a => a.id === "ramen-200").title, "라면의 달인");
  for (const [menu] of e.menus.entries()) {
    const milestones = catalog.filter(a => a.menu === menu);
    assert.deepEqual(Array.from(milestones, a => a.target), [25, 200]);
    for (const milestone of milestones) {
      const s = e.fresh();
      s.records.dishSales[menu] = milestone.target - 1;
      s.deck[0] = menu;
      const restored = e.restore(JSON.parse(JSON.stringify(s)));
      assert.equal(e.achievementProgress(e.achievementCounts(restored), milestone), milestone.target - 1);
      e.advance(restored, restored.nextArrival);
      const order = restored.queue[0];
      assert.ok(e.placeDish(restored, 0, order.menu));
      finish(e, restored, order.id);
      e.serve(restored, order.id);
      assert.equal(e.achievementProgress(e.achievementCounts(restored), milestone), milestone.target);
      assert.deepEqual(Array.from(restored.celebration.unlocked).filter(id => id !== "first-sale"), [milestone.id]);
    }
  }
});

test("special guests offer five times the upgraded food price, then pause until claimed or skipped", () => {
  const e = engine(() => .1), s = e.fresh();
  s.arrived = 2;
  s.lastTicket = 2;
  s.quality = 2;
  s.nextArrival = s.elapsed + 1000;
  e.advance(s, 1000);
  const order = s.queue[0];
  assert.equal(order.special, true);
  assert.ok(e.placeDish(s, 0, order.menu));
  finish(e, s, order.id);
  const price = e.salePrice(s, order.menu);
  const balance = s.balance;
  assert.equal(e.serve(s, order.id).amount, price);
  assert.equal(s.pendingTip.amount, price * e.specialTipMultiplier);
  assert.equal(s.balance, balance + price);
  const elapsed = s.elapsed;
  e.advance(s, 30_000);
  assert.equal(s.elapsed, elapsed);
  const saved = e.restore(JSON.parse(JSON.stringify(s)));
  assert.equal(e.resolveSpecialTip(saved, order.id, true), price * 5);
  assert.equal(saved.balance, balance + price * 6);
  assert.equal(saved.sales, price * 6);
  assert.equal(e.resolveSpecialTip(saved, order.id, true), 0);
  assert.equal(saved.balance, balance + price * 6);
  e.advance(saved, 100);
  assert.equal(saved.elapsed, elapsed + 100);

  s.pendingTip = { ticket: 99, amount: 5000 };
  const beforeSkip = s.balance;
  assert.equal(e.resolveSpecialTip(s, 98, true), 0);
  assert.ok(s.pendingTip);
  assert.equal(e.resolveSpecialTip(s, 99, false), 0);
  assert.equal(s.pendingTip, null);
  assert.equal(s.balance, beforeSkip);
});


test("consecutive 5-star servings build combos, pay combo tips, trigger fever, and reset on mistakes", () => {
  const e = engine(() => .5), s = e.fresh();
  s.weather = "clear";
  for (let i = 1; i <= 5; i++) {
    if (!s.queue.length) e.advance(s, s.nextArrival - s.elapsed);
    const order = s.queue[0];
    assert.ok(e.placeDish(s, 0, order.menu));
    finish(e, s, order.id);
    const res = e.serve(s, order.id);
    assert.equal(res.stars, 5);
    assert.equal(res.combo, i);
    if (i < 3) assert.equal(res.comboTip, 0);
    if (i === 3) assert.equal(res.comboTip, 200);
    if (i === 4) assert.equal(res.comboTip, 400);
    if (i === 5) {
      assert.equal(res.comboTip, 600);
      assert.equal(res.feverTriggered, true);
      assert.equal(e.isFever(s), true);
    }
  }
  assert.equal(s.records.bestCombo, 5);
  assert.ok(e.stepDuration(s, 0, 1) < 2500);
  assert.equal(e.dishTimingTip(s, 7), e.menus[7].tip * 2);
  const restored = e.restore(JSON.parse(JSON.stringify(s)));
  assert.equal(e.isFever(restored), true);
  assert.equal(restored.combo, 5);

  if (!restored.queue.length) e.advance(restored, restored.nextArrival - restored.elapsed);
  const next = restored.queue[0];
  assert.ok(e.placeDish(restored, 0, next.menu));
  e.advance(restored, e.burnDuration(restored, next.menu));
  assert.equal(e.serve(restored, next.id).burnt, true);
  assert.equal(restored.combo, 0);
  assert.equal(e.isFever(restored), false);
});

test("guest affinity ranks unlock tips and star bonuses with double gain on favorite dishes", () => {
  const e = engine(() => .1), s = e.fresh();
  assert.equal(e.guestProfiles.length, 21);
  assert.equal(new Set(e.guestProfiles.map(g => g.favorite)).size, e.menus.length);
  e.advance(s, s.nextArrival);
  const order = s.queue[0];
  const favMenu = e.guestProfiles[order.guest].favorite;
  order.menu = favMenu;
  assert.ok(e.placeDish(s, 0, favMenu));
  finish(e, s, order.id);
  const firstRes = e.serve(s, order.id);
  assert.equal(firstRes.favorite, true);
  assert.equal(s.records.guestAffinity[order.guest], 2);

  s.records.guestAffinity[order.guest] = 2;
  e.advance(s, s.nextArrival - s.elapsed);
  const second = s.queue[0];
  second.guest = order.guest;
  second.menu = favMenu;
  assert.ok(e.placeDish(s, 0, favMenu));
  finish(e, s, second.id);
  const secondRes = e.serve(s, second.id);
  assert.equal(secondRes.rankUp.level, 1);
  assert.equal(e.guestRank(s.records.guestAffinity[order.guest]).name, "단골");

  s.records.guestAffinity[order.guest] = 15;
  e.advance(s, s.nextArrival - s.elapsed);
  const third = s.queue[0];
  third.guest = order.guest;
  third.menu = 0; // 야채김밥 has 15s burn delay so 10.5s serve does not burn
  assert.ok(e.placeDish(s, 0, third.menu));
  finish(e, s, third.id);
  e.advance(s, third.entered + 10_500 - s.elapsed);
  const thirdRes = e.serve(s, third.id);
  assert.equal(thirdRes.burnt, false);
  assert.equal(thirdRes.regularTip, 500);
  assert.equal(thirdRes.stars, 3.2);
});

test("weather forecasts, featured menu synergy, and expanded daily goals work across days", () => {
  const e = engine(() => .5), s = e.fresh();
  assert.equal(Object.keys(e.dailyGoals).length, 12);
  assert.equal(s.weather, "clear");
  assert.ok(e.setFeaturedMenu(s, 2));
  assert.equal(s.featuredMenu, 2);
  s.nextWeather = "rainy";
  e.advance(s, e.shiftDuration - s.elapsed);
  e.settleDay(s, 2);
  assert.equal(s.weather, "rainy");
  assert.equal(s.featuredMenu, 2);
  assert.equal(e.salePrice(s, 2), e.menus[2].price + e.weathers.rainy.priceBonus + e.featuredPriceBonus);

  e.advance(s, s.nextArrival);
  assert.ok(e.setFeaturedMenu(s, 6));
  assert.equal(s.featuredMenu, 2);
  assert.equal(s.nextFeaturedMenu, 6);
});

test("staff Lv.2 extends burn delay and timing window, and Lv.3 auto-starts pending dishes", () => {
  const e = engine(() => .5), s = e.fresh();
  s.balance = 300_000;
  assert.ok(e.buyUpgrade(s, "staff"));
  assert.equal(s.staff, 1);
  assert.equal(e.timingWindowFor(s), 40);
  assert.equal(e.burnDuration(s, 1), 12000);

  assert.ok(e.buyUpgrade(s, "staff"));
  assert.equal(s.staff, 2);
  assert.equal(e.timingWindowFor(s), 52);
  assert.equal(e.burnDuration(s, 1), 15000);

  assert.ok(e.buyUpgrade(s, "staff"));
  assert.equal(s.staff, 3);
  assert.equal(e.buyUpgrade(s, "staff"), false);

  e.advance(s, s.nextArrival);
  assert.equal(s.stations[0], null);
  assert.equal(s.staffAutoAt, s.elapsed + e.staffAutoDelay);
  const events = e.advance(s, e.staffAutoDelay);
  assert.ok(events.some(ev => ev.type === "staff-auto"));
  assert.ok(s.stations[0] !== null);
  assert.equal(s.stations[0].ticket, s.queue[0].id);
});

test("v13 saves migrate cleanly to v14 without losing active orders or records", () => {
  const e = engine(() => .5), s = withOrder(e);
  s.version = 13;
  delete s.combo; delete s.dayBestCombo; delete s.feverUntil; delete s.staffAutoAt;
  delete s.weather; delete s.nextWeather; delete s.featuredMenu; delete s.nextFeaturedMenu;
  delete s.records.bestCombo; delete s.records.guestVisits; delete s.records.guestAffinity;
  const finishBefore = s.stations[0].finish;
  const restored = e.restore(JSON.parse(JSON.stringify(s)));
  assert.equal(restored.version, 14);
  assert.equal(restored.stations[0].finish, finishBefore);
  assert.equal(restored.weather, "clear");
  assert.equal(restored.featuredMenu, 0);
  assert.equal(restored.combo, 0);
  assert.equal(restored.records.guestAffinity.length, 21);
  assert.equal(restored.records.guestVisits.length, 21);
});
