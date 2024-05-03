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
        src('node_modules/@tryghost/sodo-search/umd/*', {encoding: false}).pipe(dest('assets/jsdelivr/sodo-search/')),
        src('node_modules/@tryghost/portal/umd/*', {encoding: false}).pipe(dest('assets/jsdelivr/')),
        src('node_modules/@fontsource/source-sans-pro/**/*', {encoding: false}).pipe(dest('assets/fonts/source-sans-pro/')),
        src('node_modules/@fontsource/merriweather/**/*', {encoding: false}).pipe(dest('assets/fonts/merriweather/')),
        done()
    ];
}

function scss_dev(done) {

    pump([
        src('assets/scss/*.scss'),
        // sass({outputStyle: 'compressed', includePaths: ['node_modules']}).on('error', sass.logError),
        sass({ includePaths: ['node_modules'] }).on('error', sass.logError),
        dest('assets/built', { sourcemaps: './' }),
        livereload()
    ], handleError(done))
}

function scss_prod(done) {
    pump([
        src('assets/scss/*.scss'),
        // sass({outputStyle: 'compressed', includePaths: ['node_modules']}).on('error', sass.logError),
        sass({ includePaths: ['node_modules'], outputStyle: 'compressed' }).on('error', sass.logError),
        rename(function(path) { path.extname = '.min.css' }),
        dest('assets/built', { sourcemaps: './' }),
        livereload()
    ], handleError(done));
}

function js_dev(done) {
    pump([
        src([
            // node modules
            'node_modules/jarallax/dist/jarallax.js',
            'node_modules/imagesloaded/imagesloaded.pkgd.js',
            'node_modules/photoswipe/dist/photoswipe.js',
            'node_modules/photoswipe/dist/photoswipe-ui-default.js',
            'node_modules/reframe.js/dist/reframe.js',

            // Hightlightjs.org -> downloaded
            'assets/highlightjs/highlight.js',

            // main code
            'assets/js/*.js'
        ], { sourcemaps: true }),
        concat('source.js'),
        dest('assets/built/', { sourcemaps: '.' }),
        livereload()
    ], handleError(done));
}

function js_prod(done) {
    pump([
        src('assets/built/source.js'),
        uglify(),
        rename(function(path) { path.extname = '.min.js' }),
        dest('assets/built/')
    ], handleError(done));
}

function zipper(done) {
    pump([
        src([
            '**',
            '!.git', '!.git/**',
            '!.gitkeep',
            '!node_modules', '!node_modules/**',
            '!dist', '!dist/**',
            '!yarn-error.log',
            '!yarn.lock',
            '!gulpfile.js'
        ], { encoding: false }),
        gZip('massively-source.zip'),
        dest('dist/')
    ], handleError(done));
}

const jsBuilder = series(js_dev, js_prod)
const scssBuilder = parallel(scss_dev, scss_prod)

const cssWatcher = () => watch('assets/scss/**/**', scssBuilder);
const jsWatcher = () => watch('assets/js/**', jsBuilder);
const hbsWatcher = () => watch(['*.hbs', 'partials/**/*.hbs'], hbs);
const watcher = parallel(cssWatcher, jsWatcher, hbsWatcher);

export const build = series(copy, scssBuilder, jsBuilder);
export const zip = series(build, zipper);
export const all = series(build, serve, watcher);
task('default', all);

export const release = async () => {
    // @NOTE: https://yarnpkg.com/lang/en/docs/cli/version/
    // require(./package.json) can run into caching issues, this re-reads from file everytime on release
    let packageJSON = JSON.parse(fs.readFileSync('./package.json'));
    const newVersion = packageJSON.version;

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
