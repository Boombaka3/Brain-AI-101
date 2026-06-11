# Vercel Backend Setup

## Required environment variables

- `DATABASE_URL`
- `ADMIN_READ_TOKEN`

## Local setup

```bash
npm install
npm run prisma:generate
npx prisma migrate dev
npm run prisma:seed
npm run dev:full
```

`npm run dev` starts the Vite frontend only. Use `npm run dev:full` when you need Vercel Functions locally, including certificate generation and admin/backend API testing.

## Production deploy on Vercel

1. Create a PostgreSQL database.
2. Add `DATABASE_URL` and `ADMIN_READ_TOKEN` in the Vercel project settings.
3. Deploy the repo.
4. Run Prisma migrations against production:

```bash
npx prisma migrate deploy
```

5. Seed quiz/module data if needed:

```bash
npm run prisma:seed
```

## Admin dashboard

- Open the landing page.
- Click `Admin data access`.
- Paste the same token value used in `ADMIN_READ_TOKEN`.
- The dashboard can view stored submissions and export both CSV files.

## Certificate generation

- The completion-page certificate generator depends on the backend route `/api/certificate/generate`.
- It works on the Vercel deployment and in local development with `npm run dev:full`.
- It does not work on static-only deployments such as GitHub Pages because those do not run Vercel Functions.
- The generated certificate downloads as a PDF.
