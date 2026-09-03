# Map My Meal

A React map app backed by Supabase. The project uses Vite for local development
and production builds.

## Local setup

1. Install a current Node.js LTS release.
2. Install dependencies:

   ```powershell
   npm install
   ```

3. Create your local environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Add the Supabase project URL and anon key to `.env`.
5. Start the app:

   ```powershell
   npm run dev
   ```

`npm start` is kept as an alias for the same command.

## Production build

```powershell
npm run build
npm run preview
```

Vite writes the deployable site to `dist`. The existing `public/_redirects`
file is copied into the build so client-side routes continue to work on
Netlify.

## Supabase configuration

The old Create React App variable names have been replaced with Vite names:

```text
REACT_APP_SUPABASE_URL -> VITE_SUPABASE_URL
REACT_APP_ANON_KEY     -> VITE_SUPABASE_ANON_KEY
```

Add both the local app URL and deployed app URL to the allowed redirect URLs in
Supabase Authentication settings. The sign-up and password-reset flows use the
current site origin automatically.
