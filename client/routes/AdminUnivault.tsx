import React, { useState, useEffect } from "react";
import { IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

export default function UniVault() {
  const [activeTab, setActiveTab] = useState("Articles");

  const articles = {
    links: [
      {
        id: 1,
        title: "The Artisans from Bataan Peninsula",
        description:
          "Discover the skilled artisans and their craftsmanship in Bataan Peninsula. Explore their traditional techniques and the cultural heritage they preserve.",
        author: "Maritess Garcia Reyes",
        link: "https://www.tatlerasia.com/homes/architecture-design/the-artisans-from-bataan-peninsula",
      },
      {
        id: 2,
        title:
          "Staying in Heritage: Revisiting the Las Casas Filipinas de Acuzar in Bagac, Bataan",
        description:
          "Experience the charm and history of Las Casas Filipinas de Acuzar in Bagac, Bataan. Immerse yourself in the rich cultural tapestry of this heritage site.",
        author: "Reuben Cañete",
        link: "https://bluprint-onemega.com/staying-in-heritage-revisiting-the-las-casas-filipinas-de-acuzar-in-bagac-bataan/",
      },
      {
        id: 3,
        title: "Exploring Real Estate Opportunities in Bataan",
        description:
          "Discover the potential of Bataans real estate market. Learn about investment opportunities and the growing economy of this vibrant province.",
        author: "Philippine Real Estate",
        link: "https://philippine-real-estate.com/blog/bataan/",
      },
      {
        id: 4,
        title: "Community Initiatives in Bataan: The Guilds BPSU",
        description:
          "Learn about the community initiatives led by The Guilds BPSU in Bataan. Discover their projects aimed at fostering education and sustainable development.",
        author: "Kesia Jamel Corton",
        link: "https://www.facebook.com/theguildsbpsu/posts/pfbid026FMWchAfeJFYNeMw8TzZDDy5bXMdUwBdXMZGL7UwRdanJPVwHpqF2Nf8JhQyhD8Xl",
      },
      {
        id: 5,
        title: "Empowering Women through Wood Mosaic Making in Bataan",
        description:
          "Explore the empowering journey of women in Bataan through wood mosaic making. Learn about their skills, creativity, and contribution to the community.",
        author: "Loi Balbaloza",
        link: "https://1bataan.com/wood-mosaic-making-an-epitome-of-women-empowerment/",
      },
      // Add more articles as needed
    ],
  };

  const trainings = {
    links: [
      {
        id: 1,
        title: "Woodworking Essentials: A Guide from Wood Academy PH",
        description:
          "Master the fundamentals of woodworking with this comprehensive guide from Wood Academy PH. Learn essential techniques and tips for woodworking enthusiasts.",
        link: "https://www.facebook.com/woodacademyPH",
      },
      {
        id: 2,
        title: "Carpentry Training Program in Pampanga by TESDA",
        description:
          "Join the carpentry training program offered by TESDA in Pampanga. Develop your carpentry skills and gain valuable knowledge for a successful career in woodworking.",
        link: "https://tesda.gov.ph/Tvi/Result?SearchCourse=Carpentry&SearchIns=&SearchLoc=pampanga",
      },
      // Add more trainings as needed
    ],
  };

  const content = activeTab === "Articles" ? articles.links : trainings.links;

  const [anchorEl, setAnchorEl] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const handleAdd = () => {
    setAddModalOpen(true);
  };
  
  const handleCloseAddModal = () => {
    setAddModalOpen(false);
  };

  const handleClick = (event, item) => {
    setAnchorEl(event.currentTarget);
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

  return (
    <div className="relative top-0 left-36 right-0 bottom-20">
      <div className="px-4 custom:w-full sm:w-11/12 text-4xl custom2:text-base">
        <div className="relative mt-8 mb-8 custom2:mb-4 flex items-center justify-center">
          <h1 className="text-6xl custom2:text-3xl font-bold absolute left-1/2 transform -translate-x-1/2">
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
            className={`mb-4 custom2:rounded-md rounded-lg px-10 custom2:py-2 py-6 transition duration-300 focus:outline-none md:mb-2 ${
              activeTab === 'Articles' ? 'bg-prima text-white hover:bg-orange-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
            onClick={() => setActiveTab('Articles')}
          >
            Articles
          </button>
          <button
            className={`mb-4 custom2:rounded-md rounded-lg px-10 custom2:py-2 py-6 transition duration-300 focus:outline-none md:mb-2 ${
              activeTab === 'Trainings' ? 'bg-prima text-white hover:bg-orange-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
            onClick={() => setActiveTab('Trainings')}
          >
            Trainings
          </button>
        </div>
        <div className="mt-8">
          {content.map((item) => (
            <div key={item.id} className="relative mb-10 custom2:mb-4">
              <MoreHorizIcon
                className="absolute top-2 right-3 text-4xl text-gray-500 cursor-pointer"
                onClick={(e) => handleClick(e, item)}
              />
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem className=" font-semibold py-3" onClick={handleEdit}>Edit</MenuItem>
                <MenuItem className=" font-semibold py-3" onClick={handleDelete}>Delete</MenuItem>
              </Menu>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div
                  className={`mb-10 custom2:mb-4 custom2:p-6 p-10 cursor-pointer rounded-lg bg-white shadow-md transition duration-300 hover:shadow-lg`}
                >
                  <h2 className="custom2:mb-2 mb-5 text-4xl custom2:text-lg font-bold">{item.title}</h2>
                  <p
                    className="mb-4 overflow-hidden text-2xl custom2:text-sm text-gray-600"
                    style={{ textOverflow: 'ellipsis', maxHeight: '3em' }}
                  >
                    {item.description}
                  </p>
                  {item.author && (
                    <p className="text-xl custom2:text-xs text-gray-500">Author: {item.author}</p>
                  )}
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog className="" open={editModalOpen} onClose={handleCloseEditModal}>
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Title"
            type="text"
            fullWidth
            defaultValue={currentItem?.title}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            defaultValue={currentItem?.description}
          />
          {currentItem?.author && (
            <TextField
              margin="dense"
              label="Author"
              type="text"
              fullWidth
              defaultValue={currentItem?.author}
            />
          )}
          <TextField
            margin="dense"
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
          <Button onClick={handleCloseEditModal} color="primary">
            Save
          </Button>
        </DialogActions>
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
          <Button onClick={handleCloseDeleteModal} color="primary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addModalOpen} onClose={handleCloseAddModal}>
        <DialogTitle>Add New {activeTab === 'Articles' ? 'Article' : 'Training'}</DialogTitle>
        <DialogContent>
            <TextField
            margin="dense"
            label="Title"
            type="text"
            fullWidth
            />
            <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            />
            {activeTab === 'Articles' && (
            <TextField
                margin="dense"
                label="Author"
                type="text"
                fullWidth
            />
            )}
            <TextField
            margin="dense"
            label="Link"
            type="url"
            fullWidth
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={handleCloseAddModal} color="primary">
            Cancel
            </Button>
            <Button onClick={handleCloseAddModal} color="primary">
            Add
            </Button>
        </DialogActions>
        </Dialog>
    </div>
  );
};
