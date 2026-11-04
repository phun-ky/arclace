# Background

connect-the-things comes from [SPECCER](https://speccer.dev). While building
SPECCER, I spent most of the time on my own SVG feature for drawing the lines
between its pins and the elements they point at, with bezier curves shaped into
curly brackets.

I then found I could reuse that code to give a better overview of design tokens
and how they relate to one another. The first public proof of concept is
[on CodePen](https://codepen.io/editor/phun-ky/pen/01783ae7-e010-76d8-9429-43a7be9da34f),
and the [playground](/examples) on this site grew out of it.

After years of other work taking priority, I split the line drawing out into
this package, so it can connect anything on a page.
