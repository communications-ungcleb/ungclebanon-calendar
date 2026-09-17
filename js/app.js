/**
 * UNGCNL 2026 Engagement Calendar — application logic.
 * Vanilla JS, no build step. Depends on icons.js and data.js being
 * loaded first (see index.html).
 */
(function () {
  "use strict";

  var ICONS = window.UNGCNL_ICONS;
  var THEME_META = window.UNGCNL_THEME_META;
  var SCOPE_META = window.UNGCNL_SCOPE_META;
  var STATUS_META = window.UNGCNL_STATUS_META;
  var CONTACTS = window.UNGCNL_CONTACTS;

  // Events with no confirmed date (startDate === null, "Date to Be
  // Confirmed") always sort last.
  function byStartDate(a, b) {
    if (!a.startDate && !b.startDate) return 0;
    if (!a.startDate) return 1;
    if (!b.startDate) return -1;
    return a.startDate < b.startDate ? -1 : a.startDate > b.startDate ? 1 : 0;
  }
  var EVENTS = window.UNGCNL_EVENTS.slice().sort(byStartDate);

  var YEAR = 2026;
  var MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var DAY_W = 40;       // px per day column, must match --day-w in styles.css
  var MIN_PILL_W = 158; // px, keeps event names legible even for 1-day events
  var PILL_H = 34;
  var PILL_GAP = 8;

  var state = {
    view: "timeline",           // "timeline" | "list"
    month: 0,                   // 0 = All Year, 1-12 for list view
    filters: { scope: "All", type: "All", theme: "All", participation: "All" },
    search: "",
    lastFocusedEl: null
  };

  /* ----------------------------------------------------------------- *
   * Date helpers
   * ----------------------------------------------------------------- */
  function parseISO(iso) {
    var parts = iso.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  function daysInMonth(monthIdx0) { return new Date(YEAR, monthIdx0 + 1, 0).getDate(); }

  function formatDateRange(startISO, endISO) {
    if (!startISO || !endISO) return "Date to be confirmed";
    var s = parseISO(startISO), e = parseISO(endISO);
    var sD = s.getDate(), eD = e.getDate();
    var sM = MONTH_NAMES[s.getMonth()], eM = MONTH_NAMES[e.getMonth()];
    var sY = s.getFullYear(), eY = e.getFullYear();
    if (startISO === endISO) return sD + " " + sM + " " + sY;
    if (sY === eY && s.getMonth() === e.getMonth()) return sD + "–" + eD + " " + sM + " " + sY;
    if (sY === eY) return sD + " " + sM + " – " + eD + " " + eM + " " + sY;
    return sD + " " + sM + " " + sY + " – " + eD + " " + eM + " " + eY;
  }

  function formatCompact(startISO, endISO) {
    if (!startISO || !endISO) return "TBC";
    var s = parseISO(startISO), e = parseISO(endISO);
    var sD = s.getDate(), eD = e.getDate();
    var sM = MONTH_ABBR[s.getMonth()], eM = MONTH_ABBR[e.getMonth()];
    if (startISO === endISO) return sD + " " + sM;
    if (s.getMonth() === e.getMonth()) return sD + "–" + eD + " " + sM;
    return sD + " " + sM + " – " + eD + " " + eM;
  }

  function overlapsMonth(ev, monthIdx0) {
    if (!ev.startDate || !ev.endDate) return false; // date to be confirmed — never plotted
    var s = parseISO(ev.startDate), e = parseISO(ev.endDate);
    var monthStart = new Date(YEAR, monthIdx0, 1);
    var monthEnd = new Date(YEAR, monthIdx0, daysInMonth(monthIdx0));
    return s <= monthEnd && e >= monthStart;
  }

  /* ----------------------------------------------------------------- *
   * Filtering
   * ----------------------------------------------------------------- */
  function matchesFilters(ev) {
    var f = state.filters;
    if (f.scope !== "All" && ev.scope !== f.scope) return false;
    if (f.type !== "All" && ev.type !== f.type) return false;
    if (f.theme !== "All" && THEME_META[ev.theme].group !== f.theme) return false;
    if (f.participation !== "All" && ev.participation !== f.participation) return false;
    if (state.search && !eventMatchesSearch(ev, state.search)) return false;
    return true;
  }
  function eventMatchesSearch(ev, term) {
    var haystack = [ev.name, ev.description, ev.type, ev.theme, ev.scope, ev.participation]
      .join(" ")
      .toLowerCase();
    return haystack.indexOf(term) !== -1;
  }
  function isDefaultFilters() {
    var f = state.filters;
    return f.scope === "All" && f.type === "All" && f.theme === "All" && f.participation === "All" && state.search === "";
  }

  /* ----------------------------------------------------------------- *
   * Small render helpers
   * ----------------------------------------------------------------- */
  function el(tag, className, html) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }

  function scopeIcon(scope) { return ICONS[SCOPE_META[scope].icon]; }
  function themeIcon(theme) { return ICONS[THEME_META[theme].icon]; }
  function themeNeedsDarkText(theme) {
    var g = THEME_META[theme].group;
    // Gold (Labour) and the lighter Tone 2 blue (Community Impact) are both
    // too light for white text at WCAG AA; black passes comfortably on both.
    return g === "Labour" || g === "Community Impact";
  }

  function statusToneClass(status) { return "status--" + STATUS_META[status].tone; }

  function actionFor(ev) {
    if (!ev.link) return null;
    if (ev.status === "Registration Open") return { label: "Register", kind: "register" };
    return { label: "Learn more", kind: "learn" };
  }

  function tagRowHTML(ev, includeTheme) {
    var out = "";
    out += '<span class="tag"><span class="tag-icon">' + scopeIcon(ev.scope) + "</span>" + ev.scope + "</span>";
    out += '<span class="tag">' + ev.type + "</span>";
    if (includeTheme) {
      var tm = THEME_META[ev.theme];
      out += '<span class="tag theme-tag" style="background:' + tm.color + (themeNeedsDarkText(ev.theme) ? ";color:var(--black)" : "") + '">' + themeIcon(ev.theme) + " " + tm.label + "</span>";
    }
    out += '<span class="tag">' + ev.participation + "</span>";
    return out;
  }

  /* ----------------------------------------------------------------- *
   * Timeline view
   * ----------------------------------------------------------------- */
  function renderTimeline() {
    var root = document.getElementById("timelineView");
    root.innerHTML = "";

    for (var m = 0; m < 12; m++) {
      var baseList = EVENTS.filter(function (ev) { return overlapsMonth(ev, m); });
      var filteredList = baseList.filter(matchesFilters);
      var nDays = daysInMonth(m);

      var row = el("div", "month-row");

      var idCol = el("div", "month-id");
      idCol.innerHTML =
        '<span class="month-badge">' + String(m + 1).padStart(2, "0") + "</span>" +
        '<span class="month-name">' + MONTH_NAMES[m] + "</span>";
      row.appendChild(idCol);

      var scrollWrap = el("div", "month-scroll");
      var timelineInner = el("div");
      timelineInner.style.width = (nDays * DAY_W) + "px";

      var ruler = el("div", "day-ruler");
      for (var d = 1; d <= nDays; d++) {
        var dow = new Date(YEAR, m, d).getDay();
        var tick = el("div", "day-tick" + ((dow === 0 || dow === 6) ? " is-weekend" : ""), String(d));
        tick.style.width = DAY_W + "px";
        ruler.appendChild(tick);
      }
      timelineInner.appendChild(ruler);

      var track = el("div", "event-track");
      timelineInner.appendChild(track);

      if (baseList.length === 0) {
        track.appendChild(el("p", "empty-note", "More 2026 opportunities will be announced soon."));
      } else if (filteredList.length === 0) {
        track.appendChild(el("p", "empty-note", "No engagements match the selected filters."));
      } else {
        var segments = filteredList.map(function (ev) {
          var s = parseISO(ev.startDate), e = parseISO(ev.endDate);
          var monthStart = new Date(YEAR, m, 1), monthEnd = new Date(YEAR, m, nDays);
          var segStartDay = (s < monthStart) ? 1 : s.getDate();
          var segEndDay = (e > monthEnd) ? nDays : e.getDate();
          var leftPx = (segStartDay - 1) * DAY_W;
          var naturalW = (segEndDay - segStartDay + 1) * DAY_W;
          var maxAvail = (nDays * DAY_W) - leftPx;
          var width = Math.min(Math.max(naturalW, MIN_PILL_W), maxAvail);
          return {
            ev: ev, leftPx: leftPx, width: width,
            continuesPrev: s < monthStart, continuesNext: e > monthEnd
          };
        }).sort(function (a, b) { return a.leftPx - b.leftPx; });

        var laneEnds = [];
        segments.forEach(function (seg) {
          var lane = 0;
          while (lane < laneEnds.length && laneEnds[lane] + PILL_GAP > seg.leftPx) lane++;
          laneEnds[lane] = seg.leftPx + seg.width;
          seg.lane = lane;
        });
        var laneCount = laneEnds.length;
        track.classList.toggle("has-multiple", laneCount > 1);
        track.style.minHeight = (laneCount * (PILL_H + PILL_GAP) + PILL_GAP) + "px";

        segments.forEach(function (seg) {
          var ev = seg.ev;
          var tm = THEME_META[ev.theme];
          var darkText = themeNeedsDarkText(ev.theme);
          var pill = el("button", "event-pill" + (darkText ? " text-dark" : "") +
            (seg.continuesPrev ? " continues-prev" : "") + (seg.continuesNext ? " continues-next" : ""));
          pill.style.left = seg.leftPx + "px";
          pill.style.width = seg.width + "px";
          pill.style.top = (seg.lane * (PILL_H + PILL_GAP) + PILL_GAP) + "px";
          pill.style.background = tm.color;
          pill.type = "button";
          pill.setAttribute("aria-haspopup", "dialog");
          pill.innerHTML =
            '<span class="pill-icon">' + scopeIcon(ev.scope) + "</span>" +
            '<span class="pill-name">' + ev.name + "</span>" +
            '<span class="pill-date">' + formatCompact(ev.startDate, ev.endDate) + "</span>";
          pill.addEventListener("click", function () { openDetail(ev.id, pill); });
          track.appendChild(pill);
        });
      }

      scrollWrap.appendChild(timelineInner);
      row.appendChild(scrollWrap);
      root.appendChild(row);
    }
  }

  /* ----------------------------------------------------------------- *
   * List view
   * ----------------------------------------------------------------- */
  function renderMonthSelector() {
    var wrap = document.getElementById("monthSelector");
    wrap.innerHTML = "";
    var allBtn = el("button", "month-chip all-year", "All Year");
    allBtn.type = "button";
    allBtn.setAttribute("aria-pressed", String(state.month === 0));
    allBtn.addEventListener("click", function () { state.month = 0; renderMonthSelector(); renderList(); });
    wrap.appendChild(allBtn);

    MONTH_NAMES.forEach(function (name, idx) {
      var btn = el("button", "month-chip");
      btn.type = "button";
      btn.innerHTML = '<span class="num">' + String(idx + 1).padStart(2, "0") + "</span>" + name;
      btn.setAttribute("aria-pressed", String(state.month === idx + 1));
      btn.addEventListener("click", function () { state.month = idx + 1; renderMonthSelector(); renderList(); });
      wrap.appendChild(btn);
    });
  }

  function renderList() {
    var root = document.getElementById("listCards");
    root.innerHTML = "";

    var baseList = state.month === 0
      ? EVENTS.slice()
      : EVENTS.filter(function (ev) { return overlapsMonth(ev, state.month - 1); });
    var filteredList = baseList.filter(matchesFilters).sort(byStartDate);

    if (baseList.length === 0) {
      root.appendChild(emptyState("More 2026 opportunities will be announced soon."));
      return;
    }
    if (filteredList.length === 0) {
      root.appendChild(emptyState("No engagements match the selected filters."));
      return;
    }

    filteredList.forEach(function (ev) {
      var tm = THEME_META[ev.theme];
      var darkText = themeNeedsDarkText(ev.theme);
      var card = el("button", "event-card");
      card.type = "button";
      card.setAttribute("aria-haspopup", "dialog");

      var dateBlock = el("div", "date-block");
      dateBlock.style.background = tm.color;
      if (darkText) dateBlock.style.color = "var(--black)";
      if (!ev.startDate) {
        dateBlock.innerHTML = '<span class="day" style="font-size:1rem;letter-spacing:0.03em">TBC</span>';
      } else {
        var s = parseISO(ev.startDate);
        dateBlock.innerHTML =
          '<span class="day">' + s.getDate() + "</span>" +
          '<span class="mon">' + MONTH_ABBR[s.getMonth()] + "</span>" +
          (ev.startDate !== ev.endDate ? '<span class="range">' + formatCompact(ev.startDate, ev.endDate) + "</span>" : "");
      }
      card.appendChild(dateBlock);

      var body = el("div", "event-card-body");
      var action = actionFor(ev);
      body.innerHTML =
        '<div class="event-card-top"><h3>' + ev.name + "</h3></div>" +
        '<div class="tag-row">' + tagRowHTML(ev, true) + "</div>" +
        '<p class="desc">' + ev.description + "</p>" +
        '<div class="card-footer">' +
        '<span class="status-badge ' + statusToneClass(ev.status) + '">' + ev.status + "</span>" +
        (action ? '<a class="btn btn--sm btn--ghost card-action" href="' + ev.link + '">' + action.label + ICONS.arrow + "</a>" : "") +
        "</div>";
      card.appendChild(body);

      card.addEventListener("click", function () { openDetail(ev.id, card); });
      var actionEl = body.querySelector(".card-action");
      if (actionEl) {
        actionEl.addEventListener("click", function (evt) {
          evt.stopPropagation();
          if (actionEl.getAttribute("href") === "#") evt.preventDefault();
        });
      }
      root.appendChild(card);
    });
  }

  function emptyState(message) {
    var wrap = el("div", "empty-state");
    wrap.innerHTML = ICONS.calendar + "<p>" + message + "</p>";
    return wrap;
  }

  /* ----------------------------------------------------------------- *
   * Detail panel
   * ----------------------------------------------------------------- */
  var panel, overlay;
  function openDetail(eventId, triggerEl) {
    var ev = EVENTS.filter(function (e) { return e.id === eventId; })[0];
    if (!ev) return;
    state.lastFocusedEl = triggerEl || document.activeElement;

    var tm = THEME_META[ev.theme];
    var darkText = themeNeedsDarkText(ev.theme);
    var action = actionFor(ev);

    document.getElementById("detailThemeTag").innerHTML = themeIcon(ev.theme) + " " + tm.label;
    var themeTagEl = document.getElementById("detailThemeTag");
    themeTagEl.style.background = darkText ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.16)";
    themeTagEl.style.color = darkText ? "var(--black)" : "#fff";

    document.getElementById("detailTitle").textContent = ev.name;
    document.getElementById("detailDate").textContent = formatDateRange(ev.startDate, ev.endDate);
    document.getElementById("detailTags").innerHTML = tagRowHTML(ev, false);
    document.getElementById("detailStatus").innerHTML = '<span class="status-badge ' + statusToneClass(ev.status) + '">' + ev.status + "</span>";
    // innerHTML (not textContent): a few descriptions carry a <strong> tag
    // for the registration note. Content is fully author-controlled (data.js).
    document.getElementById("detailDescription").innerHTML = ev.description;

    var contactWrap = document.getElementById("detailContact");
    contactWrap.innerHTML = "";
    contactWrap.hidden = !(ev.contact && CONTACTS[ev.contact]);
    if (ev.contact && CONTACTS[ev.contact]) {
      var person = CONTACTS[ev.contact];
      var link = el("a", "detail-contact-link", "Contact " + person.name.split(" ")[0] + " for more details " + ICONS.arrow);
      link.href = "#contact-" + ev.contact;
      link.addEventListener("click", function (e) {
        e.preventDefault();
        closeDetail();
        goToContact(ev.contact);
      });
      contactWrap.appendChild(link);
    }

    var actionsWrap = document.getElementById("detailActions");
    actionsWrap.innerHTML = "";
    if (action) {
      var a = el("a", "btn btn--on-light", action.label + " " + ICONS.arrow);
      a.href = ev.link;
      if (ev.link !== "#") { a.target = "_blank"; a.rel = "noopener"; }
      else { a.addEventListener("click", function (e) { e.preventDefault(); }); }
      actionsWrap.appendChild(a);
    }

    document.getElementById("main").setAttribute("inert", "");
    document.getElementById("siteHeader").setAttribute("inert", "");
    document.getElementById("siteFooter").setAttribute("inert", "");
    overlay.hidden = false;
    panel.hidden = false;
    document.getElementById("detailPanelClose").focus();
    document.addEventListener("keydown", onPanelKeydown, true);
  }

  function closeDetail() {
    panel.hidden = true;
    overlay.hidden = true;
    document.getElementById("main").removeAttribute("inert");
    document.getElementById("siteHeader").removeAttribute("inert");
    document.getElementById("siteFooter").removeAttribute("inert");
    document.removeEventListener("keydown", onPanelKeydown, true);
    if (state.lastFocusedEl && typeof state.lastFocusedEl.focus === "function") {
      state.lastFocusedEl.focus();
    }
  }

  function goToContact(key) {
    var target = document.getElementById("contact-" + key);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.classList.add("is-highlighted");
    window.setTimeout(function () { target.classList.remove("is-highlighted"); }, 2200);
  }

  function onPanelKeydown(e) {
    if (e.key === "Escape") { e.preventDefault(); closeDetail(); return; }
    if (e.key === "Tab") {
      var focusables = panel.querySelectorAll('a[href], button:not([disabled])');
      if (!focusables.length) return;
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  /* ----------------------------------------------------------------- *
   * Filters, view toggle, theme legend, theme (dark/light) toggle
   * ----------------------------------------------------------------- */
  function populateFilterSelect(id, options, labelForValue) {
    var sel = document.getElementById(id);
    sel.innerHTML = "";
    options.forEach(function (val) {
      var opt = document.createElement("option");
      opt.value = val;
      opt.textContent = labelForValue ? labelForValue(val) : val;
      sel.appendChild(opt);
    });
  }

  function renderCurrentView() {
    if (state.view === "timeline") renderTimeline(); else renderList();
  }

  function setupFilters() {
    populateFilterSelect("filterScope", window.UNGCNL_SCOPE_FILTERS);
    populateFilterSelect("filterType", window.UNGCNL_TYPE_FILTERS);
    populateFilterSelect("filterTheme", window.UNGCNL_THEME_FILTERS);
    populateFilterSelect("filterParticipation", window.UNGCNL_PARTICIPATION_FILTERS);

    ["Scope", "Type", "Theme", "Participation"].forEach(function (key) {
      var id = "filter" + key;
      var stateKey = key.toLowerCase();
      document.getElementById(id).addEventListener("change", function (e) {
        state.filters[stateKey] = e.target.value;
        updateResetButton();
        renderCurrentView();
      });
    });

    document.getElementById("resetFilters").addEventListener("click", function () {
      state.filters = { scope: "All", type: "All", theme: "All", participation: "All" };
      state.search = "";
      document.getElementById("filterScope").value = "All";
      document.getElementById("filterType").value = "All";
      document.getElementById("filterTheme").value = "All";
      document.getElementById("filterParticipation").value = "All";
      document.getElementById("eventSearch").value = "";
      updateResetButton();
      renderCurrentView();
    });
    updateResetButton();
  }

  function setupSearch() {
    var input = document.getElementById("eventSearch");
    input.addEventListener("input", function (e) {
      state.search = e.target.value.trim().toLowerCase();
      updateResetButton();
      renderCurrentView();
    });
  }

  function updateResetButton() {
    document.getElementById("resetFilters").disabled = isDefaultFilters();
  }

  function setupViewToggle() {
    var timelineBtn = document.getElementById("viewTimelineBtn");
    var listBtn = document.getElementById("viewListBtn");
    function apply() {
      timelineBtn.setAttribute("aria-pressed", String(state.view === "timeline"));
      listBtn.setAttribute("aria-pressed", String(state.view === "list"));
      document.getElementById("timelineView").hidden = state.view !== "timeline";
      document.getElementById("listViewWrap").hidden = state.view !== "list";
      renderCurrentView();
    }
    timelineBtn.addEventListener("click", function () { state.view = "timeline"; apply(); });
    listBtn.addEventListener("click", function () { state.view = "list"; apply(); });
  }

  function setupThemeTiles() {
    document.querySelectorAll(".tile[data-theme-filter]").forEach(function (tile) {
      tile.addEventListener("click", function () {
        var val = tile.getAttribute("data-theme-filter");
        state.filters.theme = val;
        document.getElementById("filterTheme").value = val;
        updateResetButton();
        document.getElementById("calendar").scrollIntoView({ behavior: "smooth", block: "start" });
        renderCurrentView();
      });
    });
  }

  function setupColorModeToggle() {
    // The inline script in <head> already set data-theme (light by default,
    // or the stored choice) before this ran, so no initial-state work here.
    var toggle = document.getElementById("themeToggle");
    toggle.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme") || "light";
      var next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("ungcnl-color-mode", next); } catch (e) {}
    });
  }

  function setupScrollReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    els.forEach(function (el) { io.observe(el); });
  }

  function applyStaticIcons() {
    document.querySelectorAll("[data-icon]").forEach(function (node) {
      var key = node.getAttribute("data-icon");
      if (ICONS[key]) node.innerHTML = ICONS[key];
    });
  }

  /* ----------------------------------------------------------------- *
   * Init
   * ----------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    applyStaticIcons();
    panel = document.getElementById("detailPanel");
    overlay = document.getElementById("overlay");

    document.getElementById("detailPanelClose").addEventListener("click", closeDetail);
    overlay.addEventListener("click", closeDetail);

    setupFilters();
    setupSearch();
    setupViewToggle();
    setupThemeTiles();
    setupColorModeToggle();
    setupScrollReveal();
    renderMonthSelector();
    renderTimeline();
    renderList();

    document.getElementById("jumpToCalendar").addEventListener("click", function (e) {
      e.preventDefault();
      document.getElementById("calendar").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
})();
