import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchTasksByColumn, TaskApiError } from '@/services/taskApi';
import { Task, TasksResponse, ColumnType } from '@/types/task.types';
import { useEffect, useRef } from 'react';

// Query keys for paginated column queries
export const paginatedTaskKeys = {
    paginatedColumn: (columnId: ColumnType, page: number, search?: string) =>
        ['tasks', 'paginated', columnId, page, search] as const,
};

export interface UsePaginatedColumnTasksOptions {
    columnId: ColumnType;
    page: number;
    searchQuery?: string;
    pageSize?: number;
}

export interface UsePaginatedColumnTasksResult {
    data: TasksResponse | undefined;
    tasks: Task[];
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    isLoading: boolean;
    error: TaskApiError | null;
    refetch: () => void;
}

export function usePaginatedColumnTasks({
    columnId,
    page,
    searchQuery,
    pageSize = 10,
}: UsePaginatedColumnTasksOptions): UsePaginatedColumnTasksResult {
    const queryClient = useQueryClient();
    const previousSearchQuery = useRef<string | undefined>(searchQuery);



    // Reset to page 1 when search query changes
    useEffect(() => {
        if (previousSearchQuery.current !== searchQuery) {
            // Remove all cached data for this column when search changes
            queryClient.removeQueries({
                queryKey: ['tasks', 'paginated', columnId],
                exact: false,
            });
            previousSearchQuery.current = searchQuery;
        }
    }, [searchQuery, columnId, queryClient]);

    const queryResult = useQuery({
        queryKey: paginatedTaskKeys.paginatedColumn(columnId, page, searchQuery),
        queryFn: () => fetchTasksByColumn({
            column: columnId,
            page,
            limit: pageSize,
            search: searchQuery,
        }),
        staleTime: 0, // Always fetch fresh data for pagination
        gcTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: (failureCount: number, error: TaskApiError) => {
            // Don't retry on 4xx errors, but retry on network errors
            if (error instanceof TaskApiError && error.status && error.status >= 400 && error.status < 500) {
                return false;
            }
            return failureCount < 3;
        },
    });

    const data = queryResult.data;
    const tasks = data?.tasks ?? [];
    const currentPage = data?.currentPage ?? page;
    const totalPages = data?.totalPages ?? 0;

    return {
        data,
        tasks,
        currentPage,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
        isLoading: queryResult.isLoading,
        error: queryResult.error,
        refetch: queryResult.refetch,
    };
}