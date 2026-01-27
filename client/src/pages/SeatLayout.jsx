import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { dummyDateTimeData, dummyShowsData } from '../assets/assets';
import Loading from '../components/Loading';
import { ClockIcon, ArrowRightIcon } from 'lucide-react';
import isoTimeFormat from "../lib/isoTimeFormat";
import { assets } from '../assets/assets';
import toast from 'react-hot-toast';

const SeatLayout = () => {

  const groupRows = [["A", "B"], ["C", "D"], ["E", "F"], ["G", "H"], ["I", "J"]];

  const { id, date } = useParams();

  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState([]);
  const [show, setShow] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    getShow();
  }, []);

  const getShow = async () => {
    const show = await dummyShowsData.find((show) => show._id === id);
    setShow({
      movie: show,
      dateTime: dummyDateTimeData,
    })
  }

  const handleSeatClick = (seatId) => {
    if (!selectedTime) {
      return toast("Please select time first");
    }
  
    if (!selectedSeat.includes(seatId) && selectedSeat.length >= 5) {
      return toast("You can only select 5 seats");
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
              border-primmary/60 cursor-pointer ${selectedSeat.includes(seatId) && "bg-primmary text-white"}`}>
              {seatId}
            </button>
          )
        })}
      </div>
    </div>
  )

  return show ? (
    <div className='flex flex-col md:flex-row px-6 md:px-16 lg:px-36 py-30 md:pt-50'>
      {/* Available timing */}
      <div className='w-60 bg-primmary/10 border border-primmary/20 rounded-lg py-10
      h-max md:sticky md:top-30'>
        <p className='flex items-center justify-center mb-3'>Available Timings</p>
        <div>
          {show.dateTime[date].map((item) => (
            <div key={item.time} onClick={() => setSelectedTime(item)} className={`flex items-center gap-2 px-6 py-2 rounded-r-md cursor-pointer transition
            ${selectedTime?.time === item?.time ? "bg-primmary text-white" : "hover:bg-primmary/20"}`}>
              <ClockIcon className="w-4 h-4" />
              <p className='text-sm'>{isoTimeFormat(item.time)}</p>
            </div>
          ))}
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

        <button onClick={() => navigate("/my-bookings")} className='flex items-center gap-1 mt-20 px-10 py-3 text-sm bg-primmary hover:bg-primary-dull
        transition rounded-full font-medium cursor-pointer active:scale-95 '>
          Proceed to Checkout
          <ArrowRightIcon strokeWidth={3} className="w-4 h-4" />
        </button>


      </div>
    </div>
  ) : <Loading />
}

export default SeatLayout
