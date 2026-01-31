import React, { useState, useEffect } from 'react'
import { dummyDashboardData } from '../../assets/assets';
import { ChartLineIcon, CircleDollarSignIcon, PlayCircleIcon, StarIcon, UsersIcon } from 'lucide-react';
import Title from '../../components/admin/Title';
import { dateFormat } from '../../lib/dateFormat';
import { useAppContext } from '../../context/AppContext';
import { apiRequest } from '../../lib/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const { getToken, user, isUserLoaded, IMAGE_URL } = useAppContext();

  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalUser: 0,
    activeShows: [],
  })

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for user data to be loaded before making API calls
    if (!isUserLoaded) {
      return;
    }
    
    if (user) {
      getDashboardData();
    } else {
      setLoading(false);
    }
  }, [user, isUserLoaded]);

  const getDashboardData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Safely get token - handle case where user might not be fully authenticated
      let token;
      try {
        token = await getToken();
        console.log(token);
      } catch (tokenError) {
        console.error("Error getting token:", tokenError);
        // If we can't get token, user might not be authenticated yet
        setLoading(false);
        return;
      }
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      const data = await apiRequest("/api/admin/dashboard", {
        method: 'GET',
      }, token);
      
      if(data.success) {
        // Normalize the response - backend might return activeShow or activeShows
        const normalizedData = {
          ...data.dashboardData,
          activeShows: data.dashboardData.activeShows || data.dashboardData.activeShow || []
        };
        setDashboardData(normalizedData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      const errorMessage = error.message || "Failed to fetch dashboard data";
      // Filter out technical errors like "User is not defined" - don't show them to users
      if (errorMessage && 
          !errorMessage.toLowerCase().includes("user is not defined") && 
          !errorMessage.toLowerCase().includes("user") &&
          !errorMessage.toLowerCase().includes("unauthorized")) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }

  const dashboardFeed = [
    { name: "Total Bookings", value: dashboardData.totalBookings || 0, icon: ChartLineIcon },
    { name: "Total Revenue", value: currency + (dashboardData.totalRevenue || 0), icon: CircleDollarSignIcon },
    { name: "Total Users", value: dashboardData.totalUser || 0, icon: UsersIcon },
    { name: "Active Shows", value: (dashboardData.activeShows || dashboardData.activeShow || []).length, icon: PlayCircleIcon }
  ]

  return loading ? <h1>Loading...</h1> : (
    <>
      <Title text1="Admin" text2="Dashboard" />

      <div className='mt-7 flex flex-wrap gap-4 w-full'>
        {dashboardFeed.map((feed, index) => (
          <div key={index} className='flex items-center justify-between px-4 py-3 max-w-60 w-full bg-primmary/10 border-primmary/20 rounded-lg'>

            <div>
              <h1 className='text-sm'>{feed.name}</h1>
              <p className='text-xl font-medium mt-1'>{feed.value}</p>
            </div>
            <feed.icon className='w-6 h-6' />
          </div>
        ))}
      </div>

      <div className='mt-10 text-lg font-medium'>Active Shows</div>
      <div className='flex flex-wrap gap-6 mt-4 max-w-5xl'>
        {(dashboardData.activeShows || []).map((show) => (
          <div key={show._id || show.movie._id} className='w-4xl w-55 rounded-lg h-full pb-3 bg-primmary/10 boder border-primmary/20 hover:translate-y-1 translation duration-300 overflow-hidden'>
            <img alt='img' src={IMAGE_URL + show.movie.poster_path} className='h-60 w-full object-cover' />
            <p className='font-medium p-2 truncate'>{show.movie.title}</p>
            <div className='flex items-center justify-between px-2'>
              <p className='text-lg font-medium'>{show.showPrice}</p>
              <p className='flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1'>
                <StarIcon className='w-4 h-4 text-primmary fill-primmary' />
                {show.movie.vote_average.toFixed(1)}
              </p>
            </div>
            <p className='px-2 pt-2 text-sm text-gray-500'>{dateFormat(show.showDateTime)}</p>
          </div>
        ))}
      </div>
    </>
  )
}

export default Dashboard
