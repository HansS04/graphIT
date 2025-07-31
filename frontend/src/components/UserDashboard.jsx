import React from 'react';

const UserDashboard = ({ user }) => {
  return (
    <div className="flex-grow p-8">
      <div className="bg-graphit-light-blue p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-graphit-yellow mb-4">
          Ahoj: {user ? user.email : 'Uživatel'}!
        </h1>
        <p className="text-graphit-white">
          Vítejte na svém dashboardu. Zde bude obsah pro běžné uživatele.
        </p>
      </div>
    </div>
  );
};

export default UserDashboard;