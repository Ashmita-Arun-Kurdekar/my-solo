import React from "react";
import { motion } from "../lib/motionShim";

// File: src/components/PageTransition.jsx
// Purpose: Wrap page content with a consistent enter/exit animation.
// Uses the local motion shim so it works whether or not framer-motion is installed.

const variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function PageTransition({ children, className }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{ duration: 0.36, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
