import { contrastOnWhite, primaryColorProblem } from './contrast';

describe('contrastOnWhite', () => {
  it('computes the WCAG ratio against white', () => {
    expect(contrastOnWhite('#000000')).toBeCloseTo(21, 5);
    expect(contrastOnWhite('#FFFFFF')).toBeCloseTo(1, 5);
    expect(contrastOnWhite('#0B7F74')!).toBeGreaterThan(4.5);
    expect(contrastOnWhite('#1f4e79')!).toBeGreaterThan(4.5);
  });

  it('rejects malformed colours', () => {
    for (const value of ['0B7F74', '#7A294', '#0B7F741', '#GGGGGG', 'red']) {
      expect(contrastOnWhite(value)).toBeNull();
    }
  });
});

describe('primaryColorProblem', () => {
  it('accepts the default teal', () => {
    expect(primaryColorProblem('#0B7F74')).toBeNull();
  });

  it('rejects yellow with the ratio in the message', () => {
    const message = primaryColorProblem('#FFFF00');
    expect(message).toContain('1.07:1');
    expect(message).toContain('4.5:1');
  });

  it('explains malformed input', () => {
    expect(primaryColorProblem('#FFF')).toMatch(/hex colour/);
  });
});
