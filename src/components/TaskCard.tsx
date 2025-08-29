"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Chip,
  Stack,
  Box,
  Tooltip,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Schedule as ScheduleIcon,
  Flag as FlagIcon,
} from "@mui/icons-material";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Task, ColumnType } from "@/types/task.types";
import { useOpenTaskForm, useSearchQuery } from "@/stores/kanbanStore";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: number) => void;
  isDragging?: boolean;
  searchQuery?: string;
}

// Priority color mapping
const PRIORITY_COLORS: Record<string, string> = {
  low: "#4caf50", // Green
  medium: "#ff9800", // Orange
  high: "#f44336", // Red
};

// Column color mapping for visual distinction
const COLUMN_COLORS: Record<ColumnType, string> = {
  backlog: "#1976d2", // Blue
  "in-progress": "#ed6c02", // Orange
  review: "#9c27b0", // Purple
  done: "#2e7d32", // Green
};

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  isDragging = false,
  searchQuery: propSearchQuery,
}: TaskCardProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const openTaskForm = useOpenTaskForm();
  const storeSearchQuery = useSearchQuery();

  // Use prop search query if provided, otherwise use store search query
  const searchQuery = propSearchQuery || storeSearchQuery;

  // Set up draggable functionality
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDragActive,
  } = useDraggable({
    id: `task-${task.id}`,
    data: {
      type: "task",
      task,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  // Handle edit click
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(task);
    } else {
      openTaskForm("edit", task);
    }
  };

  // Handle delete click
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(task.id);
    }
  };

  // Handle card click (for task selection/viewing)
  const handleCardClick = () => {
    openTaskForm("edit", task);
  };

  // Highlight search matches in text
  const highlightSearchText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <Box
          key={index}
          component="span"
          sx={{
            backgroundColor: alpha(theme.palette.warning.main, 0.3),
            fontWeight: 600,
            borderRadius: 0.5,
            px: 0.25,
          }}
        >
          {part}
        </Box>
      ) : (
        part
      )
    );
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return null;
    }
  };

  const columnColor = COLUMN_COLORS[task.column];
  const priorityColor = task.priority
    ? PRIORITY_COLORS[task.priority]
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      sx={{
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        opacity: isDragActive ? 0.5 : 1,
        transform: isDragActive ? "rotate(5deg)" : "none",
        border: `1px solid ${alpha(columnColor, 0.2)}`,
        borderLeft: `4px solid ${columnColor}`,
        "&:hover": {
          elevation: 4,
          transform: isDragActive ? "rotate(5deg)" : "translateY(-2px)",
          borderColor: alpha(columnColor, 0.4),
          boxShadow: `0 4px 20px ${alpha(columnColor, 0.2)}`,
        },
        // Mobile optimizations
        ...(isMobile && {
          mx: 0,
          "& .MuiCardContent-root": {
            pb: 1,
          },
          "& .MuiCardActions-root": {
            pt: 0,
            px: 2,
            pb: 1,
          },
        }),
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ pb: 1 }}>
        {/* Task Header with Drag Handle */}
        <Stack
          direction="row"
          alignItems="flex-start"
          spacing={1}
          sx={{ mb: 1 }}
        >
          {/* Drag Handle */}
          <IconButton
            {...attributes}
            {...listeners}
            size="small"
            sx={{
              cursor: "grab",
              color: "text.secondary",
              p: 0.5,
              mt: -0.5,
              "&:active": {
                cursor: "grabbing",
              },
              "&:hover": {
                color: columnColor,
                backgroundColor: alpha(columnColor, 0.1),
              },
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <DragIcon fontSize="small" />
          </IconButton>

          {/* Task Title */}
          <Typography
            variant="subtitle1"
            component="h3"
            sx={{
              fontWeight: 600,
              flex: 1,
              lineHeight: 1.3,
              wordBreak: "break-word",
              fontSize: isMobile ? "0.9rem" : "1rem",
            }}
          >
            {highlightSearchText(task.title, searchQuery)}
          </Typography>

          {/* Priority Indicator */}
          {task.priority && (
            <Tooltip title={`Priority: ${task.priority}`}>
              <FlagIcon
                sx={{
                  fontSize: 16,
                  color: priorityColor,
                  mt: 0.25,
                }}
              />
            </Tooltip>
          )}
        </Stack>

        {/* Task Description */}
        {task.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: isMobile ? 2 : 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.4,
              fontSize: isMobile ? "0.8rem" : "0.875rem",
            }}
          >
            {highlightSearchText(task.description, searchQuery)}
          </Typography>
        )}

        {/* Task Metadata */}
        <Stack spacing={1}>
          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {task.tags.slice(0, isMobile ? 2 : 3).map((tag, index) => (
                <Chip
                  key={index}
                  label={highlightSearchText(tag, searchQuery)}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: "0.7rem",
                    height: 20,
                    borderColor: alpha(columnColor, 0.3),
                    color: columnColor,
                    "&:hover": {
                      backgroundColor: alpha(columnColor, 0.1),
                    },
                  }}
                />
              ))}
              {task.tags.length > (isMobile ? 2 : 3) && (
                <Chip
                  label={`+${task.tags.length - (isMobile ? 2 : 3)}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: "0.7rem",
                    height: 20,
                    borderColor: alpha(theme.palette.text.secondary, 0.3),
                    color: "text.secondary",
                  }}
                />
              )}
            </Stack>
          )}

          {/* Dates */}
          {(task.createdAt || task.updatedAt) && (
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{ color: "text.disabled" }}
            >
              <ScheduleIcon sx={{ fontSize: 12 }} />
              <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
                {task.updatedAt && task.updatedAt !== task.createdAt
                  ? `Updated ${formatDate(task.updatedAt)}`
                  : `Created ${formatDate(task.createdAt)}`}
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>

      {/* Action Buttons */}
      <CardActions
        sx={{
          justifyContent: "flex-end",
          pt: 0,
          px: 2,
          pb: 1.5,
        }}
      >
        <Tooltip title="Edit task">
          <IconButton
            size="small"
            onClick={handleEditClick}
            sx={{
              color: "text.secondary",
              "&:hover": {
                color: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete task">
          <IconButton
            size="small"
            onClick={handleDeleteClick}
            sx={{
              color: "text.secondary",
              "&:hover": {
                color: theme.palette.error.main,
                backgroundColor: alpha(theme.palette.error.main, 0.1),
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
