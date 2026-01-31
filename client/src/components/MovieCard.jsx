import React from 'react'
import { useNavigate } from 'react-router-dom';
import { StarIcon } from "lucide-react";
import formatTime from '../lib/formatTime';

const MovieCard = ({ show, imageUrl }) => {
    const navigate = useNavigate();

    const { _id, title, backdrop_path, genres, release_date, vote_average, runtime } = show;

    return (
        <div className='w-66 flex flex-col justify-between p-3 bg-gray-800'>

            <img onClick={() => {navigate(`/movies/${_id}`)}} src={imageUrl + backdrop_path} alt='movie-img'
            className='rounded-lg w-full' />

            <p className='font-semibold mt-2'>{title}</p>
            
            <div className='text-sm mb-2'>
                <div className='flex justify-between'>
                <p>{release_date}</p>
                <p>{formatTime(runtime)}</p>
                </div>
                <p>{genres.map((genre) => (
                    genre.name
                )).join(" | ")}</p>
            </div>

            <div className='flex justify-between items-center'>
                <button className='bg-primmary hover:bg-primary-dull px-4 py-2 rounded-full'>But Tickets</button>
                <p className='flex gap-1'>
                    <StarIcon className='w-4px h-4px text-primmary fill-primary' />
                    {vote_average.toFixed(1)}
                </p>
            </div>
        </div>
    )
}

export default MovieCard
