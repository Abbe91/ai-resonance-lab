import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRealtimeAgents } from '@/hooks/useRealtimeAgents';
import { useRealtimeRelationships } from '@/hooks/useRealtimeRelationships';
import { supabase } from '@/integrations/supabase/client';

interface Node {
  id: string;
  label: string;
  designation: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isArchetype?: boolean;
  ancestorArchetypeId?: string | null;
}

interface Edge {
  source: string;
  target: string;
  state: string;
}

interface Archetype {
  id: string;
  name: string;
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

const lineageColor = '#A78BFA'; // Soft violet for lineage edges

export function NetworkGraph() {
  const { agents, loading: agentsLoading } = useRealtimeAgents();
  const { relationships, loading: relationshipsLoading } = useRealtimeRelationships();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [connectedAgentIds, setConnectedAgentIds] = useState<Set<string>>(new Set());
  const [showLineage, setShowLineage] = useState(false);
  const [archetypes, setArchetypes] = useState<Archetype[]>([]);
  const animationRef = useRef<number>();

  // Fetch archetypes
  useEffect(() => {
    const fetchArchetypes = async () => {
      const { data } = await supabase
        .from('ancestor_archetypes')
        .select('id, name');
      if (data) setArchetypes(data);
    };
    fetchArchetypes();
  }, []);

  // Initialize nodes and edges from ALL agents
  useEffect(() => {
    if (agentsLoading || relationshipsLoading) return;

    // Track connected agents for styling
    const agentIdsWithRelationships = new Set(
      relationships.flatMap(r => [r.entityAId, r.entityBId])
    );
    setConnectedAgentIds(agentIdsWithRelationships);

    // Show ALL agents - use spiral layout for large populations
    const totalAgents = agents.length;
    const spiralSpacing = Math.max(30, Math.min(60, 150 / Math.sqrt(totalAgents)));

    const initialNodes: Node[] = agents.map((agent, index) => {
      const angle = index * 0.5;
      const radius = spiralSpacing * Math.sqrt(index + 1);
      const maxRadius = 180;
      const clampedRadius = Math.min(radius, maxRadius);
      
      return {
        id: agent.id,
        label: agent.name,
        designation: agent.designation,
        x: 300 + Math.cos(angle) * clampedRadius + (Math.random() - 0.5) * 20,
        y: 250 + Math.sin(angle) * clampedRadius + (Math.random() - 0.5) * 20,
        vx: 0,
        vy: 0,
        ancestorArchetypeId: agent.ancestorArchetypeId || null,
      };
    });

    // Add archetype nodes when lineage view is active
    if (showLineage && archetypes.length > 0) {
      const archetypeNodes: Node[] = archetypes.map((archetype, index) => {
        const angle = (index / archetypes.length) * Math.PI * 2 - Math.PI / 2;
        const radius = 220;
        return {
          id: `archetype-${archetype.id}`,
          label: archetype.name,
          designation: 'ARCHETYPE',
          x: 300 + Math.cos(angle) * radius,
          y: 250 + Math.sin(angle) * radius,
          vx: 0,
          vy: 0,
          isArchetype: true,
        };
      });
      initialNodes.push(...archetypeNodes);
    }

    const initialEdges: Edge[] = relationships.map(rel => ({
      source: rel.entityAId,
      target: rel.entityBId,
      state: rel.state,
    }));

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [agents, relationships, agentsLoading, relationshipsLoading, showLineage, archetypes]);

  // Force simulation - optimized for large populations
  const simulate = useCallback(() => {
    setNodes(prevNodes => {
      if (prevNodes.length === 0) return prevNodes;
      const newNodes = prevNodes.map(node => ({ ...node }));
      const nodeCount = newNodes.length;
      
      // Scale forces for population size
      const repulsionStrength = nodeCount > 100 ? 800 : nodeCount > 50 ? 2000 : 5000;

      // Apply forces
      for (let i = 0; i < newNodes.length; i++) {
        for (let j = i + 1; j < newNodes.length; j++) {
          const dx = newNodes[j].x - newNodes[i].x;
          const dy = newNodes[j].y - newNodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          
          // Skip distant nodes for performance
          if (nodeCount > 100 && dist > 150) continue;
          
          // Softer repulsion for isolated nodes
          const isIConnected = connectedAgentIds.has(newNodes[i].id);
          const isJConnected = connectedAgentIds.has(newNodes[j].id);
          const modifier = (!isIConnected && !isJConnected) ? 0.3 : 1;
          
          const repulsion = (repulsionStrength * modifier) / (dist * dist);
          const fx = (dx / dist) * repulsion;
          const fy = (dy / dist) * repulsion;
          
          newNodes[i].vx -= fx;
          newNodes[i].vy -= fy;
          newNodes[j].vx += fx;
          newNodes[j].vy += fy;
        }

        // Center gravity
        const isConnected = connectedAgentIds.has(newNodes[i].id);
        const gravity = isConnected ? 0.001 : 0.0005;
        const cx = 300 - newNodes[i].x;
        const cy = 250 - newNodes[i].y;
        newNodes[i].vx += cx * gravity;
        newNodes[i].vy += cy * gravity;

        // Apply velocity with damping
        newNodes[i].x += newNodes[i].vx * 0.1;
        newNodes[i].y += newNodes[i].vy * 0.1;
        newNodes[i].vx *= 0.92;
        newNodes[i].vy *= 0.92;
        
        // Boundary constraints
        const margin = 30;
        newNodes[i].x = Math.max(margin, Math.min(600 - margin, newNodes[i].x));
        newNodes[i].y = Math.max(margin, Math.min(500 - margin, newNodes[i].y));
      }

      // Attraction along edges
      edges.forEach(edge => {
        const source = newNodes.find(n => n.id === edge.source);
        const target = newNodes.find(n => n.id === edge.target);
        if (source && target) {
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const idealDist = nodeCount > 100 ? 80 : 120;
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
  }, [edges, connectedAgentIds]);

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

    // Draw lineage edges (dashed) when lineage view is active
    if (showLineage) {
      nodes.forEach(node => {
        if (node.isArchetype || !node.ancestorArchetypeId) return;
        
        const archetypeNode = nodes.find(n => n.id === `archetype-${node.ancestorArchetypeId}`);
        if (!archetypeNode) return;

        ctx.beginPath();
        ctx.setLineDash([4, 6]);
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(archetypeNode.x, archetypeNode.y);
        ctx.strokeStyle = lineageColor;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.25;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      });
    }

    // Draw relationship edges
    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);
      if (!source || !target) return;

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = stateColors[edge.state as RelationshipState] || '#666';
      ctx.lineWidth = edge.state === 'resonance' ? 2 : 1;
      ctx.globalAlpha = edge.state === 'dormant' ? 0.3 : 0.6;
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Draw nodes - with styling for isolated vs connected
    const agentNodes = nodes.filter(n => !n.isArchetype);
    const archetypeNodes = nodes.filter(n => n.isArchetype);
    const nodeCount = agentNodes.length;
    const baseRadius = nodeCount > 150 ? 10 : nodeCount > 80 ? 14 : 24;

    // Draw agent nodes
    agentNodes.forEach(node => {
      const isHovered = hoveredNode === node.id;
      const isConnected = connectedAgentIds.has(node.id);
      const radius = isHovered ? baseRadius + 4 : (isConnected ? baseRadius : baseRadius * 0.6);
      const baseOpacity = isConnected ? 1 : 0.3;

      // Glow effect for hovered
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

      ctx.globalAlpha = isHovered ? 1 : baseOpacity;

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? 'hsl(220, 15%, 12%)' : (isConnected ? 'hsl(220, 15%, 8%)' : 'hsl(220, 15%, 5%)');
      ctx.fill();
      ctx.strokeStyle = isHovered ? 'hsl(175, 60%, 45%)' : (isConnected ? 'hsl(220, 15%, 20%)' : 'hsl(220, 15%, 15%)');
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();

      // Label - only for connected or hovered in large graphs
      const showLabel = isHovered || (isConnected && nodeCount < 80) || nodeCount < 30;
      if (showLabel) {
        ctx.fillStyle = isHovered ? 'hsl(175, 60%, 45%)' : (isConnected ? 'hsl(220, 10%, 85%)' : 'hsl(220, 10%, 55%)');
        ctx.font = `${nodeCount > 80 ? 9 : 12}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.x, node.y);
      }

      // Designation below (only for hovered or small graphs with connected)
      if (isHovered || (isConnected && nodeCount < 30)) {
        ctx.fillStyle = 'hsl(220, 10%, 50%)';
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.fillText(node.designation, node.x, node.y + radius + 10);
      }

      ctx.globalAlpha = 1;
    });

    // Draw archetype nodes when lineage view is active
    if (showLineage) {
      archetypeNodes.forEach(node => {
        const isHovered = hoveredNode === node.id;
        const radius = 18;

        // Soft glow for archetypes
        const gradient = ctx.createRadialGradient(
          node.x, node.y, radius * 0.5,
          node.x, node.y, radius * 2
        );
        gradient.addColorStop(0, 'rgba(167, 139, 250, 0.15)');
        gradient.addColorStop(1, 'rgba(167, 139, 250, 0)');
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Archetype node - diamond shape
        ctx.beginPath();
        ctx.moveTo(node.x, node.y - radius);
        ctx.lineTo(node.x + radius, node.y);
        ctx.lineTo(node.x, node.y + radius);
        ctx.lineTo(node.x - radius, node.y);
        ctx.closePath();
        ctx.fillStyle = 'hsl(260, 20%, 10%)';
        ctx.fill();
        ctx.strokeStyle = isHovered ? lineageColor : 'hsl(260, 30%, 35%)';
        ctx.lineWidth = isHovered ? 2 : 1;
        ctx.stroke();

        // Label
        ctx.fillStyle = lineageColor;
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.x, node.y);

        // Designation
        ctx.fillStyle = 'hsl(260, 20%, 50%)';
        ctx.font = '7px JetBrains Mono, monospace';
        ctx.fillText(node.designation, node.x, node.y + radius + 8);
      });
    }
  }, [nodes, edges, hoveredNode, connectedAgentIds, showLineage]);

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

  if (agentsLoading || relationshipsLoading) {
    return (
      <div ref={containerRef} className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-foreground">Relationship Network</h2>
        </div>
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Loading network...</p>
          </div>
        </div>
      </div>
    );
  }

  const agentNodeCount = nodes.filter(n => !n.isArchetype).length;

  return (
    <div ref={containerRef} className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-medium text-foreground">Relationship Network</h2>
          <p className="text-xs font-mono text-muted-foreground/60 mt-1">
            {agentNodeCount} agents · {connectedAgentIds.size} connected · {edges.length} relationships
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowLineage(!showLineage)}
            className={`text-xs font-mono px-3 py-1.5 rounded-md border transition-colors ${
              showLineage 
                ? 'border-violet-500/50 bg-violet-500/10 text-violet-400' 
                : 'border-border/50 text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            {showLineage ? '◆ Lineage' : '◇ Lineage'}
          </button>
          <Link 
            to="/graph" 
            className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
          >
            Expand →
          </Link>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={500}
        style={{ width: '100%', height: 'auto', cursor: hoveredNode ? 'pointer' : 'default' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredNode(null)}
        onClick={() => {
          if (hoveredNode && !hoveredNode.startsWith('archetype-')) {
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
        {showLineage && (
          <div className="flex items-center gap-2">
            <span 
              className="w-3 h-3 rotate-45" 
              style={{ 
                backgroundColor: 'transparent', 
                border: `1.5px dashed ${lineageColor}`,
              }}
            />
            <span className="text-xs text-muted-foreground">lineage</span>
          </div>
        )}
      </div>
    </div>
  );
}
