const { sum, multiply } = require('./sum');

describe('sum', () => {
  test('1 + 2 should equal 3', () => {
    expect(sum(1, 2)).toBe(3);
  });

  test('handles negative numbers', () => {
    expect(sum(-1, 1)).toBe(0);
  });

  test('handles zero', () => {
    expect(sum(0, 0)).toBe(0);
  });
});

describe('multiply', () => {
  test('2 * 3 should equal 6', () => {
    expect(multiply(2, 3)).toBe(6);
  });

  test('handles zero', () => {
    expect(multiply(5, 0)).toBe(0);
  });
});