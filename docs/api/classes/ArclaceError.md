[@phun-ky/arclace](../index.md) / ArclaceError

# Class: ArclaceError

Defined in: [src/errors.ts:19](https://github.com/phun-ky/arclace/blob/main/src/errors.ts#L19)

Thrown when Arclace can't do what was asked, for example when a selector
matches nothing, an id is taken, or the instance has been destroyed.

Arguments of the wrong type throw a `TypeError`, and values out of range a
`RangeError`, instead. When another error is behind the failure, such as
an invalid selector, it is the `cause`.

## Example

```ts
try {
  arclace.connect('#a', '#b', { id: 'a-to-b' });
  arclace.connect('#b', '#c', { id: 'a-to-b' }); // the id is taken
} catch (error) {
  if (error instanceof ArclaceError) console.warn(error.message);
}
```

## Extends

- `Error`

## Constructors

### Constructor

> **new ArclaceError**(`message`, `options?`): `ArclaceError`

Defined in: [src/errors.ts:22](https://github.com/phun-ky/arclace/blob/main/src/errors.ts#L22)

#### Parameters

##### message

`string`

##### options?

`ErrorOptions`

#### Returns

`ArclaceError`

#### Overrides

`Error.constructor`

## Properties

### cause?

> `optional` **cause?**: `unknown`

Defined in: node\_modules/typescript/lib/lib.es2022.error.d.ts:26

#### Inherited from

`Error.cause`

***

### message

> **message**: `string`

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1077

#### Inherited from

`Error.message`

***

### name

> **name**: `string` = `'ArclaceError'`

Defined in: [src/errors.ts:20](https://github.com/phun-ky/arclace/blob/main/src/errors.ts#L20)

#### Overrides

`Error.name`

***

### stack?

> `optional` **stack?**: `string`

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1078

#### Inherited from

`Error.stack`
