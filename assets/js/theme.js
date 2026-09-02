/* Runs before first paint (loaded synchronously in <head>).
   Resolves theme from the user's saved choice, else the OS preference.
   The only data Quiet Zeros ever stores: one word, on your own device. */
(function () {
  "use strict";
  var t = null;
  // one-off override via ?theme=light|dark (never persisted, strictly whitelisted)
  var q = /[?&]theme=(light|dark)(?:&|$)/.exec(location.search);
  if (q) t = q[1];
  if (!t) { try { t = localStorage.getItem("qz-theme"); } catch (e) { /* storage blocked: fall through */ } }
  if (t !== "light" && t !== "dark") {
    t = (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
  }
  document.documentElement.setAttribute("data-theme", t);
})();
