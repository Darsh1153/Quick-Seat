import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useParams } from 'react-router-dom';

const Loading = () => {

  const { nextUrl } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Processing payment...');

  useEffect(() => {
    if(!nextUrl) return;

    // If coming from payment (has session_id), give webhooks time to process
    const sessionId = searchParams.get('session_id');
    const waitTime = sessionId ? 4000 : 2000; // 4 seconds if from payment, 2 seconds otherwise
    
    if (sessionId) {
      setMessage('Processing your payment...');
      
      // Update message after 2 seconds
      const messageTimer = setTimeout(() => {
        setMessage('Almost done, syncing your booking...');
      }, 2000);
      
      const navigateTimer = setTimeout(() => {
        // Pass the session_id to the next page
        navigate(`/${nextUrl}?payment_success=true`);
      }, waitTime);
      
      return () => {
        clearTimeout(messageTimer);
        clearTimeout(navigateTimer);
      };
    } else {
      const timer = setTimeout(() => {
        navigate("/" + nextUrl);
      }, waitTime);
      
      return () => clearTimeout(timer);
    }
  }, [nextUrl, navigate, searchParams]);

  return (
    <div className='flex flex-col justify-center items-center h-[80vh] gap-4'>
        <div className='animate-spin rounded-full h-14 w-14 border-2 border-t-primmary'></div>
        <p className='text-gray-400 text-sm'>{message}</p>
    </div>
  )
}

export default Loading
