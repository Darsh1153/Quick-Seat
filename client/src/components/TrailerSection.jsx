import React, { useState } from 'react'
import { dummyTrailers } from '../assets/assets';
import ReactPlayer from "react-player";

const TrailerSection = () => {
    const [trailer, setTrailer] = useState(dummyTrailers[0]);

    return (
        <div className='px-6 md:px-16 lg:px-36 xl:px-44 py-20'>

            <p className="text-gray-300 text-xl">Trailers</p>

            <div className="flex justify-center">
                <div className="w-[960px] h-[540px]">
                    <ReactPlayer
                        url={trailer.videoUrl}
                        controls
                        width="100%"
                        height="100%"
                    />
                </div>
            </div>


        </div>
    )
}

export default TrailerSection
