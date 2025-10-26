"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const COLORS = [
  "bg-pink-300",
  "bg-blue-300",
  "bg-yellow-300",
  "bg-green-300",
  "bg-purple-300",
  "bg-orange-300",
  "bg-teal-300",
  "bg-rose-300",
  "bg-lime-300",
  "bg-sky-300",
];

const QuizScreen = ({ questionsData = [] , onNext}) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [timer, setTimer] = useState(30);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const question = questionsData[currentQ];

  // countdown logic
  useEffect(() => {
    if (isComplete) return;
    if (timer === 0) {
      handleNext();
      return;
    }
    const countdown = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(countdown);
  }, [timer, isComplete]);

  const handleOptionSelect = (opt) => {
    if (opt === question.correctAnswer) {
      setScore((prev) => prev + 1);
    }
    handleNext();
  };

  const handleNext = () => {
    if (currentQ < questionsData.length - 1) {
      setCurrentQ((prev) => prev + 1);
      setTimer(30);
    } else {
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setTimer(30);
    setScore(0);
    setIsComplete(false);
  };

  if (isComplete) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h1 className="text-4xl font-bold text-gray-700 mb-4">Quiz Complete 🎉</h1>
        <p className="text-xl mb-6">
          Your Score: <span className="font-semibold">{score}</span> / {questionsData.length}
        </p>
        <button
          onClick={handleRestart}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-yellow-400 text-white rounded-full shadow-lg hover:scale-105 transition"
        >
          Restart 🔁
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100 p-4">
      {/* Left sidebar - question numbers */}
      <div className="flex flex-col justify-center items-center w-20">
        {questionsData.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: i === currentQ ? 1.2 : 1,
              backgroundColor: i === currentQ ? "#ec4899" : "#e5e7eb",
              color: i === currentQ ? "#fff" : "#374151",
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full font-semibold mb-3 cursor-pointer transition"
            onClick={() => {
              setCurrentQ(i);
              setTimer(30);
            }}
          >
            {i + 1}
          </motion.div>
        ))}
      </div>

      {/* Main quiz area */}
      <div className="flex flex-col flex-1 items-center justify-center space-y-8 relative">
        {/* Timer bubble */}
        <motion.div
          key={timer}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
          className="absolute top-6 right-10 w-16 h-16 rounded-full bg-gradient-to-r from-pink-400 to-yellow-400 flex items-center justify-center text-white font-bold text-xl shadow-lg"
        >
          {timer}s
        </motion.div>

        {/* Image placeholder */}
        <motion.div
          key={question?.questionText}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.5 }}
          className={`w-[70%] h-[300px] rounded-2xl shadow-xl ${
            COLORS[currentQ % COLORS.length]
          } flex items-center justify-center text-3xl font-bold text-white`}
        >
          {question?.imageSearchQuery || `Image ${currentQ + 1}`}
        </motion.div>

        {/* Question text */}
        <h2 className="text-2xl text-gray-700 text-center max-w-2xl">
          {question?.questionText}
        </h2>

        {/* Options */}
        <div className="flex flex-wrap gap-4 justify-center">
          {question?.options?.map((opt) => (
            <motion.button
              key={opt}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleOptionSelect(opt)}
              className="px-6 py-3 rounded-full text-lg font-semibold bg-white/70 hover:bg-white shadow-md backdrop-blur-sm transition"
            >
              {opt}
            </motion.button>
          ))}
        </div>

        {/* Progress text */}
        <div className="text-gray-500 text-sm mt-4">
          Question {currentQ + 1} / {questionsData.length}
        </div>
      </div>
    </div>
  );
};

export default QuizScreen;
