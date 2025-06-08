import React, { useState } from "react";
import { Leaf, Sprout, Sun, ArrowRight, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage, languages } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

export default function Landing() {
  const [buttonHovered, setButtonHovered] = useState(false);
  const { currentLanguage, setCurrentLanguage } = useLanguage();
  const nav = useNavigate();

  // Translate the text content
  const title = useTranslation("PROJECT_TITLE");
  const subtitle = useTranslation("Cultivate your urban oasis with AI-powered plant care");
  const description = useTranslation("Transform any space into a thriving garden with personalized guidance, plant diagnosis, and smart growing tips.");
  const startGrowing = useTranslation("Start Growing Today");
  const joinText = useTranslation("Join thousands of urban gardeners • Free to get started");
  const features = {
    diagnosis: useTranslation("Smart Diagnosis"),
    tracking: useTranslation("Growth Tracking"),
    reminders: useTranslation("Care Reminders")
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.15,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const slideUpVariants = {
    hidden: { y: 60, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const logoVariants = {
    hidden: { scale: 0.6, opacity: 0, rotate: -10 },
    visible: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        mass: 1.2,
      },
    },
  };

  const titleVariants = {
    hidden: { y: 40, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const pillVariants = {
    hidden: { y: 30, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 12,
        mass: 0.8,
      },
    },
  };

  const buttonVariants = {
    hidden: { y: 40, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.2,
      },
    },
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-white">
      {/* Language Selector */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="absolute top-6 right-6 z-20"
      >
        <div className="relative group">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-green-100 hover:border-green-200 transition-all duration-300"
            onClick={() => document.getElementById('language-selector').classList.toggle('hidden')}
          >
            <Globe className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-medium">{languages[currentLanguage].name}</span>
          </button>
          
          <div
            id="language-selector"
            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-green-100 hidden group-hover:block hover:block"
          >
            {Object.entries(languages).map(([code, { name }]) => (
              <button
                key={code}
                onClick={() => {
                  setCurrentLanguage(code);
                  document.getElementById('language-selector').classList.add('hidden');
                }}
                className={`w-full px-4 py-2 text-left hover:bg-green-50 transition-colors ${
                  currentLanguage === code ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'
                } ${code === 'en' ? 'rounded-t-xl' : ''} ${code === 'kn' ? 'rounded-b-xl' : ''}`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="relative z-10 flex flex-col items-center justify-center h-full max-w-5xl mx-auto px-6 text-center select-none"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={logoVariants}
          className="relative mb-8 cursor-pointer"
          whileHover={{
            scale: 1.1,
            rotate: 5,
            transition: {
              type: "spring",
              stiffness: 200,
              damping: 10,
            },
          }}
          animate={{
            y: [0, -8, 0],
            transition: {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            },
          }}
        >
          <motion.div
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center shadow-lg border-4 border-white mx-auto"
            whileHover={{
              boxShadow: "0 20px 40px rgba(46, 125, 50, 0.2)",
              borderColor: "#66BB6A",
            }}
          >
            <motion.div
              whileHover={{ rotate: 15 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Leaf className="w-10 h-10 text-green-700" />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.h1
          variants={titleVariants}
          className="text-6xl md:text-7xl font-extrabold text-green-800 tracking-tight cursor-default mb-6"
          whileHover={{
            scale: 1.03,
            textShadow: "0 10px 30px rgba(46, 125, 50, 0.3)",
            transition: { duration: 0.3 },
          }}
        >
          {title}
        </motion.h1>

        <motion.p
          variants={slideUpVariants}
          className="max-w-3xl mx-auto text-lg md:text-2xl text-gray-700 leading-relaxed mb-4"
        >
          {subtitle}
        </motion.p>

        <motion.p
          variants={slideUpVariants}
          className="max-w-2xl mx-auto text-base md:text-lg text-gray-500 mb-12"
        >
          {description}
        </motion.p>

        <motion.div
          className="flex flex-wrap justify-center gap-6 mb-12"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
              },
            },
          }}
        >
          {[
            { icon: Sprout, label: features.diagnosis },
            { icon: Sun, label: features.tracking },
            { icon: Leaf, label: features.reminders },
          ].map(({ icon: Icon, label }) => (
            <motion.div
              key={label}
              variants={pillVariants}
              whileHover={{
                scale: 1.05,
                y: -5,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 15,
                },
              }}
              whileTap={{ scale: 0.98 }}
              className="group cursor-pointer"
            >
              <motion.div
                className="flex items-center gap-2 bg-green-50 px-5 py-3 rounded-full border border-green-200"
                whileHover={{
                  backgroundColor: "#f0fdf4",
                  borderColor: "#86efac",
                  boxShadow: "0 10px 25px rgba(46, 125, 50, 0.15)",
                }}
              >
                <motion.div
                  whileHover={{
                    scale: 1.2,
                    rotate: 10,
                    transition: { type: "spring", stiffness: 300 },
                  }}
                >
                  <Icon className="w-5 h-5 text-green-600" />
                </motion.div>
                <span className="text-green-700 font-semibold text-sm md:text-base">
                  {label}
                </span>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <motion.button
          variants={buttonVariants}
          whileHover={{
            scale: 1.05,
            y: -3,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 15,
            },
          }}
          whileTap={{
            scale: 0.98,
            transition: { duration: 0.1 },
          }}
          className="group relative bg-green-700 hover:bg-green-800 text-white font-semibold py-4 px-10 rounded-full text-lg md:text-xl shadow-xl mb-8 overflow-hidden"
          onHoverStart={() => setButtonHovered(true)}
          onHoverEnd={() => setButtonHovered(false)}
        >
          <motion.span
            onClick={() => nav("/auth")}
            className="flex items-center gap-3 relative z-10"
            whileHover={{
              x: 2,
              transition: { type: "spring", stiffness: 200 },
            }}
          >
            {startGrowing}
            <motion.div
              animate={{
                x: buttonHovered ? 8 : 0,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 15,
                },
              }}
            >
              <ArrowRight className="w-6 h-6" />
            </motion.div>
          </motion.span>

          <motion.div
            className="absolute inset-0 bg-green-600 rounded-full blur-xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: buttonHovered ? 0.4 : 0,
              scale: buttonHovered ? 1.1 : 0.8,
              transition: { duration: 0.3 },
            }}
          />

          <motion.div
            className="absolute inset-0 bg-green-600 rounded-full"
            initial={{ opacity: 0 }}
            whileHover={{
              opacity: 0.1,
              transition: { duration: 0.2 },
            }}
          />
        </motion.button>

        <motion.p
          variants={slideUpVariants}
          className="text-sm text-gray-400"
        >
          {joinText}
        </motion.p>
      </motion.div>

      {/* Floating Decorative Circles */}
      <motion.div
        className="absolute top-24 left-10 w-20 h-20 bg-green-100 rounded-full opacity-50"
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: 0.5,
          scale: 1,
          y: [0, -12, 0],
          transition: {
            scale: { delay: 1.5, duration: 0.8, type: "spring" },
            opacity: { delay: 1.5, duration: 0.8 },
            y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 },
          },
        }}
      />

      <motion.div
        className="absolute bottom-24 right-10 w-14 h-14 bg-yellow-100 rounded-full opacity-40"
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: 0.4,
          scale: 1,
          y: [0, -10, 0],
          transition: {
            scale: { delay: 1.8, duration: 0.8, type: "spring" },
            opacity: { delay: 1.8, duration: 0.8 },
            y: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2.5 },
          },
        }}
      />

      <motion.div
        className="absolute top-1/2 left-8 w-10 h-10 bg-green-200 rounded-full opacity-30"
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: 0.3,
          scale: 1,
          y: [0, -8, 0],
          transition: {
            scale: { delay: 2.1, duration: 0.8, type: "spring" },
            opacity: { delay: 2.1, duration: 0.8 },
            y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 3 },
          },
        }}
      />

      <motion.div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-green-50"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 0.2,
          transition: {
            duration: 2,
            ease: "easeOut",
            delay: 1,
          },
        }}
      />
    </div>
  );
}
