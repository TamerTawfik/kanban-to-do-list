/**
 * Core types for the Interactive Kanban Board
 */

// Import base types from task.types.ts
import { ColumnType, Task } from './task.types';

export interface KanbanColumnProps {
    columnId: ColumnType;
    title: string;
    tasks: Task[];
    onTaskCreate: (task: Partial<Task>) => void;
    onTaskUpdate: (taskId: number, updates: Partial<Task>) => void;
    onTaskDelete: (taskId: number) => void;
    onTaskDrop: (taskId: number, newColumn: ColumnType) => void;
}

export interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (taskId: number) => void;
    isDragging?: boolean;
    searchQuery?: string;
}

export interface TaskFormProps {
    task?: Task;
    initialColumn?: ColumnType;
    onSubmit: (task: Partial<Task>) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export interface SearchBarProps {
    value: string;
    onChange: (query: string) => void;
    placeholder?: string;
}



export interface KanbanBoardProps {
    className?: string;
}

export interface KanbanBoardState {
    searchQuery: string;
    draggedTask: Task | null;
    isLoading: boolean;
}

export interface KanbanState {
    searchQuery: string;
    selectedTask: Task | null;
    isTaskFormOpen: boolean;
    draggedTask: Task | null;
    columnFilters: Record<ColumnType, string>;
}

export interface PaginationState {
    [key: string]: {
        page: number;
        hasMore: boolean;
        isLoading: boolean;
    };
}

// Drag and Drop types
export interface DragEndEvent {
    active: {
        id: string;
        data: {
            current: {
                task: Task;
                columnId: ColumnType;
            };
        };
    };
    over: {
        id: string;
        data: {
            current: {
                columnId: ColumnType;
            };
        };
    } | null;
}

// Column configuration
export interface ColumnConfig {
    id: ColumnType;
    title: string;
    color: string;
}

export const COLUMN_CONFIGS: ColumnConfig[] = [
    { id: "backlog", title: "Backlog", color: "#f5f5f5" },
    { id: "in-progress", title: "In Progress", color: "#e3f2fd" },
    { id: "review", title: "Review", color: "#fff3e0" },
    { id: "done", title: "Done", color: "#e8f5e8" },
];