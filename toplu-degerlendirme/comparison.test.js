const test = require('node:test');
const assert = require('node:assert/strict');

const { balancedOrder, calculateMetrics, scoreBand } = require('./comparison');

test('score bands include boundary values', () => {
  assert.equal(scoreBand(0), '0-2.49');
  assert.equal(scoreBand(2.5), '2.5-4.99');
  assert.equal(scoreBand(5), '5-7.49');
  assert.equal(scoreBand(7.5), '7.5-10');
  assert.equal(scoreBand(10), '7.5-10');
});

test('balanced order is deterministic and rotates questions', () => {
  const candidates = [];
  for (const questionId of ['q1', 'q2', 'q3']) {
    for (let index = 0; index < 8; index += 1) {
      const oldScore = [1, 3, 6, 9][index % 4];
      candidates.push({ questionId, oldScore, scoreBand: scoreBand(oldScore), answerId: `${questionId}-${index}` });
    }
  }
  const first = balancedOrder(candidates, 20261102);
  const second = balancedOrder(candidates, 20261102);
  assert.deepEqual(first.map((item) => item.answerId), second.map((item) => item.answerId));
  assert.equal(new Set(first.slice(0, 3).map((item) => item.questionId)).size, 3);
});

test('metrics apply score-only similarity and failure penalty', () => {
  const manifest = {
    items: [
      { answerId: 'a', questionId: 'q1', question: 'Soru 1', fileKey: 'a.webm', oldScore: 8 },
      { answerId: 'b', questionId: 'q1', question: 'Soru 1', fileKey: 'b.webm', oldScore: 5 },
      { answerId: 'c', questionId: 'q2', question: 'Soru 2', fileKey: 'c.webm', oldScore: 3 },
    ],
  };
  const results = [
    { answerId: 'a', status: 'SUCCESS', evaluationScore: 7 },
    { answerId: 'b', status: 'SUCCESS', evaluationScore: 5 },
    { answerId: 'c', status: 'FAILED' },
  ];
  const output = calculateMetrics(manifest, results);
  assert.equal(output.success, 2);
  assert.equal(output.failed, 1);
  assert.equal(output.meanSimilarity, 95);
  assert.equal(output.effectiveSimilarity, 190 / 3);
  assert.equal(output.mae, 0.5);
  assert.equal(output.withinOneRate, 100);
});
