"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import { TaskCard } from "../Taskcard";
import { DropZone } from "../Dropzone";
import { useFetchTaskAssignments } from "../../../hooks/useFetchTaskAssignment";
import { Task } from "../../../utils/type";
import { TaskStatus } from "../../../utils/type";
import { deleteTaskAssignment } from "../../../utils/fetchTaskAssignment";

const columns = [
  { id: "pending", title: "Tasks", color: "bg-[#D3AC45]" },
  { id: "in_progress", title: "Pending", color: "bg-[#D3AC45]" },
  { id: "cancelled", title: "In progress", color: "bg-[#D3AC45]" },
  { id: "completed", title: "Completed", color: "bg-[#D3AC45]" },
];

export default function KanbanBoard() {
  const {
    assignedTasks,
    setAssignedTasks,
    loading,
    error,
    updateTaskStatus,
  } = useFetchTaskAssignments();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!searchParams) return;

    const newTasksParam = searchParams.get("newTasks");
    if (newTasksParam) {
      try {
        const newTasks = JSON.parse(decodeURIComponent(newTasksParam));

        setAssignedTasks((prevTasks) => {
          const existingTasksIds = new Set(prevTasks.map((t) => t.id));
          const tasksToAdd = newTasks.filter(
            (task: Task) => !existingTasksIds.has(task.id)
          );
          return [...prevTasks, ...tasksToAdd];
        });
        router.replace("/kanban");
      } catch (error) {
        console.error("Failed to parse tasks from URL", error);
      }
    }
  }, [searchParams, setAssignedTasks, router]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = assignedTasks.find((task) => task.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const taskId = active.id as string;
      const newStatus = over.id as TaskStatus;

      setAssignedTasks((prevTasks: Task[]) => {
        return prevTasks.map((task) => {
          if (task.id === taskId) {
            return { ...task, status: newStatus };
          }
          return task;
        });
      });
      updateTaskStatus(taskId, newStatus);
    }
    setActiveTask(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    const taskToDelete = assignedTasks.find((task) => task.id === taskId);

    if (!taskToDelete || !taskToDelete.assignmentId) {
      console.error("Cannot delete: Task or assignmentId not found.");
      return;
    }
    try {
      await deleteTaskAssignment(taskToDelete.assignmentId);
      setAssignedTasks((prevTasks) =>
        prevTasks.filter((task) => task.id !== taskId)
      );
    } catch (error) {
      console.error("Failed to delete task assignment:", error);
    }
  };

  const getTasksByStatus = (status: Task["status"]) => {
    return assignedTasks.filter((task) => task.status === status);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-gray-600">Loading board...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-red-600 text-center">
          Something went Wrong, Please reload your page
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="p-4 sm:p-6 md:p-8 lg:p-10 bg-gray-50 overflow-x-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#00353D]">
            Task Tracking
          </h1>
        </div>
        <div className="h-1.5 bg-[#266A74] opacity-50 mb-6 sm:mb-8"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {columns.map((column) => (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#E7EDEE] rounded-lg shadow-sm overflow-hidden flex flex-col"
            >
              <div
                className={`${column.color} px-3 sm:px-4 py-2 sm:py-3 rounded-tl-[20px] rounded-tr-[20px]`}
              >
                <h3 className="font-medium text-center text-black text-sm sm:text-base">
                  {column.title}
                </h3>
              </div>
              <DropZone
                id={column.id}
                className={`p-3 sm:p-4 bg-gray-100 relative overflow-y-auto no-scrollbar min-h-[30vh] sm:min-h-[40vh] md:min-h-[50vh] lg:min-h-[60vh] xl:min-h-[70vh]`}
              >
                <div className="space-y-3">
                  {getTasksByStatus(column.id as Task["status"]).map(
                    (task, index) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        index={index}
                        onDelete={handleDeleteTask}
                      />
                    )
                  )}
                  {getTasksByStatus(column.id as Task["status"]).length === 0 && (
                    <div className="text-center text-gray-500 py-6 text-sm">
                      Drop tasks here
                    </div>
                  )}
                </div>
              </DropZone>
            </motion.div>
          ))}
        </div>
      </div>
      <DragOverlay>
        {activeTask ? (
          <TaskCard task={activeTask} index={0} onDelete={handleDeleteTask} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}