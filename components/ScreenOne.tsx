"use client";

import Lottie from "lottie-react";
import { motion } from "framer-motion";
import successAnimation from "../public/cat.json";
import QuirkyButton from "@/components/QuirkyButton";

const ScreenOne = ({ onNext }: { onNext: () => void }) => {
  return (
    <div className="flex flex-col items-center justify-center relative overflow-hidden w-full h-full">
      {/* Floating background blobs */}
      <motion.div
        className="absolute -top-10 -left-10 w-52 h-52 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40"
        animate={{ y: [0, 30, 0], x: [0, 20, 0], rotate: [0, 360, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-52 h-52 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40"
        animate={{ y: [0, -30, 0], x: [0, -20, 0], rotate: [0, -360, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Heading */}
      <motion.h1
        className="text-[90px] sm:text-[120px] font-lobster text-center font-bold bg-gradient-to-r from-pink-400 via-blue-500 to-yellow-400 bg-clip-text text-transparent mb-3 drop-shadow-lg"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        Hii !
      </motion.h1>

      <span className="font-sans text-lg text-gray-700 mb-6 font-semibold font-mono">
        Do you wanna play ?
      </span>

      {/* Quirky Button with next trigger */}
      <div onClick={onNext}>
        <QuirkyButton />
      </div>

      {/* Lottie Animation */}
      <motion.div
        className="absolute bottom-0 left-0 w-60 sm:w-72"
        animate={{ y: [0, -10, 0], rotate: [0, 1, -1, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Lottie animationData={successAnimation} loop autoplay />
      </motion.div>
    </div>
  );
};

export default ScreenOne;
