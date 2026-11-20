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

// Default customer list — used as fallback for autocomplete until the user saves real customers.
window.CUE_DEFAULT_CUSTOMERS = [
  { id: "P0001", name: "Perera K.", mobile: "071-9876543" },
  { id: "P0002", name: "Silva S.", mobile: "077-1234567" },
  { id: "P0003", name: "Jayasuriya M.", mobile: "076-5551234" },
  { id: "P0004", name: "Fernando R.", mobile: "070-8889999" }
];
// Load saved customers; if none saved yet, return the default fallback list.
window.loadCustomers = function () {
  try {
    var c = JSON.parse(localStorage.getItem("cueclubCustomers") || "[]") || [];
    return (Array.isArray(c) && c.length) ? c : window.CUE_DEFAULT_CUSTOMERS.slice();
  } catch (e) { return window.CUE_DEFAULT_CUSTOMERS.slice(); }
};

// Customer name autocomplete — touch-friendly dropdown (shared across pages)
(function () {
  function loadCusts() { return (window.loadCustomers ? window.loadCustomers() : []); }
  function injectStyle() {
    if (document.getElementById("acStyle")) return;
    var s = document.createElement("style"); s.id = "acStyle";
    s.textContent = ".ac-wrap{position:relative!important}.ac-dropdown{position:absolute;top:100%;left:0;right:0;background:#fff;border:1px solid #ccc;border-radius:6px;max-height:180px;overflow-y:auto;z-index:3000;display:none;box-shadow:0 4px 12px rgba(0,0,0,.15)}.ac-item{padding:8px 12px;cursor:pointer;font-size:.9rem;border-bottom:1px solid #f0f0f0}.ac-item:hover{background:#e8f0fe}.ac-item small{color:#888;margin-left:6px}";
    document.head.appendChild(s);
  }
  function attachAC(input) {
    if (!input || input.dataset.ac) return;
    input.dataset.ac = "1";
    injectStyle();
    var wrap = document.createElement("div"); wrap.className = "ac-wrap";
    input.parentNode.insertBefore(wrap, input); wrap.appendChild(input);
    var dd = document.createElement("div"); dd.className = "ac-dropdown"; wrap.appendChild(dd);
    var items = [];
    function render() {
      var q = input.value.trim().toLowerCase();
      if (!q) { dd.style.display = "none"; return; }
      var custs = loadCusts();
      items = custs.filter(function (c) { return c && ((c.name || "").toLowerCase().indexOf(q) !== -1 || String(c.mobile || "").indexOf(q) !== -1); }).slice(0, 6);
      if (!items.length) { dd.style.display = "none"; return; }
      dd.innerHTML = items.map(function (c, i) { return '<div class="ac-item" data-i="' + i + '">' + (c.name || "") + ' <small>' + (c.mobile || "") + '</small></div>'; }).join("");
      dd.style.display = "block";
      Array.prototype.forEach.call(dd.querySelectorAll(".ac-item"), function (el) {
        var pick = function (e) { e.preventDefault(); input.value = items[parseInt(el.getAttribute("data-i"), 10)].name; dd.style.display = "none"; input.dispatchEvent(new Event("change", { bubbles: true })); };
        el.addEventListener("mousedown", pick);
        el.addEventListener("touchstart", pick, { passive: false });
      });
    }
    input.addEventListener("input", render);
    input.addEventListener("focus", render);
    input.addEventListener("blur", function () { setTimeout(function () { dd.style.display = "none"; }, 200); });
  }
  function attachAllPlayerAC() {
    Array.prototype.forEach.call(document.querySelectorAll("input.player-name, input#apName"), function (inp) { attachAC(inp); });
  }
  window.attachAC = attachAC;
  window.attachAllPlayerAC = attachAllPlayerAC;
})();
