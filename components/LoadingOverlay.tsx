import React from 'react'
import Lottie from "lottie-react";
import { motion } from "framer-motion";
import catLoading from "../public/cat-loading.json";

const LoadingOverlay = () => {
  return (
    <div className='h-screen w-full bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100 overflow-hidden"'>
      <motion.div
        className="absolute bottom-0 left-0 w-60 sm:w-72"
        animate={{ y: [0, -10, 0], rotate: [0, 1, -1, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Lottie animationData={catLoading} loop autoplay />
      </motion.div>
    </div>
  )
}

export default LoadingOverlay