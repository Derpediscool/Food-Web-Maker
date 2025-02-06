// components/GraphVisualization.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { DataSet, Network } from 'vis-network/standalone/esm/vis-network';

interface Creature {
  name: string;
  eats: string;
  color: string;
}

interface GraphVisualizationProps {
  creatures: Creature[];
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({ creatures }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Create nodes and edges sets.
      const nodes = new DataSet<{ id: string; label: string; shape: string; color: string }>([]);
      const edges = new DataSet<{ from: string; to: string; arrows: string; id?: string }>([]);

      // For each creature, add a node and add an edge if "eats" is specified.
      creatures.forEach((creature) => {
        // Add the creature node if it doesn't exist.
        if (!nodes.get(creature.name)) {
          nodes.add({ 
            id: creature.name, 
            label: creature.name, 
            shape: 'box', 
            color: creature.color 
          });
        }
        // If there is a food item specified, add the food node and an edge.
        if (creature.eats) {
          if (!nodes.get(creature.eats)) {
            nodes.add({ 
              id: creature.eats, 
              label: creature.eats, 
              shape: 'box', 
              color: '#f0f0f0' 
            });
          }
          // Ensure the edge is added correctly
          edges.add({ from: creature.eats, to: creature.name, arrows: 'to' } as { from: string; to: string; arrows: string });
        }
      });

      const data = {
        nodes,
        edges,
      };

      const options = {
        layout: {
          // You can change this to hierarchical: true for a different layout
          hierarchical: false,
        },
        physics: {
          // Adjust the physics options as needed
          stabilization: false,
        },
        nodes: {
          shape: 'box',
          color: {
            border: '#2B7CE9',
            background: '#D2E5FF',
          },
        },
      };

      // Create a new network or update the existing one.
      if (networkRef.current) {
        networkRef.current.setData(data);
      } else {
        networkRef.current = new Network(containerRef.current, data, options);
      }
    }
  }, [creatures]);

  return <div ref={containerRef} style={{ height: '500px', border: '1px solid #ddd' }} />;
};

export default GraphVisualization;
