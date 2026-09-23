document.querySelector(".announcement-bar__close")?.addEventListener("click", function () {
  this.closest(".announcement-bar")?.remove();
});

function initMainNavToggle() {
  const navigation = document.querySelector(".site-primary-navigation");
  const toggle = document.querySelector(".main-nav__toggle");
  const menu = document.getElementById("main-nav-menu");
  if (!navigation || !toggle || !menu) return;

  const mobileQuery = window.matchMedia("(max-width: 768px)");
  const backdrop = navigation.querySelector(".main-nav__backdrop");
  const closeButton = menu.querySelector(".main-nav__close");
  const toggleLabel = toggle.querySelector(".main-nav__toggle-label");
  const toggleIcon = toggle.querySelector(".main-nav__toggle-icon");

  function isMenuOpen() {
    return navigation.classList.contains("site-primary-navigation--open");
  }

  function setMenuOpen(open) {
    navigation.classList.toggle("site-primary-navigation--open", open);
    toggle.classList.toggle("main-nav__toggle--open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");

    if (mobileQuery.matches) {
      menu.setAttribute("aria-hidden", open ? "false" : "true");
      document.body.classList.toggle("main-nav-open", open);

      if (backdrop) {
        backdrop.hidden = !open;
      }
    } else {
      menu.removeAttribute("aria-hidden");
      document.body.classList.remove("main-nav-open");

      if (backdrop) {
        backdrop.hidden = true;
      }
    }

    if (toggleLabel) {
      toggleLabel.textContent = open ? "Close" : "Menu";
    }

    if (toggleIcon) {
      toggleIcon.className = open
        ? "fa-solid fa-xmark main-nav__toggle-icon"
        : "fa-solid fa-bars main-nav__toggle-icon";
    }

    if (open && mobileQuery.matches) {
      closeButton?.focus();
    }
  }

  toggle.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    setMenuOpen(!isMenuOpen());
  });

  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      setMenuOpen(false);
    });
  });

  backdrop?.addEventListener("click", function () {
    setMenuOpen(false);
    toggle.focus();
  });

  closeButton?.addEventListener("click", function (event) {
    event.preventDefault();
    setMenuOpen(false);
    toggle.focus();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && isMenuOpen()) {
      setMenuOpen(false);
      toggle.focus();
    }
  });

  mobileQuery.addEventListener("change", function () {
    setMenuOpen(false);
  });

  setMenuOpen(false);
}

function initSocialLinksPlacement() {
  const socialLinks = document.querySelector(".site-header .social-links");
  const headerSlot = document.querySelector(".site-header__social");
  const mobileSlot = document.querySelector(".mobile-social-links");
  if (!socialLinks || !headerSlot || !mobileSlot) return;

  const mobileQuery = window.matchMedia("(max-width: 768px)");

  function placeSocialLinks() {
    if (mobileQuery.matches) {
      mobileSlot.appendChild(socialLinks);
    } else {
      headerSlot.appendChild(socialLinks);
    }
  }

  mobileQuery.addEventListener("change", placeSocialLinks);
  placeSocialLinks();
}

function initMobileOnlineBankingToggle() {
  const container = document.querySelector(".online-banking-container");
  const toggle = document.querySelector(".mobile-online-banking__toggle");
  const content = document.getElementById("online-banking-content");
  if (!container || !toggle || !content) return;

  const mobileQuery = window.matchMedia("(max-width: 1250px)");

  function isOpen() {
    return container.classList.contains("online-banking-container--open");
  }

  function setOnlineBankingOpen(open) {
    if (!mobileQuery.matches) {
      container.classList.remove("online-banking-container--open");
      toggle.setAttribute("aria-expanded", "false");
      content.removeAttribute("aria-hidden");
      return;
    }

    container.classList.toggle("online-banking-container--open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    content.setAttribute("aria-hidden", open ? "false" : "true");
  }

  toggle.addEventListener("click", function (event) {
    event.preventDefault();

    if (!mobileQuery.matches) {
      return;
    }

    setOnlineBankingOpen(!isOpen());
  });

  mobileQuery.addEventListener("change", function () {
    setOnlineBankingOpen(false);
  });

  setOnlineBankingOpen(false);
}

function initSiteScripts() {
  initMainNavToggle();
  initSocialLinksPlacement();
  initMobileOnlineBankingToggle();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSiteScripts);
} else {
  initSiteScripts();
}

(function initPromoParallax() {
  const promo = document.querySelector(".promo");
  const layer = promo?.querySelector(".promo__parallax");
  if (!promo || !layer) return;

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let ticking = false;

  function updateParallax() {
    ticking = false;

    if (motionQuery.matches) {
      layer.style.transform = "";
      return;
    }

    const rect = promo.getBoundingClientRect();
    const viewHeight = window.innerHeight;

    if (rect.bottom < 0 || rect.top > viewHeight) return;

    const sectionCenter = rect.top + rect.height / 2;
    const viewCenter = viewHeight / 2;
    const offset = (sectionCenter - viewCenter) * -0.2;

    layer.style.transform = "translate3d(0, " + offset + "px, 0)";
  }

  function onScrollOrResize() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateParallax);
    }
  }

  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize);
  motionQuery.addEventListener("change", updateParallax);
  updateParallax();
})();
