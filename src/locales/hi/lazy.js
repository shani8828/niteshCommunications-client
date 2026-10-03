import admin from "./admin.json";
import auth from "./auth.json";
import cart from "./cart.json";
import csc from "./csc.json";
import notifications from "./notifications.json";
import product from "./product.json";
import repair from "./repair.json";

// Every namespace except "common" (which ships in the main bundle), loaded as
// one chunk per language on first navigation. See src/i18n.js.
export default { admin, auth, cart, csc, notifications, product, repair };
