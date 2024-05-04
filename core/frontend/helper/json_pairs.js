const { SafeString } = require('../services/handlebars');
const logging = require('@tryghost/logging');
const tpl = require('@tryghost/tpl');
const _ = require('lodash');

const messages = {
    mustBeCalledAsBlock: 'The {{helperName}} helper must be called as a block. E.g. {{#{{helperName}} key1=value1 key2=value2}} ... {{/{{helperName}}}}',
    mustBeEven: 'The number of arguments given to the {{helperName}} helper must be even. E.g. {{#{{helperName}} key1=value1 key2=value2}} ... {{/{{helperName}}}}',
};

/**
 * ## json_pairs
 */
module.exports = function json_pairs(...attrs) {
    const options = attrs.pop();
    const isBlock = _.has(options, 'fn');

    if (!isBlock) {
        logging.error(tpl(messages.mustBeCalledAsBlock, { helperName: 'json_pairs' }));
        return '';
    }

    const pairs = options.fn(this);
    const keyValuePairs = pairs.trim().split(/\s+/);

    if (keyValuePairs.length % 2 !== 0) {
        logging.error(tpl(messages.mustBeEven, { helperName: 'json_pairs' }));
        return '';
    }

    const result = {};
    for (let i = 0; i < keyValuePairs.length; i += 2) {
        result[keyValuePairs[i]] = keyValuePairs[i + 1];
    }

    return new SafeString(JSON.stringify(result));
};