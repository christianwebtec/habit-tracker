# Habit Tracker - Quick Setup Guide

## 🚀 Next Steps

Your habit tracker app is built! Here's what you need to do to get it running:

### 1. Set Up Supabase (5 minutes)

1. **Create a Supabase project**:
   - Go to https://supabase.com
   - Click "New Project"
   - Choose a name, database password, and region
   - Wait for the project to be created (~2 minutes)

2. **Get your credentials**:
   - Go to **Project Settings** (gear icon) → **API**
   - Copy the **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - Copy the **anon public** key (long string starting with `eyJ...`)

3. **Update environment variables**:
   - Open `.env.local` in the habit-tracker folder
   - Replace `your-project-url` with your Project URL
   - Replace `your-anon-key` with your anon key

4. **Run database migrations**:
   - In Supabase dashboard, go to **SQL Editor**
   - Click "New Query"
   - Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
   - Click "Run"
   - Repeat for `supabase/migrations/002_functions_and_views.sql`

### 2. Run the App Locally

```bash
cd habit-tracker
npm run dev
```

Open http://localhost:3000 in your browser!

### 3. Test the App

1. **Sign up** with an email and password
2. **Log today's activity** (workout and/or alcohol)
3. **Create a group** and note the invite code
4. **Open in incognito** and create another account
5. **Join the group** with the invite code
6. **Check the leaderboard** - you should see both users!

### 4. Deploy to Vercel (Optional)

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push
   ```

2. Go to https://vercel.com and import your repository

3. Add environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Deploy!

## 📱 Features to Test

- ✅ Daily check-in (workout/alcohol logging)
- ✅ Points calculation (total, weekly, monthly)
- ✅ Streaks (workout and clean)
- ✅ Group creation and joining
- ✅ Real-time leaderboard updates
- ✅ Mobile responsiveness

## 🎨 Customization Ideas

- Change color scheme in `src/app/globals.css`
- Add profile avatars (upload to Supabase Storage)
- Implement push notifications (optional feature)
- Add weekly recap screen
- Export stats as CSV

## 🐛 Troubleshooting

**"Invalid API key"**: Make sure you copied the **anon** key, not the service_role key

**"Table does not exist"**: Run the SQL migrations in Supabase SQL Editor

**"Not authenticated"**: Clear browser cookies and sign in again

**Real-time not working**: Check that RLS policies are enabled in Supabase

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

Enjoy your habit tracker! 🎯
