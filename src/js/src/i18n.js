import i18n from "i18next";
import HttpBackend from "i18next-http-backend";
// import BackendAdapter from 'i18next-multiload-backend-adapter';
import Cache from 'i18next-localstorage-cache';
// import sprintf from 'i18next-sprintf-postprocessor';
import LanguageDetector from 'i18next-browser-languagedetector';

import locI18next from "loc-i18next";

import settings from "./settings";

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
  .use(LanguageDetector);

// create a loc-i18next localizesator.
var localize = locI18next.init(i18n, {
  selectorAttr: 'data-i18n', // selector for translating elements
  targetAttr: 'i18n-target',
  optionsAttr: 'i18n-options',
  useOptionsAttr: true,
  parseDefaultValueFromContent: true,
  document: window.document,
});


let promise;
async function init() {
  if (promise) {
    return promise;
  }

  await settings.promise;

  if (!settings.Get(settings.KEYS.I18N)) {
    return new Promise.resolve();
  }

  promise = i18n.init({
    ns: settings.Get(settings.KEYS.I18N_NAMESPACES),
    backend: {
      loadPath: "/assets/i18n/{{lng}}/{{ns}}.json",
    },
    caches: ["localStorage"],
    detection: {
      order: ["querystring", "path", "localStorage", "sessionStorage"],
      lookupQueryString: "lang",
      lookupFromPathIndex: 0,

      // optional conversion function to use to modify the detected language code
      convertDetectedLanguage: "Iso15897",
      convertDetectedLanguage: (lng) => {
        const l = lng.replace("-", "_");
        if (settings.Get(settings.KEYS.I18N_LANGUAGES).includes(l)) {
          return l;
        }

        return settings.Get(settings.KEYS.I18N_DEFAULT_LANGUAGE);
      },
    },
    useDataAttrOptions: true,
    interpolation: {
      escapeValue: false // to allow interpolation in HTML
    },
  });

  // Wait for i18next to be ready.
  await promise;

  // Update <html lang="??">
  document.documentElement.setAttribute('lang', i18n.language);

  //
  // Hack to implement language switching.
  // TODO(jochumdev): find a better way!
  //
  // Update nav menus.
  const language = i18n.language;
  const navs = [document.getElementById('nav'), document.getElementById('panel-nav')];

  for (let n = 0; n < navs.length; n++) {
    var navLinks = navs[n].querySelectorAll('.links>li');

    var activeEL = null;
    for (let i = 0; i < navLinks.length; i++) {
      var el = navLinks[i];
      var link = new URL(el.firstChild.getAttribute("href"), window.location.origin);
      var langLink = "/" + language + "/" + link.pathname.substring(4)
      if (theme.util.pathIsCurrent(langLink)) {
        activeEL = el;
      }
      el.firstChild.setAttribute("href", langLink);
    };

    if (activeEL != null) {
      activeEL.classList.add("active");
    }
  };

  // Localize the theme.
  localize('.i18n-target');
};

async function updateNav() {
  // Wait for settings to be ready.
  await settings.promise;

  const settings = theme.settings;
  const SKEYS = settings.KEYS;

  // Create language switchers.
  const langs = settings.Get(SKEYS.I18N_LANGUAGES);
  var switchers = '';
  langs.forEach(function (lang) {
    switchers += '<li class="gh-langselect ' + lang + '"><a href="/' + lang + '/">' + '<img src="/assets/images/i18n/' + lang + '.png" alt="' + lang + '" /></a></li>';
  });

  var switcher = document.querySelector('#gh-language-switcher ul');
  switcher.innerHTML = switchers;
}

export default { localize, init, updateNav };
