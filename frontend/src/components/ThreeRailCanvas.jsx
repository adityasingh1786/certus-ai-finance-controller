import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeRailCanvas({ className = '' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Depth Fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xFAFAF9, 0.025);

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 22);

    // 2. High-Performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Pure transparent
    container.appendChild(renderer.domElement);

    // 3. Ambient & Point Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const pointLightRuby = new THREE.PointLight(0xe8384f, 3.5, 50);
    pointLightRuby.position.set(0, 2, 12);
    scene.add(pointLightRuby);

    const pointLightSilver = new THREE.PointLight(0x6366f1, 2.0, 45);
    pointLightSilver.position.set(-12, -4, 10);
    scene.add(pointLightSilver);

    // 4. Central Invariant Consensus Core (Geometric Crystal Mesh)
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Outer Faceted Crystal Wireframe
    const crystalGeom = new THREE.IcosahedronGeometry(2.4, 1);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0xe8384f,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      emissive: 0xe8384f,
      emissiveIntensity: 0.3,
    });
    const crystalMesh = new THREE.Mesh(crystalGeom, crystalMat);
    coreGroup.add(crystalMesh);

    // Inner Luminous Core
    const innerCoreGeom = new THREE.OctahedronGeometry(1.2, 0);
    const innerCoreMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0xe8384f,
      emissiveIntensity: 0.6,
    });
    const innerCoreMesh = new THREE.Mesh(innerCoreGeom, innerCoreMat);
    coreGroup.add(innerCoreMesh);

    // Fine Orbital Laser Rings
    const ringGeom = new THREE.TorusGeometry(3.6, 0.03, 16, 120);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0xe8384f, transparent: true, opacity: 0.6 });
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.4 });

    const ring1 = new THREE.Mesh(ringGeom, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    coreGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeom, ringMat2);
    ring2.rotation.y = Math.PI / 3.5;
    coreGroup.add(ring2);

    // 5. Three Sovereign Financial Rail Nodes (Crystalline Polyhedrons)
    const nodes = [
      { name: 'Gateway', color: 0xe8384f, pos: new THREE.Vector3(-7.5, 3.2, 1.2) },
      { name: 'BankCMS', color: 0xd97706, pos: new THREE.Vector3(7.5, 3.2, 1.2) },
      { name: 'GeneralLedger', color: 0x4f46e5, pos: new THREE.Vector3(0, -5.8, 1.2) },
    ];

    const nodeMeshes = [];
    const splineCables = [];
    const packetMeshes = [];

    nodes.forEach((node, nodeIdx) => {
      const nodeGroup = new THREE.Group();
      nodeGroup.position.copy(node.pos);

      // Node Crystalline Geometry
      const nGeom = new THREE.DodecahedronGeometry(0.9, 0);
      const nMat = new THREE.MeshStandardMaterial({
        color: node.color,
        roughness: 0.15,
        metalness: 0.85,
        emissive: node.color,
        emissiveIntensity: 0.35,
        wireframe: false,
      });
      const nMesh = new THREE.Mesh(nGeom, nMat);
      nodeGroup.add(nMesh);

      // Wireframe Accent Shell
      const nWireGeom = new THREE.DodecahedronGeometry(1.05, 0);
      const nWireMat = new THREE.MeshBasicMaterial({
        color: node.color,
        wireframe: true,
        transparent: true,
        opacity: 0.4,
      });
      const nWire = new THREE.Mesh(nWireGeom, nWireMat);
      nodeGroup.add(nWire);

      scene.add(nodeGroup);
      nodeMeshes.push({ group: nodeGroup, mesh: nMesh, wire: nWire, basePos: node.pos.clone() });

      // Curved Spline Bezier Wire connecting Node to Core
      const curve = new THREE.QuadraticBezierCurve3(
        node.pos,
        new THREE.Vector3(node.pos.x * 0.45, node.pos.y * 0.45, 2.8),
        new THREE.Vector3(0, 0, 0)
      );
      const points = curve.getPoints(50);
      const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: node.color,
        transparent: true,
        opacity: 0.45,
        linewidth: 1.5,
      });
      const line = new THREE.Line(lineGeom, lineMat);
      scene.add(line);
      splineCables.push({ curve, line });

      // Gliding Transaction Data Packets (Luminous Photons)
      const packetCount = 2;
      for (let p = 0; p < packetCount; p++) {
        const pGeom = new THREE.SphereGeometry(0.18, 16, 16);
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
          speed: 0.005 + Math.random() * 0.002,
        });
      }
    });

    // 6. Ambient Floating Dust Particles
    const particleCount = 140;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 32;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xe8384f,
      size: 0.12,
      transparent: true,
      opacity: 0.35,
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
      targetX = x * 3.0;
      targetY = -y * 3.0;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 8. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera interpolation
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;
      camera.position.x = currentX;
      camera.position.y = currentY;
      camera.lookAt(0, 0, 0);

      // Core rotation
      crystalMesh.rotation.x = elapsedTime * 0.25;
      crystalMesh.rotation.y = elapsedTime * 0.35;
      innerCoreMesh.rotation.y = -elapsedTime * 0.5;
      innerCoreMesh.rotation.z = elapsedTime * 0.3;
      ring1.rotation.z = elapsedTime * 0.35;
      ring2.rotation.x = elapsedTime * 0.25;

      // Node harmonic floating & wireframe rotations
      nodeMeshes.forEach((item, idx) => {
        const offset = idx * 2.0;
        item.group.position.y = item.basePos.y + Math.sin(elapsedTime * 1.4 + offset) * 0.22;
        item.group.position.x = item.basePos.x + Math.cos(elapsedTime * 1.1 + offset) * 0.14;
        item.mesh.rotation.y = elapsedTime * 0.8 + offset;
        item.wire.rotation.x = -elapsedTime * 0.6 + offset;
      });

      // Animate Gliding Transaction Data Packets along Splines
      packetMeshes.forEach((p) => {
        p.progress = (p.progress + p.speed) % 1.0;
        const pos = p.curve.getPointAt(p.progress);
        p.mesh.position.copy(pos);
        const scale = 1.0 + Math.sin(elapsedTime * 6.0) * 0.15;
        p.mesh.scale.set(scale, scale, scale);
      });

      // Subtle particle drift
      particles.rotation.y = elapsedTime * 0.02;

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
