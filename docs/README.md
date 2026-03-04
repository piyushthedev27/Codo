# CODO - AI-Powered Coding Education Platform

A pixel-retro RPG-themed coding education platform where you never learn alone. Built with React, TypeScript, and Anime.js.

## 🎮 Features

### Core Learning Experience
- **AI Study Partners**: Three unique AI peers (Sarah, Alex, Jordan) with distinct personalities
- **AI Code Cinema**: Interactive code explanations with animated playback and voiceover
- **World Map Navigation**: Explore topics as pixel art adventure zones
- **Interactive Lessons**: Split-screen lessons with integrated code editor
- **Code Duels**: Competitive timed coding challenges against AI peers

### Gamification
- **XP & Leveling System**: Earn XP and level up as you learn
- **Daily Streaks**: Keep your learning momentum with streak tracking
- **Pixel Pet Companion**: Virtual pet that grows with your progress
- **Quest System**: Daily and weekly challenges with rewards
- **Achievements**: Unlock badges and trophies

### Progress Tracking
- **Knowledge Graph**: Visual skill tree showing your learning path
- **Mistake Analyzer**: AI-powered analysis of recurring errors
- **Progress Dashboard**: Comprehensive stats and charts
- **Skill Mastery Levels**: Track proficiency in different technologies

### Social Features
- **Guilds**: Join or create teams of 5 members
- **Leaderboards**: Individual, guild, and friends rankings
- **Public Profiles**: Share your achievements and stats
- **Guild Challenges**: Collaborative weekly goals

## 🎨 Design System

### Color Palette
- **Background**: `#0a0a0f` (main), `#12121a` (secondary), `#1a1a2e` (cards)
- **Accents**: 
  - Purple `#6c63ff` (primary)
  - Cyan `#00d4ff` (secondary)
  - Green `#00ff88` (success/XP)
  - Gold `#ffd700` (streaks/coins)
  - Red-Pink `#ff4d6d` (errors/danger)
- **Text**: `#e8e8f0` (primary), `#8888aa` (secondary)

### Typography
- **Press Start 2P**: Headings, titles, level numbers (pixel font)
- **VT323**: UI labels, stats, buttons (retro monospace)
- **JetBrains Mono**: Body text, code, descriptions (modern monospace)

### Visual Elements
- Pixel art character sprites (64x64px style)
- 2px solid borders with minimal border radius (4px max)
- Neon glow effects on hover/active states
- Scanline CRT monitor effects
- Segmented progress bars (RPG-style HP/XP bars)
- Pixel grid background patterns

## 🗺️ Page Structure

### Public Pages
- **Landing Page** (`/`) - Hero section, features, testimonials
- **Sign Up** (`/sign-up`) - Account creation
- **Login** (`/login`) - User authentication

### Onboarding Flow
- **Skill Assessment** (`/onboarding/assessment`) - Choose experience level
- **Path Selection** (`/onboarding/path`) - Pick learning track
- **Peer Selection** (`/onboarding/peer`) - Choose main AI study buddy

### Dashboard Pages
- **Dashboard** (`/dashboard`) - Main hub with stats and activities
- **World Map** (`/map`) - Visual topic navigation
- **AI Cinema** (`/cinema`) - Animated code explanations
- **Lessons** (`/lessons/:id`) - Interactive learning with code editor
- **Code Duel** (`/duel`) - Competitive coding arena
- **Knowledge Graph** (`/progress/graph`) - Visual skill tree
- **Progress** (`/progress`) - Stats and analytics
- **Mistake Analyzer** (`/progress/mistakes`) - Error analysis
- **Profile** (`/profile/:username`) - User stats and achievements
- **Leaderboard** (`/leaderboard`) - Rankings and competition
- **Guild** (`/guild`) - Team collaboration
- **Settings** (`/settings`) - User preferences

## 📚 Documentation

All documentation has been organized in the `docs/` folder:

- **[Complete Setup Guide](docs/SETUP_GUIDE.md)** - Start here for full setup instructions
- **[Quick Start Guide](docs/QUICK_START.md)** - Get running in 5 minutes
- **[Firebase Setup](docs/firebase/FIREBASE_SETUP.md)** - Firebase Console configuration
- **[Backend Setup](docs/backend/SETUP.md)** - Backend configuration details
- **[Docker Setup](docs/docker/DOCKER_README.md)** - Docker deployment guide
- **[Logging Setup](docs/backend/LOGGING_SETUP.md)** - Winston logging configuration
- **[Monitoring Setup](docs/backend/MONITORING_SETUP.md)** - Prometheus metrics

### What You Need to Do (Your Side)

For **local development**: Nothing! Just follow the Quick Start guide above.

For **production deployment**, you need to:
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Enable Email/Password Authentication
4. Generate and download service account key
5. Configure environment variables
6. Deploy security rules and indexes

**Detailed step-by-step instructions:** [docs/SETUP_GUIDE.md - Firebase Setup](docs/SETUP_GUIDE.md#firebase-setup-your-side)

**Clear task list for you:** [docs/YOUR_TASKS.md](docs/YOUR_TASKS.md)

## 🛠️ Tech Stack

### Frontend & API (Next.js App Router)
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 with custom pixel-retro theme
- **Animations**: Anime.js for smooth, clear animations
- **Icons**: Lucide React
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore

See `package.json` for all dependencies. In this unified architecture, Next.js handles both the React frontend and the API routes (replacing the former separate Node.js/Express backend).

## 🚀 Getting Started

### Quick Start (5 Minutes)

Get up and running quickly with local development using the unified Next.js setup:

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local and configure your Firebase keys or emulator strings.

# 3. Start Firebase Emulators (Terminal 1)
npm run emulator

# 4. Start Next.js App (Terminal 2)
npm run dev
```

**Access the application:**
- App & API: http://localhost:3000
- Firebase Emulator UI: http://localhost:4000

### Production Setup
For detailed setup instructions including Firebase Console configuration, production deployment, and troubleshooting:

📖 **[Read the Complete Setup Guide](docs/SETUP_GUIDE.md)**

## 📱 Responsive Design

The application is fully responsive and works across:
- Desktop (1920px+)
- Laptop (1366px - 1920px)
- Tablet (768px - 1366px)
- Mobile (320px - 768px)

## 🎯 Key Interactions

### Hover Effects
- Elements lift 2px with neon glow
- Borders change to accent colors
- Smooth transitions with anime.js

### Click Effects
- Button press animation (1px down)
- Ripple effects on important actions
- Immediate visual feedback

### XP Gain Animations
- Numbers float up and fade
- Progress bars fill with color transitions
- Celebration effects on level up

### Sprite Animations
- Idle bob animation (2-frame)
- Jump animation on selection
- Talking animation during narration

## 🎮 AI Peer Personalities

### Sarah (Purple - #b060ff)
- **Specialty**: Frontend Development
- **Level**: 42
- **Personality**: Patient, visual, loves CSS animations
- **Quote**: "Let's build something beautiful together!"

### Alex (Cyan - #00d4ff)
- **Specialty**: Algorithms & Optimization
- **Level**: 38
- **Personality**: Analytical, fast, obsessed with optimization
- **Quote**: "I'll debug that in under 60 seconds. Challenge accepted."

### Jordan (Green - #00ff88)
- **Specialty**: System Design & Architecture
- **Level**: 45
- **Personality**: Calm, thorough, explains everything clearly
- **Quote**: "Let's understand the why before writing a single line."

## 📊 Gamification Mechanics

### XP System
- Lessons: 100-250 XP
- Duels: 200-500 XP
- Cinema: 50-100 XP
- Daily Login: 25 XP
- Streak Bonus: +10 XP per day

### Level Progression
- Level 1-10: Novice (0-1,000 XP)
- Level 11-25: Apprentice (1,000-5,000 XP)
- Level 26-40: Hero (5,000-15,000 XP)
- Level 41+: Legend (15,000+ XP)

## 🔮 Future Enhancements

- Real-time multiplayer code duels
- Voice synthesis for AI peers
- Custom pet customization
- More learning paths (Python, Mobile, Backend)
- Integration with real code execution (Piston API)
- Social features (friend system, direct messaging)
- Mobile app (React Native)
- Dark mode variations

## 📄 License

Private educational project.

## 👥 Credits

Designed and developed following the comprehensive specifications in:
- `codo-ui-prompt.md` - UI/UX specifications
- `codo-design-doc.md` - Architecture and design system

---

**Built with ❤️ for learners worldwide**

*"Never learn alone. Your AI study partners are ready."*
