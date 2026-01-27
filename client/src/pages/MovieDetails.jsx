import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import { dummyShowsData, dummyDateTimeData } from '../assets/assets';
import { Heart, PlayCircleIcon, StarIcon } from 'lucide-react';
import formatTime from '../lib/formatTime';
import DateSelect from '../components/DateSelect';
import MovieCard from '../components/MovieCard';
import Loading from '../components/Loading';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  useEffect(() => {
    getShow();
  }, [id]);

  const getShow = async () => {
    const movie = await dummyShowsData.find((show) => show._id === id);
    if (movie) {
      setShow({
        show: movie,
        dateTime: dummyDateTimeData,
      })
    }
  }
  return show ? (
    <div className='px-6 md:px-16 lg:px-36 pt-30'>
      <div className='flex flex-col md:flex-row'>
        <img className='mx-md:mx-auto rounded-xl h-104 max-w-70 object-cover' src={show.show.poster_path} alt='movie-img' />
        <div className='ml-10'>
          <p className="text-primary-dull mb-5">ENGLISH</p>
          <h1 className='text-4xl font-semibold max-w-96 text-balance mb-3'>{show.show.title}</h1>
          <div className='flex gap-2 items-center mb-7'>
            <StarIcon className="w-5 h-5 fill-primary-dull text-primary-dull" />
            <p>{show.show.vote_average.toFixed(1)} User Rating</p>
          </div>

          <p className='text-gray-400 mt-2 max-w-xl mb-5'>{show.show.overview}</p>
          <p>{formatTime(show.show.runtime)} | {show.show.genres.map((genre) => genre.name).join(", ")} | {show.show.release_date.split("-")[0]}</p>

          <div className='flex items-center flex-wrap gap-4 mt-4'>
            <button className='flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900
          transition rounded-md font-medium cursor-pointer active:scale-95'>
              <PlayCircleIcon className='w-5 h-5' />Watch Trailer</button>

            <a href='#dateSelect' className='px-10 py-3 text-sm bg-primmary hover:bg-primary-dull
              transition rounded-md font-medium cursor-pointer active:scale-95'>Buy Tickets</a>

            <button className='bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95'>
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className='mt-20'>
        <p>Movie Casts</p>
        <div className='flex items-center gap-4 w-max px-4 my-5'>
          {show.show.casts.slice(0, 12).map((cast, index) => (
            <div key={index} className='flex flex-col items-center text-center'>
              <img src={cast.profile_path} alt='profile-img' className='rounded-full h-20 md:h-20 aspect-square object-cover' />
              <p className='font-medium text-xs mt-3'>{cast.name}</p>
            </div>
          ))}
        </div>
      </div>

      <DateSelect dateTime={show.dateTime} id={id} />

      <p className="text-lg font-medium mt-20 mb-8">You May Also Like</p>
      <div className='flex flex-wrap max-sm:justify-center gap-8'>
        {dummyShowsData.slice(0, 4).map((show, index) => (
          <MovieCard key={index} show={show} />
        ))}
      </div>
      <div className='flex justify-center mt-30'>
        <button onClick={() => navigate("/movies")} className='px-10 py-3 text-sm bg-primmary hover:bg-primary-dull 
        transition rounded-md font-medium cursor-pointer'>Show More</button>
      </div>

    </div>
  ) : <Loading />
}

export default MovieDetails
