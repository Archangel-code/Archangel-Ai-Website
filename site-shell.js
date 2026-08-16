(() => {
  const routes = [
    { key: "home", label: "Home", href: "../" },
    { key: "gallery", label: "Gallery", href: "../Gallery/" },
    { key: "loras", label: "LoRAs & Models", href: "../LoRas-Models/" },
    { key: "projects", label: "Projects", href: "../Projects/" },
    { key: "donate", label: "Support", href: "../Donate/" },
  ];

  const pageKey = document.body.dataset.page || "home";
  let navigation = document.querySelector(".nav-links");

  if (navigation) {
    navigation.classList.add("site-nav");
    navigation.setAttribute("aria-label", "Primary navigation");
  } else {
    navigation = document.createElement("nav");
    navigation.className = "site-nav site-nav--injected";
    navigation.setAttribute("aria-label", "Primary navigation");
    navigation.innerHTML = routes
      .map(({ key, label, href }) => {
        const current = key === pageKey ? ' aria-current="page"' : "";
        return `<a href="${href}"${current}>${label}</a>`;
      })
      .join("");
    document.body.prepend(navigation);
  }

  if (pageKey !== "home" && navigation && !navigation.querySelector('[aria-current="page"]')) {
    const currentIndex = routes.findIndex(({ key }) => key === pageKey);
    const currentLink = navigation.querySelectorAll("a")[currentIndex];
    currentLink?.setAttribute("aria-current", "page");
  }

  document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    link.setAttribute("rel", "noopener noreferrer");
  });

  document.querySelectorAll(".footer p").forEach((footer) => {
    footer.textContent = `© ${new Date().getFullYear()} Archangel-AI.art — All rights reserved.`;
  });

  const revealSelector =
    ".gallery-item, .lora-card, .project-card, .placeholder-text, .donate-page .section";
  const revealTargets = document.querySelectorAll(revealSelector);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reducedMotion && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 }
    );

    const observeReveal = (element) => {
      if (element.classList.contains("reveal-ready")) return;
      element.classList.add("reveal-ready");
      observer.observe(element);
    };

    revealTargets.forEach(observeReveal);

    const mutationObserver = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches(revealSelector)) observeReveal(node);
          node.querySelectorAll?.(revealSelector).forEach(observeReveal);
        });
      });
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
  }

  document.querySelectorAll(".lora-card").forEach((card) => {
    const title = card.querySelector("h3")?.textContent?.trim() || "LoRA model";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-haspopup", "dialog");
    card.setAttribute("aria-label", `Open details for ${title}`);
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      card.click();
    });

    const dialog = card.nextElementSibling;
    if (dialog?.classList.contains("card-expand")) {
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.setAttribute("aria-label", title);
      const closeButton = dialog.querySelector(".close-btn");
      closeButton?.setAttribute("aria-label", "Close details");
    }
  });

  document.addEventListener("click", (event) => {
    const card = event.target.closest?.(".lora-card");
    if (!card) return;
    window.setTimeout(() => {
      card.nextElementSibling?.querySelector?.(".close-btn")?.focus();
    }, 0);
  });
})();
