import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';
// import BackendAdapter from 'i18next-multiload-backend-adapter';
import Cache from 'i18next-localstorage-cache';
import postProcessor from 'i18next-sprintf-postprocessor';
import LanguageDetector from 'i18next-browser-languagedetector';

import locI18next from "loc-i18next";

import settings from './settings';

// i18n.use(BackendAdapter).init({
//     backend: {
//         backend: HttpBackend,
//         backendOption: {
//             loadPath: '/assets/i18n/\{{lng}}/\{{ns}}.json',
//         }
//     }
// })
i18n.use(HttpBackend)
    .use(Cache)
    .use(postProcessor)
    .use(LanguageDetector)


i18n.myInit = function() {
    if (i18n.isInitialized || i18n.isInitializing) {
        return i18n.promise;
    }

    i18n.promise = theme.i18n.init({
        ns: settings.Get(settings.KEYS.I18N_NAMESPACES),
        backend: {
            loadPath: '/assets/i18n/\{{lng}}/\{{ns}}.json',
        },
        caches: ['localStorage'],
        detection: {
            order: ['querystring', 'path', 'localStorage', 'sessionStorage'],
            lookupQueryString: 'lang',
            lookupFromPathIndex: 0,

            // optional conversion function to use to modify the detected language code
            convertDetectedLanguage: 'Iso15897',
            convertDetectedLanguage: (lng) => lng.replace('-', '_')
        }
    });

    return i18n.promise;
}

var localize = locI18next.init(i18n, {
    selectorAttr: 'data-i18n', // selector for translating elements
    targetAttr: 'i18n-target',
    optionsAttr: 'i18n-options',
    useOptionsAttr: false,
    parseDefaultValueFromContent: true,
    document: window.document,
});

export { i18n, localize };