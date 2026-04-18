// Domain allowlist for web-research claims in the Copilot Opportunity Map.
// Only URLs from these domains are trusted as sources.

const ALLOWLIST = {
  // Microsoft official documentation and community
  microsoft: [
    'microsoft.com',
    'learn.microsoft.com',
    'support.microsoft.com',
    'techcommunity.microsoft.com',
    'devblogs.microsoft.com',
    'aka.ms',
  ],
  // Industry benchmarks and research
  benchmark: [
    'mckinsey.com',
    'bcg.com',
    'deloitte.com',
    'gartner.com',
    'forrester.com',
    'idc.com',
    'hbr.org',
    'stackoverflow.blog',
    // Any .edu domain is allowed for benchmarks
  ],
  // Copilot-specific feature documentation
  feature: [
    'microsoft.com',
    'learn.microsoft.com',
    'support.microsoft.com',
    'techcommunity.microsoft.com',
    'copilot.microsoft.com',
  ],
};

function domainMatch(url, allowedDomain) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return hostname === allowedDomain || hostname.endsWith('.' + allowedDomain);
  } catch {
    return false;
  }
}

export function isAllowed(url, cls = 'microsoft') {
  if (!url || typeof url !== 'string') return false;
  const domains = ALLOWLIST[cls] || ALLOWLIST.microsoft;

  // .edu exception for benchmark class
  if (cls === 'benchmark') {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      if (hostname.endsWith('.edu') && hostname.length > 4) return true;
    } catch { /* ignore */ }
  }

  return domains.some((d) => domainMatch(url, d));
}

export function filterSources(sources, cls = 'microsoft') {
  return (sources || []).filter((s) => s?.url && isAllowed(s.url, cls));
}
