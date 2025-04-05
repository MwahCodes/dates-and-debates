# Swipe and Chat Functionality

## Database Schema

### Swipes Table
```sql
create table public.swipes (
  id uuid not null default extensions.uuid_generate_v4(),
  swiper_id uuid not null,
  swiped_id uuid not null,
  is_like boolean not null,
  created_at timestamp with time zone null default now(),
  constraint swipes_pkey primary key (id),
  constraint swipes_swiper_id_fkey foreign key (swiper_id) references auth.users (id),
  constraint swipes_swiped_id_fkey foreign key (swiped_id) references auth.users (id),
  constraint unique_swipe unique (swiper_id, swiped_id)
);
```

### Matches Table
```sql
create table public.matches (
  id uuid not null default extensions.uuid_generate_v4(),
  user1_id uuid not null,
  user2_id uuid not null,
  created_at timestamp with time zone null default now(),
  constraint matches_pkey primary key (id),
  constraint matches_user1_id_fkey foreign key (user1_id) references auth.users (id),
  constraint matches_user2_id_fkey foreign key (user2_id) references auth.users (id),
  constraint unique_match unique (user1_id, user2_id)
);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS
alter table public.swipes enable row level security;
alter table public.matches enable row level security;

-- Swipes Policies
create policy "Users can view their own swipes"
  on public.swipes for select
  using (auth.uid() = swiper_id);

create policy "Users can create their own swipes"
  on public.swipes for insert
  with check (auth.uid() = swiper_id);

-- Matches Policies
create policy "Users can view their own matches"
  on public.matches for select
  using (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "Users can create matches"
  on public.matches for insert
  with check (auth.uid() = user1_id or auth.uid() = user2_id);
```

## Implementation Details

### Authentication Flow
1. User lands on the welcome page (`/`)
2. User clicks "Get Started" to go to auth page (`/auth`)
3. User can either:
   - Sign in with existing credentials
   - Switch to sign up to create a new account
4. After successful authentication, user is redirected to home page (`/home`)

### Authentication
- Uses Supabase Auth for user authentication
- Protected routes ensure users are logged in
- Auth context manages user state across the application
- Email/password authentication with proper error handling

### Swipe Functionality
1. Users are shown potential matches one at a time
2. Users can swipe left (reject) or right (like)
3. Swipes are recorded in the `swipes` table
4. When two users swipe right on each other, a match is created

### Match Creation Flow
1. User A swipes right on User B
2. System checks if User B has already swiped right on User A
3. If yes, a match is created in the `matches` table
4. Both users can now see each other in their matches list

### Chat Interface
- Shows list of matches with profile pictures
- Displays match date
- Clicking on a match opens the chat interface
- Real-time updates for new matches (future implementation)

## Components

### AuthContext (`lib/auth-context.tsx`)
- Manages authentication state
- Provides sign in, sign up, and sign out functionality
- Handles session persistence

### ProtectedRoute (`components/ProtectedRoute.tsx`)
- Wrapper component for protected pages
- Redirects to login if user is not authenticated
- Shows loading state while checking authentication

### Auth Page (`app/auth/page.tsx`)
- Handles user authentication
- Toggle between sign in and sign up
- Form validation and error handling
- Redirects to home page after successful authentication

### Home Page (`app/home/page.tsx`)
- Displays swipeable cards
- Handles swipe actions
- Records swipes in database
- Creates matches when mutual likes occur

### Chat Page (`app/chat/page.tsx`)
- Shows list of matches
- Displays match information
- Handles match selection
- Prepares for chat implementation

## Environment Variables
Required environment variables in `.env`:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Future Enhancements
1. Real-time chat implementation using Supabase Realtime
2. Push notifications for new matches and messages
3. Profile picture upload and management
4. Enhanced user profiles with more information
5. Match suggestions based on user preferences
6. Chat message persistence
7. Read receipts and typing indicators
8. Media sharing in chat
9. Match expiration or unmatch functionality
10. User blocking and reporting features

## Best Practices
1. Always use RLS policies for data security
2. Implement proper error handling
3. Use TypeScript for type safety
4. Follow mobile-first design principles
5. Implement proper loading states
6. Handle offline scenarios
7. Optimize database queries
8. Implement proper data validation
9. Use proper state management
10. Follow accessibility guidelines 