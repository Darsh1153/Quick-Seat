import React from 'react'
import Navbar from "../../components/admin/Navbar";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";

const Layout = () => {
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
  )
}

export default Layout
