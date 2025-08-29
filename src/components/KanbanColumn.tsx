/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Box, Paper, Typography, Chip, Stack, alpha } from "@mui/material";
import { Assignment } from "@mui/icons-material";
import { useDroppable } from "@dnd-kit/core";
import { useDragOverColumn, useSetDragOverColumn } from "@/stores/kanbanStore";
import { Task, ColumnType } from "@/types/task.types";

interface KanbanColumnProps {
  columnId: ColumnType;
  title: string;
  tasks: Task[];
  onTaskDrop?: (taskId: number, newColumn: ColumnType) => void;
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
  tasks,
  onTaskDrop,
}: KanbanColumnProps) {
  const dragOverColumn = useDragOverColumn();
  const setDragOverColumn = useSetDragOverColumn();
  const columnColor = COLUMN_COLORS[columnId];

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
        height: "fit-content",
        minHeight: 400,
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
              label={tasks.length}
              size="small"
              sx={{
                backgroundColor: columnColor,
                color: "white",
                fontWeight: 600,
                minWidth: 24,
                height: 20,
                "& .MuiChip-label": {
                  px: 1,
                },
              }}
            />
          </Stack>
        </Stack>
      </Box>

      {/* Column Content - Drop Zone */}
      <Box
        sx={{
          flex: 1,
          p: 2,
          minHeight: 300,
          position: "relative",
          backgroundColor: shouldHighlight
            ? alpha(columnColor, 0.05)
            : "transparent",
          transition: "background-color 0.2s ease-in-out",
        }}
      >
        {/* Tasks will be rendered here */}
        {tasks.length > 0 ? (
          <Stack spacing={2}>
            {tasks.map((task) => (
              <Paper
                key={task.id}
                elevation={1}
                sx={{
                  p: 2,
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    elevation: 3,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {task.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {task.description}
                </Typography>
                {task.tags && task.tags.length > 0 && (
                  <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                    {task.tags.slice(0, 3).map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: "0.75rem" }}
                      />
                    ))}
                    {task.tags.length > 3 && (
                      <Chip
                        label={`+${task.tags.length - 3}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: "0.75rem" }}
                      />
                    )}
                  </Stack>
                )}
              </Paper>
            ))}
          </Stack>
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
              py: 4,
              border: shouldHighlight
                ? `2px dashed ${alpha(columnColor, 0.5)}`
                : `2px dashed ${alpha(columnColor, 0.1)}`,
              borderRadius: 2,
              backgroundColor: shouldHighlight
                ? alpha(columnColor, 0.05)
                : "transparent",
              transition: "all 0.2s ease-in-out",
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
                : 'Drag tasks here or use "Add Task" button above to get started'}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
