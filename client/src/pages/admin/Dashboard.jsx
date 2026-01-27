import React, { useState, useEffect } from 'react'
import { dummyDashboardData } from '../../assets/assets';
import { ChartLineIcon, CircleDollarSignIcon, PlayCircleIcon, StarIcon, UsersIcon } from 'lucide-react';
import Title from '../../components/admin/Title';
import { dateFormat } from '../../lib/dateFormat';

const Dashboard = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalUser: 0,
    activeShows: [],
  })

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardData();
  }, []);

  const getDashboardData = async () => {
    setDashboardData(dummyDashboardData);
    setLoading(false);
  }

  const dashboardFeed = [
    { name: "Total Bookings", value: dashboardData.totalBookings || 0, icon: ChartLineIcon },
    { name: "Total Revenue", value: currency + dashboardData.totalRevenue || 0, icon: CircleDollarSignIcon },
    { name: "Total Users", value: dashboardData.totalUser || 0, icon: UsersIcon },
    { name: "Active Shows", value: dashboardData.activeShows.length || 0, icon: PlayCircleIcon }
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
        {dashboardData.activeShows.map((show) => (
          <div className='w-4xl w-55 rounded-lg h-full pb-3 bg-primmary/10 boder border-primmary/20 hover:translate-y-1 translation duration-300 overflow-hidden'>
            <img alt='img' src={show.movie.poster_path} className='h-60 w-full object-cover' />
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
