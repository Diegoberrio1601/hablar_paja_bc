"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
      {/* Dynamic Blobs - Reduced from 5 to 3 for performance */}
      <motion.div 
        className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-accent/15 rounded-full blur-[120px]"
        style={{ willChange: "transform" }}
        animate={{
          x: [0, 80, -40, 0],
          y: [0, 40, 80, 0],
          scale: [1, 1.15, 0.9, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />
      
      <motion.div 
        className="absolute top-[10%] -right-[15%] w-[45%] h-[45%] bg-purple-500/15 rounded-full blur-[140px]"
        style={{ willChange: "transform" }}
        animate={{
          x: [0, -100, 50, 0],
          y: [0, 60, -30, 0],
          scale: [1, 0.85, 1.1, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />

      <motion.div 
        className="absolute bottom-[-10%] left-[10%] w-[40%] h-[40%] bg-pink-500/15 rounded-full blur-[130px]"
        style={{ willChange: "transform" }}
        animate={{
          x: [0, 50, -70, 0],
          y: [0, -80, 40, 0],
          scale: [1, 1.1, 0.85, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
