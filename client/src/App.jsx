import React from 'react'
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";
import SeatLayout from "./pages/SeatLayout";
import MyBookings from "./pages/MyBookings";
import Favorite from "./pages/Favorite";

import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Layout from "./pages/admin/Layout";
import Dashboard from "./pages/admin/Dashboard";
import AddShows from "./pages/admin/AddShows";
import ListBookings from "./pages/admin/ListBookings";
import ListShows from "./pages/admin/ListShows";

const App = () => {
  const isAdminRoute = useLocation().pathname.startsWith("/admin");

  return (
    <>
      <Toaster />
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path='/' element={<Home />}></Route>
        <Route path='/movies' element={<Movies />}></Route>
        <Route path='/movies/:id' element={<MovieDetails />}></Route>
        <Route path='/movies/:id/:date' element={<SeatLayout />}></Route>
        <Route path='/my-bookings' element={<MyBookings />}></Route>
        <Route path='/favorite' element={<Favorite />}></Route>

        <Route path='/admin/*' element={<Layout />}>
          <Route index element={<Dashboard />}></Route>
          <Route path='add-show' element={<AddShows />}></Route>
          <Route path='list-bookings' element={<ListBookings />}></Route>
          <Route path='list-shows' element={<ListShows />}></Route>
        </Route>
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  )
}

export default App
