"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { createTaskAssignment } from "../../../utils/fetchTaskAssignment";
import { Button } from "../../../sharedComponents/Button";
import { Checkbox } from "../Checkbox/index";
import { useFetchTasks } from "../../../hooks/useFetchTasks";

export default function TasksDetails() {
  const router = useRouter();
  const { tasks, setTasks, loading, error } = useFetchTasks();
  const [isAddMode, setIsAddMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClick = () => {
    setIsVisible(false);
    setIsAddMode(true);
  };

  const handleTaskToggle = (taskId: string) => {
    if (isSubmitting) return;
    setSelectedTasks((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(taskId)) {
        newSelected.delete(taskId);
      } else {
        newSelected.add(taskId);
      }
      return newSelected;
    });
  };

  const handleAddTasks = async () => {
    setIsSubmitting(true);
    const organizationId = localStorage.getItem("user_id");

    const assignmentPromises = Array.from(selectedTasks).map((taskId) =>
      createTaskAssignment(taskId, organizationId)
    );

    try {
      const newAssignments = await Promise.all(assignmentPromises);
      setTasks((prevTasks) =>
        prevTasks.filter((task) => !selectedTasks.has(task.id))
      );

      setSelectedTasks(new Set());
      const newTasksForKanban = newAssignments.map((assignment) => {
        const originalTask = tasks.find(
          (task) => task.id === assignment.task.toString()
        );
        return {
          id: assignment.task.toString(),
          title: originalTask ? originalTask.title : "New Task",
          description: originalTask ? originalTask.description : "",
          status: assignment.status,
          assignmentId: assignment.id,
        };
      });
      const newTasksParam = encodeURIComponent(
        JSON.stringify(newTasksForKanban)
      );
      router.push(`/kanban?newTasks=${newTasksParam}`);
    } catch (error) {
      console.error("One or more assignments failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSelectedTasks(new Set());
    setIsAddMode(false);
  };

  const priorityColors: { [key: string]: string } = {
    high: "bg-red-600",
    medium: "bg-orange-300",
    low: "bg-green-500",
  };

  if (error) {
    return (
      <div className="p-4 sm:p-6 min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-red-600 text-center">
          Something went Wrong, Please reload your page
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-gray-600">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl sm:text-4xl font-semibold text-[#00353D]">
          Tasks
        </h1>
        <div className="relative w-full sm:w-auto mt-0 sm:mt-0">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
            size={20}
          />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            className="w-full sm:w-auto pl-10 pr-4 py-2 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1e4a47]"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          {isVisible && (
            <p className="text-gray-600 text-sm sm:text-xs md:text-sm text-center sm:text-left">
              Click &quot;Select Tasks&quot; to start choosing tasks from the
              list. ➤
            </p>
          )}
          {!isAddMode && (
            <Button
              onClick={handleClick}
              className="bg-[#1e4a47] hover:bg-[#2a5e5a] text-white px-4 sm:px-6 py-2 rounded-full cursor-pointer w-full sm:w-auto"
              aria-label="Add Task"
            >
              Select Tasks
            </Button>
          )}
        </div>
      </div>
      <div className="h-1.5 bg-[#266A74] opacity-50 mb-8"></div>

      <div className="h-[50vh] sm:h-[55vh] md:h-[60vh] lg:h-[60vh] xl:h-[70vh] space-y-3 mb-6 overflow-y-auto pr-2">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className={`bg-white rounded-[50px] p-3 sm:p-4 drop-shadow-lg border border-gray-200 ${
                isAddMode ? "cursor-pointer hover:bg-gray-50" : ""
              }`}
              onClick={isAddMode ? () => handleTaskToggle(task.id) : undefined}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <AnimatePresence>
                  {isAddMode && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Checkbox
                        checked={selectedTasks.has(task.id)}
                        onCheckedChange={() => handleTaskToggle(task.id)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div
                  className={`w-3 h-3 rounded-full ${
                    priorityColors[task.priority] || "bg-gray-300"
                  }`}
                ></div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 text-xl truncate">
                    {task.title}
                  </p>
                </div>

                {!isAddMode && (
                  <motion.div
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedTaskId(
                        expandedTaskId === task.id ? null : task.id
                      );
                    }}
                    className="cursor-pointer p-2"
                    animate={{ rotate: expandedTaskId === task.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-950"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </motion.div>
                )}
              </div>

              <AnimatePresence>
                {expandedTaskId === task.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="mt-2 pl-11"
                  >
                    <p className="text-gray-600 text-lg">
                      {task.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        ) : searchQuery ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500 text-lg">
              No tasks found for &quot;{searchQuery}&quot;
            </p>
          </div>
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500 text-lg">No tasks available.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isAddMode && (
          <div className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col sm:flex-row gap-3 sm:gap-4 w-[90vw] sm:w-auto bg-white p-3 sm:p-4 rounded-lg shadow-lg border border-gray-200">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="px-4 sm:px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full cursor-pointer w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTasks}
              disabled={selectedTasks.size === 0}
              className="bg-[#1e4a47] hover:bg-[#2a5e5a] text-white px-4 sm:px-6 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer w-full sm:w-auto"
            >
              Add ({selectedTasks.size}) to my tasks
            </Button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
