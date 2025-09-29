"use client";

import { useState } from "react";
import React from "react";
import { motion } from "framer-motion";
import { FaSearch } from "react-icons/fa";
import { useDashboardData } from "../../../hooks/useTaskPageData";
import Image from "next/image";  

export default function TasksAdmin() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data, loading, error } = useDashboardData();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-red-600">
          Error loading data: {error.message}. Please ensure your token is
          valid.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-gray-600">No data available.</p>
      </div>
    );
  }

  const { taskAssignments, predictions, taskTitleMap, organizationNameMap } =
    data;
  const totalInterventions = taskAssignments.length;
  const completedTasks = taskAssignments.filter(
    (assignment) => assignment.status === "completed"
  ).length;
  const predictedCases = predictions.length;

  const liveDashboardStats = [
    { title: "Predicted Cases", value: predictedCases },
    { title: "Total Interventions", value: totalInterventions },
    { title: "Completed Tasks", value: completedTasks },
  ];

  const filteredAssignments = taskAssignments.filter((assignment) => {
    const taskTitle = taskTitleMap.get(assignment.task)?.toLowerCase() || "";
    const orgName =
      organizationNameMap.get(assignment.organization)?.toLowerCase() || "";
    const status = assignment.status ? assignment.status.toLowerCase() : "";
    const query = searchQuery.toLowerCase();

    return (
      taskTitle.includes(query) ||
      orgName.includes(query) ||
      status.includes(query)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAssignments.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);

  const getStatusColor = (status?: string) => {
    if (!status) {
      return "text-gray-600";
    }
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-600";
      case "in_progress":
        return "text-orange-400";
      case "cancelled":
        return "text-purple-600";
      case "pending":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const statusDisplayNames: { [key: string]: string } = {
    completed: "Completed",
    in_progress: "In Progress",
    cancelled: "Cancelled",
    pending: "Pending",
  };

  const getStatusDisplayName = (status?: string) => {
    if (!status) {
      return "Unknown";
    }
    return statusDisplayNames[status] || status;
  };

  return (
    <div>
      <div className="flex justify-around items-center h-[25vh] mb-20">
        {liveDashboardStats.map((stat, index) => (
          <div
            key={index}
            className="relative flex flex-col h-[22vh] w-[20vh] items-center"
          >
            <Image
              src="/Images/ellipse.png"
              alt="Ellipse"
              className="w-[20vh] h-[20vh] object-contain"
              width={320}  
              height={320} 
            />
            <span className="absolute top-1/2 text-[3em] -translate-y-3/4 text-xl font-bold text-gray-800">
              {stat.value}
            </span>
            <p className="mt-2 text-center text-[1.2em] font-large text-black">
              {stat.title}
            </p>
          </div>
        ))}
      </div>
      <div className="mb-6 relative w-full max-w-sm">
        <FaSearch
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          size={20}
        />
        <input
          type="search"
          placeholder="Search"
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchQuery(e.target.value)
          }
          className="w-full pl-10 pr-4 py-2 rounded-[20px] border border-gray-300 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent"
          aria-label="Search"
        />
      </div>
      <div className="flex  gap-82 items-center mb-2 px-[10vh]">
        <h3 className="font-semibold text-black text-[1.5em] ">Tasks</h3>
        <h3 className="font-semibold text-black text-[1.5em] ">Organization</h3>
        <h3 className="font-semibold text-black text-[1.5em] ">Status</h3>
        <h3 className="font-semibold text-black text-[1.5em] ">Date</h3>
      </div>

      <div className="h-1.5 bg-[#266A74] opacity-50 mb-10"></div>
      {filteredAssignments.length > 0 ? (
        <div className="space-y-3 mb-6 overflow-y-scroll h-[40vh]">
          {currentItems.map((assignment, index) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="bg-white rounded-[50px] p-3 mr-10 drop-shadow-lg border border-gray-200 flex items-center gap-4"
            >
              <div className="flex justify-between px-[10vh] items-center w-full">
                <p className="text-gray-600">
                  {taskTitleMap.get(assignment.task) ||
                    `Task ID: ${assignment.task}`}
                </p>
                <p className="text-gray-600">
                  {organizationNameMap.get(assignment.organization) ||
                    `Org ID: ${assignment.organization}`}
                </p>
                <p className={getStatusColor(assignment.status)}>
                  {getStatusDisplayName(assignment.status)}
                </p>
                <p className="text-gray-600">
                  {new Date(assignment.created_at).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-[40vh]">
          <p className="text-gray-600">No results found.</p>
        </div>
      )}
      {filteredAssignments.length > itemsPerPage && (
        <div className="flex justify-center items-center -mt-5 space-x-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="rounded-lg bg-blue-200 p-2 text-gray-700 disabled: opacity-50"
          >
            Previous
          </button>
          <span className="text-black">
            page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="rounded-lg bg-blue-200 p-2 text-gray-700 disabled: opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
