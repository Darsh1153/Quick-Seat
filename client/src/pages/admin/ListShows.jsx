import React, { useEffect, useState } from 'react'
import Title from "../../components/admin/Title";
import { dummyShowsData } from '../../assets/assets';
import {dateFormat} from "../../lib/dateFormat";

const ListShows = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShowDetails();
  }, []);

  const getShowDetails = async () => {
    setShows([{
      movie: dummyShowsData[0],
      showDateTime: "2025-06-20T16:00:00.000Z",
      showPrice: 59,
      occupiedSeats: {
        A1: "user_1",
        B1: "user_2",
        C1: "user_3",
      }
    }]);
    setLoading(false);
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
