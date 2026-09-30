/*
  Unity Fund site behavior.
  Each feature looks for its own data-* hook, so one script serves every page.
*/
(function () {
  "use strict";

  var D = window.UNITY;
  if (!D) return;

  var sleeveById = {};
  D.sleeves.forEach(function (s) {
    s.count = D.holdings.filter(function (h) { return h.sleeve === s.id; }).length;
    sleeveById[s.id] = s;
  });

  var lastDistribution = D.distributions[D.distributions.length - 1];

  /* Formatting ------------------------------------------------------------ */

  var usd0 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  var usd2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var int = new Intl.NumberFormat("en-US");

  function money(n, cents) { return (cents ? usd2 : usd0).format(n); }

  function moneyShort(n) {
    if (n >= 1e6) return "$" + trim(n / 1e6, 2) + "M";
    if (n >= 1e3) return "$" + trim(n / 1e3, 0) + "K";
    return usd0.format(n);
  }

  function moneyWords(n) {
    if (n >= 1e6) return "$" + trim(n / 1e6, 1) + " million";
    return usd0.format(n);
  }

  function trim(n, d) { return String(Number(n.toFixed(d))); }

  function pct(n) { return n.toFixed(1) + "%"; }

  function longDate(d) {
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function swatch(color) {
    var s = el("span", "swatch");
    s.style.background = color;
    s.setAttribute("aria-hidden", "true");
    return s;
  }

  function parseAmount(value) {
    var n = parseFloat(String(value).replace(/[^0-9.]/g, ""));
    return isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0;
  }

  function hasCents(n) { return Math.round(n * 100) % 100 !== 0; }

  function grantFor(weight) { return Math.round(lastDistribution.amount * weight / 100); }

  /* Facts bound into the page ------------------------------------------- */

  var factFormats = {
    int: function (v) { return int.format(v); },
    words: moneyWords,
    short: moneyShort,
    usd: function (v) { return money(v); },
    text: function (v) { return String(v); }
  };

  document.querySelectorAll("[data-fact]").forEach(function (node) {
    var key = node.getAttribute("data-fact");
    var value = key === "asOf" ? D.asOf : D.facts[key];
    if (value == null) return;
    var fmt = factFormats[node.getAttribute("data-format") || "text"] || factFormats.text;
    node.textContent = fmt(value);
  });

  document.querySelectorAll("[data-last-quarter]").forEach(function (node) {
    node.textContent = lastDistribution.quarter + " " + lastDistribution.year;
  });

  /* Navigation ----------------------------------------------------------- */

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        toggle.focus();
      }
    });
  }

  /* Tooltip ---------------------------------------------------------------- */

  var tip = el("div", "tooltip");
  tip.setAttribute("aria-hidden", "true");
  var tipValue = el("span", "tooltip-value");
  var tipLabel = el("span", "tooltip-label");
  var tipKey = el("span", "tooltip-key");
  var tipText = el("span");
  tipLabel.appendChild(tipKey);
  tipLabel.appendChild(tipText);
  tip.appendChild(tipValue);
  tip.appendChild(tipLabel);
  document.body.appendChild(tip);

  function showTip(x, y, value, label, color) {
    tipValue.textContent = value;
    tipText.textContent = label;
    tipKey.style.background = color || "transparent";
    tipKey.style.display = color ? "" : "none";
    tip.classList.add("is-visible");
    var w = tip.offsetWidth, h = tip.offsetHeight;
    var left = Math.min(x + 16, window.innerWidth - w - 12);
    var top = y - h - 14;
    if (top < 12) top = y + 20;
    tip.style.left = Math.max(12, left) + "px";
    tip.style.top = top + "px";
  }

  function hideTip() { tip.classList.remove("is-visible"); }

  window.addEventListener("scroll", hideTip, { passive: true });

  /* Allocation bar -------------------------------------------------------- */

  function renderAllocBar(host) {
    host.textContent = "";
    host.classList.add("alloc-bar");
    host.setAttribute("role", "img");
    host.setAttribute("aria-label", "Allocation by cause area: " + D.sleeves.map(function (s) {
      return s.name + " " + s.weight + " percent";
    }).join(", "));

    D.sleeves.forEach(function (s) {
      var seg = el("span", "alloc-seg");
      seg.style.flex = s.weight + " 1 0";
      seg.style.background = s.color;
      seg.setAttribute("data-sleeve", s.id);
      host.appendChild(seg);
    });
  }

  document.querySelectorAll("[data-alloc-bar]").forEach(renderAllocBar);

  // Hovering a segment, a table row or a legend item highlights the same
  // cause area everywhere inside its [data-alloc-group].
  function bindAllocGroup(group) {
    function setActive(id) {
      group.querySelectorAll(".alloc-bar").forEach(function (bar) {
        bar.classList.toggle("has-focus", !!id);
      });
      group.querySelectorAll("[data-sleeve]").forEach(function (node) {
        node.classList.toggle("is-active", !!id && node.getAttribute("data-sleeve") === id);
      });
    }

    group.addEventListener("pointerover", function (e) {
      var target = e.target.closest("[data-sleeve]");
      if (!target || !group.contains(target)) return;
      setActive(target.getAttribute("data-sleeve"));
    });
    group.addEventListener("pointerout", function (e) {
      var from = e.target.closest("[data-sleeve]");
      var to = e.relatedTarget && e.relatedTarget.closest ? e.relatedTarget.closest("[data-sleeve]") : null;
      if (from && from !== to) { setActive(null); hideTip(); }
    });
    group.addEventListener("pointermove", function (e) {
      var seg = e.target.closest(".alloc-seg");
      if (!seg) { hideTip(); return; }
      var s = sleeveById[seg.getAttribute("data-sleeve")];
      var amountNode = group.querySelector("[data-sleeve-amount='" + s.id + "']");
      if (amountNode && amountNode.textContent) {
        showTip(e.clientX, e.clientY, amountNode.textContent, s.name + ", " + s.weight + "% of each contribution", s.color);
      } else {
        showTip(e.clientX, e.clientY, s.weight + "%", s.name + ", " + s.count + " organizations", s.color);
      }
    });
  }

  document.querySelectorAll("[data-alloc-group]").forEach(bindAllocGroup);

  /* Allocation legend (portfolio) --------------------------------------- */

  document.querySelectorAll("[data-alloc-legend]").forEach(function (list) {
    D.sleeves.forEach(function (s) {
      var li = el("li");
      li.setAttribute("data-sleeve", s.id);
      li.appendChild(swatch(s.color));
      li.appendChild(el("span", null, s.name));
      li.appendChild(el("strong", null, s.weight + "%"));
      list.appendChild(li);
    });
  });

  /* Allocation table with calculator (home) ------------------------------ */

  var allocTable = document.querySelector("[data-alloc-table]");
  if (allocTable) {
    var tbody = allocTable.querySelector("tbody");
    D.sleeves.forEach(function (s) {
      var tr = el("tr");
      tr.setAttribute("data-sleeve", s.id);
      var th = el("th");
      th.scope = "row";
      var name = el("span", "cell-name");
      name.appendChild(swatch(s.color));
      name.appendChild(el("span", null, s.name));
      th.appendChild(name);
      tr.appendChild(th);
      tr.appendChild(el("td", "is-num hide-sm", String(s.count)));
      tr.appendChild(el("td", "is-num", s.weight + "%"));
      var amount = el("td", "is-num");
      amount.setAttribute("data-sleeve-amount", s.id);
      tr.appendChild(amount);
      tbody.appendChild(tr);
    });
  }

  var calc = document.querySelector("[data-calc]");
  if (calc && allocTable) {
    var input = calc.querySelector("input");
    var presets = calc.querySelectorAll(".preset");
    var totalCell = allocTable.querySelector("[data-total-amount]");
    var giveLink = document.querySelector("[data-give-link]");

    function updateCalc() {
      var amount = parseAmount(input.value);
      var cents = true;
      D.sleeves.forEach(function (s) {
        var cell = allocTable.querySelector("[data-sleeve-amount='" + s.id + "']");
        cell.textContent = money(amount * s.weight / 100, cents);
      });
      totalCell.textContent = money(amount, cents);
      presets.forEach(function (p) {
        p.setAttribute("aria-pressed", String(parseAmount(p.getAttribute("data-value")) === amount));
      });
      if (giveLink) {
        giveLink.href = "contribute.html" + (amount ? "?amount=" + amount : "");
      }
    }

    input.addEventListener("input", updateCalc);
    input.addEventListener("blur", function () {
      var amount = parseAmount(input.value);
      input.value = amount ? int.format(amount) : "";
    });
    presets.forEach(function (p) {
      p.addEventListener("click", function () {
        input.value = int.format(parseAmount(p.getAttribute("data-value")));
        updateCalc();
      });
    });
    updateCalc();
  }

  /* Holdings rows --------------------------------------------------------- */

  var MAX_WEIGHT = 5; // single-holding cap, used to scale the weight bars

  function holdingRow(h, opts) {
    var s = sleeveById[h.sleeve];
    var tr = el("tr");

    var org = el("th");
    org.scope = "row";
    org.appendChild(el("span", "cell-org", h.name));
    var areaSmall = el("span", "cell-name cell-area-sm");
    areaSmall.appendChild(swatch(s.color));
    areaSmall.appendChild(el("span", null, s.name));
    org.appendChild(areaSmall);
    if (opts.about) org.appendChild(el("span", "cell-about", h.about));
    tr.appendChild(org);

    var area = el("td", "hide-sm");
    var areaInner = el("span", "cell-name");
    areaInner.appendChild(swatch(s.color));
    areaInner.appendChild(el("span", null, s.name));
    area.appendChild(areaInner);
    tr.appendChild(area);

    tr.appendChild(el("td", "hide-sm", h.region));
    if (opts.since) tr.appendChild(el("td", "is-num hide-sm", String(h.since)));

    var weight = el("td", "is-num");
    var wrap = el("span", "weight-cell");
    var track = el("span", "weight-track");
    track.setAttribute("aria-hidden", "true");
    var fill = el("span", "weight-fill");
    fill.style.width = (h.weight / MAX_WEIGHT * 100) + "%";
    fill.style.background = s.color;
    track.appendChild(fill);
    wrap.appendChild(track);
    wrap.appendChild(el("span", null, pct(h.weight)));
    weight.appendChild(wrap);
    tr.appendChild(weight);

    tr.appendChild(el("td", "is-num hide-sm", money(grantFor(h.weight))));
    return tr;
  }

  var topTable = document.querySelector("[data-top-holdings]");
  if (topTable) {
    var limit = parseInt(topTable.getAttribute("data-top-holdings"), 10) || 10;
    var topBody = topTable.querySelector("tbody");
    D.holdings.slice().sort(function (a, b) { return b.weight - a.weight; })
      .slice(0, limit)
      .forEach(function (h) { topBody.appendChild(holdingRow(h, { about: false, since: false })); });
  }

  /* Holdings explorer (portfolio) --------------------------------------- */

  var explorer = document.querySelector("[data-holdings-explorer]");
  if (explorer) {
    var table = explorer.querySelector("table");
    var body = table.querySelector("tbody");
    var select = explorer.querySelector("#filter-area");
    var search = explorer.querySelector("#filter-search");
    var count = explorer.querySelector("[data-result-count]");
    var empty = explorer.querySelector("[data-empty]");
    var csvButton = explorer.querySelector("[data-csv]");
    var sortKey = "weight";
    var sortDir = "descending";

    D.sleeves.forEach(function (s) {
      var opt = el("option", null, s.name + " (" + s.count + ")");
      opt.value = s.id;
      select.appendChild(opt);
    });

    var params = new URLSearchParams(window.location.search);
    if (params.get("area") && sleeveById[params.get("area")]) select.value = params.get("area");

    var sleeveOrder = {};
    D.sleeves.forEach(function (s, i) { sleeveOrder[s.id] = i; });

    var comparators = {
      name: function (a, b) { return a.name.localeCompare(b.name); },
      area: function (a, b) { return sleeveOrder[a.sleeve] - sleeveOrder[b.sleeve] || b.weight - a.weight; },
      region: function (a, b) { return a.region.localeCompare(b.region) || b.weight - a.weight; },
      since: function (a, b) { return a.since - b.since || b.weight - a.weight; },
      weight: function (a, b) { return a.weight - b.weight || b.name.localeCompare(a.name); }
    };

    function currentRows() {
      var area = select.value;
      var q = search.value.trim().toLowerCase();
      var rows = D.holdings.filter(function (h) {
        if (area !== "all" && h.sleeve !== area) return false;
        if (!q) return true;
        return (h.name + " " + h.about + " " + h.region + " " + sleeveById[h.sleeve].name).toLowerCase().indexOf(q) !== -1;
      });
      var cmp = comparators[sortKey];
      rows.sort(function (a, b) { return sortDir === "ascending" ? cmp(a, b) : cmp(b, a); });
      return rows;
    }

    function renderExplorer() {
      var rows = currentRows();
      body.textContent = "";
      rows.forEach(function (h) { body.appendChild(holdingRow(h, { about: true, since: true })); });
      var total = rows.reduce(function (sum, h) { return sum + h.weight; }, 0);
      count.textContent = rows.length === D.holdings.length
        ? "Showing all " + rows.length + " organizations"
        : "Showing " + rows.length + " of " + D.holdings.length + " organizations, " + pct(total) + " of the fund";
      empty.hidden = rows.length > 0;
      table.hidden = rows.length === 0;

      table.querySelectorAll("th[data-sort]").forEach(function (th) {
        if (th.getAttribute("data-sort") === sortKey) th.setAttribute("aria-sort", sortDir);
        else th.removeAttribute("aria-sort");
      });
    }

    table.querySelectorAll("th[data-sort] .sort-button").forEach(function (button) {
      button.addEventListener("click", function () {
        var key = button.parentNode.getAttribute("data-sort");
        if (key === sortKey) {
          sortDir = sortDir === "ascending" ? "descending" : "ascending";
        } else {
          sortKey = key;
          sortDir = key === "weight" ? "descending" : "ascending";
        }
        renderExplorer();
      });
    });

    select.addEventListener("change", function () {
      var url = new URL(window.location.href);
      if (select.value === "all") url.searchParams.delete("area");
      else url.searchParams.set("area", select.value);
      window.history.replaceState(null, "", url);
      renderExplorer();
    });
    search.addEventListener("input", renderExplorer);

    csvButton.addEventListener("click", function () {
      var header = ["Organization", "Cause area", "Where they work", "In fund since", "Weight (%)",
        lastDistribution.quarter + " " + lastDistribution.year + " grant (USD)"];
      var lines = [header].concat(currentRows().map(function (h) {
        return [h.name, sleeveById[h.sleeve].name, h.region, h.since, h.weight.toFixed(1), grantFor(h.weight)];
      })).map(function (cols) {
        return cols.map(function (c) {
          var v = String(c);
          return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
        }).join(",");
      });
      var blob = new Blob([lines.join("\n") + "\n"], { type: "text/csv;charset=utf-8" });
      var link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "unity-fund-holdings.csv";
      document.body.appendChild(link);
      link.click();
      setTimeout(function () { URL.revokeObjectURL(link.href); link.remove(); }, 0);
    });

    renderExplorer();
  }

  /* Rebalance changes ----------------------------------------------------- */

  document.querySelectorAll("[data-changes]").forEach(function (list) {
    var kind = list.getAttribute("data-changes");
    D.rebalance[kind].forEach(function (c) {
      var s = sleeveById[c.sleeve];
      var li = el("li");
      var h = el("h4");
      h.appendChild(swatch(s.color));
      h.appendChild(el("span", null, c.name));
      li.appendChild(h);
      var p = el("p");
      p.appendChild(el("span", "sleeve-name", s.name + ". "));
      p.appendChild(document.createTextNode(c.note));
      li.appendChild(p);
      list.appendChild(li);
    });
  });

  /* Distribution chart --------------------------------------------------- */

  var SVGNS = "http://www.w3.org/2000/svg";
  function svg(tag, attrs) {
    var node = document.createElementNS(SVGNS, tag);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  function niceStep(max) {
    var raw = max / 4;
    var mag = Math.pow(10, Math.floor(Math.log10(raw)));
    var norm = raw / mag;
    var step = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;
    return step * mag;
  }

  function renderChart(host) {
    var data = D.distributions;
    var width = Math.max(300, host.clientWidth);
    var compact = width < 640;
    var height = compact ? 280 : 340;
    var m = { top: 34, right: 4, bottom: compact ? 36 : 60, left: compact ? 48 : 60 };
    var plotW = width - m.left - m.right;
    var plotH = height - m.top - m.bottom;

    var maxVal = Math.max.apply(null, data.map(function (d) { return d.amount; }));
    var step = niceStep(maxVal);
    var yMax = Math.ceil(maxVal / step) * step;
    var y = function (v) { return m.top + plotH - (v / yMax) * plotH; };
    var band = plotW / data.length;
    var barW = Math.min(24, Math.max(6, band * 0.55));

    var barColor = getComputedStyle(document.documentElement).getPropertyValue("--green").trim();
    var root = svg("svg", {
      viewBox: "0 0 " + width + " " + height, width: width, height: height,
      role: "group", "aria-label": "Quarterly distributions chart. Use the table view for all values."
    });

    for (var v = 0; v <= yMax + 1; v += step) {
      var gy = Math.round(y(v)) + 0.5;
      root.appendChild(svg("line", { x1: m.left, x2: width - m.right, y1: gy, y2: gy, "class": v === 0 ? "axis-line" : "grid-line" }));
      var t = svg("text", { x: m.left - 12, y: gy + 5, "text-anchor": "end", "class": "tick-label", "aria-hidden": "true" });
      t.textContent = v === 0 ? "$0" : moneyShort(v);
      root.appendChild(t);
    }

    var peakIndex = data.reduce(function (best, d, i) { return d.amount > data[best].amount ? i : best; }, 0);
    var lastIndex = data.length - 1;

    data.forEach(function (d, i) {
      var cx = m.left + band * i + band / 2;
      var x0 = cx - barW / 2;
      var top = y(d.amount);
      var base = y(0);
      var r = Math.min(4, (base - top) / 2);
      var g = svg("g", {});
      var path = "M" + x0 + "," + base +
        "V" + (top + r) +
        "Q" + x0 + "," + top + " " + (x0 + r) + "," + top +
        "H" + (x0 + barW - r) +
        "Q" + (x0 + barW) + "," + top + " " + (x0 + barW) + "," + (top + r) +
        "V" + base + "Z";
      g.appendChild(svg("path", { d: path, "class": "bar", "aria-hidden": "true" }));

      if (i === peakIndex || i === lastIndex) {
        var label = svg("text", { x: cx, y: top - 10, "text-anchor": "middle", "class": "value-label", "aria-hidden": "true" });
        label.textContent = moneyShort(d.amount);
        g.appendChild(label);
      }

      if (!compact) {
        var q = svg("text", { x: cx, y: base + 24, "text-anchor": "middle", "class": "tick-label", "aria-hidden": "true" });
        q.textContent = d.quarter;
        g.appendChild(q);
      }

      var hit = svg("rect", {
        x: m.left + band * i, y: m.top, width: band, height: plotH + 6,
        "class": "bar-hit", tabindex: "0", role: "img",
        "aria-label": d.quarter + " " + d.year + ": " + money(d.amount) + " distributed on " + d.paid
      });
      function show(evt) {
        g.classList.add("is-hover");
        var box = root.getBoundingClientRect();
        var scale = box.width / width;
        var px = evt ? evt.clientX : box.left + cx * scale;
        var py = evt ? evt.clientY : box.top + top * scale;
        showTip(px, py, money(d.amount), d.quarter + " " + d.year + ", paid " + d.paid, barColor);
      }
      function hide() { g.classList.remove("is-hover"); hideTip(); }
      hit.addEventListener("pointermove", show);
      hit.addEventListener("pointerleave", hide);
      hit.addEventListener("focus", function () { show(null); });
      hit.addEventListener("blur", hide);
      g.appendChild(hit);
      root.appendChild(g);
    });

    // Year labels, centered under each year's quarters, with a divider between years.
    var years = [];
    data.forEach(function (d, i) {
      var last = years[years.length - 1];
      if (!last || last.year !== d.year) years.push({ year: d.year, start: i, end: i });
      else last.end = i;
    });
    years.forEach(function (yr, idx) {
      var x1 = m.left + band * yr.start;
      var x2 = m.left + band * (yr.end + 1);
      var ty = height - (compact ? 10 : 12);
      var label = svg("text", { x: (x1 + x2) / 2, y: ty, "text-anchor": "middle", "class": "year-label", "aria-hidden": "true" });
      label.textContent = yr.year;
      root.appendChild(label);
      if (idx > 0) {
        var dx = Math.round(x1) + 0.5;
        root.appendChild(svg("line", { x1: dx, x2: dx, y1: y(0), y2: height - 2, "class": "axis-line" }));
      }
    });

    host.textContent = "";
    host.appendChild(root);
  }

  function renderChartTable(table) {
    var tbody = table.querySelector("tbody");
    var total = 0;
    D.distributions.slice().reverse().forEach(function (d) {
      total += d.amount;
      var tr = el("tr");
      var th = el("th", null, d.quarter + " " + d.year);
      th.scope = "row";
      tr.appendChild(th);
      tr.appendChild(el("td", null, d.paid));
      tr.appendChild(el("td", "is-num", String(d.grants)));
      tr.appendChild(el("td", "is-num", money(d.amount)));
      tbody.appendChild(tr);
    });
    var totalCell = table.querySelector("[data-dist-total]");
    if (totalCell) totalCell.textContent = money(total);
  }

  document.querySelectorAll("[data-dist-chart]").forEach(function (host) {
    renderChart(host);
    var lastW = host.clientWidth;
    if ("ResizeObserver" in window) {
      new ResizeObserver(function () {
        var w = host.clientWidth;
        if (w > 0 && Math.abs(w - lastW) > 4) { lastW = w; renderChart(host); }
      }).observe(host);
    }
  });

  document.querySelectorAll("[data-dist-table]").forEach(renderChartTable);

  document.querySelectorAll("[data-chart-toggle]").forEach(function (group) {
    var block = group.closest(".chart-block");
    var buttons = group.querySelectorAll("button");
    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        var view = b.getAttribute("data-view");
        buttons.forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
        block.querySelector("[data-view-chart]").hidden = view !== "chart";
        block.querySelector("[data-view-table]").hidden = view !== "table";
      });
    });
  });

  /* Cause area table (methodology) --------------------------------------- */

  document.querySelectorAll("[data-sleeve-table]").forEach(function (table) {
    var tbody = table.querySelector("tbody");
    D.sleeves.forEach(function (s) {
      var tr = el("tr");
      var th = el("th");
      th.scope = "row";
      var name = el("span", "cell-name");
      name.appendChild(swatch(s.color));
      name.appendChild(el("span", null, s.name));
      th.appendChild(name);
      tr.appendChild(th);
      tr.appendChild(el("td", "hide-sm", s.summary));
      tr.appendChild(el("td", "is-num", String(s.count)));
      tr.appendChild(el("td", "is-num", s.weight + "%"));
      tbody.appendChild(tr);
    });
  });

  /* Quarterly report list (reports) -------------------------------------- */

  document.querySelectorAll("[data-report-list]").forEach(function (list) {
    var limit = parseInt(list.getAttribute("data-report-list"), 10) || D.distributions.length;
    D.distributions.slice().reverse().slice(0, limit).forEach(function (d) {
      var li = el("li");
      var text = el("div");
      text.appendChild(el("h3", null, d.quarter + " " + d.year + " distribution report"));
      text.appendChild(el("p", null, money(d.amount) + " granted to " + d.grants + " organizations. Paid " + d.paid + "."));
      li.appendChild(text);
      var a = el("a", "doc-link");
      a.href = "reports/unity-fund-" + d.quarter.toLowerCase() + "-" + d.year + "-distribution.pdf";
      a.appendChild(el("span", null, "PDF"));
      a.appendChild(el("span", "visually-hidden", ", " + d.quarter + " " + d.year + " report"));
      li.appendChild(a);
      list.appendChild(li);
    });
  });

  /* Methodology table of contents ---------------------------------------- */

  var toc = document.querySelector("[data-toc]");
  if (toc && "IntersectionObserver" in window) {
    var links = {};
    toc.querySelectorAll("a[href^='#']").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { visible[entry.target.id] = entry.isIntersecting; });
      var current = Object.keys(links).find(function (id) { return visible[id]; });
      if (!current) return;
      Object.keys(links).forEach(function (id) { links[id].classList.toggle("is-current", id === current); });
    }, { rootMargin: "-120px 0px -55% 0px" });
    Object.keys(links).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) io.observe(section);
    });
  }

  /* Contribution form ----------------------------------------------------- */

  function nextPool(date) {
    var q = Math.floor(date.getMonth() / 3) + 1;
    var distMonth = q * 3;
    var distYear = date.getFullYear();
    if (distMonth > 11) { distMonth = 0; distYear += 1; }
    return { label: "Q" + q + " " + date.getFullYear(), date: new Date(distYear, distMonth, 15) };
  }

  var form = document.querySelector("[data-give-form]");
  if (form) {
    var amountInputs = form.querySelectorAll("input[name='amount']");
    var otherWrap = form.querySelector("[data-other-amount]");
    var otherInput = form.querySelector("#other-amount");
    var freqInputs = form.querySelectorAll("input[name='frequency']");
    var dedicate = form.querySelector("#dedicate");
    var dedication = form.querySelector("[data-dedication]");
    var summary = document.querySelector("[data-summary]");
    var summaryTotal = summary.querySelector("[data-summary-total]");
    var summaryFreq = summary.querySelector("[data-summary-freq]");
    var summaryList = summary.querySelector("[data-summary-list]");
    var summaryPool = summary.querySelector("[data-summary-pool]");
    var confirmation = document.querySelector("[data-confirmation]");

    var freqText = {
      once: "One-time contribution",
      monthly: "Every month",
      quarterly: "Every quarter",
      annually: "Every year"
    };
    var freqPhrase = {
      once: "one-time",
      monthly: "monthly",
      quarterly: "quarterly",
      annually: "annual"
    };

    D.sleeves.forEach(function (s) {
      var li = el("li");
      li.setAttribute("data-sleeve", s.id);
      li.appendChild(swatch(s.color));
      li.appendChild(el("span", null, s.name));
      var strong = el("strong");
      strong.setAttribute("data-sleeve-amount", s.id);
      li.appendChild(strong);
      summaryList.appendChild(li);
    });

    var pool = nextPool(new Date());
    summaryPool.textContent = "Joins the " + pool.label + " pool, distributed to all " + D.holdings.length +
      " organizations on " + longDate(pool.date) + ".";

    // Pre-fill from ?amount= (the home page calculator links here).
    var preset = parseAmount(new URLSearchParams(window.location.search).get("amount") || "");
    if (preset) {
      var match = Array.prototype.find.call(amountInputs, function (i) { return parseAmount(i.value) === preset; });
      if (match) match.checked = true;
      else {
        form.querySelector("input[name='amount'][value='other']").checked = true;
        otherInput.value = int.format(preset);
      }
    }

    function selectedAmount() {
      var checked = form.querySelector("input[name='amount']:checked");
      if (!checked) return 0;
      return checked.value === "other" ? parseAmount(otherInput.value) : parseAmount(checked.value);
    }

    function selectedFreq() {
      var checked = form.querySelector("input[name='frequency']:checked");
      return checked ? checked.value : "once";
    }

    function updateSummary() {
      var isOther = form.querySelector("input[name='amount'][value='other']").checked;
      otherWrap.hidden = !isOther;
      var amount = selectedAmount();
      var cents = hasCents(amount) || amount < 100;
      summaryTotal.textContent = money(amount, hasCents(amount));
      summaryFreq.textContent = freqText[selectedFreq()];
      D.sleeves.forEach(function (s) {
        summaryList.querySelector("[data-sleeve-amount='" + s.id + "']").textContent = money(amount * s.weight / 100, cents);
      });
    }

    amountInputs.forEach(function (i) {
      i.addEventListener("change", function () {
        updateSummary();
        if (i.value === "other") otherInput.focus();
      });
    });
    otherInput.addEventListener("input", updateSummary);
    freqInputs.forEach(function (i) { i.addEventListener("change", updateSummary); });
    dedicate.addEventListener("change", function () { dedication.hidden = !dedicate.checked; });

    function setError(field, message) {
      var wrap = field.closest(".field");
      wrap.classList.toggle("has-error", !!message);
      field.setAttribute("aria-invalid", message ? "true" : "false");
      var err = wrap.querySelector(".field-error");
      if (err) err.textContent = message || "";
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstError = null;
      var amount = selectedAmount();
      var min = D.facts.minimumContribution;

      var amountError = form.querySelector("[data-amount-error]");
      if (amount < min) {
        amountError.textContent = "Please enter an amount of at least " + money(min) + ".";
        amountError.hidden = false;
        firstError = firstError || (otherWrap.hidden ? amountInputs[0] : otherInput);
      } else {
        amountError.hidden = true;
      }

      ["first-name", "last-name"].forEach(function (id) {
        var f = form.querySelector("#" + id);
        var bad = !f.value.trim();
        setError(f, bad ? "This field is required." : "");
        if (bad) firstError = firstError || f;
      });

      var email = form.querySelector("#email");
      var emailBad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      setError(email, emailBad ? "Please enter a valid email address." : "");
      if (emailBad) firstError = firstError || email;

      if (firstError) { firstError.focus(); return; }

      var first = form.querySelector("#first-name").value.trim();
      confirmation.querySelector("[data-confirm-name]").textContent = first;
      confirmation.querySelector("[data-confirm-amount]").textContent = money(amount, hasCents(amount));
      confirmation.querySelector("[data-confirm-freq]").textContent = freqPhrase[selectedFreq()];
      confirmation.querySelector("[data-confirm-email]").textContent = email.value.trim();
      form.hidden = true;
      confirmation.hidden = false;
      confirmation.focus();
      window.scrollTo({ top: confirmation.getBoundingClientRect().top + window.scrollY - 120 });
    });

    confirmation.querySelector("[data-edit]").addEventListener("click", function () {
      confirmation.hidden = true;
      form.hidden = false;
      form.querySelector("input[name='amount']:checked").focus();
    });

    updateSummary();
  }

  /* Newsletter sign-up ----------------------------------------------------- */

  document.querySelectorAll("[data-signup]").forEach(function (f) {
    var status = f.querySelector(".signup-status");
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = f.querySelector("input[type='email']");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
        status.textContent = "Please enter a valid email address.";
        input.focus();
        return;
      }
      status.textContent = "Thank you. The next quarterly report will arrive in your inbox.";
      input.value = "";
    });
  });
})();
