import functional from "./src/functional";
import i18n from "./src/i18n";
import settings from "./src/settings";
import util from "./src/util";

// This intializes the theme.
// It has to be called AFTER settings has been populated.
async function init() {
    // Await i18n;
    await i18n.init();

    // None i18n stuff.
    await functional.init();
};
ar
export default { init, settings, util };
