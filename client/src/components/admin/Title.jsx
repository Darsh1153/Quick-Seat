import React from 'react'

const Title = ({text1, text2}) => {
  return (
    <div className='mt-2'>
      <h1 className='text-2xl'><span>{text1}</span> <span className='underline text-primmary'>{text2}</span></h1>
    </div>
  )
}

export default Title
