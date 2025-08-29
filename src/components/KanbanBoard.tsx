"use client";

import {
  Box,
  Container,
  Typography,
  Alert,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
} from "@mui/material";
import { ErrorBoundary } from "react-error-boundary";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import SearchBar from "./SearchBar";
import KanbanColumn from "./KanbanColumn";
import TaskForm from "./TaskForm";
import TaskCard from "./TaskCard";
import {
  useTasks,
  useDeleteTask,
  useCreateTask,
  useUpdateTask,
} from "@/hooks/useTasks";
import {
  useSearchQuery,
  useIsTaskFormOpen,
  useTaskFormMode,
  useSelectedTask,
  useInitialColumn,
  useCloseTaskForm,
  useSetDraggedTask,
  useSetIsDragging,
  useSetDragOverColumn,
  useDraggedTask,
} from "@/stores/kanbanStore";
import { ColumnType, TaskMutation, Task } from "@/types/task.types";
import { useState, useMemo } from "react";

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
  const isTaskFormOpen = useIsTaskFormOpen();
  const taskFormMode = useTaskFormMode();
  const selectedTask = useSelectedTask();
  const initialColumn = useInitialColumn();
  const closeTaskForm = useCloseTaskForm();

  // Drag and drop state
  const setDraggedTask = useSetDraggedTask();
  const setIsDragging = useSetIsDragging();
  const setDragOverColumn = useSetDragOverColumn();
  const draggedTask = useDraggedTask();

  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Configure drag sensors for mouse and keyboard interactions
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum distance to start dragging
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: allTasks = [], isLoading, error, isError } = useTasks();

  // Client-side filtering for search as per requirements
  const tasks = useMemo(() => {
    if (!searchQuery.trim()) return allTasks;

    const query = searchQuery.toLowerCase().trim();
    let filteredTasks = allTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
    );

    // Edge case: If a task is being dragged and gets filtered out by search,
    // keep it in the results to prevent drag operation issues
    if (
      draggedTask &&
      !filteredTasks.find((task) => task.id === draggedTask.id)
    ) {
      filteredTasks = [...filteredTasks, draggedTask];
    }

    return filteredTasks;
  }, [allTasks, searchQuery, draggedTask]);

  const deleteTaskMutation = useDeleteTask();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();

  const handleDeleteTask = (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setTaskToDelete(task);
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteTaskMutation.mutate(taskToDelete.id, {
        onSuccess: () => {
          setSuccessMessage("Task deleted successfully!");
          setDeleteDialogOpen(false);
          setTaskToDelete(null);
        },
        onError: (error) => {
          setErrorMessage(error.message || "Failed to delete task");
          setDeleteDialogOpen(false);
          setTaskToDelete(null);
        },
      });
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const handleTaskSubmit = (taskData: Omit<TaskMutation, "id">) => {
    if (taskFormMode === "create") {
      createTaskMutation.mutate(taskData, {
        onSuccess: () => {
          setSuccessMessage("Task created successfully!");
          closeTaskForm();
        },
        onError: (error) => {
          setErrorMessage(error.message || "Failed to create task");
        },
      });
    } else if (taskFormMode === "edit" && selectedTask) {
      updateTaskMutation.mutate(
        { id: selectedTask.id, updates: taskData },
        {
          onSuccess: () => {
            setSuccessMessage("Task updated successfully!");
            closeTaskForm();
          },
          onError: (error) => {
            setErrorMessage(error.message || "Failed to update task");
          },
        }
      );
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage("");
    setErrorMessage("");
  };

  // Drag and drop event handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = active.data.current?.task as Task;

    if (task) {
      setDraggedTask(task);
      setIsDragging(true);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;

    if (over) {
      const columnId = over.data.current?.columnId as ColumnType;
      if (columnId) {
        setDragOverColumn(columnId);
      }
    } else {
      setDragOverColumn(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Reset drag state
    setDraggedTask(null);
    setIsDragging(false);
    setDragOverColumn(null);

    // Note: Search state is maintained during drag operations
    // The search query remains active and will continue filtering tasks

    // If no valid drop target, show feedback
    if (!over) {
      setErrorMessage("Drop cancelled - task returned to original position");
      return;
    }

    const task = active.data.current?.task as Task;
    const targetColumnId = over.data.current?.columnId as ColumnType;

    // Validate the drop operation
    if (!task) {
      setErrorMessage("Invalid task - drop operation failed");
      return;
    }

    if (!targetColumnId) {
      setErrorMessage(
        "Invalid drop target - task returned to original position"
      );
      return;
    }

    // If task is dropped in the same column, no action needed
    if (task.column === targetColumnId) {
      return;
    }

    // Update task column with optimistic update and comprehensive error handling
    updateTaskMutation.mutate(
      {
        id: task.id,
        updates: {
          column: targetColumnId,
          updatedAt: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          const columnNames: Record<ColumnType, string> = {
            backlog: "Backlog",
            "in-progress": "In Progress",
            review: "Review",
            done: "Done",
          };
          setSuccessMessage(
            `Task "${task.title}" moved to ${columnNames[targetColumnId]}`
          );
        },
        onError: (error) => {
          // Provide specific error messages based on error type
          let errorMsg = "Failed to move task";

          if (error.message.includes("network")) {
            errorMsg =
              "Network error - task move failed. Please check your connection.";
          } else if (error.message.includes("404")) {
            errorMsg =
              "Task not found - it may have been deleted by another user.";
          } else if (error.message.includes("400")) {
            errorMsg = "Invalid task data - move operation failed.";
          } else if (error.message) {
            errorMsg = error.message;
          }

          setErrorMessage(errorMsg);
        },
      }
    );
  };

  const isFormLoading =
    createTaskMutation.isPending || updateTaskMutation.isPending;
  const formError =
    createTaskMutation.error?.message ||
    updateTaskMutation.error?.message ||
    null;

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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
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

        {/* Drag Overlay for visual feedback during drag operations */}
        <DragOverlay
          dropAnimation={{
            duration: 300,
            easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
          }}
        >
          {draggedTask ? (
            <Box
              sx={{
                transform: "rotate(5deg) scale(1.05)",
                opacity: 0.9,
                cursor: "grabbing",
                filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.3))",
                transition: "all 0.2s ease-in-out",
                zIndex: 1000,
              }}
            >
              <TaskCard task={draggedTask} isDragging />
            </Box>
          ) : null}
        </DragOverlay>

        {/* Task Form Dialog */}
        <TaskForm
          open={isTaskFormOpen}
          mode={taskFormMode}
          task={selectedTask || undefined}
          initialColumn={initialColumn || undefined}
          onSubmit={handleTaskSubmit}
          onCancel={closeTaskForm}
          isLoading={isFormLoading}
          error={formError}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCancelDelete}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6" component="div">
              Delete Task
            </Typography>
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the task &quot;
              {taskToDelete?.title}
              &quot;? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              onClick={handleCancelDelete}
              disabled={deleteTaskMutation.isPending}
              color="inherit"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={deleteTaskMutation.isPending}
              color="error"
              variant="contained"
              sx={{ minWidth: 100 }}
            >
              {deleteTaskMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success/Error Notifications */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          message={successMessage}
        />
        <Snackbar
          open={!!errorMessage}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert severity="error" onClose={handleCloseSnackbar}>
            {errorMessage}
          </Alert>
        </Snackbar>
      </DndContext>
    </ErrorBoundary>
  );
}
