//@ts-nocheck
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScreenOne from "@/components/ScreenOne";
import ScreenTwo from "@/components/ScreenTwo";
import QuizScreen from "@/components/QuizScreen";
import LoadingOverlay from "@/components/LoadingOverlay";
import ResultScreen from "@/components/ResultScreen";

export default function Home() {
  const [screen, setScreen] = useState<"one" | "two" | "quiz" | "result">(
    "one"
  );
  const [questionsData, setQuestionsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [score, setScore] = useState(0);

  // Animation variants for smooth slide transitions
  const variants = {
    enter: { x: "100%", opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  };

  // Handle transitions from each screen
  const handleNext = async (payload?: {
    category: string;
    countries: string[];
  }) => {
    if (screen === "one") {
      setScreen("two");
    } else if (screen === "two" && payload) {
      setIsLoading(true);
      try {
        // ✅ Keep this logic: API call is done here
        const res = await fetch("/api/new", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to fetch quiz data");

        const data = await res.json();
        const questionsArray = Array.isArray(data) ? data : [data];

        setQuestionsData(questionsArray);
        setScreen("quiz");
      } catch (err) {
        console.error("❌ Error fetching quiz:", err);
        alert("Could not load quiz questions. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else if (screen === "quiz") {
      // setScreen("one");
      setQuestionsData([]);
    }
  };

  return (
    <div className="relative h-screen w-full bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100 overflow-hidden">
      <span className="absolute top-10 left-20 border-2 rounded-2xl border-purple-400 p-2">
        {screen}
      </span>
      <AnimatePresence>{isLoading && <LoadingOverlay />}</AnimatePresence>
      <AnimatePresence mode="wait">
        {screen === "one" && (
          <motion.div
            key="one"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <ScreenOne onNext={handleNext} />
          </motion.div>
        )}

        {screen === "two" && (
          <motion.div
            key="two"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <ScreenTwo onNext={handleNext} />
          </motion.div>
        )}

        {screen === "quiz" && (
          <motion.div
            key="quiz"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <QuizScreen
              questionsData={questionsData}
              onNext={handleNext}
              score={score}
              setScore={setScore}
              quizComplete={quizComplete}
              setQuizComplete={setQuizComplete}
              setScreen={setScreen}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
