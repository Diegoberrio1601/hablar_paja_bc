"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
      <motion.div 
        className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-purple-500/5 rounded-full blur-[100px]"
        animate={{
          x: [0, -40, 0],
          y: [0, 60, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-[10%] left-[20%] w-[30%] h-[30%] bg-green-500/5 rounded-full blur-[130px]"
        animate={{
          x: [0, 30, 0],
          y: [0, -50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
