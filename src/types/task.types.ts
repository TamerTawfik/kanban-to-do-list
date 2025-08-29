export type ColumnType = "backlog" | "in-progress" | "review" | "done";

export interface Task {
    id: number;
    title: string;
    description: string;
    column: ColumnType;
    createdAt?: string;
    updatedAt?: string;
    priority?: "low" | "medium" | "high";
    tags?: string[];
}

export interface TaskMutation {
    id?: number;
    title: string;
    description: string;
    column: ColumnType;
    createdAt?: string;
    updatedAt?: string;
    priority?: "low" | "medium" | "high";
    tags?: string[];
}

export interface TasksResponse {
    tasks: Task[];
    total: number;
    page: number;
    limit: number;
}