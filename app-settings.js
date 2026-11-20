// app-settings.js — shared settings read by every page (saved from Settings page)
// Google Apps Script deployment URL — used by every page that syncs data to the sheet.
window.GOOGLE_SCRIPT_URL = window.GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbzzR0w9MVxhK0VS4ufmbm8vxe1dmZvxb7w1lvsyg_7Neqh-adyolxRvJF1CnE2nO5wYkA/exec";
(function () {
  var DEFAULTS = {
    bizName: "PYRAMID SNOOKER PALOR MANAGEMENT",
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

// ============================================================
// Shared POS helpers — table directory, bookings, credit due, sync
// ============================================================
// Table directory. Internal codes T01–T06 never change so existing
// records keep working; only the friendly display labels were renamed.
window.CUE_TABLES = [
  { id: "T01", label: "01 — Viper",      short: "Viper",      type: "Snooker" },
  { id: "T02", label: "02 — Titan",      short: "Titan",      type: "Snooker" },
  { id: "T03", label: "03 — Phantom",    short: "Phantom",    type: "Snooker" },
  { id: "T04", label: "04 — Prestige",   short: "Prestige",   type: "Snooker" },
  { id: "T05", label: "01 — Black 8",    short: "Black 8",    type: "Pool" },
  { id: "T06", label: "02 — Golden Break", short: "Golden Break", type: "Pool" }
];
window.getCueTable = function (id) {
  return window.CUE_TABLES.find(function (t) { return t.id === String(id); }) || null;
};
window.tableLabel = function (id) {
  var t = window.getCueTable(id);
  return t ? t.label : (String(id || "") || "Table");
};
window.tableTypeOf = function (id) {
  var t = window.getCueTable(id);
  return t ? t.type : "";
};

// Fire-and-forget POST to the Google Apps Script deployment (no-cors).
window.postSync = function (payload) {
  try {
    var url = window.GOOGLE_SCRIPT_URL;
    if (!url || !payload) return;
    fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(function () {});
  } catch (e) {}
};

// ---- Pre-bookings (cueclubBookings) ----
window.BOOKINGS_KEY = "cueclubBookings";
window.loadBookings = function () {
  try {
    var b = JSON.parse(localStorage.getItem(window.BOOKINGS_KEY) || "[]");
    return Array.isArray(b) ? b.filter(function (x) { return x && typeof x === "object"; }) : [];
  } catch (e) { return []; }
};
window.saveBookings = function (list, skipSync) {
  try { localStorage.setItem(window.BOOKINGS_KEY, JSON.stringify(list)); } catch (e) {}
  if (!skipSync) window.postSync({ action: "saveBookings", bookings: list, syncedAt: new Date().toISOString() });
};
window.pendingBookings = function () {
  return window.loadBookings().filter(function (b) { return b && b.status === "booked"; });
};
// A table is "booked" when it has an active (pending) reservation.
window.bookingForTable = function (tableId) {
  return window.pendingBookings().find(function (b) { return b.tableId === tableId; }) || null;
};

// ---- Customer credit due helpers ----
// Customers live in cueclubCustomers; due + dueLedger are added per record.
window.CREDIT_DUE_KEY = "cueclubCustomers";
window.getCustomerDue = function (c) { return Number(c && c.due) || 0; };
function digitsOnly(v) { return String(v || "").replace(/\D/g, ""); }
window.findCustomerByMobileOrName = function (mobile, name) {
  var custs = [];
  try { custs = window.loadCustomers ? window.loadCustomers() : JSON.parse(localStorage.getItem(window.CREDIT_DUE_KEY) || "[]"); } catch (e) { custs = []; }
  var d = digitsOnly(mobile);
  var nm = String(name || "").trim().toLowerCase();
  return custs.find(function (c) {
    if (!c) return false;
    if (d && digitsOnly(c.mobile) === d) return true;
    if (nm && String(c.name || "").trim().toLowerCase() === nm) return true;
    return false;
  }) || null;
};
// Record a charge (credit sale) or a settlement payment against a customer's due.
// kind: "charge" (adds) or "payment" (reduces). Returns the updated due total.
window.applyCustomerDue = function (customer, amount, kind, ref) {
  if (!customer) return 0;
  var amt = Math.round(Number(amount || 0) * 100) / 100;
  var due = Math.round((Number(customer.due) || 0) + (kind === "charge" ? amt : -amt) * 100) / 100;
  if (due < 0) due = 0;
  customer.due = due;
  customer.dueLedger = Array.isArray(customer.dueLedger) ? customer.dueLedger : [];
  customer.dueLedger.push({
    date: new Date().toISOString(),
    kind: kind,
    amount: amt,
    ref: ref || "",
    balanceAfter: due
  });
  try {
    var all = JSON.parse(localStorage.getItem(window.CREDIT_DUE_KEY) || "[]") || [];
    var idx = all.findIndex(function (c) { return c && c.id === customer.id; });
    if (idx !== -1) all[idx] = customer; else all.push(customer);
    localStorage.setItem(window.CREDIT_DUE_KEY, JSON.stringify(all));
  } catch (e) {}
  window.postSync({
    action: kind === "charge" ? "saveCreditDue" : "settleCredit",
    customer: { id: customer.id, name: customer.name, mobile: customer.mobile },
    kind: kind, amount: amt, ref: ref || "", dueTotal: due, syncedAt: new Date().toISOString()
  });
  return due;
};
