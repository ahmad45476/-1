import React, { useEffect, useState } from "react";
import logPct from '../assets/log.png'
const images = [
  "https://images.unsplash.com/photo-1737468608320-dfebd11a3ba2?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1682289497815-b1b3805c7359?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1560031475-2ac4fdc8384c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1666185761628-00a3655f4f7b?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1612349314442-72ab9c26cbd8?auto=format&fit=crop&w=1200&q=80",
];

export default function ArtSlideshow() {
  const [current, setCurrent] = useState(0);
  const [previous, setPrevious] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setPrevious(current);
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [current]);

  return (
    <div className="p-10 place-content-center text-center relative bg-black h-screen">
    <div className="   w-[100%]  top-0 left-0 z-0 opacity-80 h-screen absolute bg-contain bg-no-repeat bg-center" style={{backgroundImage:`url(${logPct})`}}>
     </div>
    <div className="relative"><p className=" backdrop-opacity-100 opacity-100 z-30  text-white text-9xl font-Chewy -ml-28 -mt-38 text-shadow-[#ff0b78] text-shadow-2xs"><span className="text-[#ff0a03]" >A</span><span className="text-[#0bb0ff]" >r</span><span className="text-[#ff0b78] text-shadow-yellow-600 text-shadow-2xs ml-2">t</span></p>
    <p className="backdrop-opacity-100 text-white text-9xl font-Chewy ml-42 -mt-10 text-shadow-[#ffd702] text-shadow-2xs"><span className="text-[#ffd702] text-shadow-[#ff0b78] text-shadow-2xs">W</span><span className="text-[#380083]" >a</span><span className="text-[#a3fd03]" >y</span></p>
    </div>
    </div>
  );
}