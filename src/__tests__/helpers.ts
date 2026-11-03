/**
 * jsdom has no layout, so tests place elements by stubbing their rects.
 */
export const place = (
  el: Element,
  {
    left,
    top,
    width,
    height
  }: { left: number; top: number; width: number; height: number }
): Element => {
  const rect = {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({})
  } as DOMRect;

  el.getBoundingClientRect = () => rect;
  el.getClientRects = () => [rect] as unknown as DOMRectList;

  return el;
};

export const box = (
  id: string,
  rect: { left: number; top: number; width: number; height: number },
  parent: Element = document.body
): HTMLElement => {
  const el = document.createElement('div');

  el.id = id;
  parent.appendChild(el);
  place(el, rect);

  return el;
};
