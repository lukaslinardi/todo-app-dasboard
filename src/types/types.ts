import { Moment } from "moment";

export type TasksList = {
  id: number;
  task_name: string;
  deadline_task: string;
  task_status: number;
  parent_id: number | null;
  created_at: Date;
  updated_at: Date;
};

export type TasksListSub = {
  id: number;
  task_name: string;
  deadline_task: string;
  parent_id: number | null;
  buffer: TasksList[];
  task_status: number;
  created_at: Date;
  updated_at: Date;
  isOpen: boolean;
  completion_percentage: number;
};

export type UpdateTask = {
  id: number;
  task_name: string;
};

export type CreateTask = {
  task_name: string;
  deadline_task: Moment | null;
  parent_id: number | null;
};
