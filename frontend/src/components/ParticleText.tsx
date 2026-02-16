//there are 2 option for the text animation 
//which ever is good can be taken


//option 1
// import React, { useLayoutEffect, useRef, useMemo } from 'react';
// import * as THREE from 'three';
// import { extend, useLoader } from '@react-three/fiber';
// import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
// import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
// import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
// import gsap from 'gsap';

// extend({ TextGeometry });

// const getThemeColors = () => {
//   if (typeof window === 'undefined') return ['#ffffff'];
//   const styles = getComputedStyle(document.documentElement);
//   return [
//     styles.getPropertyValue('--fest-primary').trim() || '#ff5e57',
//     styles.getPropertyValue('--fest-secondary').trim() || '#ffa801',
//     styles.getPropertyValue('--fest-accent').trim() || '#0fbcf9',
//   ];
// };

// interface ParticleTextProps {
//   text: string;
//   size?: number;
//   density?: number;
// }

// export const ParticleText: React.FC<ParticleTextProps> = ({ 
//   text, 
//   size = 1,
//   density = 1500 
// }) => {
//   const font = useLoader(FontLoader, 'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json');
//   const pointsRef = useRef<THREE.Points>(null);

//   const particleData = useMemo(() => {
//     const geometry = new TextGeometry(text, {
//       font,
//       size: size,
//       depth: 0,
//       curveSegments: 12,
//       bevelEnabled: false,
//     });
//     geometry.center();

//     const material = new THREE.MeshBasicMaterial();
//     const mesh = new THREE.Mesh(geometry, material);
//     const sampler = new MeshSurfaceSampler(mesh).build();
    
//     // Increase density for a fuller look
//     const count = Math.floor(density * text.length); 
    
//     const startPositions = new Float32Array(count * 3);
//     const endPositions = new Float32Array(count * 3);
//     const colors = new Float32Array(count * 3);
//     const randoms = new Float32Array(count); // For staggering animation
    
//     const themeColors = getThemeColors().map(c => new THREE.Color(c));
//     const tempPosition = new THREE.Vector3();

//     for (let i = 0; i < count; i++) {
//       // 1. END POSITION (The Text)
//       sampler.sample(tempPosition);
//       endPositions[i * 3] = tempPosition.x;
//       endPositions[i * 3 + 1] = tempPosition.y;
//       endPositions[i * 3 + 2] = tempPosition.z;

//       // 2. START POSITION (The Vortex/Galaxy)
//       // Instead of random chaos, we place them in a large spiral ring
//       const angle = (Math.random() * Math.PI * 2); // Random angle in circle
//       const radius = 25 + Math.random() * 15; // Distance from center
      
//       startPositions[i * 3] = Math.cos(angle) * radius; // X: Circle
//       startPositions[i * 3 + 1] = (Math.random() - 0.5) * 10; // Y: Slight vertical drift
//       startPositions[i * 3 + 2] = Math.sin(angle) * radius; // Z: Circle depth

//       // 3. COLORS
//       // We store the target color here. 
//       // In the animation loop, we will fade from Black -> This Color.
//       const color = themeColors[Math.floor(Math.random() * themeColors.length)];
//       colors[i * 3] = color.r;
//       colors[i * 3 + 1] = color.g;
//       colors[i * 3 + 2] = color.b;

//       // 4. RANDOM STAGGER
//       // Assign a random value 0-1 to delay this specific particle
//       randoms[i] = Math.random();
//     }

//     return { 
//       start: startPositions, 
//       end: endPositions, 
//       colors: colors,
//       randoms: randoms
//     };
//   }, [font, text, size, density]);

//   useLayoutEffect(() => {
//     if (!pointsRef.current) return;

//     const tl = gsap.timeline({ delay: 0.2 });
    
//     // Slower duration for "clean" look
//     const duration = 5.0; 
    
//     const animation = { value: 0 };

//     tl.to(animation, {
//       value: 1,
//       duration: duration,
//       ease: "power2.out", // Smooth deceleration
//       onUpdate: () => {
//         if (!pointsRef.current) return;

//         const geometry = pointsRef.current.geometry;
//         const positionAttr = geometry.attributes.position as THREE.BufferAttribute;
//         const colorAttr = geometry.attributes.color as THREE.BufferAttribute;
        
//         const posArr = positionAttr.array as Float32Array;
//         const colArr = colorAttr.array as Float32Array;

//         const { start, end, colors, randoms } = particleData;

//         for (let i = 0; i < randoms.length; i++) {
//           // KEY LOGIC: Staggered Progress
//           // Each particle has its own progress based on the global animation value
//           // and its random offset.
//           // Formula: We map the global 0->1 value to a local window for this particle.
          
//           const stagger = randoms[i] * 0.3; // 30% randomness variation
//           let progress = (animation.value - stagger) / (1 - 0.3);
          
//           // Clamp progress between 0 and 1
//           progress = Math.max(0, Math.min(1, progress));
          
//           // Apply an ease to the individual particle for smoothness
//           // Cubic ease-out: 1 - (1-t)^3
//           const eased = 1 - Math.pow(1 - progress, 3);

//           // --- UPDATE POSITION ---
//           // Linear interpolation from Vortex (start) to Text (end)
//           posArr[i * 3] = THREE.MathUtils.lerp(start[i * 3], end[i * 3], eased);
//           posArr[i * 3 + 1] = THREE.MathUtils.lerp(start[i * 3 + 1], end[i * 3 + 1], eased);
//           posArr[i * 3 + 2] = THREE.MathUtils.lerp(start[i * 3 + 2], end[i * 3 + 2], eased);

//           // --- UPDATE COLOR (FADE IN) ---
//           // Interpolate from Black (0,0,0) to TargetColor
//           // This creates the "appearing" effect
//           colArr[i * 3] = THREE.MathUtils.lerp(0, colors[i * 3], eased);     // R
//           colArr[i * 3 + 1] = THREE.MathUtils.lerp(0, colors[i * 3 + 1], eased); // G
//           colArr[i * 3 + 2] = THREE.MathUtils.lerp(0, colors[i * 3 + 2], eased); // B
//         }
        
//         positionAttr.needsUpdate = true;
//         colorAttr.needsUpdate = true;
//       }
//     });

//     return () => { tl.kill(); };
//   }, [particleData]);

//   return (
//     <points ref={pointsRef}>
//       <bufferGeometry>
//         <bufferAttribute
//           attach="attributes-position"
//           args={[particleData.start, 3]} // Initialize at start position
//         />
//         {/* Initialize colors as black (we will fade them in) */}
//         <bufferAttribute
//           attach="attributes-color"
//           args={[new Float32Array(particleData.colors.length).fill(0), 3]}
//         />
//       </bufferGeometry>
//       <pointsMaterial
//         size={0.06} // Keep small for "stardust" look
//         vertexColors
//         transparent
//         opacity={1}
//         sizeAttenuation={true}
//         depthWrite={false}
//         blending={THREE.AdditiveBlending}
//       />
//     </points>
//   );
// };


//option-2


import React, { useLayoutEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { extend, useLoader, useFrame } from '@react-three/fiber';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import gsap from 'gsap';

extend({ TextGeometry });

const getThemeColors = () => {
  if (typeof window === 'undefined') return ['#ffffff'];
  const styles = getComputedStyle(document.documentElement);
  return [
    styles.getPropertyValue('--fest-primary').trim() || '#ff5e57',
    styles.getPropertyValue('--fest-secondary').trim() || '#ffa801',
    styles.getPropertyValue('--fest-accent').trim() || '#0fbcf9',
  ];
};

interface ParticleTextProps {
  text: string;
  size?: number;
  density?: number;
}

export const ParticleText: React.FC<ParticleTextProps> = ({ 
  text, 
  size = 1,
  density = 1500 
}) => {
  const font = useLoader(FontLoader, 'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json');
  const pointsRef = useRef<THREE.Points>(null);
  
  // Animation progress ref
  const progressRef = useRef({ value: 0 });

  const particleData = useMemo(() => {
    const geometry = new TextGeometry(text, {
      font,
      size: size,
      depth: 0,
      curveSegments: 12,
      bevelEnabled: false,
    });
    geometry.center();

    // Compute layout for the sweep effect
    geometry.computeBoundingBox();
    const minX = geometry.boundingBox!.min.x;
    const maxX = geometry.boundingBox!.max.x;
    // Safety check to prevent division by zero
    const totalWidth = Math.max(0.1, maxX - minX);

    const material = new THREE.MeshBasicMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    const sampler = new MeshSurfaceSampler(mesh).build();
    
    const count = Math.floor(density * text.length); 
    
    const startPositions = new Float32Array(count * 3);
    const endPositions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const mixFactors = new Float32Array(count); 
    const speeds = new Float32Array(count);     

    const themeColors = getThemeColors().map(c => new THREE.Color(c));
    const tempPosition = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
      // 1. END POSITION (The Text)
      sampler.sample(tempPosition);
      endPositions[i * 3] = tempPosition.x;
      endPositions[i * 3 + 1] = tempPosition.y;
      endPositions[i * 3 + 2] = tempPosition.z;

      // Calculate relative X (0.0 = Leftmost letter, 1.0 = Rightmost letter)
      const relativeX = (tempPosition.x - minX) / totalWidth;
      mixFactors[i] = relativeX;

      // 2. START POSITION (Off-screen Left)
      // We spawn them ~30 units to the left of the text's start
      startPositions[i * 3] = minX - 35 - (Math.random() * 15); 
      startPositions[i * 3 + 1] = (Math.random() - 0.5) * 10;   
      startPositions[i * 3 + 2] = (Math.random() - 0.5) * 5;    

      // 3. COLORS
      const color = themeColors[Math.floor(Math.random() * themeColors.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      // 4. SPEED
      speeds[i] = 0.5 + Math.random() * 0.5;
    }

    return { 
      start: startPositions, 
      end: endPositions, 
      colors: colors,
      mixFactors: mixFactors,
      speeds: speeds
    };
  }, [font, text, size, density]);

  useLayoutEffect(() => {
    const tl = gsap.timeline({ delay: 0.5 });
    
    // Animate global progress 0 -> 1
    tl.to(progressRef.current, {
      value: 1,
      duration: 3.5, 
      ease: "power2.out",
    });

    return () => { tl.kill(); };
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;

    const time = clock.getElapsedTime();
    const geometry = pointsRef.current.geometry;
    const positionAttr = geometry.attributes.position as THREE.BufferAttribute;
    const posArr = positionAttr.array as Float32Array;

    const { start, end, mixFactors, speeds } = particleData;
    const globalProgress = progressRef.current.value;

    for (let i = 0; i < mixFactors.length; i++) {
      // Delay logic: Right-side particles wait longer
      const threshold = mixFactors[i] * 0.6; // Max delay is 0.6 of the timeline
      // Map global progress to local particle progress
      let localProgress = (globalProgress - threshold) / (1 - 0.6);
      
      // Clamp
      localProgress = Math.max(0, Math.min(1, localProgress));
      
      // Ease Out Cubic
      const eased = 1 - Math.pow(1 - localProgress, 3);

      if (localProgress <= 0) {
        // Stick to start
        posArr[i * 3] = start[i * 3];
        posArr[i * 3 + 1] = start[i * 3 + 1];
        posArr[i * 3 + 2] = start[i * 3 + 2];
      } else if (localProgress >= 1) {
        // Snap to end
        posArr[i * 3] = end[i * 3];
        posArr[i * 3 + 1] = end[i * 3 + 1];
        posArr[i * 3 + 2] = end[i * 3 + 2];
      } else {
        // Interpolate with Turbulence (Fire Effect)
        // (1 - eased) makes the turbulence stop as it settles
        const turbulence = Math.sin(time * 15 * speeds[i] + i) * (1 - eased);
        
        posArr[i * 3] = THREE.MathUtils.lerp(start[i * 3], end[i * 3], eased);
        // Add vertical wave
        posArr[i * 3 + 1] = THREE.MathUtils.lerp(start[i * 3 + 1], end[i * 3 + 1], eased) + (turbulence * 1.5);
        posArr[i * 3 + 2] = THREE.MathUtils.lerp(start[i * 3 + 2], end[i * 3 + 2], eased);
      }
    }
    
    positionAttr.needsUpdate = true;
  });

  return (
    // FIXED: frustumCulled={false} prevents Three.js from hiding the object 
    // when the particles are spawning off-screen.
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particleData.start, 3]} 
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particleData.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};