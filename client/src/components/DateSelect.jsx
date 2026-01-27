import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const DateSelect = ({dateTime, id}) => {
    const [selected, setSelected] = useState(null);
    const navigate = useNavigate();

    const onBookHandler = () => {
        if(!selected){
            return toast("Please select a date");
        }
        navigate(`/movies/${id}/${selected}`);
        scrollTo(0, 0);
    }
  return (
    <div id='dateSelect' className='pt-30'>
      <div className='px-5 py-5 flex flex-col md:flex-row items-center justify-between bg-primmary/10 border border-primmary/20 rounded-lg'>
        <div className=''>
            <p className='text-lg font-semibold'>Choose Date</p>
            <div className='flex gap-6 text-sm mt-5'>
                <ChevronLeftIcon width={28} />
                <span className='grid grid-cols-3 md:flex flex-wrap md:max-w-lg gap-4'>{Object.keys(dateTime).map((date, index) => (
                    <button key={index} onClick={() => setSelected(date)} className={`flex flex-col items-center justify-center h-14 w-14 rounded cursor-pointer ${selected===date ? "bg-primmary text-white" : "border border-primmary/70"}`}>
                        <span>{new Date(date).getDate()}</span>
                        <span>{new Date(date).toLocaleDateString("en-US", 
                            {month: "short"})}</span>
                    </button>
                ))}</span>
                <ChevronRightIcon width={28} />
            </div>
        </div>
        
        <button onClick={onBookHandler} className='bg-primmary text-white px-8 py-2 mt-6 rounded hover:bg-primmary/90
        transition-all cursor-pointer'>Book Now</button>
      </div>
    </div>
  )
}

export default DateSelect
