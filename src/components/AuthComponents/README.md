# Authentication UI Components

This directory contains a complete set of authentication UI components for the Astro project. These components provide login, registration, social authentication, and favorites functionality with proper error handling, loading states, and accessibility features.

## Components Overview

### 1. LoginForm.astro
A complete login form component with:
- Email and password fields with validation
- Password visibility toggle
- "Remember me" checkbox  
- "Forgot password" link
- Error handling and display
- Loading states
- Integration with social authentication
- Responsive design with TailwindCSS
- Proper accessibility attributes

**Props:**
- `redirectTo?: string` - URL to redirect to after successful login (default: '/')
- `class?: string` - Additional CSS classes

**Usage:**
```astro
---
import LoginForm from '@components/AuthComponents/LoginForm.astro';
---

<LoginForm redirectTo="/dashboard" />
```

### 2. RegisterForm.astro
A complete registration form component with:
- Email, password, confirm password, and full name fields
- Client-side validation with real-time feedback
- Password strength indicator with visual bars
- Terms of service checkbox
- Error handling and display
- Loading states
- Integration with social authentication
- Responsive design with TailwindCSS
- Proper accessibility attributes

**Props:**
- `redirectTo?: string` - URL to redirect to after successful registration (default: '/')
- `class?: string` - Additional CSS classes

**Usage:**
```astro
---
import RegisterForm from '@components/AuthComponents/RegisterForm.astro';
---

<RegisterForm redirectTo="/welcome" />
```

### 3. SocialAuth.astro
Social authentication component with:
- Google and GitHub login buttons
- Icon integration using astro-icon
- Error handling for OAuth flows
- Loading states with spinners
- Responsive button layout
- Redirect URL preservation

**Props:**
- `redirectTo?: string` - URL to redirect to after successful authentication (default: '/')
- `class?: string` - Additional CSS classes

**Usage:**
```astro
---
import SocialAuth from '@components/AuthComponents/SocialAuth.astro';
---

<SocialAuth redirectTo="/dashboard" />
```

### 4. FavoriteButton.astro
Heart-shaped favorite toggle button with:
- Takes contentType, contentSlug, contentTitle as props
- Shows filled/unfilled heart based on favorite status
- Handles toggle functionality via /api/favorites/toggle
- Shows loading state during API calls
- Only renders if auth is enabled
- Multiple sizes (sm, md, lg)
- Optional labels
- Toast notifications for feedback
- Authentication-aware (redirects to login if not authenticated)

**Props:**
- `contentType: 'prompt' | 'persona' | 'blog'` - Type of content being favorited
- `contentSlug: string` - Unique slug for the content
- `contentTitle: string` - Display title for the content
- `class?: string` - Additional CSS classes
- `size?: 'sm' | 'md' | 'lg'` - Button size (default: 'md')
- `showLabel?: boolean` - Show "Save"/"Saved" text label (default: false)

**Usage:**
```astro
---
import FavoriteButton from '@components/AuthComponents/FavoriteButton.astro';
---

<FavoriteButton 
  contentType="prompt"
  contentSlug="my-awesome-prompt"
  contentTitle="My Awesome Prompt"
  size="md"
  showLabel={true}
/>
```

### 5. AuthButton.astro (Existing)
User authentication status and dropdown menu component that shows different states based on authentication status.

## Feature Flag Integration

All components respect the feature flags defined in `@lib/feature-flags`:

- `FeatureFlags.AUTH_ENABLED` - Controls if authentication features are available
- `FeatureFlags.FAVORITES_ENABLED` - Controls if favorites functionality is available  
- `FeatureFlags.SOCIAL_AUTH_ENABLED` - Controls if social authentication is available

Components will automatically hide or redirect if their required features are disabled.

## API Integration

The components integrate with the following API endpoints:

- `/api/auth/login` - Email/password login
- `/api/auth/register` - User registration
- `/api/auth/social-login` - Social authentication
- `/api/auth/logout` - User logout
- `/api/favorites/toggle` - Toggle favorite status
- `/api/favorites/list` - Get user's favorites

## Styling and Design

All components follow the project's design patterns:

- **TailwindCSS** for styling with consistent color schemes
- **Dark mode support** with proper dark: prefixes
- **Responsive design** that works on mobile and desktop
- **Loading states** with spinners and disabled states
- **Error handling** with accessible error messages
- **Focus management** for keyboard navigation
- **Icon integration** using astro-icon with Boxicons and Simple Icons

## Authentication Pages

The project includes example authentication pages:

- `/auth/login` - Complete login page with LoginForm
- `/auth/register` - Complete registration page with RegisterForm  
- `/auth/demo` - Demo page showcasing all components

## Security Features

- **Input validation** on both client and server side
- **Password strength indicators** with multiple criteria
- **CSRF protection** via proper form handling
- **Redirect validation** to prevent open redirects
- **Rate limiting** considerations in API design
- **Accessibility compliance** with ARIA labels and proper focus management

## Development Notes

1. **Environment Variables**: Authentication requires proper Supabase configuration
2. **Type Safety**: All components use TypeScript with proper type definitions
3. **Testing**: Components include data attributes for testing
4. **Performance**: Components lazy-load and minimize re-renders
5. **Accessibility**: Full keyboard navigation and screen reader support

## Customization

Components can be customized by:

1. **Props**: All components accept custom CSS classes
2. **Styling**: Override TailwindCSS classes or add custom CSS
3. **Content**: Modify text, links, and messaging
4. **Validation**: Extend validation rules in the JavaScript
5. **API**: Modify endpoints or add additional functionality

## Error Handling

All components include comprehensive error handling:

- **Network errors** with user-friendly messages
- **Validation errors** with field-specific feedback
- **Authentication errors** with clear explanations
- **Loading states** to prevent user confusion
- **Toast notifications** for action feedback

## Browser Support

Components support modern browsers with:

- **ES2020+** JavaScript features
- **CSS Grid and Flexbox** for layouts  
- **CSS Custom Properties** for theming
- **Progressive enhancement** for accessibility
- **Graceful degradation** for older browsers