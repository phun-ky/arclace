import type {
  ArcArrowType,
  ArcConnectionOptionsType,
  ArcOptionsType,
  ArcPathType,
  ArcPointInterface,
  ArcSideOptionType,
  ArcSideType,
  ArcWaypointType
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
 * The largest option or `via` coordinate Arclace accepts, either way. Far
 * beyond any layout (browsers stop at about 3.3e7 px), and small enough that
 * the path math can't overflow to `Infinity` or `NaN`.
 */
export const MAX_NUMBER = 1e9;

/**
 * The largest coordinate the path functions accept. Larger than
 * `MAX_NUMBER`, so the points Arclace works out (an element's edge moved by
 * `gap`, `offset` or spreading) always pass, and still far from overflowing.
 */
export const MAX_COORDINATE = 1e15;

/**
 * Throws a `TypeError` unless `value` is a finite number, and a `RangeError`
 * when it is below `min`, or further than `max` from 0.
 */
export const assertNumber = (
  value: unknown,
  name: string,
  min?: number,
  max = MAX_NUMBER
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

  if (Math.abs(value) > max) {
    throw new RangeError(
      `arclace: ${name} must be between -${max} and ${max}, not ${show(value)}`
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
 * Throws a `TypeError` unless `value` is a point with finite `x` and `y`, and
 * a `RangeError` when either is further than `max` from 0.
 */
export const assertPoint = (
  value: unknown,
  name: string,
  max = MAX_COORDINATE
): ArcPointInterface => {
  assertObject(value, name);

  const { x, y } = value as Record<string, unknown>;

  assertNumber(x, `${name}.x`, undefined, max);
  assertNumber(y, `${name}.y`, undefined, max);

  return value as ArcPointInterface;
};

/**
 * Throws a `TypeError` unless `value` is an array of non-empty strings, and a
 * `RangeError` when it has fewer than two.
 */
export const assertColors = (value: unknown, name: string): string[] => {
  if (!Array.isArray(value)) {
    throw new TypeError(
      `arclace: ${name} must be an array of colors, not ${show(value)}`
    );
  }

  value.forEach((color, index) =>
    assertString(color, `${name}[${index}]`, true)
  );

  if (value.length < 2) {
    throw new RangeError(
      `arclace: ${name} must have 2 colors or more, not ${value.length}`
    );
  }

  return value;
};

/**
 * The numbers in a dash pattern, given as a string such as `'4, 2'` or as
 * numbers.
 */
export const dashNumbers = (value: string | number[]): number[] =>
  typeof value === 'string'
    ? value
        .split(/[\s,]+/)
        .filter(Boolean)
        .map(Number)
    : value;

/**
 * Throws a `TypeError` unless `value` is a string or an array of numbers, and
 * a `RangeError` unless it holds one or more numbers, all 0 or more.
 */
export const assertDashArray = (value: unknown, name: string): number[] => {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNumber(item, `${name}[${index}]`, 0));
  } else if (typeof value !== 'string') {
    throw new TypeError(
      `arclace: ${name} must be a string or an array of numbers, not ${show(value)}`
    );
  }

  const numbers = dashNumbers(value as string | number[]);

  // Units and percentages are refused, so the pattern's length is known
  if (
    numbers.length === 0 ||
    numbers.some((number) => !Number.isFinite(number) || number < 0)
  ) {
    throw new RangeError(
      `arclace: ${name} must be numbers of 0 or more, separated by spaces or commas, not ${show(value)}`
    );
  }

  return numbers;
};

/**
 * Throws a `TypeError` unless `value` is a boolean or a finite number, and a
 * `RangeError` when it is a number below 0.
 */
export const assertBooleanOrLength = (
  value: unknown,
  name: string
): boolean | number => {
  if (typeof value === 'boolean') return value;

  if (typeof value !== 'number') {
    throw new TypeError(
      `arclace: ${name} must be true, false or a number, not ${show(value)}`
    );
  }

  return assertNumber(value, name, 0);
};

/**
 * Throws a `TypeError` unless `value` is an array of elements, non-empty
 * strings and points.
 */
export const assertWaypoints = (
  value: unknown,
  name: string
): ArcWaypointType[] => {
  if (!Array.isArray(value)) {
    throw new TypeError(
      `arclace: ${name} must be an array of elements, selectors or points, not ${show(value)}`
    );
  }

  value.forEach((waypoint, index) => {
    const item = `${name}[${index}]`;

    if (typeof waypoint === 'string') assertString(waypoint, item, true);
    else if (typeof waypoint === 'object' && waypoint !== null) {
      if (!(waypoint instanceof Element))
        assertPoint(waypoint, item, MAX_NUMBER);
    } else {
      throw new TypeError(
        `arclace: ${item} must be an element, a selector or a point, not ${show(waypoint)}`
      );
    }
  });

  return value;
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
  gradient: assertColors,
  className: assertString,
  strokeWidth: (value, name) => assertNumber(value, name, 0),
  dashed: assertBoolean,
  dashArray: assertDashArray,
  animated: assertBoolean,
  glow: assertBooleanOrLength,
  anchors: assertBoolean,
  gap: (value, name) => assertNumber(value, name),
  spread: assertBoolean,
  spacing: (value, name) => assertNumber(value, name, 0),
  curvature: (value, name) => assertNumber(value, name),
  startCurvature: (value, name) => assertNumber(value, name),
  endCurvature: (value, name) => assertNumber(value, name),
  via: assertWaypoints,
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

  const { autoUpdate, className, defaults, zIndex } = options as Record<
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

  if (
    zIndex !== undefined &&
    // z-index isn't geometry, and 2147483647 is a common value, so no MAX_NUMBER
    !Number.isInteger(
      assertNumber(zIndex, 'options.zIndex', undefined, Infinity)
    )
  ) {
    throw new RangeError(
      `arclace: options.zIndex must be a whole number, not ${show(zIndex)}`
    );
  }

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
