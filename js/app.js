/* ==========================================================================
   MARA VOSS — PORTFOLIO runtime
   Vanilla JS. No dependencies. Reads CONFIG / PROJECTS from js/data.js.
   ========================================================================== */
(function () {
  "use strict";

  /* ----------------------------- utilities ------------------------------ */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function store(key, value) {
    try {
      if (value === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, value);
    } catch (e) { return null; }
  }

  function pad(n, len) {
    n = String(n);
    while (n.length < (len || 2)) n = "0" + n;
    return n;
  }

  function timecode(seconds, fps) {
    fps = fps || 24;
    if (!isFinite(seconds) || seconds < 0) seconds = 0;
    var f = Math.floor((seconds % 1) * fps);
    var s = Math.floor(seconds) % 60;
    var m = Math.floor(seconds / 60) % 60;
    var h = Math.floor(seconds / 3600);
    return pad(h) + ":" + pad(m) + ":" + pad(s) + ":" + pad(f);
  }

  function toast(message) {
    var el = $("#toast");
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    requestAnimationFrame(function () { el.classList.add("is-on"); });
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      el.classList.remove("is-on");
      setTimeout(function () { el.hidden = true; }, 260);
    }, 2200);
  }

  /* --------------------------- config binding --------------------------- */
  function getPath(obj, path) {
    return path.split(".").reduce(function (acc, key) {
      return acc == null ? acc : acc[key];
    }, obj);
  }

  function bindConfig() {
    $$("[data-bind]").forEach(function (el) {
      var val = getPath(CONFIG, el.getAttribute("data-bind"));
      if (val != null) el.textContent = val;
    });

    $$("[data-bind-mailto], [data-bind-mailto-text]").forEach(function (el) {
      el.setAttribute("href", "mailto:" + CONFIG.email);
      if (el.hasAttribute("data-bind-mailto-text")) el.textContent = CONFIG.email;
      else {
        var span = el.querySelector("span");
        if (span) span.textContent = CONFIG.email;
      }
    });

    [["data-bind-src", "src"], ["data-bind-alt", "alt"], ["data-bind-aria", "aria-label"]].forEach(function (pair) {
      $$("[" + pair[0] + "]").forEach(function (el) {
        var val = getPath(CONFIG, el.getAttribute(pair[0]));
        if (val != null) el.setAttribute(pair[1], val);
      });
    });

    wireFallbacks(document);

    var cv = $("[data-cv]");
    if (cv) cv.setAttribute("href", CONFIG.cv);

    var year = $("[data-year]");
    if (year) year.textContent = String(new Date().getFullYear());

    var socials = $("#social-list");
    if (socials) {
      socials.innerHTML = CONFIG.socials.map(function (s) {
        return '<li><a href="' + s.url + '" target="_blank" rel="noopener noreferrer">' +
          "<span>" + s.label + "</span><span>↗</span></a></li>";
      }).join("");
    }
  }

  /* A still can be missing (you export it later) — swap to the .svg once. */
  function wireFallbacks(root) {
    $$("[data-fallback]", root).forEach(function (img) {
      if (img.dataset.fbBound) return;
      img.dataset.fbBound = "1";
      function swap() {
        if (img.dataset.fbDone) return;
        img.dataset.fbDone = "1";
        img.src = img.getAttribute("data-fallback");
      }
      img.addEventListener("error", swap);
      if (img.complete && img.naturalWidth === 0) swap();
    });
  }

  /* --------------------------- video handling --------------------------- */
  function parseVideo(url) {
    if (!url) return null;
    var m;

    // YouTube
    m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
    if (m) return { type: "embed", src: "https://www.youtube.com/embed/" + m[1] + "?autoplay=1&rel=0&modestbranding=1" };

    // Vimeo
    m = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    if (m) return { type: "embed", src: "https://player.vimeo.com/video/" + m[1] + "?autoplay=1&title=0&byline=0" };

    // direct file
    if (/\.(mp4|webm|ogv|mov)(\?.*)?$/i.test(url)) return { type: "file", src: url };

    return { type: "embed", src: url };
  }

  function mountVideo(root, url, opts) {
    opts = opts || {};
    var parsed = parseVideo(url);
    if (!root || !parsed) return;

    root.classList.add("is-playing");

    if (parsed.type === "embed") {
      var frame = document.createElement("iframe");
      frame.src = parsed.src;
      frame.title = opts.title || "Video player";
      frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      frame.allowFullscreen = true;
      frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      root.appendChild(frame);
    } else {
      var video = document.createElement("video");
      video.src = parsed.src;
      video.playsInline = true;
      video.preload = "metadata";
      video.controls = false;
      video.setAttribute("controlsList", "nofullscreen");
      root.appendChild(video);
      buildCustomControls(root, video);
      video.play().catch(function () { /* autoplay blocked — controls remain */ });
    }
  }

  /* minimal custom transport for HTML5 sources */
  function buildCustomControls(root, video) {
    var bar = document.createElement("div");
    bar.className = "transport";
    bar.innerHTML =
      '<button type="button" class="transport__btn" data-t="play" aria-label="Play or pause">▶</button>' +
      '<span class="transport__time" data-t="time">00:00</span>' +
      '<span class="transport__track" data-t="track"><span class="transport__fill" data-t="fill"></span></span>' +
      '<button type="button" class="transport__btn" data-t="mute" aria-label="Mute or unmute">VOL</button>' +
      '<button type="button" class="transport__btn" data-t="fs" aria-label="Fullscreen">⛶</button>';
    root.appendChild(bar);

    var playBtn = bar.querySelector('[data-t="play"]');
    var timeEl = bar.querySelector('[data-t="time"]');
    var track = bar.querySelector('[data-t="track"]');
    var fill = bar.querySelector('[data-t="fill"]');
    var muteBtn = bar.querySelector('[data-t="mute"]');
    var fsBtn = bar.querySelector('[data-t="fs"]');

    function fmt(s) {
      if (!isFinite(s)) return "00:00";
      return pad(Math.floor(s / 60)) + ":" + pad(Math.floor(s % 60));
    }

    playBtn.addEventListener("click", function () {
      if (video.paused) video.play(); else video.pause();
    });
    video.addEventListener("play", function () { playBtn.textContent = "❚❚"; });
    video.addEventListener("pause", function () { playBtn.textContent = "▶"; });

    video.addEventListener("timeupdate", function () {
      timeEl.textContent = fmt(video.currentTime) + " / " + fmt(video.duration || 0);
      var pct = video.duration ? (video.currentTime / video.duration) * 100 : 0;
      fill.style.width = pct + "%";
    });

    function seek(clientX) {
      var rect = track.getBoundingClientRect();
      var ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      if (video.duration) video.currentTime = ratio * video.duration;
    }
    track.addEventListener("pointerdown", function (e) {
      seek(e.clientX);
      var move = function (ev) { seek(ev.clientX); };
      var up = function () {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    });

    muteBtn.addEventListener("click", function () {
      video.muted = !video.muted;
      muteBtn.textContent = video.muted ? "MUTE" : "VOL";
    });

    fsBtn.addEventListener("click", function () {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (root.requestFullscreen) root.requestFullscreen();
    });
  }

  /* ------------------------------ rendering ----------------------------- */
  var activeFilter = "all";

  function filtered() {
    if (activeFilter === "all") return PROJECTS.slice();
    return PROJECTS.filter(function (p) { return p.category === activeFilter; });
  }

  function renderFilters() {
    var host = $("#filters");
    if (!host) return;
    var cats = [];
    PROJECTS.forEach(function (p) { if (cats.indexOf(p.category) === -1) cats.push(p.category); });
    var all = [{ label: "All", value: "all" }].concat(cats.map(function (c) {
      return { label: c, value: c };
    }));

    host.innerHTML = all.map(function (c) {
      var on = c.value === activeFilter;
      return '<button type="button" class="filter-btn' + (on ? " is-active" : "") +
        '" data-filter="' + c.value + '" aria-pressed="' + on + '">' + c.label + "</button>";
    }).join("");
  }

  function renderGrid(list) {
    var host = $("#grid-view");
    if (!host) return;
    host.innerHTML = list.map(function (p, i) {
      var idx = PROJECTS.indexOf(p) + 1;
      var thumb = p.thumbnail || "";
      var fb = thumb.replace(/\.(jpe?g|png|webp)$/i, ".svg");
      var fbAttr = fb !== thumb ? ' data-fallback="' + fb + '"' : "";
      return '' +
        '<li class="card reveal">' +
          '<a class="card__link" href="#" data-open="' + p.id + '" data-cursor="play" aria-label="Open ' + p.title + '">' +
            '<div class="card__still' + (p.letterbox ? " card__still--portrait" : "") + '">' +
              '<span class="card__num">' + pad(idx) + "</span>" +
              '<span class="card__tc" data-card-tc>00:00:00:00</span>' +
              '<img class="card__img" src="' + thumb + '"' + fbAttr + ' alt="Still from ' + p.title + '" width="1600" height="900" loading="lazy" decoding="async">' +
              '<span class="card__badge" aria-hidden="true">▶</span>' +
              '<span class="card__overlay">' +
                '<span class="card__overlay-title">' + p.title + "</span>" +
                '<span class="card__overlay-meta">' +
                  "<span><b>Client</b> " + p.client + "</span>" +
                  "<span><b>Role</b> " + p.role + "</span>" +
                  "<span><b>Run</b> " + p.runtime + "</span>" +
                  "<span><b>" + p.fps + "</b></span>" +
                "</span>" +
              "</span>" +
            "</div>" +
            '<span class="card__rail">' +
              '<span class="card__rail-title">' + p.category + "</span>" +
              '<span class="card__rail-year">' + p.year + " · " + p.runtime + "</span>" +
            "</span>" +
          "</a>" +
        "</li>";
    }).join("");
    wireFallbacks(host);
  }

  function renderIndex(list) {
    var host = $("#index-body");
    if (!host) return;
    host.innerHTML = list.map(function (p) {
      var idx = PROJECTS.indexOf(p) + 1;
      return '' +
        '<tr class="index-row reveal" data-open="' + p.id + '" data-cursor="play">' +
          '<td class="cell-num">' + pad(idx) + "</td>" +
          '<td class="cell-title">' +
            '<a class="row-link" href="#" data-open="' + p.id + '">' + p.title + "</a>" +
            '<span class="row-open" aria-hidden="true">Open →</span>' +
          "</td>" +
          '<td class="cell-client">' + p.client + "<em>" + p.category + "</em></td>" +
          '<td class="cell-role">' + p.role + "</td>" +
          '<td class="cell-year">' + p.year + "</td>" +
          '<td class="cell-runtime">' + p.runtime + "</td>" +
          '<td class="cell-link"><span aria-hidden="true">↗</span></td>' +
        "</tr>";
    }).join("");
  }

  /* Blank cells finish an incomplete grid row, so 1-of-6 filters read as
     deliberate contact-sheet frames instead of missing tiles. */
  function syncFillers() {
    var grid = $("#grid-view");
    if (!grid) return;
    $$(".grid__end", grid).forEach(function (n) { n.parentNode.removeChild(n); });
    if (grid.hidden) return;

    var tpl = getComputedStyle(grid).gridTemplateColumns;
    var cols = tpl && tpl !== "none" ? tpl.split(" ").filter(Boolean).length : 1;
    if (cols < 2) return;

    var count = $$(".card", grid).length;
    var missing = (cols - (count % cols)) % cols;
    if (!missing) return;

    var html = "";
    for (var i = 0; i < missing; i++) {
      html += '<li class="grid__end" aria-hidden="true">' +
        '<span class="grid__end-label">End of index</span>' +
        '<span class="grid__end-count">' + pad(count) + " / " + pad(PROJECTS.length) + "</span>" +
        "</li>";
    }
    grid.insertAdjacentHTML("beforeend", html);
  }

  function renderArchive() {
    var list = filtered();
    renderGrid(list);
    syncFillers();
    renderIndex(list);

    $$("[data-count]").forEach(function (el) { el.textContent = PROJECTS.length; });
    var vis = $("[data-visible-count]");
    if (vis) vis.textContent = list.length;

    var empty = $("#archive-empty");
    if (empty) empty.hidden = list.length > 0;

    observeReveals();
    attachCounters();
  }

  /* ----------------------------- view toggle ---------------------------- */
  function setView(mode) {
    var grid = $("#grid-view");
    var table = $("#index-view");
    if (!grid || !table) return;

    var isGrid = mode !== "index";
    grid.hidden = !isGrid;
    table.hidden = isGrid;

    $$(".view-toggle__btn").forEach(function (b) {
      var on = b.getAttribute("data-view") === (isGrid ? "grid" : "index");
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", String(on));
    });

    store("portfolio.view", isGrid ? "grid" : "index");
    syncFillers();
    observeReveals();
    attachCounters();
  }

  /* ------------------------------ modal --------------------------------- */
  var modal = $("#project-modal");
  var modalIndex = 0;
  var lastFocus = null;

  function fillModal(project) {
    modalIndex = PROJECTS.indexOf(project);
    var idx = pad(modalIndex + 1);

    $("#modal-num").textContent = idx;
    $("#modal-total").textContent = pad(PROJECTS.length);
    $("#modal-cat").textContent = project.category;
    $("#modal-title").textContent = project.title;

    var meta = [
      ["Client", project.client],
      ["Category", project.category],
      ["Role", project.role],
      ["Year", project.year],
      ["Runtime", project.runtime],
      ["Resolution", project.resolution],
      ["Frame rate", project.fps],
      ["Codec", project.codec],
      ["Audio", project.audio]
    ];
    $("#modal-meta").innerHTML = meta.map(function (row) {
      return "<div><dt>" + row[0] + "</dt><dd>" + row[1] + "</dd></div>";
    }).join("");

    var hook = $("#modal-hook");
    hook.textContent = project.hook || "";
    hook.parentNode.hidden = !project.hook;

    var pacing = $("#modal-pacing");
    pacing.textContent = project.pacing || "";
    pacing.parentNode.hidden = !project.pacing;

    var tools = project.software || [];
    var swEl = $("#modal-software");
    swEl.innerHTML = tools.map(function (s) { return "<li>" + s + "</li>"; }).join("");
    swEl.parentNode.hidden = tools.length === 0;

    var breakdown = $(".modal__breakdown");
    if (breakdown) breakdown.hidden = !$(".breakdown__block:not([hidden])", breakdown);

    var player = $("#modal-player");
    player.innerHTML = "";
    player.classList.remove("is-playing");
    mountVideo(player, project.videoUrl, { title: project.title });
  }

  function openModal(id) {
    var project = PROJECTS.filter(function (p) { return p.id === id; })[0];
    if (!project) return;

    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    fillModal(project);

    var closeBtn = $(".modal__btn--close", modal);
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    var player = $("#modal-player");
    if (player) { player.innerHTML = ""; player.classList.remove("is-playing"); }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function stepModal(dir) {
    if (!PROJECTS.length) return;
    var next = (modalIndex + dir + PROJECTS.length) % PROJECTS.length;
    fillModal(PROJECTS[next]);
    var scroll = $(".modal__scroll", modal);
    if (scroll) scroll.scrollTop = 0;
  }

  function trapFocus(e) {
    if (!modal || modal.hidden || e.key !== "Tab") return;
    var focusables = $$('a[href], button:not([disabled]), video, iframe, [tabindex]:not([tabindex="-1"])', modal)
      .filter(function (el) { return el.offsetParent !== null || el.tagName === "IFRAME"; });
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* --------------------------- frame counters --------------------------- */
  function attachCounters() {
    if (reduceMotion) return;

    $$(".card").forEach(function (card) {
      if (card.dataset.tcBound) return;   // renderArchive() + setView() both call us
      card.dataset.tcBound = "1";

      var out = $("[data-card-tc]", card);
      if (!out) return;
      var raf = 0;
      var start = 0;

      function tick(ts) {
        if (!start) start = ts;
        var frames = Math.floor(((ts - start) / 1000) * 24);
        var secs = Math.floor(frames / 24);
        out.textContent = pad(Math.floor(secs / 3600)) + ":" +
          pad(Math.floor(secs / 60) % 60) + ":" + pad(secs % 60) + ":" + pad(frames % 24);
        raf = requestAnimationFrame(tick);
      }

      function startLoop() { if (!raf) { start = 0; raf = requestAnimationFrame(tick); } }
      function stopLoop() { cancelAnimationFrame(raf); raf = 0; out.textContent = "00:00:00:00"; }

      card.addEventListener("pointerenter", startLoop);
      card.addEventListener("pointerleave", stopLoop);
      card.addEventListener("focusin", startLoop);
      card.addEventListener("focusout", stopLoop);
    });
  }

  function reelTimecode() {
    var frame = $("#reel-frame");
    var out = $("[data-tc]");
    if (!frame || !out || reduceMotion) return;

    var raf = 0, start = 0;
    function tick(ts) {
      if (!start) start = ts;
      out.textContent = timecode((ts - start) / 1000, 24);
      raf = requestAnimationFrame(tick);
    }
    frame.addEventListener("pointerenter", function () {
      if (!raf) { start = 0; raf = requestAnimationFrame(tick); }
    });
    frame.addEventListener("pointerleave", function () {
      cancelAnimationFrame(raf); raf = 0; out.textContent = "00:00:00:00";
    });
  }

  /* ------------------------------ cursor -------------------------------- */
  function initCursor() {
    if (!finePointer || reduceMotion) return;
    var el = $(".cursor");
    if (!el) return;

    var ring = $(".cursor__ring", el);
    var label = $(".cursor__label", el);
    var tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    var cx = tx, cy = ty;
    var running = false;

    // re-evaluate what is under the pointer; the page can move underneath a
    // stationary cursor (scroll / smooth anchor jumps) without a pointermove.
    function evaluate() {
      var hit = document.elementFromPoint(tx, ty);
      var target = hit && hit.closest
        ? hit.closest('[data-cursor="play"], a, button, [role="button"]')
        : null;
      var isPlay = target && target.getAttribute("data-cursor") === "play";
      el.classList.toggle("is-play", !!isPlay);
      el.classList.toggle("is-link", !!target && !isPlay);
      label.textContent = isPlay ? "Play" : "";
    }

    var inside = true;
    function show() { el.classList.add("is-on"); }
    function hide() { el.classList.remove("is-on"); }

    window.addEventListener("pointermove", function (e) {
      tx = e.clientX; ty = e.clientY;
      inside = true;
      show();
      if (!running) {
        running = true;
        (function loop() {
          cx += (tx - cx) * 0.2;
          cy += (ty - cy) * 0.2;
          ring.style.transform = "translate3d(" + cx + "px," + cy + "px,0)";
          label.style.transform = "translate3d(" + cx + "px," + (cy + 24) + "px,0) translateX(-50%)";
          requestAnimationFrame(loop);
        })();
      }
      evaluate();
    }, { passive: true });

    var scrollPending = false;
    window.addEventListener("scroll", function () {
      if (scrollPending) return;
      scrollPending = true;
      requestAnimationFrame(function () { scrollPending = false; evaluate(); });
    }, { passive: true });

    document.addEventListener("pointerleave", function () { inside = false; hide(); });
    document.addEventListener("pointerenter", function () { inside = true; show(); });
    window.addEventListener("blur", hide);
    window.addEventListener("focus", function () { if (inside) show(); });
    window.addEventListener("resize", function () { if (inside) { show(); evaluate(); } });
  }

  /* ----------------------------- reveal --------------------------------- */
  var revealObserver = null;
  var pipelineObserver = null;

  function observeReveals() {
    if (reduceMotion) {
      $$(".reveal").forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    if (!("IntersectionObserver" in window)) {
      $$(".reveal").forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    }
    $$(".reveal:not(.is-in)").forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i * 45, 320) + "ms";
      revealObserver.observe(el);
    });
  }

  function observePipeline() {
    var pipe = $(".pipeline");
    if (!pipe) return;
    if (reduceMotion || !("IntersectionObserver" in window)) { pipe.classList.add("is-in"); return; }
    pipelineObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          pipelineObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    pipelineObserver.observe(pipe);
  }

  /* ------------------------------ clock --------------------------------- */
  function initClock() {
    var out = $("[data-clock]");
    if (!out) return;

    function offsetMinutes(tz) {
      var m = /UTC([+-])(\d{2}):?(\d{2})?/.exec(tz || "");
      if (!m) return -new Date().getTimezoneOffset();
      var sign = m[1] === "-" ? -1 : 1;
      return sign * (parseInt(m[2], 10) * 60 + parseInt(m[3] || "0", 10));
    }

    function tick() {
      var target = offsetMinutes(CONFIG.timezone);
      var now = new Date();
      var utc = now.getTime() + now.getTimezoneOffset() * 60000;
      var local = new Date(utc + target * 60000);
      out.textContent = pad(local.getHours()) + ":" + pad(local.getMinutes()) + ":" + pad(local.getSeconds());
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ------------------------------- nav ---------------------------------- */
  function initNav() {
    var toggle = $(".nav-toggle");
    var nav = $("#site-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      nav.classList.toggle("is-open", !open);
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      }
    });
  }

  /* ------------------------------ events -------------------------------- */
  function initEvents() {
    // view toggle
    $$(".view-toggle__btn").forEach(function (btn) {
      btn.addEventListener("click", function () { setView(btn.getAttribute("data-view")); });
    });

    // column count changes across breakpoints — re-fit the blank cells
    var resizeT;
    window.addEventListener("resize", function () {
      clearTimeout(resizeT);
      resizeT = setTimeout(syncFillers, 160);
    });

    // filters
    var filterHost = $("#filters");
    if (filterHost) {
      filterHost.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-filter]");
        if (!btn) return;
        activeFilter = btn.getAttribute("data-filter");
        store("portfolio.filter", activeFilter);
        renderFilters();
        renderArchive();
      });
    }

    // open project (grid link or index row)
    document.addEventListener("click", function (e) {
      var opener = e.target.closest("[data-open]");
      if (opener) {
        e.preventDefault();
        openModal(opener.getAttribute("data-open"));
        return;
      }
      if (e.target.closest("[data-close]")) closeModal();
    });

    document.addEventListener("keydown", function (e) {
      if (modal && !modal.hidden) {
        if (e.key === "Escape") { e.preventDefault(); closeModal(); }
        else if (e.key === "ArrowRight") stepModal(1);
        else if (e.key === "ArrowLeft") stepModal(-1);
        trapFocus(e);
      }
    });

    $$("[data-prev]").forEach(function (b) { b.addEventListener("click", function () { stepModal(-1); }); });
    $$("[data-next]").forEach(function (b) { b.addEventListener("click", function () { stepModal(1); }); });

    // showreel
    var playTrigger = $(".play-trigger");
    if (playTrigger) {
      playTrigger.addEventListener("click", function () {
        var root = $("#reel-frame");
        mountVideo(root, CONFIG.showreel.videoUrl, { title: CONFIG.showreel.title });
      });
    }

    // CV download feedback
    var cvBtn = $("[data-cv]");
    if (cvBtn) {
      cvBtn.addEventListener("click", function () {
        toast("Downloading CV — " + CONFIG.name);
      });
    }
  }

  /* ---------------------------- y2k layer -------------------------------- */
  function initY2k() {
    var maj = $(".y2k__maj");
    if (maj) {
      var mod = new Date(document.lastModified);
      if (!isNaN(mod.getTime())) {
        maj.textContent = pad(mod.getDate()) + "/" + pad(mod.getMonth() + 1) + "/" + mod.getFullYear();
      }
    }
  }

  function initShimmer() {
    if (reduceMotion) return;

    var host = $("#shimmer");
    if (!host) return;

    var glyphs = ["✦", "✧", "★", "✶", "✧"];
    var colors = ["--o", "--c", "--w"];
    var palette = ["#ff9900", "#00ccff", "#ffffff"];
    var count = 22;

    for (var i = 0; i < count; i++) {
      var s = document.createElement("span");
      s.className = "shimmer__s shimmer__s" + colors[i % colors.length];
      s.textContent = glyphs[i % glyphs.length];
      s.style.left = ((i * 47) % 100) + "%";
      s.style.top = ((i * 83 + 19) % 100) + "%";
      s.style.fontSize = (10 + (i % 5) * 3) + "px";
      s.style.animationDelay = ((i * 529) % 3200) / 1000 + "s";
      s.style.animationDuration = (2.6 + (i % 4) * 0.5) + "s";
      s.style.color = palette[i % palette.length];
      host.appendChild(s);
    }
  }

  function initSparkles() {
    if (reduceMotion || !finePointer) return;

    var glyphs = ["*", "+", "\u00B7"];
    var alive = 0;
    var last = 0;

    document.addEventListener("pointermove", function (e) {
      var now = Date.now();
      if (now - last < 60 || alive > 12) return;
      last = now;

      var s = document.createElement("span");
      s.className = "sparkle";
      s.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      s.style.left = Math.round(e.clientX + (Math.random() * 14 - 7)) + "px";
      s.style.top = Math.round(e.clientY + (Math.random() * 14 - 7)) + "px";
      document.body.appendChild(s);
      alive++;

      var done = false;
      var kill = function () {
        if (done) return;
        done = true;
        if (s.parentNode) s.parentNode.removeChild(s);
        alive--;
      };
      s.addEventListener("animationend", kill);
      setTimeout(kill, 750);
    });
  }

  /* ------------------------------- boot --------------------------------- */
  function boot() {
    bindConfig();
    initNav();
    initClock();
    initCursor();
    reelTimecode();
    initY2k();
    initSparkles();
    initShimmer();

    var savedView = store("portfolio.view");
    var savedFilter = store("portfolio.filter");
    if (savedFilter) {
      var known = savedFilter === "all" || PROJECTS.some(function (p) { return p.category === savedFilter; });
      if (known) activeFilter = savedFilter;
    }

    renderFilters();
    renderArchive();
    setView(savedView === "index" ? "index" : "grid");
    observePipeline();
    initEvents();
    observeReveals();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
