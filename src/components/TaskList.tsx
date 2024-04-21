import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from "@mui/icons-material";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField,
  Tab,
  Tabs,
  Checkbox,
  Collapse,
} from "@mui/material";
import moment from "moment";

import {
  getTasksList,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from "../services/task";
import {
  TasksList,
  UpdateTask,
  CreateTask,
  TasksListSub,
} from "../types/types";

const toDate = (date: string) => moment(date).format("DD/MMM/YYYY");

type Props = {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setCreateTaskParent: React.Dispatch<React.SetStateAction<CreateTask>>;
};

const TaskList = (props: Props) => {
  const { setIsModalOpen, setCreateTaskParent } = props;
  const queryClient = useQueryClient();
  const [dataBuffer, setDataBuffer] = useState<TasksListSub[] | undefined>([]);
  const [modalAttribute, setModalAttribute] = useState({
    modalState: false,
    modalType: 0,
  });
  const [reqBody, setReqBody] = useState<UpdateTask>({ id: 0, task_name: "" });

  const { data: taskListData, status } = useQuery({
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

  useEffect(() => {
    if (status === "success") {
      setDataBuffer(
        taskListData.map((data: TasksListSub) => ({
          ...data,
          isOpen: false,
          buffer: taskListData
            .filter((item: TasksList) => item.parent_id === data.id)
            .map((item: TasksList) => item),
        })),
      );
    }
  }, [taskListData, status]);

  return (
    <div className="flex justify-center">
      <div className="w-[100%]">
        <div className="flex justify-between items-center">
          <Tabs
            value={taskTab}
            onChange={(_, newValue: number) => setTaskTab(newValue)}
          >
            <Tab label="on progress" value={1} />
            <Tab label="completed" value={2} />
          </Tabs>
          <button
            className="py-2 px-5 bg-blue-500 text-white font-bold rounded-md"
            onClick={() => setIsModalOpen(true)}
          >
            Create Task
          </button>
        </div>

        <div hidden={taskTab === 2}>
          {dataBuffer && dataBuffer !== undefined
            ? dataBuffer
                .filter(
                  (data: TasksListSub) =>
                    data.task_status === 1 &&
                    data.parent_id === null &&
                    data.completion_percentage < 100,
                )
                .map((data, index) => (
                  <div
                    key={data.id}
                    className="border-2 border-black p-2 rounded-md text-[20px] mt-2 w-full "
                  >
                    {data.parent_id !== null ? (
                      <p>task completed: {data.completion_percentage} %</p>
                    ) : (
                      <p>task completed: 0 %</p>
                    )}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Checkbox
                          checked={taskId === data.id}
                          onChange={() => {
                            setTaskId(data.id);
                            mutateUpdateStatus(data.id);
                          }}
                        />
                        <p>{data.task_name}</p>
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
                              id: data.id,
                              task_name: data.task_name,
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
                              id: data.id,
                            }));
                          }}
                        >
                          <DeleteIcon sx={{ color: "white" }} />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <p>Deadline Task: {toDate(data.deadline_task)}</p>
                      {moment(data.deadline_task).isSameOrBefore() ? (
                        <div className="py-2 px-5 font-bold rounded-md bg-red-500 text-white">
                          <p>Overdue</p>
                        </div>
                      ) : (
                        <div className="py-2 px-5 font-bold rounded-md bg-green-500 text-white">
                          <p>On schedule</p>
                        </div>
                      )}
                    </div>
                    <div className="flex mt-2">
                      <button
                        className="py-2 px-5 text-white font-bold rounded-md w-full bg-blue-500 mr-2"
                        onClick={() => {
                          setIsModalOpen(true);
                          setCreateTaskParent({
                            task_name: "",
                            deadline_task: null,
                            parent_id: data.id,
                          });
                        }}
                      >
                        Create Sub Task
                      </button>
                      {data.buffer.length >= 1 ? (
                        <button
                          className="py-2 px-5 font-bold rounded-md border border-black"
                          onClick={() => {
                            setDataBuffer((prevValue) => {
                              const newData =
                                prevValue && prevValue !== undefined
                                  ? prevValue.map((item) => {
                                      return item.id === data.id
                                        ? {
                                            ...item,
                                            isOpen: !item.isOpen,
                                          }
                                        : item;
                                    })
                                  : [];
                              return newData;
                            });
                          }}
                        >
                          {data.isOpen ? (
                            <KeyboardArrowUpIcon />
                          ) : (
                            <KeyboardArrowDownIcon />
                          )}
                        </button>
                      ) : null}
                    </div>
                    <Collapse
                      in={data.isOpen}
                      unmountOnExit
                      sx={{ fontWeight: "bold", padding: 2 }}
                    >
                      {data.buffer.map((data, idx) => (
                        <div
                          className={`border-2  ${data.task_status === 1 ? "border-black" : "border-green-500"} p-2 rounded-md text-[20px] mt-2 w-full flex items-center justify-between`}
                          key={idx}
                        >
                          <div className="flex items-center">
                            {data.task_status === 1 ? (
                              <Checkbox
                                checked={taskId === data.id}
                                onChange={() => {
                                  setTaskId(data.id);
                                  mutateUpdateStatus(data.id);
                                }}
                              />
                            ) : null}
                            <p>{data.task_name}</p>
                          </div>
                          {data.task_status === 1 ? (
                            <div>
                              {moment(data.deadline_task).isSameOrBefore() ? (
                                <div className="py-2 px-5 font-bold rounded-md bg-red-500 text-white">
                                  <p>Overdue</p>
                                </div>
                              ) : (
                                <div className="py-2 px-5 font-bold rounded-md bg-green-500 text-white">
                                  <p>On schedule</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="py-2 px-5 font-bold rounded-md bg-green-500 text-white">
                              <p>Completed</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </Collapse>
                  </div>
                ))
            : null}
        </div>

        <div hidden={taskTab === 1}>
          {dataBuffer && dataBuffer !== undefined
            ? dataBuffer
                .filter(
                  (data: TasksListSub) =>
                    (data.task_status === 2 &&
                      data.completion_percentage >= 100) ||
                    data.parent_id === null,
                )
                .map((data) => (
                  <div
                    className="border-2 border-green-500 p-2 rounded-md text-[20px] mt-2 w-full "
                    key={data.id}
                  >
                    <div className="flex justify-between items-center">
                      <p>{data.task_name}</p>
                      <div className="p-2 font-bold rounded-md border bg-green-500 text-white font-bold mr-3">
                        Completed
                      </div>
                      {data.buffer.length >= 1 ? (
                        <div className="flex">
                          {data.buffer.length >= 1 ? (
                            <button
                              className="py-2 px-5 font-bold rounded-md border border-black"
                              onClick={() => {
                                setDataBuffer((prevValue) => {
                                  const newData =
                                    prevValue && prevValue !== undefined
                                      ? prevValue.map((item) => {
                                          return item.id === data.id
                                            ? {
                                                ...item,
                                                isOpen: !item.isOpen,
                                              }
                                            : item;
                                        })
                                      : [];
                                  return newData;
                                });
                              }}
                            >
                              {data.isOpen ? (
                                <KeyboardArrowUpIcon />
                              ) : (
                                <KeyboardArrowDownIcon />
                              )}
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                    <Collapse
                      in={data.isOpen}
                      unmountOnExit
                      sx={{ fontWeight: "bold", padding: 2 }}
                    >
                      {data.buffer.map((data, idx) => (
                        <div
                          className={`border-2  ${data.task_status === 1 ? "border-black" : "border-green-500"} p-2 rounded-md text-[20px] mt-2 w-full flex items-center justify-between`}
                          key={idx}
                        >
                          <div className="flex items-center">
                            {data.task_status === 1 ? (
                              <Checkbox
                                checked={taskId === data.id}
                                onChange={() => {
                                  setTaskId(data.id);
                                  mutateUpdateStatus(data.id);
                                }}
                              />
                            ) : null}
                            <p>{data.task_name}</p>
                          </div>
                          <div className="py-2 px-5 font-bold rounded-md bg-green-500 text-white">
                            <p>Completed</p>
                          </div>
                        </div>
                      ))}
                    </Collapse>
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
