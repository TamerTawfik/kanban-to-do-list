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
} from "@/stores/kanbanStore";
import { useCallback, useEffect, useState } from "react";

interface SearchBarProps {
  placeholder?: string;
}

export default function SearchBar({
  placeholder = "Search tasks...",
}: SearchBarProps) {
  const searchQuery = useSearchQuery();
  const setSearchQuery = useSetSearchQuery();
  const clearSearch = useClearSearch();
  const openTaskForm = useOpenTaskForm();
  const [localValue, setLocalValue] = useState(searchQuery);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue, setSearchQuery]);

  // Sync with store when external changes occur
  useEffect(() => {
    setLocalValue(searchQuery);
  }, [searchQuery]);

  const handleClear = useCallback(() => {
    setLocalValue("");
    clearSearch();
  }, [clearSearch]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClear();
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
