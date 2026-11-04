import type { ArcElementTargetType } from '../types';

/**
 * Resolves an element or a CSS selector to an element.
 *
 * @throws {Error} When the selector matches nothing or the target is not an element.
 * @example
 * ```ts
 * const el = resolveElement('#box-1');
 * ```
 */
export const resolveElement = (
  target: ArcElementTargetType,
  name = 'element'
): Element => {
  if (typeof target === 'string') {
    const el = document.querySelector(target);

    if (!el) throw Error(`arclace: no ${name} matches "${target}"`);

    return el;
  }

  if (!(target instanceof Element)) {
    throw Error(`arclace: ${name} must be an Element or a selector string`);
  }

  return target;
};
