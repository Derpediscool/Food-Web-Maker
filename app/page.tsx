// app/page.tsx (or pages/index.tsx)
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import GraphVisualization from '@/components/GraphVisualization';

interface Creature {
  name: string;
  eats: string;
  color: string;
}

export default function FoodWebApp() {
  const [creatureName, setCreatureName] = useState('');
  const [eats, setEats] = useState('');
  const [color, setColor] = useState('#f0f0f0');
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [editing, setEditing] = useState<number | null>(null);

  const addCreature = () => {
    if (!creatureName.trim()) return;

    setCreatures([...creatures, { 
      name: creatureName.trim(), 
      eats: eats.trim(), 
      color: color 
    }]);
    setCreatureName('');
    setEats('');
    setColor('#f0f0f0');
  };

  const startEditing = (index: number) => {
    const creature = creatures[index];
    setCreatureName(creature.name);
    setEats(creature.eats);
    setColor(creature.color);
    setEditing(index);
  };

  const editCreature = () => {
    if (!creatureName.trim() || editing === null) return;

    setCreatures(creatures.map((creature, i) => i === editing ? {
      name: creatureName.trim(),
      eats: eats.trim(),
      color: color
    } : creature));
    
    setCreatureName('');
    setEats('');
    setColor('#f0f0f0');
    setEditing(null);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Food Web Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="creature">Creature</Label>
              <Input
                id="creature"
                type="text"
                placeholder="Enter creature name"
                value={creatureName}
                onChange={(e) => setCreatureName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="eats">What it eats</Label>
              <Input
                id="eats"
                type="text"
                placeholder="Enter what it eats"
                value={eats}
                onChange={(e) => setEats(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="color">Creature Color</Label>
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-20"
              />
            </div>
            <Button onClick={editing !== null ? editCreature : addCreature}>
              {editing !== null ? 'Save Changes' : 'Add Creature'}
            </Button>
            {editing !== null && (
              <Button className="ml-2" onClick={() => {
                setEditing(null);
                setCreatureName('');
                setEats('');
                setColor('#f0f0f0');
              }} variant="secondary">
                Cancel Edit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Food Web List */}
      <Card>
        <CardHeader>
          <CardTitle>Food Web List</CardTitle>
        </CardHeader>
        <CardContent>
          {creatures.length === 0 ? (
            <p className="text-muted-foreground">No creatures added yet.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              {creatures.map((creature, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>
                    <strong>{creature.name}</strong> eats{' '}
                    <em>{creature.eats ? creature.eats : 'nothing'}</em>
                  </span>
                  <div className="space-x-2">
                    <Button 
                      onClick={() => startEditing(index)} 
                      variant="outline"
                    >
                      Edit
                    </Button>
                    <Button 
                      onClick={() => setCreatures(creatures.filter((_, i) => i !== index))} 
                      variant="destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Graph Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Food Web Graph</CardTitle>
        </CardHeader>
        <CardContent>
          <GraphVisualization creatures={creatures} />
        </CardContent>
      </Card>

      <div className="flex justify-center">
        Made by Derped with 🤗 - <a href="https://derped.dev" target="_blank" rel="noopener noreferrer">derped.dev</a>
      </div>
    </div>
  );
}
