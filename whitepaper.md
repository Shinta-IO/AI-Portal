Pixel Pro Portal – Software Architecture Specification (v2.1)

Overview

Pixel Pro Portal is a full-stack SaaS platform purpose-built for digital service collaboration. It enables agencies, freelancers, and collectives to commission, manage, and fulfill web, marketing, and software projects through streamlined workflows, real-time communication, and intelligent automation.

This specification outlines the technical architecture, design constraints, integration boundaries, and structural decisions for Pixel Pro Portal. It represents the source of truth for the system and governs all future development. Any deviation from this document must be justified and formally approved.

1. Goals and Constraints

Core Objectives

Enable crowd-based project funding via Crowd Commissioning

Streamline client → estimate → invoice → payment pipelines

Implement real-time messaging and notification infrastructure

Automate reminders and AI-guided workflows

Provide role-specific dashboards without duplicating routes

Maintain a flat, scalable file structure (no route nesting by role)

Ensure full tenant isolation through Supabase Row-Level Security (RLS)

Non-Negotiable Constraints

Unified page routing (one page.tsx per route)

Conditional role rendering handled inside views

All files must be predeclared in this system spec

Supabase Auth replaces any need for NextAuth or server session wrappers

Zero reliance on SSR-based auth middleware; pure client-side session via JWT

All backend logic (e.g., AI, Stripe, Cron) lives in API route handlers

2. Technology Stack

Layer

Technology

Frontend

Next.js 14 (App Router), Tailwind CSS

Backend

Supabase (Postgres, RLS, Storage)

ORM

Prisma

Auth

Supabase Auth (email, OAuth, JWT)

Payments

Stripe (Checkout, Webhooks)

Emails

SendGrid (Transactional, Reminders)

AI Assistant

OpenAI or Claude (API-integrated)

Hosting

Vercel

CI/CD

GitHub Actions

3. Authentication Design

Supabase Auth handles all registration, login, and role management

JWT is stored in sb-access-token (client-side cookie)

User role is embedded in user_metadata.role

useUser() hook and middleware access the session client-side

Admins must be manually promoted; default role is user

4. Role-Based Architecture

All route-level pages render both admin and client views conditionally

Component libraries are split by usage context (not route path)

Logic for view branching must be co-located in each page.tsx

Shared layouts support both user types (e.g., nav, theme, AI)

5. Core Functional Modules

5.1 Dashboard

Entry point for all authenticated users

Displays user-specific overview widgets

Contains embedded AI assistant

5.2 Crowd Commissioning

Users can join open Crowd Projects

Each participant is invoiced separately

Estimate is triggered upon quorum

5.3 Estimates

Clients submit structured estimate requests

Admins respond with scope, pricing, and timeline

Approved estimates automatically generate invoices

5.4 Invoices & Payments

Stripe Checkout handles secure payments

Admins view invoice status and history

Webhooks and CRON jobs automate status tracking and reminders

5.5 Messaging

Real-time chat interface scoped by participation

Powered by Supabase Realtime

Structured as Discord-style conversation views

5.6 AI Copilot

Embedded system for providing smart guidance

Tracks route context and user intent

Delivers inline suggestions and workflow automation prompts

6. Email & Notification System

Invoice reminders triggered after a fixed delay

Handled via scheduled CRON API call

SendGrid used to deliver transactional and automated messages

Notification UI handled in global layout shell

7. Security Enforcement

Supabase RLS applied to all sensitive data tables

Default: users only access their own records

Admins gain override visibility via SQL policy exception

RLS guards: users, projects, estimates, invoices, messages, crowd_*

8. Development Protocol

No file is to be created, modified, or referenced unless predeclared in this document

Any new helper, utility, hook, route, or API handler must be scoped and approved

File tree will be declared and frozen in the next step

Role-based views must remain in shared routes — no structural duplication

Logic should be abstracted into composable components, not duplicated views

No SSR or NextAuth will be used — Supabase client SDK only

