import React from 'react';
import { motion } from 'motion/react';
import { useDraggable } from '@dnd-kit/core';
import { LuTrash2 } from "react-icons/lu";
import { TaskStatus } from '../../../utils/type';


interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
}

interface TaskCardProps {
  task: Task;
  index: number;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, index, onDelete }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style: React.CSSProperties = {
    transform: `translate3d(${transform?.x ?? 0}px, ${transform?.y ?? 0}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
    position: 'relative',
    zIndex: isDragging ? 1 : 0,
  };


  const getCardColor = (status: string) => {
    switch (status) {
      case 'tasks':
        return 'bg-[#266A74]'
      case 'pending':
        return 'bg-[#013840]'
      case 'in-progress':
        return 'bg-[#266A74]'
      case 'completed':
        return 'bg-[#013840]'
      default:
        return 'bg-[#4a7c79]'
    }
  };

  return (
    <> 
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 1.05, rotate: 2 }}
      className="select-none group"
    >
        <button 
        onClick={() => {
          onDelete(task.id);
        }}
        className='absolute top-2 right-2 p-1 rounded-full bg-gray-700 hover:bg-gray-800 cursor-pointer text-white opacity-0 group-hover:opacity-100 transition-opacity z-10'>
          <LuTrash2 size={16}/>
        </button>
      
      <div className={`${getCardColor(task.status)} border-none rounded-2xl h-[20vh] sm:h-[18vh] md:h-[20vh] text-white p-3 sm:p-4 mb-3 shadow-lg hover:shadow-xl transition-shadow w-full`}>
       <div {...listeners} {...attributes} className="w-full">
        <div className="space-y-1 sm:space-y-2">
          <h4 className="font-medium text-lg sm:text-base">{task.title}</h4>
          {task.description && (
            <p className="text-xs sm:text-sm text-gray-200 opacity-90 line-clamp-2">{task.description}</p>
          )}
        </div>
        </div>
      </div>
    </motion.div>
    </>
  );
}