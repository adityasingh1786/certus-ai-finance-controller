import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeRailCanvas({ className = '' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xFAFAF9, 0.035);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 24);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // transparent
    container.appendChild(renderer.domElement);

    // 3. Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const pointLightCrimson = new THREE.PointLight(0xe8384f, 4.0, 45);
    pointLightCrimson.position.set(0, 3, 10);
    scene.add(pointLightCrimson);

    const pointLightIndigo = new THREE.PointLight(0x6366f1, 3.0, 45);
    pointLightIndigo.position.set(-10, -5, 8);
    scene.add(pointLightIndigo);

    // 4. Central Invariant Consensus Core (Geometry)
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Inner Icosahedron Wireframe
    const coreGeom = new THREE.IcosahedronGeometry(2.5, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xe8384f,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
      emissive: 0xe8384f,
      emissiveIntensity: 0.4,
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    coreGroup.add(coreMesh);

    // Inner Solid Glow Sphere
    const innerSphereGeom = new THREE.SphereGeometry(1.4, 32, 32);
    const innerSphereMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0xff2e4d,
      emissiveIntensity: 0.35,
    });
    const innerSphere = new THREE.Mesh(innerSphereGeom, innerSphereMat);
    coreGroup.add(innerSphere);

    // Orbiting Consensus Rings
    const ringGeom = new THREE.TorusGeometry(3.8, 0.05, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0xe8384f, transparent: true, opacity: 0.75 });
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.55 });

    const ring1 = new THREE.Mesh(ringGeom, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    coreGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeom, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    coreGroup.add(ring2);

    // 5. Three Sovereign Financial Rail Nodes
    const nodes = [
      { name: 'Gateway', color: 0xe8384f, pos: new THREE.Vector3(-7.2, 3.5, 1.5) },
      { name: 'BankCMS', color: 0xd97706, pos: new THREE.Vector3(7.2, 3.5, 1.5) },
      { name: 'GeneralLedger', color: 0x4f46e5, pos: new THREE.Vector3(0, -6.0, 1.5) },
    ];

    const nodeMeshes = [];
    const splineCables = [];
    const packetMeshes = [];

    nodes.forEach((node, nodeIdx) => {
      const nodeGroup = new THREE.Group();
      nodeGroup.position.copy(node.pos);

      // Node Outer Glow Sphere
      const nGeom = new THREE.SphereGeometry(0.95, 24, 24);
      const nMat = new THREE.MeshStandardMaterial({
        color: node.color,
        roughness: 0.15,
        metalness: 0.85,
        emissive: node.color,
        emissiveIntensity: 0.4,
      });
      const nMesh = new THREE.Mesh(nGeom, nMat);
      nodeGroup.add(nMesh);

      // Orbiting Halo Ring
      const nRingGeom = new THREE.TorusGeometry(1.4, 0.04, 16, 64);
      const nRingMat = new THREE.MeshBasicMaterial({ color: node.color, transparent: true, opacity: 0.7 });
      const nRing = new THREE.Mesh(nRingGeom, nRingMat);
      nRing.rotation.x = Math.PI / 2.3;
      nodeGroup.add(nRing);

      scene.add(nodeGroup);
      nodeMeshes.push({ group: nodeGroup, ring: nRing, basePos: node.pos.clone() });

      // Curved Spline Bezier Wire connecting Node to Core
      const curve = new THREE.QuadraticBezierCurve3(
        node.pos,
        new THREE.Vector3(node.pos.x * 0.45, node.pos.y * 0.45, 3.2),
        new THREE.Vector3(0, 0, 0)
      );
      const points = curve.getPoints(50);
      const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: node.color,
        transparent: true,
        opacity: 0.5,
        linewidth: 2.0,
      });
      const line = new THREE.Line(lineGeom, lineMat);
      scene.add(line);
      splineCables.push({ curve, line });

      // Gliding Transaction Data Packets (Pulsing Photons traveling along cable)
      const packetCount = 2;
      for (let p = 0; p < packetCount; p++) {
        const pGeom = new THREE.SphereGeometry(0.24, 16, 16);
        const pMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.95,
        });
        const pMesh = new THREE.Mesh(pGeom, pMat);
        scene.add(pMesh);
        packetMeshes.push({
          mesh: pMesh,
          curve: curve,
          progress: (p / packetCount) + (nodeIdx * 0.33),
          speed: 0.006 + Math.random() * 0.003,
        });
      }
    });

    // 6. Ambient Floating Particle Field
    const particleCount = 180;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 36;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 24;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 18;
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xe8384f,
      size: 0.16,
      transparent: true,
      opacity: 0.4,
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // 7. Mouse Parallax & Dynamic Tracking
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 4.0;
      targetY = -y * 4.0;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 8. Animation Render Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera parallax interpolation
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      camera.position.x = currentX;
      camera.position.y = currentY;
      camera.lookAt(0, 0, 0);

      // Core rotation
      coreMesh.rotation.x = elapsedTime * 0.3;
      coreMesh.rotation.y = elapsedTime * 0.4;
      ring1.rotation.z = elapsedTime * 0.45;
      ring2.rotation.x = elapsedTime * 0.35;

      // Node harmonic floating & ring rotations
      nodeMeshes.forEach((item, idx) => {
        const offset = idx * 2.1;
        item.group.position.y = item.basePos.y + Math.sin(elapsedTime * 1.6 + offset) * 0.28;
        item.group.position.x = item.basePos.x + Math.cos(elapsedTime * 1.3 + offset) * 0.18;
        item.ring.rotation.z = elapsedTime * 1.4 + offset;
      });

      // Animate Gliding Transaction Data Packets along Splines
      packetMeshes.forEach((p) => {
        p.progress = (p.progress + p.speed) % 1.0;
        const pos = p.curve.getPointAt(p.progress);
        p.mesh.position.copy(pos);
        // Pulse size slightly
        const scale = 1.0 + Math.sin(elapsedTime * 8.0) * 0.2;
        p.mesh.scale.set(scale, scale, scale);
      });

      // Subtle particle drift
      particles.rotation.y = elapsedTime * 0.035;
      particles.rotation.x = elapsedTime * 0.025;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full pointer-events-none ${className}`}
      style={{ minHeight: '400px' }}
    />
  );
}
