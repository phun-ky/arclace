// Content of the release banners for 1.0. Copy this file for the next major
// (e.g. 2.0.mjs) and run: npm run banners -- 2.0
export default {
  slug: 'v1',
  pill: 'Release 1.0 · November 2026',
  title: ['Connected,', { accent: 'and staying that way' }],
  body: 'Arclace 1.0 draws SVG lines between DOM elements and keeps them attached as the page changes. Options are checked, failures throw ArclaceError, and nothing breaks before 2.0.',
  // The diagram, drawn by Arclace itself: nodes on the dot grid, and the
  // lines between them
  nodes: [
    { id: 'from', title: '0.3.0', detail: 'API review' },
    { id: 'now', title: '1.0.0', detail: 'Stable', accent: true },
    { id: 'next', title: '2.0.0', detail: 'Next major' }
  ],
  lines: [
    {
      start: 'from',
      end: 'now',
      label: 'same code',
      arrow: 'end',
      startSide: 'right'
    },
    {
      start: 'now',
      end: 'next',
      label: 'no breaking changes',
      arrow: 'end',
      startSide: 'bottom',
      endSide: 'top',
      dashed: true
    }
  ]
};
