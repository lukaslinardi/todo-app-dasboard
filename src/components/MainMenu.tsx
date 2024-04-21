import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField,
} from "@mui/material";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import TaskList from "./TaskList";
import { createTask } from "../services/task";
import { CreateTask } from "../types/types";

const MainMenu = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reqBody, setReqBody] = useState<CreateTask>({
    task_name: "",
    deadline_task: null,
  });

  const { mutate: mutateCreateTask } = useMutation({
    mutationFn: createTask,
    onSuccess() {
      setIsModalOpen(false);
      setReqBody({ task_name: "", deadline_task: null });
      queryClient.invalidateQueries({
        queryKey: ["task-list"],
      });
    },
  });

  return (
    <div>
      <div className="flex justify-center items-center mt-[110px] w-full">
        <p className="font-bold text-blue-500 text-[50px]">Task List</p>
        <button
          className="py-2 px-5 bg-blue-500 text-white font-bold rounded-md"
          onClick={() => setIsModalOpen(true)}
        >
          Create Task
        </button>
      </div>
      <div className="flex justify-center">
        <div className="border border-black w-[50%] p-3 rounded-md">
          <TaskList />
        </div>
      </div>
      <Dialog
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setReqBody({ task_name: "", deadline_task: null });
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create Task</DialogTitle>
        <DialogContent>
          <div className="m-3">
            <TextField
              sx={{ marginBottom: 2 }}
              label="Task Name"
              fullWidth
              value={reqBody.task_name}
              onChange={(e) => {
                setReqBody((prevValue) => ({
                  ...prevValue,
                  task_name: e.target.value,
                }));
              }}
            />
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DatePicker
                slotProps={{
                  textField: { variant: "outlined", fullWidth: true },
                }}
                value={reqBody.deadline_task}
                onChange={(newValue) =>
                  setReqBody((prevValue) => ({
                    ...prevValue,
                    deadline_task: newValue,
                  }))
                }
              />
            </LocalizationProvider>
          </div>
        </DialogContent>
        <DialogActions sx={{ display: "flex", justifyContent: "center" }}>
          <button
            className="py-2 px-5 font-bold rounded-md border border-black w-full"
            onClick={() => {
              setIsModalOpen(false);
              setReqBody({ task_name: "", deadline_task: null });
            }}
          >
            Cancel
          </button>
          <button
            className="py-2 px-5 bg-blue-500 text-white font-bold rounded-md w-full"
            onClick={() => mutateCreateTask(reqBody)}
          >
            Add
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MainMenu;
