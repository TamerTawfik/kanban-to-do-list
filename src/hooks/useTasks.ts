/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    useQuery,
    useMutation,
    useQueryClient,
    UseQueryOptions,
    UseMutationOptions,
} from '@tanstack/react-query';
import {
    fetchTasks,
    fetchTask,
    createTask,
    updateTask,
    deleteTask,
    TaskApiError,
} from '@/services/taskApi';
import { Task, TaskMutation, ColumnType } from '@/types/task.types';

// Query keys for consistent caching
export const taskKeys = {
    all: ['tasks'] as const,
    lists: () => [...taskKeys.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...taskKeys.lists(), filters] as const,
    details: () => [...taskKeys.all, 'detail'] as const,
    detail: (id: number) => [...taskKeys.details(), id] as const,
};

// Hook for fetching tasks with caching
export function useTasks(params?: {
    page?: number;
    limit?: number;
    column?: ColumnType;
    search?: string;
}) {
    return useQuery({
        queryKey: taskKeys.list(params || {}),
        queryFn: () => fetchTasks(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: (failureCount, error) => {
            // Don't retry on 4xx errors, but retry on network errors
            if (error instanceof TaskApiError && error.status && error.status >= 400 && error.status < 500) {
                return false;
            }
            return failureCount < 3;
        },
    });
}

// Hook for fetching a single task
export function useTask(id: number, options?: Omit<UseQueryOptions<Task>, 'queryKey' | 'queryFn'>) {
    return useQuery({
        queryKey: taskKeys.detail(id),
        queryFn: () => fetchTask(id),
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        ...options,
    });
}

// Hook for creating tasks with optimistic updates
export function useCreateTask(
    options?: Omit<UseMutationOptions<Task, TaskApiError, Omit<TaskMutation, 'id'>, { previousTasks: [readonly unknown[], unknown][] }>, 'mutationFn'>
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTask,
        onMutate: async (newTask) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

            // Snapshot the previous value
            const previousTasks = queryClient.getQueriesData({ queryKey: taskKeys.lists() });

            // Optimistically update to the new value
            queryClient.setQueriesData({ queryKey: taskKeys.lists() }, (old: Task[] | undefined) => {
                if (!old) return [{ ...newTask, id: Date.now() } as Task];
                return [...old, { ...newTask, id: Date.now() } as Task];
            });

            // Return a context object with the snapshotted value
            return { previousTasks };
        },
        onError: (err, newTask, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousTasks) {
                context.previousTasks.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },
        onSettled: () => {
            // Always refetch after error or success
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
        },
        ...options,
    });
}

// Hook for updating tasks with optimistic updates
export function useUpdateTask(
    options?: Omit<UseMutationOptions<Task, TaskApiError, { id: number; updates: Partial<TaskMutation> }, { previousTasks: [readonly unknown[], unknown][]; previousTask: unknown }>, 'mutationFn'>
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, updates }) => updateTask(id, updates),
        onMutate: async ({ id, updates }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
            await queryClient.cancelQueries({ queryKey: taskKeys.detail(id) });

            // Snapshot the previous values
            const previousTasks = queryClient.getQueriesData({ queryKey: taskKeys.lists() });
            const previousTask = queryClient.getQueryData(taskKeys.detail(id));

            // Optimistically update task lists
            queryClient.setQueriesData({ queryKey: taskKeys.lists() }, (old: Task[] | undefined) => {
                if (!old) return old;
                return old.map(task =>
                    task.id === id
                        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
                        : task
                );
            });

            // Optimistically update single task
            queryClient.setQueryData(taskKeys.detail(id), (old: Task | undefined) => {
                if (!old) return old;
                return { ...old, ...updates, updatedAt: new Date().toISOString() };
            });

            return { previousTasks, previousTask };
        },
        onError: (err, { id }, context) => {
            // Roll back optimistic updates
            if (context?.previousTasks) {
                context.previousTasks.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            if (context?.previousTask) {
                queryClient.setQueryData(taskKeys.detail(id), context.previousTask);
            }
        },
        onSettled: (data, error, { id }) => {
            // Always refetch after error or success
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
            queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
        },
        ...options,
    });
}

// Hook for deleting tasks with optimistic updates
export function useDeleteTask(
    options?: Omit<UseMutationOptions<void, TaskApiError, number, { previousTasks: [readonly unknown[], unknown][]; previousTask: unknown }>, 'mutationFn'>
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteTask,
        onMutate: async (id) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
            await queryClient.cancelQueries({ queryKey: taskKeys.detail(id) });

            // Snapshot the previous values
            const previousTasks = queryClient.getQueriesData({ queryKey: taskKeys.lists() });
            const previousTask = queryClient.getQueryData(taskKeys.detail(id));

            // Optimistically remove the task
            queryClient.setQueriesData({ queryKey: taskKeys.lists() }, (old: Task[] | undefined) => {
                if (!old) return old;
                return old.filter(task => task.id !== id);
            });

            // Remove single task from cache
            queryClient.removeQueries({ queryKey: taskKeys.detail(id) });

            return { previousTasks, previousTask };
        },
        onError: (err, id, context) => {
            // Roll back optimistic updates
            if (context?.previousTasks) {
                context.previousTasks.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            if (context?.previousTask) {
                queryClient.setQueryData(taskKeys.detail(id), context.previousTask);
            }
        },
        onSettled: () => {
            // Always refetch after error or success
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
        },
        ...options,
    });
}