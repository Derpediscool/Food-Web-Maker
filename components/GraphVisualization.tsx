// components/GraphVisualization.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { Creature } from '@/types/Creature';

interface GraphVisualizationProps {
  creatures: Creature[];
  options: {
    mode: string;
    physics: {
      springLength: number;
      springConstant: number;
      centralGravity: number;
      gravitationalConstant: number;
    };
    layout: {
      hierarchicalDirection: string;
      hierarchicalSortMethod: string;
    };
  };
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({ creatures, options }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create nodes and edges from creatures
    const nodes = new DataSet(
      creatures.map((creature) => ({
        id: creature.name,
        label: creature.name,
        shape: 'box',
        color: {
          background: creature.color || '#666666',
          border: creature.color || '#666666',
          highlight: {
            background: creature.color || '#666666',
            border: creature.color || '#666666',
          }
        },
        font: {
          color: '#ffffff',
          size: 16,
          face: 'arial',
          strokeWidth: 2,
          strokeColor: '#000000',
        },
        padding: 10,
        shapeProperties: {
          borderRadius: 8
        }
      }))
    );

    const edges = new DataSet(
      creatures.flatMap((creature, creatureIndex) =>
        creature.eats.map((prey, preyIndex) => ({
          id: `${creatureIndex}-${preyIndex}`,
          from: creature.name,
          to: prey,
          arrows: 'to',
          color: '#666666',
          width: 2,
        }))
      )
    );

    const data = { nodes, edges };

    const networkOptions = {
      layout: {
        randomSeed: 2,
        improvedLayout: true,
        hierarchical: {
          enabled: options.mode === 'hierarchical',
          direction: options.layout.hierarchicalDirection,
          sortMethod: options.layout.hierarchicalSortMethod,
          nodeSpacing: 150,
          levelSeparation: 150
        }
      },
      physics: {
        enabled: true,
        solver: options.mode === 'circular' ? 'forceAtlas2Based' : 'barnesHut',
        forceAtlas2Based: {
          gravitationalConstant: options.physics.gravitationalConstant,
          centralGravity: options.physics.centralGravity,
          springLength: options.physics.springLength,
          springConstant: options.physics.springConstant,
          avoidOverlap: 1
        },
        barnesHut: {
          gravitationalConstant: -2000,
          centralGravity: 0.3,
          springLength: 95,
          springConstant: 0.04,
          damping: 0.09
        },
        stabilization: {
          enabled: true,
          iterations: 1000
        }
      },
      nodes: {
        shape: 'box',
        margin: {
          top: 10,
          right: 10,
          bottom: 10,
          left: 10
        },
        borderWidth: 2,
        shadow: true,
        shapeProperties: {
          borderRadius: 8
        }
      },
      edges: {
        width: 2,
        shadow: true,
        smooth: {
          enabled: true,
          type: 'cubicBezier',
          forceDirection: options.mode === 'hierarchical' ? 'vertical' : 'none',
          roundness: 0.5
        }
      },
      interaction: {
        hover: true,
        navigationButtons: true,
        keyboard: true,
      }
    };

    // Cleanup previous network instance
    if (networkRef.current) {
      networkRef.current.destroy();
    }

    // Create new network
    networkRef.current = new Network(containerRef.current, data, networkOptions);

    // Add event listener for graph stabilization
    const handleStabilize = () => {
      if (networkRef.current) {
        networkRef.current.stabilize();
      }
    };
    window.addEventListener('stabilizeGraph', handleStabilize);

    // Cleanup
    return () => {
      window.removeEventListener('stabilizeGraph', handleStabilize);
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [creatures, options]);

  return <div ref={containerRef} style={{ height: '600px', width: '100%' }} />;
};

export default GraphVisualization;
