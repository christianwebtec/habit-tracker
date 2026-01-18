# Habit Tracker - Competitive Accountability App

A competitive habit-tracking app focused on points, streaks, and social accountability. Track workouts and alcohol consumption, compete with friends on real-time leaderboards.

## Features

✅ **Daily Check-In**: One-tap logging for workouts (+1) and alcohol (-1)  
✅ **Points System**: Total, weekly, and monthly points with negative scores allowed  
✅ **Dual Streaks**: Independent workout and clean streaks  
✅ **Social Groups**: Create/join groups with invite codes  
✅ **Real-Time Leaderboards**: Weekly, monthly, and all-time rankings  
✅ **Dark Mode**: Premium glassmorphism design  
✅ **Mobile-First**: Optimized for sub-3-second logging

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS + Custom Design System
- **Animations**: Framer Motion
- **Backend**: Supabase (PostgreSQL + Real-time + Auth)
- **Deployment**: Vercel

## Setup Instructions

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Project Settings** → **API**
3. Copy your **Project URL** and **anon public** key
4. Go to **SQL Editor** and run the migrations:
   - Run `supabase/migrations/001_initial_schema.sql`
   - Run `supabase/migrations/002_functions_and_views.sql`

### 2. Environment Variables

Update `.env.local` with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Install & Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### 4. Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Database Schema

### Tables

- **users**: User profiles (username, avatar)
- **daily_logs**: Daily check-ins (workout, alcohol, net_points)
- **groups**: Competition groups (name, invite_code)
- **group_memberships**: User-group relationships

### Key Features

- Row Level Security (RLS) enabled on all tables
- Real-time subscriptions for live leaderboard updates
- Automatic triggers for group membership and timestamps
- Optimized indexes for fast queries

## Usage

### Sign Up / Sign In
- Create an account with email and password
- Choose a username (or use email prefix)

### Daily Logging
- Tap "Worked Out" to add +1 point
- Tap "Drank Alcohol" to subtract -1 point
- Can log both on the same day
- Only today's log is editable

### Groups
- **Create**: Start a new group, get a 6-character invite code
- **Join**: Enter a friend's invite code to join their group
- **Compete**: View real-time leaderboards (weekly/monthly/all-time)

### Streaks
- **Workout Streak**: Consecutive days with workouts
- **Clean Streak**: Consecutive days without alcohol
- Streaks reset independently

## Project Structure

```
habit-tracker/
├── src/
│   ├── app/
│   │   ├── dashboard/          # Main dashboard
│   │   ├── groups/             # Group management
│   │   │   ├── new/            # Create/join groups
│   │   │   └── [id]/           # Group leaderboard
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing/auth page
│   │   └── globals.css         # Design system
│   ├── components/
│   │   ├── AuthForm.tsx        # Sign in/up form
│   │   ├── DailyCheckIn.tsx    # Daily logging UI
│   │   ├── Leaderboard.tsx     # Leaderboard component
│   │   └── StatsCard.tsx       # Stats display
│   └── lib/
│       ├── supabase/           # Supabase clients
│       ├── calculations.ts     # Points & streak logic
│       └── types.ts            # TypeScript interfaces
├── supabase/
│   └── migrations/             # Database migrations
└── package.json
```

## Design Philosophy

- **Scoreboard, not wellness app**: Competitive and addictive
- **Frictionless logging**: Under 3 seconds from tap to confirmation
- **No clutter**: No motivational quotes, no health advice
- **Premium aesthetics**: Dark mode, glassmorphism, smooth animations
- **Real-time**: Live leaderboard updates via Supabase subscriptions

## License

MIT
