import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeRailCanvas({ className = '' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    // Light porcelain atmospheric fog
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLightCrimson = new THREE.PointLight(0xe8384f, 3.5, 40);
    pointLightCrimson.position.set(0, 2, 8);
    scene.add(pointLightCrimson);

    const pointLightIndigo = new THREE.PointLight(0x6366f1, 2.5, 40);
    pointLightIndigo.position.set(-8, -4, 6);
    scene.add(pointLightIndigo);

    // 4. Central Invariant Consensus Core (Geometry)
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Inner Icosahedron Wireframe
    const coreGeom = new THREE.IcosahedronGeometry(2.4, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xe8384f,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
      emissive: 0xe8384f,
      emissiveIntensity: 0.3,
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
      emissiveIntensity: 0.25,
    });
    const innerSphere = new THREE.Mesh(innerSphereGeom, innerSphereMat);
    coreGroup.add(innerSphere);

    // Orbiting Consensus Rings
    const ringGeom = new THREE.TorusGeometry(3.6, 0.04, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0xe8384f, transparent: true, opacity: 0.7 });
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.5 });

    const ring1 = new THREE.Mesh(ringGeom, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    coreGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeom, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    coreGroup.add(ring2);

    // 5. Three Sovereign Financial Rail Nodes
    const nodes = [
      { name: 'Gateway', color: 0xe8384f, pos: new THREE.Vector3(-6.5, 3.2, 1) },
      { name: 'BankCMS', color: 0xd97706, pos: new THREE.Vector3(6.5, 3.2, 1) },
      { name: 'GeneralLedger', color: 0x4f46e5, pos: new THREE.Vector3(0, -5.5, 1) },
    ];

    const nodeMeshes = [];
    const splineLines = [];

    nodes.forEach((node) => {
      const nodeGroup = new THREE.Group();
      nodeGroup.position.copy(node.pos);

      // Node Sphere
      const nGeom = new THREE.SphereGeometry(0.85, 24, 24);
      const nMat = new THREE.MeshStandardMaterial({
        color: node.color,
        roughness: 0.2,
        metalness: 0.8,
        emissive: node.color,
        emissiveIntensity: 0.3,
      });
      const nMesh = new THREE.Mesh(nGeom, nMat);
      nodeGroup.add(nMesh);

      // Orbiting Halo Ring
      const nRingGeom = new THREE.TorusGeometry(1.3, 0.03, 16, 64);
      const nRingMat = new THREE.MeshBasicMaterial({ color: node.color, transparent: true, opacity: 0.6 });
      const nRing = new THREE.Mesh(nRingGeom, nRingMat);
      nRing.rotation.x = Math.PI / 2.5;
      nodeGroup.add(nRing);

      scene.add(nodeGroup);
      nodeMeshes.push({ group: nodeGroup, ring: nRing, basePos: node.pos.clone() });

      // Curved Spline Bezier Wire connecting to Core
      const curve = new THREE.QuadraticBezierCurve3(
        node.pos,
        new THREE.Vector3(node.pos.x * 0.4, node.pos.y * 0.4, 2.5),
        new THREE.Vector3(0, 0, 0)
      );
      const points = curve.getPoints(40);
      const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: node.color,
        transparent: true,
        opacity: 0.4,
        linewidth: 1.5,
      });
      const line = new THREE.Line(lineGeom, lineMat);
      scene.add(line);
      splineLines.push({ curve, line });
    });

    // 6. Ambient Floating Particle Field
    const particleCount = 120;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 32;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 16;
      particleScales[i] = Math.random() * 2 + 1;
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xe8384f,
      size: 0.15,
      transparent: true,
      opacity: 0.35,
      blending: THREE.NormalBlending,
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // 7. Mouse Parallax Tracking
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 3.5;
      targetY = -y * 3.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 8. Animation Render Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera parallax interpolation
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;
      camera.position.x = currentX;
      camera.position.y = currentY;
      camera.lookAt(0, 0, 0);

      // Core rotation
      coreMesh.rotation.x = elapsedTime * 0.25;
      coreMesh.rotation.y = elapsedTime * 0.35;
      ring1.rotation.z = elapsedTime * 0.4;
      ring2.rotation.x = elapsedTime * 0.3;

      // Node harmonic floating & ring rotations
      nodeMeshes.forEach((item, idx) => {
        const offset = idx * 2.1;
        item.group.position.y = item.basePos.y + Math.sin(elapsedTime * 1.5 + offset) * 0.25;
        item.group.position.x = item.basePos.x + Math.cos(elapsedTime * 1.2 + offset) * 0.15;
        item.ring.rotation.z = elapsedTime * 1.2 + offset;
      });

      // Subtle particle drift
      particles.rotation.y = elapsedTime * 0.03;
      particles.rotation.x = elapsedTime * 0.02;

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
      style={{ minHeight: '380px' }}
    />
  );
}
