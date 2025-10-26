//@ts-nocheck
"use client";

import React, { useEffect } from "react";
import Lottie from "lottie-react";
import { motion } from "framer-motion";
import catLoading from "../public/cat-loading.json";

const sound_path = "/cat_song.mp3";

const LoadingOverlay = () => {
  useEffect(() => {
    const audio = new Audio(sound_path);
    audio.play().catch((error) => {
      console.log(
        "Autoplay was prevented. User interaction may be required.",
        error
      );
    });

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  return (
    <div className="h-screen w-full bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100 overflow-hidden relative flex justify-center items-center">
      <motion.div
        className="w-40 sm:w-56 md:w-64 lg:w-72 xl:w-80"
        animate={{ y: [0, -10, 0], rotate: [0, 1, -1, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Lottie animationData={catLoading} loop autoplay />
      </motion.div>
    </div>
  );
};

export default LoadingOverlay;
