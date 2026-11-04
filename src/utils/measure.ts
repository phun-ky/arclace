import type { ArcRectInterface } from '../types';

/**
 * Where the SVG overlay is on screen, and how much it is scaled by CSS
 * transforms on its ancestors.
 */
export type ArcOriginType = {
  left: number;
  top: number;
  scaleX: number;
  scaleY: number;
};

/**
 * Measures the overlay so screen coordinates can be converted to coordinates
 * inside it. Because the overlay is measured directly, this works no matter
 * how the container is positioned, scrolled or scaled.
 */
export const getOrigin = (svg: SVGSVGElement): ArcOriginType => {
  const rect = svg.getBoundingClientRect();
  const { clientWidth, clientHeight } = svg;

  return {
    left: rect.left,
    top: rect.top,
    scaleX: clientWidth > 0 && rect.width > 0 ? rect.width / clientWidth : 1,
    scaleY: clientHeight > 0 && rect.height > 0 ? rect.height / clientHeight : 1
  };
};

/**
 * Measures an element in the overlay's coordinate system.
 *
 * @example
 * ```ts
 * const rect = getLocalRect(element, getOrigin(svg));
 * ```
 */
export const getLocalRect = (
  el: Element,
  origin: ArcOriginType
): ArcRectInterface => {
  const rect = el.getBoundingClientRect();
  const left = (rect.left - origin.left) / origin.scaleX;
  const top = (rect.top - origin.top) / origin.scaleY;
  const width = rect.width / origin.scaleX;
  const height = rect.height / origin.scaleY;

  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height
  };
};

/**
 * Whether an element is in the document and has a layout box, i.e. is not
 * `display: none`.
 */
export const isRendered = (el: Element): boolean =>
  el.isConnected && el.getClientRects().length > 0;
