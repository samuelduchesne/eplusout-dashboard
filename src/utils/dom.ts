export function escapeText(input: string): string {
  return String(input).replace(/[&<>"']/g, (m) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return map[m] ?? m;
  });
}

export function clearChildren(element: Element): void {
  while (element.firstChild) element.removeChild(element.firstChild);
}

export function appendText(parent: Element, text: string): void {
  parent.appendChild(document.createTextNode(text));
}

export function renderTrustedTemplate(parent: Element, trustedHtml: string): void {
  // eslint-disable-next-line no-unsanitized/property
  parent.innerHTML = trustedHtml;
}
