import type {
  ArcArrowType,
  ArcConnectionOptionsType,
  ArcOptionsType,
  ArcPathType,
  ArcPointInterface,
  ArcSideOptionType,
  ArcSideType
} from '../types';

export const SIDES: readonly ArcSideType[] = Object.freeze([
  'top',
  'right',
  'bottom',
  'left'
]);

export const SIDE_OPTIONS: readonly ArcSideOptionType[] = Object.freeze([
  ...SIDES,
  'auto'
]);

export const PATH_TYPES: readonly ArcPathType[] = Object.freeze([
  'bezier',
  'straight',
  'orthogonal'
]);

export const ARROWS: readonly ArcArrowType[] = Object.freeze([
  'none',
  'start',
  'end',
  'both'
]);

/**
 * A short description of a value for an error message, which never calls
 * the value's own `toString`.
 */
const show = (value: unknown): string => {
  if (typeof value === 'string') return JSON.stringify(value);

  if (
    value === null ||
    value === undefined ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  )
    return String(value);

  if (Array.isArray(value)) return 'an array';

  return typeof value === 'object' ? 'an object' : `a ${typeof value}`;
};

/**
 * Throws a `TypeError` unless `value` is a plain object (not `null` or an
 * array).
 */
export const assertObject = (value: unknown, name: string): void => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError(
      `arclace: ${name} must be an object, not ${show(value)}`
    );
  }
};

/**
 * Throws a `TypeError` unless `value` is a string, and a `RangeError` unless
 * it is one of `allowed`.
 */
export const assertOneOf = <T extends string>(
  value: unknown,
  allowed: readonly T[],
  name: string
): T => {
  const list = allowed.map((item) => `"${item}"`).join(', ');

  if (typeof value !== 'string') {
    throw new TypeError(
      `arclace: ${name} must be one of ${list}, not ${show(value)}`
    );
  }

  if (!allowed.includes(value as T)) {
    throw new RangeError(
      `arclace: ${name} must be one of ${list}, not ${show(value)}`
    );
  }

  return value as T;
};

/**
 * Throws a `TypeError` unless `value` is a finite number, and a `RangeError`
 * when it is below `min`.
 */
export const assertNumber = (
  value: unknown,
  name: string,
  min?: number
): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(
      `arclace: ${name} must be a finite number, not ${show(value)}`
    );
  }

  if (min !== undefined && value < min) {
    throw new RangeError(
      `arclace: ${name} must be ${min} or more, not ${show(value)}`
    );
  }

  return value;
};

/**
 * Throws a `TypeError` unless `value` is a boolean.
 */
export const assertBoolean = (value: unknown, name: string): boolean => {
  if (typeof value !== 'boolean') {
    throw new TypeError(
      `arclace: ${name} must be true or false, not ${show(value)}`
    );
  }

  return value;
};

/**
 * Throws a `TypeError` unless `value` is a string, or, with `nonEmpty`, a
 * string with at least one character.
 */
export const assertString = (
  value: unknown,
  name: string,
  nonEmpty = false
): string => {
  if (typeof value !== 'string' || (nonEmpty && value === '')) {
    throw new TypeError(
      `arclace: ${name} must be a ${nonEmpty ? 'non-empty ' : ''}string, not ${show(value)}`
    );
  }

  return value;
};

/**
 * Throws a `TypeError` unless `value` is a point with finite `x` and `y`.
 */
export const assertPoint = (
  value: unknown,
  name: string
): ArcPointInterface => {
  assertObject(value, name);

  const { x, y } = value as Record<string, unknown>;

  assertNumber(x, `${name}.x`);
  assertNumber(y, `${name}.y`);

  return value as ArcPointInterface;
};

// How each connection option is checked. Keys that aren't listed are ignored.
const CONNECTION_OPTION_CHECKS: Readonly<
  Record<
    keyof ArcConnectionOptionsType,
    (value: unknown, name: string) => unknown
  >
> = Object.freeze({
  id: (value, name) => assertString(value, name, true),
  type: (value, name) => assertOneOf(value, PATH_TYPES, name),
  startSide: (value, name) => assertOneOf(value, SIDE_OPTIONS, name),
  endSide: (value, name) => assertOneOf(value, SIDE_OPTIONS, name),
  arrow: (value, name) => assertOneOf(value, ARROWS, name),
  label: assertString,
  color: assertString,
  className: assertString,
  strokeWidth: (value, name) => assertNumber(value, name, 0),
  dashed: assertBoolean,
  animated: assertBoolean,
  anchors: assertBoolean,
  gap: (value, name) => assertNumber(value, name),
  spread: assertBoolean,
  spacing: (value, name) => assertNumber(value, name, 0),
  curvature: (value, name) => assertNumber(value, name),
  radius: (value, name) => assertNumber(value, name, 0),
  offset: (value, name) => assertNumber(value, name, 0)
});

/**
 * Checks every known connection option that is set. `undefined` means "use
 * the default" and is always allowed; unknown keys are ignored.
 *
 * @throws {TypeError} When `options` isn't an object, or an option has the
 *   wrong type.
 * @throws {RangeError} When an option is out of range.
 */
export const validateConnectionOptions = (
  options: unknown,
  name = 'options'
): ArcConnectionOptionsType => {
  assertObject(options, name);

  for (const [key, check] of Object.entries(CONNECTION_OPTION_CHECKS)) {
    const value = Object.hasOwn(options as object, key)
      ? (options as Record<string, unknown>)[key]
      : undefined;

    if (value !== undefined) check(value, `${name}.${key}`);
  }

  return options as ArcConnectionOptionsType;
};

/**
 * Checks the options of an instance, including its connection defaults.
 */
export const validateOptions = (options: unknown): ArcOptionsType => {
  assertObject(options, 'options');

  const { autoUpdate, className, defaults } = options as Record<
    string,
    unknown
  >;

  if (
    autoUpdate !== undefined &&
    typeof autoUpdate !== 'boolean' &&
    autoUpdate !== 'frame'
  ) {
    throw new RangeError(
      `arclace: options.autoUpdate must be true, false or "frame", not ${show(autoUpdate)}`
    );
  }

  if (className !== undefined) assertString(className, 'options.className');

  if (defaults !== undefined) {
    validateConnectionOptions(defaults, 'options.defaults');

    // Every connection would get the same id, so only the first could be made
    if ((defaults as ArcConnectionOptionsType).id !== undefined) {
      throw new TypeError(
        'arclace: options.defaults cannot set an id; ids belong to single connections'
      );
    }
  }

  return options as ArcOptionsType;
};
