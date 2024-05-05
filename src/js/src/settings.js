const KEYS = {
  I18N: "i18n",
  I18N_DEFAULT_LANGUAGE: "i18n_default_language",
  I18N_LANGUAGES: "i18n_languages",
  I18N_NAMESPACES: "i18n_namespaces",

  I18N_CURRENT_LANGUAGE: "i18n_current_language",
};

let promise;
function init() {
    if (promise) {
      return;
    }

    return new Promise((resolve, reject) => {
        // 1. Store references for later
        promise = {resolve, reject}
    });
}

function Done() {
  promise.resolve();
}

// Get/Set settings in memory
var data = {};

function Set(key, val) {
  init();

  data[key] = val;
  return val;
}

function Get(key) {
  init();

  return data[key];
}

export default { Done, Set, Get, KEYS };
