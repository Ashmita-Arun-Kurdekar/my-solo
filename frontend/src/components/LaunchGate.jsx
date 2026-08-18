import { useEffect, useState } from "react";
import { AnimatePresence } from "../lib/motionShim";
import SplashScreen from "./SplashScreen";
import Login from "../pages/Login";

export default function LaunchGate() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const timer = window.setTimeout(() => setLoading(false), 1750); return () => window.clearTimeout(timer); }, []);
  return <AnimatePresence mode="wait">{loading ? <SplashScreen key="splash" /> : <Login key="login" />}</AnimatePresence>;
}
