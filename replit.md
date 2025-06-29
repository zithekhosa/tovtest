# TOV Property Management Platform - Replit Configuration

## Overview

The TOV Property Management Platform is a comprehensive web application designed for the Botswana rental market. It serves landlords, tenants, property agencies, and maintenance service providers through role-based dashboards and specialized functionality. The platform facilitates property management, rent collection, maintenance requests, tenant screening, and real-time communication between all stakeholders.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack React Query for server state, React Context for global state
- **Build Tool**: Vite with custom configuration for theme support
- **UI Library**: Radix UI primitives with custom styling system

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Passport.js with local strategy and session-based auth
- **Session Storage**: PostgreSQL-backed session store for production scalability
- **WebSocket**: Real-time messaging and notifications using ws library
- **API Design**: RESTful endpoints with role-based access control

### Database Architecture
- **Primary Database**: PostgreSQL (Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema updates
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### User Management System
- Multi-role authentication (landlord, tenant, agency, maintenance)
- Session-based authentication with secure password hashing (scrypt)
- Role-based access control for API endpoints
- Demo accounts with predictable credentials for testing

### Property Management
- Comprehensive property listings with multimedia support
- Advanced search and filtering capabilities
- Property analytics and market intelligence
- Virtual tour integration and property valuation tools

### Lease & Rental Management
- Digital lease creation and management
- Automated rent collection with multiple payment methods
- Lease renewal and termination workflows
- Payment history tracking and late fee automation

### Maintenance System
- Maintenance request submission with photo attachments
- Service provider marketplace with bidding system
- Work order management and progress tracking
- Rating and review system for service quality

### Communication Platform
- Real-time messaging between all user types
- WebSocket-powered notifications
- Document sharing and management
- Automated reminders and alerts

### Financial Management
- Income and expense tracking
- Commission calculation for agents
- Tax compliance reporting
- Financial analytics and forecasting

## Data Flow

### Authentication Flow
1. User submits credentials via login form
2. Passport.js validates against database using scrypt password comparison
3. Session created and stored in PostgreSQL session store
4. User object attached to request context for subsequent API calls
5. Role-based middleware protects endpoints based on user permissions

### Property Search Flow
1. User inputs search criteria (location, price, bedrooms, etc.)
2. Frontend constructs query parameters and sends to search API
3. Backend applies filters using Drizzle ORM query builders
4. Results returned with pagination and sorting options
5. Frontend displays results with map integration and detailed views

### Real-time Communication Flow
1. WebSocket connection established on user login
2. Connection authenticated using session cookies
3. Messages broadcast to relevant users based on relationships
4. Offline message storage for disconnected users
5. Push notifications for critical updates

### Maintenance Request Flow
1. Tenant submits request with photos and description
2. Request routed to property landlord and available service providers
3. Service providers can bid on maintenance jobs
4. Landlord or tenant selects preferred provider
5. Progress tracking and completion verification
6. Rating system for service quality feedback

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations and query building
- **express**: Web server framework with middleware support
- **passport**: Authentication middleware with session management
- **ws**: WebSocket implementation for real-time features

### Frontend Dependencies
- **@radix-ui/react-***: Accessible UI component primitives
- **@tanstack/react-query**: Server state management and caching
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight client-side routing

### Development Dependencies
- **typescript**: Type safety and enhanced developer experience
- **vite**: Fast build tool with HMR support
- **drizzle-kit**: Database schema management and migrations
- **tsx**: TypeScript execution for scripts

### Payment Integration
- **@stripe/stripe-js**: Payment processing integration
- **@stripe/react-stripe-js**: React components for Stripe

### Communication & Notifications
- **@sendgrid/mail**: Email service integration for notifications

## Deployment Strategy

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **SESSION_SECRET**: Secure session encryption key (generated or provided)
- **PORT**: Server port (defaults to 5000)

### Build Process
1. **Development**: `npm run dev` - Runs both frontend (Vite) and backend (tsx)
2. **Production Build**: `npm run build` - Compiles frontend assets and bundles backend
3. **Production Start**: `npm start` - Serves built application

### Database Management
- Schema changes applied via `npm run db:push`
- Drizzle Kit handles migration generation and application
- Connection pooling optimized for serverless deployment

### Pre-deployment Verification
- Automated pre-deployment checks via `npx tsx scripts/pre-deployment-check.ts`
- Database connectivity and schema validation
- Demo account verification and data integrity checks
- WebSocket connectivity testing

### Production Optimizations
- Minified JavaScript and CSS bundles
- Chunk splitting for optimal loading
- CDN-ready static asset organization
- Session store configured for PostgreSQL in production

## Changelog

```
Changelog:
- June 29, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```