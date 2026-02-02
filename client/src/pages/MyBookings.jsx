import React, { useEffect, useState, useRef } from 'react';
import Loading from "../components/Loading";
import { dummyBookingData } from "../assets/assets";
import formatTime from "../lib/formatTime";
import { dateFormat } from '../lib/dateFormat';
import { useAppContext } from '../context/AppContext';
import { apiRequest } from '../lib/api';
import toast from 'react-hot-toast';
import { Link, useSearchParams, useLocation } from 'react-router-dom';

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const {IMAGE_URL, getToken, user } = useAppContext();

  const [bookings, setBookings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const hasHandledPayment = useRef(false);

  // Handle payment success/cancel on mount
  useEffect(() => {
    if (!user || hasHandledPayment.current) return;
    
    const paymentSuccess = searchParams.get('payment_success');
    const paymentCancelled = searchParams.get('payment_cancelled');
    
    if (paymentSuccess === 'true') {
      hasHandledPayment.current = true;
      toast.success('Payment successful! Refreshing your bookings...');
      
      // Clean URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('payment_success');
      setSearchParams(newParams, { replace: true });
      
      // Poll for updates
      let pollCount = 0;
      const pollInterval = setInterval(async () => {
        pollCount++;
        console.log(`[MyBookings] Polling attempt ${pollCount}/5`);
        await getMyBooking();
        
        if (pollCount >= 5) {
          console.log('[MyBookings] Polling complete');
          clearInterval(pollInterval);
        }
      }, 1500);
      
      return () => {
        console.log('[MyBookings] Cleanup: clearing poll interval');
        clearInterval(pollInterval);
      };
    }
    
    if (paymentCancelled === 'true') {
      toast.error('Payment was cancelled. You can try again by clicking "Pay Now".');
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('payment_cancelled');
      setSearchParams(newParams, { replace: true });
    }
  }, [user, location.search]);

  // Fetch bookings on mount
  useEffect(() => {
    console.log("[MyBookings] Component mounted, user:", user?.id);
    if(user) {
      getMyBooking();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const getMyBooking = async () => {
    if (!user) {
      console.log("[MyBookings] No user, skipping fetch");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log("[MyBookings] Fetching bookings for user:", user.id);
      
      const token = await getToken();
      const data = await apiRequest("/api/user/bookings", {
        method: 'GET',
      }, token);
      
      console.log("[MyBookings] Bookings API response:", {
        success: data?.success,
        bookingsCount: data?.bookings?.length,
        bookings: data?.bookings
      });

      if(data.success) {
        const bookingsList = data.bookings || [];
        console.log("[MyBookings] Setting bookings:", bookingsList.length);
        setBookings(bookingsList);
      } else {
        console.error("[MyBookings] API returned error:", data.message);
        toast.error(data.message || "Failed to fetch bookings");
        setBookings([]);
    }
  } catch (error) {
      console.error("[MyBookings] Error fetching bookings:", {
        error,
        errorMessage: error?.message,
        errorStack: error?.stack
      });
      toast.error(error.message || "Failed to fetch bookings");
      setBookings([]);
  } finally {
    setIsLoading(false);
  }
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className='px-6 md:px-16 lg:px-36 pt-30 md:pt-40 min-h-[80vh]'>
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-lg font-semibold'>My Bookings</h1>
      </div>
      
      {!bookings || bookings.length === 0 ? (
        <div className='text-center py-10'>
          <p className='text-gray-400'>No bookings found</p>
        </div>
      ) : (
        bookings.map((booking, index) => {
        return (
          <div key={index} className='flex flex-col md:flex-row justify-between bg-primmary/8
          border border-primmary/20 rounded-lg mt-4 p-2 max-w-3xl'>
            <div className='flex flex-col md:flex-row'>
              <img className='md:max-w-45 aspect-video h-auto object-cover object-bottom rounded' src={IMAGE_URL + booking.show.movie.poster_path} alt='img' />
              <div className='flex flex-col p-4'>
                <p className='text-lg font-semibold'>{booking.show.movie.title}</p>
                <p className='text-gray-400 text-sm'>{formatTime(booking.show.movie.runtime)}</p>
                <p className='text-gray-400 text-sm mt-auto'>{dateFormat(booking.show.showDateTime)}</p>
              </div>
            </div>

            <div className='flex flex-col md:items-end md:text-right justify-between p-4'>
              <div className='flex items-center gap-4'>
                <p className='text-2xl font-semibold mb-3'>{currency}{booking.amount}</p>
                {!booking.isPaid ? (
                  <Link 
                    to={booking.paymentLink} 
                    className='bg-primmary px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer'
                  >
                    Pay Now
                  </Link>
                ) : (
                  <span className='bg-green-600 px-4 py-1.5 mb-3 text-sm rounded-full font-medium'>
                    Paid
                  </span>
                )}
              </div>
              <div className='text-sm'>
                  <p><span className='text-gray-400'>Total Tickets:</span>{booking.bookedSeats.length}</p>
                  <p><span className='text-gray-400'>Seat Number:</span>{booking.bookedSeats.join(", ")}</p>
              </div>
            </div>
          </div>
        )
        })
      )}

    </div>
  );
}

export default MyBookings
