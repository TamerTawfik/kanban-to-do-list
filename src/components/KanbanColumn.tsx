/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Box, Paper, Typography, Chip, Stack, alpha } from "@mui/material";
import { Assignment } from "@mui/icons-material";
import { useDroppable } from "@dnd-kit/core";
import {
  useDragOverColumn,
  useSetDragOverColumn,
  useColumnPaginationState,
  useSetCurrentPage,
} from "@/stores/kanbanStore";
import { Task, ColumnType } from "@/types/task.types";
import { usePaginatedColumnTasks } from "@/hooks/usePaginatedColumnTasks";
import PaginationContainer from "./PaginationContainer";

interface KanbanColumnProps {
  columnId: ColumnType;
  title: string;
  searchQuery?: string;
  onTaskDelete?: (taskId: number) => void;
}

// Column color mapping for visual distinction
const COLUMN_COLORS: Record<ColumnType, string> = {
  backlog: "#1976d2", // Blue
  "in-progress": "#ed6c02", // Orange
  review: "#9c27b0", // Purple
  done: "#2e7d32", // Green
};

export default function KanbanColumn({
  columnId,
  title,
  searchQuery,
  onTaskDelete,
}: KanbanColumnProps) {
  const dragOverColumn = useDragOverColumn();
  const setDragOverColumn = useSetDragOverColumn();
  const columnColor = COLUMN_COLORS[columnId];

  // Get pagination state for this column
  const paginationState = useColumnPaginationState(columnId);
  const setCurrentPage = useSetCurrentPage();

  console.log(
    `[KanbanColumn] ${columnId} - Current pagination state:`,
    paginationState
  );

  // Use pagination hook for this column
  const {
    tasks,
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    error,
    refetch,
    data,
  } = usePaginatedColumnTasks({
    columnId,
    page: paginationState.currentPage,
    searchQuery,
    pageSize: 10,
  });

  // Calculate total tasks from pagination metadata
  const totalTasks = data?.total ?? 0;

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(columnId, page);
  };

  // Set up drop zone for drag and drop
  const { isOver, setNodeRef } = useDroppable({
    id: `column-${columnId}`,
    data: {
      type: "column",
      columnId,
    },
  });

  // Handle drag over effects
  const isDraggedOver = isOver || dragOverColumn === columnId;
  const shouldHighlight = isDraggedOver;

  return (
    <Paper
      ref={setNodeRef}
      elevation={shouldHighlight ? 4 : 2}
      sx={{
        height: 520, // Increased height to provide more scroll space
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.paper",
        border: `2px solid ${alpha(columnColor, shouldHighlight ? 0.4 : 0.1)}`,
        borderRadius: 2,
        overflow: "hidden",
        transition: "all 0.2s ease-in-out",
        transform: shouldHighlight ? "scale(1.02)" : "scale(1)",
        boxShadow: shouldHighlight
          ? `0 8px 32px ${alpha(columnColor, 0.3)}`
          : undefined,
      }}
    >
      {/* Column Header */}
      <Box
        sx={{
          p: 2,
          backgroundColor: alpha(columnColor, 0.1),
          borderBottom: `1px solid ${alpha(columnColor, 0.2)}`,
          flexShrink: 0, // Prevent header from shrinking
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              variant="h6"
              component="h2"
              sx={{
                fontWeight: 600,
                color: columnColor,
                textTransform: "uppercase",
                fontSize: "0.875rem",
                letterSpacing: 0.5,
              }}
            >
              {title}
            </Typography>
            <Chip
              label={totalTasks}
              size="small"
              sx={{
                backgroundColor: columnColor,
                color: "white",
                fontWeight: 600,
                minWidth: 24,
                height: 20,
                "& .MuiChip-label": {
                  px: 1,
                  fontSize: "0.75rem",
                },
              }}
            />
          </Stack>
        </Stack>
      </Box>

      {/* Column Content - Drop Zone with Scrollable Container */}
      <Box
        sx={{
          flex: 1,
          position: "relative",
          backgroundColor: shouldHighlight
            ? alpha(columnColor, 0.05)
            : "transparent",
          transition: "background-color 0.2s ease-in-out",
          overflow: "auto", // Enable scrolling for the content
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: alpha(columnColor, 0.1),
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: alpha(columnColor, 0.3),
            borderRadius: "3px",
            "&:hover": {
              backgroundColor: alpha(columnColor, 0.5),
            },
          },
        }}
      >
        {/* Pagination Container */}
        {tasks.length > 0 || isLoading ? (
          <PaginationContainer
            columnId={columnId}
            tasks={tasks}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onTaskDelete={onTaskDelete}
            isLoading={isLoading}
            error={error}
            refetch={refetch}
            searchQuery={searchQuery}
            columnColor={columnColor}
          />
        ) : (
          // Empty state with drop zone indication
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "text.secondary",
              textAlign: "center",
              p: 3,
              border: shouldHighlight
                ? `2px dashed ${alpha(columnColor, 0.5)}`
                : `2px dashed ${alpha(columnColor, 0.1)}`,
              borderRadius: 2,
              backgroundColor: shouldHighlight
                ? alpha(columnColor, 0.05)
                : "transparent",
              transition: "all 0.2s ease-in-out",
              m: 2,
            }}
          >
            <Assignment
              sx={{
                fontSize: 48,
                color: shouldHighlight
                  ? alpha(columnColor, 0.6)
                  : alpha(columnColor, 0.3),
                mb: 2,
                transition: "color 0.2s ease-in-out",
              }}
            />
            <Typography
              variant="body2"
              sx={{
                mb: 1,
                color: shouldHighlight ? columnColor : "text.secondary",
                fontWeight: shouldHighlight ? 600 : 400,
                transition: "all 0.2s ease-in-out",
              }}
            >
              {shouldHighlight
                ? `Drop task in ${title.toLowerCase()}`
                : `No tasks in ${title.toLowerCase()}`}
            </Typography>
            <Typography
              variant="caption"
              color={shouldHighlight ? columnColor : "text.disabled"}
              sx={{ transition: "color 0.2s ease-in-out" }}
            >
              {shouldHighlight
                ? "Release to add task here"
                : searchQuery
                ? "No tasks match your search"
                : "Drag tasks here or create a new task to get started"}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
