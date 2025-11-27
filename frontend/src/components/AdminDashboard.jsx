import React from 'react';

const AdminDashboard = ({ user }) => {
  // Mock data pro ukázku
  const users = [
    { id: 1, email: 'jan.novak@example.com', role: 'User', status: 'Active' },
    { id: 2, email: 'petr.svoboda@example.com', role: 'User', status: 'Inactive' },
    { id: 3, email: 'admin@graphit.com', role: 'Admin', status: 'Active' },
  ];

  return (
    <div className="w-full h-full p-6 text-text-graphit-white">
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <button className="bg-graphit-turquoise hover:bg-green-600 text-white px-4 py-2 rounded shadow-lg transition-colors">
          + Přidat uživatele
        </button>
      </div>

      {/* KARTA SEZNAM UŽIVATELŮ */}
      <div className="bg-graphit-gray border border-graphit-gray-dark rounded-lg shadow-xl overflow-hidden">
        <div className="p-6 border-b border-graphit-gray-dark">
          <h2 className="text-xl font-semibold">Správa Uživatelů</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-graphit-gray-dark text-graphit-gray-light uppercase text-xs">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Akce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphit-gray-dark">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-graphit-gray-dark/50 transition-colors">
                  <td className="px-6 py-4">{u.id}</td>
                  <td className="px-6 py-4 font-medium">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${u.role === 'Admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${u.status === 'Active' ? 'bg-graphit-success/20 text-graphit-success' : 'bg-red-500/20 text-red-300'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-graphit-light-blue hover:text-graphit-turquoise text-sm font-semibold">Upravit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;