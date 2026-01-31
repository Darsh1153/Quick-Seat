import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { dummyDateTimeData, dummyShowsData } from '../assets/assets';
import Loading from '../components/Loading';
import { ClockIcon, ArrowRightIcon } from 'lucide-react';
import isoTimeFormat from "../lib/isoTimeFormat";
import { assets } from '../assets/assets';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import { apiRequest } from '../lib/api';

const SeatLayout = () => {

  const groupRows = [["A", "B"], ["C", "D"], ["E", "F"], ["G", "H"], ["I", "J"]];

  const { id, date } = useParams();

  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState([]);
  const [show, setShow] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const { getToken, user } = useAppContext();

  useEffect(() => {
    console.log("[SeatLayout] Component mounted/updated", { id, date });
    if (id) {
      console.log("[SeatLayout] Calling getShow with id:", id);
      getShow();
    } else {
      console.warn("[SeatLayout] No id provided in params");
      setLoading(false);
    }
  }, [id]);

  const getShow = async () => {
    console.log("[SeatLayout] getShow called", { id, currentShow: show });
    
    if (!id) {
      console.warn("[SeatLayout] getShow: No id provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("[SeatLayout] Fetching show data from API...", { endpoint: `/api/show/${id}` });
      
      const data = await apiRequest(`/api/show/${id}`, {
        method: 'GET',
      });
      
      console.log("[SeatLayout] API response received:", { 
        success: data?.success, 
        hasData: !!data,
        hasDateTime: !!data?.dateTime,
        hasMovie: !!data?.movie,
        dataKeys: data ? Object.keys(data) : [],
        fullData: data
      });
      
      if (data && data.success) {
        // Ensure the data structure is correct
        if (!data.dateTime || !data.movie) {
          console.error("[SeatLayout] Invalid show data structure:", {
            hasDateTime: !!data.dateTime,
            hasMovie: !!data.movie,
            dateTimeType: typeof data.dateTime,
            movieType: typeof data.movie,
            fullData: data
          });
          toast.error("Invalid show data received");
          setShow(null);
          return;
        }
        
        console.log("[SeatLayout] Setting show state with valid data:", {
          movieId: data.movie?._id,
          movieTitle: data.movie?.title,
          dateTimeKeys: data.dateTime ? Object.keys(data.dateTime) : [],
          dateTimeForCurrentDate: data.dateTime?.[date]
        });
        
        setShow(data);
        console.log("[SeatLayout] Show state set successfully");
      } else {
        console.error("[SeatLayout] API returned unsuccessful response:", {
          success: data?.success,
          message: data?.message,
          data: data
        });
        toast.error(data?.message || "Failed to fetch show details");
        setShow(null);
      }
    } catch (error) {
      console.error("[SeatLayout] Error fetching show:", {
        error,
        errorMessage: error?.message,
        errorStack: error?.stack,
        errorName: error?.name,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
      });
      const errorMessage = error.message || "Failed to fetch show details";
      // Filter out technical errors that shouldn't be shown to users
      if (!errorMessage.toLowerCase().includes("show is not defined") && 
          !errorMessage.toLowerCase().includes("cannot read") &&
          !errorMessage.toLowerCase().includes("undefined")) {
        toast.error(errorMessage);
      } else {
        console.error("[SeatLayout] Technical error filtered out:", errorMessage);
        toast.error("Failed to load show details. Please try again.");
      }
      setShow(null);
    } finally {
      setLoading(false);
      console.log("[SeatLayout] getShow completed, loading set to false");
    }
  }

  const getOccupiedSeats = async () => {
    console.log("[SeatLayout] getOccupiedSeats called", { selectedTime });
    
    if (!selectedTime) {
      console.log("[SeatLayout] getOccupiedSeats: No selectedTime, clearing occupied seats");
      setOccupiedSeats([]);
      return;
    }
    
    if (!selectedTime.showId) {
      console.error("[SeatLayout] getOccupiedSeats: Selected time does not have showId:", {
        selectedTime,
        selectedTimeKeys: selectedTime ? Object.keys(selectedTime) : [],
        selectedTimeType: typeof selectedTime
      });
      toast.error("Invalid show time selected");
      setOccupiedSeats([]);
      return;
    }
    
    try {
      console.log("[SeatLayout] Fetching occupied seats for showId:", selectedTime.showId);
      const data = await apiRequest(`/api/booking/seats/${selectedTime.showId}`, {
        method: 'GET',
      });
      
      console.log("[SeatLayout] Occupied seats API response:", {
        success: data?.success,
        occupiedSeats: data?.occupiedSeats,
        occupiedSeatsLength: data?.occupiedSeats?.length
      });
      
      if (data.success) {
        setOccupiedSeats(data.occupiedSeats || []);
        console.log("[SeatLayout] Occupied seats set:", data.occupiedSeats || []);
      } else {
        console.error("[SeatLayout] Failed to fetch occupied seats:", data.message);
        toast.error(data.message || "Failed to fetch occupied seats");
        setOccupiedSeats([]);
      }
    } catch (error) {
      console.error("[SeatLayout] Error fetching occupied seats:", {
        error,
        errorMessage: error?.message,
        errorStack: error?.stack,
        selectedTime,
        showId: selectedTime?.showId
      });
      const errorMessage = error.message || "Failed to fetch occupied seats";
      // Filter out technical errors
      if (!errorMessage.toLowerCase().includes("show is not defined") && 
          !errorMessage.toLowerCase().includes("cannot read") &&
          !errorMessage.toLowerCase().includes("undefined")) {
        toast.error(errorMessage);
      }
      // Don't show error toast for occupied seats - just log it
      setOccupiedSeats([]);
    }
  }

  useEffect(() => {
    console.log("[SeatLayout] selectedTime changed:", {
      selectedTime,
      hasShowId: !!selectedTime?.showId,
      showId: selectedTime?.showId
    });
    
    if (selectedTime && selectedTime.showId) {
      console.log("[SeatLayout] Calling getOccupiedSeats for showId:", selectedTime.showId);
      getOccupiedSeats();
    } else {
      console.log("[SeatLayout] No valid selectedTime, clearing occupied seats");
      setOccupiedSeats([]);
    }
  }, [selectedTime]);

  const handleSeatClick = (seatId) => {
    if (!selectedTime) {
      return toast("Please select time first");
    }

    if (!selectedSeat.includes(seatId) && selectedSeat.length >= 5) {
      return toast("You can only select 5 seats");
    }

    if(occupiedSeats.includes(seatId)) {
      return toast("Seat is already occupied");
    }

    setSelectedSeat(prev =>
      prev.includes(seatId)
        ? prev.filter(seat => seat !== seatId)
        : [...prev, seatId]
    );
  };


  const renderSeat = (row, count = 9) => (
    <div key={row} className='flex gap-2 mt-2'>
      <div className='flex flex-wrap items-center justify-center gap-2'>
        {Array.from({ length: count }, (_, i) => {
          const seatId = `${row}${i + 1}`;
          return (
            <button key={seatId} onClick={() => handleSeatClick(seatId)} className={`h-8 w-8 rounded border
              border-primmary/60 cursor-pointer ${selectedSeat.includes(seatId)
               && "bg-primmary text-white"}
               ${occupiedSeats.includes(seatId) && "opacity-50"}`}>
              {seatId}
            </button>
          )
        })}
      </div>
    </div>
  )


  const bookTickets = async () => {
    try {
      if(!user) {
        return toast.error("Please login to book tickets");
      }
      if(!selectedTime || !selectedTime.showId) {
        return toast.error("Please select a time");
      }
      if(!selectedSeat.length) {
        return toast.error("Please select at least one seat");
      }

      const token = await getToken();
      
      console.log("[SeatLayout] Creating booking with:", {
        showId: selectedTime.showId,
        selectedSeats: selectedSeat,
        selectedSeatsType: typeof selectedSeat,
        isArray: Array.isArray(selectedSeat),
        selectedSeatsLength: selectedSeat.length
      });
      
      const data = await apiRequest("/api/booking/create", {
        method: "POST",
        body: JSON.stringify({
          showId: selectedTime.showId,
          selectedSeats: selectedSeat,
        }),
      }, token);
      
      console.log("[SeatLayout] Booking response:", data);
      
      if(data.success) {
        window.location.href = data.url
      } else {
        toast.error(data.message || "Failed to create booking");
      }
    } catch (error) {
      console.error("Error booking tickets:", error);
      const errorMessage = error.message || "Failed to book tickets";
      // Filter out technical errors
      if (!errorMessage.toLowerCase().includes("show is not defined") && 
          !errorMessage.toLowerCase().includes("cannot read") &&
          !errorMessage.toLowerCase().includes("undefined")) {
        toast.error(errorMessage);
      } else {
        toast.error("Failed to book tickets. Please try again.");
      }
    }
  }

  console.log("[SeatLayout] Render check:", {
    loading,
    hasShow: !!show,
    showType: typeof show,
    showKeys: show ? Object.keys(show) : [],
    date,
    currentShow: show
  });

  if (loading || !show) {
    console.log("[SeatLayout] Rendering Loading component", { loading, hasShow: !!show });
    return <Loading />;
  }

  // Safely extract dateTime from show
  const dateTime = show?.dateTime;
  console.log("[SeatLayout] Extracted dateTime:", {
    hasDateTime: !!dateTime,
    dateTimeType: typeof dateTime,
    dateTimeKeys: dateTime ? Object.keys(dateTime) : [],
    date,
    hasDateInDateTime: dateTime ? !!dateTime[date] : false,
    dateTimeForDate: dateTime?.[date]
  });
  
  if (!dateTime) {
    console.error("[SeatLayout] No dateTime in show object:", { show, showKeys: show ? Object.keys(show) : [] });
    return (
      <div className='px-6 md:px-16 lg:px-36 py-30 md:pt-50 flex flex-col items-center justify-center min-h-screen'>
        <p className='text-xl text-gray-400'>Loading show data...</p>
        <Loading />
      </div>
    );
  }

  if (!date || !dateTime[date] || !dateTime[date].length) {
    console.warn("[SeatLayout] No shows available for date:", {
      date,
      dateTimeKeys: Object.keys(dateTime),
      dateTimeForDate: dateTime[date],
      dateTimeForDateLength: dateTime[date]?.length
    });
    return (
      <div className='px-6 md:px-16 lg:px-36 py-30 md:pt-50 flex flex-col items-center justify-center min-h-screen'>
        <p className='text-xl text-gray-400'>No shows available for this date</p>
        <button onClick={() => navigate(-1)} className='mt-4 px-6 py-2 bg-primmary hover:bg-primary-dull rounded-md'>
          Go Back
        </button>
      </div>
    );
  }

  console.log("[SeatLayout] Rendering seat layout with:", {
    date,
    timesForDate: dateTime[date],
    timesCount: dateTime[date].length,
    selectedTime,
    selectedSeatCount: selectedSeat.length,
    occupiedSeatsCount: occupiedSeats.length
  });

  return (
    <div className='flex flex-col md:flex-row px-6 md:px-16 lg:px-36 py-30 md:pt-50'>
      {/* Available timing */}
      <div className='w-60 bg-primmary/10 border border-primmary/20 rounded-lg py-10
      h-max md:sticky md:top-30'>
        <p className='flex items-center justify-center mb-3'>Available Timings</p>
        <div>
          {dateTime[date].map((item, index) => {
            // Ensure item has the required properties
            if (!item || !item.showId) {
              console.error("Invalid time item:", item);
              return null;
            }
            
            return (
              <div 
                key={item.showId || index} 
                onClick={() => {
                  try {
                    console.log("[SeatLayout] Time item clicked:", {
                      item,
                      itemKeys: item ? Object.keys(item) : [],
                      hasShowId: !!item?.showId,
                      hasTime: !!item?.time,
                      showId: item?.showId,
                      time: item?.time
                    });
                    
                    if (item && item.showId && item.time) {
                      console.log("[SeatLayout] Setting selectedTime:", item);
                      setSelectedTime(item);
                      console.log("[SeatLayout] selectedTime set successfully");
                    } else {
                      console.error("[SeatLayout] Invalid time item clicked:", {
                        item,
                        hasItem: !!item,
                        hasShowId: !!item?.showId,
                        hasTime: !!item?.time,
                        itemType: typeof item
                      });
                      toast.error("Invalid show time selected");
                    }
                  } catch (err) {
                    console.error("[SeatLayout] Error selecting time:", {
                      error: err,
                      errorMessage: err?.message,
                      errorStack: err?.stack,
                      item
                    });
                    toast.error("Failed to select time. Please try again.");
                  }
                }} 
                className={`flex items-center gap-2 px-6 py-2 rounded-r-md cursor-pointer transition
                ${selectedTime?.showId === item?.showId ? "bg-primmary text-white" : "hover:bg-primmary/20"}`}>
                <ClockIcon className="w-4 h-4" />
                <p className='text-sm'>{isoTimeFormat(item.time)}</p>
              </div>
            );
          })}
        </div>
      </div>
      {/* Seat selection */}
      <div className='relative flex-1 flex flex-col items-center max-md:mt-16'>
        <h1 className='text-2xl font-semibold mb-4'>Select your seat</h1>
        <img src={assets.screenImage} alt='screen' />
        <p className='text-gray-400 text-sm mb-6'>SCREEN SIDE</p>

        <div className='flex flex-col items-center mt-10 text-xs text-gray-300'>
          <div className='grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6'>
            {groupRows[0].map(row => renderSeat(row))}
          </div>
          <div className='grid grid-cols-2 gap-11'>
            {groupRows.slice(1).map((group, index) => (
              <div key={index}>
                {group.map(row => renderSeat(row))}
              </div>
            ))}
          </div>
        </div>

        <button onClick={bookTickets} className='flex items-center gap-1 mt-20 px-10 py-3 text-sm bg-primmary hover:bg-primary-dull
        transition rounded-full font-medium cursor-pointer active:scale-95 '>
          Proceed to Checkout
          <ArrowRightIcon strokeWidth={3} className="w-4 h-4" />
        </button>


      </div>
    </div>
  );
}

export default SeatLayout
