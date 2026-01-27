import React, { useState, useEffect } from 'react'
import { dummyShowsData } from '../../assets/assets';
import Title from '../../components/admin/Title';
import { StarIcon, CheckIcon } from "lucide-react";
import kConverter from "../../lib/kConverter";
0
const AddShows = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [selectedMovies, setSelectedMovies] = useState(true);
  const [showPrice, setShowPrice] = useState();
  const [dateTimeInput, setDateTimeInput] = useState();
  const [dateTimeSelection, setDateTimeSelection] = useState({});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllShowData();
  }, []);

  const getAllShowData = async () => {
    setNowPlayingMovies(dummyShowsData);
    setLoading(false);
  }
  console.log(nowPlayingMovies);

  const handleDateTimeAdd = () => {
    if (!dateTimeInput) return;

    const [date, time] = dateTimeInput.split("T");
    if (!date || !time) return;

    setDateTimeSelection((prev) => {
      const times = prev[date] || [];

      if (times.includes(time)) return prev;

      return {
        ...prev,
        [date]: [...times, time],
      };
    });

    setDateTimeInput("");
  };


  const handleRemoveTime = (date, time) => {
    setDateTimeSelection((prev) => {
      const filteredTimes = prev[date].filter((t) => t !== time);

      if (filteredTimes.length === 0) {
        const { [date]: _, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [date]: filteredTimes,
      };
    });
  };


  return loading ? <h1>Loading...</h1> : (
    <div>
      <Title text1="Add" text2="Shows" />
      <p className='mt-10 text-lg font-medium'>Now Playing Movies</p>

      <div className='overflow-x-auto pb-4 mt-5'>
        <div className='flex gap-4'>
          {nowPlayingMovies.map((movie) => (
            <div
              key={movie.id}
              className="w-[240px] flex-shrink-0 cursor-pointer hover:-translate-y-1 transition duration-300"
            >
              {/* IMAGE CARD */}
              <div
                onClick={() => setSelectedMovies(movie.id)}
                className="relative rounded-lg overflow-hidden"
              >
                <img
                  alt={movie.title}
                  src={movie.poster_path}
                  className="w-full h-[300px] object-cover brightness-90"
                />

                {/* bottom rating bar */}
                <div className="absolute bottom-0 left-0 w-full bg-black/70 p-2 flex items-center justify-between text-sm">
                  <p className="flex items-center gap-1 text-gray-300">
                    <StarIcon className="w-4 h-4 text-primary fill-primary" />
                    {movie.vote_average.toFixed(1)}
                  </p>
                  <p className="text-gray-300">
                    {kConverter(movie.vote_count)} Votes
                  </p>
                </div>

                {/* selection tick */}
                {selectedMovies === movie.id && (
                  <div className="absolute top-2 right-2 flex items-center justify-center bg-primmary h-6 w-6 rounded-full">
                    <CheckIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                )}
              </div>

              {/* TEXT DETAILS (OUTSIDE image container) */}
              <div className="mt-2">
                <p className="font-medium truncate">{movie.title}</p>
                <p className="text-gray-400 text-sm">{movie.release_date}</p>
              </div>
            </div>

          ))}

        </div>
      </div>

      {/* Show Price Input */}
      <div className='mt-8'>
        <label className='block text-sm font-medium mb-2'>Show Price</label>
        <div className='inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md'>
          <p className='text-gray-400 text-sm'>{currency}</p>
          <input min={0} type='number' value={showPrice} onChange={(e) => setShowPrice(e.target.value)}
            placeholder='Enter Show Price' className='outline-none' />
        </div>
      </div>

      {/* Date Time Selection */}
      <div className='mt-6'>
        <label className='block text-sm font-medium mb-2'>Select Date and Time</label>
        <div className='inline-flex gap-5 border border-gray-600 p-1 pl-3 rounded-lg'>
          <input type='datetime-local' value={dateTimeInput}
            onChange={(e) => setDateTimeInput(e.target.value)} className='outline-none rounded-md' />
          <button onClick={handleDateTimeAdd} className='bg-primmary/80 text-white px-3 py-2 text-sm rounded-lg hover:bg-primmary cursor-pointer'>Add Time</button>
        </div>
      </div>

      {/* Display selected dates & times */}
      {Object.keys(dateTimeSelection).length > 0 && (
        <div className="mt-6 space-y-4">
          {Object.entries(dateTimeSelection).map(([date, times]) => (
            <div
              key={date}
              className="border border-primmary/30 rounded-lg p-3 bg-primmary/5"
            >
              <p className="text-sm font-medium text-primary mb-2">
                {date}
              </p>

              <div className="flex flex-wrap gap-2">
                {times.map((time) => (
                  <div
                    key={time}
                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-primmary/20 text-primmary text-sm"
                  >
                    <span>{time}</span>
                    <button
                      onClick={() => handleRemoveTime(date, time)}
                      className="hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}


    </div>
  )
}

export default AddShows
