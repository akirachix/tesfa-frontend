import { ApiTask, Task, TaskAssignment } from './type';
import { mapApiTask, fetchTasksForAssignments } from "./fetchTasks";

global.fetch = jest.fn();

describe('fetchtasks utilities', () => {

  describe('mapApiTask', () => {
    const baseApiTask: ApiTask = {
      id: 123,
      title: 'Test Task',
      description: 'Test Description',
      assignments: [],
      priority: 'high'
    };

    it('maps a task with no assignments to a status of "pending"', async () => {
      const result = await mapApiTask({ ...baseApiTask, assignments: [] });

      const expected: Task = {
        id: '123',
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
         priority: 'high'
      };

      expect(result).toEqual(expected);
    });

    it('maps a task with a "completed" assignment status to "completed"', async () => {
      const apiTask: ApiTask = {
        ...baseApiTask,
        assignments: [{ status: 'completed' }],
      };
      const result = await mapApiTask(apiTask);
      expect(result.status).toBe('completed');
    });

    it('maps a task with a "pending" assignment status to "pending"', async () => {
      const apiTask: ApiTask = {
        ...baseApiTask,
        assignments: [{ status: 'pending' }],
      };
      const result = await mapApiTask(apiTask);
      expect(result.status).toBe('pending');
    });

    it('maps a task with an "in_progress" assignment status to "in_progress"', async () => {
      const apiTask: ApiTask = {
        ...baseApiTask,
        assignments: [{ status: 'in_progress' }],
      };
      const result = await mapApiTask(apiTask);
      expect(result.status).toBe('in_progress');
    });

    it('uses the first assignment if multiple exist', async () => {
      const apiTask: ApiTask = {
        ...baseApiTask,
        assignments: [
          { status: 'in_progress' },
          { status: 'completed' },
        ],
      };
      const result = await mapApiTask(apiTask);
      expect(result.status).toBe('in_progress');
    });

     it('handles a missing assignments array by defaulting to pending', async () => {
      const apiTaskWithNoAssignments = {
        id: 456,
        title: 'Another Task',
        description: 'No assignments array',
        status: 'pending',
         priority: 'high'
      } as Omit<ApiTask, 'assignments'>;

      const result = await mapApiTask(apiTaskWithNoAssignments as ApiTask);
      expect(result.status).toBe('pending');
    });
  });

  describe('fetchTasksForAssignments', () => {
    const mockAssignments: TaskAssignment[] = [
      { id: 1, task: 1, organization: 1, status: 'completed', created_at: '', updated_at: '' },
      { id: 2, task: 2, organization: 1, status: 'in_progress', created_at: '', updated_at: '' },
    ];

    const mockApiTasks: ApiTask[] = [
      { id: 1, title: 'Task One', description: 'Desc One', assignments: [],  priority: 'high' },
      { id: 2, title: 'Task Two', description: 'Desc Two', assignments: [],  priority: 'high' },
    ];

    const mockHeaders: HeadersInit = {
      'Authorization': 'Token test-token',
      'Content-Type': 'application/json',
    };

    let fetchSpy: jest.SpyInstance;

    beforeEach(() => {
      fetchSpy = jest.spyOn(global, 'fetch');
    });

    afterEach(() => {
      fetchSpy.mockRestore();
    });

    it('should fetch tasks for given assignments successfully', async () => {
      fetchSpy
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockApiTasks[0]),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockApiTasks[1]),
        });

      const taskPromises = fetchTasksForAssignments(mockAssignments, mockHeaders);
      const fetchedTasks = await Promise.all(taskPromises);

      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(fetchSpy).toHaveBeenCalledWith('/api/tasks/1/', { headers: mockHeaders });
      expect(fetchSpy).toHaveBeenCalledWith('/api/tasks/2/', { headers: mockHeaders });
      expect(fetchedTasks).toEqual(mockApiTasks);
    });

    it('should throw an error if any task fetch fails', async () => {
      fetchSpy
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockApiTasks[0]),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        });

      const taskPromises = fetchTasksForAssignments(mockAssignments, mockHeaders);

      await expect(Promise.all(taskPromises)).rejects.toThrow('Failed to fetch task 2');
      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(fetchSpy).toHaveBeenCalledWith('/api/tasks/1/', { headers: mockHeaders });
      expect(fetchSpy).toHaveBeenCalledWith('/api/tasks/2/', { headers: mockHeaders });
    });
  });
});
