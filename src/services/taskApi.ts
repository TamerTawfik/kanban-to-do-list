import { Task, TaskMutation, ColumnType, TasksResponse } from '@/types/task.types';

const API_BASE_URL = 'https://my-json-server.typicode.com/TamerTawfik/json';
const STORAGE_KEY = 'kanban-tasks';
const INIT_FLAG_KEY = 'kanban-initialized';

export class TaskApiError extends Error {
    constructor(message: string, public status?: number) {
        super(message);
        this.name = 'TaskApiError';
    }
}

// Local storage helpers
function getTasksFromStorage(): Task[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return [];
    }
}

function saveTasksToStorage(tasks: Task[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        throw new TaskApiError('Failed to save tasks to local storage');
    }
}

function isInitialized(): boolean {
    return localStorage.getItem(INIT_FLAG_KEY) === 'true';
}

function setInitialized(): void {
    localStorage.setItem(INIT_FLAG_KEY, 'true');
}

// Initialize data from API if not already done
async function initializeFromAPI(): Promise<void> {
    if (isInitialized()) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/tasks`);
        if (!response.ok) {
            throw new TaskApiError(
                `Failed to fetch initial data: ${response.status} ${response.statusText}`,
                response.status
            );
        }

        const tasks = await response.json() as Task[];
        saveTasksToStorage(tasks);
        setInitialized();
    } catch (error) {
        console.error('Failed to initialize from API:', error);
        // Continue with empty array if API fails
        if (!getTasksFromStorage().length) {
            saveTasksToStorage([]);
        }
        setInitialized();
    }
}

// Generate unique ID for new tasks
function generateId(): number {
    const tasks = getTasksFromStorage();
    const maxId = tasks.reduce((max, task) => Math.max(max, task.id), 0);
    return maxId + 1;
}

// GET /tasks - Fetch all tasks with optional pagination and filtering
export async function fetchTasks(params?: {
    page?: number;
    limit?: number;
    column?: ColumnType;
    search?: string;
}): Promise<Task[]> {
    await initializeFromAPI();

    let tasks = getTasksFromStorage();

    // Apply column filter
    if (params?.column) {
        tasks = tasks.filter(task => task.column === params.column);
    }

    // Apply search filter
    if (params?.search && params.search.trim()) {
        const searchTerm = params.search.toLowerCase().trim();
        tasks = tasks.filter(task =>
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm)
        );
    }

    // Apply pagination
    if (params?.page && params?.limit) {
        const startIndex = (params.page - 1) * params.limit;
        const endIndex = startIndex + params.limit;
        tasks = tasks.slice(startIndex, endIndex);
    }

    return tasks;
}

// GET /tasks - Fetch tasks by column with pagination metadata
export async function fetchTasksByColumn(params: {
    column: ColumnType;
    page: number;
    limit: number;
    search?: string;
}): Promise<TasksResponse> {
    await initializeFromAPI();

    let allTasks = getTasksFromStorage();

    // Filter by column
    allTasks = allTasks.filter(task => task.column === params.column);

    // Apply search filter
    if (params.search && params.search.trim()) {
        const searchTerm = params.search.toLowerCase().trim();
        allTasks = allTasks.filter(task =>
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm)
        );
    }

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
    await initializeFromAPI();

    const tasks = getTasksFromStorage();
    const task = tasks.find(t => t.id === id);

    if (!task) {
        throw new TaskApiError(`Task with id ${id} not found`, 404);
    }

    return task;
}

// POST /tasks - Create new task
export async function createTask(task: Omit<TaskMutation, 'id'>): Promise<Task> {
    await initializeFromAPI();

    const tasks = getTasksFromStorage();
    const newTask: Task = {
        ...task,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    tasks.push(newTask);
    saveTasksToStorage(tasks);

    return newTask;
}

// PATCH /tasks/:id - Update existing task
export async function updateTask(id: number, updates: Partial<TaskMutation>): Promise<Task> {
    await initializeFromAPI();

    const tasks = getTasksFromStorage();
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
        throw new TaskApiError(`Task with id ${id} not found`, 404);
    }

    const updatedTask = {
        ...tasks[taskIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
    };

    tasks[taskIndex] = updatedTask;
    saveTasksToStorage(tasks);

    return updatedTask;
}

// DELETE /tasks/:id - Delete task
export async function deleteTask(id: number): Promise<void> {
    await initializeFromAPI();

    const tasks = getTasksFromStorage();
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
        throw new TaskApiError(`Task with id ${id} not found`, 404);
    }

    tasks.splice(taskIndex, 1);
    saveTasksToStorage(tasks);
}

// Utility function to reset data (useful for development/testing)
export async function resetData(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(INIT_FLAG_KEY);
    await initializeFromAPI();
}

// Utility function to get all tasks without initialization (for debugging)
export function getStoredTasks(): Task[] {
    return getTasksFromStorage();
}