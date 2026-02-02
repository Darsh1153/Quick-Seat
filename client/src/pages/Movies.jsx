import React from 'react';
import { dummyShowsData } from '../assets/assets';
import MovieCard from "../components/MovieCard";
import { useAppContext } from '../context/AppContext';

const Movies = () => {
  const { shows, IMAGE_URL } = useAppContext();

  return (
    <div className='my-40 px-6 md:px-16 lg:px-36 xl:px-44'>
      <p className='my-5'>Now Showing</p>
      <div className='flex flex-wrap max-sm:justify-center gap-2'>
        {shows && shows.length > 0 ? (
          shows.map((movie) => (
          <MovieCard key={movie._id} show={movie} imageUrl={IMAGE_URL} />
          ))
        ) : (
          <div className='text-center py-10 w-full'>
            <p className='text-gray-400'>No shows available at the moment</p>
            <p className='text-gray-500 text-sm mt-2'>Check back later for upcoming shows</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Movies
