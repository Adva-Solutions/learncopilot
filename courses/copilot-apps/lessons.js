// AUTO-EXTRACTED by scripts/extract-lessons.js — do not hand-edit without updating the extractor.
window.LESSONS = [
/* ===== LESSON 0 ===== */
{
  id: 1, title: "Outlook Copilot", points: 20, bonus: false,
  learn: `
<div class="note-box" style="background:#fffbf0;border-left:3px solid #c5973e;padding:12px 16px;margin-bottom:18px;">
  <strong>From Copilot Chat →</strong> The <strong>Custom Instructions</strong> and <strong>Memory</strong> you set up in the first course follow you into every Microsoft 365 app. The Copilot in Outlook, Word, Excel, PowerPoint, and Teams reads from the same profile — so a single configuration shapes every draft, summary, and analysis you'll do in this module.
</div>

<h3>Two Ways AI Works with Your Files</h3>
<p>Before we dive into the apps, understand this key distinction — it changes how you approach every exercise in this module:</p>
<table style="width:100%;border-collapse:collapse;margin:14px 0;font-size:14px;">
  <thead><tr style="border-bottom:2px solid var(--border);">
    <th style="text-align:left;padding:8px 12px;"></th>
    <th style="text-align:left;padding:8px 12px;">Upload to Copilot Chat</th>
    <th style="text-align:left;padding:8px 12px;">Copilot Inside the App</th>
  </tr></thead>
  <tbody>
    <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 12px;font-weight:600;">How it works</td><td style="padding:8px 12px;">Attach a file to Chat. It reads a snapshot, answers questions, generates summaries.</td><td style="padding:8px 12px;">Copilot runs inside Excel, Word, or PowerPoint. It sees every cell, paragraph, and slide in real time.</td></tr>
    <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 12px;font-weight:600;">What changes</td><td style="padding:8px 12px;">Nothing — the original file stays untouched.</td><td style="padding:8px 12px;">The file itself — formulas go into cells, text into paragraphs, slides get created.</td></tr>
    <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 12px;font-weight:600;">Best for</td><td style="padding:8px 12px;">Quick answers, one-off analysis, summaries</td><td style="padding:8px 12px;">Building, editing, iterating on a live document</td></tr>
  </tbody>
</table>
<p><strong>Rule of thumb:</strong> Want an answer <em>about</em> a file? Upload to Chat. Want to change <em>inside</em> a file? Use the in-app Copilot. This module teaches the second approach — Copilot working directly inside your apps.</p>

<h3>Copilot in Outlook</h3>
<p>Let's start with Outlook, where most of your day begins.</p>
<p>Think of Copilot in Outlook as an assistant who reads your email before you do and hands you a briefing. You walk in, and your day is already organized.</p>

<h4>Summarize threads</h4>
<p>Open any long email thread and look for the <strong>"Summarize by Copilot"</strong> banner at the top. Click it, and Copilot condenses the entire conversation into the key decisions, requests, and open questions. No more re-reading 20 replies to find the one action item buried at the bottom. <a href="https://support.microsoft.com/office/summarize-an-email-thread-with-copilot-in-outlook-a79873f2-396b-46dc-b852-7fe5947ab640" target="_blank">Microsoft's guide →</a></p>

<h4>Draft replies with tone and length control</h4>
<p>In any compose window, click the <strong>Copilot icon → Draft with Copilot</strong>. Tell it what you want to say — <em>"Accept the meeting but suggest Thursday instead"</em> — and Copilot writes a full reply. The draft panel has built-in controls to <strong>make it shorter / longer / more formal / more casual</strong>, so you can iterate without retyping. <a href="https://support.microsoft.com/office/draft-an-email-message-with-copilot-in-outlook-3eb1d053-89b8-491c-8a6e-746015238d9b" target="_blank">Microsoft's guide →</a></p>

<h4>Summarize attachments</h4>
<p>Rolled out in August 2025: when a thread has a <strong>PDF, Word, or PowerPoint attachment</strong>, Copilot can summarize the attached document without you opening it. Ask <em>"Give me a one-paragraph summary of the permit PDF attached to this thread"</em> and Copilot handles it inline. Works in Outlook web and the new Outlook for Windows. <a href="https://learn.microsoft.com/microsoft-365/copilot/release-notes#august-19,-2025" target="_blank">Release note →</a></p>

<h4>Inbox triage — let Copilot run your morning</h4>
<p>Open Copilot Chat in the Outlook sidebar and ask:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>What emails need my attention today? Prioritize by urgency and flag anything with a deadline this week or a direct ask from my manager.</code></div>
<p>Copilot surfaces time-sensitive messages, action items assigned to you, and emails from key stakeholders. Then you can chain follow-ups: <em>"Flag the two most urgent and archive anything older than a week I haven't replied to."</em> Copilot executes the action — not just describes it.</p>

<h4>Smart time insights when scheduling</h4>
<p>When you compose a meeting invite inside Outlook, Copilot now suggests <strong>optimal meeting times</strong> based on attendee availability and your existing calendar — the Scheduling Assistant surfaced right in the compose flow. <a href="https://support.microsoft.com/office/how-do-i-use-the-the-scheduling-assistant-to-find-meeting-times-bdd6c165-4186-45f1-ad9e-5af067ac69a3" target="_blank">Scheduling Assistant →</a></p>

<h4>Meeting Recap in Calendar</h4>
<p>After a Teams meeting ends, open the event from your <strong>Outlook Calendar</strong> — Copilot has already filled in the <em>meeting summary</em>, <em>mentions</em>, <em>tasks</em>, and recap notes. Useful if you missed the meeting, joined late, or need to catch up async. Bridges the Outlook and Teams modules.</p>

<div class="tip-box">
  <div class="tip-title">Building on the Chat module</div>
  <p>You learned prompting, Custom Instructions, and the "Talk to Your Data" approach in the Chat module. Those same skills apply here — but now Copilot runs <em>inside</em> Outlook, so it can see the open email, the compose draft, and the thread you're replying to. Specific prompts with context still beat vague requests.</p>
</div>
`,
  implement: `
<h3>Exercise: Summarize and Draft in Outlook</h3>

<p><em>Use a real thread from your inbox. If your mail is empty or you'd rather not touch live mail, scroll to the bottom of this page for six pre-made ODA sample threads you can paste into a test email.</em></p>

<ol>
<li>Open <strong>Outlook</strong>. Find an email thread with at least 3 replies.</li>
<li>Click the <strong>Copilot icon</strong> at the top of the reading pane.</li>
<li>Click "Summarize" (or type the prompt below):
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Summarize this email thread. List the key decisions, any action items assigned to me, and any deadlines or deliverables mentioned.</code></div></li>
<li>Check the summary. Does it mention specific people, decisions, and deadlines? If yes, it is working correctly.</li>
<li>Now click <strong>Reply</strong> on that same thread. In the compose window, click the <strong>Copilot icon</strong>.</li>
<li>Type this prompt:
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Draft a reply confirming I'll handle the action items mentioned above. Keep it brief and professional.</code></div></li>
<li>Review the draft. Click <strong>Regenerate</strong> to see an alternative version. Compare the two and pick the better one.</li>
<li>When you are happy with the draft, click <strong>Edit</strong> to place it into the email body. You can now make final tweaks manually.</li>
<li>Click <strong>Send</strong> when ready — or close without sending if this was just practice.</li>
<li><strong>Attachments:</strong> pick a thread (or sample thread below) that has a PDF, Word, or PowerPoint attached. Click the <strong>Copilot icon</strong> in the reading pane and send:
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Summarize the attachment on this email. Flag anything that's a decision point for me or has a deadline in the next two weeks.</code></div>
You now have the key takeaways without opening the file.</li>
</ol>

<p><strong>Iterate:</strong> Read the output. Then send one of these refinement prompts:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Make this reply more concise — cut anything that doesn't directly address the action items.</code></div>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Adjust the tone to be warmer and less formal, but keep it professional.</code></div>

<p class="personalization-note">[PERSONALIZED: swap with organization-specific email threads and stakeholder names from Listen Labs interviews]</p>

<div class="tip-box">
  <div class="tip-title">Success Check</div>
  Does the summary capture the key decisions — or did it miss something important? Did you use Edit to place the draft into the email body? Did you get an attachment summary back? Is the reply ready to send, or does it need another pass?
</div>

<div class="note-box" style="margin-top:24px;">
  <div class="note-title">Sample email threads (fallback)</div>
  <p>Use these if your email connection isn't working, or if you'd rather practice on canned content than a real thread. Open one, paste it into a new email to yourself, then run Copilot against that thread:</p>
  <ul>
    <li><a href="/mock-data/emails/consultant-coordination.txt" download>Consultant Coordination</a> — facade waterproofing review with structural engineer</li>
    <li><a href="/mock-data/emails/contract-redlines.txt" download>Contract Red-Lines</a> — legal counsel contract negotiation with fee and insurance terms</li>
    <li><a href="/mock-data/emails/client-scheduling.txt" download>Client Scheduling</a> — design presentation reschedule with stakeholder back-and-forth</li>
    <li><a href="/mock-data/emails/permit-timeline.txt" download>Permit Timeline</a> — Shore Club permit submission coordination across departments</li>
    <li><a href="/mock-data/emails/pr-award-submission.txt" download>PR &amp; Awards</a> — award submission deadlines and photography coordination</li>
    <li><a href="/mock-data/emails/executive-travel.txt" download>Executive Travel</a> — Dubai trip planning with flights, meetings, and itinerary</li>
  </ul>
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

/* ===== LESSON 1 ===== */
{
  id: 2, title: "Word Copilot", points: 20, bonus: false,
  learn: `
<h3>Copilot in Word</h3>
<p>In the last step, you summarized emails and drafted replies. Now take that same AI power and apply it to documents — where your real deliverables live.</p>
<p>Think of Copilot in Word as a co-author who never gets writer's block. You describe the document you need, and it writes the first draft — your job is to shape it, not start from scratch.</p>
<p>Open any Word document and look for the <strong>Copilot icon in the Home ribbon</strong>. That button is about to change how you write.</p>

<h4>Generate</h4>
<p>On a blank page, click the Copilot icon and describe what you need. Copilot creates a structured document with headings, sections, and formatting. Type "/" in the prompt to pull content from files on OneDrive or SharePoint.</p>

<h4>Rewrite</h4>
<p>Select any text, right-click, and choose <strong>Rewrite with Copilot</strong>. Pick a tone&mdash;more formal, more concise, more enthusiastic&mdash;and Copilot rewrites the selection. Works on a sentence, a paragraph, or the whole document.</p>

<h4>Reference</h4>
<p>Type "/" in any Copilot prompt to reference other files. For example: <span class="inline-code">Draft a project summary based on /Q4 Sales Report.xlsx</span>. Copilot synthesizes content from multiple sources into one coherent document.</p>

<h4>Agent Mode (NEW)</h4>
<p>Copilot doesn't just insert text anymore&mdash;it actively edits across your document while explaining its reasoning. Ask it to restructure sections, add an executive summary, and adjust tone for a board audience, and it works through each step sequentially. This is the biggest upgrade to Word Copilot since launch.</p>

<h4>Auto-Citations (NEW)</h4>
<p>When Copilot pulls from web sources or your organization's data, it now automatically inserts footnotes with citations. No more guessing where the information came from.</p>

<h4>Document Comparison</h4>
<p>One of Word Copilot's most practical uses for teams that review many document versions: open two versions of a specification or report, and ask Copilot to compare them. It highlights what changed, what was added, and what was removed — faster than reading both documents side by side. Especially useful for reviewing consultant submittals, spec revisions, or contract redlines.</p>

<div class="tip-box">
  <div class="tip-title">Tip</div>
  Use "/" references to ground Copilot in your actual data. Documents built from file references are significantly more accurate than those from prompts alone.
</div>
`,
  implement: `
<h3>Exercise: Draft, Rewrite, and Agent-Edit in Word</h3>
<p>You summarized an email thread in the last step. Now imagine turning that summary into a full memo. Pick your role below to get a tailored drafting exercise:</p>

<div class="option-tabs">
  <button class="option-tab active" onclick="switchOption(1,'a',this)">Architecture</button>
  <button class="option-tab" onclick="switchOption(1,'b',this)">HR</button>
  <button class="option-tab" onclick="switchOption(1,'c',this)">Marketing</button>
  <button class="option-tab" onclick="switchOption(1,'d',this)">Executive</button>
  <button class="option-tab" onclick="switchOption(1,'e',this)">Operations</button>
</div>

<div class="option-content active" data-lesson="1" data-key="a">
<h4>Architecture: Consultant Coordination Memo</h4>
<div class="note-box">
  <div class="note-title">Reference Material</div>
  <p>For richer results, open the <a href="/mock-data/emails/consultant-coordination.txt" download>consultant coordination email thread</a> alongside this exercise. You can paste it into the Word doc and ask Copilot to turn it into a formal memo.</p>
</div>
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
  <p>Download a completed case study for reference: <a href="/mock-data/proposals/case-study-harbor-view.txt" download>Harbor View case study</a> or <a href="/mock-data/proposals/case-study-wynwood.txt" download>Wynwood Arts case study</a>. You can upload one to Word and ask Copilot to draft a new case study in the same style.</p>
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
<h4>Executive: Board Briefing Memo</h4>
<div class="note-box">
  <div class="note-title">Reference Material</div>
  <p>Download the <a href="/mock-data/executive/oda-qbr-q1-2025.txt" download>ODA Q1 2025 QBR</a> for real project and financial data to feed into this exercise.</p>
</div>
<ol>
<li>Open <strong>Word</strong>. Create a new blank document.</li>
<li>Click the <strong>Copilot icon</strong> in the Home ribbon tab.</li>
<li>Type this prompt:
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Draft a board briefing memo for ODA's quarterly meeting. Include these sections: Executive Summary (2-3 sentences on overall firm health), Project Pipeline Status (10 active projects including Shore Club, Mayflower, and Jersey City Waterfront — summarize in a table), Revenue Update (Q1 revenue at $1.435M vs. $1.33M prior year, net margin 12.2%), Strategic Decision Needed (whether to expand the Fort Lauderdale office — present pros, cons, estimated cost, and a recommendation), and Next Quarter Priorities (3 items). Use a concise executive tone — no fluff.</code></div></li>
<li>Read what Copilot generates. Confirm it created a decision-ready memo with clear structure.</li>
<li>Select the <strong>Strategic Decision</strong> section. Right-click and choose <strong>Rewrite with Copilot</strong>. Choose <strong>"Make it more formal"</strong>.</li>
<li>Compare the versions. The rewrite should sound boardroom-ready.</li>
</ol>
<p><strong>Agent Mode:</strong> Click the Copilot icon and type:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Edit this document: add a financial summary table at the top comparing this quarter to last quarter, and add a risk register section at the bottom with the top 3 firm-level risks and mitigation status.</code></div>
<p><strong>Iterate:</strong> Refine the output:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Strengthen the recommendation in the Strategic Decision section — be more direct about which option you recommend and why. Add a one-sentence ROI estimate.</code></div>
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
<p>Reference 3 or more files in a single Copilot prompt to create synthesis documents. For example, combine a quarterly report, a competitive analysis, and a strategy deck into a single executive briefing.</p>

<h4>Voice Profiles</h4>
<p>Create a "voice profile" document that describes your preferred writing style. Reference it when drafting: <span class="inline-code">Draft this email using the style in /My Voice Profile.docx</span>. This ensures consistency across all your Copilot-generated content.</p>

<h4>SharePoint Integration</h4>
<p>Reference SharePoint documents directly in Copilot prompts. This enables team-wide knowledge to flow into your drafts without manual copy-pasting. Ensure your SharePoint content is well-organized with descriptive filenames for best results.</p>
`
},

/* ===== LESSON 2 ===== */
{
  id: 3, title: "Excel Copilot", points: 25, bonus: false,
  learn: `
<h3>Copilot in Excel</h3>
<p>Words are powerful, but sometimes you need numbers. Excel's Copilot is the most capable app integration — it can analyze data, write formulas, and create charts from plain English.</p>
<p>Excel's Copilot is like having a data analyst on call — ask questions in plain English, get charts and formulas back. No more Googling XLOOKUP syntax.</p>
<p>Click the <strong>Copilot icon</strong> in the Home ribbon to get started.</p>

<h4>What It Can Do</h4>
<p><strong>Analysis:</strong> Ask questions about your data and Copilot identifies trends, outliers, and statistics. <strong>Formulas:</strong> Describe a calculation in words and Copilot writes the formula&mdash;even complex XLOOKUP and dynamic arrays. <strong>Charts:</strong> Ask for a visualization and Copilot picks the right chart type, builds it, and lets you refine.</p>

<h4>Agent Mode (NEW)</h4>
<p>Copilot can now execute multi-step operations from a single prompt: clean your data, add calculated columns, build a pivot table, and generate a chart. It shows its reasoning at each step so you can follow along.</p>

<h4>Work IQ (NEW)</h4>
<p>While you work in Excel, Copilot pulls context from your emails, meetings, and chats. It might note that a sales figure relates to a deal discussed in a recent Teams meeting&mdash;connecting your spreadsheet to the rest of your work.</p>

<h4>Local File Support (NEW)</h4>
<p>Copilot in Excel no longer requires cloud-stored files. You can use it with locally saved spreadsheets on your desktop&mdash;a major limitation removed.</p>

<div class="tip-box">
  <div class="tip-title">Tip</div>
  Format your data as a Table (Ctrl+T) before using Copilot. Clear column headers and table boundaries produce significantly more accurate formulas and analysis.
</div>
`,
  implement: `
<h3>Exercise: Analyze, Formula, and Chart in Excel</h3>

<div class="note-box">
  <div class="note-title">ODA Sample Data</div>
  <p>Download one of the ODA financial datasets, or use your own spreadsheet. All downloads are <strong>.xlsx</strong> — they open directly in Excel.</p>
  <ul>
    <li><a href="/mock-data/financials/oda-monthly-financials.xlsx" download>Monthly Financials</a> — 15 months of revenue, expenses, active projects, new commissions, staffing, and utilization.</li>
    <li><a href="/mock-data/financials/oda-project-tracking.xlsx" download>Project Tracking</a> — 10 active projects with phases, fees, hours, and budget status.</li>
    <li><a href="/mock-data/financials/oda-construction-costs.xlsx" download>Construction Costs</a> — cost breakdowns by trade across completed buildings.</li>
    <li><a href="/mock-data/financials/oda-consolidated-data.xlsx" download>Consolidated Dashboard</a> — all-in-one ODA financial snapshot across sheets.</li>
  </ul>
</div>

<h4>Set Up Sample Data</h4>
<ol>
<li>Open <strong>Excel</strong>. Create a new workbook.</li>
<li>In row 1, type these headers: <strong>A1:</strong> Month &nbsp; <strong>B1:</strong> Revenue &nbsp; <strong>C1:</strong> Expenses &nbsp; <strong>D1:</strong> Projects_Active &nbsp; <strong>E1:</strong> Utilization_Rate</li>
<li>Fill rows 2-13 with this data (or paste it, or import the Monthly Financials CSV above):
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Jan 2025	425000	375000	9	72
Feb 2025	440000	380000	10	74
Mar 2025	485000	395000	11	78
Apr 2025	520000	410000	12	80
May 2025	545000	425000	13	82
Jun 2025	490000	415000	12	75
Jul 2025	430000	390000	10	68
Aug 2025	415000	385000	9	65
Sep 2025	505000	405000	11	79
Oct 2025	570000	440000	14	84
Nov 2025	595000	465000	15	85
Dec 2025	480000	420000	12	70</code></div></li>
<li>Select all the data (A1:E13). Press <strong>Ctrl+T</strong> to format it as a Table. Click OK.</li>
</ol>

<h4>Ask Copilot Questions</h4>
<ol start="5">
<li>Click the <strong>Copilot icon</strong> in the ribbon.</li>
<li>Type:
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>What trends do you see in this data? Which months show utilization below 70%? Is there a seasonal pattern in revenue and staffing?</code></div></li>
<li>Read the analysis. Copilot should identify Nov as the peak revenue month, flag the Jul-Aug summer dip in utilization, and note the correlation between active projects and revenue.</li>
</ol>

<h4>Add Calculated Columns</h4>
<ol start="8">
<li>Type:
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Add a column called 'Profit' that calculates Revenue minus Expenses for each month.</code></div></li>
<li>Check: Did Copilot add a new column with a formula? Click on the first data cell and verify the formula bar shows something like <span class="inline-code">=[@Revenue]-[@Expenses]</span>.</li>
<li>Verify one cell manually: Jan Revenue (425000) minus Jan Expenses (375000) should equal 50000.</li>
</ol>

<h4>Create a Chart</h4>
<ol start="11">
<li>Type:
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Create a line chart showing Revenue, Expenses, and Profit over time.</code></div></li>
<li>A chart should appear. Check that it has 3 lines with a legend. Resize it if needed by dragging the corners.</li>
<li>Refine the chart:
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Add a title "ODA Monthly Financial Overview" to the chart and add data labels to the Profit line only.</code></div></li>
</ol>

<p><strong>Iterate:</strong> Read the output. Then send one of these refinement prompts:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Add a column that calculates month-over-month revenue growth as a percentage. Flag any negative growth months.</code></div>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Create a second chart showing Utilization_Rate as a bar chart with a horizontal target line at 75%.</code></div>

<div class="tip-box">
  <div class="tip-title">Success Check</div>
  Do the formulas produce the correct numbers — spot-check at least two cells manually. Does the chart tell a clear story about ODA's financial trends at a glance? If you handed this spreadsheet to a principal right now, what question would they ask that the data doesn't answer yet?
</div>
`,
  advanced: `
<h3>Going Deeper</h3>
<h4>Complex Data Manipulation</h4>
<p>Ask Copilot to perform multi-step data transformations: cleaning, deduplication, normalization, and merging. Agent Mode excels at chaining these operations together.</p>

<h4>External Data Connections</h4>
<p>Use Copilot to help build Power Query connections to external databases, APIs, or other data sources. While Copilot cannot directly connect to external systems, it can generate the M code and guide you through the connection process.</p>

<h4>Automation with Macros + Copilot</h4>
<p>Ask Copilot to write VBA macros for repetitive tasks. Combine this with Copilot's analysis capabilities to create powerful automated reporting workflows.</p>

<h4>Architecture & Project Management Use Cases</h4>
<p>Export your project tracking data from whatever tool you use (Revit schedules, Bluebeam quantity takeoffs, or project management spreadsheets) as CSV or Excel files. Then ask Copilot to analyze trends: "Which projects are over budget?", "Show me resource utilization by month", or "Compare planned vs. actual hours by team member." The key is getting data INTO Excel — once it's there, Copilot handles the analysis.</p>
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

<h4>Agentic Editing (NEW)</h4>
<p>On PowerPoint for Web, you can now have a conversation with Copilot to refine your deck: adjust layouts, reorder slides, change the narrative arc, and update content&mdash;all through natural language in a single session.</p>

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
<h4>Brand Template Integration</h4>
<p>Apply your organization's PowerPoint template before using Copilot. When Copilot generates content, it will respect the template's layouts, fonts, and color schemes, resulting in brand-compliant decks.</p>

<h4>Design Coaching</h4>
<p>Use Copilot as a design advisor: <span class="inline-code">What could I improve about the design of this presentation?</span> It provides specific, actionable suggestions about layout, visual hierarchy, and content balance.</p>

<h4>Multi-Language Presentations</h4>
<p>Create presentations in one language and ask Copilot to translate all slides: <span class="inline-code">Translate this entire presentation to Spanish, keeping the same layout and design.</span></p>
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
<p>After any recorded meeting, go to the <strong>Recap tab</strong> in the meeting details. Copilot provides a written summary with key decisions and action items. NEW: Copilot also generates <strong>video recaps</strong>&mdash;narrated highlight reels showing key moments like screen shares and whiteboard activity. Perfect for stakeholders who want a 2-minute visual overview instead of reading a transcript.</p>

<h4>Action Items</h4>
<p>Copilot identifies who committed to what during the meeting. Ask follow-up questions like <span class="inline-code">What did Sarah agree to do?</span> and get specific answers with context.</p>

<h4>Chat Summaries</h4>
<p>In any Teams channel, click the <strong>Copilot icon</strong> in the channel header. Ask it to summarize what has been discussed since you last checked in. Works in group chats too.</p>

<h4>Meeting Prep</h4>
<p>Before a meeting, ask Copilot: <span class="inline-code">Prepare me for my 2pm meeting</span>. It pulls context from the invite, previous meeting notes, and related email threads so you walk in informed.</p>

<h4>Audio Recap (NEW)</h4>
<p>Audio recaps are now available in 8 languages: English, Spanish, French, German, Portuguese, Japanese, Mandarin Chinese, and Korean.</p>

<div class="tip-box">
  <div class="tip-title">Tip</div>
  Meetings must be recorded and transcribed for Copilot recaps to work. Enable both before the meeting starts.
</div>
`,
  implement: `
<h3>Exercise: Meeting Recap and Channel Summary</h3>

<div class="note-box">
  <div class="note-title">ODA Meeting Transcripts</div>
  <p>If you don't have a recent meeting with a transcript, download one of these ODA samples. Paste the text into Copilot Chat and ask it to summarize.</p>
  <ul>
    <li><a href="/mock-data/meeting-transcripts/Consultant-Coordination-CD.txt" download>Consultant Coordination (CD Phase)</a> — structural, MEP, and architecture team discussing Shore Club deadlines and RFIs</li>
    <li><a href="/mock-data/meeting-transcripts/Client-Budget-Meeting.txt" download>Client Budget Meeting</a> — principal meeting with The Mira Hotel client on design and budget</li>
    <li><a href="/mock-data/meeting-transcripts/HR-Onboarding-Checkin.txt" download>HR Onboarding Check-in</a> — new designer onboarding with software access and Revit training</li>
    <li><a href="/mock-data/meeting-transcripts/Design-Review-March.txt" download>Design Review</a> | <a href="/mock-data/meeting-transcripts/Marketing-Strategy-Q2.txt" download>Marketing Strategy</a></li>
  </ul>
</div>

<h4>Path A: You Have a Recorded Meeting</h4>
<ol>
<li>Open <strong>Microsoft Teams</strong>. Go to your Calendar and find a recent meeting that had a transcript (look for the "Transcript" or "Recap" indicator).</li>
<li>Click on the meeting, then click the <strong>Recap</strong> tab.</li>
<li>If Copilot shows a summary, read it. If not, click the <strong>Copilot icon</strong> in the meeting window.</li>
<li>Type:
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>What were the main decisions made in this meeting? List them as bullet points.</code></div></li>
<li>Check: Does the response list specific decisions with context? If yes, Copilot is reading the transcript correctly.</li>
<li>Now type:
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>What action items were assigned? Include who is responsible for each.</code></div></li>
<li>Verify: Each action item should have a person's name next to it.</li>
</ol>

<p><strong>Iterate:</strong> Read the output. Then send one of these refinement prompts:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Organize the action items by owner, and add a suggested deadline for each based on the discussion.</code></div>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Which decisions from this meeting still need follow-up or confirmation?</code></div>

<p class="personalization-note">[PERSONALIZED: swap with organization-specific meeting types and team names from Listen Labs interviews]</p>

<h4>Path B: You Do Not Have Recorded Meetings</h4>
<ol>
<li>Go to a <strong>Teams channel</strong> with recent messages. Click the <strong>Copilot icon</strong> in the channel header.</li>
<li>Type:
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Summarize what's been discussed in this channel over the past week. Highlight any unresolved questions.</code></div></li>
<li>Check: Does the summary mention specific people and topics? If yes, channel summarization is working.</li>
</ol>

<h4>Cross-Meeting Action Items</h4>
<ol start="8">
<li>Open <strong>Copilot Chat</strong> in Teams (click the Copilot icon in the left sidebar).</li>
<li>Type:
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>What meetings do I have this week? Summarize any that have already happened and list action items assigned to me.</code></div></li>
<li>If Copilot returns action items with meeting names and dates, cross-meeting search is working. If it says no meetings found, check that transcription is enabled for your meetings.</li>
</ol>

<div class="tip-box">
  <div class="tip-title">Success Check</div>
  Does the recap capture what actually mattered in the meeting — or just what was said most? Are the action items specific enough to act on, or do they need more detail? If a colleague who missed the meeting read this summary, would they be fully caught up? What context is missing?
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
