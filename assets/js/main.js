/* SKYWAYS COMPUTER - Safe Site JS */
(function () {
  const $ = (selector, scope = document) => scope.querySelector(selector);

  function initPreloader() {
    window.addEventListener("load", () => {
      const preloader = $("#preloader");
      if (!preloader) return;
      preloader.style.opacity = "0";
      window.setTimeout(() => preloader.remove(), 300);
    });
  }

  function initBackToTop() {
    const backToTop = $("#backToTop");
    if (!backToTop) return;

    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", () => {
      if (window.scrollY > 400) backToTop.classList.add("show");
      else backToTop.classList.remove("show");
    });
  }

  function initMobileMenu() {
    const menuToggle = $("#menuToggle");
    const mobileMenu = $("#mobileMenu");
    if (!menuToggle || !mobileMenu) return;

    const body = document.body;

    function closeMobileMenu() {
      mobileMenu.classList.remove("open");
      body.classList.remove("nav-open");
      menuToggle.setAttribute("aria-expanded", "false");
    }

    function openMobileMenu() {
      mobileMenu.classList.add("open");
      body.classList.add("nav-open");
      menuToggle.setAttribute("aria-expanded", "true");
    }

    menuToggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (mobileMenu.classList.contains("open")) closeMobileMenu();
      else openMobileMenu();
    });

    document.addEventListener("click", (event) => {
      const clickedInsideMenu = mobileMenu.contains(event.target);
      const clickedToggle = menuToggle.contains(event.target);
      if (!clickedInsideMenu && !clickedToggle && mobileMenu.classList.contains("open")) {
        closeMobileMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && mobileMenu.classList.contains("open")) {
        closeMobileMenu();
      }
    });

    mobileMenu.addEventListener("click", (event) => {
      const link = event.target.closest(".mobile-nav-link");
      if (!link) return;
      window.setTimeout(closeMobileMenu, 100);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 640 && mobileMenu.classList.contains("open")) {
        closeMobileMenu();
      }
    });
  }

  function sanitizeText(value) {
    return String(value ?? "")
      .replace(/[<>]/g, "")
      .trim();
  }

  function initContactForm() {
    const contactForm = $("#contactForm");
    if (!contactForm) return;

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const fields = Array.from(contactForm.querySelectorAll("input, textarea"));
      let hasEmptyRequiredField = false;

      fields.forEach((field) => {
        const sanitized = sanitizeText(field.value);
        field.value = sanitized;
        if (field.hasAttribute("required") && !sanitized) {
          hasEmptyRequiredField = true;
        }
      });

      if (hasEmptyRequiredField) {
        alert("Please fill all required fields.");
        return;
      }

      alert("Message sent successfully!");
      contactForm.reset();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initBackToTop();
      initMobileMenu();
      initContactForm();
    });
  } else {
    initBackToTop();
    initMobileMenu();
    initContactForm();
  }

  initPreloader();
})();
