/**
 * Formatting utilities: HTML escaping, markdown conversion, number formatting.
 */

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;',
};

export function escapeHtml(s: unknown): string {
  return String(s).replace(/[&<>"']/g, (m) => HTML_ESCAPE_MAP[m]);
}

/**
 * Converts simple markdown to HTML.
 * Supports: # headings (h1-h3), - list items, and paragraphs.
 */
export function mdToHtml(md: string): string {
  const lines = md.split(/\r?\n/);
  let html = '';
  let listOpen = false;

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (!line) {
      if (listOpen) {
        html += '</ul>';
        listOpen = false;
      }
      continue;
    }
    if (line.startsWith('### ')) {
      if (listOpen) {
        html += '</ul>';
        listOpen = false;
      }
      html += '<h3 class="mt-4 text-sm font-semibold">' + escapeHtml(line.slice(4)) + '</h3>';
      continue;
    }
    if (line.startsWith('## ')) {
      if (listOpen) {
        html += '</ul>';
        listOpen = false;
      }
      html += '<h2 class="mt-5 text-base font-semibold">' + escapeHtml(line.slice(3)) + '</h2>';
      continue;
    }
    if (line.startsWith('# ')) {
      if (listOpen) {
        html += '</ul>';
        listOpen = false;
      }
      html += '<h1 class="mt-5 text-lg font-bold">' + escapeHtml(line.slice(2)) + '</h1>';
      continue;
    }
    if (line.startsWith('- ')) {
      if (!listOpen) {
        html += '<ul class="list-disc ml-5 mt-2 space-y-1">';
        listOpen = true;
      }
      html += '<li class="text-xs">' + escapeHtml(line.slice(2)) + '</li>';
      continue;
    }
    // paragraph
    if (listOpen) {
      html += '</ul>';
      listOpen = false;
    }
    html += '<p class="text-xs leading-relaxed mt-2">' + escapeHtml(line) + '</p>';
  }
  if (listOpen) html += '</ul>';
  return html;
}

/**
 * Compact number formatting with K/M suffixes.
 * Returns "—" for null/NaN.
 */
export function fmt(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '—';
  const a = Math.abs(n);
  if (a >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (a >= 1e3) return (n / 1e3).toFixed(2) + 'k';
  if (a === 0 || a >= 1) return n.toFixed(2);
  return n.toPrecision(3);
}

export interface KpiFmtOptions {
  decimals?: number;
}

/**
 * KPI number formatting with thousands separators.
 * Adjusts decimal places based on magnitude.
 */
export function kpiFmt(n: number | null | undefined, opts: KpiFmtOptions = {}): string {
  if (n == null || !isFinite(n)) return '—';
  const abs = Math.abs(n);

  if (opts.decimals != null) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: opts.decimals,
      maximumFractionDigits: opts.decimals,
    }).format(n);
  }
  if (abs >= 1000) {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(Math.round(n));
  }
  if (abs >= 100) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(n);
  }
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/** UTF-8-safe Base64 encoding. */
export function b64EncodeUnicode(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }
}

/** UTF-8-safe Base64 decoding. */
export function b64DecodeUnicode(b64: string): string {
  try {
    return decodeURIComponent(escape(atob(b64)));
  } catch {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }
}

/** Trigger a file download from text content. */
export function downloadFile(name: string, text: string): void {
  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(a.href);
  a.remove();
}
