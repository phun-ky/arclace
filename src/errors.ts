/**
 * Thrown when Arclace can't do what was asked, for example when a selector
 * matches nothing, an id is taken, or the instance has been destroyed.
 *
 * Arguments of the wrong type throw a `TypeError`, and values out of range a
 * `RangeError`, instead. When another error is behind the failure, such as
 * an invalid selector, it is the `cause`.
 *
 * @example
 * ```ts
 * try {
 *   arclace.connect('#a', '#b', { id: 'a-to-b' });
 *   arclace.connect('#b', '#c', { id: 'a-to-b' }); // the id is taken
 * } catch (error) {
 *   if (error instanceof ArclaceError) console.warn(error.message);
 * }
 * ```
 */
export class ArclaceError extends Error {
  override name = 'ArclaceError';

  constructor(message: string, options?: ErrorOptions) {
    super(`arclace: ${message}`, options);
  }
}
