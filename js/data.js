/**
 * UNGCNL 2026 Engagement Calendar — data & taxonomy.
 *
 * Sourced from "Copy of 2026 Engagement Calendar — UN Global Compact Network
 * Lebanon" (spreadsheet supplied 2026). A few notes on how the raw sheet was
 * mapped into this shape:
 *
 * - The sheet has no "theme" column (Ten Principles issue area), so each
 *   event's `theme` below is an editorial best-guess based on its name and
 *   description — not authoritative. Please review/correct these.
 * - The sheet has no registration-link column, so every `link` is `null`
 *   (no Register/Learn more button shows until a real URL is added).
 * - `status` uses the sheet's own wording exactly (Completed / Ongoing /
 *   In progress / Upcoming / Recruitment period / Date to be confirmed),
 *   taken from the status prefix before the " | " in each row's "Details &
 *   Registration" text — see UNGCNL_STATUS_META below.
 * - Three incomplete rows ("Regional CoP Session", two "Local Survey" rows)
 *   had no dates in the sheet. "Regional CoP Session" was later confirmed
 *   by the client as "ME Regional CoP Workshop", 15 July 2026, and is
 *   included below; the two "Local Survey" rows are still dropped.
 * - Two rows dated entirely in 2027 ("CMO Blueprint for Sustainable
 *   Growth", "EGA/General Assembly 2027") were dropped as out of scope for
 *   a 2026 calendar — re-add them (js array below) if you want a 2027
 *   edition later.
 * - "Just Transition Report Launch" has no date at all in the sheet
 *   ("TBD"/"TBD"), so startDate/endDate are `null` and status is
 *   "Date to be confirmed" — it appears in List → All Year, not on the
 *   Timeline (which needs a real date to plot).
 *
 * Field shape:
 * {
 *   id:            string, unique, kebab-case
 *   name:          string — event/programme title
 *   startDate:     "YYYY-MM-DD" | null (null = date to be confirmed)
 *   endDate:       "YYYY-MM-DD" | null — same as startDate for single-day items
 *   scope:         "Lebanon" | "Regional" | "Global"
 *   type:          see UNGCNL_TYPE_FILTERS below
 *   theme:         "Human Rights" | "Labour" | "Decent Work" | "Environment"
 *                  | "Climate" | "Anti-Corruption" | "Other" | "Community Impact"
 *   description:   string
 *   participation: see UNGCNL_PARTICIPATION_FILTERS below
 *   status:        see UNGCNL_STATUS_META below
 *   contact:       optional — key into UNGCNL_CONTACTS, shows a
 *                  "Contact [Name] for more details" link in the detail panel
 *   link:          string (URL) | null
 * }
 */

/* ---------------------------------------------------------------------
 * Taxonomy metadata
 * ------------------------------------------------------------------- */

// The Ten Principles cover four issue areas. "Decent Work" and "Climate"
// are finer-grained theme values that share their parent issue area's
// colour and icon, so the timeline's colour signal stays to five values.
window.UNGCNL_THEME_META = {
  "Human Rights": { group: "Human Rights", color: "#6E417A", icon: "humanRights", label: "Human Rights" },
  "Labour": { group: "Labour", color: "#CCB146", icon: "labour", label: "Labour" },
  "Decent Work": { group: "Labour", color: "#CCB146", icon: "labour", label: "Decent Work" },
  "Environment": { group: "Environment", color: "#297D6D", icon: "environment", label: "Environment" },
  "Climate": { group: "Environment", color: "#297D6D", icon: "environment", label: "Climate" },
  // #D42D38 is a deepened version of brand red #EC3740 — the true brand red
  // fails WCAG AA 4.5:1 for white text at pill/badge sizes, this passes.
  "Anti-Corruption": { group: "Anti-Corruption", color: "#D42D38", icon: "anticorruption", label: "Anti-Corruption" },
  "Other": { group: "Other", color: "#1E3250", icon: "other", label: "Other" },
  // Global Compact Tone 2 (#699CC6) per the brand guidelines — reserved for
  // Community Impact / youth engagements specifically (SDG Brain Lab,
  // Corporate Sustainability Officer Certificate), not "Other" generally.
  "Community Impact": { group: "Community Impact", color: "#699CC6", icon: "other", label: "Community Impact" }
};

// The filter dropdown only offers the four Ten Principles issue areas (plus
// All) — it filters by ISSUE AREA (group), so a "Decent Work" event still
// shows up under the "Labour" filter and a "Climate" event under
// "Environment". "Other"-themed events only appear under "All".
window.UNGCNL_THEME_FILTERS = ["All", "Human Rights", "Labour", "Environment", "Anti-Corruption"];

// Scope = geography ("Lebanon" / "Regional" / "Global") + format ("In
// Person" / "Online" / "Hybrid"), combined as one value (e.g.
// "Lebanon/In Person"). The icon always reflects the geography part.
window.UNGCNL_SCOPE_META = {
  "Lebanon/In Person": { icon: "pin", label: "Lebanon/In Person" },
  "Lebanon/Online": { icon: "pin", label: "Lebanon/Online" },
  "Lebanon/Hybrid": { icon: "pin", label: "Lebanon/Hybrid" },
  "Regional/In Person": { icon: "share", label: "Regional/In Person" },
  "Regional/Online": { icon: "share", label: "Regional/Online" },
  "Regional/Hybrid": { icon: "share", label: "Regional/Hybrid" },
  "Global/In Person": { icon: "globe", label: "Global/In Person" },
  "Global/Online": { icon: "globe", label: "Global/Online" },
  "Global/Hybrid": { icon: "globe", label: "Global/Hybrid" },
  "Lebanon/Format TBC": { icon: "pin", label: "Lebanon/Format TBC" }
};

window.UNGCNL_SCOPE_FILTERS = [
  "All",
  "Lebanon/In Person", "Lebanon/Online", "Lebanon/Hybrid", "Lebanon/Format TBC",
  "Regional/In Person", "Regional/Online", "Regional/Hybrid",
  "Global/In Person", "Global/Online", "Global/Hybrid"
];

window.UNGCNL_TYPE_FILTERS = [
  "All", "Accelerators", "Programme", "Events", "General Assembly", "Communication on Progress Training",
  "Workshops", "Community Impact", "Peer Learning", "Training", "Initiatives", "Report Launch"
];

window.UNGCNL_PARTICIPATION_FILTERS = [
  "All", "Businesses Only", "Open to all Participants", "Registered Participants", "Youth Initiative",
  "Non-Businesses Only", "Public", "By personal invitation only, for industrialists"
];

// status value -> badge tone (maps to CSS classes .status--*)
// Matches the status wording used in the source spreadsheet exactly.
window.UNGCNL_STATUS_META = {
  "Completed": { tone: "closed" },
  "Ongoing": { tone: "open" },
  "Upcoming": { tone: "soon" },
  "Recruitment period": { tone: "soon" },
  "Date to be confirmed": { tone: "tbc" }
};

// Team contacts shown in the "Contact Us" section — keyed to match each
// <li id="contact-KEY"> in index.html, so an event's detail panel can link
// straight to (and highlight) the right person.
window.UNGCNL_CONTACTS = {
  deenah: { name: "Deenah Fakhoury", email: "deenah.fakhoury@ungcnlebanon.org" },
  myrna: { name: "Myrna Merhej", email: "myrna.merhej@ungcnlebanon.org" },
  alaa: { name: "Alaa Karanouh", email: "alaa@ungcnlebanon.org" },
  sana: { name: "Sana Farajalla", email: "sana.farajalla@ungcnlebanon.org" },
  yara: { name: "Yara Saliba", email: "yara.saliba@ungcnlebanon.org" }
};

/* ---------------------------------------------------------------------
 * 2026 events
 * ------------------------------------------------------------------- */
window.UNGCNL_EVENTS = [
  {
    id: "business-and-human-rights-accelerator",
    name: "Business and Human Rights Accelerator",
    startDate: "2027-02-01",
    endDate: "2027-05-01",
    scope: "Regional/Online",
    type: "Accelerators",
    theme: "Human Rights",
    description: "Recruitment is planned from September to November 2026, with programme delivery from February to May 2027. Developed and delivered by Shift for the UN Global Compact, the Business and Human Rights Accelerator supports companies in moving from commitment to action on human rights and labour rights. Participants strengthen their understanding of the UN Guiding Principles on Business and Human Rights and apply human rights due diligence in practice, including identifying and prioritising salient human rights risks and developing practical actions for their organisation.<br><br><strong>Registration for the regional track will open soon.</strong>",
    participation: "Businesses Only",
    status: "Recruitment period",
    contact: "sana",
    link: null
  },
  {
    id: "climate-ambition-accelerator-2026",
    name: "Climate Ambition Accelerator",
    startDate: "2026-09-01",
    endDate: "2026-12-01",
    scope: "Global/Online",
    type: "Accelerators",
    theme: "Climate",
    description: "The Climate Ambition Accelerator supports companies in accelerating progress towards science-based emissions reduction targets and a credible transition to net zero. Led by the UN Global Compact, the programme combines global and local learning, practical activities, peer exchange and insights from climate experts. Participants strengthen their understanding of GHG emissions inventories, the Science Based Targets initiative and its tools, science-based target setting and emissions reduction strategies.<br><br><strong>The 2026 cohort is currently underway from September to December. Registration for the 2027 cohort will open at a later stage.</strong>",
    participation: "Businesses Only",
    status: "Ongoing",
    contact: "sana",
    link: null
  },
  {
    id: "lebanese-industry-sustainable-future",
    name: "Lebanese Industry for a Sustainable Future",
    startDate: "2026-02-24",
    endDate: "2026-02-24",
    scope: "Lebanon/In Person",
    type: "Events",
    theme: "Other",
    description: "Held under the patronage of H.E. Eng. Joe Issa-El-Khoury, Minister of Industry, this high-level dialogue explored how global standards, reporting frameworks, and carbon-related requirements are shaping export access for Lebanese industry. It brought together industrial stakeholders and experts to discuss practical steps towards greater competitiveness and a more sustainable industrial sector.",
    participation: "By personal invitation only, for industrialists",
    status: "Completed",
    link: null
  },
  {
    id: "general-assembly-2026",
    name: "General Assembly",
    startDate: "2026-04-01",
    endDate: "2026-04-01",
    scope: "Lebanon/In Person",
    type: "General Assembly",
    theme: "Other",
    description: "The 2026 General Assembly brought together UN Global Compact Network Lebanon participants to review key developments, discuss the Network's direction, and take part in the election of the Board.",
    participation: "Open to all Participants",
    status: "Completed",
    link: null
  },
  {
    id: "cop-generic-session",
    name: "CoP Generic Session (Policy, Guidelines, Format)",
    startDate: "2026-05-19",
    endDate: "2026-05-19",
    scope: "Lebanon/Online",
    type: "Communication on Progress Training",
    theme: "Other",
    description: "This introductory Communication on Progress session guided participating businesses through the CoP policy, reporting requirements, submission format, and process. It also provided practical guidance to help companies prepare for their reporting responsibilities.",
    participation: "Businesses Only",
    status: "Completed",
    contact: "myrna",
    link: null
  },
  {
    id: "regional-info-circles-green-procurement",
    name: "Regional Info-circles — Green Public Procurement",
    startDate: "2026-07-08",
    endDate: "2026-07-08",
    scope: "Regional/Online",
    type: "Workshops",
    theme: "Environment",
    description: "This regional info-circle introduced Green Public Procurement and explored how public purchasing can support sustainable markets, responsible suppliers, and environmental objectives. Participants exchanged practical perspectives on applying GPP principles across the region.",
    participation: "Open to all Participants",
    status: "Completed",
    link: null
  },
  {
    id: "rbc-human-rights-due-diligence",
    name: "Responsible Business Conduct: Human Rights Due Diligence for Responsible Business Decision-Making",
    startDate: "2026-06-23",
    endDate: "2026-06-23",
    scope: "Regional/Online",
    type: "Workshops",
    theme: "Human Rights",
    description: "The first webinar in the regional Responsible Business Conduct series examined how human rights due diligence can strengthen business decision-making, risk management, and accountability. Experts and business practitioners shared practical insights on identifying, preventing, mitigating, and addressing human rights impacts.",
    participation: "Open to all Participants",
    status: "Completed",
    link: null
  },
  {
    id: "me-regional-cop-workshop",
    name: "ME Regional CoP Workshop",
    startDate: "2026-07-15",
    endDate: "2026-07-15",
    scope: "Regional/Online",
    type: "Workshops",
    theme: "Other",
    description: "This regional session supported participating companies in navigating the Communication on Progress process, including key requirements, policy updates, timelines, and practical guidance.",
    participation: "Open to all Participants",
    status: "Completed",
    contact: "myrna",
    link: null
  },
  {
    id: "sdg-brain-lab-closing-ceremony",
    name: "SDG Brain Lab Closing Ceremony",
    startDate: "2026-06-24",
    endDate: "2026-06-24",
    scope: "Lebanon/In Person",
    type: "Community Impact",
    theme: "Community Impact",
    description: "The closing ceremony marked the conclusion of the fifth edition of the SDG Brain Lab. Around 100 young participants presented solutions to Just Transition challenges proposed by FairTrade Lebanon, the Hariri Foundation for Sustainable Human Development, and IPT Group. The event also welcomed a new cohort of Ambassadors of Change for the coming academic year.",
    participation: "Youth Initiative",
    status: "Completed",
    link: null
  },
  {
    id: "rbc-strategic-communication",
    name: "Responsible Business Conduct: Strategic Communication for Responsible Business Conduct",
    startDate: "2026-06-30",
    endDate: "2026-06-30",
    scope: "Regional/Online",
    type: "Workshops",
    theme: "Other",
    description: "The second webinar in the regional Responsible Business Conduct series explored how organisations can communicate sustainability and human rights commitments clearly, credibly, and responsibly. Speakers shared practical approaches to stakeholder engagement, internal alignment, transparency, and avoiding misleading claims.",
    participation: "Open to all Participants",
    status: "Completed",
    link: null
  },
  {
    id: "un-general-assembly-unga-2026",
    name: "UN General Assembly (UNGA)",
    startDate: "2026-09-08",
    endDate: "2026-09-22",
    scope: "Global/In Person",
    type: "Events",
    theme: "Other",
    description: "The United Nations General Assembly brings Member States and global leaders together in New York to address shared priorities, including peace and security, sustainable development, climate action, and international cooperation. The session runs from 8 to 22 September 2026.",
    participation: "Public",
    status: "Ongoing",
    link: null
  },
  {
    id: "leaders-summit-2026",
    name: "Leaders Summit 2026",
    startDate: "2026-09-22",
    endDate: "2026-09-23",
    scope: "Global/In Person",
    type: "Events",
    theme: "Other",
    description: "The UN Global Compact Leaders Summit will convene business leaders, United Nations representatives, governments, civil society, and sustainability experts to accelerate private-sector action on the Ten Principles and the Sustainable Development Goals. The Summit will take place on 22 and 23 September 2026.",
    participation: "Public",
    status: "Upcoming",
    link: null
  },
  {
    id: "cop31-climate-change-conference",
    name: "COP 31 United Nations Climate Change Conference",
    startDate: "2026-11-09",
    endDate: "2026-11-20",
    scope: "Global/In Person",
    type: "Events",
    theme: "Climate",
    description: "COP 31 will take place in Antalya, Türkiye, from 9 to 20 November 2026. Governments, businesses, civil society, and international organisations will come together to advance global climate action under the Paris Agreement, strengthen implementation, and discuss the next phase of collective climate ambition.",
    participation: "Public",
    status: "Upcoming",
    link: null
  },
  {
    id: "gender-equality-report-launch",
    name: "Gender Equality Report Launch",
    startDate: "2026-10-21",
    endDate: "2026-10-21",
    scope: "Lebanon/Online",
    type: "Peer Learning",
    theme: "Decent Work",
    description: "This event will present and discuss Advancing Gender-Inclusive Workplaces in Lebanon, the white paper developed through the Gender Equality Peer Learning Group. It will highlight key findings, priority gaps, and practical recommendations across workplace inclusion, financial equity, wellbeing and care, job stereotypes, and governance and leadership.",
    participation: "Open to all Participants",
    status: "Upcoming",
    contact: "yara",
    link: null
  },
  {
    id: "spark-2026",
    name: "SPARK",
    startDate: "2026-09-10",
    endDate: "2026-12-09",
    scope: "Regional/Online",
    type: "Programme",
    theme: "Other",
    description: "SPARK is a regional learning programme designed to help SMEs and suppliers of companies strengthen sustainability practices across their value chains. Through practical learning sessions, tools and peer exchange, participants build their capacity across key Environmental, Social and Governance topics, including greenhouse gas emissions, occupational safety and health, and supplier codes of conduct.<br><br>The programme supports participants in identifying sustainability risks, strengthening internal practices and responding to growing expectations from buyers, customers and other business partners.<br><br><strong>The 2026 cohort is currently underway. Registration is closed.</strong>",
    participation: "Businesses Only",
    status: "Ongoing",
    contact: "sana",
    link: null
  },
  {
    id: "media-and-sustainability-event",
    name: "Media and Sustainability Event",
    startDate: "2026-11-18",
    endDate: "2026-11-18",
    scope: "Lebanon/In Person",
    type: "Events",
    theme: "Other",
    description: "This event will convene media professionals, sustainability practitioners, business leaders, and partners to explore the media's role in advancing credible sustainability communication, public awareness, and accountability. The agenda, venue, and registration details will be shared closer to the event.",
    participation: "Public",
    status: "Upcoming",
    contact: "yara",
    link: null
  },
  {
    id: "just-transition-report-launch",
    name: "Just Transition in Lebanon: White Paper Launch",
    startDate: null,
    endDate: null,
    scope: "Lebanon/Online",
    type: "Report Launch",
    theme: "Decent Work",
    description: "This event will launch UN Global Compact Network Lebanon's white paper on just transition in Lebanon, developed following the Just Transition Peer Learning Group.<br><br>Drawing on stakeholder discussions across food systems and agriculture, water, renewable energy, waste and the circular economy, and SME finance, the paper examines the institutional, financial and operational conditions that shape how transition measures can be implemented in practice. It also considers how differences in the capacities of firms, producers and households affect the distribution of transition costs, risks and opportunities.<br><br>The launch will present the paper's key findings and policy recommendations for advancing a just transition in Lebanon, with a focus on implementation, access to finance, institutional responsibilities and the respective roles of public and private actors.<br><br>Further details and registration information will be announced soon.",
    participation: "Open to all Participants",
    status: "Upcoming",
    link: null
  },
  {
    id: "ghg-accounting-reporting-series",
    name: "Taking Action on GHG Emissions: Accounting and Reporting Series — Session 1: Foundations of Corporate GHG Accounting",
    startDate: "2026-10-20",
    endDate: "2026-10-20",
    scope: "Lebanon/Online",
    type: "Training",
    theme: "Climate",
    description: "Facilitated by Rawad Massoud, Executive Managing Director at V4 Advisors and an environmental and climate expert specialising in GHG accounting and emissions auditing, this foundational session will introduce corporate greenhouse gas accounting and internationally recognised approaches, including the GHG Protocol, emissions scopes and key principles for measuring and reporting organisational emissions.<br><br>The session forms the foundation of UN Global Compact Network Lebanon's broader Taking Action on GHG Emissions series, helping participants build the knowledge needed to navigate different accounting and reporting approaches and progressively strengthen their emissions management.<br><br><strong>12:00–13:00.</strong> Registration for Session 1 is available to participants registered for the 22 October practical training, as the two sessions are designed as a complementary learning sequence.<br><br><strong>Registration opens during the week of 21 September and closes on 16 October 2026.</strong>",
    participation: "Registered Participants",
    status: "Upcoming",
    contact: "sana",
    link: null
  },
  {
    id: "undp-carbon-footprint-calculator-training",
    name: "Taking Action on GHG Emissions: Accounting and Reporting Series — Session 2: Lebanon's Carbon Footprint Reporting Process",
    startDate: "2026-10-22",
    endDate: "2026-10-22",
    scope: "Lebanon/In Person",
    type: "Training",
    theme: "Climate",
    description: "Delivered in collaboration with the Ministry of Environment and UNDP, this practical session will introduce the Ministry of Environment's Carbon Footprint Calculator and Lebanon's voluntary carbon footprint reporting process. Participants will learn how to navigate and complete the calculator, understand the information required and become familiar with the national reporting process.<br><br>The session will also help participants distinguish between Lebanon's national reporting mechanism and broader corporate GHG accounting frameworks such as the GHG Protocol, and understand their different and complementary roles.<br><br>Participants may attend either the morning session from 10:00–13:00 or the afternoon session from 14:00–17:00 at Mövenpick Hotel Beirut.<br><br><strong>Registration opens during the week of 21 September and closes on 16 October 2026.</strong>",
    participation: "Open to all Participants",
    status: "Upcoming",
    link: null
  },
  {
    id: "ghg-series-session-3-scope3",
    name: "Taking Action on GHG Emissions: Accounting and Reporting Series — Session 3: Scope 3 and Supply-Chain Emissions",
    startDate: null,
    endDate: null,
    scope: "Lebanon/Format TBC",
    type: "Training",
    theme: "Climate",
    description: "The third session in the Taking Action on GHG Emissions series will focus on Scope 3 emissions and the role of supply chains in corporate decarbonisation. Building on the foundations introduced through the series, the session will explore approaches to identifying value-chain emissions, strengthening emissions data and engaging suppliers in the decarbonisation journey.<br><br>Further details, including the date, format and registration information, will be announced soon.",
    participation: "Open to all Participants",
    status: "Upcoming",
    link: null
  },
  {
    id: "corporate-sustainability-officer-certificate",
    name: "Corporate Sustainability Officer Certificate",
    startDate: "2026-10-08",
    endDate: "2026-12-17",
    scope: "Lebanon/In Person",
    type: "Initiatives",
    theme: "Community Impact",
    description: "This accredited certificate, developed by Université Saint-Joseph and UN Global Compact Network Lebanon, will build practical expertise in corporate sustainability through five modules, eight three-hour sessions, and an applied capstone. Topics include sustainability foundations, governance and ethics, reporting, implementation and measurement, and sustainability roadmaps.",
    participation: "Public",
    status: "Upcoming",
    contact: "alaa",
    link: null
  },
  {
    id: "corporate-governance-sprint",
    name: "Corporate Governance Sprint",
    startDate: "2026-12-01",
    endDate: "2026-12-01",
    scope: "Lebanon/In Person",
    type: "Workshops",
    theme: "Anti-Corruption",
    description: "This practical sprint will help participants strengthen corporate governance structures, clarify board and management responsibilities, and translate good governance principles into actionable improvements. Further agenda and registration details will be shared ahead of the session.",
    participation: "Open to all Participants",
    status: "Upcoming",
    contact: "alaa",
    link: null
  },
  {
    id: "sdg-brain-lab-v6",
    name: "SDG Brain Lab v6.0",
    startDate: "2026-10-30",
    endDate: "2027-05-21",
    scope: "Lebanon/Hybrid",
    type: "Community Impact",
    theme: "Community Impact",
    description: "The sixth edition of the SDG Brain Lab will engage university youth in applied sustainability learning, challenge-based innovation, and collaboration with businesses. Participants will develop solutions to real sustainability challenges, with selected young leaders continuing their engagement through the Ambassadors of Change initiative.",
    participation: "Youth Initiative",
    status: "Upcoming",
    contact: "alaa",
    link: null
  }
];
