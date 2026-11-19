// app-settings.js — shared settings read by every page (saved from Settings page)
(function () {
  var DEFAULTS = {
    bizName: "Cue Lounge POS",
    bizAddress: "",
    bizPhone: "",
    bizEmail: "",
    snookerRate: 1000,
    poolRate: 800,
    currency: "LKR",
    defaultDiscount: 0,
    taxRate: 0,
    taxInclusive: true,
    quickSellOnSession: true,
    autoBackup: true,
    autoArchive: false
  };
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem("cueclubSettings") || "{}") || {}; } catch (e) { saved = {}; }
  // migrate old single hourlyRate -> both table rates
  if (saved.hourlyRate !== undefined && saved.snookerRate === undefined) {
    saved.snookerRate = saved.hourlyRate;
    saved.poolRate = saved.hourlyRate;
  }
  var out = {};
  for (var k in DEFAULTS) {
    var v = saved[k];
    out[k] = (v !== undefined && v !== null && v !== "") ? v : DEFAULTS[k];
  }
  out.currencySymbol = out.currency === "USD" ? "$" : (out.currency === "EUR" ? "€" : "Rs.");
  out.rateForType = function (type) {
    var t = String(type || "").toLowerCase();
    return Number(t.indexOf("pool") !== -1 ? out.poolRate : out.snookerRate) || 0;
  };
  window.APP_SETTINGS = out;
})();
