import React, { useContext, useEffect, useState } from "react";
import axiosClient from "../utils/axios";
import { dateWhenFormat } from "../utils/dateTools";
import { Avatar } from "@mui/material";
import dateTool from "date-and-time";
import { AlertContext } from "../providers/AlertProvider";

const AdminUser = () => {
  const { setAlert } = useContext(AlertContext)!;
  const [users, setUsers] = useState<User[]>([]);
  const [modal, setModal] = useState<ModalProps>({
    show: false,
    userId: null,
    action: null,
    message: "",
  });

  const handleBlock = (user: User) => {
    setModal({
      show: true,
      userId: user.id,
      action: user.account_status === "BLOCKED" ? "Unblock" : "Block",
      message: `Are you sure you want to ${user.account_status === "BLOCKED" ? "unblock" : "block"} ${user.firstname} ${user.lastname}?`,
    });
  };

  const confirmAction = () => {
    if (modal.action === "Block") {
      axiosClient
        .patch(`/users/block/${modal.userId}`)
        .then(() => {
          setAlert({
            visible: true,
            message: "User has been blocked",
            severity: "success",
          });
          let targetUser = users.find((user) => user.id === modal.userId);
          targetUser!.account_status = "BLOCKED";
          setUsers([...users, targetUser!]);
        })
        .catch((err) => {
          setAlert({
            visible: true,
            message: err.response.data.message,
            severity: "error",
          });
        });
    } else if (modal.action === "Unblock") {
      axiosClient
        .patch(`/users/unblock/${modal.userId}`)
        .then(() => {
          setAlert({
            visible: true,
            message: "User has been unblocked",
            severity: "success",
          });
          let targetUser = users.find((user) => user.id === modal.userId);
          targetUser!.account_status = "ACTIVE";
          setUsers([...users, targetUser!]);
        })
        .catch((err) => {
          setAlert({
            visible: true,
            message: err.response.data.message,
            severity: "error",
          });
        });
    }
    setModal({ show: false, userId: null, action: null, message: "" });
  };

  const cancelAction = () => {
    setModal({ show: false, userId: null, action: null, message: "" });
  };

  const initializeUsers = () => {
    axiosClient.get("/users").then((res) => {
      setUsers(res.data.data);
    });
  };

  useEffect(initializeUsers, []);

  return (
    <div className="relative bottom-0 left-36 right-0 top-0">
      <div className="mt-8 grid grid-cols-2 gap-8">
        {users.map((user) => (
          <div
            key={user.id}
            className="mb-4 transform cursor-pointer rounded-lg bg-white p-6 shadow-md transition duration-300 hover:scale-105"
          >
            <div className="my-2 flex items-center gap-3">
              <Avatar
                src={`${process.env.SERVER_PUBLIC}/${user.user_image.pfp_name}`}
                alt={user.firstname}
                className="h-12 w-12 rounded-full"
              />
              <div className="flex flex-col">
                <h2 className="text-lg font-bold">{`${user.firstname} ${user.lastname}`}</h2>
                <p
                  className="overflow-hidden text-sm text-gray-600"
                  style={{ textOverflow: "ellipsis", maxHeight: "3em" }}
                >
                  @{user.username}
                </p>
              </div>
            </div>

            <div className="my-5 h-[2px] w-full bg-slate-300"></div>

            <p className="my-3 font-body text-base text-gray-500">
              Status:{" "}
              {user.account_status === "ACTIVE" ? (
                <span className="font-bold text-green-500">ACTIVE</span>
              ) : (
                <span className="font-bold text-red-500">BLOCKED</span>
              )}
            </p>

            <div className="mb-4 flex flex-col justify-center gap-2">
              <div className="flex flex-col items-center justify-center">
                <p className="font-bold text-slate-700">Posts Reported:</p>
                <p>{user.totalPostsReported ?? 0}</p>
              </div>
              <div className="flex flex-col items-center justify-center">
                <p className="font-bold text-slate-700">Comments Reported:</p>
                <p>{user.totalCommentsReported ?? 0}</p>
              </div>
            </div>

            <div className="mb-7 flex flex-col gap-1">
              <p className="text-xs text-gray-500">Email: {user.email}</p>
              <p className="text-xs text-gray-500">
                Date Created:{" "}
                {dateTool.format(new Date(user.date_joined), "MMM DD, YYYY")}
                posts
              </p>
            </div>

            <div className="mt3-4 flex justify-center space-x-4">
              <button
                onClick={() => handleBlock(user)}
                className="rounded bg-primary-400 px-4 py-2 text-white hover:bg-primary-500"
              >
                {user.account_status === "BLOCKED" ? "Unblock" : "Block"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="w-11/12 max-w-md rounded bg-white p-6 shadow-lg">
            <p className="mb-4">{modal.message}</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={confirmAction}
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
              >
                OK
              </button>
              <button
                onClick={cancelAction}
                className="rounded bg-gray-300 px-4 py-2 text-black hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface User {
  id: string;
  firstname: string;
  midlename: string;
  lastname: string;
  account_status: "ACTIVE" | "BLOCKED" | "ARCHIVED";
  email: string;
  username: string;
  date_joined: string;
  user_image: {
    pfp_name: string;
    cover_name: string;
  };
  totalPostsReported: string;
  totalCommentsReported: string;
}

interface ModalProps {
  show: boolean;
  userId: null | string;
  action: "Unblock" | "Block" | null;
  message: string;
}

export default AdminUser;
