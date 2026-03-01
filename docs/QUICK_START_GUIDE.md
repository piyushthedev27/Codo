# Quick Start Guide - Codo

This guide will help you get up and running with Codo as quickly as possible.

## 🚀 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/piyushthedev27/Codo.git
   cd "Codo v1.1"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Main Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server with hot-reloading. |
| `npm run build` | Creates an optimized production build. |
| `npm run start` | Starts the production server after building. |
| `npm run lint` | Runs ESLint to check for code quality issues. |
| `npm test` | Executes the test suite using Vitest/Jest. |

## 📁 Key Directories

- `src/app/`: Next.js App Router pages and layouts.
- `src/components/`: Reusable UI components.
- `src/lib/`: Core logic, utilities, and API clients (AI, Supabase, Clerk).
- `src/types/`: TypeScript type definitions.
- `docs/`: Comprehensive project documentation.

## 🧪 Testing Your Setup

Once the server is running, check these key routes:
- **Home**: `/`
- **Dashboard**: `/dashboard` (Requires Authentication)
- **Onboarding**: `/onboarding`
- **Lessons**: `/lessons`

## 💡 Troubleshooting

- **Auth Issues**: Ensure your Clerk keys are correctly set in `.env.local`.
- **Database Errors**: Verify your Supabase URL and Service Role Key.
- **AI Responses**: Make sure your OpenAI API key has sufficient credits.

---

**Last Updated**: March 1, 2026  
**Version**: 1.1.0  
**Status**: ✅ STABLE
