import { describe, it, expect } from 'vitest';
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb } from '../colorConverter';

describe('hexToRgb', () => {
  it('parses 6-digit hex', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
    expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('parses 3-digit shorthand', () => {
    expect(hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('accepts hex without leading #', () => {
    expect(hexToRgb('ff0000')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('throws on invalid hex', () => {
    expect(() => hexToRgb('#xyz')).toThrow();
  });
});

describe('rgbToHex', () => {
  it('formats RGB as #RRGGBB', () => {
    expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#ff0000');
    expect(rgbToHex({ r: 16, g: 32, b: 48 })).toBe('#102030');
  });
});

describe('rgbToHsl / hslToRgb', () => {
  it('round-trips pure red', () => {
    const hsl = rgbToHsl({ r: 255, g: 0, b: 0 });
    expect(hsl.h).toBe(0);
    expect(hsl.s).toBe(100);
    expect(hsl.l).toBe(50);
    expect(hslToRgb(hsl)).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('round-trips pure green', () => {
    const hsl = rgbToHsl({ r: 0, g: 255, b: 0 });
    expect(hsl.h).toBe(120);
    expect(hslToRgb(hsl)).toEqual({ r: 0, g: 255, b: 0 });
  });

  it('round-trips pure blue', () => {
    const hsl = rgbToHsl({ r: 0, g: 0, b: 255 });
    expect(hsl.h).toBe(240);
    expect(hslToRgb(hsl)).toEqual({ r: 0, g: 0, b: 255 });
  });
});
