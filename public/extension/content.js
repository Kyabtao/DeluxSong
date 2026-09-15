/* TCS Radio AdBlocker — Extension Content Script
   Reuses the same blocking logic as the in-page adblocker but runs at document_start
   for even earlier blocking. Legal & local.
*/
(function() {
  const AD_DOMAINS = [
    "doubleclick.net","googlesyndication.com","googleadservices.com",
    "googletagmanager.com","google-analytics.com","adservice.google",
    "amazon-adsystem.com","adnxs.com","outbrain.com","taboola.com",
    "criteo.com","pubmatic.com","rubiconproject.com","openx.net",
    "adsrvr.org","scorecardresearch.com","facebook.net/tr",
    "connect.facebook.net","hotjar.com","adsterra.com","popads.net"
  ];
  const isAdUrl = (url) => {
    try { const u = String(url).toLowerCase(); return AD_DOMAINS.some(d=>u.includes(d)); } catch(_){return false;}
  };
  // Block early
  const origFetch = window.fetch;
  window.fetch = function(input, init) {
    try {
      const url = typeof input === "string" ? input : input?.url || "";
      if (isAdUrl(url)) return Promise.resolve(new Response("", {status:204}));
    } catch(_){}
    return origFetch.apply(this, arguments);
  };
  const origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(_, url) {
    this._blocked = isAdUrl(url);
    return origOpen.apply(this, arguments);
  };
  const origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function() {
    if (this._blocked) return;
    return origSend.apply(this, arguments);
  };
  // Cosmetic hiding
  const style = document.createElement("style");
  style.textContent = `
    .adsbygoogle, [id^=google_ads], [id^=div-gpt-ad], .ad-container, .ad-wrapper,
    .ad-banner, .advertisement, iframe[src*="doubleclick"], iframe[src*="googlesyndication"] {
      display:none !important;
    }
  `;
  (document.head||document.documentElement).appendChild(style);
  console.log("%c🛡️ TCS AdBlocker Extension ON", "color:#48d87a;font-weight:bold;");
})();
