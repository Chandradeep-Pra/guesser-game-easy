"use client";
import { motion } from "framer-motion";
import { useState } from "react";

export default function QuirkyButton() {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, rotate: 2 }}
      whileTap={{ scale: 0.97, rotate: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="relative group bg-gradient-to-r from-pink-500 to-yellow-400 text-white font-semibold px-8 py-3 rounded-2xl shadow-lg hover:shadow-pink-300 transition-all duration-300 cursor-none select-none border border-pink-200 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Inner Content */}
      <div className="relative flex h-10 flex-col items-center justify-center space-y-1 pointer-events-none">
        <h3 className="text-2xl font-bold">Let’s Go 🎮</h3>

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-white opacity-10"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Animated Pointer */}
      {hovered && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            left: cursorPos.x,
            top: cursorPos.y,
            translateX: "-50%",
            translateY: "-50%",
          }}
          animate={{
            scale: [0.8, 1, 0.8],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-pink-600 drop-shadow-md"
          >
            <motion.path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="currentColor"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
}
