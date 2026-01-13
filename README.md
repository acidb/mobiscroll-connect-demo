# Mobiscroll Connect Demo

A Next.js demo application showcasing the Mobiscroll Connect Node SDK for managing calendar events across multiple providers (Google, Microsoft, Apple).

## Features

- **OAuth2 Authentication Flow** - Secure authentication with multiple calendar providers
- **Calendar Management** - List and manage calendars across Google, Microsoft, and Apple
- **Event Operations** - Create, read, update, and delete calendar events
- **Server-Side SDK Integration** - All API calls handled securely on the server
- **Type-Safe API** - Full TypeScript support throughout the application
- **Responsive UI** - Clean interface built with Tailwind CSS
- **JSON Response Viewer** - Interactive API response inspection for debugging

## Getting Started

### Prerequisites

- Node.js 20 or higher
- Mobiscroll Connect server running (default: http://localhost:3000)
- Valid OAuth client credentials from Mobiscroll Connect

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your credentials
```

### Environment Configuration

Edit `.env.local` with your configuration:

```env
# Mobiscroll Connect API URL
MOBISCROLL_CONNECT_URL=http://localhost:3000/api

# OAuth Client Credentials (keep client_secret private!)
NEXT_PUBLIC_MOBISCROLL_CLIENT_ID=your-client-id
NEXT_PUBLIC_MOBISCROLL_CLIENT_SECRET=your-client-secret

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3001
PORT=3001
```

**Development Mode:** You can also use `NEXT_PUBLIC_MOBISCROLL_CLIENT_ID_DEV` and `NEXT_PUBLIC_MOBISCROLL_CLIENT_SECRET_DEV` for separate development credentials.

### Development

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) to view the app.

### Build & Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Home/landing page
│   ├── layout.tsx                  # Root layout with metadata
│   ├── globals.css                 # Global styles
│   ├── api/                        # Next.js API routes
│   │   ├── auth/                   # OAuth initiation
│   │   │   ├── route.ts           # Start OAuth flow
│   │   │   └── status/            # Check authentication status
│   │   ├── callback/              # OAuth callback handler
│   │   ├── calendars/             # Calendar list operations
│   │   ├── events/                # Event CRUD operations
│   │   └── logout/                # Session termination
│   ├── calendars/                 # Calendar management page
│   │   └── page.tsx
│   ├── events/                    # Event management page
│   │   └── page.tsx
│   └── event-edit/                # Event creation/editing page
│       └── page.tsx
├── components/
│   ├── common/
│   │   ├── Header/                # Navigation header
│   │   ├── JsonViewer/            # API response viewer
│   │   └── Layout/                # Page layout wrapper
│   └── pages/                     # Page-level components
│       ├── HomePage/              # Landing page with auth
│       ├── CalendarsPage/         # Calendar listing
│       ├── EventsPage/            # Event listing with filters
│       └── EventEditPage/         # Event form
└── lib/
    ├── default.ts                 # Environment config helper
    └── mobiscroll-client.ts       # SDK client factory
```

## Application Flow

1. **Home Page** - Configure credentials (optional, uses environment variables) and initiate OAuth
2. **Authentication** - Redirects to Mobiscroll Connect for provider selection and OAuth
3. **Callback** - Handles OAuth callback, stores access token in HTTP-only cookie
4. **Calendars** - Browse connected calendars from all providers
5. **Events** - List events with filtering options (date range, pagination)
6. **Event Edit** - Create or update events with full detail support

## API Routes

### Authentication
- `GET /api/auth` - Initiate OAuth flow
- `GET /api/auth/status` - Check if user is authenticated
- `GET /api/callback` - OAuth callback handler
- `GET /api/logout` - Clear session and logout

### Calendar Operations
- `GET /api/calendars` - List all calendars from connected providers

### Event Operations
- `GET /api/events` - List events with filters (timeMin, timeMax, pageSize, singleEvents, paging)
- `POST /api/events` - Create a new event
- `PATCH /api/events` - Update an existing event
- `DELETE /api/events` - Delete an event

## Security Implementation

- **Client Secret Protection** - Never exposed to the browser; used only in server-side API routes
- **HTTP-Only Cookies** - Access tokens stored securely, inaccessible to JavaScript
- **Server-Side SDK Calls** - All Mobiscroll Connect API calls made from Next.js API routes
- **Environment Variables** - Sensitive credentials managed through env files
- **Separate Dev/Prod Configs** - Support for different credentials per environment

## Technologies Used

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **Mobiscroll Connect SDK** - Calendar provider integration
- **react18-json-view** - JSON response visualization

## Development Scripts

- `npm run dev` - Start development server with webpack (port 3001)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
