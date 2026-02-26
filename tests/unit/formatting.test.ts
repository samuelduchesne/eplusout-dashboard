import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  mdToHtml,
  fmt,
  kpiFmt,
  b64EncodeUnicode,
  b64DecodeUnicode,
} from '../../src/lib/formatting';

describe('escapeHtml', () => {
  it('escapes HTML special characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    );
  });

  it('escapes ampersands and single quotes', () => {
    expect(escapeHtml("Tom & Jerry's")).toBe('Tom &amp; Jerry&#039;s');
  });

  it('handles non-string input', () => {
    expect(escapeHtml(42)).toBe('42');
    expect(escapeHtml(null)).toBe('null');
  });
});

describe('mdToHtml', () => {
  it('converts headings', () => {
    expect(mdToHtml('# Title')).toContain('<h1');
    expect(mdToHtml('## Subtitle')).toContain('<h2');
    expect(mdToHtml('### Section')).toContain('<h3');
  });

  it('converts list items', () => {
    const result = mdToHtml('- item one\n- item two');
    expect(result).toContain('<ul');
    expect(result).toContain('<li');
    expect(result).toContain('item one');
    expect(result).toContain('item two');
  });

  it('converts paragraphs', () => {
    expect(mdToHtml('Hello world')).toContain('<p');
  });

  it('closes open lists before headings', () => {
    const result = mdToHtml('- item\n# Heading');
    expect(result).toContain('</ul>');
    expect(result).toContain('<h1');
  });
});

describe('fmt', () => {
  it('returns — for null/NaN', () => {
    expect(fmt(null)).toBe('—');
    expect(fmt(undefined)).toBe('—');
    expect(fmt(NaN)).toBe('—');
  });

  it('formats millions with M suffix', () => {
    expect(fmt(1500000)).toBe('1.50M');
  });

  it('formats thousands with k suffix', () => {
    expect(fmt(2500)).toBe('2.50k');
  });

  it('formats regular numbers with 2 decimals', () => {
    expect(fmt(42)).toBe('42.00');
  });

  it('uses toPrecision for small numbers', () => {
    expect(fmt(0.00123)).toBe('0.00123');
  });
});

describe('kpiFmt', () => {
  it('returns — for null/NaN/Infinity', () => {
    expect(kpiFmt(null)).toBe('—');
    expect(kpiFmt(Infinity)).toBe('—');
  });

  it('formats large numbers with no decimals', () => {
    expect(kpiFmt(12345)).toBe('12,345');
  });

  it('formats medium numbers with 1 decimal', () => {
    expect(kpiFmt(123.456)).toBe('123.5');
  });

  it('formats small numbers with 2 decimals', () => {
    expect(kpiFmt(12.345)).toBe('12.35');
  });

  it('respects explicit decimals', () => {
    expect(kpiFmt(12345.678, { decimals: 3 })).toBe('12,345.678');
  });
});

describe('b64EncodeUnicode / b64DecodeUnicode', () => {
  it('round-trips ASCII text', () => {
    const text = 'Hello, World!';
    expect(b64DecodeUnicode(b64EncodeUnicode(text))).toBe(text);
  });

  it('round-trips Unicode text', () => {
    const text = 'Héllo Wörld 🌍';
    expect(b64DecodeUnicode(b64EncodeUnicode(text))).toBe(text);
  });
});
