import React from 'react';
import { motion } from 'framer-motion';

const CoffeeLoader = ({
  size = 60,
  cupColor = '#B5651D',
  steamColor = '#D2B48C',
  saucerColor = '#A0522D',
}) => {
  const steamAnimations = [
    { key: 0, delay: 0 },
    { key: 1, delay: 0.2 },
    { key: 2, delay: 0.4 }
  ];

  const createSteamVariants = (index) => ({
    initial: { 
      opacity: 0, 
      y: 0,
      x: (index - 1) * 6 
    },
    animate: { 
      opacity: [0, 1, 0],
      y: [0, -50], // Changed to move upwards
      x: [(index - 1) * 6, (index - 1) * 6 + 2, (index - 1) * 6 - 2, (index - 1) * 6],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        delay: index * 0.2,
        ease: "easeInOut"
      }
    }
  });

  const cupVariants = {
    initial: { y: 0 },
    animate: {
      y: [-2, 2],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  };

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100"
    >
      {/* Saucer */}
      <ellipse
        cx="50"
        cy="85"
        rx="35"
        ry="6"
        fill={saucerColor}
        opacity={0.6}
      />

      {/* Cup */}
      <motion.g
        variants={cupVariants}
        initial="initial"
        animate="animate"
      >
        <path
          d="M30 35 Q25 50 30 70 H70 Q75 50 70 35 Z"
          fill={cupColor}
        />
        <path
          d="M30 35 Q50 25 70 35"
          fill={cupColor}
          stroke={cupColor}
          strokeWidth="1"
        />
        {/* Cup Base */}
        <rect
          x="35"
          y="70"
          width="30"
          height="5"
          fill={cupColor}
        />

        {/* Handle */}
        <path
          d="M70 40 Q85 50 70 60"
          stroke={cupColor}
          strokeWidth="3"
          fill="none"
        />
      </motion.g>

      {/* Steam */}
      {steamAnimations.map((steam, index) => (
        <motion.path
          key={steam.key}
          d="M50 30 Q52 25 48 10 Q55 8 58 15"
          fill="none"
          stroke={steamColor}
          strokeWidth="2"
          strokeLinecap="round"
          variants={createSteamVariants(index)}
          initial="initial"
          animate="animate"
        />
      ))}
    </svg>
  );
};

export { CoffeeLoader };