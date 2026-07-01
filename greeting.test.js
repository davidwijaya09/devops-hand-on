const { greet } = require('./greeting');

describe('greet', () => {
  test('greets by name', () => {
    expect(greet('Budi')).toBe('Hello, Budi! Welcome to DevOps.');
  });

  test('greets another name', () => {
    expect(greet('Siti')).toContain('Siti');
  });
});