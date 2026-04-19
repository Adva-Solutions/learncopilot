// AUTO-EXTRACTED by scripts/extract-lessons.js — do not hand-edit without updating the extractor.
window.LESSONS = [
/* ===== LESSON 0 ===== */
{
  id: 1, title: "Word Copilot", points: 20, bonus: false,
  learn: `
<h3>What is Copilot in Apps?</h3>
<p>You have been using Copilot as a standalone chat. Now meet Copilot <em>inside</em> the Microsoft 365 apps you already use every day — Word, Excel, Outlook, PowerPoint, and Teams. Look for the <strong>Copilot icon in the ribbon</strong> of each app (usually on the Home tab, often with a sparkle / pilot-wing glyph). Click it and a side panel opens — that is Copilot, now reading the open document, spreadsheet, email, or slide in front of you, and able to write back into it.</p>
<p>The Custom Instructions and Memory you set up in the Chat course follow you into every app — a single configuration shapes every draft, summary, and analysis you produce here.</p>

<div class="note-box" style="background:#fffbf0;border-left:3px solid #c5973e;padding:12px 16px;margin:14px 0 18px;">
  <strong>How the Apps flow works:</strong> You'll start in <strong>Word</strong> (draft a real deliverable), then <strong>Excel</strong> (analyze your data and produce a dashboard), then link both back into the Chat Page you built. The module ends in <strong>Outlook</strong> — where you share what you made with a colleague. Each step feeds the next.
</div>

<div class="note-box" style="background:#fffbf0;border-left:3px solid #c5973e;padding:12px 16px;margin:14px 0 18px;">
  <strong>A quick note on agents:</strong> You will see the words "Agent Mode" and "agents" appear a few times in this module. For now, think of them as Copilot taking <em>multi-step action</em> inside an app (not just answering). Full coverage of building your own agents is the next course.
</div>

<h3>Copilot in Word</h3>
<p>Word is where the real deliverables live — memos, briefs, positioning statements, case studies, handoff docs.</p>
<p>Think of Copilot in Word as a co-author who never gets writer's block. You describe the document you need; it writes the first draft; your job is to shape it, not start from scratch.</p>
<p>Click the <strong>Copilot icon in the Home ribbon</strong> (far right of the Home tab, near Dictate). That opens the side panel. You can also summon it inline by typing a prompt where your cursor sits on a blank line.</p>

<h4>Work IQ — Copilot knows your workweek</h4>
<p>While you work in Word, Copilot silently pulls context from your emails, meetings, and chats. Drafting a follow-up memo? Copilot can tell you've been discussing the topic in Teams yesterday and pull a reference across. This is arguably the biggest upgrade to Copilot in the apps — your document now inherits the rest of your workweek without you copy-pasting context.</p>

<h4>Generate — blank page, describe what you need</h4>
<p>Click the Copilot icon on a blank page and describe what you need. Copilot creates a structured document with headings, sections, and formatting. Type <span class="inline-code">/</span> inside the prompt to reference files on OneDrive or SharePoint — e.g. <span class="inline-code">Draft a project summary based on /Q4 Sales Report.xlsx</span>.</p>

<h4>Rewrite — polish any selection</h4>
<p>Select any text, right-click, and choose <strong>Rewrite with Copilot</strong>. Pick a tone — more formal, more concise, more enthusiastic — and Copilot rewrites the selection in place. Works on a sentence, a paragraph, or the whole document.</p>

<h4>Reference — pull in other files</h4>
<p>Type <span class="inline-code">/</span> anywhere in a Copilot prompt to attach another file (OneDrive/SharePoint). Copilot synthesizes content from multiple sources into one coherent document — drafted once, grounded in real data.</p>

<h4>Agent Mode</h4>
<p>Agent Mode is Copilot <em>taking action</em> across your document, not just writing text. Ask it to restructure sections, add an executive summary, and adjust tone for a board audience, and it works through each step sequentially, explaining what it's doing. This is your first taste of an agent inside an app. The full treatment — how to build your own — is the next course.</p>

<h4>Auto-Citations</h4>
<p>When Copilot pulls from web sources or your organization's data, it automatically inserts footnotes with citations. No more guessing where the information came from.</p>

<h4>Document Comparison</h4>
<p>Open two versions of a specification, report, or contract side by side and ask Copilot to compare them. It highlights what changed, was added, or was removed — faster than reading both documents line by line. Useful for consultant submittals, spec revisions, or contract redlines.</p>

<div class="tip-box">
  <div class="tip-title">Tip</div>
  Use <span class="inline-code">/</span> references to ground Copilot in your actual files. Documents built from file references are significantly more accurate than ones from prompts alone.
</div>
`,
  implement: `
<h3>Exercise: Draft, Rewrite, and Agent-Edit in Word</h3>
<p>Pick your role below to get a tailored drafting exercise. You'll produce a real first draft, refine with Copilot's tone controls, then let Agent Mode restructure it.</p>

<div class="tip-box" style="margin-bottom:18px;">
  <div class="tip-title">Link this back to your Chat Page when you're done</div>
  <p>Once your v2 document reads the way you want, save it to OneDrive and paste the share link at the top of the <strong>L4 Page</strong> you built in the Chat course. That's how the Page becomes the single URL your teammate needs to see your work — the narrative <em>and</em> the deliverable in one place.</p>
</div>

<div class="option-tabs">
  <button class="option-tab active" onclick="switchOption(1,'a',this)">Architecture</button>
  <button class="option-tab" onclick="switchOption(1,'b',this)">HR</button>
  <button class="option-tab" onclick="switchOption(1,'c',this)">Marketing</button>
  <button class="option-tab" onclick="switchOption(1,'d',this)">Executive</button>
  <button class="option-tab" onclick="switchOption(1,'e',this)">Operations</button>
</div>

<div class="option-content active" data-lesson="1" data-key="a">
<h4>Architecture: Consultant Coordination Memo</h4>
<ol>
<li>Open <strong>Word</strong>. Create a new blank document.</li>
<li>Click the <strong>Copilot icon</strong> in the Home ribbon tab.</li>
<li>Type this prompt:
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Draft a consultant coordination memo regarding facade waterproofing issues on the Shore Club Fort Lauderdale project. Include these sections: Project Name and Number, Issue Description (water infiltration detected at curtain wall transitions during envelope testing), Consultant Actions Needed (envelope consultant to review detail revisions, structural engineer to confirm backup wall capacity, waterproofing sub to propose remediation), Deadline (responses needed within 10 business days), and Next Steps. Reference NYC and Florida building code differences where applicable. Use a professional but direct tone.</code></div></li>
<li>Read what Copilot generates. Confirm it created real structure with headers and specific consultant responsibilities.</li>
<li>Select the <strong>Issue Description</strong> section. Right-click and choose <strong>Rewrite with Copilot</strong>. Choose <strong>"Make it more formal"</strong>.</li>
<li>Compare the original with the rewritten version. The vocabulary should be more technical and precise.</li>
</ol>
<p><strong>Agent Mode:</strong> Click the Copilot icon and type:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Edit this document: add an Executive Summary at the top (2 sentences), and add a responsibility matrix table at the bottom listing each consultant, their action item, and deadline.</code></div>
<p><strong>Iterate:</strong> Refine the output:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Make the action items more specific — include exact deliverable names and reference any applicable building code sections.</code></div>
</div>

<div class="option-content" data-lesson="1" data-key="b">
<h4>HR: Employee Policy Update Memo</h4>
<ol>
<li>Open <strong>Word</strong>. Create a new blank document.</li>
<li>Click the <strong>Copilot icon</strong> in the Home ribbon tab.</li>
<li>Type this prompt:
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Draft an employee policy update memo announcing new remote work guidelines. Include these sections: Subject Line, Effective Date (May 1, 2026), Who It Applies To (all full-time employees), Key Changes (hybrid schedule now 3 days in-office / 2 days remote, core hours 10am-3pm on in-office days, remote work from outside the state requires manager approval), How to Request Exceptions, and Contact for Questions. Keep the tone professional but approachable.</code></div></li>
<li>Read what Copilot generates. Confirm it created clear sections with all the policy details.</li>
<li>Select the <strong>Key Changes</strong> section. Right-click and choose <strong>Rewrite with Copilot</strong>. Choose <strong>"Make it more concise"</strong>.</li>
<li>Compare the original with the rewritten version. The bullet points should be tighter.</li>
</ol>
<p><strong>Agent Mode:</strong> Click the Copilot icon and type:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Edit this document: add an FAQ section at the bottom with 5 common questions employees might have about the new policy, and add a brief leadership message at the top from the Head of HR.</code></div>
<p><strong>Iterate:</strong> Refine the output:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Make the tone warmer — this should feel supportive, not bureaucratic. Add a sentence about how the firm values flexibility.</code></div>
</div>

<div class="option-content" data-lesson="1" data-key="c">
<h4>Marketing: Project Case Study Narrative</h4>
<div class="note-box">
  <div class="note-title">Reference Material</div>
  <p>Download a completed case study for reference: <a href="/mock-data/proposals/case-study-harbor-view.pdf" download>Harbor View case study</a> or <a href="/mock-data/proposals/case-study-wynwood.pdf" download>Wynwood Arts case study</a>. You can upload one to Word and ask Copilot to draft a new case study in the same style.</p>
</div>
<ol>
<li>Open <strong>Word</strong>. Create a new blank document.</li>
<li>Click the <strong>Copilot icon</strong> in the Home ribbon tab.</li>
<li>Type this prompt:
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Draft a case study narrative for a completed architecture project. The project is "Harbor View Residences," a 200-unit waterfront residential building. Include these sections: Project Overview (2 paragraphs — location, program, client), Design Challenges (tight site, flood zone requirements, community opposition to height), Design Solutions (stepped massing, elevated ground floor, public waterfront promenade), Outcomes (LEED Gold, 95% sold before completion, AIA merit award), and a placeholder for a Client Quote. Write in a polished editorial tone suitable for the firm's website.</code></div></li>
<li>Read what Copilot generates. Confirm it created a compelling narrative with all requested sections.</li>
<li>Select the <strong>Design Solutions</strong> section. Right-click and choose <strong>Rewrite with Copilot</strong>. Choose <strong>"Make it more enthusiastic"</strong>.</li>
<li>Compare the versions. The rewrite should feel more like a design story and less like a report.</li>
</ol>
<p><strong>Agent Mode:</strong> Click the Copilot icon and type:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Edit this document: add a "Project Data" sidebar section with key metrics (total SF, unit count, project timeline, budget range) and add pull-quote placeholders throughout the narrative.</code></div>
<p><strong>Iterate:</strong> Refine the output:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Tighten the opening paragraph — lead with the most striking design feature, not the address. Make a reader want to keep reading.</code></div>
</div>

<div class="option-content" data-lesson="1" data-key="d">
<h4>Executive: Design Philosophy Positioning Statement</h4>
<div class="note-box">
  <div class="note-title">Reference Material</div>
  <p>Download the <a href="/mock-data/executive/oda-design-philosophy.pdf" download>ODA Design Philosophy</a> doc. Paste it into the Word document (or reference it with <span class="inline-code">/</span>) so Copilot grounds the positioning statement in the firm's actual language for the three core ideas.</p>
</div>
<ol>
<li>Open <strong>Word</strong>. Create a new blank document.</li>
<li>Click the <strong>Copilot icon</strong> in the Home ribbon tab.</li>
<li>Type this prompt:
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Draft a two-page ODA Design Philosophy Positioning Statement for use in client proposals, competition submissions, and award narratives. Include these sections: Who we are (2 sentences on firm identity), Our three core ideas (each with a 2-sentence articulation grounded in the language of the philosophy doc, plus one current ODA project example that embodies it — "form follows experience," "porosity for prosperity," "architecture as a social technology"), How these ideas shape our work (3 project-level examples across residential, hospitality, and mixed-use), and Where we're going (1 short paragraph on the firm's trajectory). Tone: confident, philosophical, editorial — restrained not promotional.</code></div></li>
<li>Read what Copilot generates. Confirm each core idea is grounded in the philosophy doc's actual language, with a specific ODA project called out.</li>
<li>Select the <strong>"How these ideas shape our work"</strong> section. Right-click and choose <strong>Rewrite with Copilot</strong>. Choose <strong>"Make it more concise"</strong>.</li>
<li>Compare the versions. The rewrite should read like tight editorial copy — each project example serving a single idea crisply.</li>
</ol>
<p><strong>Agent Mode:</strong> Click the Copilot icon and type:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Edit this document: add a pull-quote at the top extracted from the three-ideas section (the single line that best captures the firm's voice), and add a short "For when you'd use this" sidebar on the last page listing 3 use cases (RFP response, competition narrative, award submission) with one sentence each.</code></div>
<p><strong>Iterate:</strong> Refine the output:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Tighten any sentence that feels promotional or self-congratulatory. The piece should read like a firm articulating what it believes, not selling itself. Cut superlatives.</code></div>
</div>

<div class="option-content" data-lesson="1" data-key="e">
<h4>Operations: Project Handoff Document</h4>
<div class="note-box">
  <div class="note-title">Reference Material</div>
  <p>Download the <a href="/mock-data/staffing/oda-resource-allocation.xlsx" download>ODA resource allocation spreadsheet</a> for team assignments and utilization data to make this handoff more realistic.</p>
</div>
<ol>
<li>Open <strong>Word</strong>. Create a new blank document.</li>
<li>Click the <strong>Copilot icon</strong> in the Home ribbon tab.</li>
<li>Type this prompt:
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Draft a project handoff document for transferring project lead responsibilities on "Jersey City Waterfront Tower" from the current PM to a new PM at ODA. Include these sections: Project Summary (project name, client, phase, key dates), Open Items (list 6 pending tasks — permit resubmission, consultant invoice review, client presentation prep, spec section updates, RFI responses, site visit scheduling), Key Contacts (table with client, structural engineer, MEP consultant, contractor, and their contact info placeholders), Pending Deliverables (table with deliverable name, due date, status, notes), and Transition Timeline (2-week overlap plan). Use a clear, operational tone.</code></div></li>
<li>Read what Copilot generates. Confirm it created a comprehensive handoff with tables and specific action items.</li>
<li>Select the <strong>Open Items</strong> section. Right-click and choose <strong>Rewrite with Copilot</strong>. Choose <strong>"Make it more concise"</strong>.</li>
<li>Compare the versions. Each open item should be a clear one-liner, not a paragraph.</li>
</ol>
<p><strong>Agent Mode:</strong> Click the Copilot icon and type:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Edit this document: add a "File Locations" section listing where all project files live (SharePoint site, Revit model server, Bluebeam sessions, email folders), and add a "Lessons Learned" section with 3 things the outgoing PM would want the incoming PM to know.</code></div>
<p><strong>Iterate:</strong> Refine the output:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Add priority flags (High/Medium/Low) to each open item and sort them by deadline.</code></div>
</div>

<div class="tip-box">
  <div class="tip-title">Success Check</div>
  Does the document read like something you would actually send? Is the structure clear enough that a reader could skim headings and get the full picture? Did Agent Mode place edits where you expected — or did it surprise you? What would you refine before sharing this with a stakeholder?
</div>

<p class="personalization-note">[PERSONALIZED: swap the scenario with organization-specific document types and project names from Listen Labs interviews]</p>
`,
  advanced: `
<h3>Going Deeper</h3>
<h4>Multi-Document Synthesis</h4>
<p>Synthesis means drafting <em>one</em> document that pulls facts from several others. Here is how to do it:</p>
<ol>
  <li>Make sure every source file lives on <strong>OneDrive</strong> or <strong>SharePoint</strong> — Copilot can only reference cloud-stored files via <span class="inline-code">/</span>.</li>
  <li>On a blank Word page, open the Copilot prompt.</li>
  <li>Type your request, and attach each source with <span class="inline-code">/</span>. Example: <span class="inline-code">Draft a single executive briefing that combines the findings from /Q3-Report.docx, /Competitive-Analysis.xlsx, and /Strategy-Deck.pptx. One page, three sections: Where we are, What changed, What to do next.</span></li>
  <li>Review the output — Copilot auto-cites where each fact came from (see Auto-Citations), so you can spot-check any claim.</li>
</ol>

<h4>SharePoint Integration</h4>
<p>Any document in a SharePoint site your account can see is referenceable with <span class="inline-code">/</span>. This lets team-wide knowledge flow into your drafts without manual copy-paste. Best results when filenames are descriptive — <span class="inline-code">Shore-Club-Facade-Review.docx</span> beats <span class="inline-code">Draft-v3-final-FINAL.docx</span>.</p>
`
},

/* ===== LESSON 1 ===== */
{
  id: 2, title: "Excel Copilot", points: 25, bonus: false,
  learn: `
<h3>Copilot in Excel</h3>
<p>Words are powerful, but sometimes you need numbers. Excel's Copilot is the most capable app integration — it can analyze data, write formulas, and build charts from plain English.</p>
<p>Think of it as a data analyst on call: ask a question, get a chart or a formula back. No more Googling XLOOKUP syntax.</p>
<p>Click the <strong>Copilot icon in the Home ribbon</strong> (far right of the Home tab). It opens a side panel that sees every cell, row, and sheet in your open workbook.</p>

<h4>Three things Excel's Copilot does well</h4>
<p><strong>Analysis:</strong> Ask a question in plain English ("which months dipped below 70% utilization?") and Copilot surfaces trends, outliers, and statistics. <strong>Formulas:</strong> Describe a calculation and Copilot writes the formula — even complex XLOOKUP or dynamic arrays. <strong>Charts:</strong> Ask for a visualization and Copilot picks a chart type, builds it in the sheet, and lets you refine it through follow-ups.</p>

<h4>Agent Mode</h4>
<p>Agent Mode is Copilot chaining multiple actions: clean the data, add calculated columns, build a pivot, and chart the result — from one prompt. It shows its reasoning step by step so you can follow along and pause when needed.</p>

<h4>Local file support</h4>
<p>Copilot in Excel works on files saved locally on your desktop — no need to upload to OneDrive first.</p>

<div class="tip-box">
  <div class="tip-title">Tip</div>
  Format your data as a Table (<span class="inline-code">Ctrl+T</span>) before using Copilot. Clear headers and a defined table boundary produce significantly more accurate formulas and analysis.
</div>
`,
  implement: `
<h3>Exercise: Three things Copilot does in Excel</h3>
<p>Excel's Copilot is good at three distinct jobs. We will do one of each — in this order:</p>
<ol>
  <li><strong>Qualitative analysis</strong> — ask questions in plain English and get a written read of the data.</li>
  <li><strong>Quantitative work</strong> — add calculated columns and formulas by describing what you want.</li>
  <li><strong>Visualization</strong> — ask for a chart and Copilot builds it in the sheet.</li>
</ol>

<div class="tip-box" style="margin-bottom:18px;">
  <div class="tip-title">Link this back to your Chat Page when you're done</div>
  <p>Once the chart tells a clear story, save the workbook to OneDrive and paste its share link into the <strong>L4 Page</strong> alongside your Word v2 document. The Page becomes the one URL a teammate can click to see the narrative, the deliverable, and the numbers together.</p>
</div>

<div class="note-box">
  <div class="note-title">ODA sample data</div>
  <p>Pick one of these two workbooks to work with. Both are real-ish ODA data — enough rows to surface actual trends.</p>
  <ul>
    <li><a href="/mock-data/financials/oda-monthly-financials.xlsx" download>Monthly Financials</a> — 15 months of revenue, expenses, active projects, new commissions, staffing, and utilization.</li>
    <li><a href="/mock-data/financials/oda-project-tracking.xlsx" download>Project Tracking</a> — 10 active projects with phases, fees, hours, and budget status.</li>
  </ul>
</div>

<h4>Setup</h4>
<ol>
<li>Download one of the two workbooks above and open it in <strong>Excel</strong>.</li>
<li>Click anywhere in the data. Press <strong>Ctrl+T</strong> to format it as a Table (confirm "My table has headers" is checked). This is the single most important setup step — Copilot is much more reliable against a formatted Table than a raw range.</li>
<li>Click the <strong>Copilot icon</strong> in the Home ribbon to open the side panel.</li>
</ol>

<h4>1. Qualitative analysis — ask a question</h4>
<ol start="4">
<li>In the Copilot panel, send:
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>What trends do you see in this data? Call out any months or projects that look unusual and explain why.</code></div></li>
<li>Read the written analysis. Copilot should name specific months or projects and point to the numbers behind each claim — not just give generic commentary.</li>
</ol>

<h4>2. Quantitative work — add a calculated column</h4>
<ol start="6">
<li>Send:
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Add a calculated column that shows month-over-month change as a percentage. Flag any negative months.</code></div></li>
<li>Click a cell in the new column and check the formula bar — confirm Copilot wrote a real formula (not just pasted values). Spot-check one row manually.</li>
</ol>

<h4>3. Visualization — build a chart</h4>
<ol start="8">
<li>Send:
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Create a chart that best tells the story of this data. Pick the chart type — you decide what's clearest.</code></div></li>
<li>A chart should appear in the sheet. Review what Copilot chose. If you want to steer it, use a follow-up like <em>"Use a line chart instead"</em> or <em>"Add a target line at 75%"</em>.</li>
</ol>

<div class="tip-box">
  <div class="tip-title">Success Check</div>
  Spot-check two formula cells manually — do the numbers check out? Does the chart tell a clear story at a glance, or do you need another prompt to sharpen it? If you handed this sheet to a principal, what would be their first question?
</div>
`,
  advanced: `
<h3>Going Deeper</h3>
<h4>Complex Data Manipulation</h4>
<p>Ask Copilot to perform multi-step data transformations: cleaning, deduplication, normalization, and merging. Agent Mode chains these operations together in one pass.</p>

<h4>Automation with Macros + Copilot</h4>
<p>Ask Copilot to write VBA macros for repetitive tasks. Combine this with Copilot's analysis capabilities to build automated reporting workflows — you describe what to do; Copilot writes the macro.</p>

<h4>Architecture &amp; Project Management Use Cases</h4>
<p>Export project tracking data from whatever tool you use (Revit schedules, Bluebeam quantity takeoffs, PM spreadsheets) as CSV or Excel. Then ask Copilot to analyze trends: "Which projects are over budget?", "Show me resource utilization by month", "Compare planned vs. actual hours by team member." The key is getting data <em>into</em> Excel — once it's there, Copilot handles the rest.</p>
`
},

/* ===== LESSON 2 ===== */
{
  id: 3, title: "Outlook Copilot", points: 20, bonus: false,
  learn: `
<h3>Copilot in Outlook</h3>
<p>Outlook is two things in one: email and calendar. Copilot works across both.</p>
<p>Think of Copilot in Outlook as an assistant who reads your inbox before you do and hands you a briefing — so you walk into your day already organized.</p>

<h4>Summarize a long thread</h4>
<p>Open any long email thread. At the top of the reading pane you will see a <strong>"Summarize by Copilot"</strong> banner. Click it — Copilot condenses the whole conversation into the key decisions, requests, and open questions. No more re-reading 20 replies to find the one action item buried at the bottom.</p>

<h4>Draft a reply with tone and length control</h4>
<p>Hit Reply on any message. In the compose window, click the <strong>Copilot icon in the top-right of the reply pane</strong> and pick <strong>Draft with Copilot</strong>. Tell it what you want to say — <em>"Accept the meeting but suggest Thursday instead"</em> — and Copilot writes a full reply. The draft panel has built-in controls to make it <strong>shorter / longer / more formal / more casual</strong>, so you can iterate without retyping.</p>

<h4>Summarize an attachment</h4>
<p>When a thread has a PDF, Word, or PowerPoint attachment, Copilot can summarize it without you opening it. Open the email, click the Copilot icon in the reading pane, and ask for a summary — the key points come back in the chat without you ever leaving the inbox.</p>

<h4>Triage your inbox</h4>
<p>Open Copilot Chat from the Outlook sidebar and ask:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>What emails need my attention today? Prioritize by urgency and flag anything with a deadline this week or a direct ask from my manager.</code></div>
<p>Copilot surfaces time-sensitive messages, action items assigned to you, and emails from key stakeholders. You can chain follow-ups: <em>"Flag the two most urgent and archive anything older than a week I haven't replied to."</em> Copilot actually performs the action — not just describes it.</p>

<h4>Calendar: smarter scheduling</h4>
<p>When you compose a meeting invite, Copilot suggests <strong>optimal meeting times</strong> based on attendee availability — Scheduling Assistant surfaced right in the compose flow, no extra clicks.</p>

<h4>Calendar: meeting recap already waiting for you</h4>
<p>After a recorded Teams meeting ends, open the event from your Outlook Calendar — Copilot has already filled in the <em>summary</em>, <em>mentions</em>, <em>tasks</em>, and recap notes. Useful if you missed the meeting, joined late, or need to catch up async.</p>

<div class="tip-box">
  <div class="tip-title">Building on the Chat course</div>
  <p>Prompting, Custom Instructions, and "Talk to Your Data" all carry over. The difference here is Copilot runs <em>inside</em> Outlook — so it sees the open email, the compose draft, and the thread you're replying to. Specific prompts with context still beat vague ones.</p>
</div>
`,
  implement: `
<h3>Exercise: Share What You Made</h3>
<p>This is the <strong>culminating</strong> step of the Apps module. You've drafted a real deliverable in Word, analyzed your data in Excel, and linked both into your Chat Page from the previous course. Now share it with a colleague who'd care — peer to peer, tentative, not a pitch.</p>

<div class="note-box">
  <div class="note-title">Before you start</div>
  <p>Make sure your <strong>Word v2 document</strong> and <strong>Excel dashboard</strong> are saved and their share links are pasted into your <strong>L4 Page</strong>. The email you're about to send will reference that Page so the recipient lands in one place and can see everything.</p>
</div>

<p>Pick your role below — each option walks you through drafting the retrospective email with Copilot's help:</p>

<div class="option-tabs">
  <button class="option-tab active" onclick="switchOption('outlook','a',this)">Architecture</button>
  <button class="option-tab" onclick="switchOption('outlook','b',this)">HR</button>
  <button class="option-tab" onclick="switchOption('outlook','c',this)">Marketing</button>
  <button class="option-tab" onclick="switchOption('outlook','d',this)">Executive</button>
  <button class="option-tab" onclick="switchOption('outlook','e',this)">Operations</button>
</div>

<div class="option-content active" data-lesson="outlook" data-key="a">
<h4>Architecture: Share the Shore Club Facade Review</h4>
<ol>
<li>Open <strong>Outlook</strong> and click <strong>New email</strong> (not a Reply — this is a fresh note).</li>
<li>In the compose window, click the <strong>Copilot icon at the top-right of the message body</strong> and choose <strong>Draft with Copilot</strong>.</li>
<li>Paste this prompt:
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Find ODA architects currently working on projects with curtain wall or facade transition details in CD or permitting phase. Then draft a short peer-to-peer email from me to one of them. Reference the Shore Club facade review we just completed, the waterproofing detail diagram, the consultant responsibility matrix, and the trade cost summary — all linked in my Page. Tone: informal, not a pitch — "sharing because you may be hitting similar transition-joint questions." No claims about time saved or efficiency. Close with an open invitation to compare notes.</code></div></li>
<li>Review what Copilot drafted. Use the built-in follow-up controls — <em>"Shorter"</em>, <em>"Warmer"</em>, <em>"More formal"</em> — to tighten the tone without retyping.</li>
<li>Click <strong>Keep it</strong> to place the draft into the email body. Paste the link to your L4 Page in the body so the recipient has one click to see everything.</li>
<li>Send (or save as draft if this is just practice).</li>
</ol>
</div>

<div class="option-content" data-lesson="outlook" data-key="b">
<h4>HR: Share the Designer Onboarding Redesign</h4>
<ol>
<li>Open <strong>Outlook</strong> and click <strong>New email</strong>.</li>
<li>In the compose window, click the <strong>Copilot icon at the top-right of the message body</strong> and choose <strong>Draft with Copilot</strong>.</li>
<li>Paste this prompt:
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Find ODA hiring managers who have designer roles open or new hires starting in the next 60 days. Then draft a short peer-to-peer email from me to one of them. Reference the 90-day onboarding journey map and the AI policy section we just added to the handbook — both linked in my Page. Tone: tentative and peer — "sharing what we put together this week, still figuring out what's useful vs. noise." No transformation claims. Close with an open invitation if they want to walk through the approach before their new hire lands.</code></div></li>
<li>Review the draft. Use the follow-up controls to refine tone.</li>
<li>Click <strong>Keep it</strong>, paste the link to your L4 Page in the body.</li>
<li>Send or save as draft.</li>
</ol>
</div>

<div class="option-content" data-lesson="outlook" data-key="c">
<h4>Marketing: Share the Q2 Award Submission Tracker</h4>
<ol>
<li>Open <strong>Outlook</strong> and click <strong>New email</strong>.</li>
<li>In the compose window, click the <strong>Copilot icon at the top-right of the message body</strong> and choose <strong>Draft with Copilot</strong>.</li>
<li>Paste this prompt:
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Find ODA colleagues who work on award submissions, PR coordination, or the newsletter — a creative director peer, a marketing coordinator, or the PR agency lead. Draft a short peer-to-peer email from me to one of them. Reference the hero composite for our priority submission, the narrative v2 redlined with the creative director, and the campaign dashboard — all linked in my Page. Tone: tentative, no transformation story — "sharing how we assembled the tracker and hero this week, not a silver bullet, just a different way to pull it together." Close inviting them to take a look before their own deadline push.</code></div></li>
<li>Review the draft. Use the follow-up controls to refine tone.</li>
<li>Click <strong>Keep it</strong>, paste the link to your L4 Page in the body.</li>
<li>Send or save as draft.</li>
</ol>
</div>

<div class="option-content" data-lesson="outlook" data-key="d">
<h4>Executive: Share the Design Philosophy Radar</h4>
<ol>
<li>Open <strong>Outlook</strong> and click <strong>New email</strong>.</li>
<li>In the compose window, click the <strong>Copilot icon at the top-right of the message body</strong> and choose <strong>Draft with Copilot</strong>.</li>
<li>Paste this prompt:
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Find ODA principals, the creative director, the marketing director, or the business-development lead — anyone who works on strategic positioning, competition pursuits, or client-facing brand narrative. Draft a short peer-to-peer email from me to one of them. Reference the Philosophy Triptych, the Positioning Statement v2 (redlined this week), and the peer-activity radar dashboard — all linked in my Page. Tone: tentative, exploratory — "been experimenting with a research agent that monitors industry work through our three-idea lens… not a silver bullet, still figuring out the alignment threshold." Close with an open invitation to compare notes before the approach gets rolled out more broadly.</code></div></li>
<li>Review the draft. Use the follow-up controls to refine tone.</li>
<li>Click <strong>Keep it</strong>, paste the link to your L4 Page in the body.</li>
<li>Send or save as draft.</li>
</ol>
</div>

<div class="option-content" data-lesson="outlook" data-key="e">
<h4>Operations: Share the Resource Allocation Overview</h4>
<ol>
<li>Open <strong>Outlook</strong> and click <strong>New email</strong>.</li>
<li>In the compose window, click the <strong>Copilot icon at the top-right of the message body</strong> and choose <strong>Draft with Copilot</strong>.</li>
<li>Paste this prompt:
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Find ODA PMs or studio leads who deal with resource allocation across projects — a studio lead in the hospitality group and two senior PMs. Draft a short peer-to-peer email from me to one of them. Reference the studio-by-week utilization heatmap, the new reallocation workflow we added to the SOP, and the utilization trend charts — all linked in my Page. Tone: tentative — "been working through resource planning this week, not a silver bullet and not sure yet which parts stick." Close with an open invitation to compare notes on how we're sizing capacity.</code></div></li>
<li>Review the draft. Use the follow-up controls to refine tone.</li>
<li>Click <strong>Keep it</strong>, paste the link to your L4 Page in the body.</li>
<li>Send or save as draft.</li>
</ol>
</div>

<p><strong>Iterate:</strong> Try one of these refinements on the draft before sending:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Make this more concise — cut any sentence that sounds self-congratulatory or over-explains the AI part.</code></div>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Adjust the tone to be warmer, less formal — but keep the tentative, exploratory framing.</code></div>

<p class="personalization-note">[PERSONALIZED: swap with organization-specific peer roles and output names from Listen Labs interviews]</p>

<div class="tip-box">
  <div class="tip-title">Success Check</div>
  Does the email read like something a peer would actually welcome — curious and tentative, not a sales pitch? Did you include the Page link so the recipient can see the full body of work in one click? Would you press Send, or does it need one more pass?
</div>
`,
  advanced: `
<h3>Inbox Triage with Copilot</h3>
<p>Open Copilot Chat in the Outlook sidebar (or the Copilot app in Work mode) and try these triage commands:</p>

<h4>Prioritize Your Inbox</h4>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>What emails need my attention today? Prioritize by urgency.</code></div>

<h4>Bulk Actions</h4>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Flag the two most urgent emails and archive anything older than a week that I haven't replied to.</code></div>

<h4>Follow-Up Tracking</h4>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Show me threads I started this week that still have no response. I need to follow up.</code></div>

<h4>Weekly Email Audit</h4>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Summarize all action items assigned to me from this week's emails. Group them by project.</code></div>

<h4>Voice Triage (Mobile)</h4>
<p>On Outlook mobile, Copilot can read your unread emails aloud and let you reply, archive, or flag by voice — hands-free inbox management on your commute.</p>

<div class="note-box">
  <strong>Want these on autopilot?</strong> The Copilot Chat module's <em>Talk to Your Data</em> lesson (L3) walks through setting these up as <strong>scheduled prompts</strong> — a daily briefing that runs every morning, a Friday project pulse that runs itself.
</div>
`
},

/* ===== LESSON 3 ===== */
{
  id: 4, title: "PowerPoint Copilot", points: 15, bonus: true,
  learn: `
<h3>Copilot in PowerPoint</h3>
<p>If your role involves client decks, design presentations, or internal reviews, this bonus lesson is for you. Copilot can build an entire deck from a prompt or a Word doc.</p>
<p>Think of Copilot in PowerPoint as a presentation designer who works instantly. You hand over your notes, and they hand back a polished deck — your job is art direction, not slide building.</p>
<p>Click the <strong>Copilot icon in the Home ribbon</strong> to start.</p>

<h4>Three Ways to Create</h4>
<p><strong>From a prompt:</strong> Describe your topic and Copilot generates a complete deck with title slide, content slides, imagery, and section dividers. <strong>From a Word doc:</strong> Type "/" and reference a document&mdash;Copilot extracts key points and maps them to slides. A 10-page report becomes a crisp 8-slide summary. <strong>From an outline:</strong> Paste bullet points and Copilot turns them into formatted slides with layouts.</p>

<h4>Agentic Editing</h4>
<p>On PowerPoint for Web, you can have a conversation with Copilot to refine your deck: adjust layouts, reorder slides, change the narrative arc, and update content — all through natural language in a single session. (Full coverage of building your own agents is the next course.)</p>

<h4>Formatting and Notes</h4>
<p><strong>Standardize formatting:</strong> Ask Copilot to make all titles the same font and size across every slide&mdash;no more inconsistent decks. <strong>Speaker notes:</strong> Ask Copilot to generate talking points for each slide so you can present confidently.</p>

<div class="tip-box">
  <div class="tip-title">Tip</div>
  Start with a rough prompt for structure, then refine slide by slide. "Make this slide more visual" or "Simplify to 3 bullet points" lets you polish without starting over.
</div>
`,
  implement: `
<h3>Exercise: Build and Refine a Presentation</h3>
<p>Take the document you drafted in the Word exercise — or use any Word doc — and let Copilot turn it into slides. Below is an ODA-specific prompt to get started.</p>

<ol>
<li>Open <strong>PowerPoint</strong>. Create a new blank presentation.</li>
<li>Click the <strong>Copilot icon</strong> in the Home ribbon.</li>
<li>Type:
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Create a 6-slide client design presentation for the Shore Club Fort Lauderdale project. Include: Title slide with project name and ODA logo placeholder, Project Overview (location, program, 45-story mixed-use tower), Design Concept (stepped massing, ocean-facing terraces, biophilic elements), Facade System Comparison (terracotta rainscreen vs aluminum panel — pros, cons, cost), Project Timeline (SD through CA with key milestones), and Team slide with key consultants.</code></div></li>
<li>Wait 15-30 seconds. Review what Copilot created. Count the slides in the left panel — you should see 6.</li>
<li>Click on the <strong>Facade System Comparison</strong> slide. Click the Copilot icon again.</li>
<li>Type:
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Redesign this slide to use a two-column layout comparing terracotta and aluminum side by side, with cost, durability, and aesthetic rows.</code></div></li>
<li>Check: Did the layout change to a clear comparison format? If yes, the per-slide editing is working.</li>
</ol>

<h4>Add Speaker Notes</h4>
<ol start="8">
<li>Type:
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Add speaker notes to all slides with talking points for a client presentation, including budget context and design rationale.</code></div></li>
<li>Click on any slide, then click <strong>View > Notes</strong> at the bottom. Confirm that speaker notes text appeared below the slide.</li>
</ol>

<p><strong>Iterate:</strong> Read the output. Then send one of these refinement prompts:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Simplify each slide to a maximum of 3 bullet points. Move extra detail into speaker notes.</code></div>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Add a slide before the closing that shows 3 precedent projects by ODA (Harbor View Residences, Wynwood Arts Mixed-Use, Riverside Tower) with key stats.</code></div>

<h4>Standardize Formatting</h4>
<ol start="10">
<li>Type:
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Standardize all slides to use the same font (Segoe UI), consistent heading sizes, and matching bullet styles.</code></div></li>
<li>Flip through all slides. All headings should now use the same font and size. All bullets should match in style.</li>
</ol>

<div class="tip-box">
  <div class="tip-title">Success Check</div>
  Could you present this deck to a client right now without embarrassment? Do the speaker notes give you enough to walk through each slide confidently? Is the facade comparison slide clear enough for the client to make a decision? Would the client walk away understanding ODA's design vision?
</div>
`,
  advanced: `
<h3>Going Deeper</h3>

<h4>Call @powerpoint from Copilot Chat</h4>
<p>You don't have to open PowerPoint to use its Copilot. Inside the main <strong>Copilot Chat</strong> app, type <span class="inline-code">@powerpoint</span> in the prompt to summon the PowerPoint agent directly — it can build a deck from a prompt or a referenced document and hand you back a <span class="inline-code">.pptx</span>. Example:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>@powerpoint Build me a 6-slide client pitch deck based on /Shore-Club-Design-Brief.docx. Include a title slide, three content slides on concept/facade/timeline, a consultant team slide, and a closing next-steps slide.</code></div>
<p>Useful when you are already deep in Chat doing research and want to spin out a deck without app-switching.</p>

<h4>Brand Template Integration</h4>
<p>Apply your organization's PowerPoint template <em>before</em> using Copilot. When Copilot generates content into a templated deck, it respects the layouts, fonts, and color schemes — resulting in brand-compliant slides without any post-hoc cleanup.</p>

<h4>Design Coaching</h4>
<p>Use Copilot as a design advisor: <span class="inline-code">What could I improve about the design of this presentation?</span> It gives specific, actionable suggestions about layout, visual hierarchy, and content balance.</p>

<h4>Multi-Language Presentations</h4>
<p>Create in one language, translate all slides at once: <span class="inline-code">Translate this entire presentation to Spanish, keeping the same layout and design.</span></p>
`
},

/* ===== LESSON 4 ===== */
{
  id: 5, title: "Teams Copilot", points: 15, bonus: true,
  learn: `
<h3>Copilot in Teams</h3>
<p>If your day is filled with meetings and channel conversations, this bonus lesson will save you hours. Copilot in Teams captures everything so you don't have to.</p>
<p>Think of Copilot in Teams as a teammate who never misses a meeting and always takes perfect notes. You can walk in late, leave early, or skip entirely — and still know exactly what happened.</p>

<h4>Meeting Recaps</h4>
<p>After any recorded meeting, open the meeting in your calendar and click the <strong>Recap tab</strong>. Copilot provides a written summary with key decisions and action items. Copilot also generates <strong>video recaps</strong> — narrated highlight reels showing key moments like screen shares and whiteboard activity. Perfect for stakeholders who want a 2-minute visual overview instead of reading a transcript.</p>

<h4>Action Items</h4>
<p>Copilot identifies who committed to what during the meeting. Ask follow-up questions like <span class="inline-code">What did Sarah agree to do?</span> and get specific answers with context.</p>

<h4>Chat Summaries</h4>
<p>In any Teams channel, click the <strong>Copilot icon</strong> in the channel header. Ask it to summarize what has been discussed since you last checked in. Works in group chats too.</p>

<h4>Meeting Prep</h4>
<p>Before a meeting, ask Copilot: <span class="inline-code">Prepare me for my 2pm meeting</span>. It pulls context from the invite, previous meeting notes, and related email threads so you walk in informed.</p>

<h4>Audio Recap</h4>
<p>Audio recaps are available in several languages including English, Spanish, French, German, Portuguese, Japanese, Mandarin Chinese, and Korean — useful for catching up on a meeting while commuting.</p>

<div class="tip-box">
  <div class="tip-title">Tip</div>
  Meetings must be recorded and transcribed for Copilot recaps to work. Enable both before the meeting starts.
</div>
`,
  implement: `
<h3>Exercise: Meeting Recap and Channel Summary</h3>

<p>This exercise has one simple flow — if you have a recorded meeting use it, if not we'll use a channel instead.</p>

<div class="tip-box">
  <div class="tip-title">Prerequisite</div>
  For meeting recaps to work, the meeting must have been <strong>recorded with transcription enabled</strong>. Turn both on before the meeting starts, or join any recent team meeting where this was already done.
</div>

<h4>1. Recap a meeting (or a channel)</h4>
<ol>
<li>Open <strong>Microsoft Teams</strong>. Go to <strong>Calendar</strong> and find a recent meeting that shows a "Recap" indicator — that means a transcript exists.
  <ul style="margin-top:6px;"><li><em>No recorded meeting available?</em> Open any active <strong>channel</strong> instead and click the Copilot icon in the channel header — you'll ask it to summarize the channel's recent activity.</li></ul>
</li>
<li>Click into the meeting (or channel). Find the <strong>Copilot icon</strong> in the recap pane or channel header — it opens a side chat grounded in that content.</li>
<li>Send:
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Summarize the main decisions and the action items. For each action item include who owns it.</code></div></li>
<li>Check: does the response name specific people, decisions, and context? Each action item should have an owner.</li>
</ol>

<h4>2. Cross-meeting action items</h4>
<ol start="5">
<li>Open <strong>Copilot Chat</strong> in Teams (Copilot icon in the left sidebar).</li>
<li>Send:
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>What meetings did I have this week? For any that already happened, list the action items assigned to me.</code></div></li>
<li>If Copilot returns action items tied to meeting names and dates, cross-meeting search is working. If it says no meetings found, check that transcription was enabled for recent meetings.</li>
</ol>

<p><strong>Iterate:</strong></p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Organize the action items by owner, and add a suggested deadline for each based on the discussion.</code></div>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Which decisions from this meeting still need follow-up or confirmation?</code></div>

<p class="personalization-note">[PERSONALIZED: swap with organization-specific meeting types and team names from Listen Labs interviews]</p>

<div class="tip-box">
  <div class="tip-title">Success Check</div>
  Does the recap capture what actually mattered — or just what was said most? Are the action items specific enough to act on? If a colleague who missed the meeting read this summary, would they be caught up? What context is missing?
</div>
`,
  advanced: `
<h3>Going Deeper</h3>
<h4>Cross-Meeting Insights</h4>
<p>Ask Copilot to trace a topic across multiple meetings: <span class="inline-code">What has been discussed about the product launch across all my meetings in the past month?</span> This reveals how decisions evolved over time.</p>

<h4>Project Tracking</h4>
<p>Use Copilot to track project status across conversations: <span class="inline-code">Based on recent meetings and chats, what is the current status of Project Atlas?</span> Copilot synthesizes information from multiple sources.</p>

<h4>Channel Analysis</h4>
<p>For team leads, Copilot can analyze channel activity: <span class="inline-code">What are the most active discussion topics in our Engineering channel this month?</span> This helps identify team concerns, blockers, and trending topics.</p>

<h4>Connecting Meeting Decisions to Markups</h4>
<p>After a design review meeting, use Copilot to extract specific decisions: "List every change that was agreed upon for the floor plans." Then use that list as your markup guide in Bluebeam — you will know exactly what needs to be updated without re-watching the recording or re-reading your notes. Export the action items to a Copilot Page so the whole team can reference them.</p>
`
}
];
