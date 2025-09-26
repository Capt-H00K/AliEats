# Overview

FlavorFleet is a comprehensive food delivery platform built with modern web technologies. The application serves three distinct user roles: customers who browse restaurants and place orders, drivers who accept and deliver orders, and restaurants who manage their menus and orders. The platform includes real-time order tracking, payment processing, driver ledger management, and notification systems.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application uses **React 18 with TypeScript** as the core frontend framework, leveraging functional components and hooks for state management. The UI is built with **shadcn/ui components** and **Tailwind CSS** for consistent styling and responsive design. The frontend follows a modular component architecture with separate dashboards for each user role (customer, driver, restaurant).

## Data Storage Solutions
The system employs a **dual-database approach**:
- **Firebase Realtime Database** serves as the primary data store for real-time features like orders, restaurants, menu items, and user profiles
- **PostgreSQL with Drizzle ORM** is configured for structured data operations and more complex queries
- **Firebase Cloud Storage** handles file uploads including profile images, restaurant logos, and menu item photos

## Authentication & Authorization
User authentication is managed through **Firebase Authentication**, supporting email/password login with role-based access control. Users are assigned one of three roles: customer, driver, or restaurant. Protected routes ensure users can only access features appropriate to their role.

## Backend Architecture
The backend is built with **Express.js and TypeScript**, providing RESTful API endpoints for:
- Image upload and management
- Restaurant profile management
- Menu item CRUD operations
- Driver profile and custom fee management
- Ledger and settlement tracking
- Search functionality across restaurants and menu items
- Notification management

The server includes middleware for authentication token verification and role-based access control.

## Real-time Features
Real-time functionality is implemented using Firebase Realtime Database subscriptions, enabling:
- Live order status updates across all user roles
- Real-time menu item availability changes
- Instant driver assignment notifications
- Live ledger balance updates

## Payment & Financial Management
The system supports dual payment methods (cash on delivery and bank transfer) with a comprehensive ledger system for tracking driver earnings, fees, and settlements. Restaurants can manage driver payments through the ledger dashboard.

# External Dependencies

## Firebase Services
- **Firebase Authentication** - User registration, login, and session management
- **Firebase Realtime Database** - Primary data store for real-time features
- **Firebase Cloud Storage** - File upload and storage for images
- **Firebase Cloud Messaging** - Push notification delivery

## Database & ORM
- **PostgreSQL** - Structured data storage (configured but not primary)
- **Neon Database** - Serverless PostgreSQL hosting
- **Drizzle ORM** - Type-safe database queries and schema management

## UI & Styling
- **shadcn/ui** - Pre-built React component library
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Icon library

## Development Tools
- **Vite** - Build tool and development server
- **TypeScript** - Type safety and development experience
- **React Hook Form** - Form validation and management
- **Zod** - Runtime type validation
- **TanStack Query** - Server state management and caching