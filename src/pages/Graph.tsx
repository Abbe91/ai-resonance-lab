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

  // Initialize nodes and edges from realtime data
  useEffect(() => {
    if (agentsLoading || relationshipsLoading) return;

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const radius = Math.min(dimensions.width, dimensions.height) * 0.3;

    // Only show agents that have relationships
    const agentIdsWithRelationships = new Set(
      relationships.flatMap(r => [r.entityAId, r.entityBId])
    );
    const connectedAgents = agents.filter(a => agentIdsWithRelationships.has(a.id));

    // Fall back to first 10 agents if no relationships yet
    const displayAgents = connectedAgents.length > 0 ? connectedAgents : agents.slice(0, 10);

    const initialNodes: Node[] = displayAgents.map((agent, index) => {
      const angle = (index * 2 * Math.PI) / displayAgents.length - Math.PI / 2;
      return {
        id: agent.id,
        label: agent.name,
        designation: agent.designation,
        x: centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 50,
        y: centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 50,
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

  // Force simulation
  const simulate = useCallback(() => {
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    setNodes(prevNodes => {
      if (prevNodes.length === 0) return prevNodes;

      const newNodes = prevNodes.map(node => ({ ...node }));

      // Apply forces
      for (let i = 0; i < newNodes.length; i++) {
        for (let j = i + 1; j < newNodes.length; j++) {
          const dx = newNodes[j].x - newNodes[i].x;
          const dy = newNodes[j].y - newNodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          
          // Repulsion
          const repulsion = 15000 / (dist * dist);
          const fx = (dx / dist) * repulsion;
          const fy = (dy / dist) * repulsion;
          
          newNodes[i].vx -= fx;
          newNodes[i].vy -= fy;
          newNodes[j].vx += fx;
          newNodes[j].vy += fy;
        }

        // Center gravity
        const cx = centerX - newNodes[i].x;
        const cy = centerY - newNodes[i].y;
        newNodes[i].vx += cx * 0.0005;
        newNodes[i].vy += cy * 0.0005;

        // Apply velocity with damping
        newNodes[i].x += newNodes[i].vx * 0.1;
        newNodes[i].y += newNodes[i].vy * 0.1;
        newNodes[i].vx *= 0.95;
        newNodes[i].vy *= 0.95;

        // Boundary constraints
        const margin = 80;
        newNodes[i].x = Math.max(margin, Math.min(dimensions.width - margin, newNodes[i].x));
        newNodes[i].y = Math.max(margin, Math.min(dimensions.height - margin, newNodes[i].y));
      }

      // Attraction along edges
      edges.forEach(edge => {
        const source = newNodes.find(n => n.id === edge.source);
        const target = newNodes.find(n => n.id === edge.target);
        if (source && target) {
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const idealDist = 250;
          const attraction = (dist - idealDist) * 0.005;
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
  }, [dimensions, edges]);

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

    // Draw nodes
    nodes.forEach(node => {
      const isHovered = hoveredNode === node.id;
      const radius = isHovered ? 40 : 35;

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

      // Outer ring
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 4, 0, Math.PI * 2);
      ctx.strokeStyle = isHovered ? 'hsl(175, 60%, 45%)' : 'hsl(220, 15%, 15%)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? 'hsl(220, 15%, 12%)' : 'hsl(220, 15%, 7%)';
      ctx.fill();
      ctx.strokeStyle = isHovered ? 'hsl(175, 60%, 45%)' : 'hsl(220, 15%, 25%)';
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();

      // Label
      ctx.fillStyle = isHovered ? 'hsl(175, 60%, 45%)' : 'hsl(220, 10%, 85%)';
      ctx.font = `${isHovered ? 14 : 13}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);

      // Designation below
      ctx.fillStyle = 'hsl(220, 10%, 50%)';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(node.designation, node.x, node.y + radius + 16);
    });
  }, [nodes, edges, hoveredNode, selectedEdge, dimensions]);

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
                  {nodes.length} nodes · {edges.length} connections
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
