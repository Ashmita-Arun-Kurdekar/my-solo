import { motion } from "../lib/motionShim";

export default function SplashScreen() {
  return <motion.main className="command-splash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .3 }}>
    <div className="command-splash-grid" /><div className="splash-coordinate">SYSTEM / RESOURCE COMMAND GRID / INITIALIZING</div>
    <motion.div className="splash-topology" initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .65 }}><div className="topology-ring ring-one"/><div className="topology-ring ring-two"/><div className="topology-axis horizontal"/><div className="topology-axis vertical"/><motion.span className="topology-node n1" animate={{scale:[1,1.25,1]}} transition={{duration:1.8,repeat:Infinity}}/><span className="topology-node n2"/><span className="topology-node n3"/><span className="topology-node n4"/><i className="bi bi-command"/></motion.div>
    <motion.div className="command-splash-copy" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .22 }}><small>PEOPLE → CAPACITY → PROJECTS → WORK → OUTCOMES</small><h1>Resource<br/>Command Grid</h1><p>Bringing the organization into operational focus.</p><div className="command-load"><motion.i initial={{width:"4%"}} animate={{width:"100%"}} transition={{duration:1.45,ease:"easeInOut"}}/></div><span>SYNCING RESOURCE SIGNALS</span></motion.div>
  </motion.main>;
}
