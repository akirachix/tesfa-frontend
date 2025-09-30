import { TaskAssignment, TaskStatus } from "./type";
import { getToken } from "./getToken";

const buildHeaders = (token?: string | null, includeJsonContentType = true): HeadersInit => {
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Token ${token}`;
  }
  if (includeJsonContentType) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
};

export const fetchTaskAssignments = async (): Promise<TaskAssignment[]> => {
  const token = getToken();
  const headers = buildHeaders(token, false);
  const response = await fetch("/api/task-assignments/", { headers });
  if (!response.ok) {
    throw new Error("Failed to fetch task assignments from API");
  }
  return response.json();
};

export const fetchTasksAssignmentsAdmin = async (): Promise<TaskAssignment[]> => {
  const token = getToken();
  const headers = buildHeaders(token);
  const response = await fetch('/api/task-assignments/', { headers });
  if (!response.ok) {
    throw new Error('Failed to fetch tasks from API');
  }
  return response.json();
};

export const updateTaskAssignmentStatus = async (
  id: number,
  status: TaskStatus
): Promise<TaskAssignment> => {
  const token = getToken();
  const headers = buildHeaders(token);
  const response = await fetch(`/api/task-assignments/${id}/`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error("Failed to update task assignment status");
  }
  return response.json();
};

export async function createTaskAssignment(task: string, organization: string | null) {
  const token = getToken();
  const headers = buildHeaders(token);
  const response = await fetch("/api/task-assignments/", {
    method: "POST",
    headers,
    body: JSON.stringify({ task, organization }),
  });
  if (!response.ok) {
    throw new Error("Failed to create task assignment");
  }
  return response.json();
}

export const deleteTaskAssignment = async (assignmentId: number): Promise<void> => {
  const token = getToken();
  const headers = buildHeaders(token, false);
  const response = await fetch(`/api/task-assignments?assignmentId=${assignmentId}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) {
    throw new Error("Failed to delete task assignment");
  }
};
