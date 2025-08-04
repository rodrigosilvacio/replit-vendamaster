# Overview

This is a Point of Sale (POS) system built with a modern full-stack architecture. The application is designed for retail businesses to manage sales, customers, products, suppliers, and users. It features a React frontend with a comprehensive UI component library, an Express.js backend with REST APIs, and PostgreSQL database with Drizzle ORM for data management. The system includes role-based access control with admin and vendor user types, and integrates with Replit's authentication system.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client is built with React 18 and TypeScript, utilizing a component-based architecture with:
- **UI Framework**: Shadcn/ui components built on Radix UI primitives for accessibility and customization
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for client-side routing with protected routes based on authentication status
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
The server follows a REST API architecture using Express.js with:
- **Framework**: Express.js with TypeScript for type safety
- **Authentication**: Replit OAuth integration with session-based authentication
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **API Structure**: RESTful endpoints organized by resource (customers, products, sales, etc.)
- **Middleware**: Role-based access control middleware for admin-only endpoints
- **Error Handling**: Centralized error handling with proper HTTP status codes

## Database Design
PostgreSQL database with Drizzle ORM providing:
- **Schema Management**: Type-safe schema definitions with automatic TypeScript types
- **Relationships**: Proper foreign key relationships between entities (sales -> customers, products -> suppliers)
- **Data Types**: Appropriate column types including decimals for pricing, JSON for session data
- **Migrations**: Schema versioning through Drizzle migrations

## Authentication & Authorization
- **OAuth Provider**: Replit OAuth for user authentication
- **Session Management**: Server-side sessions stored in PostgreSQL
- **Role-Based Access**: Two user roles (admin, vendedor) with different permission levels
- **Protected Routes**: Frontend route protection and backend endpoint authorization

## Data Models
Core business entities include:
- **Users**: Authentication and role management
- **Customers**: Customer information and contact details
- **Suppliers**: Vendor/supplier management
- **Products**: Inventory with pricing, stock levels, and supplier relationships
- **Sales**: Transaction records with line items and customer associations

# External Dependencies

## Database
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database operations and schema management
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## Authentication
- **Replit OAuth**: OpenID Connect authentication provider
- **Passport.js**: Authentication middleware with OpenID Connect strategy

## Frontend Libraries
- **Radix UI**: Accessible component primitives for building the UI
- **Tailwind CSS**: Utility-first CSS framework for styling
- **TanStack Query**: Server state management and data fetching
- **React Hook Form**: Form validation and management
- **Zod**: Schema validation for type-safe data handling
- **Chart.js**: Data visualization for sales analytics
- **Wouter**: Lightweight routing library

## Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS integration