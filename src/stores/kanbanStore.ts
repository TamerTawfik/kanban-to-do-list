import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Task, ColumnType } from '@/types/task.types';

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

    // Column filters (for future use)
    columnFilters: Record<ColumnType, string>;
}

interface KanbanActions {
    // Search actions
    setSearchQuery: (query: string) => void;
    clearSearch: () => void;

    // Task form actions
    openTaskForm: (mode: 'create' | 'edit', task?: Task, initialColumn?: ColumnType) => void;
    closeTaskForm: () => void;
    setSelectedTask: (task: Task | null) => void;

    // Drag and drop actions
    setDraggedTask: (task: Task | null) => void;
    setIsDragging: (isDragging: boolean) => void;
    setDragOverColumn: (column: ColumnType | null) => void;

    // Column filter actions
    setColumnFilter: (column: ColumnType, filter: string) => void;
    clearColumnFilter: (column: ColumnType) => void;
    clearAllFilters: () => void;

    // Reset actions
    resetState: () => void;
}

type KanbanStore = KanbanState & KanbanActions;

const initialState: KanbanState = {
    searchQuery: '',
    selectedTask: null,
    isTaskFormOpen: false,
    taskFormMode: 'create',
    initialColumn: null,
    draggedTask: null,
    isDragging: false,
    dragOverColumn: null,
    columnFilters: {
        backlog: '',
        'in-progress': '',
        review: '',
        done: '',
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
                    { searchQuery: query },
                    false,
                    'setSearchQuery'
                ),

            clearSearch: () =>
                set(
                    { searchQuery: '' },
                    false,
                    'clearSearch'
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
                    task.description.toLowerCase().includes(query) ||
                    (task.tags && task.tags.some(tag => tag.toLowerCase().includes(query)))
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
                    task.description.toLowerCase().includes(query) ||
                    (task.tags && task.tags.some(tag => tag.toLowerCase().includes(query)))
            );
        }

        // Apply column-specific filter
        const columnFilter = state.columnFilters[column];
        if (columnFilter.trim()) {
            const filter = columnFilter.toLowerCase().trim();
            columnTasks = columnTasks.filter(
                (task) =>
                    task.title.toLowerCase().includes(filter) ||
                    task.description.toLowerCase().includes(filter) ||
                    (task.tags && task.tags.some(tag => tag.toLowerCase().includes(filter)))
            );
        }

        return columnTasks;
    });
};

// Selector for search state
export const useSearchState = () => {
    return useKanbanStore((state) => ({
        searchQuery: state.searchQuery,
        setSearchQuery: state.setSearchQuery,
        clearSearch: state.clearSearch,
    }));
};

// Selector for task form state
export const useTaskFormState = () => {
    return useKanbanStore((state) => ({
        isTaskFormOpen: state.isTaskFormOpen,
        taskFormMode: state.taskFormMode,
        selectedTask: state.selectedTask,
        initialColumn: state.initialColumn,
        openTaskForm: state.openTaskForm,
        closeTaskForm: state.closeTaskForm,
        setSelectedTask: state.setSelectedTask,
    }));
};

// Selector for drag and drop state
export const useDragState = () => {
    return useKanbanStore((state) => ({
        draggedTask: state.draggedTask,
        isDragging: state.isDragging,
        dragOverColumn: state.dragOverColumn,
        setDraggedTask: state.setDraggedTask,
        setIsDragging: state.setIsDragging,
        setDragOverColumn: state.setDragOverColumn,
    }));
};