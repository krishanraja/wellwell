# WellWell - Stoicism as Your Operating System

<p align="center">
  <strong>Pre-load your Stoic stance before the day destabilises you.</strong>
</p>

WellWell is a mobile-first personal Stoic practice app that helps users build mental resilience through daily rituals, AI-powered insights, and virtue tracking. Built with React, TypeScript, and Supabase.

---

## ✨ Key Features

### Core Practice Tools
- **Morning Pulse** — Start your day with a clear mental stance by identifying challenges and pre-building responses
- **Intervene** — Real-time emotional recalibration when triggered, with AI-powered Stoic reframes
- **Evening Debrief** — Reflect on your day and track virtue growth across the four cardinal virtues

### Smart Experience
- **Contextual Home** — Smart nudges based on time of day and your activity patterns
- **Welcome Back Screen** — Personalized greeting for returning users with streak acknowledgment
- **Virtue Tracking** — Monitor your Stoic growth across Courage, Temperance, Justice, and Wisdom

### Content & SEO
- **SEO-Optimized Blog** — Articles on Stoicism, mental health, and productivity
- **FAQ Center** — 20+ questions with FAQ schema for rich search results
- **Daily Stances Library** — Pre-written Stoic stances for common situations

---

## 📚 Documentation

### Core Documentation
| Document | Description |
|----------|-------------|
| [Architecture](./docs/ARCHITECTURE.md) | System design, data flow, and component hierarchy |
| [Features](./docs/FEATURES.md) | Complete feature specifications with AI schemas |
| [Design System](./docs/DESIGN_SYSTEM.md) | UI components, tokens, and styling guidelines |
| [Branding](./docs/BRANDING.md) | Visual identity, voice & tone, logo usage |
| [Purpose](./docs/PURPOSE.md) | Mission, philosophy, and Stoic principles |

### Operations & Quality
| Document | Description |
|----------|-------------|
| [Production Audit](./docs/PRODUCTION_AUDIT.md) | Security, UX, and code quality audit findings |
| [Adversarial Audit](./docs/ADVERSARIAL_AUDIT.md) | Comprehensive state management and edge case audit |
| [Common Issues](./docs/COMMON_ISSUES.md) | Troubleshooting guide for known issues |
| [Fixes Implemented](./docs/FIXES_IMPLEMENTED.md) | All bug fixes and their resolutions |

### Development History
| Document | Description |
|----------|-------------|
| [Decisions Log](./docs/DECISIONS_LOG.md) | Architectural decisions with rationale |
| [Changelog](./CHANGELOG.md) | Complete version history and agent contributions |
| [Issue Histories](./docs/) | Detailed post-mortems for major issues |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, shadcn/ui, Framer Motion |
| **Backend** | Supabase (PostgreSQL, Auth, Edge Functions) |
| **AI** | Google Gemini 2.5 Flash via Edge Functions |
| **State** | React Query, React Context |
| **Deployment** | Vercel (frontend), Supabase Cloud (backend) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account with project created

### Environment Setup

1. **Clone and install:**
   ```bash
   git clone <YOUR_GIT_URL>
   cd wellwell
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` with your Supabase credentials:**
   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
   ```
   
   Get these from: [Supabase Dashboard](https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api)

4. **Start development server:**
   ```bash
   npm run dev
   ```

### Supabase Setup

See [EDGE_FUNCTIONS_SETUP.md](./EDGE_FUNCTIONS_SETUP.md) for deploying edge functions and configuring secrets:
- `GOOGLE_AI_API_KEY` — Required for AI analysis
- `OPENAI_API_KEY` — Required for voice transcription
- `STRIPE_SECRET_KEY` — Required for payments

---

## 📁 Project Structure

```
wellwell/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui base components
│   │   └── wellwell/        # App-specific components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities (logger, auth, etc.)
│   ├── pages/               # Route components
│   ├── data/                # Static data (FAQ, blog articles)
│   ├── types/               # TypeScript definitions
│   └── integrations/        # Supabase client
├── supabase/
│   ├── functions/           # Edge functions (stoic-analyzer, etc.)
│   ├── migrations/          # Database schema migrations
│   └── tests/               # RLS verification tests
├── docs/                    # Project documentation
├── public/                  # Static assets
└── scripts/                 # Setup and utility scripts
```

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run migrate` | Run Supabase migrations (Windows) |
| `npm run migrate:unix` | Run Supabase migrations (Unix) |

---

## 🔒 Security

- **Row Level Security (RLS)** enforced on all database tables
- **User data isolation** — Users can only access their own data
- **Secure token storage** using sessionStorage
- **Edge function authentication** on all AI endpoints

See [Production Audit](./docs/PRODUCTION_AUDIT.md) for complete security details.

---

## 📊 Database Schema

Core tables:
- `profiles` — User anchor with persona, challenges, goals
- `sessions` — Tool usage grouping
- `events` — Raw interaction records
- `insights` — AI-generated meaning layer
- `virtue_scores` — Aggregated virtue tracking
- `usage_tracking` — Feature usage limits

See [Architecture](./docs/ARCHITECTURE.md) for complete schema documentation.

---

## 🎨 Design Philosophy

WellWell is:
- **Mobile-first** — Optimized for phone usage during stressful moments
- **Dark-mode default** — Reduces eye strain for morning/evening use
- **Voice-first** — Primary interaction is speaking, with text fallback
- **Minimalist** — Focus on content, minimal chrome

See [Design System](./docs/DESIGN_SYSTEM.md) and [Branding](./docs/BRANDING.md) for details.

---

## 🤝 Contributing

This project uses AI-assisted development through Lovable and Cursor. Key guidelines:
- Follow existing code patterns and conventions
- Update documentation when making changes
- Add to the decisions log for architectural changes
- Run linting before committing

---

## 📄 License

Proprietary — All rights reserved.

---

## 🆘 Support

- Check [Common Issues](./docs/COMMON_ISSUES.md) for troubleshooting
- Review [FAQ](./docs/FEATURES.md#seo-infrastructure) for user-facing questions
- See deployment logs in Supabase and Vercel dashboards
