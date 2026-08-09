# CI/CD Setup Guide

This document explains the CI/CD infrastructure for the Lumio App Web project.

## GitHub Actions Workflows

### 1. CI Workflow (.github/workflows/ci.yml)
Runs on every push and pull request to main/develop branches:
- **Lint & Test**: Runs ESLint and Vitest tests
- **Type Check**: Validates TypeScript types
- **Build Check**: Verifies the production build succeeds

### 2. Deploy Preview Workflow (.github/workflows/deploy-preview.yml)
Creates preview deployments for pull requests:
- Deploys to Vercel preview environment
- Comments PR with preview URL
- Automatically updates on new commits

### 3. Deploy Production Workflow (.github/workflows/deploy-production.yml)
Deploys to production on main branch pushes:
- Runs tests and linting first
- Deploys to Vercel production
- Comments deployment status on commit

## Required GitHub Secrets

Configure these secrets in your GitHub repository settings:

### For CI/CD:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth.js secret key
- `NEXTAUTH_URL` - Application URL

### For Vercel Deployments:
- `VERCEL_TOKEN` - Vercel authentication token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

### Optional:
- `CODECOV_TOKEN` - For coverage reports on Codecov

## Getting Vercel Credentials

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Link project: `vercel link`
4. Get credentials:
   ```bash
   vercel login
   vercel link
   cat .vercel/project.json
   ```

The `project.json` file contains your `orgId` and `projectId`.

## Vercel Configuration

The `vercel.json` file includes:
- Build and dev commands
- Environment variable definitions
- Security headers
- Caching rules
- Cron jobs setup

## Local Development Scripts

- `npm run ci` - Run all CI checks locally
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Generate coverage report

## Code Quality Tools

### ESLint
- Configured in `.eslintrc.json`
- Extends Next.js recommended rules
- Integrates with Prettier
- Runs in CI pipeline

### Prettier
- Configured in `.prettierrc`
- Consistent code formatting
- Pre-commit hooks recommended

### Vitest
- Unit testing framework
- Coverage reporting with @vitest/coverage-v8
- Configured for Next.js + TypeScript

## Deployment Process

### Preview Deployments
1. Create/Update PR
2. Workflow triggers automatically
3. Preview URL posted as PR comment
4. Live preview updates with commits

### Production Deployments
1. Push to main branch
2. CI checks run (tests, lint, type-check, build)
3. If checks pass, deployment to Vercel production
4. Deployment status commented on commit

## Troubleshooting

### CI Failures
- Check the Actions tab in GitHub
- Review logs for specific error messages
- Run `npm run ci` locally to reproduce

### Vercel Deployment Issues
- Verify environment variables in Vercel dashboard
- Check build logs in Vercel
- Ensure `vercel.json` configuration is correct

### Database Connection
- Verify `DATABASE_URL` format
- Check SSL requirements in `DATABASE_URL`
- Test connection locally first

## Best Practices

1. **Always run CI locally**: `npm run ci` before pushing
2. **Keep dependencies updated**: Regularly run `npm audit`
3. **Monitor coverage**: Aim for >80% coverage on critical paths
4. **Review preview deployments**: Check preview URLs before merging
5. **Use feature branches**: Create branches for new features
6. **Write tests for new code**: Maintain test coverage

## Security Considerations

- Never commit secrets to repository
- Use GitHub Secrets for sensitive data
- Rotate tokens regularly
- Enable branch protection on main
- Require status checks before merging
- Review dependency updates for vulnerabilities
