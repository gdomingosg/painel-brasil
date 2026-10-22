/* Runtime estático que substitui o ambiente do painel no claude.ai.
   Carrega os conjuntos de dados de ./data/<id>.json e oferece a mesma API
   usada pela página: dash.data, dash.onData, dash.calc, dash.loader,
   dash.colors, dash.params/setParams/resetParams, dash.setLink, dash.refresh. */
(function () {
  "use strict";
  var DATASETS = window.__DASH_DATASETS__ || [];
  var store = {};      // id -> {status, data, columns, message}
  var calcs = {};      // id -> {inputs, fn, title, description}
  var calcCache = {};  // id -> resultado
  var listeners = [];
  var params = {};
  var scheduled = false;

  DATASETS.forEach(function (d) { store[d.id] = { status: "loading", data: [], columns: [] }; });

  function columnsOf(data) {
    if (Array.isArray(data) && data.length && data[0] && typeof data[0] === "object" && !Array.isArray(data[0])) {
      var seen = {}, cols = [];
      data.forEach(function (r) { Object.keys(r).forEach(function (k) { if (!seen[k]) { seen[k] = 1; cols.push(k); } }); });
      return cols;
    }
    return [];
  }

  function result(status, data, message) {
    var cols = columnsOf(data);
    return {
      status: status, data: data, columns: cols, message: message || "",
      refreshing: false, meta: [],
      rows: Array.isArray(data) ? data : [],
      value: data
    };
  }

  function computeCalc(id) {
    if (Object.prototype.hasOwnProperty.call(calcCache, id)) return calcCache[id];
    var c = calcs[id];
    var ins = c.inputs.map(function (i) { return getData(i); });
    var bad = ins.filter(function (r) { return r.status !== "ok"; });
    if (bad.length) {
      var st = bad.some(function (r) { return r.status === "error" || r.status === "missing"; }) ? "error" : "loading";
      return result(st, [], st === "error" ? "Uma das fontes deste cálculo não carregou." : "");
    }
    var out;
    try {
      out = result("ok", c.fn.apply(null, ins.map(function (r) { return r.data; })));
    } catch (e) {
      console.error("Cálculo " + id + " falhou:", e);
      out = result("error", [], String(e && e.message || e));
    }
    calcCache[id] = out;
    return out;
  }

  function getData(id) {
    if (calcs[id]) return computeCalc(id);
    var s = store[id];
    if (!s) return result("missing", [], "Fonte não encontrada: " + id);
    return s;
  }

  function stampRoot() {
    var root = document.getElementById("dash-root");
    if (!root) return;
    var anyLoading = Object.keys(store).some(function (k) { return store[k].status === "loading"; });
    var anyError = Object.keys(store).some(function (k) { return store[k].status === "error"; });
    if (anyLoading) root.setAttribute("data-dash-state", "loading");
    else if (anyError) root.setAttribute("data-dash-state", "error");
    else root.removeAttribute("data-dash-state");
  }

  function runAll() {
    scheduled = false;
    stampRoot();
    listeners.forEach(function (fn) {
      try { fn(); } catch (e) { console.error(e); }
    });
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    (window.requestAnimationFrame || setTimeout)(runAll);
  }

  var lastWidth = 0;
  window.addEventListener("resize", function () {
    var w = window.innerWidth;
    if (w === lastWidth) return;
    lastWidth = w;
    clearTimeout(runAll._t);
    runAll._t = setTimeout(schedule, 150);
  });

  window.dash = {
    data: function (id) { return getData(id); },
    onData: function (fn) {
      listeners.push(fn);
      try { fn(); } catch (e) { console.error(e); }
    },
    calc: function (id, spec) {
      calcs[id] = { inputs: spec.inputs || [], fn: spec.fn, title: spec.title, description: spec.description };
      delete calcCache[id];
    },
    loader: function () { /* todas as fontes aqui são arquivos fixos */ },
    colors: ["#2C62C9", "#B5651D", "#1E7A6C", "#8E44AD", "#C62F37", "#5F7D1E", "#B0457B", "#4A6B8A"],
    params: function () { return Object.assign({}, params); },
    setParams: function (p) { Object.assign(params, p || {}); schedule(); },
    resetParams: function () { params = {}; schedule(); },
    setLink: function (name) {
      try { history.replaceState(null, "", "#" + encodeURIComponent(name)); } catch (e) { location.hash = name; }
    },
    refresh: function () { schedule(); }
  };

  // Carrega todos os conjuntos de dados em paralelo.
  DATASETS.forEach(function (d) {
    fetch("data/" + d.id + ".json", { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (j) {
        var rows = Array.isArray(j) ? j : (j && (j.rows || j.data || j.results)) || j;
        store[d.id] = result("ok", rows);
      })
      .catch(function (e) {
        console.error("Falha ao carregar " + d.id, e);
        store[d.id] = result("error", [], "Não foi possível carregar " + d.id);
      })
      .then(function () { calcCache = {}; schedule(); });
  });

  // Abre a aba indicada no endereço (ex.: .../#mapa) depois que a página montar.
  function openFromHash() {
    var h = decodeURIComponent((location.hash || "").slice(1));
    if (!h) return;
    var btn = document.querySelector('.tab[data-tab="' + h.replace(/"/g, "") + '"]');
    if (btn && btn.getAttribute("aria-selected") !== "true") btn.click();
  }
  window.addEventListener("load", openFromHash);
  window.addEventListener("hashchange", openFromHash);
})();
