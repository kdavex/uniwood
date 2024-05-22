import React, { useState } from 'react';
import { Modal, Box, Button, Menu, MenuItem } from '@mui/material';

const AdminPost = () => {
  const posts = {
    post1: { id: 1, problem: "Inappropriate Content", description: "Contains inappropriate or explicit material", username: "John Smith", status: "unresolved", dateCreated: "2024-05-18" },
    post2: { id: 2, problem: "False Information", description: "Spreading false or misleading information", username: "Alice Johnson", status: "resolved", dateCreated: "2024-05-17" },
    post3: { id: 3, problem: "Harassment", description: "Targeted harassment or bullying", username: "David Brown", status: "unresolved", dateCreated: "2024-05-16" },
    post4: { id: 4, problem: "Violence or Threats", description: "Contains violence or threats of violence", username: "Emily Davis", status: "in review", dateCreated: "2024-05-15" },
    post5: { id: 5, problem: "Copyright Infringement", description: "Uses copyrighted material without permission", username: "Michael Wilson", status: "unresolved", dateCreated: "2024-05-14" },
    post6: { id: 6, problem: "Privacy Violation", description: "Shares private or sensitive information", username: "Sophia Martinez", status: "resolved", dateCreated: "2024-05-13" },
    post7: { id: 7, problem: "Spam or Scam", description: "Contains spam or is a scam", username: "Olivia Miller", status: "unresolved", dateCreated: "2024-05-12" },
    post8: { id: 8, problem: "Impersonation", description: "Impersonating another individual or entity", username: "William Taylor", status: "in review", dateCreated: "2024-05-11" },
    post9: { id: 9, problem: "Hate Speech", description: "Contains hate speech or promotes discrimination", username: "Ethan Anderson", status: "resolved", dateCreated: "2024-05-10" },
};

  const [open, setOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = (post) => {
    setSelectedPost(post);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPost(null);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusUpdate = (status) => {
    if (status !== selectedPost.status) {
      // Update status logic here
      console.log(`Status updated to: ${status}`);
      setSelectedPost(prevPost => ({
        ...prevPost,
        status: status
      }));
      handleMenuClose();
    }
  };

  return (
    <div className="relative top-0 left-36 right-0 bottom-10">
      <div className="mt-8 mb-4 grid grid-cols-3 gap-4">
        {Object.values(posts).map(post => (
          <div
            key={post.id}
            className="bg-white p-6 rounded-lg shadow-md mb-4 cursor-pointer transition duration-300 transform hover:scale-105"
            onClick={() => handleOpen(post)}
          >
            <h2 className="text-lg font-bold mb-2">Report ID: {post.id}</h2>
            <p className="text-sm text-gray-600 mb-2"><strong>Problem:</strong> {post.problem}</p>
            <p className="text-sm text-gray-600 mb-2"><strong>Description:</strong> {post.description}</p>
            <p className="text-sm text-gray-600 mb-2"><strong>Username:</strong> {post.username}</p>
            <p className={`text-sm mb-2 ${post.status === 'unresolved' ? 'text-red-600' : post.status === 'in review' ? 'text-blue-600' : 'text-green-600'}`}>
              <strong>Status:</strong> {post.status}
            </p>
            <p className="text-sm text-gray-600 mb-2"><strong>Date Created:</strong> {post.dateCreated}</p>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto my-52">
          {selectedPost && (
            <>
              <h2 id="modal-title" className="text-lg font-bold mb-2">Report ID: {selectedPost.id}</h2>
              <p className="text-sm text-gray-600 mb-2"><strong>Problem:</strong> {selectedPost.problem}</p>
              <p className="text-sm text-gray-600 mb-2"><strong>Description:</strong> {selectedPost.description}</p>
              <p className="text-sm text-gray-600 mb-2"><strong>Username:</strong> {selectedPost.username}</p>
              <p className={`text-sm mb-2 ${selectedPost.status === 'unresolved' ? 'text-red-600' : selectedPost.status === 'in review' ? 'text-blue-600' : 'text-green-600'}`}>
                <strong>Status:</strong> {selectedPost.status}
              </p>
              <p className="text-sm text-gray-600 mb-2"><strong>Date Created:</strong> {selectedPost.dateCreated}</p>
              <div className="flex justify-between mt-4">
                <Button variant="contained" color="secondary" onClick={handleClose}>Close</Button>
                <Button variant="contained" color="error">View</Button>
                <Button variant="contained" color="error">Remove</Button>
                <Button variant="contained" color="error">Delete</Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleMenuClick}
                >
                  Status Update
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={() => handleStatusUpdate('resolved')}>Resolved</MenuItem>
                  <MenuItem onClick={() => handleStatusUpdate('in review')}>In Review</MenuItem>
                  <MenuItem onClick={() => handleStatusUpdate('unresolved')}>Unresolved</MenuItem>
                </Menu>
              </div>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
}

export default AdminPost;
