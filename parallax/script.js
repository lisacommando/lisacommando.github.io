(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // How quickly the animated values catch up to the scroll position (1 = instant)
  const EASE = reduceMotion ? 1 : 0.09;

  const section = document.querySelector(".camps");
  const track = document.querySelector(".camps__track");
  const cards = [...document.querySelectorAll(".camp")];
  const images = cards.map((c) => c.querySelector(".camp__media img"));
  const countEl = document.querySelector(".js-count");
  const barEl = document.querySelector(".js-bar");
  const speedEls = [...document.querySelectorAll("[data-speed]")];

  let vw = window.innerWidth;
  let vh = window.innerHeight;
  let travel = 0;      // how far the track must move horizontally (px)
  let sectionTop = 0;  // document offset of the camps section
  let targetX = 0;
  let currentX = 0;
  let running = false;

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  // Size the section so its vertical scroll length equals the horizontal travel.
  function measure() {
    vw = window.innerWidth;
    vh = window.innerHeight;
    travel = Math.max(0, track.scrollWidth - vw);
    section.style.height = `${travel + vh}px`;
    sectionTop = section.getBoundingClientRect().top + window.scrollY;
    update(true);
  }

  // Map vertical scroll position inside the section to a horizontal target.
  function update(snap = false) {
    const progress = travel ? clamp((window.scrollY - sectionTop) / travel, 0, 1) : 0;
    targetX = -progress * travel;
    if (snap) currentX = targetX;
    start();
  }

  function render() {
    currentX += (targetX - currentX) * EASE;
    if (Math.abs(targetX - currentX) < 0.1) currentX = targetX;

    track.style.transform = `translate3d(${currentX}px, 0, 0)`;

    const progress = travel ? -currentX / travel : 0;
    barEl.style.transform = `scaleX(${progress})`;

    // Per-card effects: image drifts against the card's movement, text reveals on entry.
    let active = 0;
    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const center = rect.left + rect.width / 2;

      if (!reduceMotion) {
        const rel = clamp((center - vw / 2) / vw, -1, 1);
        images[i].style.transform = `translate3d(${-rel * rect.width * 0.12}px, 0, 0)`;
      }
      if (rect.left < vw * 0.85) card.classList.add("is-visible");
      if (center < vw * 0.75) active = i;
    });
    countEl.textContent = String(active + 1).padStart(2, "0");

    // Vertical parallax for hero / breaker layers.
    if (!reduceMotion) {
      speedEls.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const offset = (r.top + r.height / 2 - vh / 2) * -parseFloat(el.dataset.speed);
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
    }

    if (currentX !== targetX) {
      requestAnimationFrame(render);
    } else {
      running = false;
    }
  }

  function start() {
    if (running) return;
    running = true;
    requestAnimationFrame(render);
  }

  window.addEventListener("scroll", () => update(), { passive: true });
  window.addEventListener("resize", measure);
  // Re-measure once images/fonts settle, since they change the track width.
  window.addEventListener("load", measure);
  if (document.fonts) document.fonts.ready.then(measure);

  measure();

  // ---------- Hero: muted, looping YouTube background video ----------
  const videoBg = document.querySelector("[data-youtube]");
  if (videoBg && !reduceMotion) {
    const videoId = videoBg.dataset.youtube;

    window.onYouTubeIframeAPIReady = () => {
      new YT.Player("hero-video", {
        videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          loop: 1,
          playlist: videoId, // required for loop to work on a single video
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          disablekb: 1,
          iv_load_policy: 3,
        },
        events: {
          onReady: (e) => {
            e.target.mute();
            e.target.playVideo();
          },
          // Fade the video in only once it is actually playing, so the poster
          // covers YouTube's loading screen.
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.PLAYING) videoBg.classList.add("is-playing");
          },
        },
      });
    };

    const api = document.createElement("script");
    api.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(api);
  }

  // ---------- Our Trips: expand the hovered / tapped / focused panel ----------
  const trips = [...document.querySelectorAll(".trip")];
  const canHover = window.matchMedia("(hover: hover)").matches;

  function openTrip(trip) {
    if (trip.classList.contains("is-active")) return;
    trips.forEach((t) => t.classList.toggle("is-active", t === trip));
  }

  trips.forEach((trip) => {
    if (canHover) trip.addEventListener("mouseenter", () => openTrip(trip));
    trip.addEventListener("click", () => openTrip(trip));
    trip.addEventListener("focus", () => openTrip(trip));
  });
})();
