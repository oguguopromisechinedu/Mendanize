# Mendanize

Mendanize is an AI media and education platform for creating, publishing, and growing content with subscribers, premium resources, and AI-assisted workflows.

## Final Tech Stack

- Frontend: Next.js, Tailwind CSS, shadcn/ui
- Backend: Supabase, PostgreSQL
- AI: OpenAI API for AI writing and content generation

## Project Goals

- Publish high-quality AI-assisted media and educational content
- Support premium content and subscriber experiences
- Create a scalable platform for AI resources and learning products

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env.local
```

3. Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 to view the app.

## Environment Variables

Make sure these are configured:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- OPENAI_API_KEY
- DATABASE_URL
- NEXTAUTH_SECRET

## Architecture Notes

- Supabase handles app data and real-time features.
- PostgreSQL is the primary relational database layer.
- OpenAI powers AI writing and generation features.
- Next.js + Tailwind + shadcn/ui provide the modern frontend foundation.
