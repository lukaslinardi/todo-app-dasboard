import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField,
  Tab,
  Tabs,
  Checkbox,
} from "@mui/material";
import moment from "moment";

import {
  getTasksList,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from "../services/task";
import { UpdateTask } from "../types/types";

const toDate = (date: string) => moment(date).format("DD/MMM/YYYY");

const TaskList = () => {
  const queryClient = useQueryClient();
  const [modalAttribute, setModalAttribute] = useState({
    modalState: false,
    modalType: 0,
  });
  const [reqBody, setReqBody] = useState<UpdateTask>({ id: 0, task_name: "" });
  const { data } = useQuery({
    queryKey: ["task-list"],
    queryFn: () => getTasksList(),
  });

  const [taskTab, setTaskTab] = useState(1);
  const [taskId, setTaskId] = useState<number | null>(null);

  const { mutate: mutateUpdateTask } = useMutation({
    mutationFn: updateTask,
    onSuccess() {
      setModalAttribute((prevValue) => ({
        ...prevValue,
        modalState: false,
      }));
      queryClient.invalidateQueries({
        queryKey: ["task-list"],
      });
    },
  });

  const { mutate: mutateUpdateStatus } = useMutation({
    mutationFn: updateTaskStatus,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["task-list"],
      });
      setTaskId(null);
    },
  });

  const { mutate: mutateDeleteTask } = useMutation({
    mutationFn: deleteTask,
    onSuccess() {
      setModalAttribute((prevValue) => ({
        ...prevValue,
        modalState: false,
      }));
      queryClient.invalidateQueries({
        queryKey: ["task-list"],
      });
    },
  });

  return (
    <div className="flex justify-center">
      <div className="w-[100%]">
        <Tabs
          value={taskTab}
          onChange={(_, newValue: number) => setTaskTab(newValue)}
        >
          <Tab label="on progress" value={1} />
          <Tab label="completed" value={2} />
        </Tabs>

        <div hidden={taskTab === 2}>
          {data && data !== undefined
            ? data
                .filter((item) => item.task_status === 1)
                .map((item) => (
                  <div
                    key={item.id}
                    className="border-2 border-black p-2 rounded-md text-[20px] mt-2 w-full "
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Checkbox
                          checked={taskId === item.id}
                          onChange={() => {
                            setTaskId(item.id);
                            mutateUpdateStatus(item.id);
                          }}
                        />
                        <p>{item.task_name}</p>
                      </div>
                      <div>
                        <button
                          className="p-2 font-bold rounded-md border bg-blue-500 mr-3"
                          onClick={() => {
                            setModalAttribute((prevValue) => ({
                              ...prevValue,
                              modalState: true,
                              modalType: 1,
                            }));
                            setReqBody((prevValue) => ({
                              ...prevValue,
                              id: item.id,
                              task_name: item.task_name,
                            }));
                          }}
                        >
                          <EditIcon sx={{ color: "white" }} />
                        </button>
                        <button
                          className="p-2 font-bold rounded-md border bg-red-500"
                          onClick={() => {
                            setModalAttribute((prevValue) => ({
                              ...prevValue,
                              modalState: true,
                              modalType: 2,
                            }));
                            setReqBody((prevValue) => ({
                              ...prevValue,
                              id: item.id,
                            }));
                          }}
                        >
                          <DeleteIcon sx={{ color: "white" }} />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <p>Deadline Task: {toDate(item.deadline_task)}</p>
                      {moment(item.deadline_task).isSameOrBefore() ? (
                        <div className="py-2 px-5 font-bold rounded-md bg-red-500 text-white">
                          <p>Overdue</p>
                        </div>
                      ) : (
                        <div className="py-2 px-5 font-bold rounded-md bg-green-500 text-white">
                          <p>On schedule</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
            : null}
        </div>

        <div hidden={taskTab === 1}>
          {data && data !== undefined
            ? data
                .filter((item) => item.task_status === 2)
                .map((item) => (
                  <div
                    className="border-2 border-green-500 p-2 rounded-md text-[20px] mt-2 w-full flex justify-between items-center"
                    key={item.id}
                  >
                    <div>
                      <p>{item.task_name}</p>
                    </div>
                    <div className="p-2 font-bold rounded-md border bg-green-500 text-white font-bold mr-3">
                      Completed
                    </div>
                  </div>
                ))
            : null}
        </div>
      </div>
      <Dialog
        open={modalAttribute.modalState}
        onClose={() =>
          setModalAttribute((prevValue) => ({
            ...prevValue,
            modalState: false,
          }))
        }
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {modalAttribute.modalType === 1 ? "Update Task" : "Delete Task"}
        </DialogTitle>
        <DialogContent>
          {modalAttribute.modalType === 1 ? (
            <div className="m-3">
              <TextField
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
            </div>
          ) : (
            <p>Are you sure to delete task name: {reqBody.task_name} ?</p>
          )}
        </DialogContent>
        <DialogActions sx={{ display: "flex", justifyContent: "center" }}>
          <button
            className="py-2 px-5 font-bold rounded-md border border-black w-full"
            onClick={() => {
              setModalAttribute((prevValue) => ({
                ...prevValue,
                modalState: false,
              }));
            }}
          >
            Cancel
          </button>
          <button
            className={`py-2 px-5 text-white font-bold rounded-md w-full ${modalAttribute.modalType === 1 ? "bg-blue-500" : "bg-red-500"}`}
            onClick={() => {
              if (modalAttribute.modalType === 1) {
                mutateUpdateTask(reqBody);
              } else if (modalAttribute.modalType === 2) {
                mutateDeleteTask(reqBody.id);
              }
            }}
          >
            {modalAttribute.modalType === 1 ? "Update" : "Delete"}
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TaskList;
