# TOV Property Management Platform

A fullstack property management platform built with React, Express, and Supabase.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp env.example .env
```

Fill in your Supabase credentials in `.env`:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Supabase Configuration
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]

# Server Configuration
PORT=5000
NODE_ENV=development
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Frontend Configuration
VITE_API_URL=http://localhost:3002/api
VITE_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
VITE_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Push your schema to Supabase:

```bash
npm run db:push
```

### 4. Start Development Server

Run both frontend and backend simultaneously:

```bash
npm run dev:full
```

Or run them separately:

```bash
# Backend only (port 5000)
npm run dev:server

# Frontend only (port 3000)
npm run dev:client
```

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and configs
│   │   └── main.tsx       # Entry point
│   └── index.html
├── server/                # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── db.ts            # Database connection
│   ├── supabase.ts      # Supabase client
│   └── utils.ts         # Utilities
├── shared/               # Shared code
│   └── schema.ts        # Database schema
└── package.json
```

## 🔧 Available Scripts

- `npm run dev:full` - Start both frontend and backend
- `npm run dev:server` - Start backend only
- `npm run dev:client` - Start frontend only
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push schema to database
- `npm run db:generate` - Generate migrations
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Drizzle Studio

## 🌐 API Endpoints

The backend runs on `http://localhost:3002` and provides:

- `/api/auth/*` - Authentication endpoints
- `/api/properties/*` - Property management
- `/api/leases/*` - Lease management
- `/api/payments/*` - Payment processing
- `/api/maintenance/*` - Maintenance requests
- `/api/users/*` - User management

## 🔐 Authentication

The platform supports multiple user roles:
- **Tenants** - Can view properties, apply for leases, make payments
- **Landlords** - Can manage properties, view tenants, track finances
- **Agencies** - Can list properties, manage leads, track commissions
- **Maintenance** - Can bid on maintenance requests, manage jobs

## 🗄️ Database

Uses Supabase (PostgreSQL) with Drizzle ORM. Key tables:
- `users` - User accounts and profiles
- `properties` - Property listings
- `leases` - Rental agreements
- `payments` - Payment records
- `maintenance_requests` - Maintenance tickets
- `applications` - Property applications

## 🎨 UI Components

Built with:
- **React** - Frontend framework
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **Shadcn/ui** - Component library
- **Framer Motion** - Animations

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables

Make sure to set all required environment variables in production:
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SESSION_SECRET`
- `NODE_ENV=production`

## 🧪 Testing

Test the API endpoints:

```bash
# Test authentication
curl http://localhost:3002/api/auth/login

# Test properties endpoint
curl http://localhost:3002/api/properties
```

## 📝 Development Notes

- Frontend runs on `http://localhost:3000`
- Backend runs on `http://localhost:3002`
- API requests from frontend are proxied to backend
- Hot reload is enabled for both frontend and backend
- Database changes require running `npm run db:push`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details "# tovtest" 
