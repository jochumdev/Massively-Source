# Massively-source

This is Massively-source, a text-heavy, article-oriented design built around a huge background
image and scroll effects powered by Scrollex. Originally created by [@ajlkn](https://twitter.com/ajlkn) for [HTML5 UP](https://html5up.net) and later ported to [Ghost](https://ghost.org), then merged with the [Source](https://github.com/TryGhost/Source) theme by [jochumdev](https://jochum.dev).

**Demo: https://rene.jochum.dev**

## Features 

### for users

- Fast
- Uses HTML5 as much as possible, works well without JavaScript
- No CDN
- Parallax effect background image
- Automatic higlighting of code in Markdown

### for creators / developers

- No external CDN dependencies, host all on your own:
    - @tryghost/sodo-Search, @tryghost/portal GPR compatible
    - Source Sans Pro, Merriweather fonts GPR compatible (no cdn)
- No jQuery
- No more javascript grid
- scss using dart-sass
- Parallax effect background using jarallax
- Customizeable over theme custom parameters
- Highlight.js
- Automaticaly updates and copies all code using "npm" and Gulp
- single .js for all source with the help of Gulp

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