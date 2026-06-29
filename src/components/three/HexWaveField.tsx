import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * An animated field of extruded hexagons (H3-inspired) that ripple in a wave.
 * Rendered with a single InstancedMesh for performance.
 */
export default function HexWaveField({ dark }: { dark: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const colored = useRef(false);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const positions = useMemo(() => {
    const out: { x: number; z: number; d: number }[] = [];
    const R = 8;
    for (let q = -R; q <= R; q++) {
      for (let r = -R; r <= R; r++) {
        const x = 1.5 * q;
        const z = Math.sqrt(3) * (r + q / 2);
        const d = Math.hypot(x, z);
        if (d > 12) continue;
        out.push({ x, z, d });
      }
    }
    return out;
  }, []);

  const colors = useMemo(() => {
    const a = new THREE.Color('#4f46e5'); // indigo
    const b = new THREE.Color('#14b8a6'); // teal
    return positions.map((p) => {
      const t = Math.min(1, p.d / 12);
      return new THREE.Color().lerpColors(a, b, t);
    });
  }, [positions]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;

    if (!colored.current) {
      positions.forEach((_, i) => mesh.setColorAt(i, colors[i]));
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      colored.current = true;
    }

    positions.forEach((p, i) => {
      const y = Math.sin(t * 1.5 - p.d * 0.45) * 0.6;
      dummy.position.set(p.x, y, p.z);
      const h = 0.6 + (y + 0.6);
      dummy.scale.set(1, h, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (groupRef.current) groupRef.current.rotation.y = t * 0.12;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, positions.length]}
        castShadow
      >
        <cylinderGeometry args={[0.82, 0.82, 1, 6]} />
        <meshStandardMaterial
          metalness={0.35}
          roughness={0.35}
          emissiveIntensity={dark ? 0.35 : 0.15}
          emissive="#1e293b"
        />
      </instancedMesh>
    </group>
  );
}
