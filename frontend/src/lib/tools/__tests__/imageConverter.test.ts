import { describe, it, expect } from 'vitest';
import { mimeForFormat, extensionForFormat } from '../imageConverter';

describe('mimeForFormat', () => {
  it('maps png to image/png', () => {
    expect(mimeForFormat('png')).toBe('image/png');
  });
  it('maps jpeg to image/jpeg', () => {
    expect(mimeForFormat('jpeg')).toBe('image/jpeg');
  });
  it('maps webp to image/webp', () => {
    expect(mimeForFormat('webp')).toBe('image/webp');
  });
});

describe('extensionForFormat', () => {
  it('maps png to .png', () => {
    expect(extensionForFormat('png')).toBe('.png');
  });
  it('maps jpeg to .jpg (NOT .jpeg)', () => {
    expect(extensionForFormat('jpeg')).toBe('.jpg');
  });
  it('maps webp to .webp', () => {
    expect(extensionForFormat('webp')).toBe('.webp');
  });
});
