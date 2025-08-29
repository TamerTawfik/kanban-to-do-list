import { Task, TaskMutation, ColumnType, TasksResponse } from '@/types/task.types';

const API_BASE_URL = 'http://localhost:4000';

export class TaskApiError extends Error {
    constructor(message: string, public status?: number) {
        super(message);
        this.name = 'TaskApiError';
    }
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        throw new TaskApiError(
            `API Error: ${response.status} ${response.statusText}`,
            response.status
        );
    }
    return response.json();
}

// GET /tasks - Fetch all tasks with optional pagination and filtering
export async function fetchTasks(params?: {
    page?: number;
    limit?: number;
    column?: ColumnType;
    search?: string;
}): Promise<Task[]> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append('_page', params.page.toString());
    if (params?.limit) searchParams.append('_limit', params.limit.toString());
    if (params?.column) searchParams.append('column', params.column);
    if (params?.search) {
        // JSON Server supports full-text search with q parameter
        searchParams.append('q', params.search);
    }

    const url = `${API_BASE_URL}/tasks${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    const response = await fetch(url);
    return handleResponse<Task[]>(response);
}

// GET /tasks - Fetch tasks by column with pagination metadata
export async function fetchTasksByColumn(params: {
    column: ColumnType;
    page: number;
    limit: number;
    search?: string;
}): Promise<TasksResponse> {
    // Get all tasks for this column and search query (without pagination)
    const searchParams = new URLSearchParams();
    searchParams.append('column', params.column);

    if (params.search && params.search.trim()) {
        searchParams.append('q', params.search.trim());
    }

    const url = `${API_BASE_URL}/tasks?${searchParams.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new TaskApiError(
            `API Error: ${response.status} ${response.statusText}`,
            response.status
        );
    }

    const allTasks = await response.json() as Task[];
    const totalCount = allTasks.length;

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / params.limit);
    const hasMore = params.page < totalPages;

    // Apply client-side pagination to the filtered results
    const startIndex = (params.page - 1) * params.limit;
    const endIndex = startIndex + params.limit;
    const paginatedTasks = allTasks.slice(startIndex, endIndex);



    return {
        tasks: paginatedTasks,
        total: totalCount,
        currentPage: params.page,
        totalPages,
        limit: params.limit,
        hasMore
    };
}

// GET /tasks/:id - Fetch single task
export async function fetchTask(id: number): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
    return handleResponse<Task>(response);
}

// POST /tasks - Create new task
export async function createTask(task: Omit<TaskMutation, 'id'>): Promise<Task> {
    const taskData = {
        ...task,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
    });

    return handleResponse<Task>(response);
}

// PATCH /tasks/:id - Update existing task
export async function updateTask(id: number, updates: Partial<TaskMutation>): Promise<Task> {
    const updateData = {
        ...updates,
        updatedAt: new Date().toISOString(),
    };

    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
    });

    return handleResponse<Task>(response);
}

// DELETE /tasks/:id - Delete task
export async function deleteTask(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new TaskApiError(
            `Failed to delete task: ${response.status} ${response.statusText}`,
            response.status
        );
    }
}