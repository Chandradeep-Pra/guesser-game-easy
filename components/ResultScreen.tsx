//@ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const messages = [
  "You absolutely crushed it! 🚀",
  "That brain deserves a standing ovation! 🧠👏",
  "Smart and stylish — unbeatable combo 😎",
  "You’ve got the quiz magic touch ✨",
  "Not bad at all, champ! 💪",
];

const getPerformanceMessage = (scoreRatio: number) => {
  if (scoreRatio === 1) return messages[0];
  if (scoreRatio >= 0.8) return messages[1];
  if (scoreRatio >= 0.6) return messages[2];
  if (scoreRatio >= 0.4) return messages[3];
  return messages[4];
};

const floatingEmojis = ["🎉", "✨", "🎊", "🏆", "🥳", "🔥"];

const ResultScreen = ({ score, total, onRestart }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      if (current < score) {
        current++;
        setDisplayScore(current);
      } else clearInterval(interval);
    }, 60);
    return () => clearInterval(interval);
  }, [score]);

  const ratio = score / total;
  const message = getPerformanceMessage(ratio);

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100 overflow-hidden px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Floating emojis background */}
      {floatingEmojis.map((emoji, index) => (
        <motion.div
          key={index}
          className="absolute text-4xl sm:text-5xl md:text-6xl"
          initial={{
            x: Math.random() * window.innerWidth - 100,
            y: "100vh",
            opacity: 0.8,
          }}
          animate={{
            y: [-100, -400, -800],
            opacity: [1, 0.8, 0],
          }}
          transition={{
            duration: 6 + Math.random() * 3,
            repeat: Infinity,
            delay: index * 0.7,
          }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Score Counter */}
      <motion.h1
        className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-pink-600 mb-4 drop-shadow-lg"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        {displayScore} / {total}
      </motion.h1>

      {/* Emoji burst */}
      <motion.div
        className="text-5xl sm:text-6xl md:text-7xl mb-4"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.4, 1] }}
        transition={{ duration: 0.8 }}
      >
        🥳
      </motion.div>

      {/* Dynamic Message */}
      <motion.p
        className="text-lg sm:text-xl md:text-3xl text-gray-700 text-center px-2 sm:px-4 md:px-8 font-semibold mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        {message}
      </motion.p>

      {/* Play Again button */}
      <motion.button
        onClick={onRestart}
        whileHover={{ scale: 1.05, rotate: -2 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-yellow-400 text-white text-base sm:text-lg md:text-xl font-semibold px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-full shadow-xl hover:shadow-2xl transition"
      >
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
        Play Again
      </motion.button>
    </motion.div>
  );
};

export default ResultScreen;
