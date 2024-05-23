import React, { useState, useEffect, useContext, act } from "react";
import { IconButton, ListItemSecondaryAction } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import axiosClient from "../utils/axios";
import { AlertContext } from "../providers/AlertProvider";

export default function UniVault() {
  const [activeTab, setActiveTab] = useState<"Articles" | "Trainings">(
    "Articles",
  );
  const [articles, setArticles] = useState<Article[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);

  const content = (activeTab === "Articles" ? articles : trainings) as
    | Training[]
    | Article[];

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Article | Training | null>(
    null,
  );
  const [addModalOpen, setAddModalOpen] = useState(false);
  const { setAlert } = useContext(AlertContext)!;

  const handleAdd = () => {
    setAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setAddModalOpen(false);
  };

  const handleClick = (
    event: React.MouseEvent<SVGSVGElement, MouseEvent>,
    item: Training | Article,
  ) => {
    setAnchorEl(event.currentTarget as unknown as HTMLElement);
    setCurrentItem(item);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setEditModalOpen(true);
    handleClose();
  };

  const handleDelete = () => {
    setDeleteModalOpen(true);
    handleClose();
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const initializeArticlesAndTrainings = () => {
    axiosClient.get("/articles").then((res) => {
      setArticles(res.data.data);
    });

    axiosClient.get("/trainings").then((res) => {
      setTrainings(res.data.data);
    });
  };

  const handleCreateTrainingOrArticle = (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    // create training
    if (activeTab === "Trainings") {
      const form = new FormData(e.currentTarget);
      const training = {
        title: form.get("title") as string,
        description: form.get("description") as string,
        link: form.get("link") as string,
      };
      axiosClient
        .post("/trainings", training)
        .then((res) => {
          setTrainings([res.data.data, ...trainings]);
          handleCloseAddModal();
          setAlert({
            visible: true,
            message: "Training created successfully",
            severity: "success",
          });
        })
        .catch((err) => {
          setAlert({
            visible: true,
            message: "An error occurred whie creating the training ",
            severity: "error",
          });
        });
    }

    if (activeTab === "Articles") {
      const form = new FormData(e.currentTarget);
      const article = {
        title: form.get("title") as string,
        description: form.get("description") as string,
        author: form.get("author") as string,
        link: form.get("link") as string,
      };

      axiosClient
        .post("/articles", article)
        .then((res) => {
          setArticles([res.data.data, ...articles]);
          handleCloseAddModal();
          setAlert({
            visible: true,
            message: "Article created successfully",
            severity: "success",
          });
        })
        .catch((err) => {
          setAlert({
            visible: true,
            message: "An error occurred while creating the article",
            severity: "error",
          });
        });
    }
  };

  const handleUpdateTrainingOrArticle = (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    // update training
    if (activeTab === "Trainings") {
      const form = new FormData(e.currentTarget);
      const training = {
        trainingId: currentItem?.id,
        title: form.get("title") as string,
        description: form.get("description") as string,
        link: form.get("link") as string,
      };
      axiosClient
        .put(`/trainings`, training)
        .then((res) => {
          setTrainings(
            trainings.map((training) =>
              training.id === currentItem?.id ? res.data.data : training,
            ),
          );
          handleCloseEditModal();
          setAlert({
            visible: true,
            message: "Training updated successfully",
            severity: "success",
          });
        })
        .catch(() => {
          setAlert({
            visible: true,
            message: "An error occurred while updating the training",
            severity: "error",
          });
        });
    }

    // update article
    if (activeTab === "Articles") {
      const form = new FormData(e.currentTarget);
      const article = {
        articleId: currentItem?.id,
        title: form.get("title") as string,
        description: form.get("description") as string,
        link: form.get("link") as string,
        author: form.get("author") as string,
      };

      axiosClient
        .put(`/articles`, article)
        .then((res) => {
          setArticles(
            articles.map((article) =>
              article.id === currentItem?.id ? res.data.data : article,
            ),
          );
          handleCloseEditModal();
          setAlert({
            visible: true,
            message: "Article updated successfully",
            severity: "success",
          });
        })
        .catch(() => {
          setAlert({
            visible: true,
            message: "An error occurred while updating the article",
            severity: "error",
          });
        });
    }
  };

  const handleDeleteTrainingOrArticle = (id: string | undefined) => {
    if (!id) return;

    // delete training
    if (activeTab === "Trainings") {
      axiosClient
        .delete(`/trainings/${id}`)
        .then(() => {
          setTrainings(trainings.filter((training) => training.id !== id));
          handleCloseDeleteModal();
          setAlert({
            visible: true,
            message: "Training deleted successfully",
            severity: "success",
          });
        })
        .catch(() => {
          setAlert({
            visible: true,
            message: "An error occurred while deleting the training",
            severity: "error",
          });
        });
    }

    // delete article
    if (activeTab === "Articles") {
      axiosClient
        .delete(`/articles/${id}`)
        .then(() => {
          setArticles(articles.filter((article) => article.id !== id));
          handleCloseDeleteModal();
          setAlert({
            visible: true,
            message: "Article deleted successfully",
            severity: "success",
          });
        })
        .catch(() => {
          setAlert({
            visible: true,
            message: "An error occurred while deleting the article",
            severity: "error",
          });
        });
    }
  };

  useEffect(initializeArticlesAndTrainings, []);

  return (
    <div className="relative bottom-20 left-36 right-0 top-0">
      <div className="px-4 text-4xl sm:w-11/12 custom2:text-base custom:w-full">
        <div className="relative mb-8 mt-8 flex items-center justify-center custom2:mb-4">
          <h1 className="absolute left-1/2 -translate-x-1/2 transform text-6xl font-bold custom2:text-3xl">
            UniVault
          </h1>
          <div className="ml-auto">
            <IconButton color="primary" aria-label="add" onClick={handleAdd}>
              <AddIcon className="text-6xl custom2:text-3xl" />
            </IconButton>
          </div>
        </div>
        <div className="flex flex-row justify-center gap-8">
          <button
            className={`mb-4 rounded-lg px-10 py-6 transition duration-300 focus:outline-none custom2:rounded-md custom2:py-2 md:mb-2 ${
              activeTab === "Articles"
                ? "bg-prima text-white hover:bg-orange-600"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
            onClick={() => setActiveTab("Articles")}
          >
            Articles
          </button>
          <button
            className={`mb-4 rounded-lg px-10 py-6 transition duration-300 focus:outline-none custom2:rounded-md custom2:py-2 md:mb-2 ${
              activeTab === "Trainings"
                ? "bg-prima text-white hover:bg-orange-600"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
            onClick={() => setActiveTab("Trainings")}
          >
            Trainings
          </button>
        </div>
        <div className="mt-8">
          {content.map((item) => (
            <div key={item.id} className="relative mb-10 custom2:mb-4">
              <MoreHorizIcon
                className="absolute right-3 top-2 cursor-pointer text-4xl text-gray-500"
                onClick={(e) => handleClick(e, item)}
              />
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem className=" py-3 font-semibold" onClick={handleEdit}>
                  Edit
                </MenuItem>
                <MenuItem
                  className=" py-3 font-semibold"
                  onClick={handleDelete}
                >
                  Delete
                </MenuItem>
              </Menu>
              <a href={item.link} target="_blank" rel="noopener noreferrer">
                <div
                  className={`mb-10 cursor-pointer rounded-lg bg-white p-10 shadow-md transition duration-300 hover:shadow-lg custom2:mb-4 custom2:p-6`}
                >
                  <h2 className="mb-5 text-4xl font-bold custom2:mb-2 custom2:text-lg">
                    {item.title}
                  </h2>
                  <p
                    className="mb-4 overflow-hidden text-2xl text-gray-600 custom2:text-sm"
                    style={{ textOverflow: "ellipsis", maxHeight: "3em" }}
                  >
                    {item.description}
                  </p>

                  {item.author && (
                    <p className="text-xl text-gray-500 custom2:text-xs">
                      Author: {item.author}
                    </p>
                  )}
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog className="" open={editModalOpen} onClose={handleCloseEditModal}>
        <form onSubmit={handleUpdateTrainingOrArticle}>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              name="title"
              label="Title"
              type="text"
              fullWidth
              defaultValue={currentItem?.title}
            />
            <TextField
              margin="dense"
              name="description"
              label="Description"
              type="text"
              fullWidth
              defaultValue={currentItem?.description}
            />
            {currentItem?.author && (
              <TextField
                margin="dense"
                name="author"
                label="Author"
                type="text"
                fullWidth
                defaultValue={currentItem?.author}
              />
            )}
            <TextField
              margin="dense"
              name="link"
              label="Link"
              type="url"
              fullWidth
              defaultValue={currentItem?.link}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditModal} color="primary">
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleCloseEditModal}
              color="primary"
            >
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={deleteModalOpen} onClose={handleCloseDeleteModal}>
        <DialogTitle>Delete Item</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete this item?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteModal} color="primary">
            Cancel
          </Button>
          <Button
            onClick={(e) => handleDeleteTrainingOrArticle(currentItem?.id)}
            color="primary"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addModalOpen} onClose={handleCloseAddModal}>
        <form onSubmit={handleCreateTrainingOrArticle}>
          <DialogTitle>
            Add New {activeTab === "Articles" ? "Article" : "Trainings"}
          </DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Title"
              type="text"
              name="title"
              fullWidth
            />
            <TextField
              margin="dense"
              name="description"
              label="Description"
              type="text"
              fullWidth
            />
            {activeTab === "Articles" && (
              <TextField
                margin="dense"
                name="author"
                label="Author"
                type="text"
                fullWidth
              />
            )}
            <TextField
              margin="dense"
              label="Link"
              name="link"
              type="url"
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddModal} color="primary">
              Cancel
            </Button>
            <Button type="submit" color="primary">
              Add
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}

interface Article {
  id: string;
  title: string;
  description: string;
  author: string;
  link: string;
}

interface Training {
  id: string;
  title: string;
  description: string;
  link: string;
  author?: string;
}
