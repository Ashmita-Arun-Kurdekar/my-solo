import React from "react";

const MOTION_PROPS = new Set([
  "initial",
  "animate",
  "exit",
  "transition",
  "variants",
  "whileHover",
  "whileTap",
  "whileDrag",
  "whileFocus",
  "whileInView",
  "viewport",
  "onAnimationComplete",
  "custom",
  "layout",
  "layoutId",
  "drag",
  "dragConstraints",
  "dragElastic",
  "dragMomentum",
  "dragPropagation",
  "dragTransition",
]);

const createMotionElement = (tag) => {
  return React.forwardRef(({ children, style, className, ...props }, ref) => {
    const combinedStyle = { transition: "all 220ms ease", ...style };
    const filteredProps = Object.keys(props).reduce((acc, key) => {
      if (!MOTION_PROPS.has(key)) {
        acc[key] = props[key];
      }
      return acc;
    }, {});

    return React.createElement(tag, { ref, style: combinedStyle, className, ...filteredProps }, children);
  });
};

const handler = {
  get(_, prop) {
    return createMotionElement(prop);
  },
};

export const motion = new Proxy({}, handler);

export const AnimatePresence = ({ children }) => React.createElement(React.Fragment, null, children);

export default motion;
