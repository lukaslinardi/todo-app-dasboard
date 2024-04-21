import { Moment } from "moment";

export type TasksList = {
  id: number;
  task_name: string;
  deadline_task: string;
  task_status: number;
  created_at: Date;
  updated_at: Date;
};

export type UpdateTask = {
  id: number;
  task_name: string;
};

export type CreateTask = {
  task_name: string;
  deadline_task: Moment | null;
};
