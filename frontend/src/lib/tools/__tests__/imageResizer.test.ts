import { describe, it, expect } from 'vitest';
import { calculateAspectFit } from '../imageResizer';

describe('calculateAspectFit', () => {
  it('keeps aspect ratio when fitting wide image into square box', () => {
    expect(calculateAspectFit(2000, 1000, 500, 500)).toEqual({ width: 500, height: 250 });
  });

  it('keeps aspect ratio when fitting tall image into square box', () => {
    expect(calculateAspectFit(1000, 2000, 500, 500)).toEqual({ width: 250, height: 500 });
  });

  it('does not upscale by default', () => {
    expect(calculateAspectFit(100, 100, 500, 500)).toEqual({ width: 100, height: 100 });
  });

  it('handles equal aspect ratio', () => {
    expect(calculateAspectFit(800, 600, 400, 300)).toEqual({ width: 400, height: 300 });
  });

  it('handles square source into wide box', () => {
    expect(calculateAspectFit(500, 500, 1000, 500)).toEqual({ width: 500, height: 500 });
  });
});
