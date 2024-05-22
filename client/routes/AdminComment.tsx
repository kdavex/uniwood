import React, { useState } from 'react';
import { Modal, Box, Button, Menu, MenuItem } from '@mui/material';

const AdminComment = () => {
  const comms = {
    comms1: { id: 1, problem: "Spamming", description: "spamming comments", username: "johndoe123", status: "unresolved", dateCreated: "2024-05-18" },
    comms2: { id: 2, problem: "Offensive Language", description: "using offensive language", username: "janedoe456", status: "resolved", dateCreated: "2024-05-17" },
    comms3: { id: 3, problem: "Harassment", description: "harassing other users", username: "billybob789", status: "unresolved", dateCreated: "2024-05-16" },
    comms4: { id: 4, problem: "Hate Speech", description: "posting hate speech", username: "susansmith321", status: "in review", dateCreated: "2024-05-15" },
    comms5: { id: 5, problem: "Fake News", description: "spreading fake news", username: "michaeljohnson123", status: "unresolved", dateCreated: "2024-05-14" },
    comms6: { id: 6, problem: "Phishing", description: "attempting phishing", username: "emilywatson456", status: "resolved", dateCreated: "2024-05-13" },
    comms7: { id: 7, problem: "Impersonation", description: "impersonating other users", username: "davidmiller789", status: "unresolved", dateCreated: "2024-05-12" },
    comms8: { id: 8, problem: "NSFW Content", description: "posting NSFW content", username: "laurajones321", status: "in review", dateCreated: "2024-05-11" },
    comms9: { id: 9, problem: "Spam Links", description: "posting spam links", username: "chrisbaker123", status: "resolved", dateCreated: "2024-05-10" },
  };

  const [open, setOpen] = useState(false);
  const [selectedComm, setSelectedComm] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = (comm) => {
    setSelectedComm(comm);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedComm(null);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusUpdate = (status) => {
    if (status !== selectedComm.status) {
      // Update status logic here
      console.log(`Status updated to: ${status}`);
      setSelectedComm(prevComm => ({
        ...prevComm,
        status: status
      }));
      handleMenuClose();
    }
  };

  return (
    <div className="relative top-0 left-36 right-0 bottom-10">
      <div className="mt-8 mb-4 grid grid-cols-3 gap-4">
        {Object.values(comms).map(comm => (
          <div
            key={comm.id}
            className="bg-white p-6 rounded-lg shadow-md mb-4 cursor-pointer transition duration-300 transform hover:scale-105"
            onClick={() => handleOpen(comm)}
          >
            <h2 className="text-lg font-bold mb-2">Report ID: {comm.id}</h2>
            <p className="text-sm text-gray-600 mb-2"><strong>Problem:</strong> {comm.problem}</p>
            <p className="text-sm text-gray-600 mb-2"><strong>Description:</strong> {comm.description}</p>
            <p className="text-sm text-gray-600 mb-2"><strong>Username:</strong> {comm.username}</p>
            <p className={`text-sm mb-2 ${comm.status === 'unresolved' ? 'text-red-600' : comm.status === 'in review' ? 'text-blue-600' : 'text-green-600'}`}>
              <strong>Status:</strong> {comm.status}
            </p>
            <p className="text-sm text-gray-600 mb-2"><strong>Date Created:</strong> {comm.dateCreated}</p>
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
          {selectedComm && (
            <>
              <h2 id="modal-title" className="text-lg font-bold mb-2">Report ID: {selectedComm.id}</h2>
              <p className="text-sm text-gray-600 mb-2"><strong>Problem:</strong> {selectedComm.problem}</p>
              <p className="text-sm text-gray-600 mb-2"><strong>Description:</strong> {selectedComm.description}</p>
              <p className="text-sm text-gray-600 mb-2"><strong>Username:</strong> {selectedComm.username}</p>
              <p className={`text-sm mb-2 ${selectedComm.status === 'unresolved' ? 'text-red-600' : selectedComm.status === 'in review' ? 'text-blue-600' : 'text-green-600'}`}>
                <strong>Status:</strong> {selectedComm.status}
              </p>
              <p className="text-sm text-gray-600 mb-2"><strong>Date Created:</strong> {selectedComm.dateCreated}</p>
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

export default AdminComment;
