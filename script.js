(function () {
  /* ===== PRELOADER ===== */
  const preloader = document.getElementById("preloader");
  window.addEventListener("load", () => {
    setTimeout(() => preloader.classList.add("hidden"), 600);
  });

  /* ===== HIDE PRELOADER fallback ===== */
  setTimeout(() => preloader.classList.add("hidden"), 3500);

  //

  /* ===== CUSTOM CURSOR ===== */
  const cursor = document.getElementById("cursor");
  const cursorDot = document.getElementById("cursorDot");

  if (window.matchMedia("(pointer: fine)").matches) {
    let mx = 0, my = 0, cx = 0, cy = 0;

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursorDot.style.left = mx + "px";
      cursorDot.style.top = my + "px";
    });

    (function animateCursor() {
      cx += (mx - cx) * 0.16;
      cy += (my - cy) * 0.16;
      cursor.style.left = cx + "px";
      cursor.style.top = cy + "px";
      requestAnimationFrame(animateCursor);
    })();

    document.querySelectorAll("a, button, .skill-card, .contact-card, .project-card").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
    });
  }

  /* ===== NAVBAR ===== */
  const navbar = document.getElementById("navbar");
  const toTop = document.getElementById("toTop");
  const scrollProgress = document.getElementById("scrollProgress");

  const onScroll = () => {
    const y = window.scrollY;
    navbar.classList.toggle("scrolled", y > 40);
    toTop.classList.toggle("show", y > 500);
    const h = document.documentElement;
    const pct = (y / (h.scrollHeight - h.clientHeight)) * 100;
    scrollProgress.style.width = pct + "%";
    spy();
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ===== MOBILE MENU ===== */
  const burger = document.getElementById("burger");
  const navLinks = document.getElementById("navLinks");

  burger.addEventListener("click", () => {
    burger.classList.toggle("open");
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      burger.classList.remove("open");
      navLinks.classList.remove("open");
    })
  );

  document.getElementById("hireBtn").addEventListener("click", () => {
    window.location.hash = "#contact";
  });

  /* ===== ACTIVE NAV SPY ===== */
  const sections = document.querySelectorAll("section[id]");
  const anchors = navLinks.querySelectorAll("a");

  function spy() {
    const pos = window.scrollY + 160;
    let current = "home";
    sections.forEach((s) => {
      if (pos >= s.offsetTop) current = s.id;
    });
    anchors.forEach((a) =>
      a.classList.toggle("active", a.getAttribute("href") === "#" + current)
    );
  }

  /* ===== TYPED EFFECT ===== */
  const roles = [
    "Full-Stack Developer",
    "Java Dasturchi",
    "Frontend va Backend",
    "Kelajak dasturchisi",
  ];

  const typedEl = document.getElementById("typed");
  let r = 0, c = 0, deleting = false;

  function type() {
    const word = roles[r];
    if (!deleting) {
      typedEl.textContent = word.slice(0, ++c);
      if (c === word.length) {
        deleting = true;
        setTimeout(type, 2100);
        return;
      }
      setTimeout(type, 85);
    } else {
      typedEl.textContent = word.slice(0, --c);
      if (c === 0) {
        deleting = false;
        r = (r + 1) % roles.length;
      }
      setTimeout(type, 45);
    }
  }
  type();

  /* ===== COUNTERS ===== */
  const counters = document.querySelectorAll(".counter");

  function animateCounter(el) {
    const target = +el.dataset.target;
    const suffix = el.dataset.suffix || "";
    const duration = 1600;
    const start = performance.now();

    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const counterIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterIO.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((c) => counterIO.observe(c));

  /* ===== REVEAL ===== */
  const revealIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealIO.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll("[data-reveal]").forEach((el) => {
    const items = el.children.length;
    el.style.setProperty("--delay", Math.min(items * 0.05, 0.3) + "s");
    revealIO.observe(el);
  });

  /* ===== SKILL BARS ===== */
  const bars = document.querySelectorAll(".skill-bar span[data-width]");
  const barIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.width = entry.target.dataset.width + "%";
          barIO.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  bars.forEach((b) => barIO.observe(b));

  /* ===== REVEAL fallback: agar IntersectionObserver bo'lmasa darhol ko'rsat ===== */
  if (typeof IntersectionObserver === "undefined") {
    document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("visible"));
  }

  /* Xavfsizlik tarmog'i: 2.5 sekunddan keyin hamma narsani ko'rsat */
  setTimeout(() => {
    document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("visible"));
  }, 2500);

/* ===== 3D TILT ===== */
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(900px) rotateY(0) rotateX(0)";
    });
  });

  /* ===== FOOTER YEAR ===== */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

/* ================= THREE.JS HERO SCENE (asinxron yuklanadi) ================= */
function initHeroThree() {
  const canvas = document.getElementById("three-canvas");
  const THREE_ = window.THREE;
  if (!canvas || !THREE_) return;
  try {
  const scene = new THREE_.Scene();
  const camera = new THREE_.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 9;

  const renderer = new THREE_.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const group = new THREE_.Group();
  scene.add(group);

  const shapes = [];

  function addShape(geo, color, x, y, z, speed) {
    const mat = new THREE_.MeshBasicMaterial({
      color,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    const mesh = new THREE_.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    group.add(mesh);
    shapes.push({ mesh, speed, rotX: Math.random() * 2, rotY: Math.random() * 2 });
  }

  addShape(new THREE_.IcosahedronGeometry(1.4, 1), 0x4f7cff, -4.5, 1.6, -1, 0.004);
  addShape(new THREE_.TorusGeometry(1.1, 0.34, 12, 40), 0x22d3ee, 4.6, 1.0, -2, 0.006);
  addShape(new THREE_.OctahedronGeometry(1.0, 0), 0xa855f7, 4.2, -1.8, -1, 0.008);
  addShape(new THREE_.TorusKnotGeometry(0.8, 0.26, 64, 12), 0x4f7cff, -4.3, -1.4, -2, 0.005);
  addShape(new THREE_.DodecahedronGeometry(0.85, 0), 0x22d3ee, 0.2, 2.6, -3, 0.007);

  /* Particles field */
  const count = 1400;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const palette = [0x4f7cff, 0x22d3ee, 0xa855f7, 0xffffff];

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 22;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 13;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

    const col = new THREE_.Color(palette[Math.floor(Math.random() * palette.length)]);
    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  const pGeo = new THREE_.BufferGeometry();
  pGeo.setAttribute("position", new THREE_.BufferAttribute(positions, 3));
  pGeo.setAttribute("color", new THREE_.BufferAttribute(colors, 3));

  const pMat = new THREE_.PointsMaterial({
    size: 0.045,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
  });

  const points = new THREE_.Points(pGeo, pMat);
  scene.add(points);

  const mouse = { x: 0, y: 0 };

  window.addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  let clock = new THREE_.Clock();
  let tick = 0;

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    tick += 0.0025;

    /* Floating motion */
    shapes.forEach((s, i) => {
      s.mesh.rotation.x += s.rotX * s.speed;
      s.mesh.rotation.y += s.rotY * s.speed;
      s.mesh.position.y += Math.sin(t * 0.8 + i * 1.7) * 0.0022;
    });

    points.rotation.y = tick * 0.35;
    points.rotation.x = Math.sin(tick * 0.2) * 0.08;

    /* Mouse parallax */
    group.rotation.y += (mouse.x * 0.18 - group.rotation.y) * 0.035;
    group.rotation.x += (mouse.y * 0.18 - group.rotation.x) * 0.035;

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  } catch (e) {}
}

/* Three.js ni asinxron yuklash — sahifani hech qachon bloklamaydi */
function loadHeroThree() {
  if (window.THREE) {
    initHeroThree();
    return;
  }
  const s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/npm/three@0.159.0/build/three.min.js";
  s.onload = () => initHeroThree();
  document.body.appendChild(s);
}
setTimeout(loadHeroThree, 300);