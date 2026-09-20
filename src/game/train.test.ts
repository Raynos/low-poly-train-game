import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTrain, stepTrain, choosePassenger, chooseSeat, pickFruit, trackPose, LOOP } from './train.ts';
test('hold accelerates gently; release stops immediately without drift', () => {
  const s = createTrain(); for (let i = 0; i < 600; i++) stepTrain(s, true);
  assert.equal(s.speed, 4.2); const d = s.distance;
  stepTrain(s, false); assert.equal(s.speed, 0); assert.equal(s.distance, d);
});
test('long or negative steps cannot teleport the train', () => {
  const s = createTrain(); stepTrain(s, true, 10); assert.ok(s.distance <= 4.041);
  const d = s.distance; stepTrain(s, true, -1); assert.equal(s.distance, d);
});
test('route is a continuous closed loop', () => {
  const a = trackPose(0), b = trackPose(LOOP);
  assert.ok(Math.abs(a.x - b.x) < 1e-10 && Math.abs(a.z - b.z) < 1e-10);
});
for (const destination of ['station', 'orchard'] as const) {
  test(`${destination}: arrival does not auto-complete activity on a sustained hold`, () => {
    const s = createTrain(destination);
    for (let i = 0; i < 2400; i++) stepTrain(s, true);
    assert.equal(s.phase, 'helping'); assert.equal(s.distance, s.stopAt); assert.equal(s.cargo, 0);
  });
}
test('station: child chooses order and seat; occupied seat keeps selection for another try', () => {
  const s = createTrain('station'); s.phase = 'helping';
  assert.equal(chooseSeat(s, 0), false);
  choosePassenger(s, 2); chooseSeat(s, 0);
  choosePassenger(s, 0); assert.equal(chooseSeat(s, 0), false); assert.equal(s.selected, 0);
  chooseSeat(s, 2); choosePassenger(s, 1); chooseSeat(s, 1);
  assert.equal(s.phase, 'riding'); assert.deepEqual(s.seats, [2, 1, 0]);
});
test('orchard: child can choose any tree repeatedly, no prescribed order', () => {
  const s = createTrain('orchard'); assert.equal(pickFruit(s, 0), false);
  s.phase = 'helping'; pickFruit(s, 2); pickFruit(s, 2); pickFruit(s, 0);
  assert.equal(s.phase, 'riding'); assert.deepEqual(s.fruit, [2, 2, 0]);
  assert.equal(pickFruit(s, 1), false);
});
test('meadow never forces an activity stop', () => {
  const s = createTrain(); for (let i = 0; i < 4000; i++) stepTrain(s, true);
  assert.equal(s.phase, 'driving'); assert.ok(s.distance > LOOP);
});

test('loaded journeys keep cargo aboard and finish at the station', () => {
  for (const destination of ['station','orchard'] as const) {
    const s = createTrain(destination); s.distance = s.stopAt; s.phase = 'helping';
    for (let i = 0; i < 3; i++) {
      if (destination === 'station') { choosePassenger(s, i); chooseSeat(s, i); } else pickFruit(s, i);
    }
    assert.equal(s.phase, 'riding');
    for (let i = 0; i < 2400; i++) stepTrain(s, true);
    assert.equal(s.phase, 'finished'); assert.equal(s.cargo, 3);
    assert.ok(Math.abs(trackPose(s.distance).x - 12) < 1e-8);
  }
});
