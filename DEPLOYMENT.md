# TOV Property Management - Deployment Documentation

## Overview
This document outlines the key information needed for deploying and maintaining the TOV Property Management platform.

## Environment Variables
The application requires the following environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secret for session encryption (generate a secure random string)
- `PORT` - (Optional) Port for the server to listen on, defaults to 5000

## Demo Accounts
Test accounts with predictable credentials are available:

| Role | Username | Password |
|------|----------|----------|
| Landlord | demo-landlord | password123 |
| Tenant | demo-tenant | password123 |
| Agency | demo-agency | password123 |
| Maintenance | demo-maintenance | password123 |

## Deployment Checklist

### Pre-Deployment
- [x] Run `npx tsx scripts/pre-deployment-check.ts` to verify database connectivity and data integrity
- [x] Fix any React warnings or errors reported in the console
- [x] Ensure all user flows work as expected across different roles
- [x] Verify WebSocket connectivity for real-time notifications
- [x] Confirm database schema is up to date with the latest models

### Post-Deployment
- [ ] Verify login works for all roles in the production environment
- [ ] Test WebSocket connectivity in production
- [ ] Monitor application logs for errors
- [ ] Set up monitoring and analytics (recommended)

## Database Management
The application uses Drizzle ORM for database operations. To make database schema changes:

1. Update models in `shared/schema.ts`
2. Run schema migration with `npm run db:push`

## Security Notes
- Application uses Passport.js for authentication
- Sessions are stored in PostgreSQL
- Password hashing uses secure scrypt algorithm
- All API endpoints that require authentication are protected with middleware

## Support & Maintenance
For any issues:
1. Check application logs
2. Verify database connectivity
3. Ensure environment variables are correctly set
4. Check WebSocket connections if real-time features aren't working
