import React from 'react'
import Navbar from "../../components/admin/Navbar";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";

const Layout = () => {
  // Admin check is handled automatically in AppContext
  // No need to check again here since App.jsx already verifies isAdmin before rendering Layout
  return (
    <>
      <Navbar />
      <div className='flex'>
        <Sidebar />
        <div className='flex-1 px-4 py-10 md:px-10 h-[calc(100vh-64px)] overflow-y-auto'>
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default Layout
