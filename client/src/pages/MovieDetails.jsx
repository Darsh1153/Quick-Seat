import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import { dummyShowsData, dummyDateTimeData } from '../assets/assets';
import { Heart, PlayCircleIcon, StarIcon } from 'lucide-react';
import formatTime from '../lib/formatTime';
import DateSelect from '../components/DateSelect';
import MovieCard from '../components/MovieCard';
import Loading from '../components/Loading';
import { useAppContext } from '../context/AppContext';
import { apiRequest } from '../lib/api';
import toast from 'react-hot-toast';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { shows, IMAGE_URL, getToken, user, fetchFavoriteMovies, favoriteMovies } = useAppContext();

  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true); 
  
  useEffect(() => {
    getShow();
  }, [id]);

  const getShow = async () => {
    try {
      setLoading(true);
      // Get token only if user is logged in (this route might not require auth)
      let token = null;
      if (user) {
        try {
          token = await getToken();
        } catch (tokenError) {
          console.error("Error getting token:", tokenError);
          // Continue without token - route might be public
        }
      }
      
      const data = await apiRequest(`/api/show/${id}`, {
        method: 'GET',
      }, token);
      
      if(data.success) {
        setShow(data);
      } else {
        toast.error(data.message || "Failed to fetch show");
        setShow(null);
      }
    } catch (error) {
      console.error("Error fetching show:", error);
      toast.error(error.message || "Failed to fetch show");
      setShow(null);
    } finally {
      setLoading(false);
    }
  }
  if (loading) {
    return <Loading />;
  }


  const handleFavorite = async () => {
    if (!user) {
      toast.error("Please login to add to favorites");
      return;
    }

    try {
      const token = await getToken();
      const data = await apiRequest("/api/user/update-favorite", {
        method: 'POST',
        body: JSON.stringify({ movieId: id }),
      }, token);
      
      if(data.success) {
        await fetchFavoriteMovies();
        toast.success(data.message || "Added to favorites");
      } else {
        toast.error(data.message || "Failed to update favorites");
      }
    } catch (error) {
      console.error("Error adding to favorites:", error);
      toast.error(error.message || "Failed to update favorites");
    }
  }

  if (!show) {
    return (
      <div className='px-6 md:px-16 lg:px-36 pt-30 flex flex-col items-center justify-center min-h-screen'>
        <p className='text-xl text-gray-400'>Show not found</p>
        <button onClick={() => navigate("/movies")} className='mt-4 px-6 py-2 bg-primmary hover:bg-primary-dull rounded-md'>
          Back to Movies
        </button>
      </div>
    );
  }

  const { movie, dateTime } = show;

  return (
    <div className='px-6 md:px-16 lg:px-36 pt-30'>
      <div className='flex flex-col md:flex-row'>
        <img className='mx-md:mx-auto rounded-xl h-104 max-w-70 object-cover' src={IMAGE_URL + movie.poster_path} alt='movie-img' />
        <div className='ml-10'>
          <p className="text-primary-dull mb-5">ENGLISH</p>
          <h1 className='text-4xl font-semibold max-w-96 text-balance mb-3'>{movie.title}</h1>
          <div className='flex gap-2 items-center mb-7'>
            <StarIcon className="w-5 h-5 fill-primary-dull text-primary-dull" />
            <p>{movie.vote_average.toFixed(1)} User Rating</p>
          </div>

          <p className='text-gray-400 mt-2 max-w-xl mb-5'>{movie.overview}</p>
          <p>{formatTime(movie.runtime)} | {movie.genres.map((genre) => genre.name).join(", ")} | {movie.release_date.split("-")[0]}</p>

          <div className='flex items-center flex-wrap gap-4 mt-4'>
            <button className='flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900
          transition rounded-md font-medium cursor-pointer active:scale-95'>
              <PlayCircleIcon className='w-5 h-5' />Watch Trailer</button>

            <a href='#dateSelect' className='px-10 py-3 text-sm bg-primmary hover:bg-primary-dull
              transition rounded-md font-medium cursor-pointer active:scale-95'>Buy Tickets</a>

            <button onClick={handleFavorite} className='bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95'>
              <Heart className={`w-5 h-5 ${favoriteMovies.find(movie => movie._id === id) ? 'fill-primmary text-primmary' : ""}`} />
            </button>
          </div>
        </div>
      </div>

      <div className='mt-20'>
        <p>Movie Casts</p>
        <div className='flex items-center gap-4 w-max px-4 my-5'>
          {movie.casts?.slice(0, 12).map((cast, index) => (
            <div key={index} className='flex flex-col items-center text-center'>
              <img src={IMAGE_URL + cast.profile_path} alt='profile-img' className='rounded-full h-20 md:h-20 aspect-square object-cover' />
              <p className='font-medium text-xs mt-3'>{cast.name}</p>
            </div>
          ))}
        </div>
      </div>

      <DateSelect dateTime={dateTime} id={id} />

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
  );
}

export default MovieDetails
