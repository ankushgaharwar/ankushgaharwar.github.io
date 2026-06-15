(function () {
  var gifs = [
    "1.gif",
    "2.gif",
    "3.gif",
    "4.gif",
    "5.gif",
    "6.gif",
    "7.gif",
    "8.gif"
  ];

  var designerWords = [
    "\u0921\u093f\u091c\u093c\u093e\u0907\u0928\u0930",
    "Designer",
    "Progettista",
    "Designer",
    "Dise\u00f1ador",
    "Designer",
    "\u0bb5\u0b9f\u0bbf\u0bb5\u0bae\u0bc8\u0baa\u0bcd\u0baa\u0bbe\u0bb3\u0bb0\u0bcd",
    "Designer",
    "\u30c7\u30b6\u30a4\u30ca\u30fc",
    "Designer",
    "\u8bbe\u8ba1\u5e08",
    "Designer",
    "\u0e19\u0e31\u0e01\u0e2d\u0e2d\u0e01\u0e41\u0e1a\u0e1a",
    "Designer",
    "\u0434\u0438\u0437\u0430\u0439\u043d\u0435\u0440",
    "Designer",
    "\u0434\u0438\u0437\u0430\u0439\u043d\u0435\u0440",
    "Designer",
    "\u0b21\u0b3f\u0b1c\u0b3e\u0b07\u0b28\u0b30\u0b4d",
    "Designer",
    "\u0921\u093f\u091c\u093c\u093e\u0907\u0928\u0930",
    "Designer",
    "Proiectant",
    "Designer",
    "\u0921\u093f\u091c\u093c\u093e\u0907\u0928\u0930",
    "Designer"
  ];

  var displayTime = 3000;
  var portfolioItems = [
    {
      href: "Trading Leagues.html",
      title: "Trading Leagues",
      meta: "UI/UX",
      image: "portfolio/tl/TL.png"
    },
    {
      href: "https://www.figma.com/proto/bjSyG6gRwkMcudy5dhxWf6/Thesis?page-id=0%3A1&type=design&node-id=655-337&viewport=-8875%2C1883%2C0.27&t=9iTmugv8s8g84VrV-1&scaling=contain",
      title: "Cosmic Kaksh",
      meta: "THESIS",
      image: "portfolio/Cosmic Kaksh/Cosmic Kaksh.png"
    },
    {
      href: "https://www.figma.com/proto/jXGgzr0nLWG7c2YmzOuvPc/Compre-Ahora-Arg-Case-Study?page-id=&type=design&node-id=1-16&viewport=363%2C654%2C0.04&t=W5j2ONZ1YkA2ABd7-1&scaling=scale-down-width",
      title: "Compre Ahora UX Case Study",
      meta: "UI/UX",
      image: "portfolio/CA Arg/caarg.png"
    },
    {
      href: "https://www.figma.com/proto/wpr0chW47Dq2o3oXZ9U0Gh/UBER-UX-Case-study?page-id=0%3A1&type=design&node-id=8-1976&viewport=-174%2C-9123%2C0.27&t=o4zyaARb9fiY2bsI-1&scaling=scale-down-width",
      title: "Uber UX Case Study",
      meta: "UI/UX",
      image: "portfolio/UI UX/UI UX.png"
    },
    {
      href: "protoplanet.html",
      title: "Protoplanet x ISRO",
      meta: "SPACE HABITAT",
      image: "portfolio/protoplanet/protopcover.jpg"
    },
    {
      href: "Vilgain.html",
      title: "Vilgain",
      meta: "BRAND/UI",
      image: "portfolio/vilgain/Vilgain.png"
    },
    {
      href: "treehouse.html",
      title: "Tree House Design",
      meta: "ARCHITECTURE",
      image: "portfolio/Tree House/p.png"
    },
    {
      href: "spacedesign.html",
      title: "Gaganyan Crew Seat",
      meta: "SPACE DESIGN",
      image: "portfolio/Space Design/p.png"
    },
    {
      href: "arborfelix.html",
      title: "Arbor Felix",
      meta: "LAMP DESIGN",
      image: "portfolio/Arborfelix/p.png"
    },
    {
      href: "villamedici.html",
      title: "Cabanes Night",
      meta: "VILLA MEDICI",
      image: "portfolio/Villa Medici/p.png"
    },
    {
      href: "verde.html",
      title: "7 Story Tensile",
      meta: "INSTALLATION",
      image: "portfolio/Verde/p.png"
    },
    {
      href: "U Smile.html",
      title: "U Smile",
      meta: "UI/UX",
      image: "portfolio/U Smile/usmile.png"
    },
    {
      href: "CA Arg Prod.html",
      title: "CA Argentina Production",
      meta: "PRODUCTION",
      image: "portfolio/CA Arg/caarg.png"
    },
    {
      href: "gro-24-7-dls.html",
      title: "Gro 24/7 DLS",
      meta: "DESIGN SYSTEM",
      image: "portfolio/Gro 247 dls/cover.png"
    },
    {
      href: "Barrier Design.html",
      title: "Barrier Design",
      meta: "INDUSTRIAL",
      image: "portfolio/Barrier Designs/Barrier Designs.png"
    },
    {
      href: "smarte.html",
      title: "Smarte +",
      meta: "INTERACTIVE",
      image: "portfolio/Smarte +/Smarte +.png"
    },
    {
      href: "Package Design.html",
      title: "Package Design",
      meta: "PACKAGING",
      image: "portfolio/Package Design/Package Design.png"
    },
    {
      href: "Smart Objects lamp.html",
      title: "Smart Objects - Lamp",
      meta: "SMART OBJECT",
      image: "portfolio/Smart Objects - Lamp/Smart Objects - Lamp.png"
    },
    {
      href: "scooper.html",
      title: "Smart Objects - Scoopers",
      meta: "SMART OBJECT",
      image: "portfolio/Smart Object - Scooper/Smart Objects - Scooper.png"
    },
    {
      href: "drive from wheelchair.html",
      title: "Drive From Wheelchair",
      meta: "MOBILITY",
      image: "portfolio/Drive from wheelchair/Drive from wheelchair.png"
    },
    {
      href: "entry level motorcycle.html",
      title: "Entry Level Motorcycle",
      meta: "MOBILITY",
      image: "portfolio/Entry level motorcycle/Entry level motercycle for Indian market.png"
    },
    {
      href: "aurora.html",
      title: "Aurora",
      meta: "PRODUCT",
      image: "portfolio/Aurora/Aurora.png"
    },
    {
      href: "hope.html",
      title: "Hope",
      meta: "PRODUCT",
      image: "portfolio/Hope/Hope.png"
    },
    {
      href: "taming the drone.html",
      title: "Tame The Drone",
      meta: "DRONE DESIGN",
      image: "portfolio/Taming the drone/Taming the drone.png"
    },
    {
      href: "quizventure.html",
      title: "Quizventure",
      meta: "GAME",
      image: "portfolio/Quizventure/Quizventure.png"
    },
    {
      href: "zombie chase saga.html",
      title: "Zombie Chase Saga",
      meta: "GAME",
      image: "portfolio/Zombie chase saga/cover.png"
    },
    {
      href: "compre-ahora-style-guide-arg.html",
      title: "Compre Ahora Style Guide Arg",
      meta: "STYLE GUIDE",
      image: "portfolio/CA Arg SG/QA Checklist.png"
    },
    {
      href: "dev-handoff.html",
      title: "Dev Handoff",
      meta: "HANDOFF",
      image: "portfolio/Dev Handoff/cover.png"
    },
    {
      href: "da-dashboard-style-guide.html",
      title: "DA & Dashboard Style Guide",
      meta: "STYLE GUIDE",
      image: "portfolio/DA & Dashboard SG/cover.png"
    },
    {
      href: "da-dashboard-dev-handoff.html",
      title: "DA & Dashboard Dev Handoff",
      meta: "HANDOFF",
      image: "portfolio/D&A Dashboard Handoff/cover.png"
    },
    {
      href: "kahvay.html",
      title: "Kahvay",
      meta: "UI/UX",
      image: "portfolio/KahVay/cover.png"
    },
    {
      href: "bkwai.html",
      title: "BKWAI",
      meta: "AI PRODUCT",
      image: "portfolio/BKWAI/cover.png"
    },
    {
      href: "conso4s.html",
      title: "conso4s",
      meta: "PRODUCT",
      image: "portfolio/Conso4s/cover.png"
    },
    {
      href: "3D.html",
      title: "Miscellaneous",
      meta: "ARCHIVE",
      image: "portfolio/miscellaneous.png"
    }
  ];

  function initBrand(brand) {
    var logo = brand.querySelector("[data-rotating-brand-logo]");
    var word = brand.querySelector("[data-rotating-brand-word]");
    if (!logo || !word) return;

    var base = brand.getAttribute("data-logo-base") || "";
    var index = 0;

    function updateBrand() {
      if (brand.getAttribute("data-back-hover") === "true") return;
      logo.setAttribute("src", base + gifs[index % gifs.length]);
      word.textContent = designerWords[index % designerWords.length];
    }

    brand.__updateRotatingBrand = updateBrand;
    updateBrand();
    window.setInterval(function () {
      index = (index + 1) % designerWords.length;
      updateBrand();
    }, displayTime);
  }

  function boot() {
    Array.prototype.forEach.call(
      document.querySelectorAll("[data-rotating-brand]"),
      initBrand
    );
    initBackButtons();
    initPageTitles();
    initPortfolioMiniDock();
  }

  function cleanText(value) {
    return (value || "").replace(/\s+/g, " ").trim();
  }

  function findPageTitle() {
    var headings = document.querySelectorAll("main h2, #main h2, .untree_co-section h2, #__nuxt h2, body h2");

    for (var i = 0; i < headings.length; i += 1) {
      var heading = headings[i];
      if (heading.closest("nav, header, footer, .contact-panel")) continue;

      var text = cleanText(heading.textContent);
      if (!text) continue;
      if (/want to get in touch|work together/i.test(text)) continue;

      return text;
    }

    return "";
  }

  function addTitleToContainer(container, title) {
    var contact = container.querySelector(".legacy-contact-link, .static-page-nav__contact");
    if (!contact || container.querySelector(".nav-right-group .nav-page-title")) return;

    Array.prototype.forEach.call(
      container.querySelectorAll(".site-menu .nav-page-title-item, .static-page-nav__links .nav-page-title"),
      function (oldTitle) {
        oldTitle.parentNode.removeChild(oldTitle);
      }
    );

    var group = contact.closest(".nav-right-group");
    if (!group) {
      group = document.createElement("div");
      group.className = "nav-right-group";
      contact.parentNode.insertBefore(group, contact);
      group.appendChild(contact);
    }

    var titleText = title.replace(/,$/, "");
    var titleElement = document.createElement("span");
    titleElement.className = "nav-page-title";
    titleElement.textContent = titleText;
    group.insertBefore(titleElement, contact);
  }

  function addBackButton(brand) {
    var container = brand.closest(".site-navigation, .static-page-nav");
    var logo = brand.querySelector("[data-rotating-brand-logo]");
    if (!container || !logo || container.querySelector(".nav-back-button")) return;

    var group = brand.closest(".nav-left-group");
    if (!group) {
      group = document.createElement("div");
      group.className = "nav-left-group";
      brand.parentNode.insertBefore(group, brand);
      group.appendChild(brand);
    }

    var button = document.createElement("button");
    button.className = "nav-back-button";
    button.type = "button";
    button.setAttribute("aria-label", "Go back");
    group.insertBefore(button, brand);

    var base = brand.getAttribute("data-logo-base") || "";
    var fallbackHref = brand.getAttribute("href") || "index.html";

    function showBackLogo() {
      brand.setAttribute("data-back-hover", "true");
      logo.setAttribute("src", base + "left.png");
    }

    function restoreBrandLogo() {
      brand.removeAttribute("data-back-hover");
      if (typeof brand.__updateRotatingBrand === "function") {
        brand.__updateRotatingBrand();
      }
    }

    button.addEventListener("mouseenter", showBackLogo);
    button.addEventListener("mouseleave", restoreBrandLogo);
    button.addEventListener("click", function () {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = fallbackHref;
      }
    });
  }

  function initBackButtons() {
    Array.prototype.forEach.call(
      document.querySelectorAll("[data-rotating-brand]"),
      addBackButton
    );
  }

  function initPageTitles() {
    var title = findPageTitle();
    if (!title) return;

    Array.prototype.forEach.call(
      document.querySelectorAll(".site-navigation, .static-page-nav"),
      function (container) {
        addTitleToContainer(container, title);
      }
    );
  }

  function normalizePath(value) {
    try {
      return decodeURIComponent(value)
        .replace(/\\/g, "/")
        .replace(/\/+$/, "")
        .toLowerCase();
    } catch (error) {
      return value.replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();
    }
  }

  function getRootUrl() {
    var brand = document.querySelector("[data-rotating-brand]");
    var logoBase = brand ? brand.getAttribute("data-logo-base") : "logo-gifs/";
    var logoUrl = new URL(logoBase || "logo-gifs/", window.location.href);
    return new URL(logoUrl.href.replace(/logo-gifs\/?$/, ""));
  }

  function getPortfolioDockCurrentItem(rootUrl) {
    var currentPath = normalizePath(window.location.pathname);

    for (var i = 0; i < portfolioItems.length; i += 1) {
      var itemUrl = new URL(portfolioItems[i].href, rootUrl);
      if (normalizePath(itemUrl.pathname) === currentPath) return portfolioItems[i];
    }

    return null;
  }

  function ensurePortfolioDockStyles() {
    if (document.getElementById("portfolio-mini-dock-styles")) return;

    var style = document.createElement("style");
    style.id = "portfolio-mini-dock-styles";
    style.textContent = [
      ".portfolio-mini-dock{position:fixed;left:clamp(16px,3.35vw,64px);right:clamp(16px,3.35vw,64px);bottom:18px;z-index:9995;padding:10px 12px;border:1px solid rgba(17,17,17,.12);border-radius:8px;background:linear-gradient(180deg,rgba(247,246,242,.96),rgba(247,246,242,.9));box-shadow:0 18px 48px rgba(17,17,17,.12);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);font-family:LegacyDiatype,ABCDiatype,Arial,Helvetica,sans-serif;font-size:clamp(12px,1vw,15px);font-weight:500;line-height:1;letter-spacing:-.035em;color:#111;box-sizing:border-box;overflow:hidden}",
      ".portfolio-mini-rail{display:flex;gap:8px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;-ms-overflow-style:none;overscroll-behavior-x:contain;padding:0;margin:0}",
      ".portfolio-mini-rail::-webkit-scrollbar{display:none}",
      ".portfolio-mini-card{flex:0 0 clamp(132px,12vw,174px);display:grid;grid-template-columns:44px minmax(0,1fr);align-items:center;gap:8px;min-width:0;padding:6px;border-radius:6px;color:#8f8f8b;text-decoration:none;transition:background .25s ease,color .25s ease,opacity .25s ease}",
      ".portfolio-mini-card:hover,.portfolio-mini-card.is-current{background:rgba(17,17,17,.055);color:#111}",
      ".portfolio-mini-card.is-current{box-shadow:inset 0 0 0 1px rgba(17,17,17,.1)}",
      ".portfolio-mini-thumb{width:44px;height:34px;border-radius:4px;overflow:hidden;background:rgba(17,17,17,.08)}",
      ".portfolio-mini-thumb img{width:100%;height:100%;object-fit:cover;display:block}",
      ".portfolio-mini-copy{min-width:0;display:flex;flex-direction:column;gap:3px}",
      ".portfolio-mini-title,.portfolio-mini-meta{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".portfolio-mini-meta{color:#b8b8b3;font-size:.86em}",
      "body.has-portfolio-mini-dock{padding-bottom:112px}",
      "@media(max-width:760px){.portfolio-mini-dock{left:14px;right:14px;bottom:14px;padding:8px}.portfolio-mini-card{flex-basis:128px;grid-template-columns:40px minmax(0,1fr)}.portfolio-mini-thumb{width:40px;height:32px}body.has-portfolio-mini-dock{padding-bottom:104px}}"
    ].join("");

    document.head.appendChild(style);
  }

  function buildPortfolioMiniDock(rootUrl, currentItem) {
    var dock = document.createElement("nav");
    dock.className = "portfolio-mini-dock";
    dock.setAttribute("aria-label", "Portfolio work");

    var rail = document.createElement("div");
    rail.className = "portfolio-mini-rail";
    dock.appendChild(rail);

    for (var i = 0; i < portfolioItems.length; i += 1) {
      var item = portfolioItems[i];
      var isCurrent = item === currentItem;
      var link = document.createElement("a");
      link.className = "portfolio-mini-card" + (isCurrent ? " is-current" : "");
      link.href = new URL(item.href, rootUrl).href;
      if (/^https?:\/\//i.test(item.href)) {
        link.target = "_blank";
        link.rel = "noreferrer";
      }
      if (isCurrent) link.setAttribute("aria-current", "page");

      var thumb = document.createElement("span");
      thumb.className = "portfolio-mini-thumb";
      var image = document.createElement("img");
      image.src = new URL(item.image, rootUrl).href;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      thumb.appendChild(image);

      var copy = document.createElement("span");
      copy.className = "portfolio-mini-copy";
      var title = document.createElement("span");
      title.className = "portfolio-mini-title";
      title.textContent = item.title;
      var meta = document.createElement("span");
      meta.className = "portfolio-mini-meta";
      meta.textContent = item.meta;
      copy.appendChild(title);
      copy.appendChild(meta);

      link.appendChild(thumb);
      link.appendChild(copy);
      rail.appendChild(link);
    }

    rail.addEventListener("wheel", function (event) {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      rail.scrollLeft += event.deltaY;
      event.preventDefault();
    }, { passive: false });

    document.body.appendChild(dock);
    document.body.classList.add("has-portfolio-mini-dock");

    window.requestAnimationFrame(function () {
      var current = rail.querySelector(".portfolio-mini-card.is-current");
      if (current && current.scrollIntoView) {
        current.scrollIntoView({ block: "nearest", inline: "center" });
      }
    });
  }

  function initPortfolioMiniDock() {
    if (document.querySelector(".portfolio-mini-dock")) return;

    var rootUrl = getRootUrl();
    var currentItem = getPortfolioDockCurrentItem(rootUrl);
    if (!currentItem) return;

    ensurePortfolioDockStyles();
    buildPortfolioMiniDock(rootUrl, currentItem);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
