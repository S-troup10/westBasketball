// Shared site data and helpers for the club pages
// Uses localStorage so the admin page can tweak content without a backend.

const defaultSiteData = {
  club: {
    name: "West Basketball Club",
    shortName: "West Basketball",
    tagline: "Building players, community, and a lifelong love of the game.",
    homeIntro:
      "Welcome to West Basketball Club. We develop players of every age with a focus on teamwork, effort, and fun."
  },
  navigation: {
    adminLabel: "Admin",
    links: [
      { label: "Home", href: "index.html", key: "home" },
      { label: "About", href: "about.html", key: "about" },
      { label: "Gallery", href: "gallery.html", key: "gallery" },
      { label: "Join", href: "join.html", key: "join" },
      { label: "Merchandise", href: "merchandise.html", key: "merch" },
      { label: "Coaches", href: "coaches.html", key: "coaches" },
      { label: "Sponsors", href: "sponsors.html", key: "sponsors" }
    ]
  },
  footer: {
    quickLinks: [
      { label: "About Us", href: "about.html" },
      { label: "Join the Club", href: "join.html" },
      { label: "Coaches", href: "coaches.html" },
      { label: "Merchandise", href: "merchandise.html" }
    ],
    connectLinks: [
      { label: "Contact Us", href: "about.html#contact" },
      { label: "Become a Sponsor", href: "sponsors.html" },
      { label: "Admin Portal", href: "admin.html" }
    ],
    quickLinksTitle: "Quick Links",
    connectTitle: "Connect",
    tagline: "Youth basketball in Newcastle",
    note: "Built for families, players, and the community."
  },
  images: {
    heroBackground: "U12-Knights.jpg",
    logo: "logo.png"
  },
  gallery: [
    { src: "U12-Knights.jpg", caption: "U12 Knights Team Photo", category: "Teams" },
    { src: "U14-West-Raiders.jpg", caption: "U14 West Raiders", category: "Teams" }
  ],
  hero: {
    headline: "Where Champions Are Made",
    subhead:
      "From U8s starting out to U18s chasing championships, we're here to teach skills, values, and love for the game.",
    primaryCta: { label: "Join the club", href: "join.html" },
    secondaryCta: { label: "Meet our coaches", href: "coaches.html" }
  },
  news: [
    {
      title: "Winter season registrations now open",
      date: "Feb 26",
      summary: "Secure your spot for U8-U18 competitions. Early bird closes March 15.",
      url: "join.html"
    },
    {
      title: "Holiday skills camp announced",
      date: "Jan 30",
      summary: "Three-day camp with guest coaches focusing on shooting and decision making.",
      url: "about.html"
    }
  ],
  quickLinks: [
    { label: "Fixtures", href: "https://example.com/fixtures" },
    { label: "Merch Store", href: "merchandise.html" },
    { label: "Training Schedule", href: "https://example.com/training" },
    { label: "West Basketball Values", href: "about.html#values" },
    { label: "Newcastle Basketball", href: "https://www.newcastlebasketball.com.au" },
    { label: "Contact Us", href: "about.html#contact" }
  ],
  sponsors: [
    {
      name: "Summit Sport",
      logo: "https://dummyimage.com/240x110/0f172a/22d3ee&text=Summit+Sport",
      url: "https://example.com"
    },
    {
      name: "Coastline Physio",
      logo: "https://dummyimage.com/240x110/0f172a/a855f7&text=Coastline+Physio",
      url: "https://example.com"
    },
    {
      name: "Nova Energy",
      logo: "https://dummyimage.com/240x110/0f172a/f59e0b&text=Nova+Energy",
      url: "https://example.com"
    }
  ],
  about: {
    intro:
      "West Basketball Club is run by volunteers and parents who want the court to feel like home. We teach footwork, spacing, decision-making, and the life skills that come with being on a team. From first dribble to representative trials, families get clear plans, feedback, and a club culture that backs every player.",
    values: [
      "Effort first - sprint back, dive for loose balls, finish plays",
      "Respect for teammates, opponents, and officials",
      "Game sense over set plays so players can read and react",
      "Clear communication and positive sideline voices",
      "Safety and belonging for every family, every week",
      "Celebrate progress, not just the scoreboard"
    ],
    history:
      "Started with a single junior team, the club now supports dozens of squads across age groups with pathways into senior competitions.\nWe host pre-season grading, coach development nights, and club days that link minis through to youth league.",
    lifeMembers: ["Alex Jensen", "Sam Lee", "Taylor Morgan", "Riley Cooper", "Jordan Matthews"],
    photos: ["U12-Knights.jpg", "U14-West-Raiders.jpg"],
    snapshotTitle: "Club at a glance",
    snapshotSubtitle: "What it takes to keep the green and white moving each week.",
    snapshotStats: [
      { value: "420+", label: "Players registered", detail: "Across U8-U18 community and competition teams." },
      { value: "38", label: "Teams on court", detail: "Graded squads with dedicated coaches and managers." },
      { value: "110", label: "Volunteer coaches & managers", detail: "WWCC cleared, mentored, and resourced each term." },
      { value: "14", label: "Training courts weekly", detail: "Across school gyms, local rec centres, and outdoor courts." }
    ],
    pillarsTitle: "How we coach and care",
    pillarsSubtitle: "Every age group follows the same principles so players know what to expect.",
    pillars: [
      { title: "Player-first development", description: "Reps before results, clear teaching points, and feedback every night on court." },
      { title: "Connected teams", description: "Shared language, simple playbooks, and parent comms that keep everyone aligned." },
      { title: "Safe, welcoming culture", description: "WWCC-verified staff, codes of conduct, and zero tolerance for ugly sidelines." }
    ],
    initiativesTitle: "Programs & pathways",
    initiativesSubtitle: "Support that extends past Saturday games.",
    initiatives: [
      { title: "Skills Lab", tag: "Weekly", description: "Open gym-style sessions with shooting, ball-handling, and decision-making blocks for every age group." },
      { title: "Rep Readiness", tag: "Pathway", description: "Small group workouts and film breakdowns for players chasing representative and school squad spots." },
      { title: "Family Support", tag: "Community", description: "Fee assistance, gear swaps, transport help, and volunteer buddies so every kid can stay on court." }
    ]
  },
  join: {
    u8u10:
      "Our U8 and U10 programs focus on fundamentals and fun. Short games, high ball touches, and coaches who prioritise encouragement.",
    juniors:
      "Junior squads (U12-U18) train weekly with structured plans for skills, decision making, and fitness. Grading and team lists are updated each season."
  },
  merch: {
    blurb:
      "Players must wear club shorts and reversible singlets on game day. Training singlets and hoodies are optional but encouraged for warm-up.",
    storeUrl: "https://example.com/merch"
  },
  coaches: {
    blurb:
      "Our coaches create safe, competitive, and supportive sessions. They follow club practice plans and development templates so every age group grows consistently.",
    guideUrl: "https://example.com/coaching-guide.pdf",
    templatesUrl: "https://example.com/coaching-templates.zip"
  },
  pages: {
    home: {
      heroKicker: "Youth Basketball in Newcastle",
      heroTitle: "Where Champions",
      heroHighlight: "Are Made",
      storyTag: "Our Club",
      storyTitle: "More than game day",
      storySubtitle: "Three snapshots of who we are, where we've been, and how we celebrate our people.",
      storyBlocks: [
        {
          tag: "History",
          title: "From one team to a club",
          summary: "Started with weekend runs at the local rec centre; now dozens of squads with shared language and standards.",
          bullets: [
            "Built by parents, volunteers, and players who wanted a safe home court",
            "Grading, coach mentoring, and club days to connect age groups",
            "Training plans that ladder skills from minis through youth league"
          ]
        },
        {
          tag: "Last Season",
          title: "2024 wrap-up",
          summary: "Packed courts, new referees, and teams stepping up divisions.",
          bullets: [
            "38 teams on court each weekend with consistent attendance",
            "U12 and U14 squads promoted after mid-season review",
            "Introduced game-day captains to lead huddles and sportsmanship"
          ]
        },
        {
          tag: "Awards",
          title: "Celebrating our people",
          summary: "End-of-season night that thanks players, coaches, refs, and families.",
          bullets: [
            "Club Values medals for effort, respect, and team-first mindset",
            "Volunteer of the Year for court setup, scorebench, and comms support",
            "Coach recognition for athlete care, clear teaching, and calm sidelines"
          ]
        }
      ],
      programsTag: "Programs",
      programsTitle: "Pathways for Every Player",
      programs: [
        {
          title: "U8-U10 Foundations",
          badge: "Beginners",
          description: "High-touch coaching, fun drills, and lots of ball touches to build confidence and love for the game.",
          ctaLabel: "Learn more",
          ctaHref: "join.html#u8u10"
        },
        {
          title: "Juniors U12-U18",
          badge: "Competition",
          description: "Structured training blocks, game IQ development, and fitness to compete at the highest level.",
          ctaLabel: "Learn more",
          ctaHref: "join.html#juniors"
        }
      ],
      galleryTag: "Gallery",
      galleryTitle: "On Court & In the Stands",
      gallerySubtitle: "Look inside our courts and community.",
      featuredPhotos: [
        { src: "U12-Knights.jpg", title: "Fast breaks and teamwork at training night", subtitle: "U12 Knights in action" },
        { src: "U14-West-Raiders.jpg", title: "Pre-game huddles", subtitle: "U14 West Raiders" }
      ],
      quote: {
        text: "\"West feels like family. Coaches are supportive and my kid loves every session.\"",
        attribution: "- Local Parent"
      },
      newsTag: "Latest",
      newsTitle: "Club News",
      linksTag: "Navigate",
      linksTitle: "Quick Links",
      linksCardTitle: "Game Day Essentials",
      linksCardText: "Uniform? Check. Drink bottle? Check. Be early, be loud, be respectful.",
      sponsorsTag: "Partners",
      sponsorsTitle: "Our Sponsors",
      sponsorsDescription: "We're grateful for the partners who keep our programs running strong.",
      sponsorsCtaLabel: "Become a sponsor",
      sponsorsCtaHref: "sponsors.html",
      ctaTag: "Ready to play?",
      ctaTitle: "Join West Basketball",
      ctaHighlight: "Today",
      ctaDescription: "Pick your age group, grab a uniform, and we'll see you on court. Coaches and volunteers always welcome.",
      ctaPrimary: { label: "Register Now", href: "join.html" },
      ctaSecondary: { label: "Volunteer With Us", href: "coaches.html" }
    },
    about: {
      heroTag: "Our Story",
      heroTitle: "About",
      heroHighlight: "West Basketball",
      historyTitle: "Our History",
      valuesTitle: "Our Values",
      lifeMembersTitle: "Life Members",
      lifeDescription: "Honoring those who have made lasting contributions to our club.",
      extraTag: "Club Story",
      extraTitle: "Why We Play",
      extraText: "Add a short paragraph about the club here.",
      contactTag: "Get in Touch",
      contactTitle: "Contact",
      contactHighlight: "Us",
      contactDescription: "Have questions about joining, volunteering, or sponsoring? We'd love to hear from you.",
      contactCtaLabel: "Send us an email",
      contactCtaHref: "mailto:info@westbasketball.com"
    },
    join: {
      heroTag: "Join Us",
      heroTitle: "Join the",
      heroHighlight: "Club",
      heroDescription: "Choose the right stream for your player. We have programs for every age and skill level.",
      signUpLabel: "Sign up",
      signUpHref: "https://example.com/register",
      streams: [
        {
          id: "u8u10",
          title: "U8 & U10",
          badge: "Beginners",
          description:
            "Our U8 and U10 programs focus on fundamentals and fun. Short games, high ball touches, and coaches who prioritise encouragement.",
          steps: [
            "Click “Register” and select U8 or U10",
            "Choose your preferred training night",
            "Confirm parent contact and medical details",
            "Check your inbox for season start date"
          ]
        },
        {
          id: "juniors",
          title: "Juniors (U12-U18)",
          badge: "Competition",
          description:
            "Junior squads (U12-U18) train weekly with structured plans for skills, decision making, and fitness. Grading and team lists are updated each season.",
          steps: [
            "Pick your age group and fill in player details",
            "Nominate training preferences and positions",
            "Upload any clearance forms if switching clubs",
            "Review grading session times sent after signup"
          ]
        }
      ],
      helpTag: "Support",
      helpTitle: "Need Help?",
      helpText: "If you need payment plans or have accessibility needs, reach out. We want everyone to play.",
      helpCtaLabel: "Talk to us",
      helpCtaHref: "about.html#contact"
    },
    merch: {
      heroTag: "Merchandise",
      heroTitle: "Uniforms &",
      heroHighlight: "Gear",
      storeTag: "Official Store",
      storeTitle: "Shop",
      storeHighlight: "Now",
      storeDescription: "Order singlets, shorts, hoodies, and accessories online. Rep the club colors with pride!",
      pillars: ["Quality", "Fast Delivery", "Club Pride"],
      ctaLabel: "Go to merch store"
    },
    coaches: {
      heroTag: "Coaches",
      heroTitle: "Coaching at",
      heroHighlight: "West Basketball",
      resources: [
        {
          title: "Coaching Guide",
          description: "Session plans, game-day expectations, and safety info for all coaches.",
          ctaLabel: "Open guide",
          href: "https://example.com/coaching-guide.pdf"
        },
        {
          title: "Templates",
          description: "Printable drills, warm-ups, and development trackers for your sessions.",
          ctaLabel: "Download templates",
          href: "https://example.com/coaching-templates.zip"
        }
      ],
      ctaTag: "Get Involved",
      ctaTitle: "Want to",
      ctaHighlight: "Coach?",
      ctaDescription: "We support new and experienced coaches with resources and mentoring. Reach out to get involved.",
      ctaLabel: "Contact us",
      ctaHref: "mailto:coaching@westbasketball.com.au"
    },
    sponsors: {
      heroTag: "Partners",
      heroTitle: "Thank You to Our",
      heroHighlight: "Sponsors",
      heroDescription: "We proudly display sponsor logos on the home page. Add or remove partners in the admin panel.",
      ctaTag: "Partner With Us",
      ctaTitle: "Become a",
      ctaHighlight: "Sponsor",
      ctaDescription: "We offer court signage, jersey placements, and digital promotion. Let's build something great for local basketball.",
      ctaLabel: "Get in touch",
      ctaHref: "mailto:sponsorship@westbasketball.com.au",
      features: ["Brand Visibility", "Community Impact", "Jersey Placement", "Digital Promotion"]
    },
    gallery: {
      heroTag: "Our Moments",
      heroTitle: "Photo",
      heroHighlight: "Gallery",
      heroDescription: "Capturing the spirit, teamwork, and memorable moments of West Basketball Club.",
      orderMode: "fixed",
      allLabel: "All Photos",
      emptyTitle: "No photos yet",
      emptyDescription: "Photos can be added through the admin panel."
    }
  }
};

// API base for the tiny server (change to your deployed server URL or leave blank for same-origin)
const API_BASE = typeof window !== "undefined" && window.API_BASE ? window.API_BASE : "http://localhost:8000";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function deepMerge(base, override) {
  if (!override) return JSON.parse(JSON.stringify(base));
  if (Array.isArray(base)) {
    const merged = [];
    const overrideArr = Array.isArray(override) ? override : [];
    const max = Math.max(base.length, overrideArr.length);
    for (let i = 0; i < max; i++) {
      const baseVal = base[i];
      const overVal = overrideArr[i];
      if (typeof baseVal === "object" && baseVal !== null && typeof overVal === "object" && overVal !== null && !Array.isArray(overVal)) {
        merged.push(deepMerge(baseVal, overVal));
      } else if (overVal !== undefined) {
        merged.push(overVal);
      } else if (baseVal !== undefined) {
        merged.push(JSON.parse(JSON.stringify(baseVal)));
      }
    }
    return merged;
  }

  const result = { ...base };
  Object.keys(override || {}).forEach((key) => {
    const baseVal = base ? base[key] : undefined;
    const overVal = override[key];
    if (Array.isArray(overVal)) {
      result[key] = deepMerge(Array.isArray(baseVal) ? baseVal : [], overVal);
    } else if (typeof overVal === "object" && overVal !== null) {
      result[key] = deepMerge(typeof baseVal === "object" && baseVal !== null ? baseVal : {}, overVal);
    } else if (overVal !== undefined) {
      result[key] = overVal;
    }
  });
  return result;
}

function loadSiteData() {
  try {
    const cached = localStorage.getItem("clubSiteData");
    if (cached) {
      return deepMerge(defaultSiteData, JSON.parse(cached));
    }
  } catch (err) {
    console.warn("Could not read saved site data", err);
  }
  return JSON.parse(JSON.stringify(defaultSiteData));
}

function isQuotaError(err) {
  if (!err) return false;
  const name = err.name || "";
  const message = err.message || "";
  return (
    name === "QuotaExceededError" ||
    name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    /quota/i.test(message)
  );
}

function stripDataUrls(data) {
  const clone = JSON.parse(JSON.stringify(data));
  const isDataUrl = (value) => typeof value === "string" && value.trim().startsWith("data:");

  if (clone.images) {
    if (isDataUrl(clone.images.heroBackground)) delete clone.images.heroBackground;
    if (isDataUrl(clone.images.logo)) delete clone.images.logo;
  }

  if (Array.isArray(clone.gallery)) {
    clone.gallery = clone.gallery.filter((item) => item && !isDataUrl(item.src));
  }

  if (clone.about && Array.isArray(clone.about.photos)) {
    clone.about.photos = clone.about.photos.filter((src) => !isDataUrl(src));
  }

  if (clone.pages?.home?.featuredPhotos) {
    clone.pages.home.featuredPhotos = clone.pages.home.featuredPhotos.filter((photo) => !isDataUrl(photo.src));
  }

  return clone;
}

function saveSiteData(data) {
  try {
    localStorage.setItem("clubSiteData", JSON.stringify(data));
    localStorage.setItem("clubSiteDataFetchedAt", Date.now().toString());
    window.siteContent = data;
    return { ok: true, truncated: false };
  } catch (err) {
    if (isQuotaError(err)) {
      const stripped = stripDataUrls(data);
      try {
        localStorage.removeItem("clubSiteData");
        localStorage.setItem("clubSiteData", JSON.stringify(stripped));
        localStorage.setItem("clubSiteDataFetchedAt", Date.now().toString());
        window.siteContent = data;
        return { ok: true, truncated: true };
      } catch (innerErr) {
        console.warn("Could not save site data after trimming large assets", innerErr);
        window.siteContent = data;
        return { ok: false, truncated: true, error: innerErr };
      }
    }
    console.warn("Could not save site data", err);
    window.siteContent = data;
    return { ok: false, truncated: false, error: err };
  }
}

function resetSiteData() {
  localStorage.removeItem("clubSiteData");
  window.siteContent = JSON.parse(JSON.stringify(defaultSiteData));
}

async function fetchRemoteSiteData() {
  try {
    const lastFetched = parseInt(localStorage.getItem("clubSiteDataFetchedAt") || "0", 10);
    const age = Date.now() - lastFetched;
    const hasCachedData = !!localStorage.getItem("clubSiteData");
    if (hasCachedData && age < CACHE_TTL_MS) {
      return; // Use cached data within TTL
    }

    const res = await fetch(`${API_BASE}/api/content`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Remote fetch failed: ${res.status}`);
    const remote = await res.json();
    const merged = deepMerge(defaultSiteData, remote);
    saveSiteData(merged);
    window.dispatchEvent(new Event("sitecontent:updated"));
  } catch (err) {
    console.warn("Remote site data unavailable; using local copy", err);
  }
}

// expose the data immediately for page scripts, then try to hydrate from remote gist
window.siteContent = loadSiteData();
fetchRemoteSiteData();
