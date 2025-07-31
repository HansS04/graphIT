import React from 'react';

const AdminDashboard = ({ user }) => {
  return (
    // Celý obsah dashboardu je v jednom flex-grow divu, který se roztáhne
    // přes celou šířku main containeru v App.js.
    <div className="flex-grow p-8">
      <div className="bg-graphit-light-blue p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-graphit-orange mb-4">
          Ahoj, Administrátore!
        </h1>
        <p className="text-graphit-white">
          Vítejte v administrátorském panelu. Zde budou nástroje pro správu.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;