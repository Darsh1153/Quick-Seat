import React, { useEffect, useState } from 'react';
import Loading from "../components/Loading";
import { dummyBookingData } from "../assets/assets";
import formatTime from "../lib/formatTime";
import { dateFormat } from '../lib/dateFormat';
import { useAppContext } from '../context/AppContext';
import { apiRequest } from '../lib/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const {IMAGE_URL, getToken, user } = useAppContext();

  const [bookings, setBookings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("[MyBookings] Component mounted/updated, user:", user?.id);
    if(user) {
      getMyBooking();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Refresh bookings when component comes into focus (e.g., after navigation from booking)
  useEffect(() => {
    const handleFocus = () => {
      console.log("[MyBookings] Window focused, refreshing bookings");
      if (user) {
        getMyBooking();
      }
    };
    
    // Also refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        console.log("[MyBookings] Page visible, refreshing bookings");
        getMyBooking();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  // Poll for payment status updates every 5 seconds if there are unpaid bookings
  useEffect(() => {
    if (!user || !bookings) return;

    const hasUnpaidBookings = bookings.some(booking => !booking.isPaid);
    if (!hasUnpaidBookings) return;

    console.log("[MyBookings] Starting payment status polling");
    const pollInterval = setInterval(() => {
      console.log("[MyBookings] Polling for payment status updates");
      getMyBooking();
    }, 5000);

    return () => {
      console.log("[MyBookings] Stopping payment status polling");
      clearInterval(pollInterval);
    };
  }, [user, bookings]);

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
        
        // Check payment status for unpaid bookings
        bookingsList.forEach(async (booking) => {
          if (!booking.isPaid && booking._id) {
            try {
              console.log("[MyBookings] Checking payment status for booking:", booking._id);
              const paymentData = await apiRequest(`/api/booking/check-payment/${booking._id}`, {
                method: 'GET',
              }, token);
              
              if (paymentData.success && paymentData.updated) {
                console.log("[MyBookings] Payment status updated for booking:", booking._id);
                // Refresh bookings to get updated status
                setTimeout(() => getMyBooking(), 1000);
              }
            } catch (error) {
              console.error("[MyBookings] Error checking payment status:", error);
            }
          }
        });
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
        <button 
          onClick={getMyBooking}
          className='text-sm text-gray-400 hover:text-white transition'
        >
          Refresh
        </button>
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
                  <>
                    <Link to={booking.paymentLink} className='bg-primmary px-4 py-1.5 mb-3
                    text-sm rounded-full font-medium cursor-pointer'>Pay Now</Link>
                    <button 
                      onClick={async () => {
                        try {
                          const token = await getToken();
                          const paymentData = await apiRequest(`/api/booking/check-payment/${booking._id}`, {
                            method: 'GET',
                          }, token);
                          
                          if (paymentData.success && paymentData.updated) {
                            toast.success("Payment confirmed!");
                            getMyBooking();
                          } else if (paymentData.success && paymentData.isPaid) {
                            toast.success("Payment already confirmed!");
                            getMyBooking();
                          } else {
                            toast.error("Payment not confirmed yet. Please complete the payment.");
                          }
                        } catch (error) {
                          console.error("Error checking payment:", error);
                          toast.error("Failed to check payment status");
                        }
                      }}
                      className='bg-gray-600 hover:bg-gray-700 px-4 py-1.5 mb-3
                      text-sm rounded-full font-medium cursor-pointer'
                    >
                      Check Payment
                    </button>
                  </>
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
