"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Search } from "lucide-react";
import { createTaskAssignment } from "../../../utils/fetchtaskAssignment";
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

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClick = () => {
    setIsVisible(false); 
    setIsAddMode(true)
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
    const organizationId = 7; 

    const assignmentPromises = Array.from(selectedTasks).map((taskId) =>
      createTaskAssignment(taskId, organizationId)
    );

    try {
      const newAssignments = await Promise.all(assignmentPromises);
      setTasks((prevTasks) =>
        prevTasks.filter((task) => !selectedTasks.has(task.id))
      );


      setSelectedTasks(new Set());
      const newTasksForKanban = newAssignments.map(assignment => {
      const originalTask = tasks.find(t => t.id === assignment.task.toString())
      return{
        id: assignment.task.toString(),
        title: originalTask? originalTask.title : 'New Task',
        description: originalTask ? originalTask.description: '',
        status: assignment.status,
        assignmentId: assignment.id
      }
      })
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

  if (error) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-red-600">Something went Wrong, Please reload your page</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-gray-600">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Tasks</h1>
        <div className="relative mt-3 mb-2 flex items-center">
  <Search className="absolute left-3 text-black" size={20} />
  <input
    type="text"
    placeholder="Search"
    value={searchQuery}
    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
      setSearchQuery(e.target.value)
    }
    className="pl-10 bg-white border-gray-500 h-[3vh] text-black rounded-lg"
  />
</div>

        <div className="flex items-center gap-4">
          {isVisible && <p className="text-gray-600 text-lg">Click "Select Tasks" to start choosing tasks from the list. ➤</p>}
          {!isAddMode && (
            <Button
              onClick={handleClick}
              className="bg-[#1e4a47] hover:bg-[#2a5e5a] text-white px-6 py-2 rounded-full cursor-pointer"
              aria-label="Add Task"
            >
              Select Tasks
            </Button>
          )}
        </div>
        
      </div>
      <div className="h-1.5 bg-[#266A74] opacity-50 mb-10"></div>

      <div className="space-y-3 mb-6 overflow-y-scroll h-[80vh]">
        {filteredTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className={`bg-white rounded-[50px] p-3 mr-10 drop-shadow-lg border border-gray-200 flex items-center gap-4 ${
              isAddMode ? "cursor-pointer hover:bg-gray-50" : ""
            }`}
            onClick={isAddMode ? () => handleTaskToggle(task.id) : undefined}
          >
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

            <div className="flex-1">
              <p className="text-gray-800">{task.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isAddMode && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTasks}
              disabled={selectedTasks.size === 0}
              className="bg-[#1e4a47] hover:bg-[#2a5e5a] text-white px-6 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Add ({selectedTasks.size}) to my tasks
            </Button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

