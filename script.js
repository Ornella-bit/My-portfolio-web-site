/* Everything runs once the page is ready. Four small features, each explained. */
(function () {
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = matchMedia("(hover:hover)").matches;

  /* 1. THE DANCING LINE: a canvas redrawn ~60 times per second. */
  var c = document.getElementById("sig"), x = c.getContext("2d");
  var W, H, dpr = Math.min(devicePixelRatio || 1, 2), mx = -999, tx = -999, my = 0, t = 0;
  function size() {
    var r = c.getBoundingClientRect(); W = r.width; H = r.height;
    c.width = W * dpr; c.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size(); addEventListener("resize", size);
  function pos(e) {
    var r = c.getBoundingClientRect(), p = e.touches ? e.touches[0] : e;
    mx = p.clientX - r.left; my = (p.clientY - r.top) / H - .5;
  }
  c.addEventListener("mousemove", pos);
  c.addEventListener("touchmove", pos, { passive: true });
  c.addEventListener("mouseleave", function () { mx = -999; });
  function draw() {
    if (!reduce) t += .02;
    tx += (mx - tx) * .12;                       /* the bump follows the pointer smoothly */
    x.clearRect(0, 0, W, H);
    var g = x.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, "#F0A594"); g.addColorStop(.5, "#9852A3"); g.addColorStop(1, "#F0A594");
    x.lineWidth = 4; x.lineJoin = "round"; x.strokeStyle = g;
    x.shadowColor = "rgba(152,82,163,.8)"; x.shadowBlur = 18;
    x.beginPath();
    var mid = H / 2, dotY = mid;
    for (var i = 0; i <= W; i += 3) {
      var y = mid + Math.sin(i * .011 + t) * 20 + Math.sin(i * .031 + t * 1.7) * 9;
      var d = (i - tx) / 90, bump = Math.exp(-d * d);   /* a bell curve around the pointer */
      y += bump * (-my * H * 1.2 + Math.sin(i * .12 + t * 6) * 28 * bump);
      i === 0 ? x.moveTo(i, y) : x.lineTo(i, y);
      if (Math.abs(i - tx) < 2) dotY = y;
    }
    x.stroke();
    if (tx > 0) { x.shadowBlur = 24; x.shadowColor = "#F0A594"; x.fillStyle = "#F0A594"; x.beginPath(); x.arc(tx, dotY, 9, 0, 7); x.fill(); }
    requestAnimationFrame(draw);
  }
  draw();

  /* 5. SCROLL EFFECTS */
  var bar = document.getElementById("bar"), mq = document.querySelector(".marquee");
  var lastY = scrollY, skew = 0;
  /* 5a. Split each heading into letters so they can rise one by one */
  if (!reduce) document.querySelectorAll("h2").forEach(function (h) {
    var k = 0, txt = h.textContent; h.setAttribute("aria-label", txt);
    h.innerHTML = txt.split(" ").map(function (w) {
      return '<span aria-hidden="true" style="display:inline-block;white-space:nowrap;overflow:hidden;padding-bottom:.12em">' +
        w.split("").map(function (ch) { return '<span class="ch" style="--k:' + (k++) + '">' + ch + "</span>"; }).join("") + "</span>";
    }).join(" ");
  });
  /* 5b. Reveal headings and cards when they enter the screen */
  var cards = document.querySelectorAll(".card");
  if (!reduce) cards.forEach(function (el, i) { el.classList.add("rv"); el.style.transitionDelay = (i % 3) * 120 + "ms"; });
  var io = new IntersectionObserver(function (list) {
    list.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add("in"); io.unobserve(en.target);
      if (en.target.classList.contains("rv")) setTimeout(function () {   /* hand control back to the tilt effect */
        en.target.classList.remove("rv", "in"); en.target.style.transitionDelay = "";
      }, 1600);
    });
  }, { threshold: .2 });
  document.querySelectorAll("h2, .card").forEach(function (el) { io.observe(el); });
  /* 5c. Menu highlights the section you are reading */
  var links = document.querySelectorAll(".pill a");
  var so = new IntersectionObserver(function (list) {
    list.forEach(function (en) {
      if (!en.isIntersecting) return;
      links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id); });
    });
  }, { rootMargin: "-45% 0px -45% 0px" });
  document.querySelectorAll("#work, #about, #contact").forEach(function (s) { so.observe(s); });
  /* 5d. Progress bar + the big words lean when you scroll fast */
  (function tick() {
    var max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = "scaleX(" + (max > 0 ? scrollY / max : 0) + ")";
    if (!reduce) {
      var v = scrollY - lastY; lastY = scrollY;
      skew += (Math.max(-10, Math.min(10, v * .35)) - skew) * .15;
      mq.style.transform = "skewX(" + -skew + "deg)";
    }
    requestAnimationFrame(tick);
  })();

  if (!fine) return;                              /* the rest is for mouse devices */

  /* 2. SOFT LIGHT that follows the mouse */
  var glow = document.getElementById("glow"), gx = 0, gy = 0, px = 0, py = 0;
  addEventListener("mousemove", function (e) { gx = e.clientX; gy = e.clientY; glow.style.opacity = 1; });
  (function loop() {
    px += (gx - px) * .1; py += (gy - py) * .1;
    glow.style.transform = "translate(" + px + "px," + py + "px)";
    requestAnimationFrame(loop);
  })();

  /* 6. CURSOR RING that grows on links and says what a click does */
  var cur = document.getElementById("cursor"), label = cur.firstChild, qx = 0, qy = 0, rx = 0, ry = 0;
  addEventListener("mousemove", function (e) { qx = e.clientX; qy = e.clientY; cur.style.opacity = 1;
    if (!reduce) { var b = document.body.style; b.setProperty("--px", e.clientX / innerWidth - .5); b.setProperty("--py", e.clientY / innerHeight - .5); } });
  (function loop2() { rx += (qx - rx) * .2; ry += (qy - ry) * .2; cur.style.transform = "translate(" + rx + "px," + ry + "px)"; requestAnimationFrame(loop2); })();
  document.querySelectorAll("a, button").forEach(function (el) {
    el.addEventListener("mouseenter", function () {
      if (el.dataset.cursor) { label.textContent = el.dataset.cursor; cur.classList.add("link"); } else cur.classList.add("sm");
    });
    el.addEventListener("mouseleave", function () { label.textContent = ""; cur.classList.remove("link", "sm"); });
  });

  if (reduce) return;

  /* 3. 3D TILT + spotlight on cards */
  document.querySelectorAll(".tilt").forEach(function (el) {
    el.addEventListener("mousemove", function (e) {
      var r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--mx", px * 100 + "%"); el.style.setProperty("--my", py * 100 + "%");
      el.style.transform = "perspective(900px) rotateX(" + (.5 - py) * 8 + "deg) rotateY(" + (px - .5) * 10 + "deg) translateY(-4px)";
    });
    el.addEventListener("mouseleave", function () { el.style.transform = ""; });
  });

  /* 4. MAGNETIC BUTTON */
  document.querySelectorAll(".mag").forEach(function (b) {
    b.addEventListener("mousemove", function (e) {
      var r = b.getBoundingClientRect();
      b.style.transform = "translate(" + (e.clientX - r.left - r.width / 2) * .3 + "px," + (e.clientY - r.top - r.height / 2) * .4 + "px)";
    });
    b.addEventListener("mouseleave", function () { b.style.transform = ""; });
  });
})();
