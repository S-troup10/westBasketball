// Common helpers for all pages - Modern Dark Theme
const navLinks = [
  { label: "Home", href: "index.html", key: "home" },
  { label: "About", href: "about.html", key: "about" },
  { label: "Gallery", href: "gallery.html", key: "gallery" },
  { label: "Join", href: "join.html", key: "join" },
  { label: "Merchandise", href: "merchandise.html", key: "merch" },
  { label: "Coaches", href: "coaches.html", key: "coaches" },
  { label: "Sponsors", href: "sponsors.html", key: "sponsors" }
];

function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatMultiline(text = "") {
  return escapeHtml(text).replace(/\n/g, "<br>");
}

function renderNav(activeKey) {
  const container = document.getElementById("site-nav");
  if (!container) return;
  const siteContent = window.siteContent || {};
  const club = siteContent.club || {};
  const images = siteContent.images || {};
  const navConfig = siteContent.navigation || {};
  const links = navConfig?.links ?? navLinks;
  const adminLabel = navConfig?.adminLabel ?? "Admin";
  const logoSrc = images?.logo || 'logo.png';
  container.innerHTML = `
    <div class="max-w-6xl mx-auto flex items-center justify-between py-4 px-6">
      <a href="index.html" class="flex items-center gap-3 group">
        <div class="relative">
          <div class="absolute inset-0 bg-primary/30 rounded-full blur-lg group-hover:bg-primary/50 transition-all"></div>
          <img src="${logoSrc}" alt="Club logo" class="relative h-12 w-auto max-w-[140px] rounded-lg border-2 border-primary/30 bg-dark object-contain" />
        </div>
        <div class="hidden sm:block">
          <p class="text-base font-bold text-white group-hover:text-primary transition-colors">${club?.shortName ?? "West Basketball"}</p>
          <p class="text-xs text-white/50">${club?.tagline?.substring(0, 40) ?? ""}...</p>
        </div>
      </a>
      <nav class="hidden lg:flex items-center gap-1">
        ${links
          .map((link) => {
            const active = link.key === activeKey;
            return `<a href="${link.href}" class="px-4 py-2 rounded-full text-sm font-medium transition-all ${
              active
                ? "bg-primary/20 text-primary"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }">${link.label}</a>`;
          })
          .join("")}
      </nav>
      <div class="flex items-center gap-3">
        <button id="mobile-menu-btn" type="button" class="lg:hidden inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 text-white/80 hover:text-white hover:bg-white/10 transition" aria-label="Toggle navigation" aria-controls="mobile-menu" aria-expanded="false">
          <span class="text-sm font-medium">Menu</span>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      </div>
    </div>
    <div id="mobile-menu" class="hidden lg:hidden border-t border-white/5 bg-dark/95 backdrop-blur-xl">
      <div class="px-6 py-4 space-y-2">
        ${links
          .map((link) => {
            const active = link.key === activeKey;
            return `<a href="${link.href}" class="block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              active
                ? "bg-primary/20 text-primary"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }">${link.label}</a>`;
          })
          .join("")}
      </div>
    </div>
  `;
  
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      const isHidden = mobileMenu.classList.toggle('hidden');
      mobileBtn.setAttribute('aria-expanded', (!isHidden).toString());
    });
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

function renderFooter() {
  const el = document.getElementById("site-footer");
  if (!el) return;
  const { club, images } = window.siteContent;
  const footerData = window.siteContent.footer ?? {};
  const logoSrc = images?.logo || 'logo.png';
  el.innerHTML = `
    <div class="max-w-6xl mx-auto py-12 px-6">
      <div class="grid md:grid-cols-4 gap-8 mb-8">
        <div class="md:col-span-2 space-y-4">
          <div class="flex items-center gap-3">
            <img src="${logoSrc}" alt="Club logo" class="h-12 w-auto max-w-[160px] rounded-lg border border-white/10 bg-dark object-contain" />
            <div>
              <p class="text-lg font-bold text-white">${club?.name ?? "West Basketball Club"}</p>
              <p class="text-sm text-white/50">${footerData.tagline ?? "Youth basketball in Newcastle"}</p>
            </div>
          </div>
          <p class="text-white/50 text-sm max-w-md">${club?.tagline ?? "Building players, community, and a lifelong love of the game."}</p>
        </div>
        <div class="space-y-3">
          <p class="text-white font-semibold">${footerData.quickLinksTitle ?? "Quick Links"}</p>
          <div class="space-y-2">
            ${(footerData.quickLinks || []).map((link) => `<a href="${link.href}" class="block text-sm text-white/50 hover:text-primary transition-colors">${link.label}</a>`).join("\n")}
          </div>
        </div>
        <div class="space-y-3">
          <p class="text-white font-semibold">${footerData.connectTitle ?? "Connect"}</p>
          <div class="space-y-2">
            ${(footerData.connectLinks || []).map((link) => `<a href="${link.href}" class="block text-sm text-white/50 hover:text-primary transition-colors">${link.label}</a>`).join("\n")}
          </div>
        </div>
      </div>
      <div class="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/40">
        <p>&copy; ${new Date().getFullYear()} ${club?.name ?? "West Basketball Club"}. All rights reserved.</p>
        <p>${footerData.note ?? "Built for families, players, and the community."}</p>
      </div>
    </div>
  `;
}

function renderQuickLinks(targetId) {
  const el = document.getElementById(targetId);
  if (!el) return;
  const links = window.siteContent.quickLinks ?? [];
  el.innerHTML = links
    .map(
      (link) => `
      <a href="${link.href}" class="group glass rounded-xl px-5 py-4 flex items-center justify-between hover:border-primary/30 transition-all card-hover">
        <span class="text-white font-medium">${link.label}</span>
        <svg class="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
      </a>`
    )
    .join("\n");
}

function renderNews(targetId) {
  const el = document.getElementById(targetId);
  if (!el) return;
  const news = window.siteContent.news ?? [];
  el.innerHTML = news
    .map(
      (item) => `
        <article class="glass card-hover rounded-2xl p-6 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs text-white/40">${item.date ?? ""}</span>
            <span class="inline-flex items-center gap-1.5 text-xs text-primary">
              <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Latest
            </span>
          </div>
          <h3 class="text-lg font-bold text-white">${item.title ?? "Update"}</h3>
          <p class="text-sm text-white/60 leading-relaxed">${formatMultiline(item.summary ?? "")}</p>
          <a class="inline-flex items-center gap-2 text-sm text-primary font-medium group" href="${item.url ?? "#"}">
            Read more
            <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          </a>
        </article>
      `
    )
    .join("\n");
}

function renderSponsors(targetId) {
  const el = document.getElementById(targetId);
  if (!el) return;
  const sponsors = window.siteContent.sponsors ?? [];
  el.innerHTML = sponsors
    .map(
      (sponsor) => `
        <a href="${sponsor.url ?? "#"}" class="flex items-center justify-center p-4 min-h-24 transition-transform hover:scale-110" aria-label="${sponsor.name}">
          <img src="${sponsor.logo}" alt="${sponsor.name}" class="max-h-24 md:max-h-28 object-contain drop-shadow-xl brightness-110 hover:brightness-125 transition-all" />
        </a>`
    )
    .join("\n");
}

function renderAboutDetails() {
  const data = window.siteContent.about ?? {};
  const aboutPage = window.siteContent.pages?.about ?? {};
  const homePage = window.siteContent.pages?.home ?? {};
  const intro = document.getElementById("about-intro");
  const history = document.getElementById("about-history");
  const values = document.getElementById("about-values");
  const lifeMembers = document.getElementById("about-life-members");
  const photos = document.getElementById("about-photos");
  const heroTag = document.getElementById("about-hero-tag");
  const heroTitle = document.getElementById("about-hero-title");
  const heroHighlight = document.getElementById("about-hero-highlight");
  const historyTitle = document.getElementById("about-history-title");
  const valuesTitle = document.getElementById("about-values-title");
  const lifeTitle = document.getElementById("about-life-title");
  const lifeDesc = document.getElementById("about-life-description");
  const contactTag = document.getElementById("about-contact-tag");
  const contactTitle = document.getElementById("about-contact-title");
  const contactHighlight = document.getElementById("about-contact-highlight");
  const contactDesc = document.getElementById("about-contact-desc");
  const contactCta = document.getElementById("about-contact-cta");
  const snapshotTitle = document.getElementById("about-snapshot-title");
  const snapshotSubtitle = document.getElementById("about-snapshot-subtitle");
  const snapshotStats = document.getElementById("about-snapshot-stats");
  const extraText = document.getElementById("about-extra-text");
  const extraTag = document.getElementById("about-extra-tag");
  const extraTitle = document.getElementById("about-extra-title");
  const featureImage = document.getElementById("about-feature-image");
  const pillarsTitle = document.getElementById("about-pillars-title");
  const pillarsSubtitle = document.getElementById("about-pillars-subtitle");
  const pillars = document.getElementById("about-pillars");
  const initiativesTitle = document.getElementById("about-initiatives-title");
  const initiativesSubtitle = document.getElementById("about-initiatives-subtitle");
  const initiatives = document.getElementById("about-initiatives");
  const storyTag = document.getElementById("home-story-tag");
  const storyTitle = document.getElementById("home-story-title");
  const storySubtitle = document.getElementById("home-story-subtitle");
  const storyContainer = document.getElementById("home-story-blocks");
  if (heroTag) heroTag.textContent = aboutPage.heroTag ?? "Our Story";
  if (heroTitle) heroTitle.textContent = aboutPage.heroTitle ?? "About";
  if (heroHighlight) heroHighlight.textContent = aboutPage.heroHighlight ?? "West Basketball";
  if (intro) intro.innerHTML = formatMultiline(data.intro ?? "");
  if (history) history.innerHTML = formatMultiline(data.history ?? "");
  if (historyTitle) historyTitle.textContent = aboutPage.historyTitle ?? "Our History";
  if (valuesTitle) valuesTitle.textContent = aboutPage.valuesTitle ?? "Our Values";
  if (lifeTitle) lifeTitle.textContent = aboutPage.lifeMembersTitle ?? "Life Members";
  if (lifeDesc) lifeDesc.innerHTML = formatMultiline(aboutPage.lifeDescription ?? "");
  if (contactTag) contactTag.textContent = aboutPage.contactTag ?? "";
  if (contactTitle) contactTitle.textContent = aboutPage.contactTitle ?? "";
  if (contactHighlight) contactHighlight.textContent = aboutPage.contactHighlight ?? "";
  if (contactDesc) contactDesc.innerHTML = formatMultiline(aboutPage.contactDescription ?? "");
  if (contactCta) {
    contactCta.innerHTML = `${aboutPage.contactCtaLabel ?? "Send us an email"} <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>`;
    contactCta.setAttribute("data-contact-trigger", "true");
    contactCta.classList.add("contact-modal-trigger");
  }
  if (storyTag) storyTag.textContent = homePage.storyTag ?? "Our Club";
  if (storyTitle) storyTitle.textContent = homePage.storyTitle ?? "More than game day";
  if (storySubtitle) storySubtitle.innerHTML = formatMultiline(homePage.storySubtitle ?? "");
  if (storyContainer) {
    const storyBlocks = homePage.storyBlocks ?? [];
    storyContainer.innerHTML = storyBlocks
      .map(
        (block) => `
        <article class="glass card-hover rounded-3xl p-6 space-y-4 h-full text-left">
          <span class="inline-flex items-center text-xs uppercase tracking-[0.2em] text-primary bg-primary/10 border border-primary/30 rounded-full px-3 py-1">${escapeHtml(block.tag || "Story")}</span>
          <h3 class="text-2xl font-bold text-white">${escapeHtml(block.title || "")}</h3>
          <p class="text-white/60 leading-relaxed">${formatMultiline(block.summary || "")}</p>
          ${
            block.bullets && block.bullets.length
              ? `<ul class="space-y-2 text-sm text-white/70 list-disc list-inside">` +
                block.bullets.map((line) => `<li>${escapeHtml(line)}</li>`).join("") +
                `</ul>`
              : ""
          }
        </article>
      `
      )
      .join("\n");
  }
  if (values) {
    values.innerHTML = (data.values ?? [])
      .map((val) => `<li class="px-4 py-3 rounded-xl glass text-white">${val}</li>`)
      .join("\n");
  }
  if (extraText) {
    const textContent = aboutPage.extraText ?? data.extraText ?? data.history ?? data.intro ?? "";
    extraText.innerHTML = formatMultiline(textContent);
  }
  if (extraTag) extraTag.textContent = aboutPage.extraTag ?? "Club Story";
  if (extraTitle) extraTitle.textContent = aboutPage.extraTitle ?? "Why We Play";
  if (featureImage) {
    const highlightPhoto = data.highlightPhoto || (Array.isArray(data.photos) && data.photos[0]) || "logo.png";
    featureImage.innerHTML = `
      <img src="${highlightPhoto}" alt="Club highlight" class="w-full h-auto max-h-[420px] object-contain bg-black/40" loading="lazy" />
    `;
  }
  if (lifeMembers) {
    lifeMembers.innerHTML = (data.lifeMembers ?? [])
      .map((member) => `<li class="text-white/80">${member}</li>`)
      .join("\n");
  }
  if (photos) {
    photos.innerHTML = (data.photos ?? [])
      .map(
        (src) => `<div class="image-card card-hover"><img src="${src}" alt="Club moment" class="rounded-2xl object-contain w-full h-auto max-h-64 bg-black/40" loading="lazy" /></div>`
      )
      .join("\n");
  }
  if (snapshotTitle) snapshotTitle.textContent = data.snapshotTitle ?? "Club at a glance";
  if (snapshotSubtitle) snapshotSubtitle.innerHTML = formatMultiline(data.snapshotSubtitle ?? "");
  if (snapshotStats) {
    snapshotStats.innerHTML = (data.snapshotStats ?? [])
      .map(
        (stat) => `
        <div class="glass card-hover rounded-2xl p-5 space-y-2 h-full">
          <p class="text-xs uppercase tracking-[0.2em] text-primary">${escapeHtml(stat.label ?? "")}</p>
          <p class="text-3xl font-bold text-white">${escapeHtml(stat.value ?? "")}</p>
          ${stat.detail ? `<p class="text-sm text-white/60 leading-relaxed">${formatMultiline(stat.detail)}</p>` : ""}
        </div>`
      )
      .join("\n");
  }
  if (pillarsTitle) pillarsTitle.textContent = data.pillarsTitle ?? "How we coach and care";
  if (pillarsSubtitle) pillarsSubtitle.innerHTML = formatMultiline(data.pillarsSubtitle ?? "");
  if (pillars) {
    pillars.innerHTML = (data.pillars ?? [])
      .map(
        (item) => `
        <div class="glass card-hover rounded-3xl p-6 h-full space-y-3">
          <div class="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
            <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h3 class="text-xl font-semibold text-white">${escapeHtml(item.title ?? "Pillar")}</h3>
          <p class="text-white/60 leading-relaxed">${formatMultiline(item.description ?? "")}</p>
        </div>`
      )
      .join("\n");
  }
  if (initiativesTitle) initiativesTitle.textContent = data.initiativesTitle ?? "Programs & pathways";
  if (initiativesSubtitle) initiativesSubtitle.innerHTML = formatMultiline(data.initiativesSubtitle ?? "");
  if (initiatives) {
    initiatives.innerHTML = (data.initiatives ?? [])
      .map(
        (item) => `
        <div class="glass card-hover rounded-3xl p-6 relative overflow-hidden h-full">
          <div class="absolute top-0 right-0 w-20 h-20 ${item.tag ? "bg-primary/10" : "bg-accent/10"} rounded-full blur-2xl"></div>
          <div class="relative space-y-3">
            ${item.tag ? `<span class="inline-flex items-center text-xs text-primary rounded-full border border-primary/40 bg-primary/10 px-3 py-1">${escapeHtml(item.tag)}</span>` : ""}
            <h3 class="text-xl font-semibold text-white">${escapeHtml(item.title ?? "Program")}</h3>
            <p class="text-white/60 leading-relaxed">${formatMultiline(item.description ?? "")}</p>
          </div>
        </div>`
      )
      .join("\n");
  }
}

function renderMerchContent() {
  const merch = window.siteContent.merch;
  const merchPage = window.siteContent.pages?.merch ?? {};
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = formatMultiline(value ?? "");
  };
  setText("merch-hero-tag", merchPage.heroTag);
  setText("merch-hero-title", merchPage.heroTitle);
  setText("merch-hero-highlight", merchPage.heroHighlight);
  setText("merch-store-tag", merchPage.storeTag);
  setText("merch-store-title", merchPage.storeTitle);
  setText("merch-store-highlight", merchPage.storeHighlight);
  const blurb = document.getElementById("merch-blurb");
  const store = document.getElementById("merch-store-link");
  if (blurb) blurb.innerHTML = formatMultiline(merch?.blurb ?? "");
  if (store && merch?.storeUrl) store.href = merch.storeUrl;
  setText("merch-store-description", merchPage.storeDescription);
  const pillars = document.getElementById("merch-pillars");
  if (pillars) {
    pillars.innerHTML = (merchPage.pillars || [])
      .map(
        (pillar) => `
        <div class="text-center">
          <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-2">
            <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <p class="text-sm text-white/60">${pillar}</p>
        </div>
      `
      )
      .join("\n");
  }
  if (store) {
    store.innerHTML = `${merchPage.ctaLabel || "Go to merch store"} <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>`;
  }
}

function renderCoachesContent() {
  const coaches = window.siteContent.coaches;
  const coachesPage = window.siteContent.pages?.coaches ?? {};
  const blurb = document.getElementById("coaches-blurb");
  if (blurb) blurb.innerHTML = formatMultiline(coaches?.blurb ?? "");
  const resourcesContainer = document.getElementById("coaches-resources");
  if (resourcesContainer) {
    const resources = coachesPage.resources || [];
    resourcesContainer.innerHTML = resources
      .map(
        (item) => `
        <div class="glass card-hover rounded-3xl p-8 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-24 h-24 ${item.title === "Templates" ? "bg-accent/10" : "bg-primary/10"} rounded-full blur-2xl"></div>
            <div class="relative">
              <div class="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                <svg class="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              </div>
              <h2 class="text-2xl font-bold text-white mb-3">${item.title || "Resource"}</h2>
              <p class="text-white/60 mb-6">${formatMultiline(item.description || "")}</p>
              <a href="${item.href || "#"}" class="inline-flex items-center gap-2 text-primary font-medium group">
                ${item.ctaLabel || "Open"} 
                <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </a>
          </div>
        </div>
      `
      )
      .join("\n");
  }
  const ctaTag = document.getElementById("coaches-cta-tag");
  const ctaTitle = document.getElementById("coaches-cta-title");
  const ctaHighlight = document.getElementById("coaches-cta-highlight");
  const ctaDesc = document.getElementById("coaches-cta-desc");
  const ctaBtn = document.getElementById("coaches-cta-button");
  if (ctaTag) ctaTag.textContent = coachesPage.ctaTag ?? "Get Involved";
  if (ctaTitle) ctaTitle.textContent = coachesPage.ctaTitle ?? "Want to";
  if (ctaHighlight) ctaHighlight.textContent = coachesPage.ctaHighlight ?? "Coach?";
  if (ctaDesc) ctaDesc.innerHTML = formatMultiline(coachesPage.ctaDescription ?? "");
  if (ctaBtn) {
    ctaBtn.innerHTML = `${coachesPage.ctaLabel ?? "Contact us"} <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>`;
    ctaBtn.href = coachesPage.ctaHref ?? "mailto:coaching@westbasketball.com.au";
  }
}

function renderHero() {
  const hero = window.siteContent.hero ?? {};
  const home = window.siteContent.pages?.home ?? {};
  const heading = document.getElementById("hero-title");
  const highlight = document.getElementById("hero-highlight");
  const kicker = document.getElementById("home-hero-kicker");
  const sub = document.getElementById("hero-sub");
  const primary = document.getElementById("hero-primary");
  const secondary = document.getElementById("hero-secondary");
  if (kicker) kicker.textContent = home.heroKicker ?? "";
  if (heading) heading.textContent = home.heroTitle ?? hero.headline ?? "";
  if (highlight) highlight.textContent = home.heroHighlight ?? "";
  if (sub) sub.innerHTML = formatMultiline(hero.subhead ?? "");
  if (primary && hero.primaryCta) {
    primary.innerHTML = `${hero.primaryCta.label} <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>`;
    primary.href = hero.primaryCta.href;
  }
  if (secondary && hero.secondaryCta) {
    secondary.textContent = hero.secondaryCta.label;
    secondary.href = hero.secondaryCta.href;
  }
}

function renderGallery(targetId) {
  const el = document.getElementById(targetId);
  if (!el) return;
  const gallery = window.siteContent.gallery ?? [];
  const galleryPage = window.siteContent.pages?.gallery ?? {};
  const orderMode = galleryPage.orderMode ?? "fixed";
  const renderOrder = gallery.slice();
  if (orderMode === "random") {
    for (let i = renderOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [renderOrder[i], renderOrder[j]] = [renderOrder[j], renderOrder[i]];
    }
  }
  window.galleryRenderOrder = renderOrder;
  el.innerHTML = renderOrder
    .map(
      (photo, index) => `
        <div class="gallery-item glass card-hover rounded-2xl overflow-hidden cursor-pointer" onclick="openLightbox(${index})">
          <div class="relative aspect-[4/3] overflow-hidden">
            <img src="${photo.src}" alt="${photo.caption}" class="w-full h-auto max-h-full object-contain bg-black/40 transition-transform duration-500 hover:scale-105" loading="lazy" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
              <div class="absolute bottom-0 left-0 right-0 p-4">
                <span class="inline-block px-3 py-1 text-xs rounded-full bg-primary/20 text-primary mb-2">${photo.category ?? 'Photo'}</span>
                <p class="text-white font-medium">${photo.caption ?? ''}</p>
              </div>
            </div>
          </div>
        </div>`
    )
    .join("\n");
}

function initContactModal() {
  if (window.contactModalControls) {
    window.contactModalControls.bindTriggers();
    return window.contactModalControls;
  }

  const resolveContactApiBase = () => {
    if (window.CONTACT_API_BASE) return window.CONTACT_API_BASE;
    if (location.port && location.port !== "8000") {
      return `${location.protocol}//${location.hostname}:8000`;
    }
    return "";
  };

  const modal = document.createElement("div");
  modal.id = "contact-modal";
  modal.className = "fixed inset-0 z-[120] hidden";
  modal.innerHTML = `
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" data-modal-close></div>
    <div class="relative min-h-full flex items-center justify-center py-10 px-4">
      <div class="glass rounded-3xl p-8 max-w-xl w-full shadow-2xl relative" id="contact-modal-card">
        <button type="button" class="absolute top-4 right-4 text-white/60 hover:text-white" aria-label="Close contact form" data-modal-close>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <div id="contact-modal-body" class="space-y-6">
          <div>
            <p class="text-xs uppercase tracking-[0.3em] text-primary">Contact</p>
            <h3 class="text-2xl font-bold text-white">Send us a message</h3>
            <p class="text-white/60 text-sm">We'll reply to the email you provide.</p>
          </div>
          <form id="contact-modal-form" class="space-y-4">
            <input type="hidden" id="contact-modal-subject" value="Website enquiry" />
            <div class="space-y-2">
              <label class="text-sm text-white/70" for="contact-name">Name</label>
              <input id="contact-name" name="name" class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-primary/60 outline-none" placeholder="Your name" required />
            </div>
            <div class="space-y-2">
              <label class="text-sm text-white/70" for="contact-email">Email</label>
              <input id="contact-email" name="email" type="email" class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-primary/60 outline-none" placeholder="you@email.com" required />
            </div>
            <div class="space-y-2">
              <label class="text-sm text-white/70" for="contact-message">Message</label>
              <textarea id="contact-message" name="message" rows="4" class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-primary/60 outline-none resize-none" placeholder="How can we help?" required></textarea>
            </div>
            <div id="contact-modal-status" class="text-sm h-5 text-white/70"></div>
            <div class="flex items-center justify-end gap-3">
              <button type="button" class="px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:text-white" data-modal-close>Cancel</button>
              <button id="contact-modal-submit" type="submit" class="btn-primary px-6 py-3 rounded-xl text-white font-semibold">Send message</button>
            </div>
          </form>
        </div>
        <div id="contact-modal-loader" class="hidden flex flex-col items-center gap-3 py-10 text-center">
          <svg class="w-10 h-10 animate-spin text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke-width="4"></circle><path class="opacity-75" stroke-width="4" d="M4 12a8 8 0 018-8"></path></svg>
          <p class="text-white/80">Sending your message...</p>
        </div>
        <div id="contact-modal-success" class="hidden flex flex-col items-center gap-4 py-10 text-center">
          <div class="w-16 h-16 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center">
            <svg class="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <div class="space-y-2">
            <h3 class="text-2xl font-bold text-white">Message sent</h3>
            <p class="text-white/70 max-w-sm">Thanks for reaching out. A confirmation email is on its way to you.</p>
          </div>
          <button id="contact-modal-success-close" class="btn-primary px-6 py-3 rounded-xl text-white font-semibold">Close</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const form = modal.querySelector("#contact-modal-form");
  const submitBtn = modal.querySelector("#contact-modal-submit");
  const statusEl = modal.querySelector("#contact-modal-status");
  const subjectInput = modal.querySelector("#contact-modal-subject");
  const closeEls = modal.querySelectorAll("[data-modal-close]");
  const nameInput = modal.querySelector("#contact-name");
  const emailInput = modal.querySelector("#contact-email");
  const messageInput = modal.querySelector("#contact-message");
  const successCloseBtn = modal.querySelector("#contact-modal-success-close");
  const bodySection = modal.querySelector("#contact-modal-body");
  const loaderSection = modal.querySelector("#contact-modal-loader");
  const successSection = modal.querySelector("#contact-modal-success");

  const setStatus = (type, text) => {
    statusEl.textContent = text || "";
    const base = "text-sm h-5";
    if (!text) {
      statusEl.className = `${base} text-white/70`;
    } else if (type === "error") {
      statusEl.className = `${base} text-red-400`;
    } else {
      statusEl.className = `${base} text-primary`;
    }
  };

  const showState = (state) => {
    bodySection.classList.toggle("hidden", state !== "form");
    loaderSection.classList.toggle("hidden", state !== "loading");
    successSection.classList.toggle("hidden", state !== "success");
  };

  const closeModal = () => {
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    form.reset();
    showState("form");
    setStatus("", "");
  };

  const openModal = (subject) => {
    if (subject) {
      subjectInput.value = subject;
    }
    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
    setTimeout(() => nameInput?.focus(), 50);
  };

  closeEls.forEach((btn) => btn.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal();
  }));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();
    const subject = subjectInput.value.trim() || "Website enquiry";

    if (!name || !email || !message) {
      setStatus("error", "Please fill in name, email, and message.");
      return;
    }

    showState("loading");
    setStatus("", "");

    try {
      const apiBase = (resolveContactApiBase() || "").replace(/\/$/, "");
      const resp = await fetch(`${apiBase}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, subject })
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || data.error) {
        throw new Error(data.error || "Unable to send your message right now.");
      }
      showState("success");
    } catch (err) {
      showState("form");
      setStatus("error", err.message || "Something went wrong. Please try again.");
    }
  });

  if (successCloseBtn) {
    successCloseBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal();
    });
  }

  const bindTriggers = () => {
    const triggers = document.querySelectorAll("[data-contact-trigger], .contact-modal-trigger");
    triggers.forEach((trigger) => {
      if (trigger.dataset.contactBound === "true") return;
      trigger.dataset.contactBound = "true";
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        const subject = trigger.dataset.contactSubject || trigger.textContent?.trim() || "Contact";
        openModal(subject);
      });
    });
  };

  bindTriggers();
  window.contactModalControls = { openModal, closeModal, bindTriggers };
  return window.contactModalControls;
}

function refreshContent() {
  window.siteContent = loadSiteData();
}

