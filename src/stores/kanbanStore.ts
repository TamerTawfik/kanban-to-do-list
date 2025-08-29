import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Task, ColumnType } from '@/types/task.types';

// Column pagination state interface
interface ColumnPaginationState {
    currentPage: number;
    totalPages: number;
    isLoading: boolean;
    totalTasks: number;
}

interface KanbanState {
    // Search state
    searchQuery: string;

    // UI state
    selectedTask: Task | null;
    isTaskFormOpen: boolean;
    taskFormMode: 'create' | 'edit';
    initialColumn: ColumnType | null;

    // Drag and drop state
    draggedTask: Task | null;
    isDragging: boolean;
    dragOverColumn: ColumnType | null;
    autoScrollDirection: 'up' | 'down' | null;
    dragScrollSpeed: number;

    // Column filters (for future use)
    columnFilters: Record<ColumnType, string>;

    // Pagination state
    columnPaginationState: Record<ColumnType, ColumnPaginationState>;
}

interface KanbanActions {
    // Search actions
    setSearchQuery: (query: string) => void;
    clearSearch: () => void;
    resetPaginationForSearch: () => void;

    // Task form actions
    openTaskForm: (mode: 'create' | 'edit', task?: Task, initialColumn?: ColumnType) => void;
    closeTaskForm: () => void;
    setSelectedTask: (task: Task | null) => void;

    // Drag and drop actions
    setDraggedTask: (task: Task | null) => void;
    setIsDragging: (isDragging: boolean) => void;
    setDragOverColumn: (column: ColumnType | null) => void;
    setAutoScrollDirection: (direction: 'up' | 'down' | null) => void;
    setDragScrollSpeed: (speed: number) => void;
    updateTaskCountsAfterDrag: (sourceColumn: ColumnType, targetColumn: ColumnType) => void;

    // Column filter actions
    setColumnFilter: (column: ColumnType, filter: string) => void;
    clearColumnFilter: (column: ColumnType) => void;
    clearAllFilters: () => void;

    // Pagination actions
    setColumnPaginationState: (column: ColumnType, state: Partial<ColumnPaginationState>) => void;
    resetColumnPaginationState: (column: ColumnType) => void;
    resetAllColumnPaginationStates: () => void;
    setCurrentPage: (column: ColumnType, page: number) => void;

    // Reset actions
    resetState: () => void;
}

type KanbanStore = KanbanState & KanbanActions;

const initialColumnPaginationState: ColumnPaginationState = {
    currentPage: 1,
    totalPages: 0,
    isLoading: false,
    totalTasks: 0,
};

const initialState: KanbanState = {
    searchQuery: '',
    selectedTask: null,
    isTaskFormOpen: false,
    taskFormMode: 'create',
    initialColumn: null,
    draggedTask: null,
    isDragging: false,
    dragOverColumn: null,
    autoScrollDirection: null,
    dragScrollSpeed: 0,
    columnFilters: {
        backlog: '',
        'in-progress': '',
        review: '',
        done: '',
    },
    columnPaginationState: {
        backlog: { ...initialColumnPaginationState },
        'in-progress': { ...initialColumnPaginationState },
        review: { ...initialColumnPaginationState },
        done: { ...initialColumnPaginationState },
    },
};

export const useKanbanStore = create<KanbanStore>()(
    devtools(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (set, get) => ({
            ...initialState,

            // Search actions
            setSearchQuery: (query: string) =>
                set(
                    (state) => {
                        // Reset all column pagination states when search query changes
                        const newColumnPaginationState = Object.keys(state.columnPaginationState).reduce(
                            (acc, column) => ({
                                ...acc,
                                [column]: { ...initialColumnPaginationState },
                            }),
                            {} as Record<ColumnType, ColumnPaginationState>
                        );

                        return {
                            searchQuery: query,
                            columnPaginationState: newColumnPaginationState,
                        };
                    },
                    false,
                    'setSearchQuery'
                ),

            clearSearch: () =>
                set(
                    (state) => {
                        // Reset all column pagination states when clearing search
                        const newColumnPaginationState = Object.keys(state.columnPaginationState).reduce(
                            (acc, column) => ({
                                ...acc,
                                [column]: { ...initialColumnPaginationState },
                            }),
                            {} as Record<ColumnType, ColumnPaginationState>
                        );

                        return {
                            searchQuery: '',
                            columnPaginationState: newColumnPaginationState,
                        };
                    },
                    false,
                    'clearSearch'
                ),

            resetPaginationForSearch: () =>
                set(
                    () => ({
                        columnPaginationState: {
                            backlog: { ...initialColumnPaginationState },
                            'in-progress': { ...initialColumnPaginationState },
                            review: { ...initialColumnPaginationState },
                            done: { ...initialColumnPaginationState },
                        },
                    }),
                    false,
                    'resetPaginationForSearch'
                ),

            // Task form actions
            openTaskForm: (mode: 'create' | 'edit', task?: Task, initialColumn?: ColumnType) =>
                set(
                    {
                        isTaskFormOpen: true,
                        taskFormMode: mode,
                        selectedTask: task || null,
                        initialColumn: initialColumn || null,
                    },
                    false,
                    'openTaskForm'
                ),

            closeTaskForm: () =>
                set(
                    {
                        isTaskFormOpen: false,
                        selectedTask: null,
                        initialColumn: null,
                    },
                    false,
                    'closeTaskForm'
                ),

            setSelectedTask: (task: Task | null) =>
                set(
                    { selectedTask: task },
                    false,
                    'setSelectedTask'
                ),

            // Drag and drop actions
            setDraggedTask: (task: Task | null) =>
                set(
                    { draggedTask: task },
                    false,
                    'setDraggedTask'
                ),

            setIsDragging: (isDragging: boolean) =>
                set(
                    { isDragging },
                    false,
                    'setIsDragging'
                ),

            setDragOverColumn: (column: ColumnType | null) =>
                set(
                    { dragOverColumn: column },
                    false,
                    'setDragOverColumn'
                ),

            setAutoScrollDirection: (direction: 'up' | 'down' | null) =>
                set(
                    { autoScrollDirection: direction },
                    false,
                    'setAutoScrollDirection'
                ),

            setDragScrollSpeed: (speed: number) =>
                set(
                    { dragScrollSpeed: speed },
                    false,
                    'setDragScrollSpeed'
                ),

            updateTaskCountsAfterDrag: (sourceColumn: ColumnType, targetColumn: ColumnType) =>
                set(
                    (state) => {
                        const newColumnPaginationState = { ...state.columnPaginationState };

                        // Decrease count in source column
                        if (newColumnPaginationState[sourceColumn].totalTasks > 0) {
                            newColumnPaginationState[sourceColumn] = {
                                ...newColumnPaginationState[sourceColumn],
                                totalTasks: newColumnPaginationState[sourceColumn].totalTasks - 1,
                            };
                        }

                        // Increase count in target column
                        newColumnPaginationState[targetColumn] = {
                            ...newColumnPaginationState[targetColumn],
                            totalTasks: newColumnPaginationState[targetColumn].totalTasks + 1,
                        };

                        return { columnPaginationState: newColumnPaginationState };
                    },
                    false,
                    'updateTaskCountsAfterDrag'
                ),

            // Column filter actions
            setColumnFilter: (column: ColumnType, filter: string) =>
                set(
                    (state) => ({
                        columnFilters: {
                            ...state.columnFilters,
                            [column]: filter,
                        },
                    }),
                    false,
                    'setColumnFilter'
                ),

            clearColumnFilter: (column: ColumnType) =>
                set(
                    (state) => ({
                        columnFilters: {
                            ...state.columnFilters,
                            [column]: '',
                        },
                    }),
                    false,
                    'clearColumnFilter'
                ),

            clearAllFilters: () =>
                set(
                    {
                        columnFilters: {
                            backlog: '',
                            'in-progress': '',
                            review: '',
                            done: '',
                        },
                    },
                    false,
                    'clearAllFilters'
                ),

            // Pagination actions
            setColumnPaginationState: (column: ColumnType, state: Partial<ColumnPaginationState>) =>
                set(
                    (currentState) => ({
                        columnPaginationState: {
                            ...currentState.columnPaginationState,
                            [column]: {
                                ...currentState.columnPaginationState[column],
                                ...state,
                            },
                        },
                    }),
                    false,
                    'setColumnPaginationState'
                ),

            resetColumnPaginationState: (column: ColumnType) =>
                set(
                    (state) => ({
                        columnPaginationState: {
                            ...state.columnPaginationState,
                            [column]: { ...initialColumnPaginationState },
                        },
                    }),
                    false,
                    'resetColumnPaginationState'
                ),

            resetAllColumnPaginationStates: () =>
                set(
                    {
                        columnPaginationState: {
                            backlog: { ...initialColumnPaginationState },
                            'in-progress': { ...initialColumnPaginationState },
                            review: { ...initialColumnPaginationState },
                            done: { ...initialColumnPaginationState },
                        },
                    },
                    false,
                    'resetAllColumnPaginationStates'
                ),

            setCurrentPage: (column: ColumnType, page: number) =>
                set(
                    (state) => ({
                        columnPaginationState: {
                            ...state.columnPaginationState,
                            [column]: {
                                ...state.columnPaginationState[column],
                                currentPage: page,
                            },
                        },
                    }),
                    false,
                    'setCurrentPage'
                ),

            // Reset actions
            resetState: () =>
                set(
                    initialState,
                    false,
                    'resetState'
                ),
        }),
        {
            name: 'kanban-store',
        }
    )
);

// Selectors for filtered task data
export const useFilteredTasks = (tasks: Task[] = []) => {
    return useKanbanStore((state) => {
        let filteredTasks = tasks;

        // Apply search filter
        if (state.searchQuery.trim()) {
            const query = state.searchQuery.toLowerCase().trim();
            filteredTasks = filteredTasks.filter(
                (task) =>
                    task.title.toLowerCase().includes(query) ||
                    task.description.toLowerCase().includes(query)
            );
        }

        return filteredTasks;
    });
};

// Selector for tasks by column with filters applied
export const useTasksByColumn = (tasks: Task[] = [], column: ColumnType) => {
    return useKanbanStore((state) => {
        let columnTasks = tasks.filter(task => task.column === column);

        // Apply search filter
        if (state.searchQuery.trim()) {
            const query = state.searchQuery.toLowerCase().trim();
            columnTasks = columnTasks.filter(
                (task) =>
                    task.title.toLowerCase().includes(query) ||
                    task.description.toLowerCase().includes(query)
            );
        }

        // Apply column-specific filter
        const columnFilter = state.columnFilters[column];
        if (columnFilter.trim()) {
            const filter = columnFilter.toLowerCase().trim();
            columnTasks = columnTasks.filter(
                (task) =>
                    task.title.toLowerCase().includes(filter) ||
                    task.description.toLowerCase().includes(filter)
            );
        }

        return columnTasks;
    });
};

// Individual selectors for search state (prevents infinite loop)
export const useSearchQuery = () => useKanbanStore((state) => state.searchQuery);
export const useSetSearchQuery = () => useKanbanStore((state) => state.setSearchQuery);
export const useClearSearch = () => useKanbanStore((state) => state.clearSearch);
export const useResetPaginationForSearch = () => useKanbanStore((state) => state.resetPaginationForSearch);

// Individual selectors for task form state (prevents infinite loop)
export const useIsTaskFormOpen = () => useKanbanStore((state) => state.isTaskFormOpen);
export const useTaskFormMode = () => useKanbanStore((state) => state.taskFormMode);
export const useSelectedTask = () => useKanbanStore((state) => state.selectedTask);
export const useInitialColumn = () => useKanbanStore((state) => state.initialColumn);
export const useOpenTaskForm = () => useKanbanStore((state) => state.openTaskForm);
export const useCloseTaskForm = () => useKanbanStore((state) => state.closeTaskForm);
export const useSetSelectedTask = () => useKanbanStore((state) => state.setSelectedTask);

// Individual selectors for drag and drop state (prevents infinite loop)
export const useDraggedTask = () => useKanbanStore((state) => state.draggedTask);
export const useIsDragging = () => useKanbanStore((state) => state.isDragging);
export const useDragOverColumn = () => useKanbanStore((state) => state.dragOverColumn);
export const useAutoScrollDirection = () => useKanbanStore((state) => state.autoScrollDirection);
export const useDragScrollSpeed = () => useKanbanStore((state) => state.dragScrollSpeed);
export const useSetDraggedTask = () => useKanbanStore((state) => state.setDraggedTask);
export const useSetIsDragging = () => useKanbanStore((state) => state.setIsDragging);
export const useSetDragOverColumn = () => useKanbanStore((state) => state.setDragOverColumn);
export const useSetAutoScrollDirection = () => useKanbanStore((state) => state.setAutoScrollDirection);
export const useSetDragScrollSpeed = () => useKanbanStore((state) => state.setDragScrollSpeed);
export const useUpdateTaskCountsAfterDrag = () => useKanbanStore((state) => state.updateTaskCountsAfterDrag);

// Individual selectors for pagination state (prevents infinite loop)
export const useColumnPaginationState = (column: ColumnType) =>
    useKanbanStore((state) => state.columnPaginationState[column]);
export const useSetColumnPaginationState = () => useKanbanStore((state) => state.setColumnPaginationState);
export const useResetColumnPaginationState = () => useKanbanStore((state) => state.resetColumnPaginationState);
export const useResetAllColumnPaginationStates = () => useKanbanStore((state) => state.resetAllColumnPaginationStates);
export const useSetCurrentPage = () => useKanbanStore((state) => state.setCurrentPage);