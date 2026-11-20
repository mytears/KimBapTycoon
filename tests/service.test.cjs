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
        clockMinutes, daypartAt, burnDelay, stepDuration, shiftDuration, scheduleArrival,
        tryTiming, timingProgress, timingTip, dumplingMenu, ramenMenu, menus, buyUpgrade, salePrice,
        achievementCounts, goalReward, dailyGoalReward })
  `, { Math: math });
}
function withOrder(e) {
  const s = e.fresh();
  e.advance(s, s.nextArrival);
  assert.ok(e.placeDish(s, 0, s.queue[0].menu));
  return s;
}
function finish(e, s, ticket) {
  e.advance(s, e.stepDuration(s));
  for (const step of [1, 2]) {
    assert.ok(e.prepareStep(s, ticket, step));
    e.advance(s, e.stepDuration(s));
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
        e.advance(s, e.stepDuration(s));
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
    s.speed = 1; s.stations.push(null);
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
  assert.equal(s.version, 10); assert.equal(s.balance, 48000); assert.equal(s.served, 3);
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
  assert.equal(e.stepDuration({ ...s, speed: 1 }), 2250);
  assert.equal(e.stepDuration({ ...s, speed: 2, staff: 1 }), 1500);
  s.speed = 1; s.staff = 1; s.stations.push(null);
  e.advance(s, s.nextArrival);
  e.advance(s, s.nextArrival - s.elapsed);
  for (const [slot, order] of s.queue.entries()) {
    assert.ok(e.placeDish(s, slot, order.menu));
    assert.equal(s.stations[slot].finish - s.elapsed, 1750);
    assert.equal(s.stations[slot].burnAt - s.elapsed, e.burnDelay);
  }
  e.advance(s, e.stepDuration(s));
  for (const [slot, order] of s.queue.entries()) {
    assert.ok(e.prepareStep(s, order.id, 1));
    assert.equal(s.stations[slot].finish - s.elapsed, 1750);
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
      e.advance(s, e.stepDuration(s));
      assert.ok(e.prepareStep(s, ticket, 1));
      if (percent !== null) {
        e.advance(s, e.stepDuration(s) * percent / 100);
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
      e.advance(s, e.stepDuration(s));
      const result = e.serve(s, ticket);
      assert.equal(result.tip, successful ? e.timingTip : 0);
      assert.equal(s.balance, 10000 + dish.price + result.tip);
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
    assert.equal(e.salePrice(s, 0), 3000 + 500 * level);
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
    assert.equal(e.buyUpgrade(s, "speed"), false);
    finish(e, s, order.id);
    e.advance(s, order.entered + 10_100 - s.elapsed);
    assert.equal(e.serve(s, order.id).stars, expected);
    if (!s.queue.length) e.advance(s, s.nextArrival - s.elapsed);
    const next = s.queue[0];
    assert.ok(e.placeDish(s, 0, next.menu));
    e.advance(s, e.burnDelay);
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
  s.total = 199;
  s.records.dishSales[e.ramenMenu] = 199;
  s.records.fiveStars = 99;
  s.goal = { id: "fast", progress: 2 };
  s.deck[0] = e.ramenMenu;
  e.advance(s, s.nextArrival);
  const order = s.queue[0];
  assert.ok(e.placeDish(s, 0, order.menu));
  finish(e, s, order.id);
  assert.equal(e.serve(s, order.id).stars, 5);
  assert.equal(e.achievementCounts(s).ramen, 200);
  assert.equal(e.achievementCounts(s).fiveStars, 100);
  assert.equal(s.celebration.goalId, "fast");
  assert.deepEqual(Array.from(s.celebration.unlocked), ["sales-200", "five-stars-100", "ramen-200", "goal-1"]);
  const restored = e.restore(JSON.parse(JSON.stringify(s)));
  assert.equal(restored.celebration.goalId, "fast");
  assert.equal(e.serve(restored, order.id), null);
  assert.equal(restored.records.dishSales[e.ramenMenu], 200);
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
  assert.equal(counts.ramen, 0);
  assert.equal(counts.fiveStars, 0);
  assert.equal(restored.celebration, null);
  e.advance(restored, e.shiftDuration);
  e.settleDay(restored);
  e.settleDay(restored);
  assert.deepEqual(Array.from(restored.celebration.unlocked), ["days-7"]);
  assert.equal(restored.day, 8);
});
