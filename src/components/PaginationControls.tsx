"use client";

import React from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  IconButton,
  alpha,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  FirstPage,
  LastPage,
} from "@mui/icons-material";
import { ColumnType } from "@/types/task.types";

interface PaginationControlsProps {
  columnId: ColumnType;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  columnColor: string;
}

export default function PaginationControls({
  columnId,
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  columnColor,
}: PaginationControlsProps) {
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // Generate page numbers to show (max 5 pages around current)
  const getVisiblePages = () => {
    const pages: number[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisible - 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  if (totalPages <= 1) {
    return null; // Don't show pagination if there's only one page or no pages
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        p: 2,
        borderTop: `1px solid ${alpha(columnColor, 0.2)}`,
        backgroundColor: alpha(columnColor, 0.05),
      }}
    >
      {/* Page info */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontSize: "0.75rem" }}
      >
        Page {currentPage} of {totalPages}
      </Typography>

      {/* Navigation controls */}
      <Stack direction="row" spacing={0.5} alignItems="center">
        {/* First page */}
        <IconButton
          size="small"
          onClick={() => onPageChange(1)}
          disabled={!hasPreviousPage || isLoading}
          sx={{
            color: columnColor,
            "&:disabled": { color: "text.disabled" },
          }}
        >
          <FirstPage fontSize="small" />
        </IconButton>

        {/* Previous page */}
        <IconButton
          size="small"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage || isLoading}
          sx={{
            color: columnColor,
            "&:disabled": { color: "text.disabled" },
          }}
        >
          <ChevronLeft fontSize="small" />
        </IconButton>

        {/* Page numbers */}
        {visiblePages.map((page) => (
          <Button
            key={page}
            size="small"
            variant={page === currentPage ? "contained" : "text"}
            onClick={() => onPageChange(page)}
            disabled={isLoading}
            sx={{
              minWidth: 32,
              height: 32,
              fontSize: "0.75rem",
              backgroundColor:
                page === currentPage ? columnColor : "transparent",
              color: page === currentPage ? "white" : columnColor,
              "&:hover": {
                backgroundColor:
                  page === currentPage ? columnColor : alpha(columnColor, 0.1),
              },
              "&:disabled": {
                color: "text.disabled",
                backgroundColor: "transparent",
              },
            }}
          >
            {page}
          </Button>
        ))}

        {/* Next page */}
        <IconButton
          size="small"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage || isLoading}
          sx={{
            color: columnColor,
            "&:disabled": { color: "text.disabled" },
          }}
        >
          <ChevronRight fontSize="small" />
        </IconButton>

        {/* Last page */}
        <IconButton
          size="small"
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage || isLoading}
          sx={{
            color: columnColor,
            "&:disabled": { color: "text.disabled" },
          }}
        >
          <LastPage fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );
}
