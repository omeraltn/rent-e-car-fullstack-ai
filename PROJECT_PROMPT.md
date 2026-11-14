## Role & Objective
You are a Senior Full-Stack Next.js Architect and Developer. Your objective is to build a full-stack Car Rental web application ("Rent-e-Car") using Next.js (App Router) for both frontend and backend, backed by MongoDB. 

Do NOT attempt to write the entire codebase in a single response. You must propose and follow a structured, step-by-step phased implementation plan, pausing for my review and approval after completing each phase.

---

## Tech Stack & Architecture
- **Framework:** Next.js (App Router, Server Actions / Route Handlers for Backend API)
- **Database:** MongoDB (with Mongoose ODM)
- **Authentication:** NextAuth.js (Auth.js)
- **Styling:** Tailwind CSS (strictly based on the existing files in the `/design` directory)

---

## Core Functional Requirements

### 1. Authentication System (`NextAuth.js`)
- Implement user authentication supporting both:
  1. **Credentials Provider:** Email and Password (with `bcrypt` password hashing).
  2. **OAuth Provider:** Google Sign-In.
- Provide complete Login and Register flows connected to the MongoDB `User` collection.
- Handle session management, protected routes, and role/user state across the application.

### 2. Vehicle Catalog & Data Model (`MongoDB`)
- Design a comprehensive `Vehicle` schema containing all essential details a car rental customer would care about:
  - Basic Info: `brand`, `model`, `year`, `category` (SUV, Sedan, Electric, Luxury, etc.), `description`.
  - Technical Specs: `transmission` (Automatic/Manual), `fuelType` (Electric, Hybrid, Petrol, Diesel), `rangeOrConsumption`, `seats`, `doors`, `luggageCapacity`, `horsepower`.
  - Rental Info: `pricePerDay`, `depositAmount`, `mileageLimit`, `minimumDriverAge`, `features` (array of strings like GPS, Autopilot, Heated Seats, Apple CarPlay), `availabilityStatus`, `location`, `rating`, `reviewCount`.
  - Image Reference: A lightweight identifier/slug or static filename reference (see Image Constraint below).
- **Query Capabilities:** The vehicle listing API/data layer MUST support:
  - **Filtering:** By category, brand, transmission, fuel type, price range, seat count, and availability.
  - **Sorting:** By price (low-to-high, high-to-low), rating, and newest year.
  - **Pagination:** Page-based or limit/offset pagination with total count metadata.

### 3. UI/UX & `/design` Folder Integration
- Inspect the `/design` directory in the workspace before writing any UI code.
- This folder contains screenshots and HTML/Tailwind CSS reference files for all pages.
- Convert those HTML + Tailwind templates into modular, reusable, and responsive Next.js React components while preserving the exact visual design, layout, color tokens, and typography.

### 4. Bookings & Stripe Payment (Placeholder Only)
- The platform will eventually use **Stripe** for rental checkout and payments.
- **CRITICAL:** Do NOT write any Stripe backend integration, Stripe SDK setup, Checkout session creation, or Webhook handlers right now. I will implement the Stripe logic myself later.
- Only prepare the necessary database fields (e.g., `paymentStatus`, `stripeSessionId` as optional fields in a `Booking` schema) and clean UI/API entry points where I can easily plug in Stripe later.

---

## Strict Constraints (What NOT To Do)
1. **NO Backend Image Storage:** Do NOT build file upload endpoints, blob storage, Cloudinary/S3 integrations, or store binary images in MongoDB. Vehicle images will be handled entirely on the frontend (via static assets in `/public` or a frontend mapping helper linked by vehicle slug/key).
2. **NO Stripe Implementation:** Do not install or configure the `stripe` package or write payment processing logic. Leave clear `// TODO: Stripe Integration` comments at the checkout handoff point.
3. **NO Monolithic Generation:** Do not dump the entire project at once. Work incrementally.

---

## Phased Execution Plan
Please execute this project in the following logical phases. **Start by inspecting the workspace and `/design` folder, then present your detailed plan for Phase 1 and ask for my confirmation before writing code.**

- **Phase 1: Discovery, Database Architecture & Seed Data**
  - Inspect existing project structure, Next.js version/docs, and the `/design` directory.
  - Set up MongoDB connection utility and Mongoose schemas (`User`, `Vehicle`, `Booking`).
  - Create a database seeding script with realistic car rental data.
- **Phase 2: Backend API & Authentication**
  - Configure `NextAuth.js` (Email/Password + Google OAuth) and user registration endpoints.
  - Build Vehicle API endpoints / data-fetching functions with full filtering, sorting, and pagination support.
- **Phase 3: Core Layout & Shared UI Components**
  - Translate `/design` global styles, Navbar, Footer, and common UI primitives into Next.js components.
- **Phase 4: Feature Pages & Frontend Integration**
  - Implement Home, Vehicle Listing (connected to filter/sort/pagination), Vehicle Detail, and Auth (Login/Register) pages using `/design` HTML/Tailwind files.
  - Connect frontend vehicle cards/galleries to frontend-managed vehicle images.
- **Phase 5: Booking Flow & Checkout Handoff**
  - Build the reservation UI and booking creation flow up to the payment step, leaving a clean hook for future Stripe integration.