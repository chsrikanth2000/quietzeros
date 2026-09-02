/* Activates every AdSense unit on the page. External on purpose:
   the conventional inline push() script would violate our CSP. */
"use strict";
window.adsbygoogle = window.adsbygoogle || [];
for (const ins of document.querySelectorAll("ins.adsbygoogle")) {
  window.adsbygoogle.push({});
}
