import React, { useContext, useEffect, useState } from "react";
import {
  Modal,
  Box,
  Button,
  Menu,
  MenuItem,
  Tooltip,
  IconButton,
} from "@mui/material";
import axiosClient from "../utils/axios";
import dateUtil from "date-and-time";
import { constantToCapitalize } from "../utils/stringFormatters";
import { AlertContext } from "../providers/AlertProvider";
import { CloseRounded } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function AdminPost() {
  const navigate = useNavigate();
  const [postReports, setPostReports] = useState<Report[]>([]);
  const { setAlert } = useContext(AlertContext)!;

  const [open, setOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Report | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = (post: Report) => {
    setSelectedPost(post);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPost(null);
  };

  const handlePostUnarchive = () => {
    axiosClient
      .patch(`/comments/unarchive/${selectedPost?.reportId}`)
      .then(() => {
        setAlert({
          visible: true,
          message: "Comment has been unarchived",
          severity: "success",
        });
        let postTarget = postReports.find(
          (post) => post.reportId == selectedPost?.reportId,
        );
        setSelectedPost({ ...selectedPost!, postStatus: "ACTIVE" });
        postTarget!.postStatus = "ACTIVE";
        setPostReports((prev) =>
          prev.map((post) =>
            post.reportId === selectedPost?.reportId ? postTarget! : post,
          ),
        );
        setOpen(false);
      })
      .catch(() => {
        setAlert({
          visible: true,
          message: "Comment could not be unarchived",
          severity: "error",
        });
      });
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusUpdate = (
    status: "IN_REVIEW" | "RESOLVE" | "UNRESOLVED",
  ) => {
    if (status === "RESOLVE") {
      axiosClient
        .patch("/reports/post", {
          reportId: selectedPost?.reportId,
          status: "RESOLVED",
        })
        .then(() => {
          setAlert({
            visible: true,
            message: "Report has been resolved",
            severity: "success",
          });
          handleMenuClose();
          let postTarget = postReports.find(
            (post) => post.reportId == selectedPost?.reportId,
          );
          setSelectedPost({ ...selectedPost!, reportStatus: "RESOLVED" });
          postTarget!.reportStatus = "RESOLVED";
          setPostReports((prev) =>
            prev.map((post) =>
              post.reportId === selectedPost?.reportId ? postTarget! : post,
            ),
          );
          setOpen(false);
        });
    } else if (status === "IN_REVIEW") {
      axiosClient
        .patch("/reports/post", {
          reportId: selectedPost?.reportId,
          status: "IN_REVIEW",
        })
        .then(() => {
          setAlert({
            visible: true,
            message: "Report has been marked for review",
            severity: "success",
          });
          let postTarget = postReports.find(
            (post) => post.reportId == selectedPost?.reportId,
          );

          postTarget!.reportStatus = "IN_REVIEW";
          setPostReports((prev) =>
            prev.map((post) =>
              post.reportId === selectedPost?.reportId ? postTarget! : post,
            ),
          );
          setSelectedPost({ ...selectedPost!, reportStatus: "IN_REVIEW" });
          setOpen(false);
        });
    } else if (status === "UNRESOLVED") {
      axiosClient
        .patch("/reports/post", {
          reportId: selectedPost?.reportId,
          status: "UNRESOLVED",
        })
        .then(() => {
          setAlert({
            visible: true,
            message: "Report has been marked as unresolved",
            severity: "success",
          });
          let postTarget = postReports.find(
            (post) => post.reportId == selectedPost?.reportId,
          );

          postTarget!.reportStatus = "UNRESOLVED";
          setPostReports((prev) =>
            prev.map((post) =>
              post.reportId === selectedPost?.reportId ? postTarget! : post,
            ),
          );
          setSelectedPost({ ...selectedPost!, reportStatus: "UNRESOLVED" });
          setOpen(false);
        });
    }
    handleMenuClose();
  };

  const handlePostView = () => {
    navigate(`/console/post/${selectedPost?.postId}`);
  };

  const handlePostArchive = () => {
    axiosClient
      .delete(`/posts/${selectedPost?.postId}`)
      .then(() => {
        setAlert({
          visible: true,
          message: "Post has been archived",
          severity: "success",
        });
        let postTarget = postReports.find(
          (post) => post.reportId == selectedPost?.reportId,
        );
        setSelectedPost({ ...selectedPost!, postStatus: "ARCHIVED" });
        postTarget!.postStatus = "ARCHIVED";
        setPostReports((prev) =>
          prev.map((post) =>
            post.reportId === selectedPost?.reportId ? postTarget! : post,
          ),
        );
        setOpen(false);
      })
      .catch(() => {
        setAlert({
          visible: true,
          message: "Post could not be archived",
          severity: "error",
        });
      });
  };

  const initializePostReports = () => {
    axiosClient.get("/reports/post").then((response) => {
      setPostReports(response.data.data);
    });
  };

  const handleReportDelete = () => {
    axiosClient.delete(`/reports/${selectedPost?.reportId}`).then(() => {
      setAlert({
        visible: true,
        message: "Report has been deleted",
        severity: "success",
      });
      setPostReports((prev) =>
        prev.filter((post) => post.reportId !== selectedPost?.reportId),
      );
      handleClose();
    });
  };

  useEffect(initializePostReports, []);

  return (
    <div className="relative bottom-10 left-36 right-0 top-0">
      <div className="mb-4 mt-8 grid grid-cols-3 gap-4">
        {postReports.map((post) => (
          <div
            key={post.reportId}
            className="mb-4 transform cursor-pointer rounded-lg bg-white p-6 shadow-md transition duration-300 hover:scale-105"
            onClick={() => handleOpen(post)}
          >
            <h2 className="mb-2 text-base font-bold">
              Report ID: {post.reportId.slice(5, 10)}{" "}
              {post.reportId.slice(10, 15)}
            </h2>
            <p
              className={`mb-2 text-sm ${post.reportStatus === "UNRESOLVED" ? "text-red-600" : post.reportStatus === "IN_REVIEW" ? "text-blue-600" : "text-green-600"}`}
            >
              <strong>Report Status:</strong> <p>{post.reportStatus}</p>
            </p>
            <p
              className={`mb-5 text-sm ${post.postStatus === "ARCHIVED" ? "text-red-600" : "text-green-600"}`}
            >
              <strong>Post Status:</strong> <p>{post.postStatus}</p>
            </p>
            <p className="mb-2 text-sm text-gray-600">
              <strong>Reason:</strong>
              <span className="">{constantToCapitalize(post.problem)}</span>
            </p>
            <p className="mb-2 text-sm text-gray-600">
              <strong>Description:</strong> {post.description}
            </p>
            <p className="mb-2 text-sm text-gray-600">
              <strong>Reported By:</strong> {post.reportedByFullname}
            </p>

            <p className="mb-2 text-sm text-gray-600">
              <strong>Reperted at:</strong>{" "}
              {dateUtil.format(new Date(post.createdAt), "YYYY-MM-DD")}
            </p>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box className=" relative mx-auto my-52 max-w-xl rounded-lg bg-white p-6 shadow-md">
          <Tooltip title="Close" arrow>
            <IconButton
              className="absolute right-3 top-3"
              onClick={handleClose}
            >
              <CloseRounded className="text-gray-400" />
            </IconButton>
          </Tooltip>
          {selectedPost && (
            <>
              <h2 id="modal-title" className="mb-2 text-lg font-bold">
                Report ID: {selectedPost.reportId.slice(5, 10)}
                {selectedPost.reportId.slice(10, 15)}
              </h2>
              <p
                className={`mb-2 text-sm ${selectedPost.reportStatus === "UNRESOLVED" ? "text-red-600" : selectedPost.reportStatus === "IN_REVIEW" ? "text-blue-600" : "text-green-600"}`}
              >
                <strong>Report Status:</strong>{" "}
                <p>{selectedPost.reportStatus}</p>
              </p>
              <p
                className={`mb-5 text-sm ${selectedPost.postStatus === "ARCHIVED" ? "text-red-600" : "text-green-600"}`}
              >
                <strong>Post Status:</strong> <p>{selectedPost.postStatus}</p>
              </p>
              <p className="mb-2 text-sm text-gray-600">
                <strong>Reason:</strong>{" "}
                {constantToCapitalize(selectedPost.problem)}
              </p>
              <p className="mb-2 text-sm text-gray-600">
                <strong>Description:</strong> {selectedPost.description}
              </p>
              <p className="mb-2 text-sm text-gray-600">
                <strong>Reported by:</strong> {selectedPost.reportedByFullname}
              </p>

              <p className="mb-2 text-sm text-gray-600">
                <strong>Date reported:</strong>{" "}
                {dateUtil.format(
                  new Date(selectedPost.createdAt),
                  "YYYY-MM-DD",
                )}
              </p>
              <div className="mt-4 flex justify-center gap-6">
                {/* <Button
                  variant="contained"
                  className="bg-gray-500 font-bold text-white"
                  onClick={handleClose}
                >
                  Close
                </Button> */}
                <Button
                  variant="contained"
                  className="bg-blue-400 font-bold text-white"
                  onClick={handlePostView}
                >
                  View
                </Button>
                {selectedPost.postStatus === "ACTIVE" ? (
                  <Button
                    variant="contained"
                    onClick={handlePostArchive}
                    className="bg-red-400 font-bold text-white"
                  >
                    Archive
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handlePostUnarchive}
                    className="bg-green-400 font-bold text-white"
                  >
                    Unarchive
                  </Button>
                )}

                <Button
                  variant="contained"
                  className="bg-primary-400 font-bold text-white"
                  onClick={handleMenuClick}
                >
                  Status Update
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={() => handleStatusUpdate("RESOLVE")}>
                    Resolved
                  </MenuItem>
                  <MenuItem onClick={() => handleStatusUpdate("IN_REVIEW")}>
                    In Review
                  </MenuItem>
                  <MenuItem onClick={() => handleStatusUpdate("UNRESOLVED")}>
                    Unresolved
                  </MenuItem>
                </Menu>
              </div>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
}

interface Report {
  reportId: string;
  reportedById: string;
  reportedByFullname: string;
  postAuthorId: string;
  postAuthorFullname: string;
  postId: string;
  type: "POST";
  problem: ReportProblem;
  description: string;
  reportStatus: "RESOLVED" | "UNRESOLVED" | "IN_REVIEW";
  postStatus: "ACTIVE" | "ARCHIVED";
  createdAt: string;
}

type ReportProblem =
  | "INAPPRIOPRIATE_CONTENT"
  | "FALSE_INFORMATION"
  | "HARASSMENT"
  | "VIOLENCE_OR_THREATS"
  | "COPYRIGHT_INFIRNGEMENT"
  | "PRIVACY_VIOLATION"
  | "SCAM"
  | "IMPERSONATION"
  | "HATESPEECH";
