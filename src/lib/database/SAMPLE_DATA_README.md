# Sample Data for Codo Application

## Quick Start (Use This File!)

**Use `sample-data-simple.sql`** - This is the simplified version that works with your current schema.

## How to Use

### Step 1: Get Your Clerk User ID
1. Sign in to your application
2. Go to Clerk Dashboard (https://dashboard.clerk.com)
3. Navigate to Users section
4. Copy your user ID (starts with `user_`)

### Step 2: Update the SQL File
Open `sample-data-simple.sql` and replace ALL occurrences of:
- `'user_YOUR_CLERK_ID_HERE'` with your actual Clerk user ID

**Find and Replace**: Search for `user_YOUR_CLERK_ID_HERE` and replace with your real ID

### Step 3: Run the SQL in Supabase
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy the entire contents of `sample-data-simple.sql`
4. Paste and run the SQL
5. Check the verification output at the bottom

## What Data Gets Created

### 1. User Profile
- Your profile with intermediate skill level
- 2500 XP, Level 3
- 15-day learning streak

### 2. AI Peers (3 companions)
- **Sarah** - Curious beginner (pink theme)
- **Alex** - Analytical intermediate (blue theme)
- **Jordan** - Supportive advanced (green theme)

### 3. Knowledge Graph (10 nodes)
- HTML Basics (mastered)
- CSS Fundamentals (mastered)
- JavaScript Basics (mastered)
- React Fundamentals (in progress - 65%)
- React Hooks (in progress - 45%)
- State Management (locked)
- Advanced React Patterns (locked)
- Performance Optimization (locked)
- TypeScript Basics (in progress - 55%)
- Advanced TypeScript (locked)

## After Running the SQL

Your dashboard will show:
- ✅ Your real profile data
- ✅ 3 AI peers (Sarah, Alex, Jordan)
- ✅ Learning path with 10 concepts
- ✅ Progress bars and stats
- ✅ Clickable cards and buttons

## Troubleshooting

**Error: "relation does not exist"**
- Make sure you ran the schema first (`schema.sql`)

**Error: "invalid enum value"**
- Check that you're using the correct enum values
- Valid learning_goal: 'learning', 'projects', 'placement', 'productivity'

**Error: "duplicate key"**
- The script handles duplicates automatically
- It will update existing data instead of creating duplicates

**No data showing on dashboard**
- Make sure you replaced `user_YOUR_CLERK_ID_HERE` with your real Clerk ID
- Check the verification queries at the end of the SQL
- Refresh your browser

## Files

- `sample-data-simple.sql` - ⭐ Use this one! Works with current schema
- `sample-data.sql` - Full version (requires all tables)
- `SAMPLE_DATA_README.md` - This file
