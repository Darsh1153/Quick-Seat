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
        {shows.map((movie) => (
          <MovieCard key={movie._id} show={movie} imageUrl={IMAGE_URL} />
        ))}
      </div>
    </div>
  )
}

export default Movies
