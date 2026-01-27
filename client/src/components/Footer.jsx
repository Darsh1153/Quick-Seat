import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div class='mt-100 max-w-7xl mx-auto'>

      <div class="flex flex-wrap justify-between gap-y-12 lg:gap-x-8">

        <div class="w-full md:w-[45%] lg:w-[35%] flex flex-col items-center md:items-start text-center md:text-left">
          <img src={assets.logo} alt='logo' />
          <div class='w-full max-w-52 h-px mt-8 bg-linear-to-r from-black via-white/25 to-black'></div>
          <p class='text-sm text-white/60 mt-6 max-w-sm leading-relaxed'>
            Easily find movies, showtimes, and theaters, browse trailers, select seats from interactive layouts, get offers, and book tickets securely on the go, ditching queues for digital confirmation
          </p>
        </div>

        <div class="w-full md:w-[45%] lg:w-[15%] flex flex-col items-center md:items-start text-center md:text-left">
          <h3 class='text-sm text-white font-medium'>Important Links</h3>
          <div class="flex flex-col gap-2 mt-6">
            <a href="/" class='text-sm text-white/60 hover:text-white transition-colors'>Home</a>
            <a href="/movies" class='text-sm text-white/60 hover:text-white transition-colors'>Movies</a>
            <a href="/movies/:id" class='text-sm text-white/60 hover:text-white transition-colors'>Theatres</a>
            <a href="/release" class='text-sm text-white/60 hover:text-white transition-colors'>Releases</a>
            <a href="/favorites" class='text-sm text-white/60 hover:text-white transition-colors'>Favorites</a>
          </div>
        </div>

        <div class="w-full md:w-[45%] lg:w-[25%] flex flex-col items-center md:items-start text-center md:text-left">
          <h3 class='text-sm text-white font-medium'>Subscribe for news</h3>
          <div class="flex items-center border gap-2 border-white/20 h-13 max-w-80 w-full rounded-full overflow-hidden mt-4">
            <input type="email" placeholder="Enter your email.." class="w-full h-full pl-6 outline-none text-sm bg-transparent text-white placeholder-white/60 placeholder:text-xs" required />
            <button type="submit" class="bg-linear-to-b from-[#5623D8] to-[#7B53E2] active:scale-95 transition w-56 h-10 rounded-full text-sm text-white cursor-pointer mr-1.5">Subscribe</button>
          </div>
        </div>

      </div>

      <div class='w-full h-px mt-16 mb-4 bg-linear-to-r from-black via-white/25 to-black'></div>

      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <p class='text-xs text-white/60'>© 2026 QuickSeat</p>
        <div class="flex items-center gap-6">
          <a href='#' class='text-xs text-white/60 hover:text-white transition-colors'>Terms & Conditions</a>
          <div class='w-px h-4 bg-white/20'></div>
          <a href='#' class='text-xs text-white/60 hover:text-white transition-colors'>Privacy Policy</a>
        </div>
      </div>
    </div>
  )
}

export default Footer
