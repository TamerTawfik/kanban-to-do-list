# Kanban To-Do List Dashboard

A fully interactive Kanban-style task management board built with Next.js 15, React 19, and Material-UI. This application provides a visual interface for organizing tasks across different stages of completion with drag-and-drop functionality and persistent local storage.

## Features

Build a fully interactive Kanban-style board with the following features:

- [x] Display tasks in 4 columns (Backlog, In Progress, Review, Done)
- [x] Create, Update, and Delete tasks
- [x] Drag-and-drop support to move tasks between columns
- [x] Pagination or Infinite Scroll in each column
- [x] Search by task title or description
- [x] React Query caching for efficient data access

## Technology Stack

- **Next.js 15.5.2** with App Router and Turbopack
- **React 19.1.0** with TypeScript
- **Material-UI (MUI) v7** for component library
- **Zustand** for client-side state management
- **TanStack React Query v5** for server state and caching
- **@dnd-kit** for drag-and-drop functionality
- **Local Storage** for data persistence (with initial data from external API)

## Project Setup

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:

```bash
npm run dev
```

This will start the Next.js development server on [http://localhost:3000](http://localhost:3000).

The application will automatically:

- Load initial task data from the external API on first visit
- Store all data locally using browser localStorage
- Work offline after the initial data load

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production with Turbopack
npm run start        # Start production server
npm run lint         # Run ESLint checks
```

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # Root layout with providers
│   ├── page.tsx        # Main application page
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── KanbanBoard.tsx # Main board container
│   ├── KanbanColumn.tsx# Individual column component
│   ├── TaskCard.tsx    # Task display component
│   ├── TaskForm.tsx    # Task creation/editing form
│   └── SearchBar.tsx   # Search functionality
├── hooks/              # Custom React hooks
├── services/           # API services
├── stores/             # Zustand stores
├── types/              # TypeScript definitions
└── providers/          # React context providers
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Data Management

The application uses a hybrid approach for data management:

1. **Initial Load**: Fetches task data from `https://my-json-server.typicode.com/TamerTawfik/json/tasks`
2. **Local Storage**: All CRUD operations are performed locally using browser localStorage
3. **Persistence**: Data persists across browser sessions
4. **Offline Support**: Works completely offline after initial data load

### Data Reset

To reset the application data and re-fetch from the API:

```javascript
// In browser console
import { resetData } from "./src/services/taskApi";
await resetData();
```

## Deploy on Vercel

The application is now ready for deployment without any external dependencies. Simply deploy to [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) or any other hosting platform.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
