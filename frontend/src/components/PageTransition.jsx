import React from "react";
import { motion } from "../lib/motionShim";

// File: src/components/PageTransition.jsx
// Purpose: Wrap page content with a consistent enter/exit animation.
// Uses the local motion shim so it works whether or not framer-motion is installed.

const variants = {
  initial: { opacity: 0, y: 16, filter: "blur(5px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -10, filter: "blur(3px)" },
};

export default function PageTransition({ children, className }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
