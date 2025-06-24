# Entueten - Sustainable Food Tracking App

A Next.js application for tracking sustainable food choices, completing challenges, and making a positive impact on the environment.

## 🚀 Features

- **Authentication**: Email & password sign-up/sign-in with Supabase
- **Kitchen Check**: Document food inventory and categorize by origin (local, organic, seasonal, etc.)
- **Mini Challenges**: Complete sustainable eating challenges with proof photos
- **Observations**: Answer surveys about sustainable eating habits
- **Dashboard**: Visual charts and progress tracking
- **Protected Routes**: Automatic redirect to login for unauthenticated users

## 🛠 Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Code Quality**: ESLint, Prettier, Husky pre-commit hooks

## 📁 Project Structure

```
entueten/
├─ public/
├─ src/
│  ├─ app/                    # Next.js App Router pages
│  │  ├─ auth/               # Authentication pages
│  │  │  ├─ signin/
│  │  │  └─ signup/
│  │  ├─ dashboard/          # Main dashboard
│  │  ├─ kitchen-check/      # Kitchen inventory tracking
│  │  │  ├─ step1/          # Add food items
│  │  │  └─ step2/          # Categorize by origin
│  │  ├─ mini-challenges/    # Sustainable challenges
│  │  ├─ observations/       # Surveys and questionnaires
│  │  ├─ layout.tsx         # Root layout with providers
│  │  └─ page.tsx           # Landing page
│  ├─ components/           # Reusable UI components
│  │  ├─ Button.tsx
│  │  ├─ Card.tsx
│  │  ├─ Input.tsx
│  │  ├─ Navbar.tsx
│  │  └─ ProtectedRoute.tsx
│  ├─ data/                 # Static data files
│  │  ├─ challenges.json
│  │  └─ questions.json
│  ├─ lib/                  # Utilities and configurations
│  │  ├─ AuthContext.tsx    # Authentication context
│  │  ├─ QueryProvider.tsx  # TanStack Query provider
│  │  ├─ auth.ts           # Auth helper functions
│  │  └─ supabaseClient.ts # Supabase client
│  └─ styles/              # Global styles
├─ .env.local.example      # Environment variables template
├─ package.json
├─ tailwind.config.js
├─ tsconfig.json
└─ README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### 1. Clone and Install

```bash
git clone <repository-url>
cd entueten
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
4. Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Database Setup

Create the following tables in your Supabase database:

#### Users Table (auto-created by Supabase Auth)

```sql
-- This is automatically created by Supabase Auth
-- You can extend it with additional columns if needed
```

#### Kitchen Checks Table

```sql
CREATE TABLE kitchen_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL,
  stats JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### User Challenges Table

```sql
CREATE TABLE user_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  proof_photo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### User Answers Table

```sql
CREATE TABLE user_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Storage Setup

Create a storage bucket for challenge proof photos:

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `challenge-proofs`
3. Set the bucket to public or configure RLS policies as needed

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## 🎯 Key Features Explained

### Authentication Flow

- Users can sign up with email/password
- Email verification required (handled by Supabase)
- Protected routes automatically redirect to login
- Session persistence across page reloads

### Kitchen Check Process

1. **Step 1**: Add food items with quantities and units
2. **Step 2**: Categorize items by origin (local, organic, seasonal, imported, unknown)
3. **Results**: View statistics and progress over time

### Mini Challenges

- Browse available challenges by category and difficulty
- Mark challenges as completed with optional proof photos
- Track completion rate and earn points
- View challenge history and achievements

### Observations Survey

- Multi-step questionnaire with progress tracking
- Mix of multiple choice and text questions
- Categorized by topic (diet, shopping, sustainability, etc.)
- Save responses for analysis

### Dashboard Analytics

- Visual charts showing kitchen check progress
- Challenge completion statistics
- Recent activity feed
- Overall sustainability metrics

## 🔒 Security Features

- Protected routes with automatic authentication checks
- Supabase Row Level Security (RLS) for data protection
- Environment variables for sensitive configuration
- Input validation and sanitization

## 🎨 UI/UX Features

- Responsive design for mobile and desktop
- Modern, clean interface with Tailwind CSS
- Loading states and error handling
- Progress indicators and success feedback
- Accessible form controls and navigation

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@entueten.com or create an issue in the repository.

## 🔮 Future Enhancements

- [ ] Photo upload to Supabase Storage
- [ ] Social features and sharing
- [ ] Advanced analytics and insights
- [ ] Mobile app (React Native)
- [ ] Integration with grocery delivery APIs
- [ ] Carbon footprint calculations
- [ ] Community challenges and leaderboards
