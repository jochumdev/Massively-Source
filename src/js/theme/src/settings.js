const KEYS = {
    I18N: 'i18n',
    I18N_DEFAULT_LANGUAGE: 'i18n_default_language',
    I18N_LANGUAGES: 'i18n_languages',
    I18N_NAMESPACES: 'i18n_namespaces',
}

// Get/Set settings in memory
var data = {};

function Set(key, val) {
    data[key] = val;
    return val;
}

function Get(key) {
    return data[key];
}

export default { Set, Get, KEYS }