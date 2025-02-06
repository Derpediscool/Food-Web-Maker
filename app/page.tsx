// app/page.tsx (or pages/index.tsx)
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import GraphVisualization from '@/components/GraphVisualization';
import { Creature } from '@/types/Creature';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
 

export default function FoodWebApp() {
  const [creatureName, setCreatureName] = useState('');
  const [eats, setEats] = useState('');
  const [color, setColor] = useState('#f0f0f0');
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [duplicateError, setDuplicateError] = useState(false);
  const [importError, setImportError] = useState(false);

  const addCreature = () => {
    if (!creatureName.trim() || creatures.some(creature => creature.name === creatureName.trim())) {
      setDuplicateError(true);
      return;
    }

    const eatsArray = eats.trim() ? eats.split(',').map(eat => eat.trim()) : [];

    setCreatures([...creatures, { 
      name: creatureName.trim(), 
      eats: eatsArray,
      color: color 
    }]);
    setCreatureName('');
    setEats('');
    setColor('#f0f0f0');
    setDuplicateError(false);
  };

  const startEditing = (index: number) => {
    const creature = creatures[index];
    setCreatureName(creature.name);
    setEats(creature.eats.join(', '));
    setColor(creature.color);
    setEditing(index);
    setDuplicateError(false); // Reset duplicate error when starting edit
  };

  const editCreature = () => {
    if (!creatureName.trim() || editing === null) return;

    const eatsArray = eats.trim() ? eats.split(',').map(eat => eat.trim()) : [];

    setCreatures(creatures.map((creature, i) => i === editing ? {
      name: creatureName.trim(),
      eats: eatsArray,
      color: color
    } : creature));
    
    setCreatureName('');
    setEats('');
    setColor('#f0f0f0');
    setEditing(null);
    setDuplicateError(false); // Reset duplicate error after edit
  };

  const downloadCreatures = () => {
    const creaturesData = JSON.stringify(creatures, null, 2);
    const blob = new Blob([creaturesData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'food-web.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importCreatures = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
          setCreatures(data);
          setImportError(false);
        } else {
          setImportError(true);
        }
      } catch (error) {
        setImportError(true);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Alert variant="destructive">
        <AlertTitle>Warning!</AlertTitle>
        <AlertDescription>
          There is a bug where if a node has too many things connected to it the color will disappear.
        </AlertDescription>
      </Alert>
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
              <Label htmlFor="eats">What it eats (separate by comma)</Label>
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
                setDuplicateError(false); // Reset duplicate error when canceling edit
              }} variant="secondary">
                Cancel Edit
              </Button>
            )}
            {duplicateError && (
              <p className="text-red-500 mt-2">Error: Duplicate creature name.</p>
            )}
            <div className="flex items-center gap-4 mt-4">
              <Button onClick={downloadCreatures} variant="outline">
                Download Food Web
              </Button>
              <div className="flex items-center gap-2">
                <Label htmlFor="import" className="cursor-pointer">
                  <Button variant="outline" onClick={() => document.getElementById('import')?.click()}>
                    Import Food Web
                  </Button>
                </Label>
                <Input
                  id="import"
                  type="file"
                  accept=".json"
                  onChange={importCreatures}
                  className="hidden"
                />
              </div>
            </div>
            {importError && (
              <p className="text-red-500 mt-2">Error: Invalid food web file format.</p>
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
                    <strong>{creature.name}</strong>
                    {creature.eats.length > 0 && (
                      <> eats <em>{creature.eats.join(', ')}</em></>
                    )}
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
          <div className="mt-4">
            <Button variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('stabilizeGraph'))}>
              Reorganize Graph
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        Made by Derped with 🤗 - <a href="https://derped.dev" target="_blank" rel="noopener noreferrer">derped.dev</a>
      </div>
    </div>
  );
}
