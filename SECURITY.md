# Security Policy & Secret Hygiene

## Environment Variables & Secrets
- **Never commit secret keys**: All API keys, service role credentials, and private tokens MUST remain strictly in `.env` (which is listed in `.gitignore`) or Cloud Secret Manager.
- **`.env.example` placeholder rule**: `.env.example` must contain ONLY fake placeholders (e.g. `VITE_SUPABASE_ANON_KEY="your-anon-key-here"`), never real production keys.
- **Firebase Config**: `firebase-applet-config.json` contains public web SDK identifiers (`apiKey`, `projectId`, `appId`). Server administrative keys or service account credentials must NEVER be placed in client config files.

## Database & Security Rules
- **Firestore Security Rules**: Managed via `firestore.rules`.
  - All write operations require authentication and role verification (`isAdmin()` or `isContributor()`).
  - Read access is allowed for public song listings and Bible lookup.
- **Supabase / PostgreSQL**:
  - The web application strictly uses the public `anon` key client-side.
  - Row Level Security (RLS) is enabled on database tables with `SELECT` policies for public access.

## Reporting Vulnerabilities
If you discover a security issue or credential exposure in this repository, please notify the maintainers immediately.
