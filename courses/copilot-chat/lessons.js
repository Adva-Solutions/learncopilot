// AUTO-EXTRACTED by scripts/extract-lessons.js — do not hand-edit without updating the extractor.
window.LESSONS = [
// ── 0: Know Your Way Around ──
{
  id: 'know-your-way-around',
  title: 'Know Your Way Around',
  points: 5,
  learn: `
<h3>The 10% Problem</h3>
<p>Most people use AI the same way: open a chat, type a question, read the answer. That is about 10% of what M365 Copilot can do. This workshop teaches the other 90%.</p>

<div class="tip-box">
  <div class="tip-title">New to AI?</div>
  <p>If you have never used an AI tool beyond a quick Google-style search, you are in the right place. This workshop starts from zero. By the end of today, you will have used AI for real work — not just experiments.</p>
</div>

<div class="note-box">
  <strong>No install required.</strong> Open <strong>m365.cloud.microsoft</strong> in your browser and sign in with your work account. No IT tickets, no downloads.
</div>

<h3>A Quick Map — Four Regions</h3>
<p>Before you touch anything, know the lay of the land. M365 Copilot has four regions you will come back to all day:</p>

<ol class="region-map">
  <li><strong>Top bar</strong> — the <strong>Work / Web mode toggle</strong> (choose whether Copilot answers from your organization's data or also from the public internet), the model selector (Auto / Quick response / Think Deeper), and the three-dot menu (Settings, temporary chat).</li>
  <li><strong>Left sidebar</strong> — where you navigate between New chat, Search, Library, Create, Agents, Notebooks, Chats, and Apps.</li>
  <li><strong>Chat area</strong> — the center of the screen: the message box, quick-action pills, the prompt gallery, and the microphone.</li>
  <li><strong>Settings</strong> — opened from the three-dot menu. This is where you make Copilot yours (Custom instructions, Sources, Memory).</li>
</ol>

<p>That is the whole orientation. The Exercise tab walks you through each region click by click and explains <em>why</em> each control matters. Treat it like unboxing a new phone — 10 minutes of exploring now pays off every day after.</p>

<button class="continue-btn" onclick="switchTab(0,'implement')">Continue to Exercises &rarr;</button>
`,
  implement: `
<h3>Explore Every Corner</h3>
<p>Work through the cards below. Each one tells you <strong>what to do</strong> and <strong>why it matters</strong>. Tick it when you are done.</p>

<div class="exercise-card">
  <div class="exercise-card-num">1</div>
  <div class="exercise-card-body">
    <h4>Sign in</h4>
    <p><strong>Do:</strong> Open <strong>m365.cloud.microsoft</strong> and sign in with your work account.</p>
    <p><strong>Why:</strong> This is M365 Copilot's home base — the same chat you will use inside Outlook, Word, Excel, PowerPoint, and Teams, only standalone.</p>
    <label class="exercise-check"><input type="checkbox"> Done</label>
  </div>
</div>

<div class="exercise-card">
  <div class="exercise-card-num">2</div>
  <div class="exercise-card-body">
    <h4>Pick your thinking depth — the model selector</h4>
    <p><strong>Do:</strong></p>
    <ol>
      <li>In the top right, find the button labeled <strong>Auto</strong>.</li>
      <li>Click it — you will see <strong>Auto</strong>, <strong>Quick response</strong>, and <strong>Think Deeper</strong>.</li>
      <li>Select <strong>Think Deeper</strong>.</li>
    </ol>
    <p><strong>Why:</strong> <em>Auto</em> lets Copilot pick speed vs. depth automatically. <em>Think Deeper</em> forces a reasoning model — best for analysis, multi-step problems, and anything you want Copilot to really think through before answering.</p>
    <label class="exercise-check"><input type="checkbox"> Done</label>
  </div>
</div>

<div class="exercise-card">
  <div class="exercise-card-num">3</div>
  <div class="exercise-card-body">
    <h4>Switch the Work / Web toggle to Web</h4>
    <p><strong>Do:</strong> At the top of the Copilot screen, find the <strong>Work / Web</strong> toggle. It starts on <strong>Work</strong>. Click <strong>Web</strong>.</p>
    <p><strong>Why:</strong> In <strong>Work</strong> mode, Copilot answers from your organization's data — emails, files, Teams chats, SharePoint. In <strong>Web</strong> mode, Copilot can also pull information from the <em>public internet</em>. We switch to Web any time we want Copilot to look at <em>external</em> information — news, regulations, industry standards, competitors, anything outside your tenant.</p>
    <label class="exercise-check"><input type="checkbox"> Done</label>
  </div>
</div>

<div class="exercise-card">
  <div class="exercise-card-num">4</div>
  <div class="exercise-card-body">
    <h4>Send your first Think Deeper prompt</h4>
    <p><strong>Do:</strong> Paste this into the message box and send it.</p>
    <div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>What are the pros and cons of using precast concrete vs. terracotta rainscreen panels for a residential tower facade? Consider cost, durability, aesthetics, maintenance, and sustainability. Think through each factor carefully.</code></div>
    <p><strong>Why:</strong> This is the kind of open-ended question that shows the difference between a fast answer and a thoughtful one — and lets you see Web mode kick in when the answer pulls in external standards or vendor information.</p>
    <label class="exercise-check"><input type="checkbox"> Done</label>
  </div>
</div>

<div class="exercise-card">
  <div class="exercise-card-num">5</div>
  <div class="exercise-card-body">
    <h4>See how Copilot is thinking</h4>
    <p><strong>Do:</strong> While Think Deeper generates the answer, look at the top of the response — there is a <strong>reasoning summary</strong> with a small <strong>caret / arrow</strong>. Click it to expand.</p>
    <p><strong>Why:</strong> This reveals the <em>plan</em> Copilot built and the steps it took to reach the answer. Use it to check the model's logic — it is the fastest way to spot when Copilot has misread the question or skipped a factor that matters to you.</p>
    <label class="exercise-check"><input type="checkbox"> Done</label>
  </div>
</div>

<div class="exercise-card">
  <div class="exercise-card-num">6</div>
  <div class="exercise-card-body">
    <h4>Left sidebar — the eight destinations</h4>
    <p><strong>Do:</strong> Hover (do not click yet) each item in the left sidebar: <strong>New chat</strong>, <strong>Search</strong>, <strong>Library</strong>, <strong>Create</strong>, <strong>Agents</strong>, <strong>Notebooks</strong>, <strong>Chats</strong>, <strong>Apps</strong>. Read the tooltip for each.</p>
    <p><strong>Why:</strong> Each of these is a full feature we cover in a later lesson. For now just know they exist so you can recognize them when you get there.</p>
    <label class="exercise-check"><input type="checkbox"> Done</label>
  </div>
</div>

<div class="exercise-card">
  <div class="exercise-card-num">7</div>
  <div class="exercise-card-body">
    <h4>The chat area — message box and pills</h4>
    <p><strong>Do:</strong></p>
    <ol>
      <li>Click the <strong>+ button</strong> to the left of the message box. Notice you can attach files or images. Close without attaching.</li>
      <li>Look at the <strong>quick-action pills</strong>: <strong>Summarize</strong>, <strong>Rewrite</strong>, <strong>Create</strong>, <strong>Learn</strong>, and <strong>…</strong>. Click the caret on <strong>Summarize</strong> — it is a dropdown of suggested prompts.</li>
      <li>Click the <strong>…</strong> pill to open the full <strong>prompt gallery</strong>.</li>
      <li>Click the <strong>microphone</strong> and speak one short sentence to see dictation work.</li>
    </ol>
    <p><strong>Why:</strong> Most people type everything from scratch. These pills and the gallery are shortcuts — you will use them constantly once you know they are there.</p>
    <label class="exercise-check"><input type="checkbox"> Done</label>
  </div>
</div>

<div class="exercise-card">
  <div class="exercise-card-num">8</div>
  <div class="exercise-card-body">
    <h4>Settings — a quick tour</h4>
    <p><strong>Do:</strong> From the <strong>three-dot menu</strong> (top right), open <strong>Settings</strong>. Click each tab: <strong>General</strong>, <strong>Data controls</strong>, <strong>Personalization</strong>, <strong>Notifications</strong>, <strong>Agents</strong>, <strong>Sources</strong>. Do not change anything yet — just get a feel for what is there.</p>
    <p><strong>Why:</strong> <em>Personalization</em> is where the next lesson (Custom Instructions &amp; Memory) lives. The <em>Sources</em> tab is where you control what data Copilot grounds on. Knowing they exist now makes the next lessons feel familiar.</p>
    <label class="exercise-check"><input type="checkbox"> Done</label>
  </div>
</div>

<div class="note-box">
  <strong>Success check:</strong> You signed in, switched to Think Deeper, flipped the Work / Web toggle to Web, sent a reasoning prompt, opened the thinking-process view, and mapped the sidebar, chat area, and Settings. You now have the full map — the rest of this module goes deep on each surface.
</div>

<button class="mark-complete-btn" id="complete-btn-0" onclick="markComplete(0)">Mark Complete</button>
`,
  advanced: `
<h3>Model Selection Deep Dive</h3>
<p>Copilot now gives you direct control over which model runs. <strong>Auto</strong> is the smart default — it picks the right model and thinking time per task. But when you need specific behavior:</p>
<ul>
  <li><strong>Quick Response:</strong> Fastest. Use for simple rewrites, lookups, and formatting. Does not think deeply.</li>
  <li><strong>Think Deeper:</strong> Slower but significantly better for complex reasoning, analysis, strategy, and multi-step problems. Use when the answer matters and you have 30 seconds to wait.</li>
  <li><strong>Sonnet (Claude):</strong> Anthropic's model. Often produces more natural, nuanced writing. Try it for emails, memos, and communications where tone matters.</li>
  <li><strong>GPT (OpenAI):</strong> The default behind Auto. Strong all-rounder. Expandable — click the arrow to see specific GPT versions.</li>
</ul>
<p>Experiment: ask the same complex question with Quick Response, then Think Deeper. Compare the depth and quality. The difference is dramatic for anything beyond simple lookups.</p>

<h3>Privacy Controls</h3>
<p>In Settings, review the privacy and data controls. Your organization's admin sets the baseline, but you can often control things like whether Copilot stores conversation history and how Memory data is managed. Enterprise Copilot does not train on your data — your prompts and files stay within your tenant.</p>

<h3>Mobile App Setup</h3>
<p>Install the Microsoft 365 Copilot app on your phone (iOS and Android). It gives you the same chat interface on the go, including voice input. Sign in with the same work account. Your Custom Instructions and Memory carry over automatically.</p>
`
},

// ── 1: Custom Instructions & Memory ──
{
  id: 'custom-instructions-memory',
  title: 'Custom Instructions & Memory',
  points: 20,
  learn: `
<h3>Make Copilot Know You</h3>
<p>You just explored the interface. Now let us configure it so Copilot knows who you are — every time, without you repeating yourself.</p>

<p>It is like setting up a new phone's contacts, preferences, and home screen — you do it once, then it just works.</p>

<div class="tip-box">
  <strong>The AI Equation:</strong>
  <div class="equation" style="margin:12px 0 4px">
    <div class="eq-block">LLM<br><span style="font-size:11px;font-weight:400;color:#888">Frozen model</span></div>
    <div class="eq-op">+</div>
    <div class="eq-block">Context<br><span style="font-size:11px;font-weight:400;color:#888">What it knows about you & your work</span></div>
    <div class="eq-op">+</div>
    <div class="eq-block">Tools<br><span style="font-size:11px;font-weight:400;color:#888">What it can do & reach</span></div>
    <div class="eq-op">=</div>
    <div class="eq-block" style="background:var(--accent)">Useful AI<br><span style="font-size:11px;font-weight:400;color:rgba(255,255,255,0.7)">Output you can act on</span></div>
  </div>
  You cannot change the model. But you control <strong>context</strong> (what you tell it about you, your work, and your files) and <strong>tools</strong> (what it is allowed to reach). Better context + more tools = better results. This lesson is about context; the rest of the workshop is about tools.
</div>

<h3>Where Context Lives: the Personalization Panel</h3>
<p>Open <strong>Settings → Personalization</strong>. Context is not one toggle — it is a stack. Four pieces feed every conversation:</p>
<ul>
  <li><strong>Custom instructions:</strong> Explicit rules you write (name, role, communication style, priorities, avoidances). Applied on every new chat.</li>
  <li><strong>Work profile:</strong> Copilot uses your M365 work profile signals (role, org structure, recent collaborators, documents you touch) to tailor answers.</li>
  <li><strong>Saved memories:</strong> Short facts Copilot learns and saves automatically as you chat — "prefers tables over paragraphs," "works on Hudson Yards." You can view, edit, or delete any of them.</li>
  <li><strong>Chat history (Frontier):</strong> Lets Copilot draw on your past chats to personalize responses. Toggle-able.</li>
</ul>

<h3>Custom Instructions — the five sections you fill out</h3>
<ol>
  <li><strong>Identity:</strong> Your name, role, organization, and team</li>
  <li><strong>Communication style:</strong> Bullets vs. paragraphs, formal vs. casual</li>
  <li><strong>Goals:</strong> What you are working on, what projects matter most</li>
  <li><strong>Schedule context:</strong> Work patterns, timezone, recurring meetings</li>
  <li><strong>Avoidances:</strong> What you do NOT want (jargon, emojis, overly long responses)</li>
</ol>

<h3>Copilot Memory — auto-learned preferences</h3>
<p>Memory is different from Custom Instructions. Instead of you writing rules, Copilot <strong>learns your preferences automatically</strong> as you chat. You will occasionally see a "memory updated" signal. Manage individual memories in <strong>Settings → Personalization → Saved memories</strong>.</p>

<table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;">
  <thead><tr style="border-bottom:2px solid var(--border);">
    <th style="text-align:left;padding:8px 12px;">Feature</th>
    <th style="text-align:left;padding:8px 12px;">Custom Instructions</th>
    <th style="text-align:left;padding:8px 12px;">Saved memories</th>
  </tr></thead>
  <tbody>
    <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 12px;">Who writes it?</td><td style="padding:8px 12px;">You</td><td style="padding:8px 12px;">Copilot</td></tr>
    <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 12px;">How it works</td><td style="padding:8px 12px;">Explicit rules you define</td><td style="padding:8px 12px;">Automatic learning from conversations</td></tr>
    <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 12px;">When it applies</td><td style="padding:8px 12px;">Every new conversation</td><td style="padding:8px 12px;">Every new conversation</td></tr>
    <tr><td style="padding:8px 12px;">How to manage</td><td style="padding:8px 12px;">Edit text in Settings</td><td style="padding:8px 12px;">View/delete individual memories</td></tr>
  </tbody>
</table>

<h3>Sources: tools, not just a settings panel</h3>
<p>Sitting next to Personalization in Settings is <strong>Sources</strong>. This is where context ends and <strong>tools</strong> begin — it lists the <strong>external services</strong> Copilot can reach beyond the core Microsoft 365 surface. Your M365 apps (Outlook, Teams, SharePoint, OneDrive) are already wired in via your Work profile; Sources is for the third-party tools your admin has connected: things like <strong>Google Calendar, Google Contacts, Canva, HubSpot, Intercom, Linear, Notion</strong>, and more. Each connector is labeled with where it applies (e.g., <em>Used in Chat and Researcher</em>). Think of sources as the right-hand side of the AI equation: the reach your Copilot has when it goes to do something. We will come back to this concept across every following lesson — notebook references, search scope, page sharing, Create outputs all build on what is wired in here.</p>

<div class="note-box">
  <strong>This surface keeps evolving.</strong> Personalization and Sources both get new sub-features regularly. Make a habit of opening Settings every few weeks and scanning for new tabs and toggles — it is the fastest way to spot new capabilities before a colleague tells you.
</div>

<button class="continue-btn" onclick="switchTab(1,'implement')">Continue to Exercises &rarr;</button>
`,
  implement: `
<h3>Build Your Custom Instructions</h3>

<p><em>Now that you know where everything is, let's build your custom instructions — so Copilot actually knows who you are and how you want to work.</em></p>

<div class="tip-box">
  <div class="tip-title">Pro tip — borrow what other AI tools already know about you</div>
  <p>If you've used ChatGPT, Claude, Gemini, or another AI assistant for a while, it has probably learned a lot about you. Open that tool, ask something like <em>"What do you know about me? Summarize everything you've picked up about how I like to work, my priorities, and my communication style"</em> — then paste the answer here as a starting point. It bootstraps a richer profile in one pass instead of building from zero.</p>
</div>

<p><strong>Step 1: Let Copilot interview you.</strong></p>
<p>Open a <strong>new chat</strong> and paste this prompt. It will walk you through five sections, one at a time:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Interview me to build my system configuration — a set of custom instructions that will make you work better for me.

Ask me about:
1. Who I am and what I do
2. How I like to communicate
3. My top priorities right now
4. My daily schedule and work patterns
5. Things I want you to never do

Ask one section at a time. Wait for my response before moving to the next section.

When the interview is complete, output the results formatted as a Copilot Custom Instructions block — organized by section, ready to copy and paste into Settings.</code></div>

<p><strong>Step 2: Answer each question honestly.</strong></p>
<p>Copilot will ask about your role, team, communication style, priorities, and boundaries. Take your time — the more specific you are, the better Copilot will work for you in every future conversation. If a question does not apply, say "skip" and move on.</p>

<p><strong>Step 3: Review the output.</strong></p>
<p>When Copilot finishes the interview, it will produce a formatted Custom Instructions block. Read through it. Ask yourself:</p>
<ul>
  <li>Does the Identity section capture your actual role and responsibilities?</li>
  <li>Does the Communication Style match how you actually write?</li>
  <li>Are the Priorities current — or already outdated?</li>
  <li>Are the Avoidances specific enough? (e.g., "never use em dashes" is better than "keep it professional")</li>
</ul>

<p><strong>Step 4: Refine (example only).</strong></p>
<p>If something is wrong or missing, tell Copilot in plain words what to adjust. The box below is <strong>just an example</strong> of the kind of thing you would say — <em>don't copy it</em>, write what actually applies to you.</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Update my Custom Instructions: add that I prefer bullet points over paragraphs, and that I work primarily on residential condo projects. Remove the section about scheduling — I do not need that.</code></div>

<p><strong>Step 5: Install it.</strong></p>
<p>Copy the final output. Open the <strong>three-dot menu at the top right</strong> (same menu you opened in Lesson 1) → <strong>Settings → Personalization → Custom instructions</strong>. Personalization is the middle step where Custom instructions, Work profile, Saved memories, and Chat history all live. Paste your block into the Custom instructions field. Click <strong>Save</strong>.</p>

<p><strong>Step 6: Test it.</strong></p>
<p>Open a <strong>NEW conversation</strong> (important — Custom Instructions only apply to new chats). Send:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>What do you know about my role, preferences, and priorities? List everything you can see from my Custom Instructions.</code></div>

<p>If Copilot references your name, role, communication preferences, and avoidances — it worked. If something is missing, go back to Settings, edit, save, and test in another new chat.</p>

<div class="note-box">
  <strong>Success check:</strong> You should have Custom Instructions saved in Settings, and a new conversation where Copilot demonstrates it knows who you are without you telling it. This is your AI operating system — it runs in the background of every future chat.
</div>

<p class="personalization-note">[PERSONALIZED: swap the Custom Instructions template with organization-specific roles, communication preferences, and workflows from Listen Labs interviews]</p>

<button class="mark-complete-btn" id="complete-btn-1" onclick="markComplete(1)">Mark Complete</button>
`,
  advanced: `
<h3>Memory Management</h3>
<p>Periodically review your memories in Settings. Delete any that are outdated or incorrect. You can explicitly tell Copilot to remember or forget things: "Remember that our fiscal year starts July 1" or "Forget that I work on the downtown project — I transferred off it."</p>

<h3>Importing Preferences from Other Tools</h3>
<p>If you already have a ChatGPT custom instructions block, or a preferences doc you use with other AI tools, paste it directly into Copilot's Custom Instructions. The format does not need to match exactly — Copilot will interpret it.</p>

<h3>Team-Wide Instruction Templates</h3>
<p>Create a shared Custom Instructions template for your team. Start with a base template that includes the organization name, common terminology, and default formatting preferences. Then let each person customize the role-specific parts. Share the template via a Copilot Page or Teams channel.</p>
`
},

// ── 2: Talk to Your Data ──
{
  id: 'talk-to-your-data',
  title: 'Talk to Your Data',
  points: 10,
  learn: `
<h3>Your Copilot Is Wired Into Your Work</h3>
<p><em>Copilot is not just a chat window. It is connected to your Outlook, your calendar, your colleagues' free/busy, and the files across your whole organization. In this lesson start talking to <strong>your company's data</strong>.</em></p>

<h4>What Copilot Can See</h4>
<p>A public chatbot can only answer from the open web. Your Copilot is different — inside Microsoft 365, it is <em>your</em> Copilot. It has read access (scoped to your permissions) to:</p>

<ul>
  <li><strong>Your Outlook mailbox</strong> — every email, every thread, every attachment you can open yourself.</li>
  <li><strong>Your calendar, and your colleagues' free/busy</strong> — enough to plan meetings without jumping to Scheduling Assistant.</li>
  <li><strong>Your OneDrive and any SharePoint / Teams library you have access to</strong> — so "that doc about the Q3 budget" is actually reachable.</li>
  <li><strong>Teams chats and meeting transcripts</strong> you were part of.</li>
  <li><strong>People</strong> — names, titles, managers, teams — the same directory Outlook uses.</li>
</ul>

<p>That's the mental shift: every question you'd otherwise answer by opening Outlook, Teams, or SharePoint can now be a single prompt.</p>

<h4>Work Mode vs Web Mode</h4>
<p>At the top of the Copilot chat there is a toggle. <strong>Work</strong> mode answers from your tenant — email, files, calendar. <strong>Web</strong> mode answers from the public internet only. If you ask about your data, stay in <strong>Work</strong>. Most of this lesson assumes Work mode.</p>

<div class="note-box">
  <strong>Permission-aware.</strong> Copilot can only surface things <em>you</em> can already access. It never leaks a file your account can't open, and it never shows someone else's private email to you. Security is the same as Outlook or SharePoint — Copilot is just a new front door.
</div>

<h4>Four Moves You'll Use Every Day</h4>
<p>All four happen in the same chat box, in plain English. The exercises on the next tab walk through each one:</p>

<ol>
  <li><strong>Triage your email</strong> — "Which emails need my attention today?"</li>
  <li><strong>Deep-dive a specific thread</strong> — "Summarize the permit thread. What was decided, what's open, what do I owe?"</li>
  <li><strong>Read your calendar</strong> — "What does tomorrow look like? Any conflicts?"</li>
  <li><strong>Schedule with colleagues</strong> — "Find 30 minutes next week with [colleagues] to discuss [topic]."</li>
</ol>

<button class="continue-btn" onclick="switchTab(2,'implement')">Continue to Exercises &rarr;</button>
`,
  implement: `
<h3>Talk to Your Data — Four Hands-On Prompts</h3>
<p>Make sure you are in <strong>Work</strong> mode (not Web) throughout. Each card has a prompt to try. Swap the bracketed bits for a real project, colleague, or topic from your own work.</p>

<div class="exercise-card">
  <div class="exercise-card-num">1</div>
  <div class="exercise-card-body">
    <h4>Triage your inbox</h4>
    <p><strong>Do:</strong> In a fresh chat, send this prompt. Copilot scans your inbox and surfaces what actually matters.</p>
    <div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Which emails need my attention today? Prioritize by urgency and flag anything with a deadline this week or a direct ask from my manager. List sender, subject, and the specific action I need to take.</code></div>
    <p><strong>Why:</strong> This is the fastest inbox triage you can do. Instead of reading every thread, you get the filtered list of what's important — right now.</p>
    <label class="exercise-check"><input type="checkbox"> Done</label>
  </div>
</div>

<div class="exercise-card">
  <div class="exercise-card-num">2</div>
  <div class="exercise-card-body">
    <h4>Deep-dive a specific thread</h4>
    <p><strong>Do:</strong> Pick a thread that matters right now — a decision, a handoff, a timeline — and drill in:</p>
    <div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Find the email thread about [project / topic]. Summarize what was decided, who owns each next step, and list anything still unresolved. Quote the specific sentences that back up each point.</code></div>
    <p><strong>Why:</strong> Perfect for threads with 20+ replies where the decision is buried in the middle. Copilot reads everything and gives you the decision + owners in one pass — with quotes, so you can verify.</p>
    <label class="exercise-check"><input type="checkbox"> Done</label>
  </div>
</div>

<div class="exercise-card">
  <div class="exercise-card-num">3</div>
  <div class="exercise-card-body">
    <h4>Read your calendar</h4>
    <p><strong>Do:</strong> Send this prompt:</p>
    <div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>What does my calendar look like tomorrow? Flag any back-to-back meetings or conflicts, and give me a one-line prep note for each meeting — based on the invite description and any recent emails with the attendees.</code></div>
    <p><strong>Why:</strong> This is your morning briefing. Copilot cross-references invites with recent email to build context — so you walk into each meeting knowing why it exists and what's likely to come up.</p>
    <p class="tip-box-inline"><strong>Pro tip:</strong> Once this works for you, it is a perfect candidate for a <em>Scheduled prompt</em> (see the Advanced tab) — Copilot runs it every morning automatically.</p>
    <label class="exercise-check"><input type="checkbox"> Done</label>
  </div>
</div>

<div class="exercise-card">
  <div class="exercise-card-num">4</div>
  <div class="exercise-card-body">
    <h4>Schedule with colleagues — using the <span style="font-family:monospace;">/</span> picker</h4>
    <p><strong>New idea to learn here:</strong> typing <strong>/</strong> in the Copilot message box opens a picker. Start typing a name, a filename, or an email subject and Copilot attaches it as a <em>live reference</em> — binding your prompt to the exact person or document rather than guessing.</p>

    <p><strong>Do:</strong> Type the prompt below. At each <strong>/</strong>, Copilot opens the picker — start typing a colleague's name and select them from the list. That binds Copilot to their actual calendar.</p>
    <div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Find 30 minutes next week for /[colleague 1] and /[colleague 2] and me to discuss [topic]. Check everyone's availability, suggest the best slot, and draft the invite with an agenda.</code></div>
    <p><strong>Why it matters:</strong> Using <strong>/</strong> instead of typing a name prevents Copilot from guessing the wrong person (two Sarahs in your org) and pulls the actual free/busy for the real invitees. Behind the scenes Copilot is using the same Scheduling Assistant you already know.</p>
    <p><strong>Try <span style="font-family:monospace;">/</span> with files and emails too:</strong> <span class="inline-code">/[filename].docx</span> pulls that file into context; <span class="inline-code">/[email subject]</span> pulls the thread. Use <strong>/</strong> whenever you know the exact thing you're pointing at.</p>
    <label class="exercise-check"><input type="checkbox"> Done</label>
  </div>
</div>

<button class="mark-complete-btn" id="complete-btn-2" onclick="markComplete(2)">Mark Complete</button>
`,
  advanced: `
<h3>Scheduled Prompts — put these queries on autopilot</h3>
<p>Every prompt you just ran can run <strong>automatically</strong> on a schedule, with the results waiting for you when you open Copilot. Open the <strong>three-dot menu (top right) → Scheduled prompts</strong> and set one up.</p>

<h4>Daily morning briefing (every weekday at 8:30 AM)</h4>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Summarize any emails from overnight and this morning that need my attention. Flag anything urgent or time-sensitive. Then list my meetings today with a one-line prep note for each, pulling context from the invite description and any recent email threads with the attendees.</code></div>

<h4>Weekly project pulse (Friday 4 PM)</h4>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Review all my emails from the past week related to active projects. For each project, summarize: key updates, decisions made, open action items, and anything overdue. Format as a table.</code></div>

<h4>Monday catch-up (Monday 8 AM)</h4>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Summarize my unread emails from the weekend. Flag anything urgent. List meetings I have this week that need prep, grouped by day.</code></div>

<p>Scheduled prompts are Copilot's version of automation — no one has to remember to run them, and the digest is waiting when you land in Copilot each morning.</p>

<h3>Delegate calendar search</h3>
<p>If you manage someone else's calendar (executive assistant, chief of staff), you can now search their meetings directly in Copilot Chat — no more jumping to Outlook. Ask: <em>"What planning meetings does [manager name] have next week? Any conflicts with his travel days?"</em> Copilot respects delegate permissions and returns their calendar alongside yours. <a href="https://support.microsoft.com/topic/use-copilot-search-in-calendar-items-as-a-delegate-2227730b-4d67-4156-8a1c-dccac8fe6577" target="_blank">Microsoft's full guide →</a></p>

<h3>Search hygiene that pays off</h3>
<ul>
  <li><strong>Describe what you're looking for</strong>, not the filename: "the proposal we sent to the client in March" beats "proposal_v3_final.docx".</li>
  <li><strong>Add time constraints:</strong> "from the last 2 weeks" or "before our December deadline."</li>
  <li><strong>Chain searches:</strong> start broad, then narrow with follow-up prompts.</li>
  <li><strong>Org-level:</strong> descriptive filenames, consistent folder structures, and storing files in SharePoint (not personal OneDrive) make every Copilot Search across your company better.</li>
</ul>
`
},

// ── 3: Build Your Knowledge Notebook ──
{
  id: 'knowledge-notebook',
  title: "Build Your Knowledge Notebook",
  points: 30,
  learn: `
<div class="tip-box">
  <div class="tip-title">Primer — what a notebook is for</div>
  <p>A <strong>notebook</strong> is a dedicated workspace you build around a single project, topic, or function. You give it a handful of reference documents, you set instructions for how Copilot should behave inside it, and from then on every conversation you have in that notebook is <em>grounded</em> in those documents — not the open web, not your entire inbox.</p>
  <p>Use one notebook per <strong>ongoing thing</strong> you care about: a live project, a product line, an onboarding program, a quarterly review pack, a compliance library. Pop in, ask a question, get an answer citing the exact document and section. Team members you add see the same references and get the same grounded answers.</p>
  <p>If chat is a smart colleague you bump into in the hallway, a notebook is that same colleague sitting at your desk with your project folder open — already briefed.</p>
</div>

<h3>Give Copilot a Knowledge Base</h3>
<p><em>You configured Copilot to know who you are. Now give it a knowledge base — the documents, references, and context it needs to do your actual work.</em></p>

<p>A regular chat is not stateless — if you enabled <strong>chat memory</strong> and <strong>chat history</strong> in Lesson 1, Copilot carries a thin thread of preferences across conversations. But it is not project-scoped: it is not going to remember that your facade detail lives in a specific spec document, and it is not going to cite section numbers out of your codes. That level of granularity needs a container.</p>

<p><strong>Notebooks change that.</strong> A Notebook is a persistent, project-scoped workspace where you:</p>
<ul>
  <li>Upload or link <strong>reference files</strong> — specs, reports, guidelines, templates</li>
  <li>Write <strong>Copilot instructions</strong> specific to that notebook (not your global ones — these are project-level)</li>
  <li>Chat with Copilot <strong>grounded on those references</strong> — every response draws from your uploaded context</li>
</ul>

<h3>When to Use a Notebook vs. a Chat</h3>
<table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;">
  <thead><tr style="border-bottom:2px solid var(--border);">
    <th style="text-align:left;padding:8px 12px;">Scenario</th>
    <th style="text-align:left;padding:8px 12px;">Tool</th>
  </tr></thead>
  <tbody>
    <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 12px;">Quick question, or a one-time task (possibly several turns) that is not part of an ongoing project</td><td style="padding:8px 12px;">Copilot Chat</td></tr>
    <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 12px;">You need a specific <strong>model</strong> (Think Deeper, Claude Sonnet, etc.) — notebooks do not yet expose the model selector</td><td style="padding:8px 12px;">Copilot Chat</td></tr>
    <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 12px;">Find a file or email from your org</td><td style="padding:8px 12px;white-space:nowrap;">Copilot Search (Lesson 3)</td></tr>
    <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 12px;">Ongoing project with specific documents</td><td style="padding:8px 12px;"><strong>Notebook</strong></td></tr>
    <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 12px;">Team knowledge base with standards and guidelines</td><td style="padding:8px 12px;"><strong>Notebook</strong></td></tr>
    <tr><td style="padding:8px 12px;">Department reference library (codes, policies, templates)</td><td style="padding:8px 12px;"><strong>Notebook</strong></td></tr>
  </tbody>
</table>

<div class="note-box">
  <strong>Model caveat:</strong> Notebooks currently do not let you pick a model — Copilot decides. If you need to force Think Deeper or switch to Claude Sonnet, stay in the general chat.
</div>

<h3>The Power: Copilot Instructions + References + Chat</h3>
<p>A Notebook combines three things that make Copilot dramatically more useful:</p>
<ol>
  <li><strong>References:</strong> The files Copilot reads before answering (your project docs, not the whole internet)</li>
  <li><strong>Copilot instructions:</strong> Rules specific to this context ("always cite the section number when referencing the building code")</li>
  <li><strong>Persistent chat:</strong> The conversation stays — come back tomorrow and it remembers what you discussed</li>
</ol>

<button class="continue-btn" onclick="switchTab(3,'implement')">Continue to Exercises &rarr;</button>
`,
  implement: `
<h3>Build a Notebook for Your Role</h3>

<p>Choose your role. You will create a Notebook, upload references, add Copilot instructions, then run two grounded prompts.</p>

<div class="note-box">
  <strong>Heads up before you prompt:</strong> Everything Copilot answers in this notebook is <strong>grounded in the references you uploaded</strong> — not the open web, not your inbox. When a response comes back, look for the <strong>citation links</strong> (numbered references or clickable source tags). Click one and Copilot shows you the exact document and passage it pulled from. That is how you verify an answer — and how you quote it in a deliverable.
</div>

<div class="option-tabs" id="options-3">
  <button class="option-btn active" onclick="switchOption(3,'arch',this)">Architecture</button>
  <button class="option-btn" onclick="switchOption(3,'hr',this)">HR</button>
  <button class="option-btn" onclick="switchOption(3,'mktg',this)">Marketing</button>
  <button class="option-btn" onclick="switchOption(3,'exec',this)">Executive</button>
  <button class="option-btn" onclick="switchOption(3,'ops',this)">Operations</button>
</div>

<div class="option-content active" id="option-3-arch">
<h4>Step 1: Create &amp; name the Notebook</h4>
<p>Click <strong>Notebooks</strong> in the left sidebar → <strong>New Notebook</strong>. Name it: <strong>Building Code &amp; Project Standards</strong>.</p>

<h4>Step 2: Upload References (do this first)</h4>
<p>Drop in 2-3 ODA architecture references. These download as Word documents so the notebook will accept them:</p>
<ul>
  <li><a href="/mock-data/building-codes/nyc-residential-code-reference.pdf" download>NYC Residential Building Code Reference</a></li>
  <li><a href="/mock-data/specifications/project-spec-excerpt.pdf" download>Project Specifications (facade, hardware, plumbing)</a></li>
  <li><a href="/mock-data/building-codes/nyc-vs-florida-comparison.pdf" download>NYC vs Florida Code Comparison</a></li>
</ul>

<h4>Step 3: Open Copilot instructions (now available after initialization)</h4>
<p>Click the notebook title dropdown → <strong>Copilot instructions</strong>. Paste:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>You are an architecture project assistant for ODA, a global design firm. When answering questions:
- Always cite the specific section or page number from the reference documents
- Flag any code compliance concerns with the prefix [CODE ALERT]
- When comparing materials or systems, use a table format
- Default to NYC and Florida building codes unless I specify otherwise</code></div>

<h4>Step 4: Power Prompt #1 — Cross-Reference</h4>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Based on the documents I uploaded, what are the top 3 code compliance risks for this project? For each risk, cite the specific code section and the specific page or section in our project documents where the issue exists.</code></div>
<p>This prompt forces Copilot to cross-reference YOUR documents against the code — something that would take you hours manually.</p>

<h4>Step 5: Power Prompt #2 — Generate a Deliverable</h4>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Using the references in this notebook and the risk analysis above, draft a Permit Submission Readiness Brief. Structure it as a document with: (1) Executive summary — are we ready to file, and if not what blocks us; (2) Open items table grouped by consultant (structural, MEP, facade) with owner, due date, and the specific code section / spec page each item ties back to; (3) Risk register summarizing the compliance concerns flagged in Prompt #1 with resolution path; (4) Decisions needed from the project lead before filing. Cite the reference document and section for every item.</code></div>
<p>Notice how Copilot turns your uploaded files into a structured briefing document — the kind of artifact you'd actually save inside this notebook as a living project page. In Lesson 4 you'll turn this same content into a shareable Page.</p>
</div>

<div class="option-content" id="option-3-hr">
<h4>Step 1: Create &amp; name the Notebook</h4>
<p>Click <strong>Notebooks</strong> → <strong>New Notebook</strong>. Name it: <strong>HR Policies &amp; Onboarding</strong>.</p>

<h4>Step 2: Upload References (do this first)</h4>
<ul>
  <li><a href="/mock-data/hr/employee-handbook-excerpt.pdf" download>Employee Handbook Excerpt</a> (PTO, remote work, benefits)</li>
  <li><a href="/mock-data/hr/onboarding-checklist.pdf" download>New-Hire Onboarding Checklist</a></li>
  <li><a href="/mock-data/hr/recruiting-pipeline.xlsx" download>Recruiting Pipeline Tracker</a></li>
</ul>

<h4>Step 3: Open Copilot instructions</h4>
<p>Click the notebook title dropdown → <strong>Copilot instructions</strong>. Paste:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>You are an HR assistant for ODA. When answering questions:
- Always reference the specific policy document and section
- Flag any compliance concerns with [COMPLIANCE NOTE]
- When comparing benefits or policies, use a table format
- Be cautious about legal advice — flag when something needs legal review</code></div>

<h4>Step 4: Power Prompt #1</h4>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Based on the employee handbook, what is the process for handling a leave of absence request? Walk me through every step, citing the specific handbook sections.</code></div>

<h4>Step 5: Power Prompt #2</h4>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Using the onboarding checklist in this notebook, draft a first-week schedule for a new senior architect at ODA. Include Revit and Rhino software access setup, BIM 360 training, seating assignment, and first-week meetings with the project team lead.</code></div>
</div>

<div class="option-content" id="option-3-mktg">
<h4>Step 1: Create &amp; name the Notebook</h4>
<p>Click <strong>Notebooks</strong> → <strong>New Notebook</strong>. Name it: <strong>Marketing &amp; Awards Pipeline</strong>.</p>

<h4>Step 2: Upload References (do this first)</h4>
<ul>
  <li><a href="/mock-data/marketing/oda-awards-tracker.xlsx" download>Awards Tracker</a> (AIA, Architizer, CTBUH submissions)</li>
  <li><a href="/mock-data/proposals/aia-award-narrative.pdf" download>AIA Award Narrative Draft</a></li>
  <li><a href="/mock-data/marketing/oda-newsletter-sample.pdf" download>ODA Newsletter Sample</a></li>
</ul>

<h4>Step 3: Open Copilot instructions</h4>
<p>Click the notebook title dropdown → <strong>Copilot instructions</strong>. Paste:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>You are a marketing assistant for ODA, a global architecture firm. When answering:
- Reference specific project names and details from uploaded documents
- Match ODA's brand voice: sophisticated, design-forward, concise
- When listing awards or deadlines, use a table with submission dates
- Always include image/visual requirements when discussing submissions</code></div>

<h4>Step 4: Power Prompt #1</h4>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Based on the awards tracker and project details, which submissions have the best chance of winning? For each, cite the specific project data and explain what makes it a strong candidate. Flag any submissions with missing photography or incomplete narratives.</code></div>

<h4>Step 5: Power Prompt #2</h4>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Using the award narrative and newsletter sample in this notebook, draft a 250-word award submission narrative for the Harbor View Residences project. Match ODA's brand voice: sophisticated, design-forward, concise.</code></div>
</div>

<div class="option-content" id="option-3-exec">
<h4>Step 1: Create &amp; name the Notebook</h4>
<p>Click <strong>Notebooks</strong> → <strong>New Notebook</strong>. Name it: <strong>Executive Project Overview</strong>.</p>

<h4>Step 2: Upload References (do this first)</h4>
<ul>
  <li><a href="/mock-data/executive/oda-qbr-q1-2025.pdf" download>Q1 2025 Quarterly Business Review</a></li>
  <li><a href="/mock-data/executive/property-summary-1.pdf" download>Property Summary 1</a> | <a href="/mock-data/executive/property-summary-2.pdf" download>Property Summary 2</a></li>
</ul>

<h4>Step 3: Open Copilot instructions</h4>
<p>Click the notebook title dropdown → <strong>Copilot instructions</strong>. Paste:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>You are an executive briefing assistant for ODA. When answering:
- Lead with the bottom line — decisions needed, risks, and financial impact
- Use bullet points, not paragraphs
- When summarizing multiple projects, use a comparison table
- Flag anything that needs immediate attention with [ACTION REQUIRED]</code></div>

<h4>Step 4: Power Prompt #1 — Strategic Fit</h4>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Cross-reference every document in this notebook. Using the Q1 QBR as the strategic lens, evaluate both property summaries against it. For each property, produce: (1) which Q1 strategic priorities it advances and which it puts at risk — cite the specific QBR section for each; (2) how it squares against the firm's current financial posture and utilization from the QBR; (3) open questions the QBR raises that the property summary does not yet answer. End with a Strategic Fit ranking — property 1 vs property 2 — and the single QBR passage that tips the decision.</code></div>
<p>The power move: instead of re-summarizing the QBR (which is already a summary), you are forcing Copilot to hold the QBR <em>and</em> the property summaries in one lens — the kind of synthesis a principal would ask for before a go/no-go investment call.</p>

<h4>Step 5: Power Prompt #2</h4>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Now go deep on the property comparison. Build a side-by-side table covering: price, square footage, price per SF, location, amenities, and any red flags from each summary. Then add a column for each row mapping the row to the strategic-fit ranking you produced above — so every line item ties back to the QBR. End with a one-paragraph recommendation.</code></div>
<p>P#1 did the synthesis; P#2 does the detail — and now the detail stays anchored to the strategic logic instead of floating on its own.</p>
</div>

<div class="option-content" id="option-3-ops">
<h4>Step 1: Create &amp; name the Notebook</h4>
<p>Click <strong>Notebooks</strong> → <strong>New Notebook</strong>. Name it: <strong>Operations &amp; Resource Planning</strong>.</p>

<h4>Step 2: Upload References (do this first)</h4>
<ul>
  <li><a href="/mock-data/staffing/oda-resource-allocation.xlsx" download>Resource Allocation Spreadsheet</a> (team assignments, utilization, skills)</li>
  <li><a href="/mock-data/financials/oda-project-tracking.xlsx" download>Project Tracking Data</a> (phases, fees, hours, budget status)</li>
  <li><a href="/mock-data/financials/oda-monthly-financials.xlsx" download>Monthly Financials</a></li>
</ul>

<h4>Step 3: Open Copilot instructions</h4>
<p>Click the notebook title dropdown → <strong>Copilot instructions</strong>. Paste:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>You are an operations assistant for ODA. When answering:
- Always reference specific project names and dates from the uploaded documents
- When tracking resources, use a table with columns for project, team size, utilization, and timeline
- Flag overallocation or scheduling conflicts with [RESOURCE ALERT]
- Default to weekly planning cycles unless I specify otherwise</code></div>

<h4>Step 4: Power Prompt #1</h4>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Based on the resource allocation data, which team members are overallocated (above 100% total)? Show me a table of each person, their current project assignments, allocation percentage, and utilization. Flag anyone above 90%.</code></div>

<h4>Step 5: Power Prompt #2</h4>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Using the project tracking, resource allocation, and monthly financials spreadsheets in this notebook, draft a Weekly Staffing Status Brief. Structure as a document with: (1) Headline — total studio utilization this week vs. the 6-month trend, including the summer dip if visible; (2) Overallocation register — names flagged in Prompt #1 with their projects, hours, and recommended shift; (3) Projects at risk — from the tracking data, any project missing milestones or under-staffed relative to FTEs needed; (4) Reallocation recommendations — specific name → project moves with justification from the data; (5) Decisions needed from leadership this week. Cite the specific spreadsheet and row for every claim.</code></div>
<p>Same pattern as before: the analysis in Prompt #1 becomes the evidence layer for the structured brief in Prompt #2 — a document you'll later promote into a shareable Page in Lesson 4.</p>
</div>

<div class="note-box">
  <strong>Success check:</strong> You should have a Notebook with a name, custom instructions, at least one reference file, and two prompts that produced outputs grounded in YOUR documents — with citations that let you click through to the exact source passage. The difference between a regular chat and a Notebook is the difference between "an AI that gives good generic answers" and "an AI that knows your project."
</div>

<div class="tip-box">
  <div class="tip-title">Want more? Two power moves live in the Advanced tab</div>
  <ul>
    <li><strong>Quick Create</strong> — turn your notebook into an audio overview, study guide, mind map, document, presentation, or worksheet. Same references, repackaged.</li>
    <li><strong>Invite collaborators</strong> — make the notebook a shared team resource. One notebook per function/process is the sweet spot.</li>
  </ul>
  <p>Both are covered in full detail on the <strong>Advanced</strong> tab — open it after you mark this lesson complete.</p>
</div>

<p class="personalization-note">[PERSONALIZED: swap notebook topics and reference file suggestions with actual client project types from the interviews]</p>

<button class="mark-complete-btn" id="complete-btn-3" onclick="markComplete(3)">Mark Complete</button>
`,
  advanced: `
<h3>Quick Create — turn your notebook into something</h3>
<p>Once your notebook has references, the <strong>Quick Create</strong> button (next to "New page") lets Copilot generate a derived artifact from everything in the notebook. Six options today — two production-ready, four marked Frontier:</p>

<div class="note-box">
  <strong>Frontier = preview.</strong> Mind map, Document, Presentation, and Worksheet are labeled Frontier. They work, but they can fail, behave inconsistently, or change from week to week. Expect quirks and have a fallback.
</div>

<h4>1. Audio overview (production-ready — deep dive below)</h4>
<p>Produces an MP3 of your notebook content — a spoken summary that plays inside the notebook's Created content pane. Good for reviewing material while driving, handing a brief to a colleague who prefers audio, or accessibility.</p>
<p>When you click Audio overview, a <strong>Customize</strong> dialog opens with five controls:</p>
<ul>
  <li><strong>Language:</strong> English, Spanish, Japanese, French, German, Portuguese, Italian, Chinese. (More land regularly — check.)</li>
  <li><strong>Voice:</strong> Named voice pairs (e.g., Ava/Steffan). Pick the tone that fits your audience.</li>
  <li><strong>Format:</strong> <em>Narration</em> (single AI host, tight summary) or <em>Dialog</em> (two AI hosts in conversation — more engaging, longer).</li>
  <li><strong>Style:</strong> <em>Professional</em> or <em>Casual</em>.</li>
  <li><strong>Duration:</strong> Shorter / Medium / Longer.</li>
  <li><strong>Any additional customizations (optional):</strong> Free-text steering — e.g., "Focus on the code compliance risks," "Skip the financials section," "Frame as a briefing for a new project manager."</li>
</ul>
<p>Click <strong>Generate audio</strong>. Produce takes a minute or two. Playable in-notebook; downloadable as MP3.</p>

<h4>2. Study guide (production-ready)</h4>
<p>Generates a multi-page interactive study companion inside the notebook. Four page types: <strong>Summary</strong> (overview of key concepts), <strong>Topic</strong> pages (detailed breakdowns), <strong>Flashcards</strong> (retrieval practice), and <strong>Quiz</strong> pages (self-assessment). Originally designed for academic use, but also works well for onboarding material, certification prep, and "make sure I actually understood this spec" self-tests.</p>

<h4>3. Mind map (Frontier)</h4>
<p>Visualizes the concepts and relationships across your references as a node/edge diagram. Good for getting your head around a dense set of documents before diving in. Frontier — output layout and detail varies; regenerate if the first pass is too shallow or too noisy.</p>

<h4>4. Document (Frontier)</h4>
<p>Drafts a Word-style document from your notebook content. The exact output surface (in-notebook page vs. separate .docx) is still evolving — confirm where yours lands. Best for when you want a structured write-up in prose form, not a visual asset.</p>

<h4>5. Presentation (Frontier)</h4>
<p>Generates a slide-by-slide deck. Slide count and layout are auto-decided — expect to clean up afterwards. Useful as a starting skeleton, not a finished deliverable.</p>

<h4>6. Worksheet (Frontier)</h4>
<p>Generates a worksheet of questions and exercises from the notebook content. Leans academic in tone; repurposable for workshop exercises and team quizzes.</p>

<div class="tip-box">
  <strong>Try it now:</strong> Go back to the notebook you just built. Click <strong>Quick create → Audio overview</strong>, set Format = Dialog, Style = Casual, Duration = Shorter, and add a custom prompt: "Frame this as a kickoff briefing for a colleague who is joining the project on Monday." Listen to what comes out. This single exercise shows why notebooks are more than a chat with attachments — they are a source-of-truth Copilot can repackage into any format.
</div>

<h3>Make it a shared team resource — Invite collaborators</h3>
<p>Notebooks really pay off when they stop being personal scratchpads and become <strong>shared sources of truth</strong>. To add teammates, click the <strong>people icon</strong> at the top of the notebook → <strong>Invite / manage members</strong>. Pick individuals or a group, set their role (edit / view), and send.</p>

<p>Once invited, collaborators share:</p>
<ul>
  <li>the same <strong>references</strong> — no more emailing spec PDFs back and forth,</li>
  <li>the same <strong>Copilot instructions</strong> — so everyone's prompts come back in the same voice and format,</li>
  <li>the same <strong>Pages</strong> created inside the notebook (you'll build those in Lesson 4).</li>
</ul>

<h4>Pattern: one notebook per function or process</h4>
<p>The teams getting the most value build notebooks narrowly, not broadly. Some that have worked:</p>
<ul>
  <li><strong>"Permit Submissions"</strong> — for the project-management team; references are the code books and submission templates.</li>
  <li><strong>"Onboarding"</strong> — for HR; references are the handbook, onboarding checklist, and role-specific first-week schedules.</li>
  <li><strong>"Brand Voice"</strong> — for marketing; references are the style guide, three sample write-ups, and the do/don't list.</li>
  <li><strong>"Weekly Staffing"</strong> — for operations; references are the resource allocation and project tracking spreadsheets.</li>
</ul>

<p>Each one compounds: every new document added, every good prompt saved, every Page created inside the notebook makes the next question faster to answer.</p>
`
},

// ── 4: Copilot Pages ──
{
  id: 'copilot-pages',
  title: 'Copilot Pages',
  points: 20,
  learn: `
<h3>From Scratchpad to Shared Artifact</h3>
<p><em>Chat is your scratchpad. A Page is the document you share with your team.</em></p>

<h3>What is a Copilot Page?</h3>
<p>A Page is a <strong>live document built around a Copilot conversation</strong>. On the left you have the document; on the right you have a dedicated side chat with Copilot, already open. You write, Copilot writes, you both keep editing — and when it reads right, you share it via a link.</p>

<p>That is the shift: instead of copying great Copilot answers out of a chat window into Word or email, the document <em>is</em> the chat, and the chat <em>is</em> the document.</p>

<h3>Where Pages Come From</h3>
<p>A Page can be created from three places. In this workshop we always create one <strong>inside the notebook you just built in Lesson 4</strong>, so the Page inherits the notebook's references and instructions. The other two entry points are useful to know about:</p>
<ul>
  <li><strong>From within a Notebook</strong> (what we will do): the Page inherits the notebook's references and instructions — follow-ups stay grounded in your sources.</li>
  <li><strong>From the Library:</strong> create a blank Page directly from the artifacts list.</li>
  <li><strong>From general chat:</strong> any Copilot response has an <strong>Edit in Pages</strong> action — great for quick one-offs, but without the notebook's grounding.</li>
</ul>

<h3>A New Page Gets Its Own Chat</h3>
<p>When you open a new Page, the side Copilot chat on that Page is a <strong>fresh conversation</strong> — it does not inherit the chat thread you were having inside the notebook, and it does not bleed into other chats. The Page's chat history stays attached to the Page, so you can close it, come back tomorrow, and pick up where you left off.</p>

<p>Inside a notebook, this gives you a clean split: keep <strong>exploratory questions</strong> in the notebook's main chat, and open a <strong>Page</strong> the moment the conversation turns into something you want to keep, edit, and share.</p>

<h3>Pages &amp; Notebooks, Back and Forth</h3>
<p>A Page you create can be <strong>added back to a notebook</strong> as one of its sources. And regardless of where it was created, a Page can be <strong>shared with people inside or outside the notebook</strong> — the notebook's member list does not gate who can see the Page. Link sharing controls that separately (we cover it in the exercises).</p>

<button class="continue-btn" onclick="switchTab(4,'implement')">Continue to Exercises &rarr;</button>
`,
  implement: `
<h3>Create, Edit, and Share a Page — from Inside Your Notebook</h3>

<p>You will work inside the notebook you built in Lesson 3 so the Page inherits your references and stays grounded in the same sources. Pick your department below.</p>

<div class="note-box">
  <strong>The flow for every Page:</strong> (1) New page inside your notebook → (2) prompt Copilot in the side chat → (3) edit by hand where needed → (4) prompt again to enrich → (5) set link access and share.
</div>

<div class="tip-box">
  <div class="tip-title">Formatting: right-click, don't type Markdown</div>
  <p>Page bodies do not render Markdown. Type plain text, then <strong>right-click</strong> for the Word-style menu — bold, headings, lists, links, insert table. That is the one formatting trick worth remembering.</p>
</div>

<div class="tip-box">
  <div class="tip-title">If Copilot replies in chat instead of writing to the Page</div>
  <p>Sometimes the side chat renders its answer inline in the conversation rather than inserting it into the Page body. When that happens you have two easy fixes:</p>
  <ol style="margin:8px 0 0 20px;">
    <li><strong>Click the <em>Add to page</em> button</strong> that appears on the Copilot response — this is the fastest path, it drops the answer straight into the Page.</li>
    <li><strong>Re-prompt</strong> with something like <em>"Add that response into the Page I have open."</em> and Copilot will insert it.</li>
  </ol>
  <p style="margin-top:8px;">Once the content lands on the Page, continue with manual editing (right-click for formatting, reorder, add headings).</p>
</div>

<div class="option-tabs" id="options-4">
  <button class="option-btn active" onclick="switchOption(4,'arch',this)">Architecture</button>
  <button class="option-btn" onclick="switchOption(4,'hr',this)">HR</button>
  <button class="option-btn" onclick="switchOption(4,'mktg',this)">Marketing</button>
  <button class="option-btn" onclick="switchOption(4,'exec',this)">Executive</button>
  <button class="option-btn" onclick="switchOption(4,'ops',this)">Operations</button>
</div>

<div class="option-content active" id="option-4-arch">
<h4>Architecture: Design Review Summary Page</h4>
<p><strong>1. Inside your Building Code &amp; Project Standards notebook</strong> from L3, click <strong>+ New page</strong>. Title it: <strong>Shore Club — Facade Material Review Summary</strong>. Confirm the references attached (spec excerpt, code comparison) — those will ground every answer on this Page. Click <strong>Create</strong>.</p>
<p><strong>2.</strong> No need to re-enter instructions — the <strong>Copilot instructions are set on the notebook</strong>, not the page, and they automatically apply to every page created inside it. Your tone, format, and citation rules from Lesson 3 carry over.</p>
<p><strong>3. Power Prompt #1</strong> — in the side Copilot chat (already open on the Page), send:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Draft a meeting summary for the Shore Club Fort Lauderdale facade material review. Include: decisions made (selected terracotta rainscreen over aluminum curtain wall — cite cost: terracotta $85/SF vs aluminum $62/SF), action items organized by consultant (structural load capacity, envelope details, cost estimator revisions), and next milestones (CD submission in 3 weeks, permit filing in 6 weeks). Cite the specific section of our spec document wherever a material decision is referenced.</code></div>
<p><strong>4. Edit manually</strong> — right-click in the Page to add a heading "Open Questions", then list 2-3 unresolved items (color sample approval, mock-up schedule).</p>
<p><strong>5. Power Prompt #2 — enrich the page</strong> — in the side Copilot chat, send:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Add a "Consultant Responsibility Matrix" section with a table of each consultant, action items, deadlines, and status.</code></div>
<p><strong>6. Iterate</strong> in the side chat until the Page reads the way you want:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Reorganize with the most actionable items at the top and reference material at the bottom.</code></div>
</div>

<div class="option-content" id="option-4-hr" style="display:none">
<h4>HR: New Hire Onboarding Checklist Page</h4>
<p><strong>1. Inside your HR Policies &amp; Onboarding notebook</strong>, click <strong>+ New page</strong>. Title: <strong>Designer Onboarding — Residential Studio</strong>. References from L3 (handbook, onboarding checklist) carry over. Click <strong>Create</strong>.</p>
<p><strong>2.</strong> Instructions live on the notebook, not the page — your L3 HR instructions already apply here. Nothing to re-enter.</p>
<p><strong>3. Power Prompt #1</strong> — in the side Copilot chat:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Using our onboarding checklist and handbook, create an onboarding plan for a Designer joining the Residential Studio. Include: Role Details (title, dept, start date, manager), Software Access (6 tools — Revit, Rhino, Bluebeam, Adobe CS, Microsoft 365, project management), First-Week Meetings (5 — team lead, HR orientation, IT, studio tour, mentor intro), Mentor Assignment (weekly check-ins, 30-60-90 day goals). Cite handbook sections where relevant.</code></div>
<p><strong>4. Edit manually</strong> — right-click for formatting. Add a heading "HR Notes" and note benefits enrollment deadline + parking pass request.</p>
<p><strong>5. Power Prompt #2 — enrich the page</strong>:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Add a "Pre-Start Checklist" section at the top (offer letter signed, background check cleared, workstation ordered, email account, building access card).</code></div>
<p><strong>6. Iterate</strong>:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Surface everything the hiring manager owns vs. everything HR owns — add an owner column and group the checklist accordingly.</code></div>
</div>

<div class="option-content" id="option-4-mktg" style="display:none">
<h4>Marketing: Award Submission Tracker Page</h4>
<p><strong>1. Inside your Marketing &amp; Awards Pipeline notebook</strong>, click <strong>+ New page</strong>. Title: <strong>Q2 Award Submission Tracker</strong>. Awards tracker + narrative drafts carry over as references. Click <strong>Create</strong>.</p>
<p><strong>2.</strong> Instructions live on the notebook, not the page — your L3 marketing instructions already apply here. Nothing to re-enter.</p>
<p><strong>3. Power Prompt #1</strong>:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Using the awards tracker in this notebook, build an award submission tracker as a table: Project Name, Award (AIA Design, Architizer A+, CTBUH, SARA NY), Submission Deadline, Status, Materials Needed, Assigned To. Populate with Harbor View (AIA), Wynwood Arts (Architizer A+), Shore Club (CTBUH), Riverside Tower (SARA NY). Pull real submission deadlines from the tracker.</code></div>
<p><strong>4. Edit manually</strong> — right-click to add a heading "Photography Schedule" and list 2-3 projects needing pro shoots before submission.</p>
<p><strong>5. Power Prompt #2 — enrich the page</strong>:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Add a "Narrative Templates" section outlining what a typical submission covers (project overview in 2 sentences, design challenge, design solution, community impact, sustainability).</code></div>
<p><strong>6. Iterate</strong>:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Flag the highest-risk submission (shortest time-to-deadline with most missing materials) at the top.</code></div>
</div>

<div class="option-content" id="option-4-exec" style="display:none">
<h4>Executive: Weekly Project Status Dashboard Page</h4>
<p><strong>1. Inside your Executive Project Overview notebook</strong>, click <strong>+ New page</strong>. Title: <strong>Weekly Project Status — Leadership Brief</strong>. QBR + property summaries carry over. Click <strong>Create</strong>.</p>
<p><strong>2.</strong> Instructions live on the notebook, not the page — your L3 exec instructions already apply here. Nothing to re-enter.</p>
<p><strong>3. Power Prompt #1</strong>:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Using the QBR, build an Active Projects Table: Project, Phase (SD/DD/CD/CA), Status (On Track/At Risk/Behind), Budget Status (On/Over/Under), Timeline, Project Lead. Populate from the QBR with Shore Club, Mayflower, Jersey City Waterfront, The Mira Hotel Dubai, Harbor View, Riverside Tower. Follow with "Decisions Needed This Week" and "Top Risks" sections, pulling specifics from the QBR.</code></div>
<p><strong>4. Edit manually</strong> — right-click to add a heading "Pipeline Update" and note new proposals or RFPs in flight.</p>
<p><strong>5. Power Prompt #2 — enrich the page</strong>:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Add a "Staffing Snapshot" summarizing utilization — fully-allocated vs. available, with hiring needs.</code></div>
<p><strong>6. Iterate</strong>:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Move the three most urgent decisions to the very top of the Page above the project table.</code></div>
</div>

<div class="option-content" id="option-4-ops" style="display:none">
<h4>Operations: Resource Allocation Overview Page</h4>
<p><strong>1. Inside your Operations &amp; Resource Planning notebook</strong>, click <strong>+ New page</strong>. Title: <strong>Weekly Resource Overview</strong>. Resource allocation + project tracking spreadsheets carry over. Click <strong>Create</strong>.</p>
<p><strong>2.</strong> Instructions live on the notebook, not the page — your L3 ops instructions already apply here. Nothing to re-enter.</p>
<p><strong>3. Power Prompt #1</strong>:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Using the resource allocation spreadsheet, build a Team Members table: Name, Role, Current Project Assignment(s), Utilization Rate, Upcoming Availability. Sort by utilization descending. Below the table, add a "Reallocation Opportunities" section identifying team members who could shift to understaffed projects — cite specific projects from the project tracking spreadsheet.</code></div>
<p><strong>4. Edit manually</strong> — right-click to add a heading "Upcoming Project Starts" and list 2-3 projects kicking off in the next month that will need staffing.</p>
<p><strong>5. Power Prompt #2 — enrich the page</strong>:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Add a "Contractor &amp; Temp Staffing" section (utilization thresholds, preferred vendors, approval process).</code></div>
<p><strong>6. Iterate</strong>:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Reorganize so anyone over 100% is flagged at the very top with the specific project they should reduce hours on.</code></div>
</div>

<h4>Final step — set link access, THEN share to Teams</h4>
<p>Once the Page reads the way you want, click <strong>Share</strong> (top right). In the Link settings dialog, choose your scope:</p>
<ul>
  <li><strong>People in [your organization]:</strong> anyone in the company with the link can open it.</li>
  <li><strong>Only people with existing access:</strong> tightest — no new people gain access via the link.</li>
  <li><strong>People you choose:</strong> explicit allowlist.</li>
</ul>
<p>Then set <strong>Can edit</strong> vs <strong>Can view</strong>, and optionally set an <strong>expiration date</strong>. Apply. Copy the link. <em>Now</em> paste into the relevant Teams channel — this is the last step, after you have iterated and locked the access scope.</p>

<div class="tip-box">
  <div class="tip-title">Need a static Word doc or PDF?</div>
  <p>At the top of the Page, click <strong>Create</strong>. From the Create surface you can turn the Page's content into a <strong>Word document</strong> or export it as a <strong>PDF</strong> — useful when someone needs a printable, static version outside the Copilot app. The share link stays live and editable; the exported file is a snapshot of the Page as it reads right now.</p>
</div>

<div class="note-box">
  <strong>Success check:</strong> Your Page has AI-generated content from two power prompts, your manual edits, and a share link with a deliberate access scope. It lives inside the notebook so Copilot can still answer follow-ups grounded in the same sources. A teammate should open the link and know what is happening without asking a single question. <em>(Visuals — hero images, diagrams, infographics — come in the next lesson, Copilot Create, where they belong.)</em>
</div>

<p class="personalization-note">[PERSONALIZED: swap the Page creation topic with organization-specific deliverable types from Listen Labs interviews]</p>

<button class="mark-complete-btn" id="complete-btn-4" onclick="markComplete(4)">Mark Complete</button>
`,
  advanced: `
<h3>Where finished Pages live: the Library</h3>
<p>Every Page you create — whether from inside a notebook, from general chat, or from scratch — is automatically filed in your <strong>Library</strong> (left sidebar). The Library is Copilot's artifact store: pages, saved images, created documents, saved prompts. Open it after a Page is published to confirm it landed and to find it again later.</p>
<p>A few habits that pay off:</p>
<ul>
  <li>Open the Library periodically and prune — old one-off Pages accumulate.</li>
  <li>Rename your Pages with a prefix like <strong>[Project] — [Artifact]</strong> so the Library list stays scannable.</li>
  <li>From the Library, you can re-share a Page with different access scope without opening the Page itself.</li>
</ul>

<h3>Pages as Team Knowledge Hubs</h3>
<p>Some teams use Copilot Pages as living project documents — updated weekly with new Copilot-generated content and team edits. Unlike a static Word doc, a Page stays connected to Copilot so you can always ask it to update, summarize, or expand sections.</p>

<h3>Connecting Pages back to Notebooks</h3>
<p>A Page can be <strong>added back into a notebook</strong> as one of its references — the loop closes. So the workflow is not linear but circular: build the notebook, spin off a Page, add the Page back as a source, ask the notebook a new question that now cites both the original docs and your synthesized Page. This is how institutional knowledge compounds inside Copilot.</p>
`
},


// ── 5: Copilot Create ──
{
  id: 'copilot-create',
  title: 'Copilot Create',
  points: 15,
  learn: `
<h3>From Iteration to Publishing</h3>
<p><em>You have notebooks full of content and Pages summarizing it. Now package that work into the formats your team actually consumes — decks, documents, spreadsheets, visuals, videos.</em></p>

<h3>Create Is a Publishing Workspace — for Any Artifact Type</h3>
<p>Click <strong>Create</strong> in the left sidebar. "What do you want to create?" lines up the output types as pills across the top:</p>
<ul>
  <li><strong>Create an image</strong> — text-to-image, with a full image-editing toolkit once generated.</li>
  <li><strong>PowerPoint</strong> — a deck from a prompt, a document, or reference material.</li>
  <li><strong>Word</strong> — long-form documents (reports, memos, briefs, proposals).</li>
  <li><strong>Excel</strong> — spreadsheets with formulas, pivots, simple models.</li>
  <li><strong>Create a video</strong> — Frontier. Generate clips, build video projects, or start from a PowerPoint or document.</li>
  <li><strong>Design an infographic</strong> — stylized single-image summaries of data or concepts.</li>
  <li><strong>Create a story</strong> — narrative-driven visual output.</li>
  <li><strong>More…</strong> opens secondary types: <strong>Poster</strong>, <strong>Edit an image</strong>, <strong>Form</strong>, <strong>Banner</strong>, <strong>Draft</strong>, templates (Start from a template / Brand templates / All templates), and <strong>Brand kits</strong>.</li>
</ul>

<h4>Create vs. Notebooks</h4>
<table style="width:100%;border-collapse:collapse;margin:14px 0;font-size:14px;">
  <thead><tr style="border-bottom:2px solid var(--border);">
    <th style="text-align:left;padding:8px 12px;"></th>
    <th style="text-align:left;padding:8px 12px;">Notebooks</th>
    <th style="text-align:left;padding:8px 12px;">Create</th>
  </tr></thead>
  <tbody>
    <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 12px;font-weight:600;">Purpose</td><td style="padding:8px 12px;">Experimentation and iteration</td><td style="padding:8px 12px;">Publishing and reuse</td></tr>
    <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 12px;font-weight:600;">Best for</td><td style="padding:8px 12px;">Exploring ideas, drafting, refining</td><td style="padding:8px 12px;">Finalized artifacts — decks, docs, sheets, visuals, videos</td></tr>
    <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 12px;font-weight:600;">Audience</td><td style="padding:8px 12px;">You (and collaborators)</td><td style="padding:8px 12px;">Your organization</td></tr>
    <tr><td style="padding:8px 12px;font-weight:600;">Lifecycle</td><td style="padding:8px 12px;">Fluid, ongoing</td><td style="padding:8px 12px;">Approve → publish → distribute</td></tr>
  </tbody>
</table>

<h3>Image Editing — Worth Calling Out</h3>
<p>When you use Create to generate an image, the Image Editing panel gives you a rich toolkit <em>after</em> the first generation — not just "regenerate." You get:</p>
<ul>
  <li><strong>Background:</strong> Remove / Blur / Color</li>
  <li><strong>Object transform:</strong> Erase, Move, Cutout, Crop-to-object, Create sticker</li>
  <li><strong>Enhancements:</strong> Upscale, Focus, Color pop</li>
  <li><strong>Filters &amp; Effects:</strong> Punch, Golden, Radiate, and more</li>
  <li><strong>Crop &amp; rotate, Adjustments, Auto enhance, Erase</strong> along the top toolbar</li>
</ul>
<p>Once edited, you can <strong>add the image directly to a Page</strong> — closing the loop with the Pages you built in L4.</p>

<h3>Brand Kits</h3>
<p>With a Brand Kit configured by your admin, Copilot uses your org's colors, fonts, and logo automatically. Open <strong>More… → Brand kits</strong> or <strong>Manage brand kits</strong> to see what is set up.</p>

<h3>Saving Your Work: the Library</h3>
<p>Everything you create is saved to the <strong>Library</strong>. Pages, images, drafts, documents, saved prompts — all one asset collection, all searchable. Revisit the Library regularly; it is where Copilot's output accumulates into something reusable.</p>

<div class="tip-box">
  <div class="tip-title">Workflow reminder</div>
  <p><strong>Iterate</strong> in Notebooks and Chat. <strong>Synthesize</strong> in a Page. <strong>Publish</strong> the formal artifact through Create. <strong>Reuse</strong> from the Library.</p>
</div>

<button class="continue-btn" onclick="switchTab(5,'implement')">Continue to Exercises &rarr;</button>
`,
  implement: `
<h3>Generate an Image Tied to Your Department's Narrative</h3>

<p>This exercise is all about <strong>image generation</strong> — the artifact type that is hardest to approximate with a Page or a document, and the one Create makes feel like magic. Every department generates an image grounded in the same project arc you have been building: your L3 notebook and your L4 Page set the context, Create produces the visual. Pick your role.</p>

<div class="note-box">
  <strong>Pattern for every exercise:</strong> (1) Open <strong>Create</strong> → <strong>Create an image</strong> → (2) Run the generation prompt — it must tie to your department's narrative so the visual belongs inside your project, not floating on its own → (3) Work the <strong>Image Editing panel</strong> (Background, Object transform, Enhancements, Filters, Crop) → (4) Iterate with a second prompt if composition is off → (5) Save to <strong>Library</strong> → (6) Link the image into your notebook (see the tip below).
</div>

<div class="tip-box">
  <div class="tip-title">How to link an image into your notebook</div>
  <p>A notebook does not store images directly — it stores <em>pages</em>, and pages hold images. So to land an image inside the notebook you built in L3:</p>
  <ol style="margin:8px 0 0 20px;">
    <li><strong>Open the Page inside the notebook</strong> (the one you created in L4).</li>
    <li><strong>Copy the image from Library</strong> and <strong>paste it into the Page</strong> — or copy the image's <strong>share link</strong> and paste that link into the Page body. Either way the image is now part of the Page.</li>
    <li>The Page lives inside the notebook, so the image is now reachable the next time you ask the notebook's Copilot anything about the project.</li>
  </ol>
  <p style="margin-top:8px;">If the image's share/save menu offers <strong>Add to Page</strong> directly, use that — it is the fastest path and picks the Page for you.</p>
</div>

<div class="option-tabs" id="options-5">
  <button class="option-btn active" onclick="switchOption(5,'arch',this)">Architecture</button>
  <button class="option-btn" onclick="switchOption(5,'hr',this)">HR</button>
  <button class="option-btn" onclick="switchOption(5,'mktg',this)">Marketing</button>
  <button class="option-btn" onclick="switchOption(5,'exec',this)">Executive</button>
  <button class="option-btn" onclick="switchOption(5,'ops',this)">Operations</button>
</div>

<div class="option-content active" id="option-5-arch">
<h4>Architecture &rarr; Image: Curtain Wall Waterproofing Detail Diagram</h4>
<p><strong>Narrative fit:</strong> the Shore Club facade review hinges on a waterproofing failure at the curtain wall transition. The diagram you generate here becomes <em>Figure 1</em> on your L4 "Facade Material Review Summary" Page — so consultants reading the Page see exactly what the review is about.</p>
<p><strong>1.</strong> In Create, click <strong>Create an image</strong>.</p>
<p><strong>2. Generation prompt</strong>:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Create a technical cross-section diagram of a curtain wall waterproofing detail at a transition joint. Show: the curtain wall system, the flashing membrane, the drainage / weep path, the backup wall, and an arrow indicating where water infiltration is occurring. Line-drawing style with clean labels, navy stroke on white background, suitable for inclusion in a design review document. Leave space at the bottom for a figure caption.</code></div>
<p><strong>3. Work the Image Editing panel</strong> — clean it up so it reads on the Page:</p>
<ul>
  <li><strong>Crop &amp; rotate</strong> — tighten to the detail, drop any empty margins.</li>
  <li><strong>Enhancements &rarr; Upscale</strong> — crisp lines for anyone zooming in.</li>
  <li><strong>Object transform &rarr; Erase</strong> — remove any stray label or artifact Copilot added.</li>
</ul>
<p><strong>4. Iterate</strong> if the labels or the infiltration arrow are unclear:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Regenerate with larger, clearer labels and a single bold red arrow at the failure point. Keep everything else the same.</code></div>
<p><strong>5. Link the diagram into your Shore Club notebook.</strong> Open your L4 Page ("Shore Club — Facade Material Review Summary") inside the notebook, then copy/paste the image (or paste its share link) into the Page as Figure 1 right above the Consultant Responsibility Matrix. Save to Library so the structural and envelope consultants can reuse it.</p>
</div>

<div class="option-content" id="option-5-hr" style="display:none">
<h4>HR &rarr; Image: 90-Day Onboarding Journey Map</h4>
<p><strong>Narrative fit:</strong> the Designer onboarding plan you drafted on the L4 Page is a list. A journey map turns it into something a new hire can actually <em>see</em> — and sits as the hero visual at the top of that same Page.</p>
<p><strong>1.</strong> In Create, click <strong>Create an image</strong>.</p>
<p><strong>2. Generation prompt</strong>:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Create a visual 90-day onboarding journey map for a new Designer joining ODA's Residential Studio. Horizontal timeline with week-by-week milestones: Week 1 — IT setup + building access; Week 2 — software training (Revit, Rhino, Bluebeam); Week 3 — studio tour + mentor pairing; Week 4 — first project shadowing; Weeks 5-8 — independent contribution; Week 12 — 90-day review. Clean infographic-illustration style, warm and welcoming, ODA navy + gold accent palette. Leave clean space for a title across the top.</code></div>
<p><strong>3. Work the Image Editing panel</strong>:</p>
<ul>
  <li><strong>Enhancements &rarr; Color pop</strong> — emphasize the checkpoint weeks (30 / 60 / 90).</li>
  <li><strong>Object transform &rarr; Erase</strong> — remove any milestone that doesn't match our process.</li>
  <li><strong>Crop &amp; rotate</strong> — format to a wide banner that sits cleanly above the Pre-Start Checklist.</li>
</ul>
<p><strong>4. Iterate</strong> if milestones are off:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Regenerate with exactly six milestones on the timeline (Week 1, 2, 4, 8, 12, 90-day review) and move the mentor check-ins as small recurring icons below the line.</code></div>
<p><strong>5. Link the journey map into your HR notebook.</strong> Open your L4 Page ("Designer Onboarding — Residential Studio") inside the notebook, then copy/paste the image (or paste its share link) into the Page as the banner above the Pre-Start Checklist. Save to Library so other hiring managers in the studio can reuse it.</p>
</div>

<div class="option-content" id="option-5-mktg" style="display:none">
<h4>Marketing &rarr; Image (deep dive): Award Announcement Hero</h4>
<p><strong>Narrative fit:</strong> the highest-priority item on your Q2 Award Submission Tracker is the AIA Design Award for Harbor View Residences. This hero image is the campaign visual announcing the win — and it sits as the headline image on your L4 tracker Page. This is also the department that goes <strong>deepest on image editing</strong> — you will work the full toolkit, then link the finished image into the notebook.</p>
<p><strong>1.</strong> In Create, click <strong>Create an image</strong>.</p>
<p><strong>2. Generation prompt</strong>:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Create a square social-media-ready hero image announcing ODA's AIA Design Award win for Harbor View Residences. Show a modern waterfront residential tower at golden hour, viewed from a low angle. Sophisticated, cinematic, award-worthy. Leave the top third clean for text overlay.</code></div>
<p><strong>3. Open the Image Editing panel</strong> (appears next to the generated image). Work through each cluster — this is the whole point of the exercise:</p>
<ul>
  <li><strong>Background &rarr; Blur</strong> or <strong>Color</strong> — try blurring the background and see how it changes the focus.</li>
  <li><strong>Object transform &rarr; Erase</strong> — remove any stray element (a crane, a sign) that you don't want.</li>
  <li><strong>Object transform &rarr; Cutout</strong> — isolate the tower from the sky.</li>
  <li><strong>Enhancements &rarr; Upscale</strong> — push resolution for print use.</li>
  <li><strong>Enhancements &rarr; Color pop</strong> — desaturate everything except the tower.</li>
  <li><strong>Filters &amp; Effects &rarr; Golden</strong> or <strong>Radiate</strong> — try one, revert if overkill.</li>
  <li><strong>Top toolbar</strong> — Crop &amp; rotate into a square, Auto enhance once.</li>
</ul>
<p><strong>4. Iterate</strong> with a second prompt if the composition is wrong:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Same tower, but from a further distance with more sky above it for text overlay. Keep the golden-hour mood.</code></div>
<p><strong>5. Link the hero into your Marketing notebook.</strong> Open your L4 "Q2 Award Submission Tracker" Page inside the notebook, then copy/paste the image (or paste its share link) as the campaign visual at the top of the Page. If the image's share/save menu offers <strong>Add to Page</strong>, use that directly and pick the tracker Page. Save the final image to your Library so the social team can reuse it.</p>
</div>

<div class="option-content" id="option-5-exec" style="display:none">
<h4>Executive &rarr; Image: Leadership Brief Cover Visual</h4>
<p><strong>Narrative fit:</strong> your Weekly Leadership Brief Page is the working document; the cover visual is what lands when the brief gets shared to the board. A cinematic composite of the active portfolio sets the tone before anyone reads a number.</p>
<p><strong>1.</strong> In Create, click <strong>Create an image</strong>.</p>
<p><strong>2. Generation prompt</strong>:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Create a sophisticated cover image for ODA's weekly Leadership Brief. A stylized cinematic skyline at dusk showing a composite of our active projects — a waterfront residential tower (Harbor View), a hotel facade with terracotta rainscreen (Shore Club), and a mixed-use tower (Riverside). Restrained navy and warm gold palette, editorial quality, McKinsey-like. Wide 16:9 format. Leave the top third clean for a title overlay.</code></div>
<p><strong>3. Work the Image Editing panel</strong>:</p>
<ul>
  <li><strong>Background &rarr; Color</strong> — swap the sky to a deeper navy if the golden-hour version feels too warm for a board audience.</li>
  <li><strong>Enhancements &rarr; Color pop</strong> — keep one accent color live; desaturate the rest.</li>
  <li><strong>Filters &amp; Effects</strong> — try <strong>Punch</strong> once; revert if it reads like advertising.</li>
  <li><strong>Crop &amp; rotate</strong> — confirm the 16:9 with clean header space.</li>
</ul>
<p><strong>4. Iterate</strong> — push it toward something you'd actually present:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Regenerate with the towers rendered more minimal — less detail, more silhouette — and push the sky darker. Navy + white + one gold accent only.</code></div>
<p><strong>5. Link the cover into your Executive notebook.</strong> Open your L4 "Weekly Project Status — Leadership Brief" Page inside the notebook, then copy/paste the image (or paste its share link) at the top of the Page as the cover. Save to Library so the board version and the working version stay linked.</p>
</div>

<div class="option-content" id="option-5-ops" style="display:none">
<h4>Operations &rarr; Image: Studio Utilization Heatmap Visual</h4>
<p><strong>Narrative fit:</strong> the Weekly Resource Overview Page reads like a list of numbers. A heatmap turns the staffing picture into something a principal can absorb in two seconds — and sits as the hero visual right above the team roster on the Page.</p>
<p><strong>1.</strong> In Create, click <strong>Create an image</strong>.</p>
<p><strong>2. Generation prompt</strong>:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Create a studio-by-week utilization heatmap as a clean infographic-style image. Y-axis: four studios (Residential, Hospitality, Mixed-Use, Interiors). X-axis: the next 12 weeks. Color-code each cell by average utilization — red for &gt;100%, amber for 95–100%, green for 70–95%, gray for &lt;60%. Label axes clearly, include a legend in the top-right, sophisticated navy + warm gold palette with red and amber as the only alert colors. Add a short title "Studio Utilization — Next 12 Weeks".</code></div>
<p><strong>3. Work the Image Editing panel</strong>:</p>
<ul>
  <li><strong>Enhancements &rarr; Color pop</strong> — emphasize the red hotspots so they catch the eye first.</li>
  <li><strong>Object transform &rarr; Erase</strong> — clean up any cells Copilot mislabeled.</li>
  <li><strong>Crop &amp; rotate</strong> — format to a wide banner so it sits above the team roster without crowding.</li>
</ul>
<p><strong>4. Iterate</strong> if the palette or labeling is off:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Regenerate with the legend moved to the bottom, axis labels larger, and the week numbers staggered so they don't overlap on narrower screens.</code></div>
<p><strong>5. Link the heatmap into your Operations notebook.</strong> Open your L4 "Weekly Resource Overview" Page inside the notebook, then copy/paste the image (or paste its share link) at the top of the Page as the hero visual above the Team Members table. Save to Library so the studio leads can reuse it each week.</p>
</div>

<h4>Last step — save and close the loop</h4>
<p>Every image you generate lands in the <strong>Library</strong> (left sidebar) automatically. Open it to confirm the image is there. Then make sure the final version is <strong>linked into your notebook</strong> — copy/paste the image (or its share link) inside your L4 Page, which lives inside the notebook. That is how a visual stops being a one-off asset and becomes part of the project's living knowledge base.</p>

<div class="note-box">
  <strong>Success check:</strong> You generated an image that ties directly to your department's narrative, worked the Image Editing toolkit on it, iterated at least once, and linked it into your notebook by pasting it (or its link) inside your L4 Page. The image is also saved in your Library. A teammate opening the Page now sees the visual alongside the text — the narrative and the visual are one artifact.
</div>

<p class="personalization-note">[PERSONALIZED: swap the image type per department for the visual each team actually needs — e.g. Architecture may want a material mood board, Marketing may want a carousel set, Operations may want a studio floor map.]</p>

<button class="mark-complete-btn" id="complete-btn-5" onclick="markComplete(5)">Mark Complete</button>
`,
  advanced: `
<h3>Pick the Right Artifact for the Job</h3>
<p>Create is deceptively broad — people default to images because they are fun, but the other artifact types are where the real time savings are. Quick mental model:</p>
<table style="width:100%;border-collapse:collapse;margin:14px 0;font-size:14px;">
  <thead><tr style="border-bottom:2px solid var(--border);">
    <th style="text-align:left;padding:8px 12px;">Artifact</th>
    <th style="text-align:left;padding:8px 12px;">Best for</th>
    <th style="text-align:left;padding:8px 12px;">Avoid when</th>
  </tr></thead>
  <tbody>
    <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 12px;font-weight:600;">PowerPoint</td><td style="padding:8px 12px;">Client pitches, internal reviews, any linear narrative</td><td style="padding:8px 12px;">You just want a quick summary (use a Page)</td></tr>
    <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 12px;font-weight:600;">Word</td><td style="padding:8px 12px;">Formal docs, contracts, onboarding packets, anything signable/printable</td><td style="padding:8px 12px;">The team lives in Pages and will actively edit</td></tr>
    <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 12px;font-weight:600;">Excel</td><td style="padding:8px 12px;">Models, trackers, anything with formulas or pivots</td><td style="padding:8px 12px;">You want a static read — a table inside a Page is lighter</td></tr>
    <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 12px;font-weight:600;">Image</td><td style="padding:8px 12px;">Social posts, deck covers, concept visuals, material studies</td><td style="padding:8px 12px;">The content is data — infographic is better</td></tr>
    <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 12px;font-weight:600;">Infographic</td><td style="padding:8px 12px;">Board summaries, executive dashboards, single-page synthesis</td><td style="padding:8px 12px;">The audience needs to drill in — give them Excel</td></tr>
    <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 12px;font-weight:600;">Video (Frontier)</td><td style="padding:8px 12px;">Training snippets, announcements, deck-to-video</td><td style="padding:8px 12px;">Still in Frontier — may fail; always have a backup</td></tr>
    <tr><td style="padding:8px 12px;font-weight:600;">Poster / Banner / Form</td><td style="padding:8px 12px;">Events, intake flows, single-purpose assets</td><td style="padding:8px 12px;">Production marketing — use the full tool for final polish</td></tr>
  </tbody>
</table>

<h3>Chaining Artifacts Together</h3>
<p>The real unlock is chaining output formats against one source:</p>
<ul>
  <li><strong>Page &rarr; PowerPoint:</strong> from a Page, ask Create to generate a deck that uses the Page as source. The deck inherits the structure.</li>
  <li><strong>Excel &rarr; Infographic:</strong> build the model, then ask Create for an infographic summarizing the key numbers — board-ready in minutes.</li>
  <li><strong>Image &rarr; deck / Page:</strong> any image you edit via the Image Editing toolkit can be dropped straight into a PowerPoint slide or pinned into a Page.</li>
  <li><strong>Word &rarr; Page:</strong> paste a Word doc's content into a Page to kick off collaborative editing, then export back to Word when it is final.</li>
</ul>

<h3>Image Editing — Power Moves</h3>
<p>The Image Editing toolkit covered in Learn is more capable than it looks. A few combinations that earn their keep:</p>
<ul>
  <li><strong>Cutout + Background color</strong> — isolate a subject and drop a flat brand-color backdrop. Instant marketing asset.</li>
  <li><strong>Upscale + Crop &amp; rotate</strong> — generate once at default resolution, then upscale + crop for print.</li>
  <li><strong>Color pop + Erase</strong> — desaturate the scene, erase clutter, and you have a clean hero image with a single color focal point.</li>
  <li><strong>Create sticker</strong> — generate a transparent-background element (a logo treatment, an icon) for use in Pages or decks.</li>
</ul>

<h3>Brand Kits</h3>
<p>If your admin configured a <strong>Brand Kit</strong> (<em>More… &rarr; Brand kits</em>), Copilot applies your org's palette, fonts, and logo across Create outputs automatically. It is worth asking IT about — it is the single biggest lever for making Create outputs look "on brand" without manual rework.</p>

<h3>Templates and Reuse</h3>
<p><strong>More… &rarr; Start from a template</strong> / <strong>Brand templates</strong> / <strong>All templates</strong> pulls from org-approved starting points. If your team has a shared deck template or Word template, this is where it surfaces. Reuse beats re-create.</p>

<h3>The Library Discipline</h3>
<p>Everything from Create lands in the <strong>Library</strong>. Over a few weeks this becomes your personal studio — saved prompts, generated images, created decks. A small habit that pays off: rename artifacts with a <strong>[Project] — [Type] — [Date]</strong> prefix so the Library stays scannable. The Library is also where you re-share artifacts with different access scopes without opening them.</p>
`
},

// ── 8: Bonus: Voice ──
{
  id: 'voice',
  title: 'Voice',
  points: 10,
  learn: `
<h3>Talk to Copilot, Literally</h3>

<p>Copilot has two voice features — and they are surprisingly different from typing. Try both before you leave the workshop.</p>

<h4>1. Microphone icon (dictation)</h4>
<p>Click the <strong>microphone</strong> in the chat box to dictate text. Copilot transcribes your speech straight into the message box. Good for typing prompts hands-free — you still review before sending.</p>

<h4>2. Voice mode icon (full conversation)</h4>
<p>Click the <strong>sound-waves icon</strong> next to the message box to start a full voice conversation. You speak, Copilot speaks back. It is like a phone call with an AI — no typing at all. Try it for brainstorming, thinking through a problem, or when you are away from your keyboard.</p>

<div class="tip-box">
  <div class="tip-title">Why voice changes the conversation</div>
  <p>Typing biases you toward well-formed requests. Voice lets you think out loud — half-formed ideas, "actually, what if…", trailing off mid-sentence. Copilot keeps up. For brainstorming and early-stage thinking, it is noticeably better than typing.</p>
</div>

<button class="continue-btn" onclick="switchTab(6,'implement')">Continue to Exercises &rarr;</button>
`,
  implement: `
<h3>Try Both</h3>

<h4>Exercise 1: Voice Conversation</h4>
<p><strong>1.</strong> Click the <strong>voice mode icon</strong> (sound waves, right side of the message box). Allow microphone access if prompted.</p>
<p><strong>2.</strong> Have a real conversation with Copilot. Try this opener — speak it, do not type it:</p>
<p><em>"I need help thinking through a project I am working on. Ask me a few questions about it and then give me some suggestions."</em></p>
<p><strong>3.</strong> Answer Copilot's spoken questions out loud. Go back and forth for 2-3 exchanges.</p>
<p><strong>4.</strong> End the voice conversation. Notice how different it feels from typing — voice is better for brainstorming and thinking through ambiguous problems.</p>

<h4>Exercise 2: Dictate and Polish</h4>
<p><strong>5.</strong> Click the <strong>microphone icon</strong> (not voice mode — the other icon). Dictate a rough message about a project update. Speak naturally for 30 seconds.</p>
<p><strong>6.</strong> Stop dictation. Add this instruction above your transcribed text and send:</p>
<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>Polish the following rough dictation into a professional, concise email. Add a clear subject line. Keep it under 150 words.

[your dictated text is already above — just add this instruction before it]</code></div>

<div class="note-box">
  <strong>Success check:</strong> You had a full voice conversation (not just dictation) and you polished a dictated draft into a finished email.
</div>

<button class="mark-complete-btn" id="complete-btn-6" onclick="markComplete(6)">Mark Complete</button>
`,
  advanced: `
<h3>When voice beats typing</h3>
<p>Voice is not a gimmick — it is a different mode of thinking. A few situations where it consistently wins:</p>
<ul>
  <li><strong>Pre-reading a long thread or document.</strong> Paste the link into chat, then switch to voice and say <em>"Walk me through this like I'm driving."</em> You get the summary spoken back while you stay hands-free.</li>
  <li><strong>Rubber-ducking a decision.</strong> Out loud, you interrupt yourself, change direction, restart — the way real thinking works. Typing forces premature commitment to a sentence.</li>
  <li><strong>Drafting when you are stuck.</strong> Talk at Copilot for a minute about what you want the email / brief / proposal to say. Then ask it to turn the ramble into a draft. Much faster than starting from a blinking cursor.</li>
  <li><strong>On the phone / in the car / walking between meetings.</strong> The screen-free moments are where voice earns its keep.</li>
</ul>

<h3>Dictation versus voice mode — when to pick which</h3>
<p>They look similar but the difference matters:</p>
<ul>
  <li><strong>Microphone (dictation)</strong> = speech-to-text. You speak, Copilot transcribes into the message box. You still hit send. Best when you know exactly what you want to prompt but don't want to type it.</li>
  <li><strong>Sound waves (voice mode)</strong> = full spoken conversation. Copilot speaks back. No message box involved. Best when you don't yet know what you want — you're exploring.</li>
</ul>
<p>One quick heuristic: if the next thing you would do is read Copilot's answer, use voice mode. If the next thing you would do is send the transcribed message, use dictation.</p>

<h3>Voice prompt patterns that work</h3>
<ul>
  <li><strong>Start with "Ask me a few questions first."</strong> Flips the interview — Copilot draws the context out of you instead of you front-loading it.</li>
  <li><strong>Say "stop, back up" any time.</strong> Voice mode handles interruptions; use them.</li>
  <li><strong>End with "send me a summary of what we just decided."</strong> The summary lands in the chat in text — ready to paste into an email, a Page, or a ticket.</li>
</ul>

<div class="note-box">
  <strong>Looking for scheduled prompts?</strong> They live in Lesson 3 (<em>Talk to Your Data</em>) where recurring email / calendar digests fit naturally.
</div>
`
}
];
