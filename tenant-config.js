/* ──────────────────────────────────────────
   TENANT CONFIGURATION
   Change this file to deploy for a different organization.
   Everything else stays the same.
   ────────────────────────────────────────── */
const TENANT = {
  id: 'hartman',
  name: 'Shalom Hartman Institute',
  shortName: 'Hartman',
  poweredBy: { name: 'Adva Solutions', url: 'https://adva-solutions.com' },

  /* Branding — logo as inline SVG data URI */
  logoSvg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='#0c1f3f'/><text x='16' y='23' font-size='20' font-family='serif' fill='#c5973e' text-anchor='middle'>H</text></svg>`,

  /* Colors */
  colors: {
    primary:      '#c5973e',                   // Gold accent
    primaryLight: 'rgba(197,151,62,.12)',
    dark:         '#0c1f3f',                   // Navy
    green:        '#3a7a5c',
    text:         '#1a1a2e',
    textSecondary:'#5a5a6e',
    textLight:    '#999',
    bg:           '#faf9f6',
    bgWarm:       '#f0ede6',
    border:       '#ddd8ce',
    borderLight:  '#e8e4dc',
    white:        '#fff',
    /* Per-module accents */
    chatAccent:   '#0078d4',                   // Microsoft Blue
    appsAccent:   '#217346',                   // Excel Green
    agentsAccent: '#7b5ea7',                   // Purple
  },

  /* Typography */
  fonts: {
    display: "'Cormorant Garamond', Georgia, serif",
    body:    "'Source Sans 3', 'Source Sans Pro', sans-serif",
    googleUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Source+Sans+3:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap'
  },

  /* Workshop config */
  workshopTitle: 'Copilot Workshop',
  workshopSubtitle: 'AI Adoption Program',

  /* Listen Labs — pre-workshop interview study for prompt personalization */
  listenLabsStudyId: 'Qpx473f0',  // ODA - Workplace & AI Readiness Assessment

  /* Course modules — toggle enabled/disabled per tenant */
  courses: {
    chat:   { enabled: true, label: 'Copilot Chat',    shortLabel: 'Chat',   totalSteps: 8, totalPoints: 115 },
    apps:   { enabled: true, label: 'Copilot in Apps',  shortLabel: 'Apps',   totalSteps: 10, totalPoints: 200 },
    agents: { enabled: true, label: 'Building Agents',  shortLabel: 'Agents', totalSteps: 8,  totalPoints: 200 },
  },

  /* Redis key prefix for multi-tenant isolation */
  redisPrefix: 'hartman'
};

/* Export for both browser <script> and module contexts */
if (typeof module !== 'undefined') module.exports = TENANT;
