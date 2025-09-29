import { useState, useEffect } from "react";
import { fetchTasksAssignmentsAdmin } from "../utils/fetchTaskAssignment";
import { fetchTasksDetailsAdmin } from "../utils/fetchTasks";
import { fetchOrganizationsAdmin } from "../utils/fetchOrganizations";
import { fetchPredictionsAdmin } from "../utils/fetchPredictionsAdmin";
import { TaskAssignment, TaskDetail, User, Prediction } from "../utils/type";

interface DashboardData {
    taskAssignments: TaskAssignment[];
    allTasks: TaskDetail[];
    organizations: User[];
    predictions: Prediction[];
    taskTitleMap: Map<number, string>;
    organizationNameMap: Map<number, string>;
}

export const useDashboardData = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchAllDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [
                    taskAssignmentsResponse,
                    allTasksResponse,
                    allUsersResponse,
                    predictionsResponse,
                ] = await Promise.all([
                    fetchTasksAssignmentsAdmin(),
                    fetchTasksDetailsAdmin(),
                    fetchOrganizationsAdmin(),
                    fetchPredictionsAdmin(),
                ]);

                const organizations = allUsersResponse.filter(
                    (user: User) => user.role === "organization"
                );
                const organizationNameMap = new Map<number, string>();
                organizations.forEach((org: User) => {
                    organizationNameMap.set(org.id, org.org_name);
                });

                const taskTitleMap = new Map<number, string>();
                allTasksResponse.forEach((task: TaskDetail) => {
                    taskTitleMap.set(task.id, task.title);
                });

                setData({
                    taskAssignments: taskAssignmentsResponse,
                    allTasks: allTasksResponse,
                    organizations: organizations,
                    predictions: predictionsResponse,
                    taskTitleMap,
                    organizationNameMap,
                });
            } catch (error) {
                setError(error as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllDashboardData();
    }, []);

    return { data, loading, error };
};
