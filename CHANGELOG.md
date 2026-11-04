# Changelog

## [1.0.0](https://github.com/phun-ky/arclace/compare/0.3.0...1.0.0) (2026-11-04)

### Documentation

* ✏️ 1.0 release notes, banners and policies ([e929cea](https://github.com/phun-ky/arclace/commit/e929ceace112eca7bc265b9bd57210d40a9ed347)), closes [#21](https://github.com/phun-ky/arclace/issues/21)
* ✏️ a docs site design to match the Bow mark ([a769977](https://github.com/phun-ky/arclace/commit/a769977f01a220e30da64c02422a11775053d838)), closes [#75](https://github.com/phun-ky/arclace/issues/75)
* ✏️ a logo for Arclace ([84b5dae](https://github.com/phun-ky/arclace/commit/84b5dae26ac836e4369506cd7e76351714386e24)), closes [#73](https://github.com/phun-ky/arclace/issues/73), references [#73](https://github.com/phun-ky/arclace/issues/73)
* ✏️ meet AA text contrast on the docs site ([793ae66](https://github.com/phun-ky/arclace/commit/793ae66f53f1e999e8d2fdcd7b7f82ae25a14d6e)), closes [#68](https://github.com/phun-ky/arclace/issues/68), references [#99acb2](https://github.com/phun-ky/arclace/issues/99acb2) [#5d747b](https://github.com/phun-ky/arclace/issues/5d747b) [#2865f0](https://github.com/phun-ky/arclace/issues/2865f0) [#f2f6ff](https://github.com/phun-ky/arclace/issues/f2f6ff)
* ✏️ record signed releases from 0.3.0 on ([7d84dfc](https://github.com/phun-ky/arclace/commit/7d84dfc53074013a9d360bbf08f140a9b8ce0f1b)), closes [#66](https://github.com/phun-ky/arclace/issues/66)
* ✏️ say how the lines work with assistive technology ([f4b8419](https://github.com/phun-ky/arclace/commit/f4b84197b6f216d76cfda9f9884104555e12b8cf)), closes [#60](https://github.com/phun-ky/arclace/issues/60), references [#68](https://github.com/phun-ky/arclace/issues/68)
* ✏️ switch the logo to the Bow mark ([9b3f6ac](https://github.com/phun-ky/arclace/commit/9b3f6ac5d57b219b6faa81f702ebd239d99fb33b)), references [#73](https://github.com/phun-ky/arclace/issues/73) [#73](https://github.com/phun-ky/arclace/issues/73)

### Refactoring

* 💡 share the Chrome renderer between the logo and the banners ([d626118](https://github.com/phun-ky/arclace/commit/d626118eba5efb3e17408e225079c0a634d86037)), references [#21](https://github.com/phun-ky/arclace/issues/21)

## [0.3.0](https://github.com/phun-ky/arclace/compare/0.2.0...0.3.0) (2026-11-04)

### ⚠ BREAKING CHANGES

* Update code that uses the following:

  - stop is now end: stopElement is endElement, stopSide is endSide,
    geometry.stop and geometry.stopSide are geometry.end and
    geometry.endSide, .arc-anchor-stop is .arc-anchor-end, and
    data-stop-side is data-end-side
  - options are checked before anything is added. Wrong types throw a
    TypeError (strokeWidth: '3', label: 0, dashed: 'no', an empty or
    non-string id) and values out of range a RangeError (type: 'wavy',
    arrow: 'yes', an unknown side, a negative strokeWidth, spacing,
    radius or offset). defaults can't set an id, and autoUpdate must be
    true, false or 'frame'
  - failures throw ArclaceError, exported, instead of Error. An invalid
    selector throws an ArclaceError with the SyntaxError as its cause
  - find() returns [] for a selector that matches nothing, instead of
    throwing
  - disconnect() throws a TypeError for a target that is not a
    connection, a string, an element, null or undefined
  - setOptions() throws after the connection was removed or its
    instance destroyed, and when given an id
  - DEFAULT_CONNECTION_OPTIONS is frozen, and geometry is a read-only
    frozen object
  - the Connection constructor is private in the types; connections
    come from connect() and connectAll(). ArcConnectionParamsType and
    ArcOptionalKeysType are no longer exported
  - the path builders check their points (finite x and y) and sides

### Documentation

* ✏️ assurance case and VEX statements ([73b4fe6](https://github.com/phun-ky/arclace/commit/73b4fe6bd0e1e553de71c8817d9720b1b27cc360)), references [#19](https://github.com/phun-ky/arclace/issues/19)
* ✏️ governance, roadmap and a contributing guide for Arclace ([5f5b33a](https://github.com/phun-ky/arclace/commit/5f5b33a54fa331e6ebf428f1773a0bd28013a6f2)), references [#20](https://github.com/phun-ky/arclace/issues/20) [#21](https://github.com/phun-ky/arclace/issues/21) [#19](https://github.com/phun-ky/arclace/issues/19) [#60](https://github.com/phun-ky/arclace/issues/60) [#19](https://github.com/phun-ky/arclace/issues/19)
* ✏️ link the ArclaceError source in the API reference ([d22f104](https://github.com/phun-ky/arclace/commit/d22f104088255aaa66037ee3e162c7ed8e4e575a)), references [#20](https://github.com/phun-ky/arclace/issues/20)
* ✏️ record the API review in the assurance case and OpenSSF answers ([e4cc02f](https://github.com/phun-ky/arclace/commit/e4cc02f294bc523da5c1f993972adab1e2a1a927)), closes [#20](https://github.com/phun-ky/arclace/issues/20), references [#21](https://github.com/phun-ky/arclace/issues/21)

### Refactoring

* 💡 review the API for 1.0 ([94f3569](https://github.com/phun-ky/arclace/commit/94f3569d6be4ae66bd2ddc81b546a40301f24104)), references [#20](https://github.com/phun-ky/arclace/issues/20) [#20](https://github.com/phun-ky/arclace/issues/20)

## [0.2.0](https://github.com/phun-ky/arclace/compare/0.1.0...0.2.0) (2026-11-04)

### ⚠ BREAKING CHANGES

* 💡 rename the package to Arclace

### Tasks

* 🤖 sign off every commit with a prepare-commit-msg hook ([940e06b](https://github.com/phun-ky/arclace/commit/940e06b72871db570ccb516f76d81bcb5ea3e53b)), references [#18](https://github.com/phun-ky/arclace/issues/18)
* 🤖 skip the first release under a new package name ([738c8b6](https://github.com/phun-ky/arclace/commit/738c8b6534c860d53361811781268ae0bf08c7dd)), references [#58](https://github.com/phun-ky/arclace/issues/58)

### Documentation

* ✏️ add a VitePress docs site with the API reference ([3125b4c](https://github.com/phun-ky/arclace/commit/3125b4c17ac477aa9b331dac6513a2ce69a93d2e)), references [#15](https://github.com/phun-ky/arclace/issues/15)
* ✏️ explain the name Arclace ([180ca0d](https://github.com/phun-ky/arclace/commit/180ca0d781d85e1ff7b96cb41d1b5cc6cc07f495)), references [#58](https://github.com/phun-ky/arclace/issues/58)
* ✏️ rewrite the security policy and add security insights ([2942a2c](https://github.com/phun-ky/arclace/commit/2942a2cb86c595810ae5c5493e664ad13b5bebf2)), references [#17](https://github.com/phun-ky/arclace/issues/17)
* ✏️ show the markup the playground example runs on ([a5251de](https://github.com/phun-ky/arclace/commit/a5251de0298dc051cc2eb451e3e30b70c3644f92)), references [#16](https://github.com/phun-ky/arclace/issues/16)
* ✏️ tell where connect-the-things comes from ([9df2bdf](https://github.com/phun-ky/arclace/commit/9df2bdff7e9dcf50e223fb60e64eb0301406acf7)), references [#56](https://github.com/phun-ky/arclace/issues/56)

### Refactoring

* 💡 rename the package to Arclace ([5758e91](https://github.com/phun-ky/arclace/commit/5758e91483c20a13b2010e0afab0635e04ee8cd0))

## 0.1.0 (2026-11-03)

### Tasks

* 🤖 fix the labeler rules, issue template labels and triage ([b45a57a](https://github.com/phun-ky/connect-the-things/commit/b45a57a93b5885da18e76911f6c8f21816c34a03)), references [#10](https://github.com/phun-ky/connect-the-things/issues/10)
* 🤖 group Dependabot updates and add GitHub Actions ([ad5216e](https://github.com/phun-ky/connect-the-things/commit/ad5216e8f88c8d9357b94e6401b873e1350bb805)), references [#9](https://github.com/phun-ky/connect-the-things/issues/9)
* 🤖 ignore the .claude directory ([27ed8ce](https://github.com/phun-ky/connect-the-things/commit/27ed8ce590218370d09f1d4534f082320eac518c)), references [#49](https://github.com/phun-ky/connect-the-things/issues/49)
* 🤖 lint and API docs tooling ([2dd8e60](https://github.com/phun-ky/connect-the-things/commit/2dd8e60a1c1e019e5786bbfb2a1cc2c5091b16cc)), references [#3](https://github.com/phun-ky/connect-the-things/issues/3)
* 🤖 move to ESLint 10 and lint every file type ([1b1d7ac](https://github.com/phun-ky/connect-the-things/commit/1b1d7acd6197723c78070ab9ca0bdd81c95b1be4)), references [#6](https://github.com/phun-ky/connect-the-things/issues/6)
* 🤖 refresh development dependencies and override katex ([e157c35](https://github.com/phun-ky/connect-the-things/commit/e157c359b453a0d6bba14763c2a1d34553eb4877)), references [#11](https://github.com/phun-ky/connect-the-things/issues/11)
* 🤖 upgrade release-it to 21 and the changelog plugin to 12 ([4c4704e](https://github.com/phun-ky/connect-the-things/commit/4c4704ece6498cc88a7a387b56611531589d27df)), references [#44](https://github.com/phun-ky/connect-the-things/issues/44) [#12](https://github.com/phun-ky/connect-the-things/issues/12)

### Feature

* 🎸 draw SVG lines between DOM elements ([62ee4e3](https://github.com/phun-ky/connect-the-things/commit/62ee4e359bfec916643a9f5da506979562651f33)), references [#3](https://github.com/phun-ky/connect-the-things/issues/3)

### Bug

* 🐛 ship ES modules with types that resolve everywhere ([390da51](https://github.com/phun-ky/connect-the-things/commit/390da51be2a84fb5a02bae9ed1f6957680ebdb8d)), references [#4](https://github.com/phun-ky/connect-the-things/issues/4)
