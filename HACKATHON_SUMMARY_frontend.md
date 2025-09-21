# InsightSprout — Hackathon Summary

## Elevator Pitch
InsightSprout is an AI-powered chat assistant that analyzes user prompts and uploaded files (PDFs, Office docs, code, images, audio) to deliver fast, structured insights with streaming responses. Built for rapid demos and real-world use, it pairs a sleek React UI with a backend AI agent over SSE.

## Problem
Teams waste time context-switching across tools to extract insights from mixed-format data. Typical chatbots don’t handle uploads well, don’t stream reliably, and lack an opinionated UX for analysis workflows.

## Our Solution
- Unified chat that accepts text + multi-file uploads and streams back responses.
- Clean, responsive UI focused on readability and exportability of results.
- Lightweight session management so users can resume or reset easily.

## What We Built During the Hackathon
- End-to-end chat flow with streaming (SSE) from an AI agent backend.
- File ingestion with client-side validation for common docs, code, images, and audio.
- Persisted sessions and message history in local storage.
- Export final AI responses to Markdown for easy sharing.
- Polished UI using Tailwind + shadcn-ui with an Archivo font theme.

## How It Works (Architecture)
- Frontend: Vite + React (TypeScript), Tailwind, shadcn-ui, React Router, TanStack Query.
- Backend (pluggable): An AI agent server that supports:
  - Session lifecycle: `POST/DELETE /apps/:app/users/:user/sessions/:session` (see `src/services/sessionService.ts`).
  - Chat streaming SSE endpoint: `POST /run_sse` (see `src/services/chatService.ts`).
- Streaming: The client listens to `text/event-stream` messages, incrementally renders content, and gracefully finalizes on `[DONE]`.

## Key Features
- Streaming responses with partial rendering for fast feedback.
- Multi-format file support (docs, spreadsheets, presentations, images, audio, and popular code types).
- Message export to Markdown, suitable for reports or notes.
- Local session persistence and easy session termination.
- Elegant, accessible UI components with dark, glassy aesthetic.

## Differentiators
- Production-ready UX (export, previews, states) with minimal complexity.
- Broad file-type coverage out of the box with clear validation messages.
- Developer-friendly, pluggable backend via a single `BASE_URL` config.

## Demo Flow
1. Start a session (auto-generated IDs) and land on the chat.
2. Type a question and/or drop files into the input area.
3. Watch streaming responses update in place.
4. Preview or export the final answers to Markdown.
5. End the session to clear local data.

## Setup (Local)
Prerequisites: Node.js 18+

1. Install deps: `npm install`
2. Point `BASE_URL` to your backend:
   - Chat SSE: `src/services/chatService.ts` (constant `BASE_URL`)
   - Sessions: `src/services/sessionService.ts` (constant `BASE_URL` and `APP_NAME`)
3. Run dev server: `npm run dev`
4. Build for prod: `npm run build` → deploy `dist/`

## Tech Stack
- React 18 + TypeScript, Vite
- Tailwind CSS, shadcn-ui (Radix primitives)
- React Router, TanStack Query

## Challenges & Learnings
- SSE parsing and robust line-buffering for partial events.
- Normalizing a wide range of file types (MIME vs extension fallbacks).
- Striking a balance between visual polish and hackathon velocity.

## What’s Next
- Authentication and multi-user history.
- Better file previews and server-side parsing/embedding.
- Tool/function-calling UI to confirm structured actions.
- Observability: token usage, latency, and cost dashboards.
- Model/agent selection in-app.

## Impact
InsightSprout reduces time-to-insight for teams reviewing messy, multi-format inputs. In a hackathon setting, it’s demo-ready, easy to deploy, and showcases practical AI-assisted analysis with strong UX.

