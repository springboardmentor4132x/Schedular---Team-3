"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Line } from "@react-three/drei";
import * as THREE from "three";

// A handful of points on the globe's surface where "audiences" are —
// this is the whole point of the scene: reach, not abstraction.
const NODE_COUNT = 7;

function latLongToVector3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function GlobeNode({ position, delay }: { position: THREE.Vector3; delay: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * 1.6 + delay;
    const pulse = 0.5 + Math.abs(Math.sin(t)) * 0.5;
    ref.current.scale.setScalar(0.06 + pulse * 0.05);
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.6 + pulse * 1.2;
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshStandardMaterial color="#f4c430" emissive="#f4c430" emissiveIntensity={1} />
    </mesh>
  );
}

function Globe() {
  const groupRef = useRef<THREE.Group>(null);
  const radius = 2.2;

  const nodes = useMemo(() => {
    // Fixed, hand-picked lat/lon spread — deterministic so the component stays pure.
    const spread = [-35, 20, -10, 45, 5, -25, 30];
    return Array.from({ length: NODE_COUNT }, (_, i) => {
      const lat = spread[i % spread.length];
      const lon = (i / NODE_COUNT) * 360 + 12;
      return { position: latLongToVector3(lat, lon, radius), delay: i * 0.8 };
    });
  }, [radius]);

  // Great-circle-ish arcs connecting a few node pairs, to suggest a live network.
  const arcs = useMemo(() => {
    const pairs: [number, number][] = [
      [0, 2],
      [1, 4],
      [3, 5],
      [5, 6],
    ];
    return pairs.map(([a, b]) => {
      const start = nodes[a].position;
      const end = nodes[b].position;
      const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(radius * 1.35);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      return curve.getPoints(24);
    });
  }, [nodes, radius]);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.12;
  });

  return (
    <group ref={groupRef}>
      <Sphere args={[radius, 32, 32]}>
        <meshBasicMaterial color="#2a2a2a" wireframe transparent opacity={0.5} />
      </Sphere>
      <Sphere args={[radius - 0.02, 24, 24]}>
        <meshStandardMaterial color="#141414" roughness={0.7} transparent opacity={0.55} />
      </Sphere>

      {nodes.map((n, i) => (
        <GlobeNode key={i} position={n.position} delay={n.delay} />
      ))}

      {arcs.map((points, i) => (
        <Line key={i} points={points} color="#f4c430" transparent opacity={0.45} lineWidth={1} />
      ))}
    </group>
  );
}

export default function Scene3D() {
  return (
    <div className="h-[380px] md:h-[540px] w-full bg-ink" aria-hidden="true">
      <Canvas camera={{ position: [0, 0.8, 7], fov: 42 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 5, 4]} intensity={1} color="#f4c430" />
        <directionalLight position={[-4, -2, -3]} intensity={0.3} />
        <Globe />
      </Canvas>
    </div>
  );
}
