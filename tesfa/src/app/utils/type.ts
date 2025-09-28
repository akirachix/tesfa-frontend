export type TaskStatus = "pending" | "in_progress" | "cancelled" | "completed";
export type Priority = "high" | "medium" | "low";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignmentId?: number;
  priority: Priority;
  
}

export interface ApiTask {
  id: number;
  title: string;
  description: string;
  assignments: { status: string }[];
  priority: Priority;
}


export interface TaskAssignment{
    id: number;
    task: number;
    organization: number;
    status: TaskStatus;
    created_at: string;
    updated_at: string;
}

export interface TaskDetail {
  id: number;
  title: string;
  description: string;
  priority: string;
  prediction: number | null;
  agent: number | null;
  assignments: any[];
  created_at: string;
  updated_at: string;
}

export interface User{
  id: number;
  email: string;
  role: "organization" | "admin";
  org_name: string;
  logo_image: string | null;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

export interface Prediction {
  prediction_id: number;
  description: string;
  disease_risks: any[];
  date_generated: string;
  agent: any;
  region: string | null;
  country: string | null;
}


 
 

