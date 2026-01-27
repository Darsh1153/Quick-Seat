import React, { useEffect, useState } from 'react';
import Loading from "../components/Loading";
import { dummyBookingData } from "../assets/assets";
import formatTime from "../lib/formatTime";
import { dateFormat } from '../lib/dateFormat';

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const [bookings, setBookings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMyBooking();
  }, []);

  const getMyBooking = async () => {
    setBookings(dummyBookingData);
  }

  return bookings ? (
    <div className='px-6 md:px-16 lg:px-36 pt-30 md:pt-40 min-h-[80vh]'>
      <h1 className='text-lg font-semibold mb-4'>My Bookings</h1>
      
      {bookings.map((booking, index) => {
        return (
          <div key={index} className='flex flex-col md:flex-row justify-between bg-primmary/8
          border border-primmary/20 rounded-lg mt-4 p-2 max-w-3xl'>
            <div className='flex flex-col md:flex-row'>
              <img className='md:max-w-45 aspect-video h-auto object-cover object-bottom rounded' src={booking.show.movie.poster_path} alt='img' />
              <div className='flex flex-col p-4'>
                <p className='text-lg font-semibold'>{booking.show.movie.title}</p>
                <p className='text-gray-400 text-sm'>{formatTime(booking.show.movie.runtime)}</p>
                <p className='text-gray-400 text-sm mt-auto'>{dateFormat(booking.show.showDateTime)}</p>
              </div>
            </div>

            <div className='flex flex-col md:items-end md:text-right justify-between p-4'>
              <div className='flex items-center gap-4'>
                <p className='text-2xl font-semibold mb-3'>{currency}{booking.amount}</p>
                {!booking.isPaid && <button className='bg-primmary px-4 py-1.5 mb-3
                text-sm rounded-full font-medium cursor-pointer'>Pay Now</button>}
              </div>
              <div className='text-sm'>
                  <p><span className='text-gray-400'>Total Tickets:</span>{booking.bookedSeats.length}</p>
                  <p><span className='text-gray-400'>Seat Number:</span>{booking.bookedSeats.join(", ")}</p>
              </div>
            </div>
          </div>
        )
      })}

    </div>
  ) : <Loading />
}

export default MyBookings
