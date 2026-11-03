export const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Creates an SVG element with the given attributes.
 *
 * @example
 * ```ts
 * const path = createSVGElement('path', { fill: 'none' });
 * ```
 */
export const createSVGElement = <K extends keyof SVGElementTagNameMap>(
  tagName: K,
  attributes: Record<string, string | number> = {}
): SVGElementTagNameMap[K] => {
  const el = document.createElementNS(SVG_NS, tagName);

  setAttributes(el, attributes);

  return el;
};

/**
 * Sets attributes on an element. `null` and `undefined` values remove the
 * attribute.
 */
export const setAttributes = (
  el: Element,
  attributes: Record<string, string | number | null | undefined>
): void => {
  for (const [name, value] of Object.entries(attributes)) {
    if (value === null || value === undefined) el.removeAttribute(name);
    else el.setAttribute(name, String(value));
  }
};
