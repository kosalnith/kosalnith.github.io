// ----- Publication type definitions -----
const allPublicationTypes = [
  { key: "journal_article", label: "Journal article", count: 1, dataFilter: "articles" },
  { key: "article_in_proceeding", label: "Article in proceeding", count: 0, dataFilter: null },
  { key: "book_chapter", label: "Book chapter", count: 2, dataFilter: "chapters" },
  { key: "book", label: "Book", count: 0, dataFilter: null },
  { key: "report", label: "Report", count: 0, dataFilter: null },
  { key: "conf_abstract_conf", label: "Conference abstract for conference", count: 0, dataFilter: null },
  { key: "conf_abstract_proc", label: "Conference abstract in proceeding", count: 0, dataFilter: null },
  { key: "phd_thesis", label: "PhD thesis", count: 0, dataFilter: null },
  { key: "conf_abstract_journal", label: "Conference abstract in journal", count: 0, dataFilter: null },
  { key: "paper_no_publisher", label: "Paper without publisher/journal", count: 0, dataFilter: null },
  { key: "poster", label: "Poster", count: 0, dataFilter: null },
  { key: "review_article", label: "Review article", count: 0, dataFilter: null },
  { key: "working_paper", label: "Working paper", count: 4, dataFilter: "working" },
  { key: "conf_article_journal", label: "Conference article in journal", count: 0, dataFilter: null },
  { key: "anthology", label: "Anthology", count: 0, dataFilter: null },
  { key: "editorial", label: "Editorial", count: 0, dataFilter: null },
  { key: "literature_review", label: "Literature review", count: 0, dataFilter: null },
  { key: "comment_debate", label: "Comment/debate", count: 0, dataFilter: null },
  { key: "net_publication", label: "Net publication - Internet publication", count: 0, dataFilter: null },
  { key: "other_contribution", label: "Other contribution", count: 0, dataFilter: null },
  { key: "contribution_newspaper_review", label: "Contribution to newspaper - Review", count: 0, dataFilter: null },
  { key: "contribution_newspaper_feature", label: "Contribution to newspaper - Feature article", count: 0, dataFilter: null },
  { key: "contribution_newspaper_article", label: "Contribution to newspaper - Newspaper article", count: 0, dataFilter: null },
  { key: "preprint", label: "Preprint", count: 0, dataFilter: null },
  { key: "encyclopedia_chapter", label: "Encyclopedia chapter", count: 0, dataFilter: null },
  { key: "report_chapter", label: "Report chapter", count: 0, dataFilter: null },
  { key: "preface_intro", label: "Preface/Introduction/postscript", count: 0, dataFilter: null },
  { key: "letter", label: "Letter", count: 0, dataFilter: null },
  { key: "sound_visual", label: "Sound/Visual production (digital)", count: 0, dataFilter: null },
  { key: "patent", label: "Patent", count: 0, dataFilter: null },
  { key: "contribution_newspaper_comment", label: "Contribution to newspaper - Comment/debate", count: 0, dataFilter: null },
  { key: "compendium_notes", label: "Compendium/lecture notes", count: 0, dataFilter: null },
  { key: "memorandum", label: "Memorandum", count: 0, dataFilter: null },
  { key: "doctoral_thesis", label: "Doctoral thesis", count: 0, dataFilter: null },
  { key: "case_report", label: "Case Report", count: 0, dataFilter: null },
  { key: "computer_programme", label: "Computer programme", count: 0, dataFilter: null },
  { key: "comment", label: "Comment", count: 0, dataFilter: null },
  { key: "memorandum_contribution", label: "Memorandum contribution", count: 0, dataFilter: null },
  { key: "2d_3d", label: "2D/3D (Physical product)", count: 0, dataFilter: null },
  { key: "interactive_production", label: "Interactive production", count: 0, dataFilter: null },
  { key: "qanda_hearing", label: "Question & Answer/hearing", count: 0, dataFilter: null },
  { key: "compendium_chapter", label: "Compendium/lecture notes chapter", count: 0, dataFilter: null },
  { key: "qanda_contribution", label: "Question & Answer/hearing contribution", count: 0, dataFilter: null },
  { key: "article", label: "Article", count: 0, dataFilter: null },
  { key: "doctoral_thesis_dup", label: "Doctoral Thesis", count: 0, dataFilter: null },
  { key: "dataset", label: "Dataset", count: 0, dataFilter: null },
  { key: "masters_thesis", label: "Master's Thesis", count: 0, dataFilter: null }
];

allPublicationTypes.push({ key: "op_ed", label: "Op-Ed / Commentary", count: 9, dataFilter: "opeds" });
allPublicationTypes.push({ key: "policy_brief", label: "Policy brief", count: 2, dataFilter: "policy" });
allPublicationTypes.push({ key: "work_in_progress", label: "Work in progress", count: 3, dataFilter: "progress" });
allPublicationTypes.push({ key: "other_publication", label: "Other publication", count: 6, dataFilter: "other" });

// Remove duplicate labels
const uniqueTypes = [];
const seenLabels = new Set();
for (let t of allPublicationTypes) {
  if (!seenLabels.has(t.label)) {
    seenLabels.add(t.label);
    uniqueTypes.push(t);
  }
}

// Year data for filter
const yearItems = [
  { year: "2026", count: 3 },
  { year: "2025", count: 8 },
  { year: "2024", count: 2 },
  { year: "2023", count: 2 },
  { year: "2022", count: 3 },
  { year: "2021", count: 4 },
  { year: "2020", count: 1 },
  { year: "2019", count: 1 },
  { year: "2018", count: 1 }
];

// SDG data
const sdgItems = [
  { label: "SDG 1 - No Poverty", count: 83 }, { label: "SDG 2 - Zero Hunger", count: 79 },
  { label: "SDG 3 - Good Health and Well-being", count: 920 }, { label: "SDG 4 - Quality Education", count: 854 },
  { label: "SDG 5 - Gender Equality", count: 288 }, { label: "SDG 6 - Clean Water and Sanitation", count: 187 },
  { label: "SDG 7 - Affordable and Clean Energy", count: 969 }, { label: "SDG 8 - Decent Work and Economic Growth", count: 465 },
  { label: "SDG 9 - Industry, Innovation, and Infrastructure", count: 960 }, { label: "SDG 10 - Reduced Inequalities", count: 639 },
  { label: "SDG 11 - Sustainable Cities and Communities", count: 1208 }, { label: "SDG 12 - Responsible Consumption and Production", count: 876 },
  { label: "SDG 13 - Climate Action", count: 832 }, { label: "SDG 14 - Life Below Water", count: 229 },
  { label: "SDG 15 - Life on Land", count: 178 }, { label: "SDG 16 - Peace, Justice and Strong Institutions", count: 581 },
  { label: "SDG 17 - Partnerships for the Goals", count: 575 }
];

// Publications data
const publicationsData = [
  { title: "Capital Gains Tax Is a Smart Way to Build Infrastructure", authors: "Nith, K.", date: "22 Mar 2026", outlet: "Cambodianess", type: "opeds", year: "2026", oa: false, breadcrumb: "Op-Ed / Commentary › Op-Ed", keywords: ["Taxation","Cambodia","Infrastructure","Fiscal Policy"], kwStrength: ["full","full","half","none"], link: "https://cambodianess.com/article/capital-gains-tax-is-a-smart-way-to-build-infrastructure" },
  { title: "Transforming the Tax System with Personal Income Tax", authors: "Nith, K.", date: "4 Jan 2026", outlet: "Cambodianess", type: "opeds", year: "2026", oa: false, breadcrumb: "Op-Ed / Commentary › Op-Ed", keywords: ["Personal Income Tax","Tax Reform","Cambodia"], kwStrength: ["full","full","half"], link: "https://cambodianess.com/article/transforming-the-tax-system-with-personal-income-tax" },
  { title: "Cambodian Cassava and COVID-19: An Analysis of Production, Productivity and Gender Impacts", authors: "Nith, K. & Kanayama, Y.", date: "Nov 2025", outlet: "Springer (Navigating Through Crisis)", type: "chapters", year: "2026", oa: true, breadcrumb: "Book chapter › Research › peer-review", abstract: "Using data from 301 cassava-farming households, pandemic impact on production, labor productivity. Costs rose 9.3%, income declined 8.5%.", keywords: ["Cassava","COVID-19","Agricultural Productivity","Gender","Cambodia"], kwStrength: ["full","full","full","half","none"], link: "https://link.springer.com/chapter/10.1007/978-981-95-1637-7_3" },
  { title: "Determinants of Informal Borrowing: Evidence from Households in 11 Rural Villages in Cambodia", authors: "Nith, K. & Samreth, S.", date: "2025 (E-pub)", outlet: "Journal of International Development Studies", type: "articles", year: "2025", oa: false, forthcoming: true, abstract: "Financial literacy reduces reliance on informal loans.", keywords: ["Informal Borrowing","Financial Literacy","Social Capital","Rural Households","Cambodia"], kwStrength: ["full","full","full","half","none"] },
  { title: "Assessing MSME Market Dynamics and Resilience in Phnom Penh: Challenges and Opportunities", authors: "Nith, K., Chhorn, D., An, I.Y. et al.", date: "Nov 2025", outlet: "CDRI Research Report", type: "other", year: "2025", oa: true, abstract: "Data from 14,820 establishments. 1,790 openings vs 825 closures.", keywords: ["MSMEs","Phnom Penh","Urban Economy","Resilience"], kwStrength: ["full","full","half","none"], downloads: 12 },
  { title: "Government Ownership of Banks: Diversifying of Potential Products and Factors to Subsidize Agriculture", authors: "Nith, K.", date: "Dec 2025", outlet: "Future Forum", type: "other", year: "2025", oa: false, abstract: "Two-step GMM estimator on national-level data.", keywords: ["Public Banks","Agriculture","Subsidies","Cambodia"], kwStrength: ["full","full","half","none"] },
  { title: "Does Social Capital Strengthen the Stability of Household Income? Evidence from Cambodia", authors: "Nith, K., Samreth, S. & Chhorn, D.", date: "Aug 2025", outlet: "Working paper", type: "working", year: "2025", oa: false, keywords: ["Social Capital","Household Income","Cambodia"], kwStrength: ["full","full","none"] },
  { title: "Measuring SEZ Spillovers in Data-Scarce Regions: Evidence from Cambodia's Open Building Data", authors: "Nith, K., Yonto, D., Angorro, Y. & Khiev, V.", date: "Jul 2025", outlet: "South East Asia Research (Submitted)", type: "working", year: "2025", oa: false, underReview: true, abstract: "Geospatial method using Google Open Buildings 2.5D. SEZ spillovers extend beyond 1-2 km.", keywords: ["Special Economic Zones","Spillovers","Geospatial","Cambodia"], kwStrength: ["full","full","half","none"] },
  { title: "Cambodia Needs Progressive Taxation to Invest in Its Future", authors: "Nith, K.", date: "17 Oct 2025", outlet: "Camboja News", type: "opeds", year: "2025", oa: false, link: "https://cambojanews.com/op-ed-cambodia-needs-progressive-taxation-to-invest-in-its-future/" },
  { title: "Connecting Communities to Support Cambodia's Vulnerable", authors: "Nith, K.", date: "13 Aug 2025", outlet: "East Asia Forum", type: "opeds", year: "2025", oa: false, link: "https://eastasiaforum.org/2025/08/13/connecting-communities-to-support-cambodias-vulnerable/" },
  { title: "20 Years of FDI in Cambodia: Towards Upper Middle-Income Status and Beyond", authors: "Nith, K., Iammarino, S. & Muth, S.", date: "Apr 2024", outlet: "CDRI Working Paper 149", type: "working", year: "2024", oa: true, abstract: "Greenfield FDI 2003–2022, real estate, financial services.", keywords: ["Foreign Direct Investment","Economic Development","Global Value Chains","Cambodia"], kwStrength: ["full","full","half","none"], downloads: 43 },
  { title: "Ascending the Development Ladder in Cambodia: Progressing Towards Higher Income Status", authors: "Nith, K., Samreth, S. & Song, S.", date: "7 Dec 2023", outlet: "Cambodia Outlook Conference", type: "opeds", year: "2024", oa: false, link: "https://coc2023.cdri.org.kh/ascending-the-development-ladder-in-cambodia-progressing-towards-higher-income-status/" },
  { title: "Mapping Study: Youth and Civil Society in Urban Cambodia", authors: "Nith, K.", date: "Sep 2022", outlet: "Future Forum", type: "other", year: "2023", oa: false, abstract: "65.3% of population under 30.", keywords: ["Youth","Civil Society","Cambodia"], kwStrength: ["full","full","none"] },
  { title: "Explainer: How Cambodia's Central Bank Addressed Economic Challenges During the Pandemic", authors: "Nith, K.", date: "7 Jul 2023", outlet: "The Camboja News", type: "opeds", year: "2023", link: "https://cambojanews.com/explainer-how-cambodias-central-bank-addressed-economic-challenges-during-the-pandemic/" },
  { title: "Monetary Policy and Household Income Distribution: An Empirical Analysis from Cambodia", authors: "Nith, K.", date: "Apr 2022", outlet: "Future Forum", type: "working", year: "2022", oa: false, abstract: "Structural VAR, earning heterogeneity.", keywords: ["Monetary Policy","Income Distribution","Structural VAR","Cambodia"], kwStrength: ["full","full","half","none"], downloads: 28 },
  { title: "Monetary Policy: How Does It Become a Tool to Support Poor Households Afford to Purchase an Affordable House?", authors: "Nith, K.", date: "Nov 2022", outlet: "Policy brief", type: "policy", year: "2022", oa: false, abstract: "High dollarization limits autonomy.", keywords: ["Monetary Policy","Affordable Housing","Dollarization"], kwStrength: ["full","full","half"] },
  { title: "Food Science in Cambodia", authors: "Nith, K.", date: "2021", outlet: "Micro-Policy Intervention", type: "chapters", year: "2021", oa: true, abstract: "R&D impact on agriculture.", keywords: ["Food Science","Agriculture","Cambodia"], kwStrength: ["full","full","none"], link: "https://www.futureforum.asia/policy-briefs-and-snapshots/food-science-in-cambodia" },
  { title: "Household Saving and Debt", authors: "Nith, K. & Thomas, S.", date: "Jun 2021", outlet: "Revisiting the Pandemic", type: "other", year: "2021", oa: false },
  { title: "Will Cambodia Commit to Protecting Its Forests?", authors: "Nith, K.", date: "13 Nov 2021", outlet: "The Diplomat", type: "opeds", year: "2021", link: "https://thediplomat.com/2021/11/will-cambodia-commit-to-protecting-its-forests/" },
  { title: "Pandemic Offers Chance to Consider Higher Taxes, not Donations, From Rich", authors: "Nith, K.", date: "13 Aug 2021", outlet: "VOD", type: "opeds", year: "2021", link: "https://vodenglish.news/opinion-pandemic-offers-chance-to-consider-higher-taxes-not-donations-from-rich/" },
  { title: "How Cambodia's Agricultural Lending Can Get a Bigger Bang for Its Buck", authors: "Nith, K.", date: "29 May 2021", outlet: "East Asia Forum", type: "opeds", year: "2021", link: "https://www.eastasiaforum.org/2021/05/29/how-cambodias-agricultural-lending-can-get-a-bigger-bang-for-its-buck/" },
  { title: "How Should Cambodia Prepare for the Fourth Industrial Revolution?", authors: "Nith, K.", date: "May 2020", outlet: "Cambodia Development Center", type: "policy", year: "2020", oa: false, award: true, keywords: ["Industry 4.0","Cambodia"], kwStrength: ["full","half"], link: "https://www.cd-center.org/wp-content/uploads/2020/05/P126_20200508_EC19W1.pdf" },
  { title: "Rapport de Stage : Assistant de Programme de l'Engagement des Jeunes pour l'Action Sociale", authors: "Nith, K.", date: "Jan 2019", outlet: "Royal University of Law and Economics", type: "other", year: "2019", oa: false },
  { title: "Reinvigorating Cambodian Agriculture: Transforming from Extensive to Intensive Agriculture", authors: "Nith, K. & Ly, S.", date: "Dec 2018", outlet: "National Bank of Cambodia", type: "other", year: "2018", oa: false, award: true, abstract: "Comparison 1996–2018.", keywords: ["Agriculture","Intensive Farming","Cambodia"], kwStrength: ["full","full","none"], downloads: 7 },
  { title: "Dollarization and Monetary Policy in Cambodia: Challenges, International Lessons, and Policy Implications", authors: "Nith, K., Samreth, S. & Hour, H.P.", type: "progress", year: "progress", oa: false, breadcrumb: "Work in progress" },
  { title: "International Trade and Globalization in Cambodia: The Role of International Cooperation", authors: "Nith, K. & Ruran, R.A.", type: "progress", year: "progress", oa: false, breadcrumb: "Work in progress" },
  { title: "The Survey on Skills Demand in Cambodia", authors: "Nith, K., Chhorn, D., Houy, S. & Kean, M.N.", type: "progress", year: "progress", oa: false, breadcrumb: "Work in progress" }
];
