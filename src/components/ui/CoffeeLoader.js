import React from 'react';
import { motion } from 'framer-motion';
import { Spin } from 'antd';

const CoffeeLoader = ({ size = 40, color = '#8B4513' }) => {
  const steamVariants1 = {
    initial: { opacity: 0, y: 0 },
    animate: {
      opacity: [0, 1, 0],
      y: [0, -5, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const steamVariants2 = {
    initial: { opacity: 0, y: 0 },
    animate: {
      opacity: [0, 1, 0],
      y: [0, -5, 0],
      transition: {
        duration: 3,
        delay: 0.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const cupVariants = {
    initial: { y: 0 },
    animate: {
      y: [-2, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="flex items-center justify-center">
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="overflow-visible"
      >
        <motion.g
          variants={cupVariants}
          initial="initial"
          animate="animate"
        >
          <path
            d="M25 40 H75 Q85 40 85 50 V70 Q85 80 75 80 H25 Q15 80 15 70 V50 Q15 40 25 40"
            fill={color}
          />
          <path
            d="M80 55 Q90 55 90 62.5 Q90 70 80 70"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M25 45 H75"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            opacity={0.5}
          />
        </motion.g>

        <motion.path
          d="M40 20 Q45 15 50 20 Q55 25 60 20"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          variants={steamVariants1}
          initial="initial"
          animate="animate"
        />
        <motion.path
          d="M45 10 Q50 5 55 10"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          variants={steamVariants2}
          initial="initial"
          animate="animate"
        />
      </motion.svg>
    </div>
  );
};

const FullScreenLoader = ({ size = 80, color = '#8B4513' }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 9999,
      }}
    >
      <CoffeeLoader size={size} color={color} />
    </div>
  );
};

const TableLoader = ({ loading, children }) => {
    return (
      <div className="relative min-h-[200px]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <Spin indicator={<CoffeeLoader size={40} />} />
          </div>
        )}
        {children}
      </div>
    );
  };

export { CoffeeLoader, FullScreenLoader, TableLoader  };