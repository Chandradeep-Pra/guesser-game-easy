//@ts-nocheck
"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import ResultScreen from "./ResultScreen";

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

const variants = {
  enter: { x: "100%", opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: "-100%", opacity: 0 },
};

const QuizScreen = ({
  questionsData = [],
  onNext,
  score,
  setScore,
  quizComplete,
  setQuizComplete,
  setScreen,
}) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [timer, setTimer] = useState(30);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  const question = questionsData[currentQ];

  useEffect(() => {
    if (quizComplete) return;
    if (timer === 0) {
      handleNext();
      return;
    }
    const countdown = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(countdown);
  }, [timer, quizComplete]);

  const handleOptionSelect = (opt) => {
    if (isAnswerRevealed) return;
    setSelectedOption(opt);
    setIsAnswerRevealed(true);

    if (opt === question.correctAnswer) {
      setScore((prev) => prev + 1);
    }

    setTimeout(() => {
      handleNext();
      setSelectedOption(null);
      setIsAnswerRevealed(false);
    }, 1000);
  };

  const handleNext = () => {
    if (currentQ < questionsData.length - 1) {
      setCurrentQ((prev) => prev + 1);
      setTimer(30);
    } else {
      setQuizComplete(true);
    }
  };

  if (quizComplete) {
    return (
      <motion.div
        key="result"
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="absolute inset-0"
      >
        <ResultScreen
          score={score}
          total={questionsData.length}
          onRestart={() => setScreen("one")}
        />
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100 p-4 md:p-6 overflow-auto">
      {/* Sidebar */}
      <div className="flex flex-row md:flex-col justify-center items-center md:w-20 w-full mb-4 md:mb-0 gap-2 md:gap-3">
        {questionsData.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: i === currentQ ? 1.2 : 1,
              backgroundColor: i === currentQ ? "#ec4899" : "#e5e7eb",
              color: i === currentQ ? "#fff" : "#374151",
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full font-semibold cursor-pointer transition"
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
      <div className="flex flex-col flex-1 items-center justify-start md:justify-center space-y-4 md:space-y-8 relative">
        {/* Timer bubble */}
        <motion.div
          key={timer}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
          className="absolute top-2 md:top-6 right-4 md:right-10 w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-pink-400 to-yellow-400 flex items-center justify-center text-white font-bold text-sm md:text-xl shadow-lg"
        >
          {timer}s
        </motion.div>

        {/* Quiz Image */}
        <motion.div
          key={question?.questionText}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-md sm:max-w-lg md:max-w-xl h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden shadow-xl"
        >
          {question?.imageUrl ? (
            <Image
              src={question.imageUrl}
              alt={question?.questionText || "Quiz image"}
              fill
              className="object-cover object-center rounded-2xl"
              priority
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center text-2xl sm:text-3xl md:text-4xl font-bold text-white rounded-2xl ${
                COLORS[currentQ % COLORS.length]
              }`}
            >
              {question?.imageSearchQuery || `Image ${currentQ + 1}`}
            </div>
          )}
        </motion.div>

        {/* Question text */}
        <h2 className="text-sm sm:text-base md:text-lg text-gray-700 text-center max-w-full md:max-w-2xl px-2">
          {question?.questionText}
        </h2>

        {/* Options */}
        <div className="flex flex-wrap gap-2 sm:gap-4 justify-center w-full">
          {question?.options?.map((opt) => {
            let bgColor = "bg-white/70 hover:bg-white";
            if (isAnswerRevealed && selectedOption === opt) {
              bgColor =
                opt === question.correctAnswer
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white";
            } else if (
              isAnswerRevealed &&
              opt === question.correctAnswer &&
              selectedOption !== opt
            ) {
              bgColor = "bg-green-500 text-white";
            }

            return (
              <motion.button
                key={opt}
                whileHover={{ scale: !isAnswerRevealed ? 1.05 : 1 }}
                whileTap={{ scale: !isAnswerRevealed ? 0.95 : 1 }}
                disabled={isAnswerRevealed}
                onClick={() => handleOptionSelect(opt)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base md:text-lg font-semibold shadow-md backdrop-blur-sm transition ${bgColor}`}
              >
                {opt}
              </motion.button>
            );
          })}
        </div>

        {/* Progress text */}
        <div className="text-gray-500 text-xs sm:text-sm mt-2 md:mt-4">
          Question {currentQ + 1} / {questionsData.length}
        </div>
      </div>
    </div>
  );
};

export default QuizScreen;
