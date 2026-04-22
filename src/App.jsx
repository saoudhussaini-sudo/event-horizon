import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import BlackHole from './components/BlackHole';
import ControlsPanel from './components/ControlsPanel';
import OverlayInfo from './components/OverlayInfo';
import { AnimatePresence, motion } from 'framer-motion';
import { Play } from 'lucide-react';
import './index.css';

export default function App() {
  const [started, setStarted] = useState(false);
  const [params, setParams] = useState({
    mass: 1.0,
    spin: 1.5,
    diskIntensity: 1.0,
  });

  const handleStart = () => {
    setStarted(true);
    // Attempt to play ambient audio (place space-ambient.mp3 in public folder)
    const audio = new Audio('/space-ambient.mp3');
    audio.loop = true;
    audio.volume = 0.4;
    audio.play().catch(e => console.log('Audio missing or blocked, please add /space-ambient.mp3 to public folder.'));
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <AnimatePresence>
        {!started && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.5 } }}
            style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              zIndex: 50, display: 'flex', flexDirection: 'column', 
              alignItems: 'center', justifyContent: 'center',
              background: '#030305'
            }}
          >
            <h1 className="heading-font" style={{ fontSize: '4rem', letterSpacing: '0.2em', marginBottom: '1rem', textShadow: '0 0 20px rgba(255,255,255,0.2)' }}>EVENT HORIZON</h1>
            <p style={{ color: '#8b9bb4', marginBottom: '3rem', letterSpacing: '0.05em', fontSize: '1.2rem' }}>Interactive Spacetime Simulation</p>
            <button 
              onClick={handleStart}
              className="glass-panel"
              style={{
                padding: '16px 40px', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '12px',
                fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.15em',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(10, 10, 15, 0.4)'}
            >
              <Play size={20} /> Initialize
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Canvas camera={{ position: [0, 2, 10], fov: 45 }}>
        <Suspense fallback={null}>
          <BlackHole {...params} />
          <OrbitControls 
            enablePan={false}
            minDistance={4}
            maxDistance={25}
            maxPolarAngle={Math.PI / 1.1} 
            autoRotate
            autoRotateSpeed={0.5}
            enableDamping
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>

      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
         {started && <OverlayInfo params={params} />}
         {started && <ControlsPanel params={params} setParams={setParams} />}
      </div>
    </div>
  );
}
