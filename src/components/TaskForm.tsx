/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Typography,
  Alert,
} from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { Task, ColumnType, TaskMutation } from "@/types/task.types";

interface TaskFormProps {
  open: boolean;
  mode: "create" | "edit";
  task?: Task;
  initialColumn?: ColumnType;
  onSubmit: (taskData: Omit<TaskMutation, "id">) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}

interface FormData {
  title: string;
  description: string;
  column: ColumnType;
}

interface FormErrors {
  title?: string;
  description?: string;
  column?: string;
}

const COLUMN_OPTIONS: Array<{ value: ColumnType; label: string }> = [
  { value: "backlog", label: "Backlog" },
  { value: "in-progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

export default function TaskForm({
  open,
  mode,
  task,
  initialColumn,
  onSubmit,
  onCancel,
  isLoading = false,
  error = null,
}: TaskFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    column: "backlog",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({
    title: false,
    description: false,
    column: false,
  });

  // Initialize form data when dialog opens or task changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && task) {
        setFormData({
          title: task.title,
          description: task.description,
          column: task.column,
        });
      } else if (mode === "create") {
        setFormData({
          title: "",
          description: "",
          column: initialColumn || "backlog",
        });
      }
      // Reset touched state when dialog opens
      setTouched({
        title: false,
        description: false,
        column: false,
      });
      setErrors({});
    }
  }, [open, mode, task, initialColumn]);

  // Validation function
  const validateForm = useCallback((data: FormData): FormErrors => {
    const newErrors: FormErrors = {};

    // Title validation
    if (!data.title.trim()) {
      newErrors.title = "Title is required";
    } else if (data.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters long";
    } else if (data.title.trim().length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    // Description validation
    if (!data.description.trim()) {
      newErrors.description = "Description is required";
    } else if (data.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters long";
    } else if (data.description.trim().length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    // Column validation
    if (!data.column) {
      newErrors.column = "Column is required";
    }

    return newErrors;
  }, []);

  // Handle input changes
  const handleInputChange = useCallback(
    (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  // Handle select change
  const handleSelectChange = useCallback(
    (event: any) => {
      const value = event.target.value as ColumnType;
      setFormData((prev) => ({ ...prev, column: value }));

      // Clear error for column field
      if (errors.column) {
        setErrors((prev) => ({ ...prev, column: undefined }));
      }
    },
    [errors.column]
  );

  // Handle field blur (for touched state)
  const handleBlur = useCallback(
    (field: keyof FormData) => {
      setTouched((prev) => ({ ...prev, [field]: true }));

      // Validate this field on blur
      const fieldErrors = validateForm(formData);
      if (fieldErrors[field]) {
        setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
      }
    },
    [formData, validateForm]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();

      // Mark all fields as touched
      setTouched({
        title: true,
        description: true,
        column: true,
      });

      // Validate entire form
      const formErrors = validateForm(formData);
      setErrors(formErrors);

      // If no errors, submit the form
      if (Object.keys(formErrors).length === 0) {
        onSubmit({
          title: formData.title.trim(),
          description: formData.description.trim(),
          column: formData.column,
        });
      }
    },
    [formData, validateForm, onSubmit]
  );

  // Handle cancel
  const handleCancel = useCallback(() => {
    setFormData({
      title: "",
      description: "",
      column: "backlog",
    });
    setErrors({});
    setTouched({
      title: false,
      description: false,
      column: false,
    });
    onCancel();
  }, [onCancel]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape" && !isLoading) {
        handleCancel();
      } else if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        handleSubmit(event as any);
      }
    },
    [handleCancel, handleSubmit, isLoading]
  );

  const isFormValid =
    Object.keys(errors).length === 0 &&
    formData.title.trim() &&
    formData.description.trim();

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : handleCancel}
      maxWidth="sm"
      fullWidth
      onKeyDown={handleKeyDown}
      PaperProps={{
        component: "form",
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          {mode === "create" ? "Create New Task" : "Edit Task"}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Title Field */}
          <TextField
            label="Title"
            value={formData.title}
            onChange={handleInputChange("title")}
            onBlur={() => handleBlur("title")}
            error={touched.title && !!errors.title}
            helperText={touched.title && errors.title}
            fullWidth
            required
            disabled={isLoading}
            placeholder="Enter task title..."
            inputProps={{
              maxLength: 100,
            }}
          />

          {/* Description Field */}
          <TextField
            label="Description"
            value={formData.description}
            onChange={handleInputChange("description")}
            onBlur={() => handleBlur("description")}
            error={touched.description && !!errors.description}
            helperText={touched.description && errors.description}
            fullWidth
            required
            multiline
            rows={4}
            disabled={isLoading}
            placeholder="Enter task description..."
            inputProps={{
              maxLength: 500,
            }}
          />

          {/* Column Field */}
          <FormControl
            fullWidth
            required
            error={touched.column && !!errors.column}
            disabled={isLoading}
          >
            <InputLabel id="column-select-label">Column</InputLabel>
            <Select
              labelId="column-select-label"
              value={formData.column}
              onChange={handleSelectChange}
              onBlur={() => handleBlur("column")}
              label="Column"
            >
              {COLUMN_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {touched.column && errors.column && (
              <FormHelperText>{errors.column}</FormHelperText>
            )}
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleCancel} disabled={isLoading} color="inherit">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={!isFormValid || isLoading}
          sx={{ minWidth: 100 }}
        >
          {isLoading
            ? "Saving..."
            : mode === "create"
            ? "Create Task"
            : "Update Task"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
