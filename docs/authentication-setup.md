# Authentication Setup Guide

This guide provides comprehensive instructions for setting up user authentication in the AI Prompt Directory application using Supabase.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Database Configuration](#database-configuration)
4. [Environment Variables](#environment-variables)
5. [Local Development Setup](#local-development-setup)
6. [Production Deployment](#production-deployment)
7. [Testing Authentication](#testing-authentication)
8. [Troubleshooting](#troubleshooting)
9. [Security Considerations](#security-considerations)

## Prerequisites

Before setting up authentication, ensure you have:

- Node.js 18+ or 20+
- pnpm (recommended) or npm
- A Supabase account (free tier available)
- Basic understanding of environment variables
- Access to your deployment platform (Netlify, Vercel, etc.)

## Supabase Project Setup

### 1. Create a Supabase Project

1. Visit [Supabase Dashboard](https://app.supabase.com/)
2. Click "New project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `ai-prompt-directory` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be provisioned (2-3 minutes)

### 2. Get Project Credentials

Once your project is ready:

1. Go to **Settings** → **API**
2. Note down these values (you'll need them for environment variables):
   - **Project URL** (e.g., `https://xyzcompany.supabase.co`)
   - **Project API Keys** → **anon public** key
   - **Project API Keys** → **service_role** key (keep this secret!)

### 3. Configure Authentication Providers

#### Email/Password Authentication (Default)
This is enabled by default. No additional configuration needed.

#### Social Authentication (Optional)
To enable social logins (Google, GitHub, Discord, Twitter):

1. Go to **Authentication** → **Providers**
2. Click on the provider you want to enable
3. Toggle "Enable sign in with [Provider]"
4. Configure OAuth credentials:

**For Google:**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create OAuth 2.0 credentials
- Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
- Copy Client ID and Client Secret to Supabase

**For GitHub:**
- Go to GitHub Settings → Developer settings → OAuth Apps
- Create new OAuth App
- Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`
- Copy Client ID and Client Secret to Supabase

## Database Configuration

### 1. Create User Profiles Table

Run this SQL in the Supabase SQL Editor:

```sql
-- Create user profiles table
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    display_name TEXT,
    bio TEXT,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. Create User Favorites Table

```sql
-- Create user favorites table
CREATE TABLE user_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('prompt', 'persona', 'blog')),
    content_slug TEXT NOT NULL,
    content_title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_content ON user_favorites(content_type, content_slug);
CREATE UNIQUE INDEX idx_user_favorites_unique ON user_favorites(user_id, content_type, content_slug);

-- Enable RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for user favorites
CREATE POLICY "Users can view their own favorites" ON user_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own favorites" ON user_favorites
    FOR ALL USING (auth.uid() = user_id);

-- Create database functions for favorites operations
CREATE OR REPLACE FUNCTION add_to_favorites(
    p_content_type TEXT,
    p_content_slug TEXT,
    p_content_title TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    INSERT INTO user_favorites (user_id, content_type, content_slug, content_title)
    VALUES (auth.uid(), p_content_type, p_content_slug, p_content_title)
    ON CONFLICT (user_id, content_type, content_slug) DO NOTHING;
    
    result := json_build_object('success', true, 'message', 'Added to favorites');
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    result := json_build_object('success', false, 'error', SQLERRM);
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION remove_from_favorites(
    p_content_type TEXT,
    p_content_slug TEXT
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    DELETE FROM user_favorites 
    WHERE user_id = auth.uid() 
    AND content_type = p_content_type 
    AND content_slug = p_content_slug;
    
    result := json_build_object('success', true, 'message', 'Removed from favorites');
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    result := json_build_object('success', false, 'error', SQLERRM);
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_favorited(
    p_content_type TEXT,
    p_content_slug TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_favorites 
        WHERE user_id = auth.uid() 
        AND content_type = p_content_type 
        AND content_slug = p_content_slug
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_favorites(
    p_content_type TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    content_type TEXT,
    content_slug TEXT,
    content_title TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        uf.id,
        uf.content_type,
        uf.content_slug,
        uf.content_title,
        uf.created_at
    FROM user_favorites uf
    WHERE uf.user_id = auth.uid()
    AND (p_content_type IS NULL OR uf.content_type = p_content_type)
    ORDER BY uf.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. Configure Email Templates (Optional)

Customize authentication emails:

1. Go to **Authentication** → **Email Templates**
2. Customize templates for:
   - Confirm signup
   - Magic Link
   - Change email address
   - Reset password

## Environment Variables

Create or update your `.env` file in the project root:

```bash
# Authentication Feature Flag
ENABLE_USER_AUTH=true

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Site URL for redirects
SITE_URL=http://localhost:4321

# Development
NODE_ENV=development
```

### Environment Variable Descriptions

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `ENABLE_USER_AUTH` | Enable/disable authentication features | Yes | `true` |
| `SUPABASE_URL` | Your Supabase project URL | Yes | `https://abc123.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anonymous public key | Yes | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) | No | `eyJhbGci...` |
| `SITE_URL` | Your site's URL for redirects | No | `https://yoursite.com` |

## Local Development Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

1. Copy `.env.example` to `.env` (if available)
2. Update environment variables with your Supabase credentials
3. Ensure `ENABLE_USER_AUTH=true`

### 3. Run Development Server

```bash
pnpm dev
```

### 4. Test Authentication

1. Visit `http://localhost:4321`
2. Navigate to `/auth/register` to create a test account
3. Check Supabase dashboard for new user and profile

## Production Deployment

### Netlify Deployment

1. **Set Environment Variables** in Netlify dashboard:
   - Go to Site settings → Environment variables
   - Add all required environment variables
   - Update `SITE_URL` to your production domain

2. **Configure Redirects** (optional):
   Create `public/_redirects` file:
   ```
   /auth/callback /auth/callback 200
   /api/* /.netlify/functions/:splat 200
   ```

3. **Deploy**:
   ```bash
   pnpm build
   ```

### Vercel Deployment

1. **Set Environment Variables** in Vercel dashboard
2. **Configure** `vercel.json` (if needed):
   ```json
   {
     "functions": {
       "src/pages/api/**/*.ts": {
         "runtime": "nodejs18.x"
       }
     }
   }
   ```

### Other Platforms

For other platforms, ensure:
- Environment variables are set
- Build command: `pnpm build`
- Publish directory: `dist/`
- Node.js version: 18+

## Testing Authentication

### Manual Testing Checklist

- [ ] User registration works
- [ ] Email confirmation (if enabled)
- [ ] User login works
- [ ] Password reset works
- [ ] Social login works (if configured)
- [ ] User profile creation/update works
- [ ] Favorites functionality works
- [ ] User logout works
- [ ] Protected routes redirect to login

### Automated Testing

Run the authentication test suite:

```bash
# Run all tests
pnpm test

# Run auth-specific tests
pnpm test:auth

# Run tests in watch mode
pnpm test:watch
```

### Test User Accounts

Create test accounts for different scenarios:
- Regular user account
- Admin account (if implemented)
- Account with social login
- Account with no profile data

## Troubleshooting

### Common Issues

#### 1. "Authentication is disabled" Error
**Cause**: `ENABLE_USER_AUTH` not set to `'true'`
**Solution**: Check environment variables, ensure exact string `'true'`

#### 2. "Missing Supabase environment variables" Error
**Cause**: Missing or incorrect Supabase credentials
**Solution**: 
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Check for typos in variable names
- Ensure variables are available in your environment

#### 3. Social Login Not Working
**Cause**: OAuth provider not configured correctly
**Solution**:
- Check OAuth app configuration
- Verify redirect URLs match exactly
- Ensure provider is enabled in Supabase

#### 4. Database Errors
**Cause**: Missing tables or incorrect RLS policies
**Solution**:
- Run database setup scripts again
- Check RLS policies are correct
- Verify user has proper permissions

#### 5. Email Not Sending
**Cause**: Email service configuration
**Solution**:
- Check Supabase email settings
- Verify domain configuration
- Check spam folder

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

This will log feature flags and authentication states to the console.

### Testing Connection

Run the connection test:
```bash
# Test Supabase connection
node src/lib/test-supabase-connection.js
```

## Security Considerations

### Best Practices

1. **Environment Variables**:
   - Never commit `.env` files to version control
   - Use different keys for development and production
   - Rotate keys periodically

2. **Row Level Security (RLS)**:
   - Always enable RLS on user data tables
   - Test policies thoroughly
   - Follow principle of least privilege

3. **Input Validation**:
   - Validate all user inputs
   - Sanitize data before database operations
   - Use TypeScript for type safety

4. **Password Security**:
   - Enforce strong password requirements
   - Use Supabase's built-in password hashing
   - Implement password reset functionality

5. **Session Management**:
   - Use secure session storage
   - Implement proper logout
   - Handle session expiration gracefully

### Security Headers

Ensure your deployment includes security headers:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

### Monitoring

Monitor authentication events:
- Failed login attempts
- Unusual access patterns
- Database query performance
- Error rates

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Astro Authentication Guide](https://docs.astro.build/en/tutorial/6-islands/2/)

## Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review Supabase logs in the dashboard
3. Check browser developer console for errors
4. Consult the [project repository issues](https://github.com/your-repo/issues)
5. Create a new issue with detailed error information

---

Last updated: January 2025
Version: 1.0.0