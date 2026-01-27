import { ArrowRight } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { dummyShowsData } from "../assets/assets";
import MovieCard from './MovieCard';

const FeaturedSection = () => {
    const navigate = useNavigate();

  return (
    <div className='px-6 md:px-16 lg:px-36 xl:px-44'>
      
      <div className='pt-20 flex justify-between mb-10'>
        <p className='text-lg text-gray-300 font-medium'>Now Showing</p>
        <button onClick={() => navigate("/movies")} className='flex items-center gap-1'>View All
            <ArrowRight className='w-4.5 h-4.5 group-hover:translate-x-0.5 transition cursor-pointer' />
        </button>
      </div>

      <div className='flex flex-wrap justify-center gap-2'>
        {dummyShowsData.slice(0, 4).map((show) => (
            <MovieCard key={show._id} show={show} /> 
        ))}
      </div>

      <div className='flex justify-center mt-20'>
        <button onClick={() => navigate("/movies")} className="bg-primmary hover:bg-primary-dull px-10 py-3 rounded-md text-sm cursor-pointer">
            Show More</button>
      </div>

    </div>
  )
}

export default FeaturedSection
