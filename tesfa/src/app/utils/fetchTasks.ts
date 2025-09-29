import { ApiTask, Task, TaskAssignment, TaskDetail } from "./type";
import { getToken } from "./getToken";

export const getKanbanStatus = (apiStatus: string): Task["status"] => {
  switch (apiStatus) {
    case "completed":
      return "completed";
    case "pending":
      return "pending";
    case "in_progress":
      return "in_progress";
    case "cancelled":
      return "cancelled";
    default:
      return "pending";
  }
};

export async function mapApiTask(apiTask: ApiTask): Promise<Task> {
  const status =
    apiTask.assignments && apiTask.assignments.length > 0
      ? getKanbanStatus(apiTask.assignments[0].status)
      : "pending";

  return {
    id: apiTask.id.toString(),
    title: apiTask.title,
    description: apiTask.description,
    status: status,
    priority: apiTask.priority
  };
}

export const fetchTasks = async (): Promise<ApiTask[]> => {
  const token = getToken();

  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Token ${token}`;
  }

  const response = await fetch("api/tasks", { headers });
  if (!response.ok) {
    throw new Error("Failed to fetch tasks from API");
  }
  return response.json();
};

export const fetchTasksForAssignments = (
  assignments: TaskAssignment[],
  headers: HeadersInit
): Promise<ApiTask>[] => {
  const taskPromises = assignments.map((assignment) =>
    fetch(`/api/tasks/${assignment.task}/`, { headers }).then((response) => {
      if (!response.ok) {
        console.error(`Failed to fetch task ${assignment.task}`, response);
        throw new Error(`Failed to fetch task ${assignment.task}`);
      }
      return response.json();
    })
  );
  return taskPromises;
};

export const fetchTasksDetailsAdmin = async (): Promise<TaskDetail[]> => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found in local storage.");
  }

  const response = await fetch("/api/tasks", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Failed to fetch all tasks" }));
    throw new Error(errorData.message);
  }

  return response.json();
};