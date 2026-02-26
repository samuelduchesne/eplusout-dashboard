import { describe, expect, it } from 'vitest';
import { escapeText } from '../../src/utils/dom';

describe('escapeText', () => {
  it('escapes HTML payloads', () => {
    const input = '<img src=x onerror=alert(1)>';
    const out = escapeText(input);
    expect(out).toBe('&lt;img src=x onerror=alert(1)&gt;');
  });
});
