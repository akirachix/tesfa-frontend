import { useState, useEffect, useCallback } from "react";
import { Task, ApiTask } from "../utils/type";
import {
  fetchTaskAssignments,
  updateTaskAssignmentStatus,
} from "../utils/fetchTaskAssignment";
import { TaskStatus } from "../utils/type";
import { mapApiTask } from "../utils/fetchTasks";
import { getToken } from "../utils/getToken";
import { fetchTasksForAssignments } from '../utils/fetchTasks';


export const useFetchTaskAssignments = () => {
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getAssignedTasks = async () => {
      setLoading(true);
      try {
        const assignments = await fetchTaskAssignments();
        console.log("Fetched Assignments:", assignments);

        if (!assignments || assignments.length === 0) {
          setLoading(false);
          return;
        }

        const token = getToken();
        const headers: HeadersInit = {};
        if (token) {
          headers["Authorization"] = `Token ${token}`;
        }
        const taskPromises = fetchTasksForAssignments(assignments, headers)

        const tasksData = await Promise.all(taskPromises);
        const formattedTasks = await Promise.all(
          tasksData.filter((task): task is ApiTask => task !== null).map(mapApiTask)
        );
        const tasksWithAssignments = formattedTasks.map((task) => {
          const assignment = assignments.find(
            (assignment) => assignment.task === parseInt(task.id)
          );
          return {
            ...task,
            assignmentId: assignment ? assignment.id : undefined,
            status: assignment ? assignment.status : "pending",
          };
        });
        console.log("Tasks with Assignments (formatted):", tasksWithAssignments);

        setAssignedTasks(tasksWithAssignments);
      } catch (error) {
        console.error("An error occurred during the fetching process:", error);
        setError(error as Error);
      } finally {  
        setLoading(false);
      }
    };
    getAssignedTasks();
  }, []);

  const updateTaskStatus = useCallback(
    async (taskId: string, newStatus: TaskStatus) => {
      const task = assignedTasks.find((task) => task.id === taskId);
      if (task && task.assignmentId) {
        try {
          await updateTaskAssignmentStatus(task.assignmentId, newStatus);
          setAssignedTasks((prevTasks) =>
            prevTasks.map((task) =>
              task.id === taskId ? { ...task, status: newStatus } : task
            )
          );
        } catch (error) {
          console.error(
            "Failed to update task status, reverting change.",
            error
          );
        }
      }
    },
    [assignedTasks]
  );

  return { assignedTasks, setAssignedTasks, loading, error, updateTaskStatus };
};
