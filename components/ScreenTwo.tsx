//@ts-nocheck
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import exploreAnim from "../public/cat-waiting.json";

type ScreenTwoProps = {
  onNext: (payload: { category: string; countries: string[] }) => void;
};

const ScreenTwo = ({ onNext }: ScreenTwoProps) => {
  const [category, setCategory] = useState("");
  const [countries, setCountries] = useState<string[]>([]);

  const handleCountrySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setCountries(selected);
  };

  const handleSubmit = async () => {
    if (!category || countries.length === 0) {
      alert("Pick something quirky!");
      return;
    }
    const payload = { category, countries };
    onNext(payload);
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center relative overflow-hidden w-full h-full px-4 sm:px-6 md:px-10"
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "-100%", opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {/* Background blobs */}
      <motion.div
        className="absolute top-8 left-8 w-32 sm:w-40 md:w-44 h-32 sm:h-40 md:h-44 bg-yellow-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30"
        animate={{ x: [0, 20, 0], y: [0, -30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-8 right-8 w-40 sm:w-52 md:w-56 h-40 sm:h-52 md:h-56 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30"
        animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* Lottie animation */}
      <div className="absolute bottom-0 left-0 w-56 sm:w-72 md:w-96 opacity-80 pointer-events-none select-none">
        <Lottie animationData={exploreAnim} loop autoplay />
      </div>

      {/* Heading */}
      <motion.h2
        className="text-3xl sm:text-4xl md:text-6xl font-lobster text-center bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-400 bg-clip-text text-transparent mb-6"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        Let’s Narrow It Down!
      </motion.h2>

      {/* Form */}
      <div className="flex flex-col items-center space-y-4 w-full max-w-xs sm:max-w-sm md:max-w-md z-10">
        {/* Category input */}
        <input
          type="text"
          placeholder="Enter a category (e.g., Street Food)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-400 outline-none text-gray-700 text-sm sm:text-base md:text-lg"
        />

        {/* Country selector */}
        <div className="w-full flex flex-col items-start font-mono">
          <select
            multiple
            onChange={handleCountrySelect}
            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 text-sm sm:text-base md:text-lg h-24 sm:h-28 md:h-32"
          >
            <option value="India">India</option>
            <option value="Japan">Japan</option>
            <option value="France">France</option>
            <option value="USA">USA</option>
            <option value="Brazil">Brazil</option>
            <option value="Italy">Italy</option>
            <option value="Australia">Australia</option>
          </select>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            💡 Press{" "}
            <span className="font-semibold text-gray-700">Ctrl + Click</span> to
            select multiple countries
          </p>
        </div>

        {/* Selected countries preview */}
        {countries.length > 0 && (
          <motion.div
            className="flex flex-wrap justify-center gap-2 mt-2 w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {countries.map((c) => (
              <motion.span
                key={c}
                whileHover={{ scale: 1.1 }}
                className="px-3 py-1 bg-gradient-to-r from-pink-100 to-yellow-100 text-gray-700 rounded-full text-xs sm:text-sm md:text-base shadow-sm"
              >
                {c}
              </motion.span>
            ))}
          </motion.div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          className="mt-4 bg-gradient-to-r from-pink-500 via-blue-500 to-yellow-400 text-white font-semibold text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-10 py-2 sm:py-3 md:py-4 rounded-full shadow-lg transition hover:scale-105"
        >
          Let’s Go 🚀
        </button>
      </div>
    </motion.div>
  );
};

export default ScreenTwo;
