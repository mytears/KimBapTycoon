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
        clockMinutes, daypartAt, burnDelay, stepDuration, shiftDuration, scheduleArrival })
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
  assert.equal(e.serve(loaded, id), null);
  assert.equal(loaded.reviewCount, 1);
});

test("ratings use time since arrival, including a remake, while each station has its own burn deadline", () => {
  for (const [roll, expected] of [[.1, 3], [.9, 4]]) {
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
    assert.equal(e.serve(s, head.id).stars, expected);
    assert.ok(s.sales > 0);
  }
  const e = engine(), s = withOrder(e), head = s.queue[0];
  finish(e, s, head.id);
  e.advance(s, head.entered + 10000 - s.elapsed);
  assert.equal(e.serve(s, head.id).stars, 5);
});

test("old shifts keep money, review-free sales and remaining guest and recipe timers", () => {
  const e = engine(), old = withOrder(e);
  old.version = 3; old.balance = 48000; old.elapsed = 200000; old.served = 3;
  old.queue[0].entered = 190000; old.queue[0].expires = 250000; old.stations[0].finish = 200900;
  delete old.stations[0].burnAt; delete old.stations[0].burnt;
  const s = e.restore(old);
  assert.equal(s.version, 4); assert.equal(s.balance, 48000); assert.equal(s.served, 3);
  assert.equal(s.reviewCount, 0);
  assert.equal(s.queue[0].expires - s.elapsed, 50000);
  assert.equal(s.stations[0].finish - s.elapsed, 900);
  assert.equal(s.stations[0].burnAt - s.elapsed, e.burnDelay);
});
