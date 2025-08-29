"use client";

import {
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Box,
} from "@mui/material";
import { Search, Clear, Add } from "@mui/icons-material";
import {
  useSearchQuery,
  useSetSearchQuery,
  useClearSearch,
  useOpenTaskForm,
  useResetPaginationForSearch,
} from "@/stores/kanbanStore";
import { useCallback, useEffect, useState, useRef } from "react";

interface SearchBarProps {
  placeholder?: string;
}

export default function SearchBar({
  placeholder = "Search tasks...",
}: SearchBarProps) {
  const searchQuery = useSearchQuery();
  const setSearchQuery = useSetSearchQuery();
  const clearSearch = useClearSearch();
  const resetPaginationForSearch = useResetPaginationForSearch();
  const openTaskForm = useOpenTaskForm();
  const [localValue, setLocalValue] = useState(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search input and reset pagination when search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmedValue = localValue.trim();
      const currentQuery = searchQuery.trim();

      // Only update if the search query actually changed
      if (trimmedValue !== currentQuery) {
        setSearchQuery(trimmedValue);
        // Reset pagination for all columns when search changes
        resetPaginationForSearch();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue, setSearchQuery, searchQuery, resetPaginationForSearch]);

  // Sync with store when external changes occur
  useEffect(() => {
    setLocalValue(searchQuery);
  }, [searchQuery]);

  // Global keyboard shortcut to focus search
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
      // Forward slash (/) to focus search (like GitHub)
      if (
        event.key === "/" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        // Only if not typing in an input/textarea
        const activeElement = document.activeElement;
        if (
          activeElement?.tagName !== "INPUT" &&
          activeElement?.tagName !== "TEXTAREA" &&
          !activeElement?.hasAttribute("contenteditable")
        ) {
          event.preventDefault();
          inputRef.current?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handleClear = useCallback(() => {
    setLocalValue("");
    clearSearch();
    // Reset pagination when clearing search
    resetPaginationForSearch();
  }, [clearSearch, resetPaginationForSearch]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClear();
      }
      // Ctrl/Cmd + K to focus search (common shortcut)
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        (event.target as HTMLInputElement).focus();
      }
    },
    [handleClear]
  );

  const handleAddTask = useCallback(() => {
    openTaskForm("create");
  }, [openTaskForm]);

  return (
    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        inputRef={inputRef}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
            endAdornment: localValue && (
              <InputAdornment position="end">
                <IconButton
                  aria-label="clear search"
                  onClick={handleClear}
                  edge="end"
                  size="small"
                >
                  <Clear />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            backgroundColor: "background.paper",
          },
        }}
      />
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={handleAddTask}
        sx={{
          minWidth: "auto",
          whiteSpace: "nowrap",
          px: 3,
        }}
      >
        Add Task
      </Button>
    </Box>
  );
}
