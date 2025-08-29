"use client";

import React from "react";
import {
  Box,
  Stack,
  Alert,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import { Task, ColumnType } from "@/types/task.types";
import TaskCard from "./TaskCard";
import PaginationControls from "./PaginationControls";

interface PaginationContainerProps {
  columnId: ColumnType;
  tasks: Task[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onTaskDelete?: (taskId: number) => void;
  isLoading: boolean;
  error: Error | null;
  refetch?: () => void;
  searchQuery?: string;
  columnColor: string;
}

export default function PaginationContainer({
  columnId,
  tasks,
  currentPage,
  totalPages,
  onPageChange,
  onTaskDelete,
  isLoading,
  error,
  refetch,
  searchQuery,
  columnColor,
}: PaginationContainerProps) {
  // Handle retry on error
  const handleRetry = () => {
    if (refetch) {
      refetch();
    }
  };

  // Show initial loading state
  if (isLoading && tasks.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 200,
          p: 3,
        }}
      >
        <CircularProgress size={32} sx={{ color: columnColor, mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Loading tasks...
        </Typography>
      </Box>
    );
  }

  // Show error state
  if (error && tasks.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={handleRetry}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          }
        >
          Failed to load tasks. Please try again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
      }}
    >
      {/* Task List */}
      <Box
        sx={{
          flex: 1,
          p: 2,
          pb: 1,
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "rgba(0,0,0,0.1)",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: columnColor,
            borderRadius: "3px",
            opacity: 0.3,
            "&:hover": {
              opacity: 0.5,
            },
          },
        }}
      >
        {tasks.length > 0 ? (
          <Stack spacing={2}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={onTaskDelete}
                searchQuery={searchQuery}
              />
            ))}
          </Stack>
        ) : (
          // Empty state
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 200,
              textAlign: "center",
              color: "text.secondary",
            }}
          >
            <Typography variant="body2" sx={{ mb: 1 }}>
              No tasks found
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {searchQuery
                ? "Try adjusting your search query"
                : "Create a new task to get started"}
            </Typography>
          </Box>
        )}

        {/* Loading overlay for page changes */}
        {isLoading && tasks.length > 0 && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
          >
            <CircularProgress size={32} sx={{ color: columnColor }} />
          </Box>
        )}
      </Box>

      {/* Pagination Controls */}
      <PaginationControls
        columnId={columnId}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        isLoading={isLoading}
        columnColor={columnColor}
      />
    </Box>
  );
}
