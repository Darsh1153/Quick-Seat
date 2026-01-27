import React from 'react';
import { dummyShowsData } from '../assets/assets';
import MovieCard from "../components/MovieCard";

const Movies = () => {
  return (
    <div className='my-40 px-6 md:px-16 lg:px-36 xl:px-44'>
      <p className='my-5'>Now Showing</p>
      <div className='flex flex-wrap max-sm:justify-center gap-2'>
        {dummyShowsData.map((movie) => (
          <MovieCard key={movie._id} show={movie} />
        ))}
      </div>
    </div>
  )
}

export default Movies
