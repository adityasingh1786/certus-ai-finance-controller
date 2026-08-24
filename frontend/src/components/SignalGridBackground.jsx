import React, { useEffect, useRef } from 'react';

/**
 * Section 2.5: The Signal Grid Background
 * A sparse network graph of 64px dot grid, 16 drifting cyan nodes,
 * and periodic animated lines representing ambient reconciliation links.
 * Opacity never exceeds 25%.
 */
export default function SignalGridBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 16 Drifting Cyan Nodes
    const nodeCount = 16;
    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25, // slow drifting
        vy: (Math.random() - 0.5) * 0.25,
        radius: 3,
      });
    }

    // Dynamic Connecting Lines (Reconciliation Metaphor)
    let activeLinks = [];
    let lastLinkTime = Date.now();

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Static Dot Grid (~64px spacing, 15% opacity)
      const gridSize = 64;
      ctx.fillStyle = 'rgba(92, 92, 104, 0.15)';
      for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 2. Update & Draw Drifting Nodes (25% opacity cyan)
      ctx.fillStyle = 'rgba(79, 209, 255, 0.35)';
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0) node.x = width;
        if (node.x > width) node.x = 0;
        if (node.y < 0) node.y = height;
        if (node.y > height) node.y = 0;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Trigger new link every 4-8 seconds
      const now = Date.now();
      if (now - lastLinkTime > 4000 + Math.random() * 3000) {
        const i1 = Math.floor(Math.random() * nodes.length);
        let i2 = Math.floor(Math.random() * nodes.length);
        while (i2 === i1) i2 = Math.floor(Math.random() * nodes.length);

        activeLinks.push({
          source: nodes[i1],
          target: nodes[i2],
          startTime: now,
          duration: 2800, // 800ms draw + 2000ms fade
        });
        lastLinkTime = now;
      }

      // 4. Render Active Links
      activeLinks = activeLinks.filter((link) => {
        const elapsed = now - link.startTime;
        if (elapsed > link.duration) return false;

        let alpha = 0.25;
        if (elapsed < 800) {
          alpha = (elapsed / 800) * 0.25;
        } else {
          alpha = (1 - (elapsed - 800) / 2000) * 0.25;
        }

        ctx.strokeStyle = `rgba(79, 209, 255, ${Math.max(0, alpha)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(link.source.x, link.source.y);
        ctx.lineTo(link.target.x, link.target.y);
        ctx.stroke();

        return true;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.85 }}
    />
  );
}
