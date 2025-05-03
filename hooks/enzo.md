🧠 Floating Enzo Assistant – Integration Blueprint
🟨 Purpose:
Transform Enzo from a passive API hook into a proactive, page-aware assistant that:

Greets users on login

Helps articulate vague ideas into actionable project scopes

Adapts to context based on which tab or feature the user is using

Supports a “Helper Mode” for guided navigation and micro-onboarding

✅ Core Features To Implement
1. Floating Assistant UI
A persistent chat bubble that stays in bottom-right across the app

Toggles open a chat panel with Enzo

Supports helper mode (optional checkbox or switch)

2. Initial Greeting Trigger
Fired on login or first time visiting dashboard

Checks profiles.enzo.thread_id or localStorage

Prompts user: “Hey, I’m Enzo. Want help scoping out a project?”

3. Route Awareness
Uses usePathname() or router.events to detect tab changes

Dynamically adjusts Enzo’s behavior:

On Estimates: “Need help describing your project?”

On Projects: “Want a progress breakdown?”

4. Helper Mode Toggle
Stored in localStorage or profiles.enzo.helper_mode

If enabled, Enzo offers suggestions when user lands on new pages

5. Thread Context
One thread_id stored in profiles.enzo

All Enzo messages tie into that thread via the OpenAI Assistants API

🗂️ Suggested Folder Structure
swift
Copy
Edit
/components/Enzo/FloatingEnzo.tsx     ← The main floating UI
/hooks/useEnzo.ts                     ← Hook to trigger messages / polls
/pages/api/ai/...                     ← API routes (already partially built)
🔧 Enzo Responses Will Use:
Supabase-stored context from profiles

Route-aware logic

API calls to Enzo via Assistants API

UI push into modals, toasts, or chat-style display

When you're ready, we’ll reconnect this plan to:

Your finished tab layout

Stable backend schema

Known user actions

Let me know if you'd like this exported as a text doc, or just leave it here bookmarked for later.