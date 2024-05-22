import React, { useState } from 'react';
import Profile from '../assets/images/profile-round-1342-svgrepo-com.svg';

const AdminUser = () => {
  const [blockedUsers, setBlockedUsers] = useState({});
  const [modal, setModal] = useState({ show: false, userId: null, action: '', message: '' });

  const users = {
    user1: { id: 1, profilePic: Profile, fullName: "John Doe", username: "johndoe123", email: "johndoe@example.com", dateCreated: "2024-05-18" },
    user2: { id: 2, profilePic: Profile, fullName: "Alice Smith", username: "alice_smith", email: "alice@example.com", dateCreated: "2024-05-19" },
    user3: { id: 3, profilePic: Profile, fullName: "Bob Johnson", username: "bob_johnson", email: "bob@example.com", dateCreated: "2024-05-20" },
    user4: { id: 4, profilePic: Profile, fullName: "Emily Brown", username: "emily_brown", email: "emily@example.com", dateCreated: "2024-05-21" },
    user5: { id: 5, profilePic: Profile, fullName: "David Wilson", username: "david_wilson", email: "david@example.com", dateCreated: "2024-05-22" },
    user6: { id: 6, profilePic: Profile, fullName: "Sarah Taylor", username: "sarah_taylor", email: "sarah@example.com", dateCreated: "2024-05-23" },
    user7: { id: 7, profilePic: Profile, fullName: "Michael Lee", username: "michael_lee", email: "michael@example.com", dateCreated: "2024-05-24" }
  };

  const handleBlock = (user) => {
    setModal({
      show: true,
      userId: user.id,
      action: 'block',
      message: `Are you sure you want to ${blockedUsers[user.id] ? 'unblock' : 'block'} ${user.fullName}?`
    });
  };

  const handleDelete = (user) => {
    setModal({
      show: true,
      userId: user.id,
      action: 'delete',
      message: `Are you sure you want to delete ${user.fullName}? This action is irreversible.`
    });
  };

  const confirmAction = () => {
    if (modal.action === 'block') {
      setBlockedUsers(prev => ({ ...prev, [modal.userId]: !prev[modal.userId] }));
    } else if (modal.action === 'delete') {
      // Implement delete functionality here
      console.log(`User with id ${modal.userId} deleted`);
    }
    setModal({ show: false, userId: null, action: '', message: '' });
  };

  const cancelAction = () => {
    setModal({ show: false, userId: null, action: '', message: '' });
  };

  return (
    <div className="relative top-0 left-36 right-0 bottom-0">
      <div className="mt-8 grid grid-cols-2 gap-8">
        {Object.values(users).map(user => (
          <div key={user.id} className="bg-white p-6 rounded-lg shadow-md mb-4 cursor-pointer transition duration-300 transform hover:scale-105">
            <div className="flex items-center mb-2">
              <img src={user.profilePic} alt={user.fullName} className="w-12 h-12 rounded-full" />
              <h2 className="text-lg font-bold ml-2">{user.fullName}</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4 overflow-hidden" style={{ textOverflow: 'ellipsis', maxHeight: '3em' }}>{user.username}</p>
            <p className="text-xs text-gray-500">Email: {user.email}</p>
            <p className="text-xs text-gray-500">Date Created: {user.dateCreated}</p>
            <div className="flex justify-center space-x-4 mt-4">
              <button onClick={() => handleBlock(user)} className="bg-black text-white px-4 py-2 rounded hover:bg-gray-700">
                {blockedUsers[user.id] ? 'Unblock' : 'Block'}
              </button>
              <button onClick={() => handleDelete(user)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal.show && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-11/12">
            <p className="mb-4">{modal.message}</p>
            <div className="flex justify-end space-x-4">
              <button onClick={confirmAction} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">OK</button>
              <button onClick={cancelAction} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUser;
