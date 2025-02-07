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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function FoodWebApp() {
  const [creatureName, setCreatureName] = useState('');
  const [eats, setEats] = useState('');
  const [color, setColor] = useState('#f0f0f0');
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [duplicateError, setDuplicateError] = useState(false);
  const [importError, setImportError] = useState(false);
  const [graphOptions, setGraphOptions] = useState({
    mode: 'default',
    physics: {
      springLength: 100,
      springConstant: 0.08,
      centralGravity: 0.01,
      gravitationalConstant: -50,
    },
    layout: {
      hierarchicalDirection: 'UD',
      hierarchicalSortMethod: 'directed',
    }
  });

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
      } catch {
        setImportError(true);
      }
    };
    reader.readAsText(file);
  };

  const updateGraphOption = (
    category: 'physics' | 'layout',  // restrict to valid categories
    option: string,
    value: any
  ) => {
    setGraphOptions(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [option]: value
      }
    }));
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
          <Accordion type="single" collapsible className="mb-4">
            <AccordionItem value="graph-options">
              <AccordionTrigger>Graph Options</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="graph-mode">Layout Mode</Label>
                    <Select 
                      value={graphOptions.mode} 
                      onValueChange={(value) => setGraphOptions(prev => ({ ...prev, mode: value }))}
                    >
                      <SelectTrigger id="graph-mode">
                        <SelectValue placeholder="Select graph mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="hierarchical">Hierarchical</SelectItem>
                        <SelectItem value="circular">Circular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {graphOptions.mode === 'hierarchical' && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="hierarchical-direction">Direction</Label>
                        <Select 
                          value={graphOptions.layout.hierarchicalDirection} 
                          onValueChange={(value) => updateGraphOption('layout', 'hierarchicalDirection', value)}
                        >
                          <SelectTrigger id="hierarchical-direction">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UD">Top to Bottom</SelectItem>
                            <SelectItem value="DU">Bottom to Top</SelectItem>
                            <SelectItem value="LR">Left to Right</SelectItem>
                            <SelectItem value="RL">Right to Left</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="sort-method">Sort Method</Label>
                        <Select 
                          value={graphOptions.layout.hierarchicalSortMethod} 
                          onValueChange={(value) => updateGraphOption('layout', 'hierarchicalSortMethod', value)}
                        >
                          <SelectTrigger id="sort-method">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="directed">Directed</SelectItem>
                            <SelectItem value="hubsize">Hub Size</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {graphOptions.mode === 'circular' && (
                    <div className="space-y-4">
                      <div>
                        <Label>Spring Length</Label>
                        <Slider
                          value={[graphOptions.physics.springLength]}
                          onValueChange={([value]) => updateGraphOption('physics', 'springLength', value)}
                          min={50}
                          max={200}
                          step={10}
                        />
                      </div>
                      <div>
                        <Label>Spring Constant</Label>
                        <Slider
                          value={[graphOptions.physics.springConstant]}
                          onValueChange={([value]) => updateGraphOption('physics', 'springConstant', value)}
                          min={0.01}
                          max={0.5}
                          step={0.01}
                        />
                      </div>
                      <div>
                        <Label>Central Gravity</Label>
                        <Slider
                          value={[graphOptions.physics.centralGravity]}
                          onValueChange={([value]) => updateGraphOption('physics', 'centralGravity', value)}
                          min={0.01}
                          max={1}
                          step={0.01}
                        />
                      </div>
                      <div>
                        <Label>Gravitational Constant</Label>
                        <Slider
                          value={[Math.abs(graphOptions.physics.gravitationalConstant)]}
                          onValueChange={([value]) => updateGraphOption('physics', 'gravitationalConstant', -value)}
                          min={10}
                          max={100}
                          step={5}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <GraphVisualization creatures={creatures} options={graphOptions} />
          
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
