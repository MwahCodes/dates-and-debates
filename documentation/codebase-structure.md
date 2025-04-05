# Codebase Structure and Functionality

## Project Overview
This is a Next.js 15 application that implements a dating and debate platform. The application uses Supabase for authentication and database management, with a focus on user profiles and matching functionality.

## Directory Structure

```
├── app/                    # Next.js app directory (App Router)
│   ├── login/             # Login page
│   ├── home/              # Main feed page
│   ├── profile/           # User profile page
│   ├── profile-setup/     # Initial profile setup
│   └── page.tsx           # Welcome/landing page
├── components/            # Reusable UI components
│   ├── ui/               # Shadcn UI components
│   ├── ProtectedRoute.tsx # Route protection component
│   ├── ClientLayout.tsx   # Client-side layout wrapper
│   ├── BottomNavigation.tsx # Bottom navigation bar
│   └── SwipeableCard.tsx # Swipeable card component
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context
└── documentation/        # Project documentation
```

## Core Features

### Authentication System
- Implemented using Supabase Auth
- Protected routes using `ProtectedRoute` component
- Session management through `AuthContext`
- Secure sign-in/sign-out functionality

### User Flow
1. Welcome Page (`/`)
   - Displays platform rules and terms
   - "I Agree" button redirects to login

2. Login Page (`/login`)
   - Email/password authentication
   - Profile check after login
   - Redirects to profile setup if no profile exists

3. Profile Setup (`/profile-setup`)
   - Required for new users
   - Collects user information:
     - Name
     - Birthday
     - Education level
     - Height
     - Weight
     - MBTI type
   - Redirects to home after completion

4. Home Page (`/home`)
   - Protected route
   - Displays potential matches
   - Swipe functionality
   - Match creation

### Key Components

#### AuthContext
```typescript
type AuthContextType = {
  user: any | null;        // Current authenticated user
  supabase: typeof supabase; // Supabase client
  signOut: () => Promise<void>; // Sign out function
  isLoading: boolean;      // Loading state
};
```
- Manages authentication state
- Provides Supabase client instance
- Handles session persistence
- Controls loading states

#### ProtectedRoute
- Wrapper component for protected pages
- Redirects unauthenticated users to login
- Shows loading state during auth check
- Allows access to public routes

#### ClientLayout
- Handles layout structure
- Manages bottom navigation visibility
- Controls header visibility
- Wraps all pages except root

#### SwipeableCard
- Implements swipe functionality
- Handles touch and mouse events
- Provides visual feedback during swipes
- Manages card animations

## Authentication Flow

1. User lands on welcome page
2. Clicks "I Agree" → redirects to login
3. Enters credentials
4. System checks for existing profile
   - If no profile → redirects to profile setup
   - If profile exists → redirects to home
5. Protected routes maintain session

## Security Measures

1. Route Protection
   - All sensitive routes wrapped in `ProtectedRoute`
   - Automatic redirects for unauthenticated users

2. Session Management
   - Persistent sessions through Supabase
   - Automatic session checks
   - Secure sign-out process

3. Data Protection
   - Supabase Row Level Security (RLS)
   - Protected database queries
   - Secure authentication flow

## Best Practices Implemented

1. Type Safety
   - TypeScript throughout the codebase
   - Proper type definitions for context
   - Type checking for props and state

2. Error Handling
   - Graceful error states
   - User-friendly error messages
   - Loading states for async operations

3. Code Organization
   - Clear directory structure
   - Separation of concerns
   - Reusable components
   - Context-based state management

4. Performance
   - Client-side routing
   - Optimized loading states
   - Efficient state updates

## Environment Requirements

Required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Development Guidelines

1. Always use TypeScript
2. Follow the established directory structure
3. Use context for global state
4. Implement proper error handling
5. Add loading states for async operations
6. Protect sensitive routes
7. Follow the authentication flow
8. Maintain consistent styling
9. Document new features
10. Test thoroughly before deployment 