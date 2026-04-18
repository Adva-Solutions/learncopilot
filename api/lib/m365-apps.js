// M365 native apps with built-in Copilot (always status: "now")
export const M365_NATIVE_APPS = [
  'Outlook', 'Word', 'Excel', 'PowerPoint', 'Teams',
  'SharePoint', 'OneDrive', 'OneNote', 'Planner', 'Loop', 'Stream',
];

// Known Copilot connectors and their availability
export const COPILOT_CONNECTORS = [
  { name: 'Salesforce',     status: 'now',   detail: 'Native Copilot connector',           sourceId: 'src-copilot-connector' },
  { name: 'ServiceNow',     status: 'now',   detail: 'Native Copilot connector',           sourceId: 'src-copilot-connector' },
  { name: 'SAP',            status: 'now',   detail: 'Copilot connector via plugin',        sourceId: 'src-copilot-connector' },
  { name: 'Jira',           status: 'now',   detail: 'Copilot plugin available',            sourceId: 'src-copilot-connector' },
  { name: 'GitHub',         status: 'now',   detail: 'GitHub Copilot + M365 integration',   sourceId: 'src-copilot-connector' },
  { name: 'Power Automate', status: 'now',   detail: 'Deep M365 integration',               sourceId: 'src-m365-native' },
  { name: 'Power BI',       status: 'now',   detail: 'Copilot built into Power BI',         sourceId: 'src-m365-native' },
  { name: 'Dynamics 365',   status: 'now',   detail: 'Copilot built into Dynamics',         sourceId: 'src-m365-native' },
  { name: 'Slack',          status: 'now',   detail: 'M365 Copilot connector available',    sourceId: 'src-copilot-connector' },
  { name: 'Asana',          status: 'now',   detail: 'Copilot connector available',          sourceId: 'src-copilot-connector' },
  { name: 'Monday.com',     status: 'now',   detail: 'Copilot connector available',          sourceId: 'src-copilot-connector' },
  { name: 'Trello',         status: 'now',   detail: 'Copilot connector available',          sourceId: 'src-copilot-connector' },
  { name: 'Adobe Acrobat',  status: 'now',   detail: 'Copilot connector available',          sourceId: 'src-copilot-connector' },
  { name: 'HubSpot',        status: 'next',  detail: 'Connector in development',             sourceId: null },
  { name: 'QuickBooks',     status: 'next',  detail: 'Requires QuickBooks Online migration', sourceId: null },
  { name: 'Xero',           status: 'next',  detail: 'Integration via Power Automate',       sourceId: null },
  { name: 'Notion',         status: 'later', detail: 'No native connector; use file upload', sourceId: null },
  { name: 'Figma',          status: 'later', detail: 'No native connector',                  sourceId: null },
  { name: 'Miro',           status: 'later', detail: 'No native connector',                  sourceId: null },
  { name: 'Airtable',       status: 'later', detail: 'No native connector',                  sourceId: null },
];

// Classify a mentioned tool against known lists
export function classifyTool(toolName) {
  const lower = toolName.toLowerCase().trim();

  // Check M365 native apps first
  for (const app of M365_NATIVE_APPS) {
    if (app.toLowerCase() === lower) {
      return { tool: app, status: 'now', detail: 'M365 Copilot built-in', sourceId: 'src-m365-native' };
    }
  }

  // Check known connectors
  for (const c of COPILOT_CONNECTORS) {
    if (c.name.toLowerCase() === lower) {
      return { tool: c.name, status: c.status, detail: c.detail, sourceId: c.sourceId };
    }
  }

  return null; // Unknown — needs search or defaults to "later"
}
