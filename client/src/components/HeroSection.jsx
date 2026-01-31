import React from 'react'
import { assets } from '../assets/assets'
import { ArrowRight, CalendarIcon, ClockIcon } from 'lucide-react'
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
    const navigate = useNavigate();
  return (
    <div className='flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 bg-[url("/backgroundImage2.png")] bg-cover bg-center h-screen'>
      
      <img src={assets.marvelLogo} alt='marvel-img' className='max-h-11 lg:h-11 mt-20'/>
      
      <h1 className='text-5xl md:text-[70px] md:leading-18
      font-semibold max-w-110'>Guardian <br /> of the Galaxy</h1>

      <div className='flex flex-row gap-4 text-gray-300'>
        <span>Action | Adventure | Sci-Fi</span>
        <div className='flex items-center gap-1'>
            <CalendarIcon className='w-4.5 h-4.5' /> 2018
        </div>
        <div className='flex items-center gap-1'>
            <ClockIcon className='w-4.5 h-4.5' /> 2h 18m
        </div>
      </div>
      
      <p className='max-w-md text-gray-300'>In a near-future where human memories can be digitized and sold, a brilliant but disgraced memory-archivist, Elara Vance, discovers a fragmented, unauthorized memory file hidden within a secure server</p>
      <button onClick={() => {
        scrollTo(0, 0);
        navigate("/movies");
      }} className='bg-primary-dull flex items-center gap-2 px-4 py-3 cursor-pointer rounded-full'>
        Explore Movies
        <ArrowRight className='w-5 h-5' /></button>
    </div>
  )
}

export default HeroSection
