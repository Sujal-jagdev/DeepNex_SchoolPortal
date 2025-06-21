import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const VideoSection = () => {
  const videoRef = useRef(null);
  const textRef = useRef(null);
  const textRef2 = useRef(null);
  const containerRef = useRef(null);

  gsap.registerPlugin(ScrollTrigger);

  useGSAP(() => {
    // 🔹 Pin the video container (sticky effect)
    ScrollTrigger.create({
      trigger: videoRef.current,
      start: "top top",
      end: "+=3000", // Adjust based on content length
      pin: true,
      pinSpacing: false,
    });

    // 🔹 Your original video zoom animation (unchanged)
    gsap.to(videoRef.current, {
      scale: 1.2,
      y: -50,
      scrollTrigger: {
        trigger: videoRef.current,
        scrub: 2,
        start: "top 20%",
        end: "+=1000",
      }
    });

    // 🔹 Your original text animations (unchanged)
    gsap.to(textRef.current, {
      y: -1000,
      opacity: 0,
      scrollTrigger: {
        trigger: textRef.current,
        scrub: 2,
        start: "top 60%",
      }
    });

    gsap.to(textRef2.current, {
      y: -1000,
      scrollTrigger: {
        trigger: textRef2.current,
        scrub: 2,
      }
    });
  });

  return (
    <div ref={containerRef} className="relative h-[200vh] overflow-hidden mt-5">
      
      {/* 🔹 Your original video (just made sticky) */}
      <video
        ref={videoRef}
        className="absolute top-0 left-[3%] w-[210vh] h-full object-cover rounded-xl"
        src="https://web.meetcleo.com/assets/videos/temp/finger_scrolling_hd30.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      {/* 🔹 First Text (slightly improved design) */}
      <div ref={textRef} className="relative z-10 flex items-center pl-[100px] h-screen">
        <h1 className="text-7xl text-white font-bold">
          Money talks. <br /> Cleo talks back.
        </h1>
      </div>

      {/* 🔹 Second Text (better spacing & button) */}
      <div ref={textRef2} className="relative z-10 mt-[-200px] text-white ps-[500px]">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-5xl font-semibold text-center mb-6">Why Cleo?</h2>
          <p className="text-xl text-gray-200 text-center">
            She helps you budget, save, and understand your money in a fun and smart way.
          </p>
          <div className="flex justify-center mt-10">
            <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-all">
              Get Started with Cleo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoSection;