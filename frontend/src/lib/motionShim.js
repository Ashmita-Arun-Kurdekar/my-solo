// Keep the existing local import path while using the real animation engine.
// This prevents presentation code from being coupled to a particular package path.
export { motion, AnimatePresence } from "framer-motion";
export { motion as default } from "framer-motion";
