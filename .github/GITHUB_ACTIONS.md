# GitHub Actions Configuration

## Required Secrets

To run the CI/CD workflows successfully, you need to configure the following secrets in your GitHub repository:

### How to Add Secrets

1. Go to your GitHub repository
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each of the secrets below

### Required Secrets List

#### `PUBLIC_SUPABASE_URL`
- **Description**: Your Supabase project URL
- **Example**: `https://your-project-id.supabase.co`
- **Where to find**: Supabase Dashboard → Project Settings → API

#### `PUBLIC_SUPABASE_ANON_KEY`
- **Description**: Your Supabase anonymous (public) key
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Where to find**: Supabase Dashboard → Project Settings → API → anon/public key

## Workflows

### `build.yml`
- Triggers on: Push to `main` branch
- Runs: Unit tests and build
- Requires: Supabase secrets
- Creates `.env` file from secrets before running tests and build

### `test.yml`
- Triggers on: Push/PR to `main` or `develop` branches
- Runs: Unit tests and E2E tests
- Requires: Supabase secrets
- Creates `.env` file for unit tests and `.env.test` file for E2E tests from secrets

## Local Development

For local E2E testing, create a `.env.test` file in the project root:

```bash
# .env.test
PUBLIC_SUPABASE_URL=http://localhost:54321
PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
BASE_URL=http://localhost:3000
```

**Note**: The `.env.test` file is gitignored and should never be committed to the repository.

## Troubleshooting

### "Missing Supabase URL" Error
- Ensure `PUBLIC_SUPABASE_URL` secret is set in GitHub
- Verify the secret name matches exactly (case-sensitive)
- Check that the secret is available to the workflow

### "Missing Supabase anon key" Error
- Ensure `PUBLIC_SUPABASE_ANON_KEY` secret is set in GitHub
- Verify the secret name matches exactly (case-sensitive)
- Make sure you're using the anon/public key, not the service key

### E2E Tests Timeout
- Check if the Supabase URL is accessible from GitHub Actions runners
- Verify your Supabase project is not paused
- Consider using a dedicated test environment for CI

