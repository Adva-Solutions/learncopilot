// AUTO-EXTRACTED by scripts/extract-lessons.js — do not hand-edit without updating the extractor.
window.LESSONS = [
  // ── Lesson 0: What's an Agent? (merge of old L0 + L1) ──
  {
    title: "What's an Agent?",
    points: 15,
    bonus: false,
    learn: `
<div class="note-box" style="background:#f8f3ff;border-left:3px solid #7b5ea7;padding:12px 16px;margin-bottom:18px;">
  <strong>Building on the first two courses:</strong> Everything you configured in <strong>Copilot Chat</strong> — Custom Instructions, Memory, Notebooks, Pages — is the foundation of every agent you'll build here. An agent is just a <em>reusable, shareable</em> version of that setup: a system prompt (Instructions), a knowledge base (Notebook-style references), and connected tools (the apps you mastered in Module 2).
</div>

<p><em>You've been talking to AI. Now AI is going to work for you.</em></p>

<h3>From Chat to Action</h3>
<p>Think about planning a trip. A chatbot helps you research nice places and compare flights. An agent actually books the trip, coordinates the hotels, checks museum availability, and sends you a confirmation. The difference is not intelligence &mdash; it is <strong>action</strong>.</p>
<p>A chatbot answers questions. An agent completes tasks.</p>

<h3>The Agent Equation</h3>
<p style="font-size:1.15em; text-align:center; padding:18px 0; letter-spacing:0.3px;"><strong>Model + Instructions + Tools + Knowledge + Memory = Agent</strong></p>
<ul>
  <li><strong>Model = Brain</strong> &mdash; the LLM that reasons about what to do next (GPT, Claude &mdash; you can now pick Claude inside Copilot)</li>
  <li><strong>Instructions = Training</strong> &mdash; the system prompt that defines the agent's role, tone, and constraints</li>
  <li><strong>Tools = Hands</strong> &mdash; what the agent can actually do: search the web, access Outlook, write files, query databases</li>
  <li><strong>Knowledge = Library</strong> &mdash; uploaded documents and connected sources like SharePoint, OneDrive, and Dataverse</li>
  <li><strong>Memory = Experience</strong> &mdash; context retention across sessions, allowing the agent to remember past interactions (still improving)</li>
</ul>

<h3>Why This Matters</h3>
<p>Without tools, an agent is just a chatbot. Without instructions, it has no focus. Without knowledge, it hallucinates. Without memory, it starts over every conversation. Each piece of the equation is essential.</p>

<h3>Pre-Built vs. Custom Agents</h3>
<p>You do not need to build every agent from scratch. Microsoft ships a <strong>gallery</strong> of ready-made agents you can add to your sidebar and use immediately. When none of those fit, you build your own. In this course you will do both &mdash; starting today by exploring what is already available.</p>
<p>Alongside the gallery, Microsoft offers templates that accelerate building when you are ready:</p>
<ul>
  <li><strong>Text Translator</strong> &mdash; translates content across languages with context awareness</li>
  <li><strong>Corporate Comms Crafter</strong> &mdash; drafts internal communications in your org's tone</li>
  <li><strong>RFP Generator</strong> &mdash; produces proposal responses from your past submissions</li>
  <li><strong>Customer Insights Assistant</strong> &mdash; synthesizes customer feedback and trends</li>
  <li><strong>Writing Coach</strong> &mdash; improves writing clarity and professionalism</li>
  <li><strong>Prompt Coach</strong> &mdash; helps you write better prompts for AI tools</li>
  <li><strong>Meeting Coach</strong> &mdash; prepares briefings and follow-ups for meetings</li>
</ul>

<h3>Sharing Levels</h3>
<p>Every agent can be shared at three levels: <strong>Only you</strong> (personal), <strong>Specific users</strong> (selected colleagues), or <strong>Anyone in your organization</strong> (full org gallery). You will pick the right level for each agent you build later in the course.</p>

<div class="tip-box">
  <div class="tip-title">Rule of thumb: when is something worth making into an agent?</div>
  <p>If you find yourself building <strong>the same prompt and content more than 3 times</strong>, it is probably worth setting up a quick agent. Before building, try the same task in plain Copilot Chat first and screenshot the result &mdash; that screenshot is your baseline, the thing the agent has to beat.</p>
</div>

<h3>Why agents matter &mdash; for you and for your organization</h3>
<p>For you personally, agents remove the setup cost from every repeated task. For your organization, agents do something bigger: <strong>they make output consistent</strong>. An agent that writes status reports the same way every time, cites the same sources, and follows the same format means your team produces uniform work. That is repeatable, shareable, and scalable &mdash; and it's the real reason agents matter beyond a single user.</p>

<p class="personalization-note">[PERSONALIZED: Think about the tasks you do every week that involve multiple tools or steps. Those are your best agent candidates.]</p>
    `,
    implement: `
<h3>Try It: Find an Agent, Summon It, Dismiss It</h3>
<p><em>This lesson is a short tour &mdash; you are just getting eyes on what agents look like inside Copilot. You'll actually use them in Lesson 2, and build your own in Lesson 3.</em></p>

<h4>Step 1: Open the Agents gallery</h4>
<p>Navigate to <strong>m365.cloud.microsoft</strong>, open <strong>Copilot</strong> from the left sidebar, and click <strong>Agents</strong> (or <strong>All agents</strong>). Scroll the gallery &mdash; you'll see <strong>Researcher</strong>, <strong>Analyst</strong>, and any org-specific agents your team has shared. Read a few descriptions so you get a feel for the range.</p>

<h4>Step 2: Pin one to your sidebar</h4>
<p>Pick one agent that looks most relevant to your role (Researcher and Analyst are safe first picks) and pin it so it lives in your left sidebar next to Chat.</p>

<h4>Step 3: Summon it in a chat</h4>
<p>Start a new chat. Type <strong>@</strong> and the agent's name &mdash; e.g. <span class="inline-code">@Researcher</span>. Notice the agent's name appears as a chip in the compose box. Now send any short question. See how the response includes the agent's branded panel, and in Researcher's case, a research plan.</p>

<h4>Step 4: Dismiss it</h4>
<p>Before sending the next message, remove the agent chip (click the x on it or press Backspace). Now you are back in plain Copilot Chat. Dismissing an agent is just as important as summoning one &mdash; it's how you stop its behavior and return to normal chat. Send a follow-up to confirm the response comes back without the agent's panel.</p>

<div class="tip-box">
  <div class="tip-title">Success Check</div>
  You found the gallery, pinned at least one agent, summoned it with <strong>@</strong>, and dismissed it. That's the mechanical loop you'll use for the rest of this module.
</div>
    `,
    advanced: `
<h3>The Agent Spectrum</h3>
<p>Not everything needs to be an agent. There is a spectrum of complexity:</p>
<ul>
  <li><strong>Simple prompt</strong> &mdash; a one-off question in Copilot Chat. Quick and disposable.</li>
  <li><strong>Custom instructions</strong> &mdash; a reusable prompt with persona and constraints saved for repeated use.</li>
  <li><strong>Agent</strong> &mdash; a persistent tool with instructions, knowledge, and tools that anyone on your team can use.</li>
  <li><strong>Multi-agent system</strong> &mdash; multiple agents working together, handing off tasks to each other in a workflow.</li>
</ul>
<p>Most people jump to building agents too soon. Start with a prompt. If you find yourself reusing it, upgrade to custom instructions. If others need it, build an agent. If the task spans multiple domains, chain agents together.</p>

<h3>Template vs. Build From Scratch</h3>
<p>Use a template when it matches your use case closely &mdash; you will spend 10 minutes customizing instead of 30 minutes building from scratch. Build from scratch when your task is highly specific to your organization or when no template comes close.</p>
<p>The best approach: start from a template, test it, and then heavily customize the instructions and knowledge sources until it fits your exact needs.</p>

<h3>Evaluating Agent Quality</h3>
<p>When testing an agent, evaluate it across four dimensions:</p>
<ul>
  <li><strong>Response accuracy</strong> &mdash; are the facts correct and current?</li>
  <li><strong>Tone match</strong> &mdash; does the output sound appropriate for your context?</li>
  <li><strong>Source citation</strong> &mdash; does it show where information came from?</li>
  <li><strong>Action reliability</strong> &mdash; when it takes actions (sending emails, creating files), does it do so correctly?</li>
</ul>

    `
  },

  // ── Lesson 1: Pre-Built Agents (merge of old L2 Researcher + L3 Analyst) ──
  {
    title: "Pre-Built Agents",
    points: 30,
    bonus: false,
    learn: `
<p><em>Microsoft gives you two powerful pre-built agents out of the box: the <strong>Researcher</strong> for web research and the <strong>Analyst</strong> for data work. This lesson covers both &mdash; pick the one most relevant to your role, or try both.</em></p>

<h3>The Researcher</h3>
<p>The Researcher agent performs deep, multi-source web research with citations. It does not just search &mdash; it <strong>synthesizes</strong>. Give it a complex question and it will:</p>
<ul>
  <li><strong>Break your question into sub-questions</strong> &mdash; decomposing a complex topic into searchable parts</li>
  <li><strong>Read full articles</strong> &mdash; not just snippets, but the complete content</li>
  <li><strong>Synthesize across sources</strong> &mdash; connecting findings from multiple articles into coherent analysis</li>
  <li><strong>Produce structured reports</strong> &mdash; with numbered citations, organized sections, and clear conclusions</li>
</ul>
<p>Once the Researcher finishes, you can export directly to <strong>Word</strong>, <strong>PowerPoint</strong>, <strong>PDF</strong>, or an <strong>audio overview</strong>.</p>

<h3>The Analyst</h3>
<p>The Researcher finds information from the web. The Analyst works with <em>your</em> data &mdash; spreadsheets, files, and numbers. Upload a file (Excel, CSV, or other structured data) and it analyzes patterns, creates visualizations, and delivers insights in plain language.</p>
<ul>
  <li><strong>Trend analysis</strong> &mdash; identifies patterns over time</li>
  <li><strong>Anomaly detection</strong> &mdash; flags outliers and unusual values automatically</li>
  <li><strong>Visualization</strong> &mdash; creates charts, graphs, and dashboards from your raw data</li>
  <li><strong>Summary dashboards</strong> &mdash; produces key metrics and KPIs at a glance</li>
</ul>
<p>The Analyst works with <strong>Excel files</strong> (.xlsx), <strong>CSV files</strong> (.csv), and uploaded data from your organization. Drag and drop a file directly into the conversation to get started.</p>

<h3>When to Use Which</h3>
<p>Use the <strong>Researcher</strong> when you need to compare multiple sources, synthesize a complex topic, or produce a report with citations &mdash; anything that would normally take 30+ minutes of Googling and reading.</p>
<p>Use the <strong>Analyst</strong> when the question is about <em>your</em> data &mdash; trends in spreadsheets, variance across departments, outliers in a dataset. The Analyst looks at the big picture; Excel Copilot (a different tool) is for working inside a specific sheet.</p>

<p class="personalization-note">[PERSONALIZED: Think about the last time you spent 30+ minutes researching a topic, or the spreadsheet you open most often. Those are exactly the tasks these agents should handle.]</p>
    `,
    implement: `
<h3>Try It: Pick Your Agent</h3>
<p>Pick the agent most relevant to your role, then choose your department. Each combination gives you a tailored exercise.</p>

<div class="option-tabs" id="agentType-options">
  <button class="option-tab active" onclick="switchOption('agentType', 0)">Researcher</button>
  <button class="option-tab" onclick="switchOption('agentType', 1)">Analyst</button>
</div>

<div class="option-content active" id="agentType-option-0">
<h3>Researcher Exercise</h3>

<div class="tip-box">
  <div class="tip-title">Heads up &mdash; the Researcher can take several minutes</div>
  <p>After you send the prompt in Step 2, the Researcher may run for 3&ndash;10 minutes while it reads and synthesizes sources. <strong>You can move on to Lesson 2 and come back later</strong> to review the output &mdash; the run continues in the background and your chat history keeps the result.</p>
</div>

<p>Pick your department:</p>

<div class="option-tabs" id="researcher-options">
  <button class="option-tab active" onclick="switchOption('researcher', 0)">Architecture</button>
  <button class="option-tab" onclick="switchOption('researcher', 1)">HR</button>
  <button class="option-tab" onclick="switchOption('researcher', 2)">Marketing</button>
  <button class="option-tab" onclick="switchOption('researcher', 3)">Executive</button>
  <button class="option-tab" onclick="switchOption('researcher', 4)">Operations</button>
</div>

<div class="option-content active" id="researcher-option-0">
<h4>Architecture: Building Code Research</h4>
<p><strong>Step 1:</strong> Open the <strong>Researcher</strong> agent from your sidebar (or find it in the Agents gallery).</p>
<p><strong>Step 2:</strong> Paste this prompt:</p>
<div class="code-block">
  <div class="code-block-header"><span>Researcher</span><button class="copy-btn" onclick="copyCode(this)">Copy</button></div>
  <pre>Research the latest NYC and Florida building code changes related to accessibility requirements for residential buildings above 75 feet. Compare new standards vs. previous requirements, include implementation timelines, cite relevant code sections, and note any differences between the two jurisdictions.</pre>
</div>
<p><strong>Step 3:</strong> Watch the research plan unfold. The Researcher will show you its plan before executing &mdash; note how it breaks your question into sub-topics.</p>
<p><strong>Step 4:</strong> Review the results. Check the citations &mdash; click through to at least 2 sources to verify accuracy.</p>
<p><strong>Step 5 (optional):</strong> When the Researcher is done, you can copy the output into a Word doc for editing, or save it as a <strong>Page</strong> (<em>Save to Page</em> in the response menu). No "Export to Word" button to hunt for &mdash; either prompt the Researcher to <em>export to Word</em>, or just copy-paste.</p>
</div>

<div class="option-content" id="researcher-option-1">
<h4>HR: Hybrid Work Policy Research</h4>
<p><strong>Step 1:</strong> Open the <strong>Researcher</strong> agent from your sidebar.</p>
<p><strong>Step 2:</strong> Paste this prompt:</p>
<div class="code-block">
  <div class="code-block-header"><span>Researcher</span><button class="copy-btn" onclick="copyCode(this)">Copy</button></div>
  <pre>Research best practices for hybrid work policies in nonprofit organizations with 100-500 employees. Include at least 5 peer organizations' approaches, retention data, and implementation frameworks.</pre>
</div>
<p><strong>Step 3:</strong> Watch the research plan unfold. Note how it identifies specific organizations and data sources to query.</p>
<p><strong>Step 4:</strong> Review the results and citations. Check whether the peer organizations cited are genuinely comparable to yours.</p>
<p><strong>Step 5 (optional):</strong> When the Researcher is done, you can copy the output into a Word doc for editing, or save it as a <strong>Page</strong> (<em>Save to Page</em> in the response menu). No "Export to Word" button to hunt for &mdash; either prompt the Researcher to <em>export to Word</em>, or just copy-paste.</p>
</div>

<div class="option-content" id="researcher-option-2">
<h4>Marketing: Competitor Communications Analysis</h4>
<p><strong>Step 1:</strong> Open the <strong>Researcher</strong> agent from your sidebar.</p>
<p><strong>Step 2:</strong> Paste this prompt:</p>
<div class="code-block">
  <div class="code-block-header"><span>Researcher</span><button class="copy-btn" onclick="copyCode(this)">Copy</button></div>
  <pre>Research our top 3 competitor organizations' recent public communications and content strategy over the past 6 months. Summarize their messaging themes, channels used, and audience engagement approaches.</pre>
</div>
<p><strong>Step 3:</strong> Watch the research plan. The Researcher will identify competitors based on context &mdash; if it asks for clarification, provide your actual competitor names.</p>
<p><strong>Step 4:</strong> Review the competitive analysis and verify the sources cited.</p>
<p><strong>Step 5 (optional):</strong> When the Researcher is done, you can copy the output into a Word doc for editing, or save it as a <strong>Page</strong> (<em>Save to Page</em> in the response menu). No "Export to Word" button to hunt for &mdash; either prompt the Researcher to <em>export to Word</em>, or just copy-paste.</p>
</div>

<div class="option-content" id="researcher-option-3">
<h4>Executive: Form Follows Experience &mdash; Deep Dive</h4>
<p><strong>Step 1:</strong> Open the <strong>Researcher</strong> agent from your sidebar.</p>
<p><strong>Step 2:</strong> Paste this prompt:</p>
<div class="code-block">
  <div class="code-block-header"><span>Researcher</span><button class="copy-btn" onclick="copyCode(this)">Copy</button></div>
  <pre>Research recent architecture projects globally (past 12 months) that exemplify the idea of "form follows experience" — where building form is shaped by how humans move through, inhabit, or perceive the space. Include at least 5 projects from different firms. For each, describe the specific spatial or programmatic decision that expresses the idea, and cite the publication or source where the project was covered. Flag any project that would also fit "porosity for prosperity" or "architecture as a social technology."</pre>
</div>
<p><strong>Step 3:</strong> Watch the research plan unfold. Note how the Researcher decomposes the question &mdash; it will likely search for "experiential architecture," "spatial narrative," and specific firms known for this approach.</p>
<p><strong>Step 4:</strong> Review the findings. For each project, verify that the cited spatial decision actually ties to <em>experience</em> rather than generic good design. Click through at least 2 of the source citations to confirm accuracy.</p>
<p><strong>Step 5 (optional):</strong> Copy the output into a Word doc for editing, or save it as a <strong>Page</strong> (<em>Save to Page</em> in the response menu) so the references stay searchable the next time you run a Researcher pass on the same three ideas.</p>
</div>

<div class="option-content" id="researcher-option-4">
<h4>Operations: Vendor Comparison</h4>
<p><strong>Step 1:</strong> Open the <strong>Researcher</strong> agent from your sidebar.</p>
<p><strong>Step 2:</strong> Paste this prompt:</p>
<div class="code-block">
  <div class="code-block-header"><span>Researcher</span><button class="copy-btn" onclick="copyCode(this)">Copy</button></div>
  <pre>Research vendor options for document management systems suitable for a professional services firm with 100-500 employees. Compare pricing, features, integrations, and reviews from at least 4 providers.</pre>
</div>
<p><strong>Step 3:</strong> Watch the research plan. The Researcher should identify specific vendors and comparison criteria.</p>
<p><strong>Step 4:</strong> Review the comparison table and check whether listed features and pricing are current.</p>
<p><strong>Step 5 (optional):</strong> When the Researcher is done, you can copy the output into a Word doc for editing, or save it as a <strong>Page</strong> (<em>Save to Page</em> in the response menu). No "Export to Word" button to hunt for &mdash; either prompt the Researcher to <em>export to Word</em>, or just copy-paste.</p>
</div>

<h4>Reflective Check</h4>
<p>Compare the Researcher output to your normal research process. How long would this have taken you manually? Which citations did you verify &mdash; and were they accurate?</p>
</div>

<div class="option-content" id="agentType-option-1">
<h3>Analyst Exercise</h3>
<p>Pick your department:</p>

<div class="option-tabs" id="analyst-options">
  <button class="option-tab active" onclick="switchOption('analyst', 0)">Architecture</button>
  <button class="option-tab" onclick="switchOption('analyst', 1)">HR</button>
  <button class="option-tab" onclick="switchOption('analyst', 2)">Marketing</button>
  <button class="option-tab" onclick="switchOption('analyst', 3)">Executive</button>
  <button class="option-tab" onclick="switchOption('analyst', 4)">Operations</button>
</div>

<div class="option-content active" id="analyst-option-0">
<h4>Architecture: Project Tracker Analysis</h4>
<div class="note-box">
  <div class="note-title">Sample Data</div>
  <p>Download the <a href="/mock-data/financials/oda-project-tracking.xlsx" download>Project Tracking Data</a> to use for this exercise. Or use your own project tracker if you have one.</p>
</div>
<p><strong>Step 1:</strong> Open the <strong>Analyst</strong> agent from your sidebar (or find it in the Agents gallery).</p>
<p><strong>Step 2:</strong> Upload the project tracking file by dragging it into the chat or clicking the attachment icon.</p>
<p><strong>Step 3:</strong> Send this prompt:</p>
<div class="code-block">
  <div class="code-block-header"><span>Analyst</span><button class="copy-btn" onclick="copyCode(this)">Copy</button></div>
  <pre>Analyze project timelines and budgets. Which projects are at risk of delay? Which are over budget? Create a visual timeline showing all projects and a budget variance chart.</pre>
</div>
<p><strong>Step 4:</strong> Review the analysis. Check whether the at-risk projects match your own assessment.</p>
<p><strong>Step 5 &mdash; Iterate:</strong> Ask for additional visualizations:</p>
<div class="code-block">
  <div class="code-block-header"><span>Analyst</span><button class="copy-btn" onclick="copyCode(this)">Copy</button></div>
  <pre>Create 2 additional charts: (1) a comparison of planned vs. actual hours by project, and (2) a breakdown of contract fees by project typology. Highlight the projects with the largest variance.</pre>
</div>
</div>

<div class="option-content" id="analyst-option-1">
<h4>HR: Team Composition Analysis</h4>
<div class="note-box">
  <div class="note-title">Sample Data</div>
  <p>Download the <a href="/mock-data/staffing/oda-resource-allocation.xlsx" download>Resource Allocation Data</a> or the <a href="/mock-data/oda-team-directory.xlsx" download>Team Directory</a> to use for this exercise. Or use your own team data if you have it.</p>
</div>
<p><strong>Step 1:</strong> Open the <strong>Analyst</strong> agent from your sidebar.</p>
<p><strong>Step 2:</strong> Upload the resource allocation file.</p>
<p><strong>Step 3:</strong> Send this prompt:</p>
<div class="code-block">
  <div class="code-block-header"><span>Analyst</span><button class="copy-btn" onclick="copyCode(this)">Copy</button></div>
  <pre>Analyze department headcount distribution and tenure. Show turnover trends if dates are available. Create a summary chart showing team composition by department and seniority level.</pre>
</div>
<p><strong>Step 4:</strong> Review the charts and insights. Do the department distributions match your expectations?</p>
<p><strong>Step 5 &mdash; Iterate:</strong> Go deeper:</p>
<div class="code-block">
  <div class="code-block-header"><span>Analyst</span><button class="copy-btn" onclick="copyCode(this)">Copy</button></div>
  <pre>Create 2 additional visualizations: (1) a department-by-department headcount comparison chart, and (2) a utilization rate distribution showing which teams are over- or under-allocated.</pre>
</div>
</div>

<div class="option-content" id="analyst-option-2">
<h4>Marketing: Campaign Performance Analysis</h4>
<div class="note-box">
  <div class="note-title">Sample Data</div>
  <p>Download the <a href="/mock-data/marketing/oda-social-media-metrics.xlsx" download>Social Media Metrics</a> to use for this exercise. Or use your own campaign data if you have it.</p>
</div>
<p><strong>Step 1:</strong> Open the <strong>Analyst</strong> agent from your sidebar.</p>
<p><strong>Step 2:</strong> Upload the campaign metrics file.</p>
<p><strong>Step 3:</strong> Send this prompt:</p>
<div class="code-block">
  <div class="code-block-header"><span>Analyst</span><button class="copy-btn" onclick="copyCode(this)">Copy</button></div>
  <pre>Analyze engagement metrics across all campaigns. Which channels perform best? What is the cost per engagement? Create comparison charts and identify the top 3 performing campaigns.</pre>
</div>
<p><strong>Step 4:</strong> Review the channel comparison and top campaign rankings.</p>
<p><strong>Step 5 &mdash; Iterate:</strong> Dig deeper into performance:</p>
<div class="code-block">
  <div class="code-block-header"><span>Analyst</span><button class="copy-btn" onclick="copyCode(this)">Copy</button></div>
  <pre>Create 2 additional visualizations: (1) engagement rate trends over time by platform, and (2) a scatter plot of cost vs. engagement showing which campaigns delivered the best ROI.</pre>
</div>
</div>

<div class="option-content" id="analyst-option-3">
<h4>Executive: Peer Firm Activity Analysis</h4>
<div class="note-box">
  <div class="note-title">Sample Data</div>
  <p>Download the <a href="/mock-data/executive/oda-peer-firms.xlsx" download>ODA Peer Firms</a> list for this exercise. Or use your own peer-firm tracking spreadsheet if you have one.</p>
</div>
<p><strong>Step 1:</strong> Open the <strong>Analyst</strong> agent from your sidebar.</p>
<p><strong>Step 2:</strong> Upload the peer-firms file.</p>
<p><strong>Step 3:</strong> Send this prompt:</p>
<div class="code-block">
  <div class="code-block-header"><span>Analyst</span><button class="copy-btn" onclick="copyCode(this)">Copy</button></div>
  <pre>Analyze recent activity across the peer firms in this file. Rank firms by total activity (competitions entered, awards won, project announcements) over the past 6 months. Add a column estimating philosophical alignment with ODA's three core ideas — "form follows experience," "porosity for prosperity," "architecture as a social technology" — based on keyword hits in the "Notable recent projects" column. Create a Pareto chart of peer activity and a monthly trend line of average alignment score.</pre>
</div>
<p><strong>Step 4:</strong> Review the rankings and the alignment scores. Do the firms at the top match the ones the Principal actually watches? Are there any surprises — firms rising in alignment that weren't on the radar before?</p>
<p><strong>Step 5 &mdash; Iterate:</strong> Request radar-ready views:</p>
<div class="code-block">
  <div class="code-block-header"><span>Analyst</span><button class="copy-btn" onclick="copyCode(this)">Copy</button></div>
  <pre>Create 2 additional visualizations: (1) a scatter plot of peer activity (x) vs. alignment score (y), with firms labeled, so we can see who's active AND aligned vs. active-but-off-lens; (2) a small multiples chart showing each of the top 5 firms' alignment trend over time. Highlight any firm whose alignment has climbed meaningfully.</pre>
</div>
</div>

<div class="option-content" id="analyst-option-4">
<h4>Operations: Construction Cost Benchmarking</h4>
<div class="note-box">
  <div class="note-title">Sample Data</div>
  <p>Download the <a href="/mock-data/financials/oda-construction-costs.xlsx" download>Construction Cost Breakdown Data</a> to use for this exercise. Or use your own cost data if you have it.</p>
</div>
<p><strong>Step 1:</strong> Open the <strong>Analyst</strong> agent from your sidebar.</p>
<p><strong>Step 2:</strong> Upload the construction cost data file.</p>
<p><strong>Step 3:</strong> Send this prompt:</p>
<div class="code-block">
  <div class="code-block-header"><span>Analyst</span><button class="copy-btn" onclick="copyCode(this)">Copy</button></div>
  <pre>Analyze construction cost breakdowns across all projects. For each trade (Structural, MEP, Facade, Interior Finishes, Site Work, General Conditions), calculate the average percentage of total construction cost. Compare costs across project typologies (Residential vs. Hospitality vs. Mixed-Use). Flag any projects where a trade's percentage deviates significantly from the average.</pre>
</div>
<p><strong>Step 4:</strong> Review the cost benchmarks. Do the trade percentages match your expectations for each typology?</p>
<p><strong>Step 5 &mdash; Iterate:</strong> Drill into the details:</p>
<div class="code-block">
  <div class="code-block-header"><span>Analyst</span><button class="copy-btn" onclick="copyCode(this)">Copy</button></div>
  <pre>Create 2 additional visualizations: (1) a stacked bar chart showing trade cost breakdowns by project, and (2) a scatter plot of total construction cost vs. square footage with trend lines by typology. Which typology has the highest cost per square foot?</pre>
</div>
</div>

<h4>Reflective Check</h4>
<p>How did the Analyst's insights compare to what you would have produced manually in Excel? Were the visualizations useful, or would you want different chart types?</p>
</div>
    `,
    advanced: `
<h3>Chaining Researcher Output</h3>
<p>The Researcher is most powerful when its output feeds into your next step:</p>
<ul>
  <li><strong>Researcher</strong> &rarr; export to Word &rarr; use <strong>Copilot in Word</strong> to restructure the report for your audience &rarr; share via Teams</li>
  <li><strong>Researcher</strong> &rarr; export to PowerPoint &rarr; use <strong>Copilot in PowerPoint</strong> to refine the slides &rarr; present at a meeting</li>
  <li><strong>Researcher</strong> &rarr; save to a Copilot <strong>Page</strong> &rarr; reference it in future conversations as persistent context</li>
</ul>

<h3>Analyst + Researcher Combo</h3>
<p>The most powerful analysis combines external context with internal data:</p>
<ul>
  <li>Use the <strong>Researcher</strong> to find industry benchmarks and market context</li>
  <li>Use the <strong>Analyst</strong> to analyze your own data against those benchmarks</li>
  <li>Combine the insights into a single report: "Here is where we stand, here is how we compare, here is what we should do about it."</li>
</ul>

<h3>Research Quality Tips</h3>
<p>The quality of the Researcher's output depends heavily on the specificity of your question:</p>
<ul>
  <li><strong>Weak:</strong> "Research building codes" &mdash; too broad, results will be generic</li>
  <li><strong>Better:</strong> "Research NYC residential building code changes for 2025-2026 related to accessibility" &mdash; specific jurisdiction, timeframe, and topic</li>
  <li><strong>Best:</strong> "Research NYC residential building code changes for 2025-2026 related to accessibility requirements for buildings above 75 feet. Compare new standards to previous requirements and cite specific code sections." &mdash; adds constraints and output format</li>
</ul>

<h3>Data Preparation Tips</h3>
<p>The Analyst produces better results when your data is clean:</p>
<ul>
  <li><strong>Clean column headers</strong> &mdash; use descriptive names like "Contract_Fee" instead of "Col_D"</li>
  <li><strong>Consistent date formats</strong> &mdash; pick one format (YYYY-MM-DD works best) and use it throughout</li>
  <li><strong>No merged cells</strong> &mdash; merged cells in Excel confuse the parser</li>
  <li><strong>One table per sheet</strong> &mdash; if your file has multiple data tables on one sheet, split them</li>
</ul>

<h3>Pages as Research Libraries</h3>
<p>When you save Researcher output to a <strong>Page</strong> in Copilot, it becomes a persistent reference you can cite in future conversations. Build a library of research pages over time &mdash; each one becomes part of your personal knowledge base that Copilot can draw from in later sessions.</p>

<h3>Exporting Analyst Charts to Presentations</h3>
<p>When the Analyst creates charts you want to share: ask for the visualization &rarr; export or screenshot the charts &rarr; paste into PowerPoint &rarr; use <strong>Copilot in PowerPoint</strong> to add executive context, talking points, and slide notes. This chain &mdash; Analyst for the data, PowerPoint Copilot for the narrative &mdash; produces presentation-ready materials in minutes instead of hours.</p>
    `
  },

  // ── Lesson 2: Build Your Own Agent (Write Like Me starter pattern) ──
  {
    title: "Build Your Own Agent",
    points: 40,
    bonus: false,
    learn: `
<p><em>You've used pre-built agents. Now you'll build your own. This lesson walks you through the Write Like Me starter pattern &mdash; the fastest way to produce drafts that sound like you from day one.</em></p>

<h3>The Agent Builder Interface</h3>
<p>When you create a new agent, you will see two modes at the top: <strong>"Describe"</strong> and <strong>"Configure."</strong> Always use <strong>Configure</strong> &mdash; it gives you full control over the fields that matter.</p>
<p>The main fields you'll work with:</p>
<ul>
  <li><strong>Instructions</strong> &mdash; the system prompt. This is where 90% of an agent's quality comes from.</li>
  <li><strong>Knowledge</strong> &mdash; file uploads, URLs, or M365 sources (SharePoint, Outlook, People) the agent can reference.</li>
  <li><strong>Capabilities</strong> &mdash; toggles for creating documents/charts/images.</li>
  <li><strong>Suggested prompts</strong> &mdash; the starter chips users see when they first open the agent.</li>
  <li><strong>Share</strong> &mdash; the scope: only you, specific people, or the whole org.</li>
</ul>

<h3>Why Write Like Me</h3>
<p>AI drafts usually read like a corporate manual because the model has no idea how <strong>you</strong> write. Write Like Me extracts your writing voice from real sent emails and uses it as the agent's system prompt &mdash; so every draft the agent produces already sounds like you. First draft, not rewrite.</p>

<div class="tip-box">
  <div class="tip-title">One agent per workflow, not per task</div>
  <p>Build one agent per recurring workflow or document type &mdash; not a new agent for every single instance. The agent knows the structure; you pass the specifics at runtime. One well-configured agent can produce dozens of variations as long as they follow the same template.</p>
</div>

<p class="personalization-note">[PERSONALIZED: Think about the emails you write most often. Whichever takes the most time is the one this agent will help most with.]</p>
    `,
    implement: `
<h3>Build Your Write Like Me Agent</h3>
<p><em>You'll extract your writing voice from real sent emails, paste that voice profile as the agent's system prompt, and every draft the agent produces now sounds like you &mdash; first draft, not rewrite.</em></p>

<h4>Step 0: Benchmark</h4>
<p>Go to plain Copilot Chat. Ask it to write a professional email about a topic of your choice &mdash; a project update, a meeting follow-up, or a request to a colleague. Screenshot or copy the result. This is your "before." You will compare against it later to see how much better a voice-trained agent performs.</p>

<h4>Step 1: Extract Your Writing Voice</h4>
<p>In Copilot Chat (Work mode), run this prompt:</p>
<div class="code-block">
  <div class="code-block-header"><span>Prompt</span><button class="copy-btn" onclick="copyCode(this)">Copy</button></div>
  <pre>Please analyze my last 100 sent emails and extract my writing style, tone, vocabulary patterns, sentence structure, typical greetings and sign-offs, and overall voice. Turn this analysis into a detailed system prompt I can use to configure an AI agent to write emails that sound exactly like me.</pre>
</div>
<p>Copilot will analyze your sent emails and produce a detailed voice profile as a system prompt. This output includes your typical sentence length, formality level, common phrases, greeting and closing patterns, and tone characteristics. Copy the entire output &mdash; you will paste it in the next step.</p>

<h4>Step 2: Create the Agent</h4>
<p>Click <strong>"New Agent"</strong> in the left sidebar. Toggle to <strong>"Configure"</strong> (not "Describe"):</p>
<ul>
  <li><strong>Name:</strong> "My Email Assistant" (or your own variant)</li>
  <li><strong>Description:</strong> "Writes emails in [your name]'s personal writing style"</li>
  <li><strong>Instructions:</strong> Paste the system prompt from Step 1 (the full voice profile)</li>
  <li><strong>Knowledge:</strong> Click the Outlook icon to connect your email history ("My Emails")</li>
  <li><strong>Suggested prompts:</strong>
    <ul>
      <li>Title: "Follow-up" / Message: "Write a follow-up to..."</li>
      <li>Title: "Proofread" / Message: "Proofread this email and suggest improvements"</li>
      <li>Title: "Draft reply" / Message: "Draft a reply to [name] about [topic]"</li>
    </ul>
  </li>
</ul>

<h4>Step 3: Test and Iterate</h4>
<p>Ask your agent: "Draft a reply to [colleague] about [recent topic]." Does it sound like you? Compare the output to how you would actually write that email.</p>
<ul>
  <li>If the tone is too formal or too casual, add a rule to the Instructions</li>
  <li>If it uses phrases you never use, add "Never use the phrase '...'" to the Instructions</li>
  <li>If it misses your sign-off style, specify it explicitly in the Instructions</li>
  <li>Rule of thumb: <strong>if you correct the same mistake more than once, add a rule for it in the Instructions</strong></li>
</ul>

<h4>Step 4: Cross-App Usage</h4>
<p>Your agent is now available everywhere in M365:</p>
<ul>
  <li><strong>In Outlook:</strong> type @ in the Copilot sidebar, select your agent &mdash; it sees the email thread and drafts in context</li>
  <li><strong>In Teams:</strong> @mention your agent in any chat for a quick draft</li>
  <li><strong>In Word:</strong> use the agent to help draft longer communications</li>
</ul>

<div class="note-box">
  <div class="note-title">Note</div>
  <p>Copy-paste the draft into the email. Sending directly from the agent is not yet available &mdash; intentionally, for safety. Always review before sending.</p>
</div>

<p>Now iterate: run 3 more test emails. After each, update the Instructions if needed. The difference between a mediocre agent and a great one is usually 3-4 rounds of refinement.</p>

<h4>Reflective Check</h4>
<p>Compare your agent's output to the benchmark from Step 0. Does the voice-trained version sound more like you? What specific improvements do you see in greeting style, tone, and vocabulary?</p>


    `,
    advanced: `
<h3>Agent Chaining Workflow</h3>
<p>Your agent generates content, but you can chain it with other tools for a full workflow:</p>
<ol>
  <li>Your <strong>Write Like Me</strong> agent generates the raw content</li>
  <li>Open the output in <strong>Word</strong> &rarr; use "Edit with Copilot" to format it into your branded template</li>
  <li>Open <strong>PowerPoint</strong> &rarr; use Copilot to create a presentation deck from the Word document</li>
</ol>
<p>This three-step chain (Agent &rarr; Word &rarr; PowerPoint) takes a process that used to require hours and compresses it to minutes.</p>

<h3>Sharing and Team Use</h3>
<p>Build one well-configured agent per recurring workflow or team. Share it with the people who'd use it so everyone generates consistent output. When someone new joins, they do not need to learn the template &mdash; the agent already knows it.</p>

<h3>Privacy Note</h3>
<p>Writing samples and email access stay within your organization's compliance boundaries. Your voice profile and the agent's Instructions are visible only to people you share the agent with. No data leaves your M365 tenant.</p>

<h3>Pro Tip: Voice Profiles for Others</h3>
<p>Have the agent analyze a colleague's voice too &mdash; useful for drafting on behalf of executives or team leads. Ask the person's permission first, then run the same extraction prompt using their sent emails (if you have delegate access) or ask them to share 5-10 representative emails.</p>

<h3>Iteration Checklist (Write Like Me)</h3>
<p>Before calling your Write Like Me agent "done," verify these elements match your real writing:</p>
<ul>
  <li>Greetings &#10003;</li>
  <li>Sign-offs &#10003;</li>
  <li>Sentence length &#10003;</li>
  <li>Formality level &#10003;</li>
  <li>Vocabulary &#10003;</li>
  <li>Emoji usage &#10003;</li>
</ul>

<h3>Version Control: Update vs. Create New</h3>
<p>Know when to update the Instructions versus when to create a new agent:</p>
<ul>
  <li><strong>Tweaks to tone, length, or formatting</strong> &rarr; update the existing Instructions</li>
  <li><strong>Major template changes</strong> (new sections, different audience, different report type) &rarr; create a new agent</li>
</ul>

<h3>One Agent per Workflow, Not per Task</h3>
<p>Resist the urge to build a new agent for every single report or email instance. Instead, build one agent per recurring workflow or document type. The agent knows the structure and context; you pass the specifics at runtime &mdash; this month's data, this week's updates, this quarter's numbers. One well-configured agent can handle dozens of variations.</p>
    `
  },

  // ── Lesson 3: Agent Best Practices (was old L7) ──
  {
    title: "Agent Best Practices",
    points: 15,
    bonus: false,
    learn: `
<p><em>You've built agents and used pre-built ones. Before you deploy them widely, let's make sure they're production-ready.</em></p>

<h3>Three Principles for Production Agents</h3>

<h4>1. Test with Real Scenarios</h4>
<p>Use 5-10 real inputs from your actual work. Screenshot the results. Then run the same inputs through plain Copilot Chat (no agent) and compare. If your agent does not clearly beat that baseline &mdash; same inputs, worse output &mdash; something needs adjusting. Do not deploy an agent that performs worse than plain Copilot.</p>

<h4>2. Iterate from Simple to Complex</h4>
<p>Start with Instructions only. Get the core behavior right. Then add Knowledge sources. Then add capabilities and tools. Each layer introduces new failure modes, so validate at every step before adding the next.</p>
<ol>
  <li>Instructions only &rarr; test</li>
  <li>Add Knowledge &rarr; test</li>
  <li>Add capabilities/tools &rarr; test</li>
</ol>

<h4>3. Deploy in Phases</h4>
<p>Never go from "it works on my machine" to "everyone in the company uses it." Deploy in stages:</p>
<ul>
  <li><strong>Personal</strong> &mdash; just you, for at least a week</li>
  <li><strong>Alpha</strong> &mdash; 2-3 trusted testers who will give honest feedback</li>
  <li><strong>Beta</strong> &mdash; your full team</li>
  <li><strong>Pilot</strong> &mdash; one department</li>
  <li><strong>Org-wide</strong> &mdash; after proven success in the pilot</li>
</ul>

<h3>The Iteration Cycle</h3>
<p>Every good agent goes through this loop: <strong>Build &rarr; Test &rarr; Add a rule &rarr; Test again &rarr; Repeat.</strong> The best agents are not built in one session. They are refined over 3-5 rounds of real-world testing and rule-adding.</p>

<h3>When to Update vs. When to Start Fresh</h3>
<p>Rule of thumb: if you are changing more than 30% of the Instructions, create a new agent instead of modifying the existing one. Small tweaks to tone, formatting, or edge-case handling belong in the existing agent. Fundamental changes to scope, audience, or output format deserve a fresh start.</p>

<h3>Sharing and Permissions</h3>
<p>Every agent has three sharing levels:</p>
<ul>
  <li><strong>Only you</strong> &mdash; personal tool, no one else can see or use it</li>
  <li><strong>Specific users</strong> &mdash; shared with selected colleagues by email</li>
  <li><strong>Anyone in your organization</strong> &mdash; available to all org members</li>
</ul>
<p>Start at "Only you" and expand as you validate the agent's quality.</p>

<p class="personalization-note">[PERSONALIZED: Think about who on your team would benefit most from your agents. Those are your ideal alpha testers.]</p>
    `,
    implement: `
<h3>Test and Refine Your Agent</h3>
<p><em>Take the agent you built in Lesson 2 and put it through a quick iteration loop. Two real tests is enough to surface most issues &mdash; the goal is to notice what's off and tighten the system prompt, not fill out a spreadsheet.</em></p>

<h4>Step 1: Run 2 real tests</h4>
<p>Use genuinely different inputs &mdash; not two variations of the same thing. Try one easy email (a quick follow-up) and one harder one (a difficult conversation or a delicate decline). The easy one shows whether the voice is right; the harder one shows whether the agent knows when to break its own pattern.</p>

<h4>Step 2: Note what's off</h4>
<p>Read the outputs. Don't grade everything &mdash; just notice anything that would make you reject the draft. Common issues: wrong tone, missing sections, overused filler phrases, too long, too short.</p>

<h4>Step 3: Update the system prompt</h4>
<p>For each issue, add a specific rule to the agent's Instructions. Be concrete: instead of <em>"be more casual"</em>, write <em>"Use contractions. Start with 'Hi' instead of 'Dear.' Keep sentences under 20 words."</em> Instead of <em>"better structure"</em>, write <em>"Every report must have these 4 sections in this order: Summary, Progress, Risks, Next Steps."</em></p>

<h4>Step 4: Re-test and compare</h4>
<p>Run the same 2 inputs again. The improvements should be visible. If an issue persists, the rule wasn't specific enough &mdash; rewrite it and try once more. Repeat until you'd actually send the draft with minor edits.</p>
    `,
    advanced: `
<h3>Advanced: Production Operations</h3>

<h4>The Agent Lifecycle</h4>
<p>Production agents follow a continuous cycle: <strong>Build &rarr; Test &rarr; Deploy &rarr; Monitor &rarr; Improve &rarr; Repeat.</strong> An agent is never "done." Requirements change, data changes, and user expectations evolve. Plan for ongoing maintenance from the start.</p>

<h4>Enterprise Governance</h4>
<p>For organizations deploying multiple agents, establish:</p>
<ul>
  <li><strong>Agent registry:</strong> Document every agent in production &mdash; its name, purpose, owner, data access, and review schedule</li>
  <li><strong>Ownership:</strong> Every agent must have a named owner responsible for its quality and maintenance</li>
  <li><strong>Data access documentation:</strong> Record which data sources each agent can read and write, and who approved that access</li>
  <li><strong>Quarterly reviews:</strong> Evaluate each agent's usage, accuracy, and relevance on a regular schedule</li>
</ul>

<h4>Copilot Studio Evaluations</h4>
<p>Use Copilot Studio's built-in evaluation framework to formalize your testing:</p>
<ul>
  <li>Define input-output test pairs based on real scenarios</li>
  <li>Run evaluations against new agent versions before deploying</li>
  <li>Compare versions side-by-side to catch regressions</li>
  <li>Set up automated evaluation runs to detect quality drift over time</li>
</ul>

<h4>Retirement Criteria</h4>
<p>Know when to deprecate an agent. Retire an agent when:</p>
<ul>
  <li>Usage drops below a meaningful threshold for 60+ days</li>
  <li>The underlying requirements have fundamentally changed</li>
  <li>A better agent (or a built-in feature) now covers the same need</li>
  <li>The data sources it depends on are being decommissioned</li>
</ul>
<p>Retirement is not failure. It is good governance. A retired agent that served its purpose is better than an abandoned agent that confuses users.</p>
    `
  }
];
