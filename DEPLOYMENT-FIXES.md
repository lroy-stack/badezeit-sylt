# Deployment Fixes - Preview Errors Resolution

## Issues Identified and Fixed

### 1. Prisma Version and Binaries (CRITICAL)
**Problem**: Prisma 6.14.0 was experiencing 403 Forbidden errors when downloading binaries during deployment.

**Solution**:
- Updated `@prisma/client` and `prisma` from `6.14.0` to `6.19.0`
- Added `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1` to Vercel configuration as fallback
- This ensures Prisma can generate properly during Vercel builds

**Files Modified**:
- `package.json` - Updated Prisma versions
- `vercel.json` - Added environment variables for build

### 2. Unused Clerk Dependency (OPTIMIZATION)
**Problem**: `@clerk/nextjs` was listed in dependencies but the project uses Supabase for authentication, not Clerk.

**Solution**:
- Removed `@clerk/nextjs` from dependencies
- Removed obsolete `src/middleware/prod.ts` that referenced Clerk
- The project correctly uses Supabase authentication via `src/proxy.ts`

**Files Modified**:
- `package.json` - Removed @clerk/nextjs dependency
- `src/middleware/prod.ts` - Deleted (unused Clerk middleware)

### 3. Vercel Configuration (NEW)
**Problem**: No Vercel-specific configuration existed to handle deployment nuances.

**Solution**:
- Created `vercel.json` with proper build commands and environment variables
- Added timeout configuration for API functions
- Configured environment variables for Prisma

**Files Created**:
- `vercel.json` - New Vercel deployment configuration

## Required Environment Variables for Vercel

Configure these in your Vercel project settings under **Settings → Environment Variables**:

### Database (Required)
```
DATABASE_URL=postgresql://username:password@your-supabase-host:5432/postgres
DIRECT_URL=postgresql://username:password@your-supabase-host:5432/postgres
```

### Supabase Authentication (Required)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Email Service - Resend (Required)
```
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### Application URLs (Required)
```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_SITE_NAME=Badezeit Sylt
NODE_ENV=production
```

### Restaurant Information (Optional)
```
RESTAURANT_EMAIL=info@badezeit-sylt.de
RESTAURANT_PHONE=+49 4651 123456
RESTAURANT_ADDRESS=Strandstraße 1, 25980 Sylt, Deutschland
```

### Build-time Variables (Already in vercel.json)
```
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
SKIP_ENV_VALIDATION=1
```

## Deployment Steps

1. **Install updated dependencies**:
   ```bash
   npm install
   ```

2. **Configure Vercel Environment Variables**:
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add all required variables listed above
   - Apply to: Production, Preview, and Development environments

3. **Deploy**:
   ```bash
   git push origin main
   ```
   Or trigger a new deployment in Vercel dashboard

4. **Verify Database Connection**:
   - Ensure your Supabase database is accessible from Vercel
   - Check that `DATABASE_URL` and `DIRECT_URL` are correct
   - Prisma will automatically run migrations during build

## Architecture Notes

- **Authentication**: Supabase (NOT Clerk)
- **Database**: PostgreSQL via Supabase
- **Middleware**: Next.js 16 `proxy.ts` convention (not `middleware.ts`)
- **ORM**: Prisma 6.19.0
- **Email**: Resend API
- **Framework**: Next.js 16.0.1 with React 19

## Troubleshooting

### Build Fails with Prisma Errors
- Verify `DATABASE_URL` is set in Vercel environment variables
- Check that `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1` is in vercel.json
- Review build logs for specific Prisma error messages

### Authentication Not Working
- Confirm `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Verify Supabase project is active and accessible
- Check Supabase Auth settings allow your domain

### Email Sending Fails
- Verify `RESEND_API_KEY` is valid and active
- Check `RESEND_FROM_EMAIL` is verified in Resend dashboard
- Review Resend API logs for errors

### Preview Deployments Fail
- Ensure environment variables are applied to "Preview" environment in Vercel
- Check that branch protection rules aren't blocking deployments
- Review Vercel deployment logs for specific errors

## Files Modified in This Fix

1. ✅ `package.json` - Updated Prisma, removed Clerk
2. ✅ `vercel.json` - Created with deployment config
3. ✅ `src/middleware/prod.ts` - Deleted (obsolete Clerk middleware)
4. ✅ `DEPLOYMENT-FIXES.md` - This documentation

## Next Steps

After deploying with these fixes:

1. Test authentication flow (login/logout)
2. Verify database connections work
3. Test reservation creation
4. Check email sending functionality
5. Review Vercel function logs for any runtime errors

## Support

If issues persist after applying these fixes:

1. Check Vercel deployment logs: `vercel logs <deployment-url>`
2. Review Supabase logs for authentication issues
3. Verify all environment variables are set correctly
4. Check this repository's issues for similar problems
