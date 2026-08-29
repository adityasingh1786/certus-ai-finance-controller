import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { soundManager } from '../lib/soundFx';
import {
  ShieldCheck,
  Zap,
  Cpu,
  Database,
  Layers,
  ArrowRight,
  Sparkles,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export default function ThreeRailCanvas({ className = '' }) {
  const mountRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [nodeScreenPositions, setNodeScreenPositions] = useState({});
  const [packetScreenPositions, setPacketScreenPositions] = useState([]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    // 1. Scene & Depth Atmosphere
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xFAFAF9, 0.022);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 24);

    // 2. High-Performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Transparent
    container.appendChild(renderer.domElement);

    // 3. Multi-Source Specular Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(10, 15, 20);
    scene.add(keyLight);

    const rubyPointLight = new THREE.PointLight(0xe8384f, 4.5, 60);
    rubyPointLight.position.set(0, 0, 10);
    scene.add(rubyPointLight);

    const indigoPointLight = new THREE.PointLight(0x6366f1, 3.0, 50);
    indigoPointLight.position.set(-12, -6, 8);
    scene.add(indigoPointLight);

    const amberPointLight = new THREE.PointLight(0xd97706, 3.0, 50);
    amberPointLight.position.set(12, 6, 8);
    scene.add(amberPointLight);

    // 4. Central Sovereign Consensus Singularity Core (Monumental Crystal)
    const coreGroup = new THREE.Group();
    coreGroup.name = 'consensus_core';
    scene.add(coreGroup);

    // Inner Glowing Nucleus
    const innerNucleusGeom = new THREE.OctahedronGeometry(1.2, 0);
    const innerNucleusMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0xe8384f,
      emissiveIntensity: 0.8,
    });
    const innerNucleus = new THREE.Mesh(innerNucleusGeom, innerNucleusMat);
    coreGroup.add(innerNucleus);

    // Middle Hyper-Faceted Crystal Icosahedron
    const crystalGeom = new THREE.IcosahedronGeometry(2.6, 1);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0xe8384f,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
      emissive: 0xe8384f,
      emissiveIntensity: 0.35,
    });
    const crystalMesh = new THREE.Mesh(crystalGeom, crystalMat);
    coreGroup.add(crystalMesh);

    // 3 Orthogonal Intersecting Gimbal Laser Rings
    const gimbalRings = [];
    const ringGeom = new THREE.TorusGeometry(3.9, 0.035, 16, 120);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0xe8384f, transparent: true, opacity: 0.7 });
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.5 });
    const ringMat3 = new THREE.MeshBasicMaterial({ color: 0xd97706, transparent: true, opacity: 0.5 });

    const ringX = new THREE.Mesh(ringGeom, ringMat1);
    ringX.rotation.x = Math.PI / 2.5;
    coreGroup.add(ringX);
    gimbalRings.push({ mesh: ringX, speedX: 0.015, speedY: 0.008 });

    const ringY = new THREE.Mesh(ringGeom, ringMat2);
    ringY.rotation.y = Math.PI / 3;
    coreGroup.add(ringY);
    gimbalRings.push({ mesh: ringY, speedX: 0.009, speedY: 0.018 });

    const ringZ = new THREE.Mesh(ringGeom, ringMat3);
    ringZ.rotation.z = Math.PI / 4;
    coreGroup.add(ringZ);
    gimbalRings.push({ mesh: ringZ, speedX: 0.012, speedY: 0.014 });

    // 5. Three Sovereign Financial Rail Nodes
    const NODES_DATA = [
      {
        id: 'gateway',
        name: 'Razorpay Gateway Hub',
        short: 'GATEWAY RAIL',
        subtitle: 'Instant Capture • 2.0% MDR',
        metric: '4,666 req/s',
        status: 'T+0 Instant Auth',
        color: 0xe8384f,
        colorHex: '#E8384F',
        pos: new THREE.Vector3(-8.2, 3.8, 1.4),
        type: 'dodecahedron',
      },
      {
        id: 'bank',
        name: 'Bank CMS Statement Rail',
        short: 'BANK CMS RAIL',
        subtitle: 'HDFC / ICICI / SBI • 16-Digit UTR',
        metric: '98.5% Match',
        status: 'T+1 Settlement',
        color: 0xd97706,
        colorHex: '#D97706',
        pos: new THREE.Vector3(8.2, 3.8, 1.4),
        type: 'octahedron',
      },
      {
        id: 'erp',
        name: 'General Ledger Sovereign Node',
        short: 'TALLY / SAP ERP',
        subtitle: 'Sales Vouchers • 194-O TDS',
        metric: '0.00 Imbalance',
        status: 'GL Posted',
        color: 0x4f46e5,
        colorHex: '#4F46E5',
        pos: new THREE.Vector3(0, -6.5, 1.4),
        type: 'icosahedron',
      },
    ];

    const nodeObjects = [];
    const splineCables = [];
    const packetObjects = [];

    NODES_DATA.forEach((data, idx) => {
      const nodeGroup = new THREE.Group();
      nodeGroup.name = data.id;
      nodeGroup.position.copy(data.pos);

      // Solid Geometric Core
      let solidGeom;
      if (data.type === 'dodecahedron') {
        solidGeom = new THREE.DodecahedronGeometry(1.05, 0);
      } else if (data.type === 'octahedron') {
        solidGeom = new THREE.OctahedronGeometry(1.25, 0);
      } else {
        solidGeom = new THREE.IcosahedronGeometry(1.15, 0);
      }

      const solidMat = new THREE.MeshStandardMaterial({
        color: data.color,
        roughness: 0.2,
        metalness: 0.8,
        emissive: data.color,
        emissiveIntensity: 0.45,
      });
      const solidMesh = new THREE.Mesh(solidGeom, solidMat);
      nodeGroup.add(solidMesh);

      // Outer Translucent Wireframe Shell
      const wireGeom = solidGeom.clone().scale(1.25, 1.25, 1.25);
      const wireMat = new THREE.MeshBasicMaterial({
        color: data.color,
        wireframe: true,
        transparent: true,
        opacity: 0.5,
      });
      const wireMesh = new THREE.Mesh(wireGeom, wireMat);
      nodeGroup.add(wireMesh);

      // Orbital Gyroscope Ring
      const nodeRingGeom = new THREE.TorusGeometry(1.8, 0.03, 16, 64);
      const nodeRingMat = new THREE.MeshBasicMaterial({
        color: data.color,
        transparent: true,
        opacity: 0.65,
      });
      const nodeRing = new THREE.Mesh(nodeRingGeom, nodeRingMat);
      nodeRing.rotation.x = Math.PI / 2.2;
      nodeGroup.add(nodeRing);

      scene.add(nodeGroup);
      nodeObjects.push({
        data,
        group: nodeGroup,
        solidMesh,
        wireMesh,
        nodeRing,
        basePos: data.pos.clone(),
        targetScale: 1.0,
        currentScale: 1.0,
      });

      // Curved Spline Bezier Cable connecting Node to Consensus Core
      const curve = new THREE.QuadraticBezierCurve3(
        data.pos,
        new THREE.Vector3(data.pos.x * 0.45, data.pos.y * 0.45, 3.2),
        new THREE.Vector3(0, 0, 0)
      );

      const curvePoints = curve.getPoints(60);
      const lineGeom = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const lineMat = new THREE.LineBasicMaterial({
        color: data.color,
        transparent: true,
        opacity: 0.5,
        linewidth: 2.0,
      });
      const lineMesh = new THREE.Line(lineGeom, lineMat);
      scene.add(lineMesh);
      splineCables.push({ curve, lineMesh, data });

      // Gliding 3D Transaction Data Capsules
      const packetLabels = [
        idx === 0 ? 'pay_Lw92: ₹14,500' : idx === 1 ? 'UTR90128: ₹14,210' : 'INV-0891: ₹14,500',
        idx === 0 ? 'pay_M812: ₹5,000' : idx === 1 ? 'UTR44910: ₹4,900' : 'INV-0902: ₹5,000',
      ];

      for (let p = 0; p < 2; p++) {
        const pGeom = new THREE.SphereGeometry(0.24, 16, 16);
        const pMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: data.color,
          emissiveIntensity: 0.9,
          roughness: 0.1,
          metalness: 0.9,
        });
        const pMesh = new THREE.Mesh(pGeom, pMat);
        scene.add(pMesh);

        packetObjects.push({
          mesh: pMesh,
          curve: curve,
          progress: (p / 2) + (idx * 0.33),
          speed: 0.005 + Math.random() * 0.002,
          label: packetLabels[p],
          colorHex: data.colorHex,
        });
      }
    });

    // 6. Ambient Floating Dust Particle Field
    const particleCount = 180;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const cRuby = new THREE.Color(0xe8384f);
    const cSilver = new THREE.Color(0x94a3b8);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 36;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 24;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 18;

      const col = Math.random() > 0.4 ? cRuby : cSilver;
      particleColors[i * 3] = col.r;
      particleColors[i * 3 + 1] = col.g;
      particleColors[i * 3 + 2] = col.b;
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeom.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // 7. Mouse Raycasting & Dynamic Parallax
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);
    let targetCameraX = 0;
    let targetCameraY = 0;
    let currentCameraX = 0;
    let currentCameraY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      mouse.x = x;
      mouse.y = y;

      targetCameraX = x * 3.5;
      targetCameraY = y * 3.5;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // 8. Screen Projection Helper (World -> Screen Coordinates)
    const toScreenPosition = (pos) => {
      const v = pos.clone().project(camera);
      const hw = width / 2;
      const hh = height / 2;
      return {
        x: v.x * hw + hw,
        y: -v.y * hh + hh,
        visible: v.z < 1,
      };
    };

    // 9. Animation Render Loop
    let animationFrameId;
    let clock = new THREE.Clock();
    let lastHoveredId = null;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Camera parallax damping
      currentCameraX += (targetCameraX - currentCameraX) * 0.06;
      currentCameraY += (targetCameraY - currentCameraY) * 0.06;
      camera.position.x = currentCameraX;
      camera.position.y = currentCameraY;
      camera.lookAt(0, 0, 0);

      // Core rotation & gimbal rings
      crystalMesh.rotation.x = elapsed * 0.25;
      crystalMesh.rotation.y = elapsed * 0.35;
      innerNucleus.rotation.y = -elapsed * 0.5;

      gimbalRings.forEach((ring) => {
        ring.mesh.rotation.x += ring.speedX;
        ring.mesh.rotation.y += ring.speedY;
      });

      // Node harmonic floating & raycast scale interpolation
      raycaster.setFromCamera(mouse, camera);
      const interactiveMeshes = nodeObjects.map((n) => n.solidMesh);
      const intersects = raycaster.intersectObjects(interactiveMeshes);

      let currentHoverId = null;
      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const matched = nodeObjects.find((n) => n.solidMesh === hitMesh);
        if (matched) {
          currentHoverId = matched.data.id;
        }
      }

      if (currentHoverId !== lastHoveredId) {
        lastHoveredId = currentHoverId;
        setHoveredNode(currentHoverId);
        if (currentHoverId) {
          try {
            soundManager.playLaserHum();
          } catch (_) {}
        }
      }

      nodeObjects.forEach((item, idx) => {
        const isHit = currentHoverId === item.data.id;
        item.targetScale = isHit ? 1.28 : 1.0;
        item.currentScale += (item.targetScale - item.currentScale) * 0.12;

        item.group.scale.set(item.currentScale, item.currentScale, item.currentScale);

        const offset = idx * 2.1;
        item.group.position.y = item.basePos.y + Math.sin(elapsed * 1.5 + offset) * 0.25;
        item.group.position.x = item.basePos.x + Math.cos(elapsed * 1.2 + offset) * 0.15;

        item.solidMesh.rotation.y = elapsed * 0.8 + offset;
        item.wireMesh.rotation.x = -elapsed * 0.6 + offset;
        item.nodeRing.rotation.z = elapsed * 1.2 + offset;

        // Boost emissive on hover
        item.solidMesh.material.emissiveIntensity = isHit ? 1.1 : 0.45;
      });

      // Animate Gliding Transaction Data Packets along Splines
      packetObjects.forEach((p) => {
        p.progress = (p.progress + p.speed) % 1.0;
        const pos = p.curve.getPointAt(p.progress);
        p.mesh.position.copy(pos);

        const scale = 1.0 + Math.sin(elapsed * 8.0) * 0.2;
        p.mesh.scale.set(scale, scale, scale);
      });

      // Update Floating HUD Labels Screen Positions (Throttled Every Frame)
      const positions = {};
      nodeObjects.forEach((n) => {
        positions[n.data.id] = toScreenPosition(n.group.position);
      });
      positions['core'] = toScreenPosition(new THREE.Vector3(0, 0, 0));
      setNodeScreenPositions(positions);

      // Packet Screen Coordinates
      const packetPos = packetObjects.map((p) => ({
        ...toScreenPosition(p.mesh.position),
        label: p.label,
        colorHex: p.colorHex,
      }));
      setPacketScreenPositions(packetPos);

      // Subtle particle field drift
      particles.rotation.y = elapsed * 0.015;

      renderer.render(scene, camera);
    };

    animate();

    // 10. Resize Handling
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
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
      className={`relative w-full h-full select-none overflow-hidden ${className}`}
      style={{ minHeight: '440px' }}
    >
      {/* 🏷️ DYNAMIC 3D HOLOGRAPHIC HUD LABELS LAYER */}
      <div className="absolute inset-0 pointer-events-none z-10">
        
        {/* Node 1: Razorpay Gateway Hub Label */}
        {nodeScreenPositions.gateway && (
          <div
            className={`absolute transition-transform duration-75 -translate-x-1/2 -translate-y-full ${
              hoveredNode === 'gateway' ? 'scale-110' : 'scale-100'
            }`}
            style={{
              left: `${nodeScreenPositions.gateway.x}px`,
              top: `${nodeScreenPositions.gateway.y - 28}px`,
            }}
          >
            <div className="luxury-glass-card px-3 py-1.5 rounded-xl border border-rose-200/90 bg-white/95 shadow-lg shadow-rose-500/10 flex flex-col items-center text-center space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E8384F] breathing-dot" />
                <span className="text-[11px] font-display font-bold text-slate-900">
                  Razorpay Gateway Hub
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                <span>Instant Auth (T+0)</span>
                <span>•</span>
                <span className="text-[#E8384F] font-bold">MDR 2.0%</span>
              </div>
            </div>
          </div>
        )}

        {/* Node 2: Corporate Bank CMS Rail Label */}
        {nodeScreenPositions.bank && (
          <div
            className={`absolute transition-transform duration-75 -translate-x-1/2 -translate-y-full ${
              hoveredNode === 'bank' ? 'scale-110' : 'scale-100'
            }`}
            style={{
              left: `${nodeScreenPositions.bank.x}px`,
              top: `${nodeScreenPositions.bank.y - 28}px`,
            }}
          >
            <div className="luxury-glass-card px-3 py-1.5 rounded-xl border border-amber-200/90 bg-white/95 shadow-lg shadow-amber-500/10 flex flex-col items-center text-center space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 breathing-dot" />
                <span className="text-[11px] font-display font-bold text-slate-900">
                  Bank CMS Statement Rail
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                <span>HDFC / ICICI / SBI</span>
                <span>•</span>
                <span className="text-amber-700 font-bold">16-Digit UTRs</span>
              </div>
            </div>
          </div>
        )}

        {/* Node 3: General Ledger Sovereign Node Label */}
        {nodeScreenPositions.erp && (
          <div
            className={`absolute transition-transform duration-75 -translate-x-1/2 translate-y-6 ${
              hoveredNode === 'erp' ? 'scale-110' : 'scale-100'
            }`}
            style={{
              left: `${nodeScreenPositions.erp.x}px`,
              top: `${nodeScreenPositions.erp.y + 28}px`,
            }}
          >
            <div className="luxury-glass-card px-3 py-1.5 rounded-xl border border-indigo-200/90 bg-white/95 shadow-lg shadow-indigo-500/10 flex flex-col items-center text-center space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600 breathing-dot" />
                <span className="text-[11px] font-display font-bold text-slate-900">
                  Tally Prime / SAP ERP
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                <span>Sales Journal #401</span>
                <span>•</span>
                <span className="text-indigo-700 font-bold">194-O TDS</span>
              </div>
            </div>
          </div>
        )}

        {/* Center: Consensus Singularity Core Label */}
        {nodeScreenPositions.core && (
          <div
            className="absolute transition-transform duration-75 -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${nodeScreenPositions.core.x}px`,
              top: `${nodeScreenPositions.core.y + 54}px`,
            }}
          >
            <div className="px-2.5 py-1 rounded-full bg-white/90 border border-slate-200/90 shadow-md backdrop-blur-md flex items-center gap-2 text-[10px] font-mono text-slate-700 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8384F] animate-pulse" />
              <span>DOUBLE-LOCK CONSENSUS (≥ 0.75 GATE)</span>
            </div>
          </div>
        )}

        {/* Floating Transaction Data Packet Mini-Badges */}
        {packetScreenPositions.map((p, idx) => (
          <div
            key={idx}
            className="absolute -translate-x-1/2 -translate-y-full opacity-90 transition-all duration-75"
            style={{
              left: `${p.x}px`,
              top: `${p.y - 8}px`,
            }}
          >
            <span
              className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-white/95 border shadow-2xs whitespace-nowrap"
              style={{ borderColor: `${p.colorHex}40`, color: p.colorHex }}
            >
              {p.label}
            </span>
          </div>
        ))}
      </div>

      {/* Top Left HUD Telemetry */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 border border-slate-200/80 shadow-xs text-xs font-mono font-bold text-slate-800 backdrop-blur-md pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[#E8384F] animate-ping" />
        <span>3D MULTI-RAIL TOPOLOGY • GLIDING TRANSACTIONS</span>
      </div>

      {/* Bottom Right Interactive Hint */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 px-3 py-1 rounded-xl bg-white/85 border border-slate-200/80 shadow-2xs text-[11px] font-mono text-slate-500 backdrop-blur-md pointer-events-none">
        <span>Hover Nodes to Inspect Live Rail Health</span>
      </div>
    </div>
  );
}
