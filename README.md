# Massively-source

This is Massively-source, a text-heavy, article-oriented design built around a huge background
image. Originally created by [@ajlkn](https://twitter.com/ajlkn) for [HTML5 UP](https://html5up.net) and later ported to [Ghost](https://ghost.org), then merged with the [Source](https://github.com/TryGhost/Source) theme by [jochumdev](https://jochum.dev).

**Demo: https://rene.jochum.dev**

## Features

### for users

- Fast
- Translateable using [i18next](https://www.i18next.com/) on client as well as some hacks to translate routes.
- Uses HTML5 as much as possible, works well without JavaScript
- No CDN
- Parallax effect background image
- Automatic higlighting of code in Markdown

### for creators / developers

- No jQuery
- [rollup](https://rollupjs.org/) with gulp for javascript.
- i18n using [i18next](https://www.i18next.com/) as well as dynamic routing
  - Using [loc-i18next](https://github.com/mthh/loc-i18next) for data-i18n="" translations.
  - Dynamic routing with https://example.com/{de,en,fr,it}/ routes.
  - No i18n / javascript = english.
- No more javascript grid
- scss using dart-sass
- Parallax effect background using jarallax
- Customizeable over theme custom parameters
- Highlight.js
- Automaticaly updates and copies all code using "npm" and Gulp

## Development

1. Install and run a ghost site localy
2. Install this theme over air
3. Remove the theme on disc inside site123/content/themes/massively-source
4. Symlink it to the deleted folder
5. run `npm install && npm run dev`

## Authors

- [@ajlkn](https://twitter.com/ajlkn)
- Ghost Foundation
- [@jochumdev](https://jochum.dev)

## Copyright & License

Copyright (c) 2013-2024 Ghost Foundation - Released under the [MIT license](LICENSE).
