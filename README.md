# ⚽ FairPlay10X

## DEMO
https://fairplayx10.pages.dev/login

> A modern platform for managing amateur football matches with intelligent team drawing functionality. Built for organizers who want to quickly create events, manage player signups, and generate balanced teams automatically.

[![Astro](https://img.shields.io/badge/Astro-5.13.7-FF5D01?logo=astro&logoColor=white)](https://astro.build/)
[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.13-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)

## 🎯 Overview

FairPlay10X streamlines the organization of amateur football matches by automating player registration, event management, and team creation. The platform replaces manual processes (like organizing via Messenger) with a modern, mobile-first web application that enables one-click signups and intelligent team balancing.

### Key Benefits

- ⚡ **Fast Setup** - Create events and manage signups in seconds
- 🤖 **Smart Team Drawing** - Automatic balanced team generation based on positions and skill levels
- 📱 **Mobile-First** - Responsive design optimized for mobile devices
- 👥 **Role-Based Access** - Three-tier system (Admin, Organizer, Player) with appropriate permissions
- 🔒 **Secure** - Built on Supabase with authentication and authorization
- ⚡ **Fast Performance** - Server-side rendering with Astro and Cloudflare edge deployment

## ✨ Features

### Event Management
- Create, edit, and manage sports events with automatic status tracking
- Events automatically transition to "completed" after their date passes
- Support for event cancellation and draft states
- Comprehensive dashboard for organizers and admins

### Player Management
- Register players with positions (Forward, Midfielder, Defender, Goalkeeper) and skill levels
- Player profiles with historical data
- Easy signup system for events

### Smart Team Drawing
- Intelligent algorithm that balances teams based on:
  - Player positions
  - Skill levels
  - Previous team assignments
- Ensures fair and competitive matches

### User Roles & Access Control
- **Admin** - Full system access, user management, and approval workflows
- **Organizer** - Create and manage events, view player registrations
- **Player** - View events, sign up for matches, view team assignments

### Additional Features
- One-click event signups
- Real-time event status updates
- Responsive dashboard interface
- Toast notifications for user feedback
- Form validation with Zod
- Accessibility-focused design (WCAG 2.1)

## 🛠️ Tech Stack

### Core Framework
- **[Astro](https://astro.build/)** v5.13.7 - Modern web framework for building fast, content-focused websites
- **[React](https://react.dev/)** v19.1.1 - UI library for building interactive components
- **[TypeScript](https://www.typescriptlang.org/)** v5.8.0 - Type-safe JavaScript

### Styling & UI
- **[Tailwind CSS](https://tailwindcss.com/)** v4.1.13 - Utility-first CSS framework
- **[Shadcn/ui](https://ui.shadcn.com/)** - High-quality React components built on Radix UI
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library

### Backend & Database
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service with PostgreSQL database and authentication
- Row Level Security (RLS) policies for data protection
- Real-time capabilities

### Deployment
- **[Cloudflare Pages](https://pages.cloudflare.com/)** - Edge deployment platform with global CDN
- Server-side rendering (SSR) support
- Edge computing capabilities

### Testing
- **[Vitest](https://vitest.dev/)** - Unit and integration testing framework
- **[Playwright](https://playwright.dev/)** - End-to-end testing framework
- **[@testing-library/react](https://testing-library.com/react)** - React component testing utilities
- **[MSW](https://mswjs.io/)** - API mocking for tests
- **[@axe-core/playwright](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright)** - Accessibility testing

## 📋 Prerequisites

- **Node.js** v22.14.0 (as specified in `.nvmrc`)
- **npm** (comes with Node.js)
- **Supabase account** (for database and authentication)
- **Cloudflare account** (for deployment, optional)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd fairPlayx10
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run migrations from `./supabase/migrations/` directory:
   ```bash
   supabase db push
   ```
3. Optionally, run seed data from `./supabase/seed/` directory:
   ```bash
   supabase db seed
   ```

### 4. Configure environment variables

Create a `.env` file in the root directory:

```bash
# .env
PUBLIC_SUPABASE_URL=your-supabase-url
PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
PUBLIC_DISABLE_DASHBOARD_AUTH=false
```

For E2E tests, create a `.env.test` file:

```bash
# .env.test
PUBLIC_SUPABASE_URL=http://localhost:54321
PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
BASE_URL=http://localhost:4321
```

### 5. Run the development server

```bash
npm run dev
```

The application will be available at `http://localhost:4321` (or the port specified in your Astro config).

### 6. Build for production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## 📜 Available Scripts

### Development
- `npm run dev` - Start development server (default port: 4321)
- `npm run dev:e2e` - Start development server in test mode
- `npm run preview` - Preview production build

### Building
- `npm run build` - Build for production

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier

### Testing
- `npm run test` - Run unit tests with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Open Vitest UI for interactive testing
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests with Playwright
- `npm run test:e2e:ui` - Run E2E tests with Playwright UI
- `npm run test:e2e:debug` - Debug E2E tests
- `npm run test:e2e:codegen` - Generate E2E test code
- `npm run test:e2e:report` - Show E2E test report

## 📁 Project Structure

```
fairPlayx10/
├── src/
│   ├── layouts/              # Astro layouts
│   ├── pages/                # Astro pages and routing
│   │   ├── api/              # API endpoints
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── events/       # Event management endpoints
│   │   │   ├── players/      # Player management endpoints
│   │   │   └── users/        # User management endpoints
│   │   └── dashboard/        # Dashboard pages
│   ├── components/           # UI components (Astro & React)
│   │   ├── ui/               # Shadcn/ui components
│   │   ├── events/           # Event-related components
│   │   ├── players/          # Player-related components
│   │   ├── users/            # User management components
│   │   └── dashboard/        # Dashboard components
│   ├── lib/                  # Business logic and utilities
│   │   ├── services/         # Service layer (events, players, auth, etc.)
│   │   ├── hooks/            # React hooks
│   │   ├── validation/       # Zod validation schemas
│   │   └── utils/            # Utility functions
│   ├── db/                   # Supabase client and types
│   ├── middleware/           # Astro middleware
│   ├── types.ts              # Shared TypeScript types
│   ├── styles/               # Global styles
│   └── assets/               # Static assets
├── supabase/
│   ├── migrations/           # Database migrations
│   └── seed/                 # Seed data
├── e2e/                      # End-to-end tests
├── docs/                     # Project documentation
└── public/                   # Public assets
```

## 🚢 Deployment

### Cloudflare Pages

The application is configured for deployment to Cloudflare Pages:

1. **Connect your repository** to Cloudflare Pages
2. **Configure build settings**:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node.js version: `22.14.0`
3. **Set environment variables** in Cloudflare dashboard:
   - `PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
   - `PUBLIC_DISABLE_DASHBOARD_AUTH` - Set to `false` in production
4. **Configure KV namespace binding** for sessions (if needed):
   - Binding name: `SESSION`
   - Configure in: Settings > Functions > KV namespace bindings

See `wrangler.toml` for Cloudflare-specific configuration.

### Environment Variables

Required environment variables for production:

- `PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `PUBLIC_DISABLE_DASHBOARD_AUTH` - Set to `false` in production (enables authentication)

## 📖 Key Features Explained

### Event Status Flow

Events automatically track their status through a lifecycle:

- **Active** - Available for player signups (default status)
- **Completed** - Automatically set after event date passes
- **Cancelled** - Manually cancelled by admin/organizer
- **Draft** - Legacy status (not used in new events)

See [docs/event-status-flow.md](docs/event-status-flow.md) for detailed status flow documentation.

### Team Drawing Algorithm

The smart team drawing engine balances teams based on:

- Player positions (Forward, Midfielder, Defender, Goalkeeper)
- Skill levels
- Previous team assignments (to ensure variety)

The algorithm ensures fair distribution of talent across teams for competitive matches.

### Role-Based Access Control

Three user roles with different permissions:

- **Admin** - Full system access, user management, account approval
- **Organizer** - Can create and manage events, view player registrations
- **Player** - Can view events and sign up for matches

New user accounts require admin approval before they can access the platform.

## 📚 Documentation

Additional documentation is available in the `docs/` directory:

- [Event Status Flow](docs/event-status-flow.md) - Detailed event lifecycle documentation
- [Supabase Integration Plan](docs/supabase-integration-plan.md) - Database integration details
- [Team Colors Implementation](docs/team-colors-implementation.md) - Team color system design

## 🤖 AI Development Support

This project is configured with AI development tools to enhance the development experience, providing guidelines for:

- Project structure and architecture
- Coding practices and patterns
- Frontend development with Astro and React
- Styling with Tailwind CSS
- Testing with Vitest and Playwright
- Accessibility best practices

### Cursor IDE

The project includes AI rules in `.cursor/rules/` directory that help Cursor IDE understand the project structure and provide better code suggestions.

## 🤝 Contributing

When contributing to this project, please:

1. Follow the coding practices defined in `.cursor/rules/`
2. Write tests for new features
3. Run linting and formatting before committing
4. Update documentation when adding new features
5. Follow the existing project structure
6. Ensure accessibility standards are met (WCAG 2.1)

## 📝 License

MIT

---

Built with ❤️ using Astro, React, and Supabase
