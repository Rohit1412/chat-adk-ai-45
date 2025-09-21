# InsightSprout — AI Chat Assistant

Interactive AI chat application with streaming responses, file uploads, and a clean React UI.

## Features

- Streaming chat with SSE-based updates
- Upload and analyze many file types (PDF, images, Office docs, code, audio)
- Session setup and persistence in browser storage
- Modern, responsive UI with shadcn-ui + Tailwind CSS
- TypeScript-first, Vite-powered development

## Tech Stack

- Vite, React 18, TypeScript
- Tailwind CSS, shadcn-ui, Radix Primitives
- React Router, TanStack Query

## Getting Started

Prerequisites:
- Node.js 18+ and npm

Install and run:
```bash
npm install
npm run dev
```

Build and preview production bundle:
```bash
npm run build
npm run preview
```

## Configuration

Backend endpoint:
- The chat API base URL is defined in `src/services/chatService.ts:16` as `BASE_URL`.
- Update it to point to your backend (e.g., your ADK/agent server) and ensure CORS is allowed.

File support:
- The app validates and sends many common types. See `src/services/chatService.ts` for the full list and size limits.

## Project Structure

- `src/App.tsx` — application shell and routing
- `src/pages/` — views like `AgentInfo`, `Index`, `NotFound`
- `src/components/` — chat UI, inputs, and shared UI components
- `src/services/` — chat and session services
- `public/` — static assets (favicon, placeholder image)

## Scripts

- `npm run dev` — start dev server
- `npm run build` — build for production
- `npm run preview` — preview built app
- `npm run lint` — run ESLint

## Deployment

This is a static frontend app. Deploy the `dist/` folder to any static host (Vercel, Netlify, Cloudflare Pages, S3, etc.). Ensure:
- `BASE_URL` points to a reachable backend over HTTPS
- Your backend allows CORS from your deployed origin

## Notes

- Update `index.html` meta tags (title/description/images) to match your branding. A generic `/placeholder.svg` image is provided.
- If you change ports or hosting, review `vite.config.ts` dev server settings.

## License

Proprietary or as defined by the repository owner.
