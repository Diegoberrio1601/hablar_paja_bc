"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none select-none">
      {/* Dynamic Blobs */}
      <motion.div 
        className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px]"
        animate={{
          x: [0, 100, -50, 0],
          y: [0, 50, 100, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />
      
      <motion.div 
        className="absolute top-[10%] -right-[15%] w-[45%] h-[45%] bg-purple-500/10 rounded-full blur-[140px]"
        animate={{
          x: [0, -120, 60, 0],
          y: [0, 80, -40, 0],
          scale: [1, 0.8, 1.1, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />

      <motion.div 
        className="absolute bottom-[-10%] left-[10%] w-[40%] h-[40%] bg-pink-500/10 rounded-full blur-[130px]"
        animate={{
          x: [0, 60, -80, 0],
          y: [0, -100, 40, 0],
          scale: [1, 1.1, 0.8, 1],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      />

      <motion.div 
        className="absolute top-[40%] left-[30%] w-[35%] h-[35%] bg-blue-500/5 rounded-full blur-[150px]"
        animate={{
          x: [-50, 50, 0, -50],
          y: [50, -50, 0, 50],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div 
        className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-amber-500/10 rounded-full blur-[110px]"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.3, 1],
        }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
