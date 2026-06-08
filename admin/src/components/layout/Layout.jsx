import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export const SidebarContext = React.createContext({
  sidebarOpen: false,
  setSidebarOpen: () => {},
});

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      <div className="flex min-h-screen bg-admin-bg">
        <Sidebar />
        <div className="flex-1 flex flex-col md:ml-64 min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default Layout;