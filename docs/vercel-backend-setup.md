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
npm run dev
```

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
