import React, { useLayoutEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { extend, useLoader, useFrame } from '@react-three/fiber';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import gsap from 'gsap';

extend({ TextGeometry });

const vertexShader = `
  uniform float uTime;
  uniform float uProgress;
  uniform float uMinX;
  uniform float uMaxX;
  
  attribute vec3 aStartPos;
  attribute vec3 aEndPos;
  attribute vec3 aRandom; 
  
  varying vec2 vUv;
  varying float vBurnThreshold;

  mat3 rotation3dX(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);
  }
  
  mat3 rotation3dY(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
  }
  
  mat3 rotation3dZ(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0);
  }

  void main() {
    vUv = uv;

    // Normalizing the X position (0.0 is far left, 1.0 is far right) for the fire wave
    vBurnThreshold = (aEndPos.x - uMinX) / (uMaxX - uMinX);

    float delay = aRandom.x * 0.4; 
    float localProgress = clamp((uProgress - delay) / 0.6, 0.0, 1.0);
    
    float eased = localProgress * localProgress * (3.0 - 2.0 * localProgress);
    float inv = 1.0 - eased;

    // Magnetic gathering trajectory
    vec3 midPoint = (aStartPos + aEndPos) * 0.5;
    midPoint.y += (aRandom.z - 0.5) * 60.0; 
    midPoint.z += (aRandom.x - 0.5) * 60.0; 
    
    vec3 curPos = mix(mix(aStartPos, midPoint, eased), mix(midPoint, aEndPos, eased), eased);

    // Turbulence stops exactly as they form the text (inv -> 0)
    vec3 noise = vec3(
      sin(uTime * 2.0 * aRandom.y + aStartPos.y) * 4.0,
      cos(uTime * 1.5 * aRandom.y + aStartPos.x) * 4.0,
      sin(uTime * 2.5 * aRandom.y + aStartPos.z) * 4.0
    ) * inv; 

    curPos += noise;

    // Tumble rotation
    float tumbleX = (aRandom.z * 15.0 + uTime * aRandom.y * 12.0) * inv;
    float tumbleY = (aRandom.x * 15.0 + uTime * aRandom.y * 10.0) * inv;
    float tumbleZ = (aRandom.y * 15.0 + uTime * aRandom.x * 14.0) * inv;
    
    mat3 tumbleRot = rotation3dX(tumbleX) * rotation3dY(tumbleY) * rotation3dZ(tumbleZ);

    vec3 transformed = tumbleRot * position;

    float scale = min(1.0, localProgress * 4.0);
    transformed *= scale;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed + curPos, 1.0);
  }
`;

const fragmentShader = `
  uniform float uBurn; 
  varying vec2 vUv;
  varying float vBurnThreshold;

  void main() {
    // Cut the square plane into a circular petal
    float dist = distance(vUv, vec2(0.5));
    if (dist > 0.5) discard; 
    float alpha = smoothstep(0.5, 0.3, dist);
    
    // TWO-SIDED PETAL COLORS
    vec3 frontColor = vec3(0.7, 0.05, 0.05); // Deep Velvet Red
    vec3 backColor = vec3(0.95, 0.95, 0.95);  // Shiny Silver/White
    vec3 baseColor = gl_FrontFacing ? frontColor : backColor;

    // THE BURN WAVE LOGIC
    // uBurn moves from -0.2 to 1.2 across the text
    float burnDiff = uBurn - vBurnThreshold;
    
    // If the fire wave has fully passed this petal, it burns away to nothing
    if (burnDiff > 0.1) {
      discard;
    }

    // Calculate how close the petal is to the leading edge of the fire
    float glow = smoothstep(0.1, 0.0, abs(burnDiff));
    
    // Fire color (Bright Yellow/Orange)
    vec3 fireColor = vec3(1.0, 0.6, 0.0);
    
    // Mix the base petal color with the fire color, multiplying intensity for a bloom effect
    vec3 finalColor = mix(baseColor, fireColor, glow * 1.5);
    
    // Fade the petal out right as it gets consumed by the fire
    alpha *= smoothstep(0.1, 0.0, burnDiff);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

interface GommageTextProps {
  text: string;
  size?: number;
  density?: number;
  startAnimation?: boolean;
}

export const GommageText: React.FC<GommageTextProps> = ({ 
  text, 
  size = 1,
  // 1200 gives us enough petals to see the colors clearly without overwhelming the burn effect
  density = 1200, 
  startAnimation = false
}) => {
  const font = useLoader(FontLoader, 'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json');
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const solidMatRef = useRef<THREE.MeshBasicMaterial>(null);
  
  const particleData = useMemo(() => {
    const geometry = new TextGeometry(text, { font, size, depth: 0, curveSegments: 12, bevelEnabled: false });
    geometry.center();
    geometry.computeBoundingBox();

    const minX = geometry.boundingBox!.min.x;
    const maxX = geometry.boundingBox!.max.x;

    const sampler = new MeshSurfaceSampler(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial())).build();
    
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const activeDensity = isMobile ? density * 0.4 : density;
    const count = Math.floor(activeDensity * text.length);
    
    const startPositions = new Float32Array(count * 3);
    const endPositions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 3);

    const tempPosition = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
      sampler.sample(tempPosition);
      endPositions[i * 3] = tempPosition.x;
      endPositions[i * 3 + 1] = tempPosition.y;
      endPositions[i * 3 + 2] = tempPosition.z;

      // Magnetic scatter (wide starting positions)
      const angle = Math.random() * Math.PI * 2;
      const radius = 30 + Math.random() * 30;
      startPositions[i * 3] = Math.cos(angle) * radius; 
      startPositions[i * 3 + 1] = Math.sin(angle) * radius; 
      startPositions[i * 3 + 2] = (Math.random() - 0.5) * 60;

      randoms[i * 3] = Math.random();
      randoms[i * 3 + 1] = 0.5 + Math.random() * 0.5;
      randoms[i * 3 + 2] = Math.random();
    }

    return { count, start: startPositions, end: endPositions, randoms, geometry, minX, maxX };
  }, [font, text, size, density]);

  // Establish GPU Uniforms
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uBurn: { value: -0.2 }, // Starts to the left of the text
    uMinX: { value: particleData.minX },
    uMaxX: { value: particleData.maxX }
  }), [particleData]);

  useLayoutEffect(() => {
    if (!startAnimation || !materialRef.current || !solidMatRef.current) return;

    // THE TIMELINE SEQUENCE
    const tl = gsap.timeline({ delay: 0.1 });
    
    // 1. Magnetic Assembly: Petals fly in and form the text (4 seconds)
    tl.to(uniforms.uProgress, {
      value: 1,
      duration: 4.5, 
      ease: "power3.inOut", 
    });

    // 2. The Ignition: The fire wave sweeps across the text, burning the petals
    tl.to(uniforms.uBurn, {
      value: 1.2,
      duration: 2.5,
      ease: "power1.inOut"
    }, "-=1.0"); // Starts right before they finish assembling

    // 3. The Boom: Solid text emerges from the flames exactly where the fire passes
    tl.to(solidMatRef.current, {
      opacity: 1,
      duration: 2.0,
      ease: "power2.out"
    }, "-=2.0");

    return () => { tl.kill(); };
  }, [startAnimation, uniforms]);

  useFrame(({ clock }) => {
    if (materialRef.current && uniforms.uProgress.value < 1.0) {
      uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <group>
      {/* SOLID TEXT REVEAL */}
      <mesh geometry={particleData.geometry}>
        <meshBasicMaterial 
          ref={solidMatRef} 
          color="#ffffff" 
          transparent={true} 
          opacity={0} 
        />
      </mesh>

      {/* TWO-SIDED BURNING PETALS */}
      <instancedMesh args={[undefined, undefined, particleData.count]} frustumCulled={false}>
        {/* Larger planes (0.15) to clearly see the red/silver flipping */}
        <planeGeometry args={[0.15, 0.15, 1, 1]}>
          <instancedBufferAttribute attach="attributes-aStartPos" args={[particleData.start, 3]} />
          <instancedBufferAttribute attach="attributes-aEndPos" args={[particleData.end, 3]} />
          <instancedBufferAttribute attach="attributes-aRandom" args={[particleData.randoms, 3]} />
        </planeGeometry>
        
        <shaderMaterial 
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent={true}
          depthWrite={false}
          blending={THREE.NormalBlending} 
          side={THREE.DoubleSide} // Crucial for gl_FrontFacing to work
        />
      </instancedMesh>
    </group>
  );
};