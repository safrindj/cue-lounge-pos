// sidebar.js — PYRAMID SNOOKER PALOR MANAGEMENT navigation (off-canvas)
(function () {
  var DEPLOY_URL = "https://script.google.com/macros/s/AKfycbzzR0w9MVxhK0VS4ufmbm8vxe1dmZvxb7w1lvsyg_7Neqh-adyolxRvJF1CnE2nO5wYkA/exec";
  window.GOOGLE_SCRIPT_URL = window.GOOGLE_SCRIPT_URL || DEPLOY_URL;

  var PAGES = [
    { name: "Dashboard",        icon: "fa-chart-line",   url: "dashboard.html" },
    { name: "Start Session",   icon: "fa-play-circle",  url: "start-session.html" },
    { name: "Active Sessions", icon: "fa-clock",        url: "active-session.html" },
    { name: "Billing",         icon: "fa-cash-register",url: "Billing.html" },
    { name: "Bills History",   icon: "fa-file-invoice", url: "bills-history.html" },
    { name: "Customers",       icon: "fa-users",        url: "customers.html" },
    { name: "Staff Management",icon: "fa-user-shield",  url: "staff-management.html" },
    { name: "Products",        icon: "fa-boxes",        url: "products.html" },
    { name: "Expenses",        icon: "fa-receipt",      url: "expenses.html" },
    { name: "Monthly Summary",icon: "fa-calendar-alt", url: "monthly-summary.html" },
    { name: "Sales Reports",   icon: "fa-chart-bar",    url: "sales-reports.html" },
    { name: "Settings",         icon: "fa-cog",          url: "settings.html" }
  ];
  var currentPage = (window.location.pathname.split("/").pop() || "").toLowerCase();
  var css = document.createElement("style");
  css.textContent =
    "#cue-sidebar-toggle{position:fixed;top:12px;left:12px;z-index:1001;width:40px;height:40px;" +
    "border:none;border-radius:8px;background:rgba(255,255,255,.15);color:#fff;font-size:18px;" +
    "cursor:pointer;backdrop-filter:blur(4px);}" +
    "#cue-sidebar-toggle:hover{background:rgba(255,255,255,.3);}" +
    ".header-bar .d-flex>div:first-child{padding-left:44px;}" +
    "#cue-sidebar{position:fixed;top:0;left:0;height:100vh;width:260px;z-index:1000;" +
    "background:linear-gradient(180deg,#1a2c42,#2d4263);color:#fff;transform:translateX(-100%);" +
    "transition:transform .25s ease;overflow-y:auto;box-shadow:2px 0 12px rgba(0,0,0,.25);}" +
    "#cue-sidebar.open{transform:translateX(0);}" +
    "#cue-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:999;opacity:0;" +
    "pointer-events:none;transition:opacity .25s ease;}" +
    "#cue-backdrop.show{opacity:1;pointer-events:auto;}" +
    "#cue-sidebar .cue-brand{padding:22px 20px 16px;border-bottom:1px solid rgba(255,255,255,.1);}" +
    "#cue-sidebar .cue-brand .cue-brand-row{display:flex;align-items:center;gap:12px;}" +
    "#cue-sidebar .cue-brand img{width:44px;height:44px;border-radius:10px;background:#fff;object-fit:contain;padding:3px;}" +
    "#cue-sidebar .cue-brand h5{margin:0;font-weight:700;font-size:.98rem;line-height:1.25;color:#fff;}" +
    "#cue-sidebar .cue-brand small{color:#e8b832;font-size:.72rem;letter-spacing:.4px;}" +
    "#cue-sidebar nav a{display:flex;align-items:center;gap:12px;padding:12px 20px;color:#d1d5db;" +
    "text-decoration:none;font-size:.92rem;border-left:3px solid transparent;}" +
    "#cue-sidebar nav a i{width:18px;text-align:center;}" +
    "#cue-sidebar nav a:hover{background:rgba(255,255,255,.08);color:#fff;}" +
    "#cue-sidebar nav a.active{background:rgba(232,184,50,.15);color:#e8b832;" +
    "border-left-color:#e8b832;font-weight:600;}" +
    "#cue-sidebar .cue-logout{margin:20px;padding:12px;border-radius:8px;background:rgba(255,255,255,.08);" +
    "color:#ffb3b3;text-align:center;cursor:pointer;font-size:.9rem;border:none;width:calc(100% - 40px);}" +
    "#cue-sidebar .cue-logout:hover{background:#dc3545;color:#fff;}" +
    ".brand-logo-img{height:34px;width:34px;border-radius:8px;background:#fff;object-fit:contain;" +
    "padding:2px;margin-right:8px;vertical-align:middle;}";
  document.head.appendChild(css);

  var btn = document.createElement("button");
  btn.id = "cue-sidebar-toggle";
  btn.innerHTML = '<i class="fas fa-bars"></i>';
  btn.title = "Menu";
  document.body.appendChild(btn);
  var backdrop = document.createElement("div");
  backdrop.id = "cue-backdrop";
  document.body.appendChild(backdrop);
  var aside = document.createElement("aside");
  aside.id = "cue-sidebar";
  aside.setAttribute("aria-label", "Main navigation");
  var navLinks = PAGES.map(function (p) {
    var active = p.url.toLowerCase() === currentPage ? " active" : "";
    return '<a href="' + p.url + '" class="' + active.trim() + '"><i class="fas ' + p.icon + '"></i> ' + p.name + "</a>";
  }).join("");
  aside.innerHTML =
    '<div class="cue-brand">' +
      '<div class="cue-brand-row">' +
        '<img src="pyramid_logo.png" alt="Pyramid Snooker Palor logo" onerror="this.style.visibility=\'hidden\'">' +
        '<div><h5>PYRAMID SNOOKER PALOR<br>MANAGEMENT</h5><small>Snooker &amp; Pool POS</small></div>' +
      '</div>' +
    "</div>" +
    "<nav>" + navLinks + "</nav>" +
    '<button class="cue-logout" id="cue-logout-btn"><i class="fas fa-sign-out-alt me-1"></i> Logout</button>';
  document.body.appendChild(aside);

  // Inject the logo into every authenticated page header that does not already have one.
  try {
    var bars = document.querySelectorAll(".header-bar");
    Array.prototype.forEach.call(bars, function (bar) {
      if (bar.querySelector("img.brand-logo-img")) return;
      var titleEl = bar.querySelector("h1,h2,h4,h5,.h5");
      if (!titleEl || titleEl.querySelector("img.brand-logo-img")) return;
      var img = document.createElement("img");
      img.className = "brand-logo-img";
      img.src = "pyramid_logo.png";
      img.alt = "Pyramid Snooker Palor logo";
      img.onerror = function () { img.style.display = "none"; };
      titleEl.insertBefore(img, titleEl.firstChild);
    });
  } catch (e) {}

  function openSidebar() { aside.classList.add("open"); backdrop.classList.add("show"); }
  function closeSidebar() { aside.classList.remove("open"); backdrop.classList.remove("show"); }
  btn.addEventListener("click", function (e) { e.stopPropagation(); aside.classList.contains("open") ? closeSidebar() : openSidebar(); });
  backdrop.addEventListener("click", closeSidebar);
  document.getElementById("cue-logout-btn").addEventListener("click", function () {
    if (confirm("Are you sure you want to logout?")) {
      sessionStorage.removeItem("currentStaff");
      sessionStorage.removeItem("cueclubLoggedIn");
      window.location.replace("login.html");
    }
  });
})();
