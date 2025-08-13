import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react';

const messages = [
  "Striving to be the best version of myself",
  "One step at a time, every day",
  "Progress over perfection",
  "Consistency is my superpower",
  "Turning intention into action",
  "Small habits, big impact",
  "Doing what my future self will thank me for",
  "Focused, committed, improving",
  "Discipline fuels growth",
  "Refuse to stay the same"
];

function Hero() {

  const [motivationalMessage, setMotivationalMessage] = useState("");

  useEffect(() => {
    const msg = messages[Math.floor(Math.random() * messages.length)];
    setMotivationalMessage(msg);
  }, []);

  const { data: session } = useSession()

  const date = new Date();

  const parts = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  }).formatToParts(date);

  const weekday = parts.find(p => p.type === 'weekday')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const year = parts.find(p => p.type === 'year')?.value;

  const formattedDate = `${weekday}, ${month} ${day}, ${year}`;

  return (
    <div className='flex justify-start flex-col gap-2  xl:mt-0.5 md:mt-2 mt-0.5'>

      <div className='flex items-center gap-1.5'>
        {session && <h1 className='flex items-center gap-1 text-2xl font-semibold dark:text-[#f8fafc]'>Hi, {session?.user?.username}  <img width={35} src="hand.png" alt="" /></h1>

        }
      </div>
      <p className='text-gray-600 text-lg dark:text-[#94a3b8]'>{formattedDate}</p>

      <p>{motivationalMessage}</p>
    </div>
  )
}

export default Hero
