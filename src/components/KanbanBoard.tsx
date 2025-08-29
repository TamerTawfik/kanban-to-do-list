"use client";

import {
  Box,
  Container,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { ErrorBoundary } from "react-error-boundary";
import SearchBar from "./SearchBar";
import KanbanColumn from "./KanbanColumn";
import { useTasks, useDeleteTask } from "@/hooks/useTasks";
import { useSearchQuery } from "@/stores/kanbanStore";
import { ColumnType } from "@/types/task.types";

// Error fallback component
function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <Alert
      severity="error"
      action={<button onClick={resetErrorBoundary}>Try again</button>}
    >
      <Typography variant="h6">Something went wrong:</Typography>
      <Typography variant="body2">{error.message}</Typography>
    </Alert>
  );
}

// Column configuration
const COLUMNS: Array<{ id: ColumnType; title: string }> = [
  { id: "backlog", title: "Backlog" },
  { id: "in-progress", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" },
];

export default function KanbanBoard() {
  const searchQuery = useSearchQuery();
  const {
    data: tasks = [],
    isLoading,
    error,
    isError,
  } = useTasks({
    search: searchQuery || undefined,
  });

  const deleteTaskMutation = useDeleteTask();

  const handleDeleteTask = (taskId: number) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  if (isError) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          <Typography variant="h6">Failed to load tasks</Typography>
          <Typography variant="body2">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred"}
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header with search */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: "primary.main",
              textAlign: "center",
              mb: 3,
            }}
          >
            Kanban Board
          </Typography>

          <Box sx={{ maxWidth: 600, mx: "auto" }}>
            <SearchBar placeholder="Search tasks by title or description..." />
          </Box>
        </Box>

        {/* Loading state */}
        {isLoading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 400,
            }}
          >
            <CircularProgress size={60} />
          </Box>
        )}

        {/* Kanban columns */}
        {!isLoading && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 3,
            }}
          >
            {COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                columnId={column.id}
                title={column.title}
                tasks={tasks.filter((task) => task.column === column.id)}
                onTaskDelete={handleDeleteTask}
              />
            ))}
          </Box>
        )}

        {/* Empty state when no tasks and not loading */}
        {!isLoading && tasks.length === 0 && !searchQuery && (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              color: "text.secondary",
            }}
          >
            <Typography variant="h5" gutterBottom>
              No tasks yet
            </Typography>
            <Typography variant="body1">
              Create your first task to get started with your Kanban board
            </Typography>
          </Box>
        )}

        {/* No search results */}
        {!isLoading && tasks.length === 0 && searchQuery && (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              color: "text.secondary",
            }}
          >
            <Typography variant="h5" gutterBottom>
              No tasks found
            </Typography>
            <Typography variant="body1">
              Try adjusting your search terms or create a new task
            </Typography>
          </Box>
        )}
      </Container>
    </ErrorBoundary>
  );
}
