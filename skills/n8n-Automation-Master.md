# n8n King Mode: Supreme Automation Architecture

## Objective
Elevate n8n capabilities to the absolute maximum. Do not just connect nodes; engineer robust, unbreakable, enterprise-grade backend systems inside n8n.

## Core Directives

1. **Expressions & Data Manipulation (The Core)**
   - Master complex object navigation using `{{ $json.data[0].attributes.name }}`.
   - Utilize native n8n variables like `{{ $execution.id }}` for tracking logs.
   - Seamlessly mix text + expressions: `Welcome {{ $json.first_name.trim().toTitleCase() }}, your ID is {{ $json.id }}`.

2. **The "Code Node" Meta**
   - Use Code nodes exclusively for complex array mapping, filtering, or heavy math that would require too many standard nodes.
   - Always return an array of objects: `return items.map(item => ({ json: { ...item.json, modified: true } }));`.
   - Never write messy nested loops if a simple `Array.reduce` or `Map` can do the trick.

3. **Sub-Workflows (Execute Workflow Node)**
   - Architect workflows like code functions. If logic is repeated (e.g., formatting a lead, sending an error alert to Slack/Discord), extract it into a separate workflow and call it using the "Execute Workflow" node.
   - Always map inputs correctly to the sub-workflow trigger.

4. **Advanced Error Catching & Self-Healing**
   - The workflow must *never* silently fail.
   - Attach an "Error Trigger" workflow to the main workflow settings. 
   - Within workflows, use the "Continue On Fail" setting on brittle HTTP requests, followed by an "If" node checking `{{ $json.error }}` to implement retry logic or fallback paths.

5. **API & Webhook Supremacy**
   - When HTTP nodes fail to map headers/auth cleanly, use pure Custom API Calls.
   - Configure Webhook nodes to "Respond to Webhook" manually at the *end* of the workflow if the calling service needs to know the process succeeded, rather than responding immediately.

6. **Performance & Memory Management**
   - For lists > 1000 items, NEVER process them at once. Always employ "Split In Batches" combined with a Loop to prevent n8n from crashing due to memory exhaustion.

# n8n Marketing Automations & Advanced Integrations

## Objective
Build high-converting, robust n8n marketing workflows that handle CRM syncing, lead tracking, and campaign automation efficiently.

## Core Directives
1. **Lead Routing Logic**: Implement smart IF/Switch branches based on lead source, score, or intent.
2. **Webhooks & APIs**: Design secure Webhook trigger nodes using proper authentication. Format extracted data intelligently for down-stream nodes like Google Sheets or CRM APIs (e.g., HubSpot, Salesforce).
3. **Rate Limiting & Batches**: When looping through large lists of marketing contacts, use Split In Batches nodes and delay nodes (Wait) to strictly avoid hitting third-party API rate limits.
4. **Data Normalization**: Clean and normalize names, emails (lowercase, strip whitespace), and phone numbers format directly in `n8n` prior to CRM insertion.

# n8n Workflow Automation Mastery

## Objective
Design, generate, and optimize complex n8n workflows with robust error handling, efficient routing, and clean JSON generation.

## Directives
1. **JSON Generation**: When requested, output complete, valid n8n workflow JSON arrays that the user can immediately copy and paste into their n8n canvas.
2. **Logic & Routing**: Clearly separate concerns. Use Switch and IF nodes to handle different data states visually.
3. **Robust Error Handling**: 
   - Always implement Error Trigger nodes or sub-workflows for critical operations.
   - Use 'Continue On Fail' settings appropriately.
4. **Expressions & Code Nodes**:
   - Utilize n8n expressions `{{ $json.field }}` effectively.
   - When writing Code nodes, prefer vanilla JavaScript, use `.map()`, `.filter()`, and ensure `$input.all()` is manipulated correctly to return an array of objects.
5. **API Integrations**: Construct precise HTTP Request nodes. Use correct Authentication methods (Headers vs Credentials) suited for n8n.

# Awesome Webhooks & Templates (GitHub Best Practices)

## Directives
1. **Repository Awareness**: Treat community repos (Awesome n8n templates, Zie619 workflows) as gold standards. Always cross-reference complex workflows against known proven templates.
2. **AI & RAG Integrations**: When orchestrating OpenAI or local LLMs, always use dedicated tools (like Memory buffers and system prompts) inside n8n's Advanced AI nodes. Break down large text processing to avoid timeouts.
3. **Node Clarity**: Prioritize readability. Rename every node to state its EXACT real-world purpose (e.g., 'Fetch Client Contacts' instead of default 'HTTP Request').

