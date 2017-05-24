import add from "../index";

describe('add', () => {
  it('adds 3 and 2', () => {
    expect(add(3, 2)).toBe(5);
  });
  it('adds 9 and -100', () => {
    expect(add(9, -100)).toBe(-91);
  });
});
