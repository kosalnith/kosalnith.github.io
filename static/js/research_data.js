// ----- Publication type definitions -----
// Counts verified from research.html:
//   Journal article: 1  | Book chapter: 2 | Working paper: 4
//   Other pub: 6        | Op-Ed: 15       | Policy brief: 2 | Work in progress: 3
// Total: 33

const allPublicationTypes = [
  { key: "journal_article",         label: "Journal article",                         count: 1,  dataFilter: "articles"  },
  { key: "article_in_proceeding",   label: "Article in proceeding",                  count: 0,  dataFilter: null        },
  { key: "book_chapter",            label: "Book chapter",                           count: 2,  dataFilter: "chapters"  },
  { key: "book",                    label: "Book",                                   count: 0,  dataFilter: null        },
  { key: "report",                  label: "Report",                                 count: 0,  dataFilter: null        },
  { key: "conf_abstract_conf",      label: "Conference abstract for conference",     count: 0,  dataFilter: null        },
  { key: "conf_abstract_proc",      label: "Conference abstract in proceeding",      count: 0,  dataFilter: null        },
  { key: "phd_thesis",              label: "PhD thesis",                             count: 0,  dataFilter: null        },
  { key: "conf_abstract_journal",   label: "Conference abstract in journal",         count: 0,  dataFilter: null        },
  { key: "paper_no_publisher",      label: "Paper without publisher/journal",        count: 0,  dataFilter: null        },
  { key: "poster",                  label: "Poster",                                 count: 0,  dataFilter: null        },
  { key: "review_article",          label: "Review article",                         count: 0,  dataFilter: null        },
  { key: "working_paper",           label: "Working paper",                          count: 4,  dataFilter: "working"   },
  { key: "conf_article_journal",    label: "Conference article in journal",          count: 0,  dataFilter: null        },
  { key: "anthology",               label: "Anthology",                              count: 0,  dataFilter: null        },
  { key: "editorial",               label: "Editorial",                              count: 0,  dataFilter: null        },
  { key: "literature_review",       label: "Literature review",                      count: 0,  dataFilter: null        },
  { key: "comment_debate",          label: "Comment/debate",                         count: 0,  dataFilter: null        },
  { key: "net_publication",         label: "Net publication - Internet publication", count: 0,  dataFilter: null        },
  { key: "other_contribution",      label: "Other contribution",                     count: 0,  dataFilter: null        },
  { key: "contrib_newspaper_review",  label: "Contribution to newspaper - Review",          count: 0, dataFilter: null },
  { key: "contrib_newspaper_feature", label: "Contribution to newspaper - Feature article", count: 0, dataFilter: null },
  { key: "contrib_newspaper_article", label: "Contribution to newspaper - Newspaper article", count: 0, dataFilter: null },
  { key: "preprint",                label: "Preprint",                               count: 0,  dataFilter: null        },
  { key: "encyclopedia_chapter",    label: "Encyclopedia chapter",                   count: 0,  dataFilter: null        },
  { key: "report_chapter",          label: "Report chapter",                         count: 0,  dataFilter: null        },
  { key: "preface_intro",           label: "Preface/Introduction/postscript",        count: 0,  dataFilter: null        },
  { key: "letter",                  label: "Letter",                                 count: 0,  dataFilter: null        },
  { key: "sound_visual",            label: "Sound/Visual production (digital)",      count: 0,  dataFilter: null        },
  { key: "patent",                  label: "Patent",                                 count: 0,  dataFilter: null        },
  { key: "contrib_newspaper_comment", label: "Contribution to newspaper - Comment/debate", count: 0, dataFilter: null },
  { key: "compendium_notes",        label: "Compendium/lecture notes",               count: 0,  dataFilter: null        },
  { key: "memorandum",              label: "Memorandum",                             count: 0,  dataFilter: null        },
  { key: "doctoral_thesis",         label: "Doctoral thesis",                        count: 0,  dataFilter: null        },
  { key: "case_report",             label: "Case Report",                            count: 0,  dataFilter: null        },
  { key: "computer_programme",      label: "Computer programme",                     count: 0,  dataFilter: null        },
  { key: "comment",                 label: "Comment",                                count: 0,  dataFilter: null        },
  { key: "memorandum_contribution", label: "Memorandum contribution",                count: 0,  dataFilter: null        },
  { key: "2d_3d",                   label: "2D/3D (Physical product)",                count: 0,  dataFilter: null        },
  { key: "interactive_production",  label: "Interactive production",                 count: 0,  dataFilter: null        },
  { key: "qanda_hearing",           label: "Question & Answer/hearing",              count: 0,  dataFilter: null        },
  { key: "compendium_chapter",      label: "Compendium/lecture notes chapter",       count: 0,  dataFilter: null        },
  { key: "qanda_contribution",      label: "Question & Answer/hearing contribution", count: 0,  dataFilter: null        },
  { key: "article",                 label: "Article",                                count: 0,  dataFilter: null        },
  { key: "doctoral_thesis_dup",     label: "Doctoral Thesis",                        count: 0,  dataFilter: null        },
  { key: "dataset",                 label: "Dataset",                                count: 0,  dataFilter: null        },
  { key: "masters_thesis",          label: "Master's Thesis",                        count: 0,  dataFilter: null        }
];

allPublicationTypes.push({ key: "op_ed",            label: "Op-Ed / Commentary", count: 15, dataFilter: "opeds"    });
allPublicationTypes.push({ key: "policy_brief",     label: "Policy brief",       count: 2,  dataFilter: "policy"   });
allPublicationTypes.push({ key: "work_in_progress", label: "Work in progress",   count: 3,  dataFilter: "progress" });
allPublicationTypes.push({ key: "other_publication",label: "Other publication",  count: 6,  dataFilter: "other"    });

const uniqueTypes = [];
const seenLabels = new Set();
for (let t of allPublicationTypes) {
  if (!seenLabels.has(t.label)) { seenLabels.add(t.label); uniqueTypes.push(t); }
}

// ─── Year counts (verified from publications list below) ───────
const yearItems = [
  { year: "2026", count: 4 },
  { year: "2025", count: 8 },
  { year: "2024", count: 2 },
  { year: "2023", count: 2 },
  { year: "2022", count: 3 },
  { year: "2021", count: 7 },
  { year: "2020", count: 3 },
  { year: "2019", count: 1 },
  { year: "2018", count: 1 }
];

// ─── SDG data — matched to Kosal Nith's research themes ────────
const sdgItems = [
  { label: "SDG 1 - No Poverty",                                count: 8  },
  { label: "SDG 2 - Zero Hunger",                               count: 6  },
  { label: "SDG 3 - Good Health and Well-being",                count: 2  },
  { label: "SDG 4 - Quality Education",                         count: 3  },
  { label: "SDG 5 - Gender Equality",                           count: 4  },
  { label: "SDG 6 - Clean Water and Sanitation",                count: 1  },
  { label: "SDG 7 - Affordable and Clean Energy",               count: 3  },
  { label: "SDG 8 - Decent Work and Economic Growth",           count: 14 },
  { label: "SDG 9 - Industry, Innovation, and Infrastructure",  count: 9  },
  { label: "SDG 10 - Reduced Inequalities",                     count: 10 },
  { label: "SDG 11 - Sustainable Cities and Communities",       count: 6  },
  { label: "SDG 12 - Responsible Consumption and Production",   count: 4  },
  { label: "SDG 13 - Climate Action",                           count: 5  },
  { label: "SDG 14 - Life Below Water",                         count: 1  },
  { label: "SDG 15 - Life on Land",                             count: 4  },
  { label: "SDG 16 - Peace, Justice and Strong Institutions",   count: 5  },
  { label: "SDG 17 - Partnerships for the Goals",               count: 7  }
];

// ─── Publications data ─────────────────────────────────────────
// type: articles | chapters | working | other | opeds | policy | progress
// lang: en | fr | km
const publicationsData = [

  // ══ Op-Eds & Commentaries (15) ════════════════════════════════

  { title: "Capital Gains Tax Is a Smart Way to Build Infrastructure",
    ogImage: "https://kosalnith.github.io/static/img/og/capital-gains-tax-is-a-smart-way-to-build-infrastructure.png",
    authors: "Kosal Nith", date: "22 Mar 2026", outlet: "Cambodianess",
    type: "opeds", year: "2026", oa: false, lang: "en",
    breadcrumb: "Op-Ed / Commentary › Op-Ed",
    keywords: ["Taxation","Capital Gains Tax","Infrastructure","Fiscal Policy","Cambodia"],
    kwStrength: ["full","full","full","half","none"],
    sdgs: ["SDG 9 - Industry, Innovation, and Infrastructure","SDG 10 - Reduced Inequalities","SDG 17 - Partnerships for the Goals"],
    link: "https://cambodianess.com/article/capital-gains-tax-is-a-smart-way-to-build-infrastructure" },

  { title: "Transforming the Tax System with Personal Income Tax",
    ogImage: "https://kosalnith.github.io/static/img/og/transforming-the-tax-system-with-personal-income-tax.png",
    authors: "Kosal Nith", date: "4 Jan 2026", outlet: "Cambodianess",
    type: "opeds", year: "2026", oa: false, lang: "en",
    breadcrumb: "Op-Ed / Commentary › Op-Ed",
    keywords: ["Personal Income Tax","Tax Reform","Fiscal Policy","Cambodia"],
    kwStrength: ["full","full","half","none"],
    sdgs: ["SDG 10 - Reduced Inequalities","SDG 16 - Peace, Justice and Strong Institutions"],
    link: "https://cambodianess.com/article/transforming-the-tax-system-with-personal-income-tax" },

  { title: "Cambodia Needs Progressive Taxation to Invest in Its Future",
    ogImage: "https://kosalnith.github.io/static/img/og/cambodia-needs-progressive-taxation-to-invest-in-its-future.png",
    authors: "Kosal Nith", date: "17 Oct 2025", outlet: "Camboja News",
    type: "opeds", year: "2025", oa: false, lang: "en",
    breadcrumb: "Op-Ed / Commentary › Op-Ed",
    keywords: ["Progressive Taxation","Public Investment","Inequality","Cambodia"],
    kwStrength: ["full","full","half","none"],
    sdgs: ["SDG 1 - No Poverty","SDG 10 - Reduced Inequalities","SDG 17 - Partnerships for the Goals"],
    link: "https://cambojanews.com/op-ed-cambodia-needs-progressive-taxation-to-invest-in-its-future/" },

  { title: "Connecting Communities to Support Cambodia's Vulnerable",
    ogImage: "https://kosalnith.github.io/static/img/og/connecting-communities-to-support-cambodias-vulnerable.png",
    authors: "Kosal Nith", date: "13 Aug 2025", outlet: "East Asia Forum",
    type: "opeds", year: "2025", oa: false, lang: "en",
    breadcrumb: "Op-Ed / Commentary › Op-Ed",
    keywords: ["Social Protection","Vulnerable Households","Community","Cambodia"],
    kwStrength: ["full","full","half","none"],
    sdgs: ["SDG 1 - No Poverty","SDG 3 - Good Health and Well-being","SDG 10 - Reduced Inequalities"],
    link: "https://eastasiaforum.org/2025/08/13/connecting-communities-to-support-cambodias-vulnerable/" },

  { title: "Ascending the Development Ladder in Cambodia: Progressing Towards Higher Income Status",
    ogImage: "https://kosalnith.github.io/static/img/og/ascending-the-development-ladder-in-cambodia-progressing-towards-higher-income-s.png",
    authors: "Kosal Nith, Sovannroeun Samreth & Sopheak Song", date: "7 Dec 2023",
    outlet: "The Cambodia Outlook Conference",
    type: "opeds", year: "2024", oa: false, lang: "en",
    breadcrumb: "Op-Ed / Commentary › Conference commentary",
    keywords: ["Economic Development","Middle-Income Status","Growth","Cambodia"],
    kwStrength: ["full","full","half","none"],
    sdgs: ["SDG 8 - Decent Work and Economic Growth","SDG 9 - Industry, Innovation, and Infrastructure","SDG 10 - Reduced Inequalities"],
    link: "https://coc2023.cdri.org.kh/ascending-the-development-ladder-in-cambodia-progressing-towards-higher-income-status/" },

  { title: "Explainer: How Cambodia's Central Bank Addressed Economic Challenges During the Pandemic",
    ogImage: "https://kosalnith.github.io/static/img/og/explainer-how-cambodias-central-bank-addressed-economic-challenges-during-the-pa.png",
    authors: "Kosal Nith", date: "7 Jul 2023", outlet: "The Camboja News",
    type: "opeds", year: "2023", oa: false, lang: "en",
    breadcrumb: "Op-Ed / Commentary › Op-Ed",
    keywords: ["Monetary Policy","Central Bank","COVID-19","Cambodia"],
    kwStrength: ["full","full","full","none"],
    sdgs: ["SDG 8 - Decent Work and Economic Growth","SDG 3 - Good Health and Well-being"],
    link: "https://cambojanews.com/explainer-how-cambodias-central-bank-addressed-economic-challenges-during-the-pandemic/" },

  { title: "Will Cambodia Commit to Protecting Its Forests?",
    ogImage: "https://kosalnith.github.io/static/img/og/will-cambodia-commit-to-protecting-its-forests.png",
    authors: "Kosal Nith", date: "13 Nov 2021", outlet: "The Diplomat",
    type: "opeds", year: "2021", oa: false, lang: "en",
    breadcrumb: "Op-Ed / Commentary › Op-Ed",
    keywords: ["Deforestation","Forest Policy","Climate","Cambodia"],
    kwStrength: ["full","full","half","none"],
    sdgs: ["SDG 13 - Climate Action","SDG 15 - Life on Land"],
    link: "https://thediplomat.com/2021/11/will-cambodia-commit-to-protecting-its-forests/" },

  { title: "Pandemic Offers Chance to Consider Higher Taxes, not Donations, From Rich",
    ogImage: "https://kosalnith.github.io/static/img/og/pandemic-offers-chance-to-consider-higher-taxes-not-donations-from-rich.png",
    authors: "Kosal Nith", date: "13 Aug 2021", outlet: "VOD",
    type: "opeds", year: "2021", oa: false, lang: "en",
    breadcrumb: "Op-Ed / Commentary › Op-Ed",
    keywords: ["Taxation","Inequality","COVID-19","Cambodia"],
    kwStrength: ["full","full","half","none"],
    sdgs: ["SDG 1 - No Poverty","SDG 10 - Reduced Inequalities","SDG 3 - Good Health and Well-being"],
    link: "https://vodenglish.news/opinion-pandemic-offers-chance-to-consider-higher-taxes-not-donations-from-rich/" },

  { title: "How Cambodia's Agricultural Lending Can Get a Bigger Bang for Its Buck",
    ogImage: "https://kosalnith.github.io/static/img/og/how-cambodias-agricultural-lending-can-get-a-bigger-bang-for-its-buck.png",
    authors: "Kosal Nith", date: "29 May 2021", outlet: "East Asia Forum",
    type: "opeds", year: "2021", oa: false, lang: "en",
    breadcrumb: "Op-Ed / Commentary › Op-Ed",
    keywords: ["Agricultural Finance","Credit","Rural Economy","Cambodia"],
    kwStrength: ["full","full","half","none"],
    sdgs: ["SDG 2 - Zero Hunger","SDG 1 - No Poverty","SDG 8 - Decent Work and Economic Growth"],
    link: "https://www.eastasiaforum.org/2021/05/29/how-cambodias-agricultural-lending-can-get-a-bigger-bang-for-its-buck/" },

  { title: "Rising Inflation Threatens to Swamp Cambodian Households",
    ogImage: "https://kosalnith.github.io/static/img/og/rising-inflation-threatens-to-swamp-cambodian-households.png",
    authors: "Kosal Nith", date: "26 May 2021", outlet: "The Diplomat",
    type: "opeds", year: "2021", oa: false, lang: "en",
    breadcrumb: "Op-Ed / Commentary › Op-Ed",
    keywords: ["Inflation","Household Welfare","Monetary Policy","Cambodia"],
    kwStrength: ["full","full","half","none"],
    sdgs: ["SDG 1 - No Poverty","SDG 10 - Reduced Inequalities","SDG 8 - Decent Work and Economic Growth"],
    link: "https://thediplomat.com/2021/05/rising-inflation-threatens-to-swamp-cambodian-households/" },

  { title: "Lockdown's Food Security Crisis Must Address Demand and Supply",
    ogImage: "https://kosalnith.github.io/static/img/og/lockdowns-food-security-crisis-must-address-demand-and-supply.png",
    authors: "Kosal Nith & Kimly Lay", date: "4 May 2021", outlet: "VOD",
    type: "opeds", year: "2021", oa: false, lang: "en",
    breadcrumb: "Op-Ed / Commentary › Op-Ed",
    keywords: ["Food Security","COVID-19","Lockdown","Cambodia"],
    kwStrength: ["full","full","full","none"],
    sdgs: ["SDG 2 - Zero Hunger","SDG 1 - No Poverty","SDG 3 - Good Health and Well-being"],
    link: "https://vodenglish.news/lockdowns-food-security-crisis-must-address-demand-and-supply/" },

  { title: "Cambodia's Economic Recovery Uncertain Amid Covid",
    ogImage: "https://kosalnith.github.io/static/img/og/cambodias-economic-recovery-uncertain-amid-covid.png",
    authors: "Kosal Nith", date: "6 Apr 2021", outlet: "The Phnom Penh Post",
    type: "opeds", year: "2021", oa: false, lang: "en",
    breadcrumb: "Op-Ed / Commentary › Op-Ed",
    keywords: ["Economic Recovery","COVID-19","GDP","Cambodia"],
    kwStrength: ["full","full","half","none"],
    sdgs: ["SDG 8 - Decent Work and Economic Growth","SDG 9 - Industry, Innovation, and Infrastructure"] },

  { title: "Cambodia Will Lose Its Fight Against Deforestation If Change Isn't Made",
    ogImage: "https://kosalnith.github.io/static/img/og/cambodia-will-lose-its-fight-against-deforestation-if-change-isnt-made.png",
    authors: "Kosal Nith", date: "16 Mar 2021", outlet: "Southeast Asia Globe",
    type: "opeds", year: "2021", oa: false, lang: "en",
    breadcrumb: "Op-Ed / Commentary › Op-Ed",
    keywords: ["Deforestation","Forest Policy","Environment","Cambodia"],
    kwStrength: ["full","full","half","none"],
    sdgs: ["SDG 13 - Climate Action","SDG 15 - Life on Land","SDG 16 - Peace, Justice and Strong Institutions"] },

  { title: "Kingdom's Agro-Processing Potential",
    ogImage: "https://kosalnith.github.io/static/img/og/kingdoms-agro-processing-potential.png",
    authors: "Kosal Nith", date: "8 Jun 2020", outlet: "The Phnom Penh Post",
    type: "opeds", year: "2020", oa: false, lang: "en",
    breadcrumb: "Op-Ed / Commentary › Op-Ed",
    keywords: ["Agro-Processing","Agriculture","Industry","Cambodia"],
    kwStrength: ["full","full","half","none"],
    sdgs: ["SDG 2 - Zero Hunger","SDG 8 - Decent Work and Economic Growth","SDG 9 - Industry, Innovation, and Infrastructure"] },

  { title: "Cambodia's Agricultural Sector is in Dire Need of Revitalization",
    ogImage: "https://kosalnith.github.io/static/img/og/cambodias-agricultural-sector-is-in-dire-need-of-revitalization.png",
    authors: "Kosal Nith", date: "21 May 2020", outlet: "Southeast Asia Globe",
    type: "opeds", year: "2020", oa: false, lang: "en",
    breadcrumb: "Op-Ed / Commentary › Op-Ed",
    keywords: ["Agriculture","Rural Development","Policy","Cambodia"],
    kwStrength: ["full","full","half","none"],
    sdgs: ["SDG 2 - Zero Hunger","SDG 1 - No Poverty","SDG 8 - Decent Work and Economic Growth"] },

  // ══ Journal Article (1) ══════════════════════════════════════

  { title: "Determinants of Informal Borrowing: Evidence from Households in 11 Rural Villages in Cambodia",
    ogImage: "https://kosalnith.github.io/static/img/og/determinants-of-informal-borrowing-evidence-from-households-in-11-rural-villages.png",
    authors: "Kosal Nith & Sovannroeun Samreth", date: "2025 (forthcoming)",
    outlet: "Journal of International Development Studies",
    month: "forthcoming",
    type: "articles", year: "2025", oa: false, lang: "en", forthcoming: true,
    breadcrumb: "Journal article › Research › peer-review",
    abstract: "Informal borrowing remains an important source of financing for rural Cambodian households, exposing them to exploitative interest rates. Using survey data from 1,183 households in 11 villages, we analyze how financial literacy, social capital, and household characteristics shape borrowing behavior. Higher financial literacy is significantly correlated with a lower likelihood of relying on informal loans. Finance-related group membership reduces informal borrowing; other community group membership does not. Household income and residential land ownership reduce reliance on informal borrowing.",
    keywords: ["Informal Borrowing","Financial Literacy","Social Capital","Rural Households","Cambodia"],
    kwStrength: ["full","full","full","half","none"],
    sdgs: ["SDG 1 - No Poverty","SDG 8 - Decent Work and Economic Growth","SDG 10 - Reduced Inequalities"] },

  // ══ Book Chapters (2) ════════════════════════════════════════

  { title: "Cambodian Cassava: An Analysis on Production, Productivity, and Gender Impacts",
    ogImage: "https://kosalnith.github.io/static/img/og/cambodian-cassava-an-analysis-on-production-productivity-and-gender-impacts.png",
    authors: "Kosal Nith & Yuki Kanayama", date: "Oct 2025",
    outlet: "Navigating Through Crisis: Socio-Economic Impact of COVID-19 in the Mekong Delta Countries",
    publisher: "Springer", month: "October", year_pub: "2025",
    type: "chapters", year: "2026", oa: true, lang: "en",
    breadcrumb: "Book chapter › Research › peer-review",
    abstract: "Using data from 301 cassava-farming households across five major cultivation provinces, this study examines the pandemic's impact on production, labor productivity, and labor participation. Between 2019 and 2021, average production costs rose by 9.3%, while income declined by 8.5%. Despite expanding cultivated land and increasing hired labor, overall productivity decreased.",
    keywords: ["Cassava","COVID-19","Agricultural Productivity","Gender","Cambodia"],
    kwStrength: ["full","full","full","half","none"],
    sdgs: ["SDG 2 - Zero Hunger","SDG 5 - Gender Equality","SDG 8 - Decent Work and Economic Growth"],
    link: "https://link.springer.com/chapter/10.1007/978-981-95-1637-7_3" },

  { title: "Food Science in Cambodia",
    ogImage: "https://kosalnith.github.io/static/img/og/food-science-in-cambodia.png",
    authors: "Kosal Nith", date: "2021",
    outlet: "Micro-Policy Intervention: Contemporary Policy Discussion in Cambodia, Future Forum, Ch. 13",
    type: "chapters", year: "2021", oa: true, lang: "en",
    breadcrumb: "Book chapter › Book",
    abstract: "This paper examines how the development of food science, the role of R&D in the promotion, and the development of the food industry could positively impact the agricultural sector in Cambodia.",
    keywords: ["Food Science","R&D","Agriculture","Policy","Cambodia"],
    kwStrength: ["full","full","full","half","none"],
    sdgs: ["SDG 2 - Zero Hunger","SDG 9 - Industry, Innovation, and Infrastructure","SDG 12 - Responsible Consumption and Production"],
    link: "https://www.futureforum.asia/policy-briefs-and-snapshots/food-science-in-cambodia",
    resources: [
      { label: "Paper", url: "https://www.futureforum.asia/policy-briefs-and-snapshots/food-science-in-cambodia", icon: "fa-file-pdf" },
      { label: "Slides", url: "", icon: "fa-person-chalkboard" },
      { label: "Thread", url: "", icon: "fa-brands fa-x-twitter" }
    ] },

  // ══ Working Papers (4) ═══════════════════════════════════════
  { title: "Does Social Capital Strengthen the Stability of Household Income? Evidence from Cambodia",
    ogImage: "https://kosalnith.github.io/static/img/og/does-social-capital-strengthen-the-stability-of-household-income-evidence-from-c.png",
    authors: "Kosal Nith, Sovannroeun Samreth & Dina Chhorn",
    date: "Aug 2025", outlet: "Working paper",
    abstract: "The measurement of Special Economic Zones (SEZ) spatial impacts remains a persistent challenge for practitioners in understudied regions where conventional data collection methods prove cost-prohibitive. This study advances a replicable geospatial methodology leveraging Google's Open Buildings 2.5D Temporal Dataset to analyze development patterns in data-scarce contexts. Through examination of 11 SEZs in Cambodia's Svay Rieng province (2016-2023), we reveal two critical findings that challenge prevailing assumptions: first, SEZ-induced spillovers extend substantially beyond the conventionally assumed 1-2 kilometer impact radius; second, development follows a distinctive dual-ring spatial pattern, with outer zones (2-5km) demonstrating near-equivalent building density (21.27/km²) to immediate perimeter areas. Our approach provides three key contributions to the literature and practice: (1) a transferable framework for SEZ impact assessment in understudied regions, (2) empirical evidence challenging linear distance-decay models of agglomeration effects, and (3) demonstration of how accessible satellite-derived data can overcome traditional barriers to evidence-based planning. The methodology's versatility extends beyond SEZ analysis, offering practitioners an operational toolkit for growth monitoring, infrastructure impact assessment, and cross-border development analysis across ASEAN's diverse development contexts. By transforming publicly available building data into actionable spatial intelligence, this approach significantly enhances planning capacity in regions where ground-truth data remains systematically unavailable.",
    type: "working", year: "2025", oa: false, lang: "en",
    breadcrumb: "Working paper",
    keywords: ["Social Capital","Household Income","Income Stability","Cambodia"],
    kwStrength: ["full","full","full","none"],
    sdgs: ["SDG 1 - No Poverty","SDG 10 - Reduced Inequalities","SDG 8 - Decent Work and Economic Growth"],
    resources: [
      { label: "Slides", url: "", icon: "fa-person-chalkboard" }
    ] },

  { title: "Measuring SEZ Spillovers in Data-Scarce Regions: Evidence from Cambodia's Open Building Data",
    ogImage: "https://kosalnith.github.io/static/img/og/measuring-sez-spillovers-in-data-scarce-regions-evidence-from-cambodias-open-bui.png",
    authors: "Kosal Nith, Daniel Yonto, Yudo Angorro & Vuthoun Khiev",
    date: "Jun 2025", outlet: "Submitted to South East Asia Research",
    type: "working", year: "2025", oa: false, lang: "en", underReview: true,
    breadcrumb: "Working paper",
    abstract: "The measurement of Special Economic Zones (SEZ) spatial impacts remains a persistent challenge for practitioners in understudied regions where conventional data collection methods prove cost-prohibitive. This study advances a replicable geospatial methodology leveraging Google's Open Buildings 2.5D Temporal Dataset to analyze development patterns in data-scarce contexts. Through examination of 11 SEZs in Cambodia's Svay Rieng province (2016-2023), we reveal two critical findings that challenge prevailing assumptions: first, SEZ-induced spillovers extend substantially beyond the conventionally assumed 1-2 kilometer impact radius; second, development follows a distinctive dual-ring spatial pattern, with outer zones (2-5km) demonstrating near-equivalent building density (21.27/km²) to immediate perimeter areas. Our approach provides three key contributions to the literature and practice: (1) a transferable framework for SEZ impact assessment in understudied regions, (2) empirical evidence challenging linear distance-decay models of agglomeration effects, and (3) demonstration of how accessible satellite-derived data can overcome traditional barriers to evidence-based planning. The methodology's versatility extends beyond SEZ analysis, offering practitioners an operational toolkit for growth monitoring, infrastructure impact assessment, and cross-border development analysis across ASEAN's diverse development contexts. By transforming publicly available building data into actionable spatial intelligence, this approach significantly enhances planning capacity in regions where ground-truth data remains systematically unavailable.",
    keywords: ["Special Economic Zones","Spillovers","Geospatial Analysis","Open Buildings","Cambodia"],
    kwStrength: ["full","full","full","half","none"],
    sdgs: ["SDG 9 - Industry, Innovation, and Infrastructure","SDG 11 - Sustainable Cities and Communities","SDG 8 - Decent Work and Economic Growth"] },

  { title: "20 Years of FDI in Cambodia: Towards Upper Middle-Income Status and Beyond",
    ogImage: "https://kosalnith.github.io/static/img/og/20-years-of-fdi-in-cambodia-towards-upper-middle-income-status-and-beyond.png",
    authors: "Kosal Nith, Simona Iammarino & Sumontheany Muth",
    date: "May 2024", outlet: "CDRI Working Paper 149",
    type: "working", year: "2024", oa: true, lang: "en",
    breadcrumb: "Working paper",
    abstract: "Analysing Cambodia's Greenfield FDI inflows and outflows over 20 years (2003–2022) using fDiMarkets data. Key attracting sectors include real estate, financial services, and renewable energy. Most FDI is concentrated in the capital. Cambodia's outward FDI began in 2008, mainly targeting ASEAN countries.",
    keywords: ["Foreign Direct Investment","Greenfield FDI","Global Value Chains","Economic Development","Cambodia"],
    kwStrength: ["full","full","full","half","none"],
    sdgs: ["SDG 8 - Decent Work and Economic Growth","SDG 9 - Industry, Innovation, and Infrastructure","SDG 17 - Partnerships for the Goals"],
    downloads: 43,
    resources: [
      { label: "Paper", url: "https://www.cdri.org.kh/webdata/doc/2024/wp149e.pdf", icon: "fa-file-pdf" },
      { label: "Slides", url: "", icon: "fa-person-chalkboard" },
      { label: "Thread", url: "", icon: "fa-brands fa-x-twitter" }
    ] },

  { title: "Monetary Policy and Household Income Distribution: An Empirical Analysis from Cambodia",
    ogImage: "https://kosalnith.github.io/static/img/og/monetary-policy-and-household-income-distribution-an-empirical-analysis-from-cam.png",
    authors: "Kosal Nith", date: "Apr 2022", outlet: "Future Forum",
    type: "working", year: "2022", oa: false, lang: "en",
    breadcrumb: "Working paper",
    abstract: "Using a Structural VAR model, this paper finds that monetary policy shocks via exchange rate have positive consequences on inflation, real output, and unemployment. Cross-sectional data 2014–2020 shows earning heterogeneity, Fisher, and interest rate exposure channels amplify monetary policy effects. Household consumption and liability inequality rose while income and asset inequality fell over 7 years.",
    keywords: ["Monetary Policy","Income Distribution","Structural VAR","Inequality","Cambodia"],
    kwStrength: ["full","full","full","half","none"],
    sdgs: ["SDG 10 - Reduced Inequalities","SDG 1 - No Poverty","SDG 8 - Decent Work and Economic Growth"],
    downloads: 28,
    resources: [
      { label: "Paper", url: "", icon: "fa-file-pdf" },
      { label: "Online Appendix", url: "", icon: "fa-file-lines" },
      { label: "Replication Files", url: "", icon: "fa-code" }
    ] },

  // ══ Other Publications (6) ═══════════════════════════════════

  { title: "Assessing MSME Market Dynamics and Resilience in Phnom Penh: Challenges and Opportunities",
    ogImage: "https://kosalnith.github.io/static/img/og/assessing-msme-market-dynamics-and-resilience-in-phnom-penh-challenges-and-oppor.png",
    authors: "Kosal Nith, Dina Chhorn, I Younan An, Sivly Houy, Muny Nhim Kean & Sosengphyrun Mao",
    date: "Nov 2025", outlet: "Cambodia Development Resource Institute",
    type: "other", year: "2025", oa: true, lang: "en",
    breadcrumb: "Other publication › Research report",
    abstract: "Based on data from 14,820 establishments in Khan Meanchey, Phnom Penh, this report examines MSME market dynamics and resilience. Despite a strong post-pandemic recovery in 2023, early signs of slowdown emerged in 2024. The high business turnover — 1,790 openings versus 825 closures — reflects a survivalist approach to entrepreneurship. Most MSMEs remain informal and micro-scale.",
    keywords: ["MSMEs","Urban Economy","Phnom Penh","Resilience","Entrepreneurship"],
    kwStrength: ["full","full","full","half","none"],
    sdgs: ["SDG 8 - Decent Work and Economic Growth","SDG 11 - Sustainable Cities and Communities","SDG 9 - Industry, Innovation, and Infrastructure"],
    downloads: 12 },

  { title: "Government Ownership of Banks: Diversifying of Potential Products and Factors to Subsidize Agriculture",
    ogImage: "https://kosalnith.github.io/static/img/og/government-ownership-of-banks-diversifying-of-potential-products-and-factors-to.png",
    authors: "Kosal Nith", date: "Dec 2025", outlet: "Future Forum",
    type: "other", year: "2025", oa: false, lang: "en",
    breadcrumb: "Other publication › Research report",
    abstract: "This study uses a two-step GMM estimator on national-level data for 32 crop products and 14 livestock products from Cambodia (1989–2018) to identify the potential products and factors in agriculture that public banks should subsidize.",
    keywords: ["Public Banks","Government Ownership","Agriculture","Subsidies","Cambodia"],
    kwStrength: ["full","full","full","half","none"],
    sdgs: ["SDG 2 - Zero Hunger","SDG 8 - Decent Work and Economic Growth","SDG 1 - No Poverty"],
    resources: [
      { label: "Paper", url: "", icon: "fa-file-pdf" },
      { label: "Slides", url: "", icon: "fa-person-chalkboard" },
      { label: "Replication Files", url: "", icon: "fa-code" },
      { label: "Thread", url: "", icon: "fa-brands fa-x-twitter" }
    ] },

  { title: "Mapping Study: Youth and Civil Society in Urban Cambodia",
    ogImage: "https://kosalnith.github.io/static/img/og/mapping-study-youth-and-civil-society-in-urban-cambodia.png",
    authors: "Kosal Nith", date: "Sep 2022", outlet: "Future Forum",
    type: "other", year: "2022", oa: false, lang: "en",
    breadcrumb: "Other publication › Research report",
    abstract: "Around 65.3% of Cambodia's population is under 30. This mapping study — commissioned by the EU Delegation to Cambodia — explores the aspirations, challenges, and needs of youth actors in civil society organizations in urban Cambodia.",
    keywords: ["Youth","Civil Society","Civic Engagement","Democracy","Cambodia"],
    kwStrength: ["full","full","half","none","none"],
    sdgs: ["SDG 4 - Quality Education","SDG 16 - Peace, Justice and Strong Institutions","SDG 10 - Reduced Inequalities"] },

  { title: "Household Saving and Debt",
    ogImage: "https://kosalnith.github.io/static/img/og/household-saving-and-debt.png",
    authors: "Kosal Nith & Summer-Solstice Thomas", date: "Jun 2021",
    outlet: "Revisiting the Pandemic: Rapid Survey on the Impact of Covid-19 on MSMEs and Households, The Asia Foundation",
    type: "other", year: "2021", oa: false, lang: "en",
    sdgs: ["SDG 1 - No Poverty","SDG 8 - Decent Work and Economic Growth"],
    breadcrumb: "Other publication › Book section" },

  { title: "Rapport de Stage : Assistant de Programme de l'Engagement des Jeunes pour l'Action Sociale",
    ogImage: "https://kosalnith.github.io/static/img/og/rapport-de-stage-assistant-de-programme-de-lengagement-des-jeunes-pour-laction-s.png",
    authors: "Kosal Nith", date: "Jan 2019",
    outlet: "Royal University of Law and Economics",
    type: "other", year: "2019", oa: false, lang: "fr",
    breadcrumb: "Other publication › Internship report",
    abstract: "Le présent document décrit le YRDP ainsi que mon travail dans cette organisation. Ce rapport vise à fournir un aperçu de l'utilisation des matières étudiées à l'Université Royale de Droit et de Sciences Économiques pour la mise en oeuvre de travail dans l'organisation de YRDP.",
    keywords: ["Youth","Civil Society","Social Engagement","Cambodia"],
    kwStrength: ["full","full","half","none"],
    sdgs: ["SDG 4 - Quality Education","SDG 16 - Peace, Justice and Strong Institutions"] },

  { title: "Reinvigorating Cambodian Agriculture: Transforming from Extensive to Intensive Agriculture",
    ogImage: "https://kosalnith.github.io/static/img/og/reinvigorating-cambodian-agriculture-transforming-from-extensive-to-intensive-ag.png",
    authors: "Kosal Nith & Singhong Ly", date: "Dec 2018",
    outlet: "National Bank of Cambodia — 5th Annual Macroeconomic Conference",
    type: "other", year: "2018", oa: false, lang: "en", award: true,
    breadcrumb: "Other publication › Conference paper",
    abstract: "Comparing Cambodian agriculture to Southeast Asian neighbors over 22 years (1996–2018), this paper identifies factors constraining the transition from extensive to intensive agriculture, including high production costs, limited technology use, and low market prices.",
    keywords: ["Agriculture","Intensive Farming","Productivity","Southeast Asia","Cambodia"],
    kwStrength: ["full","full","full","half","none"],
    sdgs: ["SDG 2 - Zero Hunger","SDG 8 - Decent Work and Economic Growth","SDG 9 - Industry, Innovation, and Infrastructure"],
    downloads: 7,
    resources: [
      { label: "Paper", url: "", icon: "fa-file-pdf" },
      { label: "Slides", url: "", icon: "fa-person-chalkboard" }
    ] },

  // ══ Policy Briefs (2) ════════════════════════════════════════

  { title: "Monetary Policy: How Does It Become a Tool to Support Poor Households Afford to Purchase an Affordable House?",
    ogImage: "https://kosalnith.github.io/static/img/og/monetary-policy-how-does-it-become-a-tool-to-support-poor-households-afford-to-p.png",
    authors: "Kosal Nith", date: "Nov 2022", outlet: "Policy brief",
    type: "policy", year: "2022", oa: false, lang: "en",
    breadcrumb: "Policy brief",
    abstract: "Cambodia's current monetary policy lacks the autonomy to tackle affordable housing due to non-independent monetary tools and high dollarization. Liquidity-providing collateralized operations (LPCO) show promise as an innovative approach, partnering with private banks to offer low-interest mortgages.",
    keywords: ["Monetary Policy","Affordable Housing","Dollarization","Cambodia"],
    kwStrength: ["full","full","full","none"],
    sdgs: ["SDG 1 - No Poverty","SDG 11 - Sustainable Cities and Communities","SDG 10 - Reduced Inequalities"],
    resources: [
      { label: "Paper", url: "", icon: "fa-file-pdf" },
      { label: "Slides", url: "", icon: "fa-person-chalkboard" }
    ] },

  { title: "How Should Cambodia Prepare for the Fourth Industrial Revolution?",
    ogImage: "https://kosalnith.github.io/static/img/og/how-should-cambodia-prepare-for-the-fourth-industrial-revolution.png",
    authors: "Kosal Nith", date: "8 May 2020",
    outlet: "Cambodia Development Center, Essay Contest 2019",
    type: "policy", year: "2020", oa: false, lang: "en", award: true,
    breadcrumb: "Policy brief",
    keywords: ["Industry 4.0","Technology","Economic Development","Cambodia"],
    kwStrength: ["full","full","half","none"],
    sdgs: ["SDG 9 - Industry, Innovation, and Infrastructure","SDG 8 - Decent Work and Economic Growth","SDG 4 - Quality Education"],
    link: "https://www.cd-center.org/wp-content/uploads/2020/05/P126_20200508_EC19W1.pdf",
    resources: [
      { label: "Paper", url: "https://www.cd-center.org/wp-content/uploads/2020/05/P126_20200508_EC19W1.pdf", icon: "fa-file-pdf" },
      { label: "Slides", url: "", icon: "fa-person-chalkboard" }
    ] },

  // ══ Work in Progress (3) ═════════════════════════════════════

  { title: "Dollarization and Monetary Policy in Cambodia: Challenges, International Lessons, and Policy Implications",
    ogImage: "https://kosalnith.github.io/static/img/og/dollarization-and-monetary-policy-in-cambodia-challenges-international-lessons-a.png",
    authors: "Kosal Nith, Sovannroeun Samreth & Hang Panha Hour",
    type: "progress", year: "progress", oa: false, lang: "en",
    sdgs: ["SDG 8 - Decent Work and Economic Growth","SDG 10 - Reduced Inequalities"],
    breadcrumb: "Work in progress" },

  { title: "International Trade and Globalization in Cambodia: The Role of International Cooperation",
    ogImage: "https://kosalnith.github.io/static/img/og/international-trade-and-globalization-in-cambodia-the-role-of-international-coop.png",
    authors: "Kosal Nith & Ronald A. Ruran",
    type: "progress", year: "progress", oa: false, lang: "en",
    sdgs: ["SDG 17 - Partnerships for the Goals","SDG 8 - Decent Work and Economic Growth"],
    breadcrumb: "Work in progress" },

  { title: "The Survey on Skills Demand in Cambodia",
    ogImage: "https://kosalnith.github.io/static/img/og/the-survey-on-skills-demand-in-cambodia.png",
    authors: "Kosal Nith, Dina Chhorn, Sivly Houy & Muny Nhim Kean",
    type: "progress", year: "progress", oa: false, lang: "en",
    sdgs: ["SDG 4 - Quality Education","SDG 8 - Decent Work and Economic Growth"],
    breadcrumb: "Work in progress" }
];
