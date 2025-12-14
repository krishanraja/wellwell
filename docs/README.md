# WellWell - Stoic Operating System

> Pre-load your Stoic stance before the day destabilises you.

WellWell is a mobile-first web application that helps users build mental resilience through Stoic philosophy. It provides structured tools for morning preparation, real-time emotional regulation, and evening reflection.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Core Philosophy

WellWell treats Stoic philosophy not as passive wisdom, but as an active operating system for daily life. The app helps users:

1. **Prepare** for challenges before they arise (Pulse)
2. **Respond** to emotional triggers in real-time (Intervene)
3. **Reflect** on daily experiences to extract wisdom (Debrief)

## Key Features

| Feature | Purpose | Frequency |
|---------|---------|-----------|
| Morning Pulse | Pre-load mental stance | Daily AM |
| Intervene | Real-time recalibration | As needed |
| Debrief | Evening reflection | Daily PM |
| Profile | Track virtue progress | Ongoing |

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom Design System
- **Backend**: Lovable Cloud (PostgreSQL, Auth, Edge Functions)
- **AI**: Lovable AI Gateway (Google Gemini)
- **State**: React Query + React Context

## Project Structure

```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   └── wellwell/     # App-specific components
├── hooks/            # Custom React hooks
├── lib/              # Utilities (logger, utils)
├── pages/            # Route components
├── types/            # TypeScript definitions
└── integrations/     # Supabase client

supabase/
├── functions/        # Edge functions
└── config.toml       # Backend configuration

docs/                 # Project documentation
```

## Documentation

- [Architecture](./ARCHITECTURE.md) - System design and data flow
- [Features](./FEATURES.md) - Feature specifications
- [Design System](./DESIGN_SYSTEM.md) - UI components and tokens
- [Branding](./BRANDING.md) - Visual identity guidelines
- [Production Audit](./PRODUCTION_AUDIT.md) - Security, UX, and code quality audit
- [Adversarial Audit](./ADVERSARIAL_AUDIT.md) - **Comprehensive full-stack audit: state management, UX, data pipeline, AI systems**
- [Common Issues](./COMMON_ISSUES.md) - Troubleshooting guide
- [Decisions Log](./DECISIONS_LOG.md) - Architectural decisions

## Contributing

This is a Lovable project. Changes are made through the Lovable editor with AI assistance.

## License

Proprietary - All rights reserved.
