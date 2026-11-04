import { ArclaceError } from '../errors';

/**
 * Runs `document.querySelector`, turning an invalid selector into an
 * {@link ArclaceError} with the browser's `SyntaxError` as the cause.
 */
export const querySelector = (
  selector: string,
  name = 'element'
): Element | null => {
  try {
    return document.querySelector(selector);
  } catch (error) {
    throw new ArclaceError(`${name} "${selector}" is not a valid selector`, {
      cause: error
    });
  }
};

/**
 * Resolves an element or a CSS selector to an element.
 *
 * @throws {TypeError} When the target is neither an element nor a string.
 * @throws {ArclaceError} When the selector is invalid or matches nothing.
 * @example
 * ```ts
 * const el = resolveElement('#box-1');
 * ```
 */
export const resolveElement = (target: unknown, name = 'element'): Element => {
  if (typeof target === 'string') {
    const el = querySelector(target, name);

    if (!el) throw new ArclaceError(`no ${name} matches "${target}"`);

    return el;
  }

  if (!(target instanceof Element)) {
    throw new TypeError(
      `arclace: ${name} must be an Element or a selector string`
    );
  }

  return target;
};
