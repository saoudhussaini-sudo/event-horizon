import React from 'react';
import { motion } from 'framer-motion';

export default function OverlayInfo({ params }) {
  // Real-world calculations simplified for UI effect
  const schRadius = (params.mass * 2.95).toFixed(2); // roughly 2.95 km per solar mass
  // simplified dummy formula for time dilation UI effect near event horizon edge
  const timeDilation = Math.min(100, 1.0 / Math.abs(1.0 - (params.mass / 3.1))).toFixed(2); 

  return (
    <motion.div 
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 1 }}
      style={{
        position: 'absolute',
        top: '2rem',
        left: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        pointerEvents: 'none'
      }}
    >
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'inline-block', width: 'fit-content' }}>
        <div className="hud-element" style={{ marginBottom: '4px' }}>Target Designation</div>
        <div className="heading-font" style={{ fontSize: '1.5rem', letterSpacing: '0.1em', fontWeight: 700 }}>Gargantua-X</div>
      </div>

      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', gap: '3rem', width: 'fit-content' }}>
        <div>
          <div className="hud-element">Schwarzschild Radius</div>
          <div className="hud-value">{schRadius} km</div>
        </div>
        <div>
          <div className="hud-element">Time Dilation Factor</div>
          <div className="hud-value">{timeDilation}x</div>
        </div>
      </div>
      
      <div className="glass-panel" style={{ padding: '1.5rem', width: '380px', marginTop: '1rem' }}>
        <h4 className="heading-font" style={{ color: '#fff', marginBottom: '0.5rem' }}>The Event Horizon</h4>
        <p style={{ color: '#8b9bb4', fontSize: '0.85rem', lineHeight: 1.6 }}>
          The boundary defining the region of space around a black hole from which nothing, not even light, can escape. The rotating accretion disk of superheated plasma glows brilliantly, while the intense gravity warps spacetime, creating a perfect sphere of darkness and bending the light of background stars.
        </p>
      </div>
    </motion.div>
  );
}
