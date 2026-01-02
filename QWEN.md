# Manufacturing Execution System (MES) Frontend

## Project Overview

This is a React-based Manufacturing Execution System (MES) frontend application built with TypeScript, React 19, Vite, and Zustand for state management. The application serves as a comprehensive dashboard and management system for manufacturing operations, including project management, material tracking, machine monitoring, procurement, and production reporting.

The application connects to a backend API (configured via environment variables) and provides a complete suite of tools for managing manufacturing workflows from project planning to delivery.

### Key Features

- **Project Management**: Create, track, and manage manufacturing projects with detailed workflows
- **Material Management**: Track raw materials, finished goods, and inventory levels
- **Machine Monitoring**: Monitor machine status, capacity, and maintenance schedules
- **Production Tracking**: Real-time production reporting with quality metrics
- **Procurement Management**: Request for quotations (RFQ), purchase orders, and receiving goods
- **Delivery Management**: Create and track delivery orders
- **User Management**: Role-based access control with different permission levels
- **Executive Dashboard**: High-level overview of production metrics and KPIs
- **Machine Board**: Real-time view of machine operations and tasks
- **TV Display**: Large-screen display for production floor monitoring

### Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **UI Components**: React Router DOM for navigation, Lucide React for icons
- **Charts**: Recharts for data visualization
- **Styling**: Tailwind CSS (inferred from typical usage patterns)

## Building and Running

### Prerequisites

- Node.js (version compatible with the project dependencies)

### Installation and Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env` to `.env.local` if it doesn't exist
   - Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key
   - The API base URL is configured in `.env` as `VITE_API_BASE_URL`

3. **Run the application in development mode:**
   ```bash
   npm run dev
   ```
   The application will start on port 3000 and be accessible at `http://localhost:3000`

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build:**
   ```bash
   npm run preview
   ```

## Project Structure

```
frontend/
├── App.tsx                 # Main application component with routing
├── index.html             # HTML entry point
├── index.tsx              # React application entry point
├── package.json           # Project dependencies and scripts
├── vite.config.ts         # Vite build configuration
├── .env                   # Environment variables
├── types.ts               # TypeScript type definitions
├── components/            # Reusable UI components
├── lib/                   # Utility functions and API calls
├── pages/                 # Route components
├── store/                 # Zustand store implementation
└── tsconfig.json          # TypeScript configuration
```

## Key Components

### State Management (Zustand Store)

The application uses a centralized Zustand store (`store/useStore.ts`) that manages:

- User authentication and permissions
- Project data and status
- Material inventory and procurement
- Machine status and maintenance
- Production tasks and workflows
- Sub-assemblies and BOM (Bill of Materials)
- Production logs and reporting

### API Integration

The application communicates with a backend API through functions in `lib/api.ts`:

- Authentication (login, logout, profile)
- CRUD operations for projects, materials, machines, users
- Procurement workflows (RFQs, purchase orders, receiving goods)
- Production tracking and reporting
- Delivery order management

### Routing

The application uses React Router with protected routes that require authentication. Key routes include:

- `/login` - Authentication page
- `/` - Dashboard
- `/projects` - Project management
- `/materials` - Material management
- `/machines` - Machine monitoring
- `/procurement` - Procurement workflows
- `/warehouse` - Warehouse management
- `/delivery-orders` - Delivery management
- `/machine-board` - Real-time machine operations
- `/tv-display` - Large-screen display for production floor
- `/reports` - Production reports
- `/users` - User management
- `/settings` - Application settings

### Data Models

Key data models defined in `types.ts`:

- **Project**: Manufacturing projects with status, deadlines, and progress
- **Material**: Raw materials, finished goods with inventory tracking
- **Machine**: Production equipment with status and capacity
- **Task**: Production tasks assigned to machines and operators
- **SubAssembly**: Component parts with production workflows
- **User**: System users with role-based permissions
- **RFQ/PurchaseOrder/ReceivingGoods**: Procurement workflow entities
- **DeliveryOrder**: Product delivery tracking

## Development Conventions

### TypeScript Usage

The application makes extensive use of TypeScript for type safety, with comprehensive type definitions in `types.ts`. All API responses and state objects are strongly typed.

### API Communication

API calls follow a consistent pattern with proper error handling and conversion between frontend and backend field naming conventions. The application gracefully handles network errors and unauthorized responses.

### Authentication and Authorization

The application implements role-based access control with different permission levels (ADMIN, OPERATOR, MANAGER). Authentication tokens are stored in localStorage and included in API requests.

### State Management

The Zustand store provides a single source of truth for application state. Complex state operations like production reporting and workflow validation are handled within the store.

## Special Features

### Production Workflow Management

The system supports complex production workflows with multiple process steps (POTONG, PLONG, PRESS, LAS, PHOSPHATING, CAT, PACKING) and tracks production progress through each step.

### Sub-Assembly Tracking

The application supports hierarchical production with sub-assemblies that have their own production workflows and tracking.

### Real-time Production Monitoring

The machine board and TV display provide real-time visibility into production status, machine operations, and task progress.

### Procurement Integration

Complete procurement workflow from RFQ creation through purchase orders to receiving goods with inventory updates.

### Quality Control

Production reporting includes defect tracking and quality metrics for each production task.