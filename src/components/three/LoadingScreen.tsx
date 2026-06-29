import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import HexWaveField from './HexWaveField';

/**
 * Branded loading splash with an animated 3D hexagon-wave (Three.js / R3F).
 * `dark` drives lighting; the parent fades it out once the app is ready.
 */
export default function LoadingScreen({ dark }: { dark: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 z-[100] overflow-hidden bg-bg"
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 9, 13], fov: 42 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={[dark ? '#0b1120' : '#f8fafc']} />
        <fog attach="fog" args={[dark ? '#0b1120' : '#f8fafc', 14, 30]} />
        <ambientLight intensity={dark ? 0.5 : 0.8} />
        <directionalLight position={[6, 12, 6]} intensity={1.1} castShadow />
        <pointLight position={[-8, 6, -4]} intensity={0.6} color="#14b8a6" />
        <Suspense fallback={null}>
          <HexWaveField dark={dark} />
        </Suspense>
      </Canvas>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end pb-24">
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="text-2xl font-extrabold tracking-tight text-text">
            Macro Rides
          </div>
          <div className="mt-1 text-xs font-medium uppercase tracking-[0.25em] text-muted">
            Dispatch Console
          </div>
          <div className="mt-5 flex items-center gap-2 text-2xs text-faint">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Initialising H3 spatial engine
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
