import { useCallback, useEffect, useRef, useState } from 'react';
import { entities, relationships } from '@/lib/data';
import { RelationshipState } from '@/lib/types';
import { Link } from 'react-router-dom';

interface Node {
  id: string;
  label: string;
  designation: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Edge {
  source: string;
  target: string;
  state: RelationshipState;
}

const stateColors: Record<RelationshipState, string> = {
  strangers: '#666',
  contact: '#6B8DD6',
  resonance: '#2DD4BF',
  bond: '#34D399',
  drift: '#60A5FA',
  dormant: '#737373',
  rupture: '#EF4444',
};

export function NetworkGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const animationRef = useRef<number>();

  // Initialize nodes and edges
  useEffect(() => {
    const initialNodes: Node[] = entities.map((entity, index) => {
      const angle = (index * 2 * Math.PI) / entities.length;
      const radius = 150;
      return {
        id: entity.id,
        label: entity.name,
        designation: entity.designation,
        x: 300 + Math.cos(angle) * radius,
        y: 250 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
      };
    });

    const initialEdges: Edge[] = relationships.map(rel => ({
      source: rel.entityAId,
      target: rel.entityBId,
      state: rel.state,
    }));

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, []);

  // Force simulation
  const simulate = useCallback(() => {
    setNodes(prevNodes => {
      const newNodes = prevNodes.map(node => ({ ...node }));

      // Apply forces
      for (let i = 0; i < newNodes.length; i++) {
        for (let j = i + 1; j < newNodes.length; j++) {
          const dx = newNodes[j].x - newNodes[i].x;
          const dy = newNodes[j].y - newNodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          
          // Repulsion
          const repulsion = 5000 / (dist * dist);
          const fx = (dx / dist) * repulsion;
          const fy = (dy / dist) * repulsion;
          
          newNodes[i].vx -= fx;
          newNodes[i].vy -= fy;
          newNodes[j].vx += fx;
          newNodes[j].vy += fy;
        }

        // Center gravity
        const cx = 300 - newNodes[i].x;
        const cy = 250 - newNodes[i].y;
        newNodes[i].vx += cx * 0.001;
        newNodes[i].vy += cy * 0.001;

        // Apply velocity with damping
        newNodes[i].x += newNodes[i].vx * 0.1;
        newNodes[i].y += newNodes[i].vy * 0.1;
        newNodes[i].vx *= 0.95;
        newNodes[i].vy *= 0.95;
      }

      // Attraction along edges
      edges.forEach(edge => {
        const source = newNodes.find(n => n.id === edge.source);
        const target = newNodes.find(n => n.id === edge.target);
        if (source && target) {
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const attraction = (dist - 180) * 0.01;
          const fx = (dx / dist) * attraction;
          const fy = (dy / dist) * attraction;
          source.vx += fx;
          source.vy += fy;
          target.vx -= fx;
          target.vy -= fy;
        }
      });

      return newNodes;
    });

    animationRef.current = requestAnimationFrame(simulate);
  }, [edges]);

  // Start simulation
  useEffect(() => {
    if (nodes.length > 0) {
      animationRef.current = requestAnimationFrame(simulate);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nodes.length, simulate]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = 600 * dpr;
    canvas.height = 500 * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, 600, 500);

    // Draw edges
    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);
      if (!source || !target) return;

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = stateColors[edge.state];
      ctx.lineWidth = edge.state === 'resonance' ? 2 : 1;
      ctx.globalAlpha = edge.state === 'dormant' ? 0.3 : 0.6;
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Draw nodes
    nodes.forEach(node => {
      const isHovered = hoveredNode === node.id;
      const radius = isHovered ? 28 : 24;

      // Glow effect
      if (isHovered) {
        const gradient = ctx.createRadialGradient(
          node.x, node.y, radius,
          node.x, node.y, radius * 2
        );
        gradient.addColorStop(0, 'rgba(45, 212, 191, 0.3)');
        gradient.addColorStop(1, 'rgba(45, 212, 191, 0)');
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? 'hsl(220, 15%, 12%)' : 'hsl(220, 15%, 8%)';
      ctx.fill();
      ctx.strokeStyle = isHovered ? 'hsl(175, 60%, 45%)' : 'hsl(220, 15%, 20%)';
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();

      // Label
      ctx.fillStyle = isHovered ? 'hsl(175, 60%, 45%)' : 'hsl(220, 10%, 85%)';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);

      // Designation below
      ctx.fillStyle = 'hsl(220, 10%, 50%)';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillText(node.designation, node.x, node.y + radius + 12);
    });
  }, [nodes, edges, hoveredNode]);

  // Mouse interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hovered = nodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 24;
    });

    setHoveredNode(hovered?.id || null);
  };

  return (
    <div ref={containerRef} className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-foreground">Relationship Network</h2>
        <Link 
          to="/graph" 
          className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
        >
          Expand →
        </Link>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={500}
        style={{ width: '100%', height: 'auto', cursor: hoveredNode ? 'pointer' : 'default' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredNode(null)}
        onClick={() => {
          if (hoveredNode) {
            window.location.href = `/entity/${hoveredNode}`;
          }
        }}
      />
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-border/30">
        {Object.entries(stateColors).map(([state, color]) => (
          <div key={state} className="flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: color, opacity: state === 'dormant' ? 0.3 : 1 }}
            />
            <span className="text-xs text-muted-foreground capitalize">{state}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
