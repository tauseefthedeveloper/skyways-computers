/* ComfySeat Chair - Main JS */
(function () {
  const $ = (s, scope = document) => scope.querySelector(s);
  const $$ = (s, scope = document) => Array.from(scope.querySelectorAll(s));
  const store = {
    get(key, fb) {
      try {
        return JSON.parse(localStorage.getItem(key)) ?? fb;
      } catch {
        return fb;
      }
    },
    set(key, v) {
      localStorage.setItem(key, JSON.stringify(v));
    },
  };

  const productMenuItems = [
    ["Refurbished Laptop", "refurbished.html"],
    ["Laptop Repairs", "laptoprepairs.html"],
    ["Computer Repairs", "computerrepairs.html"]
  ];

  function ensureDesktopDropdown() {
    const nav = $(".nav-links");
    if (!nav) return;
    let d = nav.querySelector(".dropdown");
    if (!d) {
      d = document.createElement("div");
      d.className = "dropdown";
      d.innerHTML = `<a href="#products" class="dropdown-toggle">Products ▾</a><div class="dropdown-menu"></div>`;
      const work = Array.from(nav.children).find(
        (x) => x.tagName === "A" && x.textContent.includes("Our Work")
      );
      if (work) nav.insertBefore(d, work);
      else nav.appendChild(d);
    }
    const menu = d.querySelector(".dropdown-menu");
    menu.innerHTML = "";
    productMenuItems.forEach(([t, h]) => {
      const a = document.createElement("a");
      a.href = h;
      a.textContent = t;
      menu.appendChild(a);
    });
  }
  function ensureMobileDropdown() {
    const m = $("#mobileMenu");
    if (!m) return;
    let det = m.querySelector("details");
    if (!det) {
      const w = document.createElement("div");
      w.innerHTML = `<details><summary>Products</summary><div class="mobile-products"></div></details>`;
      m.firstElementChild?.appendChild(w);
      det = w.querySelector("details");
    }
    const c = m.querySelector(".mobile-products");
    if (c) {
      c.innerHTML = "";
      productMenuItems.forEach(([t, h]) => {
        const a = document.createElement("a");
        a.href = h;
        a.textContent = t;
        c.appendChild(a);
      });
    }
  }

  const state = { cart: store.get("cart", []), wishlist: [] };
  // Clear any existing wishlist to remove undefined products
  store.set("wishlist", []);

  // Function to generate placeholder images
  function generatePlaceholderImage(name) {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 800, 600);
    gradient.addColorStop(0, "#f8f9fa");
    gradient.addColorStop(1, "#e9ecef");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);

    // Chair/sofa/table shape
    ctx.fillStyle = "#6c757d";
    ctx.fillRect(100, 200, 600, 300);

    // Chair back
    if (
      name.toLowerCase().includes("chair") ||
      name.toLowerCase().includes("stool")
    ) {
      ctx.fillRect(150, 150, 500, 50);
    }

    // Text
    ctx.fillStyle = "#495057";
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "center";
    ctx.fillText(name, 400, 100);

    // Category
    ctx.font = "20px Arial";
    ctx.fillStyle = "#6c757d";
    const category = name.split(" ")[0] + " " + name.split(" ")[1];
    ctx.fillText(category.toUpperCase(), 400, 130);

    return canvas.toDataURL("image/jpeg", 0.9);
  }
  function updateBadges() {
    const cartCount = state.cart.reduce((n, i) => n + i.qty, 0);
    const wishCount = state.wishlist.length;
    const cb = $("#cartBadge");
    const wb = $("#wishBadge");
    if (cb) cb.textContent = String(cartCount);
    if (wb) wb.textContent = String(wishCount);
  }

  function addToCart(item) {
    const idx = state.cart.findIndex((p) => p.id === item.id);
    if (idx > -1) {
      state.cart[idx].qty += item.qty ?? 1;
    } else {
      state.cart.push({
        id: item.id,
        name: item.name,
        img: item.img,
        qty: item.qty ?? 1,
      });
    }
    store.set("cart", state.cart);
    updateBadges();
  }
  function updateQty(id, delta) {
    const idx = state.cart.findIndex((p) => p.id === id);
    if (idx > -1) {
      state.cart[idx].qty = Math.max(1, state.cart[idx].qty + delta);
      store.set("cart", state.cart);
      updateBadges();
      renderCart();
    }
  }
  function removeFromCart(id) {
    state.cart = state.cart.filter((p) => p.id !== id);
    store.set("cart", state.cart);
    updateBadges();
    renderCart();
  }
  function toggleWishlistItem(item) {
    const ex = state.wishlist.find((x) => x.id === item.id);
    if (ex) {
      state.wishlist = state.wishlist.filter((x) => x.id !== item.id);
    } else {
      const safeImg =
        item.img && String(item.img).trim()
          ? item.img
          : "https://via.placeholder.com/64?text=%20";
      state.wishlist.push({ id: item.id, name: item.name, img: safeImg });
    }
    store.set("wishlist", state.wishlist);
    updateBadges();
    renderWishlist();
  }

  window.addEventListener("load", () => {
    const pre = $("#preloader");
    if (pre) {
      pre.style.opacity = "0";
      setTimeout(() => pre.remove(), 300);
    }
  });

  const back = $("#backToTop");
  if (back) {
    back.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
    window.addEventListener("scroll", () => {
      if (window.scrollY > 400) back.classList.add("show");
      else back.classList.remove("show");
    });
  }

  // Mobile menu functionality
  const menuToggle = $("#menuToggle");
  const mobileMenu = $("#mobileMenu");
  const body = document.body;

  function closeMobileMenu() {
    mobileMenu.classList.remove("open");
    body.classList.remove("nav-open");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
  }

  function openMobileMenu() {
    mobileMenu.classList.add("open");
    body.classList.add("nav-open");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "true");
    // Hide any Index link from mobile menu when opened (works across pages)
    $$('a[href="index.html"]', mobileMenu).forEach((a) =>
      a.parentElement?.remove()
    );

    // Add close button if not exists
    if (!mobileMenu.querySelector(".mobile-menu-close")) {
      const closeBtn = document.createElement("button");
      closeBtn.className = "mobile-menu-close";
      closeBtn.innerHTML = "×";
      closeBtn.setAttribute("aria-label", "Close Menu");
      closeBtn.addEventListener("click", closeMobileMenu);
      mobileMenu.appendChild(closeBtn);
    }
  }

  function toggleMobileMenu() {
    if (mobileMenu.classList.contains("open")) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  if (menuToggle && mobileMenu) {
    // Toggle menu on hamburger click
    menuToggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMobileMenu();
    });

    // Close menu when clicking outside (on overlay)
    document.addEventListener("click", (e) => {
      const isClickInsideMenu = mobileMenu.contains(e.target);
      const isClickOnToggle = menuToggle.contains(e.target);

      if (
        !isClickInsideMenu &&
        !isClickOnToggle &&
        mobileMenu.classList.contains("open")
      ) {
        closeMobileMenu();
      }
    });

    // Close menu on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileMenu.classList.contains("open")) {
        closeMobileMenu();
      }
    });

    // Close menu on back button (popstate)
    window.addEventListener("popstate", () => {
      if (mobileMenu.classList.contains("open")) {
        closeMobileMenu();
      }
    });

    // Close menu when clicking any menu link
    mobileMenu.addEventListener("click", (e) => {
      const link = e.target.closest(".mobile-nav-link");
      if (link) {
        // Small delay to allow navigation to start
        setTimeout(() => {
          closeMobileMenu();
        }, 100);
      }
    });

    // Close menu when clicking product dropdown links
    mobileMenu.addEventListener("click", (e) => {
      const productLink = e.target.closest(
        ".mobile-dropdown-menu .mobile-nav-link"
      );
      if (productLink) {
        setTimeout(() => {
          closeMobileMenu();
        }, 150);
      }
    });

    // Handle Products dropdown toggle (don't close menu when toggling dropdown)
    mobileMenu.addEventListener("click", (e) => {
      if (e.target.classList.contains("mobile-dropdown-toggle")) {
        e.stopPropagation();
        // Let the details element handle the toggle naturally
        // Add smooth scroll to dropdown when opened
        setTimeout(() => {
          const dropdown = e.target.closest("details");
          if (dropdown && dropdown.open) {
            const dropdownMenu = dropdown.querySelector(
              ".mobile-dropdown-menu"
            );
            if (dropdownMenu) {
              dropdownMenu.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }
          }
        }, 100);
      }
    });

    // Close menu when window is resized to desktop breakpoint or above
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 640 && mobileMenu.classList.contains("open")) {
        closeMobileMenu();
      }
    });
  }

  ensureDesktopDropdown();
  ensureMobileDropdown();

  const slides = $$(".slide");
  if (slides.length) {
    let i = 0;
    slides[0].classList.add("active");
    setInterval(() => {
      slides[i].classList.remove("active");
      i = (i + 1) % slides.length;
      slides[i].classList.add("active");
    }, 2000);
  }

  function ensureOverlays() {
    if (!$("#cartOverlay")) {
      const ov = document.createElement("div");
      ov.id = "cartOverlay";
      ov.className = "overlay";
      ov.innerHTML = `<div class="panel"><div class="panel-header"><strong>My Cart</strong><button class="btn" id="closeCart">Close</button></div><div class="panel-body" id="cartList"></div><div style="padding:12px;border-top:1px solid var(--border);display:flex;gap:8px"><button class="btn btn-primary" id="orderBtn">Order on WhatsApp</button></div></div>`;
      document.body.appendChild(ov);
      ov.addEventListener("click", (e) => {
        if (e.target === ov) ov.style.display = "none";
      });
      $("#closeCart").addEventListener(
        "click",
        () => (ov.style.display = "none")
      );
document.addEventListener("DOMContentLoaded", () => {
  const orderBtn = document.getElementById("orderBtn");
  if (!orderBtn) return;

  orderBtn.addEventListener("click", () => {
    if (!state.cart || state.cart.length === 0) {
      alert("🛒 Your cart is empty!");
      return;
    }

    // ✅ Set correct base URL (your GitHub Pages site)
    const baseUrl = "https://khanirfan-786.github.io/ComfyChair";

    const textLines = state.cart.map((item) => {
      const name = item.name || "Unknown Product";
      const qty = item.qty || 1;

      // ✅ Ensure image path is correct
      const imgUrl = item.img.startsWith("http")
        ? item.img
        : `${baseUrl}/${item.img.replace(/^\/+/, "")}`;

      // ✅ Correct product link (no 404)
      const productPage = `${baseUrl}/#${encodeURIComponent(
        item.slug || name.replace(/\s+/g, "-").toLowerCase()
      )}`;

      // ✅ WhatsApp message formatting
      return `🪑 *${name}* x${qty}%0A📷 Image: ${imgUrl}%0A🔗 ${productPage}%0A`;
    });

    const message =
      "Hi 👋 I am interested in these *ComfySeat* products:%0A%0A" +
      textLines.join("%0A");

    // ✅ WhatsApp number (replace if needed)
    const waUrl = `https://wa.me/917045707520?text=${message}`;

    // ✅ Open WhatsApp in a new tab
    window.open(waUrl, "_blank");
  });
});


    }
    if (!$("#wishOverlay")) {
      const ov = document.createElement("div");
      ov.id = "wishOverlay";
      ov.className = "overlay";
      ov.innerHTML = `<div class="panel"><div class="panel-header"><strong>Wishlist</strong><button class="btn" id="closeWish">Close</button></div><div class="panel-body" id="wishList"></div></div>`;
      document.body.appendChild(ov);
      ov.addEventListener("click", (e) => {
        if (e.target === ov) ov.style.display = "none";
      });
      $("#closeWish").addEventListener(
        "click",
        () => (ov.style.display = "none")
      );
    }
  }
  function renderCart() {
    const list = $("#cartList");
    if (!list) return;
    list.innerHTML = "";
    if (state.cart.length === 0) {
      list.innerHTML =
        '<div style="text-align:center;padding:20px;color:#64748b">No items in cart.</div>';
      return;
    }
    state.cart.forEach((item) => {
      const row = document.createElement("div");
      row.className = "cart-item";
      const imgSrc =
        item.img && item.img.trim()
          ? item.img
          : generatePlaceholderImage(item.name);
      row.innerHTML = `<img src="${imgSrc}" alt="${
        item.name
      }" style="width:64px;height:64px;object-fit:cover;border-radius:8px;border:1px solid var(--border)" onerror="this.onerror=null;this.src='${generatePlaceholderImage(
        item.name
      )}';"><div><div style="font-weight:700">${
        item.name
      }</div><div style="display:flex;gap:6px;margin-top:6px"><button class="btn" data-minus="${
        item.id
      }">-</button><div style="padding:6px 10px;border:1px solid var(--border);border-radius:8px;background:#fff">${
        item.qty
      }</div><button class="btn" data-plus="${
        item.id
      }">+</button><button class="btn" data-remove="${
        item.id
      }" style="background:#ffffff;color:#0f172a;border:1px solid var(--border)">Remove</button></div></div>`;
      list.appendChild(row);
    });
  }
  function renderWishlist() {
    const list = $("#wishList");
    if (!list) return;
    list.innerHTML = "";
    if (state.wishlist.length === 0) {
      list.innerHTML =
        '<div style="text-align:center;padding:20px;color:#64748b">No items in wishlist.</div>';
      return;
    }
    state.wishlist.forEach((item) => {
      const row = document.createElement("div");
      row.className = "cart-item";
      const imgSrc =
        item.img && item.img.trim()
          ? item.img
          : generatePlaceholderImage(item.name);
      row.innerHTML = `<img src="${imgSrc}" alt="${
        item.name
      }" style="width:64px;height:64px;object-fit:cover;border-radius:8px;border:1px solid var(--border)" onerror="this.onerror=null;this.src='${generatePlaceholderImage(
        item.name
      )}';"><div><div style="font-weight:700">${
        item.name
      }</div><div style="display:flex;gap:6px;margin-top:6px"><button class="btn" data-wish-remove="${
        item.id
      }" style="background:#ffffff;color:#0f172a;border:1px solid var(--border)">Remove</button><button class="btn btn-primary" data-wish-order="${
        item.id
      }">Order</button></div></div>`;
      list.appendChild(row);
    });
  }

  ensureOverlays();
  const cartBtn = $("#cartBtn");
  if (cartBtn) {
    cartBtn.addEventListener("click", () => {
      renderCart();
      $("#cartOverlay").style.display = "block";
    });
  }
  const wishlistBtn = $("#wishlistBtn");
  if (wishlistBtn) {
    wishlistBtn.addEventListener("click", () => {
      renderWishlist();
      $("#wishOverlay").style.display = "block";
    });
  }

  document.addEventListener("click", (e) => {
    const addBtn = e.target.closest("[data-add]");
    const wishBtn = e.target.closest("[data-wish]");
    const pBtn = e.target.closest("[data-plus]");
    const mBtn = e.target.closest("[data-minus]");
    const rBtn = e.target.closest("[data-remove]");
    const shareBtn = e.target.closest("[data-share]");
    const wOrder = e.target.closest("[data-wish-order]");
    const wRemove = e.target.closest("[data-wish-remove]");
    if (addBtn) {
      const card = addBtn.closest("[data-product]");
      const id = card.dataset.product;
      const name =
        card.querySelector(".card-title")?.textContent?.trim() || "Item";
      const img = card.querySelector("img")?.src || "";
      addToCart({ id, name, img, qty: 1 });
    }
    if (wishBtn) {
      const card = wishBtn.closest("[data-product]");
      const id =
        card?.dataset?.product ||
        wishBtn.dataset.wish ||
        Math.random().toString(36).slice(2);
      const name =
        card?.querySelector(".card-title")?.textContent?.trim() ||
        wishBtn.getAttribute("data-name") ||
        "Item";
      const img = (
        card?.querySelector("img")?.src ||
        wishBtn.getAttribute("data-img") ||
        ""
      ).trim();
      toggleWishlistItem({ id, name, img });
      wishBtn.classList.toggle("active");
    }
    if (pBtn) {
      updateQty(pBtn.dataset.plus, +1);
    }
    if (mBtn) {
      updateQty(mBtn.dataset.minus, -1);
    }
    if (rBtn) {
      removeFromCart(rBtn.dataset.remove);
      const before = state.wishlist.length;
      state.wishlist = state.wishlist.filter(
        (x) => x.id !== rBtn.dataset.remove
      );
      if (state.wishlist.length !== before) {
        store.set("wishlist", state.wishlist);
        renderWishlist();
        updateBadges();
      }
    }
    if (wRemove) {
      const id = wRemove.dataset.wishRemove;
      const before = state.wishlist.length;
      state.wishlist = state.wishlist.filter((x) => x.id !== id);
      if (state.wishlist.length !== before) {
        store.set("wishlist", state.wishlist);
        updateBadges();
        renderWishlist();
      }
    }
    if (shareBtn) {
      const url = window.location.href;
      const title =
        shareBtn
          .closest("[data-product]")
          ?.querySelector(".card-title")
          ?.textContent?.trim() || "ComfySeat";
      if (navigator.share) {
        navigator.share({ title, url }).catch(() => {});
      } else {
        navigator.clipboard?.writeText(url);
        alert("Link copied to clipboard");
      }
    }
    if (wOrder) {
      const item = state.wishlist.find(
        (x) => x.id === wOrder.dataset.wishOrder
      );
      const text = `Hi I am interested in your products.\n${item?.name ?? ""}`;
      const url = `https://wa.me/917045707520?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
    }
  });

  // Remove legacy filter/sort remnants
  $$(".card-body select, .card-body label").forEach((el) => {
    const card = el.closest(".card");
    if (card) card.remove();
  });

  if (!$(".fab")) {
    const fab = document.createElement("div");
    fab.className = "fab";
    fab.innerHTML = `<a class="wa" href="https://wa.me/917045707520?text=Hi%20I%20am%20interested%20in%20your%20products" target="_blank" title="WhatsApp"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.105"/></svg></a><a class="call" href="tel:+917045707520" title="Call">📞</a>`;
    document.body.appendChild(fab);
  }

  updateBadges();

  // Simple slider functionality
  function initSimpleSliders() {
    const sliders = $$(".simple-slider");
    sliders.forEach((slider) => {
      const track = slider.querySelector(".simple-track");
      const slides = $$(".simple-slide", track);
      const prevBtn = slider.querySelector(".simple-prev");
      const nextBtn = slider.querySelector(".simple-next");

      if (!track || slides.length === 0) return;

      let currentIndex = 0;

      function showSlide(index) {
        slides.forEach((slide, i) => {
          slide.style.opacity = i === index ? "1" : "0";
          slide.style.transform = `translateX(${(i - index) * 100}%)`;
        });
      }

      function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        showSlide(currentIndex);
      }

      function prevSlide() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        showSlide(currentIndex);
      }

      // Initialize
      showSlide(0);

      // Event listeners
      if (nextBtn) nextBtn.addEventListener("click", nextSlide);
      if (prevBtn) prevBtn.addEventListener("click", prevSlide);

      // Auto-advance every 4 seconds
      setInterval(nextSlide, 4000);
    });
  }




  // Initialize simple sliders when DOM is loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSimpleSliders);
  } else {
    initSimpleSliders();
  }
})();

document.getElementById("contactForm").addEventListener("submit", function(e) {
  e.preventDefault(); 
  
  // yahan tum future me Google Sheet save code bhi daal sakte ho
  alert("✅ Message sent successfully!");
  
  // form clear karne ke liye:
  this.reset();
});
document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.getElementById("contactForm");

  if (!contactForm) {
    console.error("❌ contactForm not found in DOM.");
    return;
  }

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const data = {
      name: contactForm.name.value.trim(),
      email: contactForm.email.value.trim(),
      message: contactForm.message.value.trim()
    };

    // basic validation
    if (!data.name || !data.email || !data.message) {
      alert("Please fill all fields.");
      return;
    }

    // 👇 apna Apps Script Web App URL yahan daalo
    const scriptURL = "YOUR_WEB_APP_URL_HERE";

    fetch(scriptURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(resp => {
        if (resp.status === "success") {
          alert("✅ " + resp.message);
          contactForm.reset();
        } else {
          alert("❌ " + (resp.message || "Unknown error"));
          console.error(resp);
        }
      })
      .catch(err => {
        console.error("Fetch error:", err);
        alert("Network error. Check console for details.");
      });
  });
});
