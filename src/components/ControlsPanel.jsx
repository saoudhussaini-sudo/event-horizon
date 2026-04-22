import React from 'react';
import { Settings2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ControlsPanel({ params, setParams }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 1 }}
      className="glass-panel"
      style={{
        position: 'absolute',
        bottom: '2rem',
        right: '2rem',
        width: '320px',
        padding: '1.5rem',
        pointerEvents: 'auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
        <Settings2 size={20} color="#8b9bb4" />
        <h3 className="heading-font" style={{ fontSize: '1.2rem', margin: 0 }}>System Parameters</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="hud-element">Singularity Mass</span>
            <span className="hud-value">{params.mass.toFixed(2)} M☉</span>
          </div>
          <input type="range" name="mass" min="0.5" max="3.0" step="0.01" value={params.mass} onChange={handleChange} />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="hud-element">Angular Momentum (Spin)</span>
            <span className="hud-value">{params.spin.toFixed(2)} a</span>
          </div>
          <input type="range" name="spin" min="-2.0" max="2.0" step="0.01" value={params.spin} onChange={handleChange} />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="hud-element">Accretion Disk Intensity</span>
            <span className="hud-value">{params.diskIntensity.toFixed(2)} I</span>
          </div>
          <input type="range" name="diskIntensity" min="0.0" max="3.0" step="0.01" value={params.diskIntensity} onChange={handleChange} />
        </div>
      </div>
    </motion.div>
  );
}
