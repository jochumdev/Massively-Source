import { series, watch, src, dest, parallel, task } from 'gulp';
import pump from 'pump';
import path from 'path';
import releaseUtils from '@tryghost/release-utils';
import inquirer from 'inquirer';

// gulp plugins and utils
import livereload from 'gulp-livereload';
import { default as gZip } from 'gulp-zip';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import beeper from 'beeper';
import rename from 'gulp-rename';
import fs from 'fs';

// sass
import sass from 'gulp-dart-sass';

// Rollup for i18n
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import rollup from '@rollup/stream';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

// i18next
import scanner from 'i18next-scanner';
import vfs from 'vinyl-fs';
import sort from 'gulp-sort';

const PACKAGE_JSON = JSON.parse(fs.readFileSync('./package.json'));

const REPO = 'TryGhost/Source';
const REPO_READONLY = 'TryGhost/Source';
const CHANGELOG_PATH = path.join(process.cwd(), '.', 'changelog.md');

function serve(done) {
    livereload.listen();
    done();
}

const handleError = (done) => {
    return function (err) {
        if (err) {
            beeper();
        }
        return done(err);
    };
};

function hbs(done) {
    pump([
        src(['*.hbs', 'partials/**/*.hbs']),
        livereload()
    ], handleError(done));
}

function copy(done) {
    [
        src('node_modules/@tryghost/sodo-search/umd/*', { encoding: false }).pipe(dest('assets/jsdelivr/sodo-search/')),
        src('node_modules/@tryghost/portal/umd/*', { encoding: false }).pipe(dest('assets/jsdelivr/')),
        src('node_modules/@fontsource/source-sans-pro/**/*', { encoding: false }).pipe(dest('assets/fonts/source-sans-pro/')),
        src('node_modules/@fontsource/merriweather/**/*', { encoding: false }).pipe(dest('assets/fonts/merriweather/')),
        done()
    ];
}

/*
 * SCSS
 */
function scss_dev(done) {

    pump([
        src('src/scss/*.scss'),
        // sass({outputStyle: 'compressed', includePaths: ['node_modules']}).on('error', sass.logError),
        sass({ includePaths: ['node_modules'] }).on('error', sass.logError),
        dest('assets/build', { sourcemaps: './' }),
        livereload()
    ], handleError(done))
}

function scss_prod(done) {
    pump([
        src('src/scss/*.scss'),
        // sass({outputStyle: 'compressed', includePaths: ['node_modules']}).on('error', sass.logError),
        sass({ includePaths: ['node_modules'], outputStyle: 'compressed' }).on('error', sass.logError),
        rename(function (path) { path.extname = '.min.css' }),
        dest('assets/build', { sourcemaps: './' }),
        livereload()
    ], handleError(done));
}
const scssBuilder = parallel(scss_dev, scss_prod)


/*
 * JavaScript
 */
function js(done) {
    pump([
        rollup({
        input: 'src/js/theme/index.js',
        output: {
            name: 'theme',
            format: 'iife',
        },
        plugins: [
            nodeResolve({
                browser: true,
                jsnext: false,
                main: false,
                preferBuiltins: false
            }),
            commonjs({
                include: ['node_modules/**'],
                exclude: [],
            }),
            // babel({
            //     babelHelpers: 'bundled',
            //     exclude: "node_modules/**",
            //     presets: ["@babel/preset-env"],
            // }),
        ]
    }),
    source('theme.js', './assets/js/theme'),
    buffer(),
    dest('assets/build/'),
], handleError(done));
};

function js_prod(done) {
    pump([
        rollup({
        input: 'src/js/theme/index.js',
        output: {
            name: 'theme',
            format: 'iife',
        },
        plugins: [
            nodeResolve({
                browser: true,
                jsnext: false,
                main: false,
                preferBuiltins: false
            }),
            commonjs({
                include: ['node_modules/**'],
                exclude: [],
            }),
            // babel({
            //     babelHelpers: 'bundled',
            //     exclude: "node_modules/**",
            //     presets: ["@babel/preset-env"],
            // }),
            terser(),
        ]
    }),
    source('theme.min.js', './assets/js/theme'),
    buffer(),
    dest('assets/build/'),
], handleError(done));
}

const jsBuilder = series(js, js_prod)


task('i18next', function() {
    const options = {
        "compatibilityJSON": "v3",
        "debug": false,
        "sort": false,
        "attr": {
            "extensions": [
                ".hbs"
            ],
            "list": [
                "data-i18n"
            ]
        },
        "func": {
            "list": [
                "i18next.t",
                "i18n.t"
            ],
            "extensions": [
                ".js",
                ".jsx"
            ]
        },
        "trans": {
            "component": "Trans",
            "i18nKey": "i18nKey",
            "defaultsKey": "defaults",
            "extensions": [
                ".js",
                ".jsx"
            ],
            "fallbackKey": false,
            "supportBasicHtmlNodes": true,
            "keepBasicHtmlNodesFor": [
                "br",
                "strong",
                "i",
                "p"
            ],
            "acorn": {
                "ecmaVersion": 2020,
                "sourceType": "module"
            }
        },
        "lngs": PACKAGE_JSON.config.theme_languages,
        "fallbackLng": "en",
        "ns": [
            "theme",
            "translation"
        ],
        "defaultLng": "en",
        "defaultNs": "translation",
        "defaultValue": "",
        "resource": {
            "loadPath": "assets/i18n/{{lng}}/{{ns}}.json",
            "savePath": "i18n/{{lng}}/{{ns}}.json",
            "jsonIndent": 2,
            "lineEnding": "\n"
        },
        "keySeparator": ".",
        "nsSeparator": ":",
        "context": true,
        "contextFallback": true,
        "contextSeparator": "_",
        "contextDefaultValues": [],
        "plural": true,
        "pluralFallback": true,
        "pluralSeparator": "_",
        "interpolation": {
            "prefix": "{{",
            "suffix": "}}"
        },
        "metadata": {},
        "allowDynamicKeys": false
    };

    return vfs.src(['*.hbs','./partials/**/*.hbs'])
        .pipe(sort()) // Sort files in stream by path
        .pipe(scanner(options))
        .pipe(vfs.dest('assets'))

});


task('zip', function (done) {
    pump([
        src([
            '**',
            '!src', '!src/**',
            '!.git*', '!.git/**',
            '!.trunk', '!.trunk/**',
            '!node_modules', '!node_modules/**',
            '!dist', '!dist/**',
            '!package-lock.json',
            '!yarn-error.log',
            '!yarn.lock',
            '!gulpfile.mjs',
            '!.stylelintrc.json',
        ], { encoding: false }),
        gZip('massively-source.zip'),
        dest('dist/')
    ], handleError(done));
});

const cssWatcher = () => watch('src/scss/**/**', scssBuilder);
const jsWatcher = () => watch('src/js/**', jsBuilder);
const hbsWatcher = () => watch(['*.hbs', 'partials/**/*.hbs'], hbs);
const watcher = parallel(cssWatcher, jsWatcher, hbsWatcher);

export const build = series(copy, scssBuilder, jsBuilder);
export const all = series(build, serve, watcher);
task('default', all);

export const release = async () => {
    const newVersion = PACKAGE_JSON.version;

    if (!newVersion || newVersion === '') {
        console.log(`Invalid version: ${newVersion}`);
        return;
    }

    console.log(`\nCreating release for ${newVersion}...`);

    const githubToken = process.env.GST_TOKEN;

    if (!githubToken) {
        console.log('Please configure your environment with a GitHub token located in GST_TOKEN');
        return;
    }

    try {
        const result = await inquirer.prompt([{
            type: 'input',
            name: 'compatibleWithGhost',
            message: 'Which version of Ghost is it compatible with?',
            default: '5.0.0'
        }]);

        const compatibleWithGhost = result.compatibleWithGhost;

        const releasesResponse = await releaseUtils.releases.get({
            userAgent: 'Source',
            uri: `https://api.github.com/repos/${REPO_READONLY}/releases`
        });

        if (!releasesResponse || !releasesResponse) {
            console.log('No releases found. Skipping...');
            return;
        }

        let previousVersion = releasesResponse[0].tag_name || releasesResponse[0].name;
        console.log(`Previous version: ${previousVersion}`);

        const changelog = new releaseUtils.Changelog({
            changelogPath: CHANGELOG_PATH,
            folder: path.join(process.cwd(), '.')
        });

        changelog
            .write({
                githubRepoPath: `https://github.com/${REPO}`,
                lastVersion: previousVersion
            })
            .sort()
            .clean();

        const newReleaseResponse = await releaseUtils.releases.create({
            draft: true,
            preRelease: false,
            tagName: 'v' + newVersion,
            releaseName: newVersion,
            userAgent: 'Source',
            uri: `https://api.github.com/repos/${REPO}/releases`,
            github: {
                token: githubToken
            },
            content: [`**Compatible with Ghost ≥ ${compatibleWithGhost}**\n\n`],
            changelogPath: CHANGELOG_PATH
        });
        console.log(`\nRelease draft generated: ${newReleaseResponse.releaseUrl}\n`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
