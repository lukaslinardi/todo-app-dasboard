import axios from "axios";
import { TasksList, UpdateTask, CreateTask } from "../types/types";

export const getTasksList = async (): Promise<any> => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      method: "GET",
      url: `${import.meta.env.VITE_REACT_API_URL}tasks`,
    };
    const res = await axios(config);
    return res.data;
  } catch (err: any) {
    return err.response.data;
  }
};

export const createTask = async (body: CreateTask) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      url: `${import.meta.env.VITE_REACT_API_URL}tasks`,
      data: {
        task_name: body.task_name,
        deadline_task: body.deadline_task,
        parent_id: body.parent_id,
      },
    };
    const res = await axios(config);
    return res.data;
  } catch (err: any) {
    return err.response.data;
  }
};

export const updateTask = async (body: UpdateTask) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
      url: `${import.meta.env.VITE_REACT_API_URL}tasks/${body.id}`,
      data: {
        task_name: body.task_name,
        deadline_task: body.deadline_task,
      },
    };
    const res = await axios(config);
    return res.data;
  } catch (err: any) {
    return err.response.data;
  }
};

export const deleteTask = async (id: number) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      method: "DELETE",
      url: `${import.meta.env.VITE_REACT_API_URL}tasks/${id}`,
    };
    const res = await axios(config);
    return res.data;
  } catch (err: any) {
    return err.response.data;
  }
};

export const updateTaskStatus = async (id: number) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
      url: `${import.meta.env.VITE_REACT_API_URL}update-tasks/${id}`,
    };
    const res = await axios(config);
    return res.data;
  } catch (err: any) {
    return err.response.data;
  }
};
