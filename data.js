// Shared site data and helpers for the club pages
// Uses localStorage so the admin page can tweak content without a backend.

const defaultSiteData = {
  club: {
    name: "West Basketball Newcastle",
    shortName: "West Basketball Newcastle",
    tagline: "Building Skills, Confidence and Community",
    homeIntro:
      "Welcome to West Basketball Club. We develop players of every age with a focus on teamwork, effort, and fun."
  },
  navigation: {
    adminLabel: "Admin",
    links: [
      { label: "Home", href: "index.html", key: "home" },
      { label: "Join", href: "join.html", key: "join" },
      { label: "Training", href: "training.html", key: "training" },
      { label: "Coaching", href: "coaches.html", key: "coaches" },
      { label: "Merchandise", href: "merchandise.html", key: "merch" },
      { label: "Gallery", href: "gallery.html", key: "gallery" },
      { label: "Sponsors", href: "sponsors.html", key: "sponsors" },
      { label: "About", href: "about.html", key: "about" },
      { label: "Quick Links", href: "index.html#news", key: "quick-links" }
    ]
  },
  footer: {
    quickLinks: [
      { label: "Join the Club", href: "join.html" },
      { label: "Training", href: "training.html" },
      { label: "Coaching", href: "coaches.html" },
      { label: "Merchandise", href: "merchandise.html" }
    ],
    connectLinks: [
      { label: "Contact Us", href: "about.html#contact" },
      { label: "Become a Sponsor", href: "sponsors.html" },
      { label: "Admin Portal", href: "admin.html" },
      { label: "Facebook", href: "https://facebook.com" }
    ],
    quickLinksTitle: "Quick Links",
    connectTitle: "Connect",
    tagline: "Building Skills, Confidence and Community",
    note: "Built for families, players, and the community."
  },
  images: {
    heroBackground: "images/U14-West-Raiders.jpg",
    logo: "images/logo.png"
  },
  gallery: [
    { src: "images/U12-Knights.jpg", caption: "", category: "Teams" },
    { src: "images/U14-West-Raiders.jpg", caption: "", category: "Teams" },
    { src: "images/mini-hoops.jpg", caption: "", category: "Teams" },
    { src: "images/u10s.jpg", caption: "", category: "Teams" },
    { src: "images/prez.jpg", caption: "", category: "Presentation Day" },
    { src: "images/prezq.jpg", caption: "", category: "Presentation Day" },
    { src: "images/awards.jpg", caption: "", category: "Presentation Day" }
  ],
  hero: {
    headline: "Building skills,",
    subhead:
      "We are committed to creating an inclusive, safe and enjoyable environment for junior basketball players and their families in Newcastle, helping them reach their potential while learning teamwork, fair play and respect.",
    primaryCta: { label: "Join the Club", href: "join.html" },
    secondaryCta: { label: "", href: "" }
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
    { label: "West Basketball Values", href: "about.html#values" },
    { label: "Newcastle Basketball", href: "https://www.newcastlebasketball.com.au" },
    { label: "News", href: "index.html#news" },
    { label: "Contact Us", href: "about.html#contact" }
  ],
  sponsors: [
    {
      name: "iAthletic",
      logo: "https://dummyimage.com/240x110/0f172a/22d3ee&text=iAthletic",
      url: "https://iathletic.com.au"
    },
    {
      name: "West Group",
      logo: "https://dummyimage.com/240x110/0f172a/34d399&text=West+Group",
      url: "https://example.com"
    },
    {
      name: "Major Uniform Sponsors (TBC)",
      logo: "https://dummyimage.com/240x110/0f172a/f59e0b&text=Major+Sponsors+TBC",
      url: "https://example.com"
    }
  ],
  about: {
    intro:
      "West Basketball Newcastle is one of the largest and oldest basketball clubs in Newcastle, with a history spanning 60 years.\nWe provide opportunities for players aged U8 to U18 in healthy, safe, and fun basketball activities within a family-oriented environment. Our club is run by a group of passionate and committed individuals who have overseen the club doubling in size over the past five years. In 2025 we fielded 68 teams in the U12-U18 Winter Competition, and over 20 teams across the U8 and U10 competitions.",
    values: [
      "Inclusive, safe, and enjoyable basketball for every family",
      "Teamwork, fair play, and respect for all",
      "Effort and improvement over results",
      "Positive sideline voices and strong club culture",
      "Player development at every age group",
      "Community connections that last beyond the season"
    ],
    history:
      "We are proud to have many juniors represent across local and state-wide events and development programs including selections for the NSW U12 Jamboree, U14 Australian Club Nationals, U16 & U18 NSW Country teams, BNSW Talented Athlete Program, Southern Cross Challenge and additional BNSW Tournaments.\nMany of our juniors also represent in school regional and state teams across the PSSA, CHS, CIS and CCS programs, as well as the Newcastle Falcons representative program. To find out more about the pathways to higher level representation please reach out to us.",
    lifeMembers: [
      "Al Herrington Volunteer of the Year: Peta Rafty",
      "Junior Club Person of the Year: Poppy Harman",
      "Karen Audet Club Person of the Year: Wendy Blackmore",
      "Eric Harvey Junior Coach of the Year: Kiara Barr",
      "Club Coach of the Year: Angelo Iosif"
    ],
    photos: ["images/U12-Knights.jpg", "images/U14-West-Raiders.jpg"],
    snapshotTitle: "Club at a glance",
    snapshotSubtitle: "A snapshot of West Basketball Newcastle today.",
    snapshotStats: [
      { value: "60+", label: "Years in Newcastle", detail: "One of the oldest and largest clubs in the region." },
      { value: "68", label: "Winter teams in 2025", detail: "U12-U18 teams across divisions." },
      { value: "20+", label: "U8-U10 teams", detail: "Across seasonal competitions." },
      { value: "5", label: "Years of growth", detail: "Club size has doubled in the past five years." }
    ],
    pillarsTitle: "How we support players",
    pillarsSubtitle: "Consistent coaching, clear communication, and a strong community focus.",
    pillars: [
      { title: "Inclusive and safe environments", description: "Programs that keep every player supported and confident on court." },
      { title: "Strong coaching support", description: "Mentoring, resources, and aligned training plans for all teams." },
      { title: "Family-first community", description: "Clear communication, respect, and positive sideline culture." }
    ],
    initiativesTitle: "Representative pathways",
    initiativesSubtitle: "Opportunities that extend beyond club competitions.",
    initiatives: [
      { title: "State & national programs", tag: "Pathway", description: "Support for selections including NSW U12 Jamboree, U14 Club Nationals, and NSW Country squads." },
      { title: "School representation", tag: "Schools", description: "Players represent across PSSA, CHS, CIS, and CCS competitions." },
      { title: "Development programs", tag: "Programs", description: "Pathways through BNSW Talented Athlete Program, Southern Cross Challenge, and other events." }
    ],
    faqs: [
      {
        question: "When will the registrations open for the 2026 season?",
        answer:
          "We expect registrations to open in February, to allow clubs enough time to put together teams, coaches, training schedules, and be ready to start the competition in Term 2. The best way to keep across registrations opening is to follow us (and Newcastle Basketball) on Facebook, or keep an eye on our website where we will share information as it comes to hand. This will include information such as fees, playing nights, dates, and more."
      },
      {
        question: "I would like to play with my friends, how do I arrange that?",
        answer:
          "During the registration process there will be a field where you can add up to three friends you would like to play with (this is the only option the system provides). Please include this information so that when we are forming our teams we can try and accommodate requests where possible. If you have further requests please email us at westbasketballclubnewcastle@gmail.com so we can note this down. Equally, if you don't know anyone else playing or are happy to meet new friends we will find a team for you."
      },
      {
        question: "The registration form asks for \"Registration Division\", how do I answer this?",
        answer:
          "This gives us some information about your playing level and self rated ability. For example, if you are wanting to trial for a Division 1 team (top division), it is important to list Division 1 here so that we add you to our trial lists. If you are currently playing Division 4 in Summer Comp and competing well, then we suggest you put Division 4 or 5 as a preference (winter comp is normally stronger than summer comp with all rep players obligated to play winter). If you are new to the sport and would like to start in a team with other new players, list Division 8. These division preferences are a guide only and your final division may be different, but we will try to keep it as close as possible."
      },
      {
        question: "What game nights will I play or train?",
        answer:
          "Most of our West teams have their training on a Sunday afternoon at Broadmeadow Stadium, but there may be some teams training mid-week depending on coach preference and availability. Game nights will be confirmed by Newcastle Basketball closer to the season start."
      },
      {
        question: "How much are registration fees?",
        answer:
          "In 2025 the winter season fees were $330 for the 18 week season, plus Annual Registration if yours is due: 8-11yrs ($93.50), 12-17yrs ($124.50). Prices for 2026 will be confirmed by Newcastle Basketball when competition information is released (around February)."
      },
      {
        question: "Do I need to buy a uniform?",
        answer:
          "We provide you a West singlet to wear for the season, to be returned after your final game. West shorts (green and red) are required, and there will be an opportunity to purchase them through our merchandise store once competition registrations open."
      },
      {
        question: "I am keen to coach a team, where do I express my interest?",
        answer:
          "Great! Please send us a message via Contact Us. All levels of experience are welcomed. We have experienced club coaches who can help with resources, suggestions, and even a visit to help run a training session for those new to coaching."
      },
      {
        question: "I am interested in helping with the team, but can't commit to coaching, how can I help?",
        answer:
          "Each team requires a team manager, which is a great way to help out. The role helps with setting a team chat, communicating information from the coach around training times and games, handing out singlets at the start of the season, and sharing messages from us. Let us know if you are keen to help."
      },
      {
        question: "When will I find out my team?",
        answer:
          "We aim to have this information released before the April school holidays via direct email. Training will normally start on the final weekend of school holidays, and games start in Week 1 of Term 2. We will also send contact lists to coaches and managers so they can set up a team chat for communications."
      },
      {
        question: "What do I need to do if I want to play for a different club from last year's comp?",
        answer:
          "Unless you are a representative player, you are free to choose your club of choice. There is no need for any formal transfer or request. Just wait until registrations open up at all clubs for new players and register to the club of your choice (all links will be available on Newcastle Basketball's website and social media). We have no issues if players prefer to move to another club. Equally, we are always happy to welcome new players."
      },
      {
        question: "I would love to get more involved in the club, can I help at all?",
        answer:
          "Glad you asked! We would love to have you involved, and welcome all volunteers whether you have a lot of time to give or a little. Our club operations (including season start up and presentation day) run on the fuel of many and are a great way to get involved in a fun and enthusiastic committee. Drop us an email at westbasketballclubnewcastle@gmail.com."
      },
      {
        question: "HELP - I'm having trouble with my Basketball Connect profile, and need some assistance. Can you help?",
        answer:
          "It is best to contact Newcastle Basketball for help with any Basketball Connect profile issues, as they have full access to the backend to resolve issues. We are limited in what we can see beyond player registrations and team allocations. Best to call during business hours on 4961 3185."
      }
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
      "We are proud to be partnering with iAthletic to provide options of high-quality merchandise to our players.\nThe only compulsory item are green and red playing shorts (and if you have shorts from previous years, these are fine to continue wearing). All other merch is optional.\nIMPORTANT\nItems will be shipped to you within a couple of days of ordering, and should arrive within a week, EXCEPT for West Playing Shorts which are custom made for our club. We keep a small stock of shorts for direct sale and will have an ordering period prior to the 2026 season where you can order directly through the website. Please reach out directly to us if you are requiring shorts and we will advise the best option for purchasing.",
    storeUrl: "https://iathletic.com.au/collections/west-basketball"
  },
  coaches: {
    blurb:
      "Our club prides itself on having passionate and committed coaches helping develop the next generation of basketballers. Supported by a strong committee and an experienced head coach, we support coach development and ensure coaches have access to courses and resources to assist with their development and coaching approach, from basic fundamentals through to higher level structured play.",
    guideUrl: "https://example.com/west-coaching-guide.pdf",
    templatesUrl: "https://example.com/west-coaching-templates.zip"
  },
  pages: {
    home: {
      heroKicker: "",
      heroTitle: "Building skills,",
      heroHighlight: "confidence, and community",
      storyTag: "2025 Season",
      storyTitle: "Awards & Results",
      storySubtitle: "Celebrating our people and teams from the 2025 season.",
      storyBlocks: [
        {
          tag: "Awards",
          title: "Celebrating our People",
          summary: "Congratulations to the 2025 winners of our perpetual awards.",
          bullets: [
            "Al Herrington Volunteer of the Year: Peta Rafty",
            "Junior Club Person of the Year: Poppy Harman",
            "Karen Audet Club Person of the Year: Wendy Blackmore",
            "Eric Harvey Junior Coach of the Year: Kiara Barr",
            "Club Coach of the Year: Angelo Iosif"
          ]
        },
        {
          tag: "2025 Season",
          title: "2025 Wrap-up",
          summary: "68 teams competed in the Winter Club Competition, with 23 teams reaching the Grand Final and 10 champions.",
          bullets: [
            "68 teams across the Winter Competition",
            "23 teams reached the Grand Final",
            "10 teams crowned champions"
          ]
        },
        {
          tag: "Champions",
          title: "2025 Winners",
          summary: "Winter Competition champions.",
          bullets: [
            "U12 Div5 West Kings",
            "U14 Div2 West Golden Eagles",
            "U14 Div3 West Gems",
            "U14 Div3 West Speedies",
            "U14 Div4 West Blazers",
            "U16 Div2 West Bulls",
            "U16 Div3 West Rollers",
            "U16 Div4 West Clippers",
            "U16 Div6 West Jayhawks",
            "U18 Div1 West Titans"
          ]
        },
        {
          tag: "Finalists",
          title: "2025 Runners Up",
          summary: "Grand Finalists finishing runners up.",
          bullets: [
            "U12 Div1 West Mystics",
            "U12 Div3 West Pirates",
            "U14 Div1 West Vikings",
            "U14 Div5 West Wolverines",
            "U16 Div1 West Flyers",
            "U16 Div2 West Gladiators",
            "U16 Div3 West Rockets",
            "U16 Div4 West Lynx",
            "U18 Div2 West Magic",
            "U18 Div3 West Flames",
            "U18 Div3 West Rebounders",
            "U18 Div4 West Rangers",
            "U18 Div5 West Chiefs"
          ]
        }
      ],
      programsTag: "Programs",
      programsTitle: "Pathways for every player",
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
      gallerySubtitle: "Capturing the spirit, teamwork, and memorable moments.",
      featuredPhotos: [
        { src: "images/prezq.jpg", title: "", subtitle: "" },
        { src: "images/prez.jpg", title: "", subtitle: "" }
      ],
      quote: {
        text: "\"West feels like family. Coaches are supportive and my kid loves every session.\"",
        attribution: "- Local Parent"
      },
      newsTag: "Latest",
      newsTitle: "Club News",
      linksTag: "Navigate",
      linksTitle: "Quick Links",
      linksCardTitle: "",
      linksCardText: "",
      sponsorsTag: "Partners",
      sponsorsTitle: "Our Sponsors",
      sponsorsDescription: "We're grateful for the partners who keep our programs running strong.",
      sponsorsCtaLabel: "Become a sponsor",
      sponsorsCtaHref: "sponsors.html",
      ctaTag: "Ready to play?",
      ctaTitle: "Join West Basketball",
      ctaHighlight: "Today",
      ctaDescription: "Pick your age group, grab a uniform, and we'll see you on court. Coaches and volunteers always welcome.",
      ctaPrimary: { label: "JOIN A TEAM", href: "join.html" },
      ctaSecondary: { label: "COACH WITH US", href: "coaches.html" },
      ctaTertiary: { label: "CONTACT US", href: "about.html#contact" }
    },
    about: {
      heroTag: "Our Story",
      heroTitle: "About",
      heroHighlight: "West Basketball",
      historyTitle: "Our History",
      valuesTitle: "West Values",
      lifeMembersTitle: "Awards",
      lifeDescription: "Celebrating our people.",
      faqTag: "FAQs",
      faqTitle: "Frequently Asked Questions",
      faqSubtitle: "",
      extraTag: "Pathways",
      extraTitle: "Higher level representation",
      extraText:
        "We are proud of the pathways our players take into representative and school programs. If you would like to know more about development opportunities, please reach out to us.",
      contactTag: "Get in Touch",
      contactTitle: "Contact",
      contactHighlight: "Us",
      contactDescription: "Have questions about joining, volunteering, or sponsoring? We'd love to hear from you.",
      contactCtaLabel: "Send us a message",
      contactCtaHref: "about.html#contact"
    },

    join: {
      heroTag: "Join Us",
      heroTitle: "Join the",
      heroHighlight: "Club",
      heroDescription: "There are plenty of opportunities for juniors in Newcastle to get involved in basketball.",
      featureImage: "images/U12-Knights.jpg",
      featureAlt: "West Basketball family",
      quoteText:
        "A big thank you for welcoming our family to West Basketball and well done on a great season! Moving from interstate was a big move for us, and we have felt so welcomed and are very glad we chose to join such an awesome club!",
      quoteAttribution: "Club family",
      signUpLabel: "Register",
      signUpHref: "",
      streams: [
        {
          id: "u8s",
          title: "U8s",
          badge: "U8s",
          description:
            "This competition is for players turning 5, 6 or 7 during the calendar year. Run on a Saturday morning, players will participate in a 3v3 style of game, with help from on floor coaches and additional skills training throughout the season. The U8s competitions are run each term, and we can ensure friends are kept together on teams - or it is a great chance to make new friends! Keep an eye on our Facebook page and website for registration information towards the end of each term.\nMore information can be found under the Development tab on the Newcastle Basketball website.",
          ctaLabel: "Development info",
          ctaHref: "https://www.newcastlebasketball.com.au/"
        },
        {
          id: "u10s",
          title: "U10s",
          badge: "U10s",
          description:
            "For players turning 8 or 9 during the calendar year, the U10s competition is a great introduction to 5v5 basketball. Played on a Thursday afternoon, each team will have a designated coach and are invited to participate in two skills sessions (held on select Sundays) throughout the term. This competition is run in Term 4, then again in Term 1, followed by a longer winter season to align with the Junior Competition as an 18-week competition during Terms 2 and 3. Keep an eye on our Facebook page and website for registration information as it comes to hand, friend requests will be accommodated where possible.\nMore information can be found under the Development tab on the Newcastle Basketball website.",
          ctaLabel: "Development info",
          ctaHref: "https://www.newcastlebasketball.com.au/"
        },
        {
          id: "winter-junior",
          title: "Winter Junior Competition",
          badge: "Winter",
          description:
            "Catering for U12 through to U18 players, the Winter Competition is the premier competition facilitated by Newcastle Basketball and runs through Terms 2 and 3 each year. West Basketball coordinates teams across all age groups and divisions, allocates coaches, coordinates training and skill development, and strives to ensure each player is placed in a team that suits their ability and preferences (e.g. friend requests, level of division, etc).\nMore information will be shared once registrations for 2026 open.",
          ctaLabel: "Contact us",
          ctaHref: "about.html#contact"
        },
        {
          id: "summer-junior",
          title: "Summer Junior Competition",
          badge: "Summer",
          description:
            "Catering for U11 through to U17 players, this competition is facilitated by Newcastle Basketball and the clubs are not involved in putting teams together for this competition.",
          ctaLabel: "Newcastle Basketball info",
          ctaHref: "https://www.newcastlebasketball.com.au/summer-junior-competition/"
        },
        {
          id: "development-programs",
          title: "Development Programs and Holiday Camps",
          badge: "Programs",
          description:
            "Newcastle Basketball facilitate a range of development programs and holiday camps to cater for all levels of basketball. From Mini Hoops (ages 3-5) through to representative programs, visit their website to find out more.",
          ctaLabel: "Newcastle Basketball programs",
          ctaHref: "https://www.newcastlebasketball.com.au/"
        },
        {
          id: "referee-pathways",
          title: "Referee Pathways",
          badge: "Referees",
          description:
            "Newcastle Basketball have a referee pathways program for juniors aged 12 years and over. A great way to increase your basketball knowledge, get involved in the sport and earn some money along the way.",
          ctaLabel: "Referee pathways",
          ctaHref: "https://www.newcastlebasketball.com.au/referees/"
        }
      ],
      helpTag: "Support",
      helpTitle: "Need Help?",
      helpText: "For any further queries, please don't hesitate to contact us.",
      helpCtaLabel: "Contact us",
      helpCtaHref: "about.html#contact"
    },
    training: {
      heroTag: "Training",
      heroTitle: "Training",
      heroHighlight: "Sessions",
      heroDescription:
        "Weekly training opportunities for all teams and players.",
      seasonTag: "Winter Season",
      seasonTitle: "How training works",
      seasonDescription:
        "During the Winter Competition we facilitate weekly training opportunities for all our teams and players. This may be a mix of individual team trainings, squad trainings and structured skills sessions, run by our experienced and well supported coaches. More information will be shared as we coordinate our teams and get ready to start the season, and a training schedule will be included on our website.",
      scheduleTag: "Schedule",
      scheduleTitle: "Training schedule",
      scheduleDescription:
        "A training schedule will be shared once teams and courts are confirmed.",
      scheduleCtaLabel: "View training schedule",
      scheduleCtaHref: "",
      locationsTag: "Facilities",
      locationsTitle: "Newcastle Basketball Training Facilities",
      locations: ["Newcastle Basketball Stadium"]
    },
    merch: {
      heroTag: "Merchandise",
      heroTitle: "Uniforms &",
      heroHighlight: "Gear",
      storeTag: "Official Store",
      storeTitle: "Shop",
      storeHighlight: "Now",
      storeDescription: "Order West Basketball merchandise online through iAthletic.",
      pillars: ["Quality", "Fast Delivery", "Club Pride"],
      ctaLabel: "ORDER HERE"
    },
    coaches: {
      heroTag: "Coaching",
      heroTitle: "Coaching at",
      heroHighlight: "West Basketball",
      resources: [
        {
          title: "West Coaching Guide",
          description: "Session plans, game-day expectations, and safety info for all coaches.",
          ctaLabel: "Open guide",
          href: "https://example.com/west-coaching-guide.pdf"
        },
        {
          title: "West Coaching Templates",
          description: "Printable drills, warm-ups, and development trackers for your sessions.",
          ctaLabel: "Download templates",
          href: "https://example.com/west-coaching-templates.zip"
        }
      ],
      ctaTag: "Get Involved",
      ctaTitle: "Want to",
      ctaHighlight: "Coach?",
      ctaDescription:
        "If you are interested in being part of our positive and collaborative club through coaching for us in 2026, we'd love to hear from you. Please fill out a Contact Us form and we will be in touch soon!",
      ctaLabel: "Contact us",
      ctaHref: "about.html#contact"
    },
    sponsors: {
      heroTag: "Partners",
      heroTitle: "Sponsor",
      heroHighlight: "West Basketball",
      heroDescription:
        "We currently have an exciting opportunity for sponsors to come on board for our 2026-2028 seasons to have their logo featured on our new playing uniforms - great exposure being aligned to one of the largest basketball clubs in Newcastle.",
      ctaTag: "Partner With Us",
      ctaTitle: "Become a",
      ctaHighlight: "Sponsor",
      ctaDescription:
        "We'd love to talk to any interested businesses and are open to discuss uniform sponsorship options or any other mutually beneficial sponsorships arrangements. It's an exciting time for our club and we look forward to taking the court in 2026 in our updated uniforms while helping to promote businesses with similar community spirit and values. Please reach out to discuss further and we will be in touch.",
      ctaLabel: "Contact us",
      ctaHref: "about.html#contact",
      features: [
        "Uniform Provider: iAthletic",
        "Major uniform sponsors: TBC - please reach out to discuss sponsorship opportunities",
        "Minor uniform sponsor: West Group"
      ]
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

let hasCachedOverrides = false;

function loadSiteData() {
  try {
    const cached = localStorage.getItem("clubSiteData");
    if (cached) {
      hasCachedOverrides = true;
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
  if (data && typeof data === "object") data.__hasOverrides = true;
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
        stripped.__hasOverrides = true;
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
  window.siteContent.__hasOverrides = false;
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
    merged.__hasOverrides = true;
    saveSiteData(merged);
    window.dispatchEvent(new Event("sitecontent:updated"));
  } catch (err) {
    console.warn("Remote site data unavailable; using local copy", err);
  }
}

// expose the data immediately for page scripts, then try to hydrate from remote gist
window.siteContent = loadSiteData();
window.siteContent.__hasOverrides = hasCachedOverrides;
fetchRemoteSiteData();
