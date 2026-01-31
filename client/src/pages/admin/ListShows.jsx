import React, { useEffect, useState } from 'react'
import Title from "../../components/admin/Title";
import { dummyShowsData } from '../../assets/assets';
import { dateFormat } from "../../lib/dateFormat";
import { useAppContext } from '../../context/AppContext';
import { apiRequest } from '../../lib/api';

const ListShows = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const { getToken, user } = useAppContext();

  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getShowDetails();
    }
  }, [user]);

  const getShowDetails = async () => {
    const token = await getToken();
    try {
      const data = await apiRequest("/api/admin/all-shows", token);
      setShows(data.shows);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching show details:", error);
      toast.error(error.message || "Failed to fetch show details");
    }
  }
  console.log(shows);

  return loading ? <h1>Loading...</h1> : (
    <>

      <Title text1="List" text2="Show" />

      <div className='max-w-4xl mt-6 overflow-x-auto'>
        <table className='w-full border-collapse rounded-md overflow-hidden text-nowrap'>
          <thead>
            <tr className='bg-primmary/20 text-left text-white'>
              <th className='p-2 font-medium pl-5'>Movie Name</th>
              <th className='p-2 font-medium pl-5'>Show Time</th>
              <th className='p-2 font-medium pl-5'>Total Bookings</th>
              <th className='p-2 font-medium pl-5'>Earnings</th>
            </tr>
          </thead>
          <tbody className='text-sm font-light'>
            {shows.map((show) => (
              <tr className='border-b border-primmary/10 bg-primmary/5 even:bg-primmary/10'>
                <td className='p-2 min-w-45 pl-5'>{show.movie.title}</td>
                <td>{dateFormat(show.showDateTime)}</td>
                <td>{Object.keys(show.occupiedSeats).length}</td>
                <td>{currency} {Object.keys(show.occupiedSeats).length * show.showPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>

    </>
  )
}

export default ListShows
