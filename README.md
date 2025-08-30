# Kanban To-Do List Dashboard

A fully interactive Kanban-style task management board built with Next.js 15, React 19, and Material-UI. This application provides a visual interface for organizing tasks across different stages of completion with drag-and-drop functionality and real-time updates.

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
- **JSON Server** for local API development

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

Start the development server with JSON server:

```bash
npm run dev
```

This will start:

- Next.js development server on [http://localhost:3000](http://localhost:3000)
- JSON Server API on [http://localhost:4000](http://localhost:4000)

### Available Scripts

```bash
npm run dev          # Start development server with JSON server
npm run json-server  # Run only the JSON server (port 4000)
npm run build        # Build for production with Turbopack
npm run start        # Start production server with JSON server
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

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
