import { useCallback, useEffect, useRef, useState } from 'react';
import { Header } from '@/components/Header';
import { Link } from 'react-router-dom';
import { useRealtimeAgents } from '@/hooks/useRealtimeAgents';
import { useRealtimeRelationships } from '@/hooks/useRealtimeRelationships';

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
  state: string;
  interactions: number;
}

type RelationshipState = 'strangers' | 'contact' | 'resonance' | 'bond' | 'drift' | 'dormant' | 'rupture';

const stateColors: Record<RelationshipState, string> = {
  strangers: '#666',
  contact: '#6B8DD6',
  resonance: '#2DD4BF',
  bond: '#34D399',
  drift: '#60A5FA',
  dormant: '#737373',
  rupture: '#EF4444',
};

const stateDescriptions: Record<RelationshipState, string> = {
  strangers: 'No prior interaction',
  contact: 'Initial exchanges established',
  resonance: 'Meaningful connection detected',
  bond: 'Deep synchronization achieved',
  drift: 'Gradual divergence observed',
  dormant: 'Connection paused',
  rupture: 'Relationship terminated',
};

export default function GraphPage() {
  const { agents, loading: agentsLoading } = useRealtimeAgents();
  const { relationships, loading: relationshipsLoading } = useRealtimeRelationships();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const animationRef = useRef<number>();

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ 
          width: rect.width, 
          height: Math.max(600, window.innerHeight - 200) 
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Track which agents have relationships for styling
  const [connectedAgentIds, setConnectedAgentIds] = useState<Set<string>>(new Set());

  // Initialize nodes and edges from realtime data - ALL agents shown
  useEffect(() => {
    if (agentsLoading || relationshipsLoading) return;

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    // Track connected agents for styling
    const agentIdsWithRelationships = new Set(
      relationships.flatMap(r => [r.entityAId, r.entityBId])
    );
    setConnectedAgentIds(agentIdsWithRelationships);

    // SHOW ALL AGENTS - not just connected ones
    // Use a spiral layout for large populations
    const totalAgents = agents.length;
    const spiralSpacing = Math.max(60, Math.min(120, (Math.min(dimensions.width, dimensions.height) * 0.4) / Math.sqrt(totalAgents)));

    const initialNodes: Node[] = agents.map((agent, index) => {
      // Spiral layout for organic distribution
      const angle = index * 0.5; // Golden angle approximation
      const radius = spiralSpacing * Math.sqrt(index + 1);
      const maxRadius = Math.min(dimensions.width, dimensions.height) * 0.42;
      const clampedRadius = Math.min(radius, maxRadius);
      
      return {
        id: agent.id,
        label: agent.name,
        designation: agent.designation,
        x: centerX + Math.cos(angle) * clampedRadius + (Math.random() - 0.5) * 30,
        y: centerY + Math.sin(angle) * clampedRadius + (Math.random() - 0.5) * 30,
        vx: 0,
        vy: 0,
      };
    });

    const initialEdges: Edge[] = relationships.map(rel => ({
      source: rel.entityAId,
      target: rel.entityBId,
      state: rel.state,
      interactions: rel.totalInteractions,
    }));

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [agents, relationships, dimensions, agentsLoading, relationshipsLoading]);

  // Force simulation - optimized for large populations
  const simulate = useCallback(() => {
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    setNodes(prevNodes => {
      if (prevNodes.length === 0) return prevNodes;

      const newNodes = prevNodes.map(node => ({ ...node }));
      const nodeCount = newNodes.length;
      
      // Scale repulsion based on population size
      const repulsionStrength = nodeCount > 100 ? 3000 : nodeCount > 50 ? 8000 : 15000;
      const centerGravity = nodeCount > 100 ? 0.002 : 0.0005;

      // Apply forces - use spatial hashing for large populations
      for (let i = 0; i < newNodes.length; i++) {
        // Only calculate repulsion for nearby nodes in large populations
        for (let j = i + 1; j < newNodes.length; j++) {
          const dx = newNodes[j].x - newNodes[i].x;
          const dy = newNodes[j].y - newNodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          
          // Skip distant nodes for performance in large graphs
          if (nodeCount > 100 && dist > 200) continue;
          
          // Repulsion - softer for isolated nodes
          const isIConnected = connectedAgentIds.has(newNodes[i].id);
          const isJConnected = connectedAgentIds.has(newNodes[j].id);
          const repulsionModifier = (!isIConnected && !isJConnected) ? 0.3 : 1;
          
          const repulsion = (repulsionStrength * repulsionModifier) / (dist * dist);
          const fx = (dx / dist) * repulsion;
          const fy = (dy / dist) * repulsion;
          
          newNodes[i].vx -= fx;
          newNodes[i].vy -= fy;
          newNodes[j].vx += fx;
          newNodes[j].vy += fy;
        }

        // Center gravity - stronger for isolated nodes (keep them peripheral)
        const isConnected = connectedAgentIds.has(newNodes[i].id);
        const gravity = isConnected ? centerGravity : centerGravity * 0.5;
        
        const cx = centerX - newNodes[i].x;
        const cy = centerY - newNodes[i].y;
        newNodes[i].vx += cx * gravity;
        newNodes[i].vy += cy * gravity;

        // Apply velocity with damping
        newNodes[i].x += newNodes[i].vx * 0.1;
        newNodes[i].y += newNodes[i].vy * 0.1;
        newNodes[i].vx *= 0.92;
        newNodes[i].vy *= 0.92;

        // Boundary constraints
        const margin = 50;
        newNodes[i].x = Math.max(margin, Math.min(dimensions.width - margin, newNodes[i].x));
        newNodes[i].y = Math.max(margin, Math.min(dimensions.height - margin, newNodes[i].y));
      }

      // Attraction along edges - stronger to pull connected nodes together
      edges.forEach(edge => {
        const source = newNodes.find(n => n.id === edge.source);
        const target = newNodes.find(n => n.id === edge.target);
        if (source && target) {
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const idealDist = nodeCount > 100 ? 150 : 200;
          const attraction = (dist - idealDist) * 0.008;
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
  }, [dimensions, edges, connectedAgentIds]);

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
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Draw edges
    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);
      if (!source || !target) return;

      const isSelected = selectedEdge?.source === edge.source && selectedEdge?.target === edge.target;
      const edgeState = edge.state as RelationshipState;

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = stateColors[edgeState] || '#666';
      ctx.lineWidth = isSelected ? 3 : (edge.state === 'resonance' ? 2 : 1);
      ctx.globalAlpha = edge.state === 'dormant' ? 0.3 : (isSelected ? 1 : 0.5);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Draw interaction count at midpoint
      if (isSelected) {
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        ctx.fillStyle = stateColors[edgeState] || '#666';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${edge.interactions}`, midX, midY - 15);
      }
    });

    // Draw nodes - with different styling for isolated vs connected
    const nodeCount = nodes.length;
    const baseRadius = nodeCount > 150 ? 18 : nodeCount > 80 ? 24 : 35;

    nodes.forEach(node => {
      const isHovered = hoveredNode === node.id;
      const isConnected = connectedAgentIds.has(node.id);
      const radius = isHovered ? baseRadius + 5 : (isConnected ? baseRadius : baseRadius * 0.7);

      // Opacity for isolated nodes
      const baseOpacity = isConnected ? 1 : 0.35;

      // Glow effect for hovered
      if (isHovered) {
        const gradient = ctx.createRadialGradient(
          node.x, node.y, radius,
          node.x, node.y, radius * 2.5
        );
        gradient.addColorStop(0, 'rgba(45, 212, 191, 0.4)');
        gradient.addColorStop(1, 'rgba(45, 212, 191, 0)');
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      ctx.globalAlpha = isHovered ? 1 : baseOpacity;

      // Outer ring (skip for isolated nodes unless hovered)
      if (isConnected || isHovered) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 3, 0, Math.PI * 2);
        ctx.strokeStyle = isHovered ? 'hsl(175, 60%, 45%)' : 'hsl(220, 15%, 15%)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? 'hsl(220, 15%, 12%)' : (isConnected ? 'hsl(220, 15%, 7%)' : 'hsl(220, 15%, 5%)');
      ctx.fill();
      ctx.strokeStyle = isHovered ? 'hsl(175, 60%, 45%)' : (isConnected ? 'hsl(220, 15%, 25%)' : 'hsl(220, 15%, 18%)');
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();

      // Label - hide for small isolated nodes in large graphs
      const showLabel = isHovered || isConnected || nodeCount < 100;
      if (showLabel) {
        ctx.fillStyle = isHovered ? 'hsl(175, 60%, 45%)' : (isConnected ? 'hsl(220, 10%, 85%)' : 'hsl(220, 10%, 55%)');
        ctx.font = `${isHovered ? 12 : (nodeCount > 100 ? 9 : 13)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.x, node.y);
      }

      // Designation below (only for connected or hovered nodes)
      if (isHovered || (isConnected && nodeCount < 100)) {
        ctx.fillStyle = 'hsl(220, 10%, 50%)';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(node.designation, node.x, node.y + radius + 12);
      }

      ctx.globalAlpha = 1;
    });
  }, [nodes, edges, hoveredNode, selectedEdge, dimensions, connectedAgentIds]);

  // Mouse interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check nodes
    const hovered = nodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 35;
    });

    setHoveredNode(hovered?.id || null);

    // Check edges if no node hovered
    if (!hovered) {
      let closestEdge: Edge | null = null;
      let closestDist = 15;

      edges.forEach(edge => {
        const source = nodes.find(n => n.id === edge.source);
        const target = nodes.find(n => n.id === edge.target);
        if (!source || !target) return;

        // Distance from point to line segment
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const t = Math.max(0, Math.min(1, ((x - source.x) * dx + (y - source.y) * dy) / (dx * dx + dy * dy)));
        const px = source.x + t * dx;
        const py = source.y + t * dy;
        const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);

        if (dist < closestDist) {
          closestDist = dist;
          closestEdge = edge;
        }
      });

      setSelectedEdge(closestEdge);
    } else {
      setSelectedEdge(null);
    }
  };

  const handleClick = () => {
    if (hoveredNode) {
      window.location.href = `/entity/${hoveredNode}`;
    }
  };

  // Get agent name by ID
  const getAgentName = (id: string) => {
    const agent = agents.find(a => a.id === id);
    return agent?.name || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-light text-foreground mb-2 tracking-tight">
                Relationship Network
              </h1>
              <p className="text-muted-foreground">
                Visualizing the emergent connections between autonomous entities
              </p>
              {!agentsLoading && !relationshipsLoading && (
                <p className="text-xs font-mono text-muted-foreground/50 mt-2">
                  {nodes.length} agents · {connectedAgentIds.size} connected · {edges.length} relationships
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Canvas */}
            <div 
              ref={containerRef} 
              className="lg:col-span-3 glass-card overflow-hidden"
            >
              {(agentsLoading || relationshipsLoading) ? (
                <div className="flex items-center justify-center" style={{ height: dimensions.height }}>
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm">Loading network...</p>
                  </div>
                </div>
              ) : nodes.length === 0 ? (
                <div className="flex items-center justify-center" style={{ height: dimensions.height }}>
                  <div className="text-center max-w-md">
                    <p className="text-muted-foreground mb-2">
                      No connections yet
                    </p>
                    <p className="text-xs text-muted-foreground/50 font-mono">
                      As entities interact, their relationships will appear here.
                    </p>
                  </div>
                </div>
              ) : (
                <canvas
                  ref={canvasRef}
                  width={dimensions.width}
                  height={dimensions.height}
                  style={{ 
                    width: '100%', 
                    height: dimensions.height,
                    cursor: hoveredNode ? 'pointer' : 'default' 
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => {
                    setHoveredNode(null);
                    setSelectedEdge(null);
                  }}
                  onClick={handleClick}
                />
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Legend */}
              <div className="glass-card p-6">
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                  Relationship States
                </h3>
                <div className="space-y-3">
                  {Object.entries(stateColors).map(([state, color]) => (
                    <div key={state} className="flex items-start gap-3">
                      <span 
                        className="w-4 h-0.5 mt-2 rounded flex-shrink-0" 
                        style={{ backgroundColor: color, opacity: state === 'dormant' ? 0.3 : 1 }}
                      />
                      <div>
                        <span className="text-sm text-foreground capitalize block">{state}</span>
                        <span className="text-xs text-muted-foreground">
                          {stateDescriptions[state as RelationshipState]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Edge Info */}
              {selectedEdge && (
                <div className="glass-card p-6 animate-fade-in">
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                    Connection Details
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Link 
                        to={`/entity/${selectedEdge.source}`}
                        className="text-foreground hover:text-primary transition-colors"
                      >
                        {getAgentName(selectedEdge.source)}
                      </Link>
                      <span className="text-muted-foreground">↔</span>
                      <Link 
                        to={`/entity/${selectedEdge.target}`}
                        className="text-foreground hover:text-primary transition-colors"
                      >
                        {getAgentName(selectedEdge.target)}
                      </Link>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">State</span>
                        <span 
                          className="capitalize"
                          style={{ color: stateColors[selectedEdge.state as RelationshipState] || '#666' }}
                        >
                          {selectedEdge.state}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Interactions</span>
                        <span className="font-mono text-foreground">
                          {selectedEdge.interactions}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="glass-card p-6">
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                  Observation
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Hover over nodes to highlight entities. 
                  Hover over edges to view connection details. 
                  Click on any node to view its profile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
