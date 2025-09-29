import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KanbanBoard from '.';
import * as fetchTaskModule from '../../../hooks/useFetchTaskAssignment';
import { deleteTaskAssignment } from '../../../utils/fetchTaskAssignment';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('../../../utils/fetchTaskAssignment', () => ({
  deleteTaskAssignment: jest.fn(),
}));

jest.mock('../../../hooks/useFetchTaskAssignment');

jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DragOverlay: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useSensor: () => ({}),
  useSensors: () => [],
  PointerSensor: {},
  closestCenter: () => ({}),
}));

jest.mock('../Taskcard', () => ({
  TaskCard: ({ task, onDelete }: { task: { id: string; title: string }, onDelete: (id: string) => void }) => (
    <div data-testid={`task-${task.id}`} className="select-none group w-full">
      <button
        aria-label="Delete task"
        onClick={() => onDelete(task.id)}
        className="absolute top-2 right-2 p-1 rounded-full bg-gray-700 text-white opacity-0 group-hover:opacity-100"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none">
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          <line x1="10" x2="10" y1="11" y2="17" />
          <line x1="14" x2="14" y1="11" y2="17" />
        </svg>
      </button>
      <div className="bg-[#013840] text-white p-3 rounded-2xl">
        <h4 className="font-medium truncate">{task.title}</h4>
      </div>
    </div>
  ),
}));

jest.mock('../Dropzone', () => ({
  DropZone: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockTasks = [
  { id: '1', title: 'Task 1', status: 'pending', assignmentId: 'a1' },
  { id: '2', title: 'Task 2', status: 'in_progress', assignmentId: 'a2' },
];

describe('KanbanBoard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    (fetchTaskModule.useFetchTaskAssignments as jest.Mock).mockReturnValue({
      assignedTasks: [],
      setAssignedTasks: jest.fn(),
      loading: true,
      error: null,
      updateTaskStatus: jest.fn(),
    });

    render(<KanbanBoard />);
    expect(screen.getByText(/Loading board.../i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    (fetchTaskModule.useFetchTaskAssignments as jest.Mock).mockReturnValue({
      assignedTasks: [],
      setAssignedTasks: jest.fn(),
      loading: false,
      error: 'Error',
      updateTaskStatus: jest.fn(),
    });

    render(<KanbanBoard />);
    expect(screen.getByText(/Something went Wrong/i)).toBeInTheDocument();
  });

  it('renders columns with tasks', () => {
    (fetchTaskModule.useFetchTaskAssignments as jest.Mock).mockReturnValue({
      assignedTasks: mockTasks,
      setAssignedTasks: jest.fn(),
      loading: false,
      error: null,
      updateTaskStatus: jest.fn(),
    });

    render(<KanbanBoard />);
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('In progress')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getAllByText('Drop tasks here')).toHaveLength(2);
  });

  it('deletes a task successfully when delete button is clicked', async () => {
    const setAssignedTasks = jest.fn();
    (fetchTaskModule.useFetchTaskAssignments as jest.Mock).mockReturnValue({
      assignedTasks: mockTasks,
      setAssignedTasks,
      loading: false,
      error: null,
      updateTaskStatus: jest.fn(),
    });

    (deleteTaskAssignment as jest.Mock).mockResolvedValue(undefined);

    render(<KanbanBoard />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete task/i });
    expect(deleteButtons.length).toBe(2);

    await userEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(deleteTaskAssignment).toHaveBeenCalledWith('a1');
      expect(setAssignedTasks).toHaveBeenCalled();
      const stateUpdater = setAssignedTasks.mock.calls[0][0];
      const newState = stateUpdater(mockTasks);
      expect(newState).toHaveLength(1);
      expect(newState).toEqual([expect.objectContaining({ id: '2' })]);
    });
  });
});
