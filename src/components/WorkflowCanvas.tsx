
import React, { useState, useRef, useEffect } from 'react';
import WorkflowNode from './WorkflowNode';
import { Node, Connection, WorkflowState } from '@/types/workflow';
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { Plus, Trash, MessageCircle, HelpCircle, GitBranch } from 'lucide-react';
import { toast } from 'sonner';

const WorkflowCanvas: React.FC = () => {
  const [workflow, setWorkflow] = useState<WorkflowState>({
    nodes: [
      {
        id: 'greeting-1',
        type: 'greeting',
        title: 'Greeting',
        content: 'Hello, this is Sam calling from Codebase.',
        position: { x: 300, y: 100 }
      },
      {
        id: 'question-1',
        type: 'question',
        title: 'Initial Question',
        content: "I'm calling to discuss our new service that helps businesses like yours. Do you have a few minutes to chat?",
        position: { x: 300, y: 300 }
      },
      {
        id: 'response-1',
        type: 'response',
        title: 'Response Branch',
        content: "Response Options:",
        position: { x: 300, y: 500 },
        options: ['Yes', 'No']
      }
    ],
    connections: [
      { id: 'conn-1', source: 'greeting-1', target: 'question-1' },
      { id: 'conn-2', source: 'question-1', target: 'response-1' }
    ],
    selectedNode: null,
    connectingFrom: null
  });
  
  const [svgPaths, setSvgPaths] = useState<{[key: string]: string}>({});
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Calculate SVG paths for connections
  useEffect(() => {
    const newPaths: {[key: string]: string} = {};
    
    workflow.connections.forEach(conn => {
      const sourceNode = workflow.nodes.find(n => n.id === conn.source);
      const targetNode = workflow.nodes.find(n => n.id === conn.target);
      
      if (sourceNode && targetNode) {
        const sourceX = sourceNode.position.x + 128; // Center of node
        const sourceY = sourceNode.position.y + 130; // Bottom of node
        const targetX = targetNode.position.x + 128; // Center of node
        const targetY = targetNode.position.y; // Top of node
        
        const midY = (sourceY + targetY) / 2;
        const path = `M${sourceX},${sourceY} C${sourceX},${midY} ${targetX},${midY} ${targetX},${targetY}`;
        
        newPaths[conn.id] = path;
      }
    });
    
    setSvgPaths(newPaths);
  }, [workflow.nodes, workflow.connections]);
  
  // Handle mouse move for live connection drawing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Handle node dragging
  const handleDragStart = (e: React.DragEvent, id: string) => {
    const node = workflow.nodes.find(n => n.id === id);
    if (node) {
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setDraggedNode(id);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedNode && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      
      const newNodes = workflow.nodes.map(node => {
        if (node.id === draggedNode) {
          return {
            ...node,
            position: {
              x: e.clientX - rect.left - dragOffset.x,
              y: e.clientY - rect.top - dragOffset.y
            }
          };
        }
        return node;
      });
      
      setWorkflow(prev => ({
        ...prev,
        nodes: newNodes
      }));
    }
  };
  
  const handleDragEnd = () => {
    setDraggedNode(null);
  };
  
  // Node operations
  const handleNodeSelect = (id: string) => {
    setWorkflow(prev => ({
      ...prev,
      selectedNode: id
    }));
  };
  
  const handleStartConnection = (id: string) => {
    setWorkflow(prev => ({
      ...prev,
      connectingFrom: id
    }));
    toast.info("Select another node to connect to");
  };
  
  const handleEndConnection = (id: string) => {
    if (workflow.connectingFrom && workflow.connectingFrom !== id) {
      // Check if connection already exists
      const connectionExists = workflow.connections.some(
        conn => conn.source === workflow.connectingFrom && conn.target === id
      );
      
      if (!connectionExists) {
        const newConnection: Connection = {
          id: `conn-${uuidv4()}`,
          source: workflow.connectingFrom,
          target: id
        };
        
        setWorkflow(prev => ({
          ...prev,
          connections: [...prev.connections, newConnection],
          connectingFrom: null
        }));
        toast.success("Connection created");
      } else {
        toast.error("Connection already exists");
        setWorkflow(prev => ({
          ...prev,
          connectingFrom: null
        }));
      }
    }
  };
  
  const handleContentChange = (id: string, content: string) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === id ? { ...node, content } : node
      )
    }));
  };
  
  const handleTitleChange = (id: string, title: string) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === id ? { ...node, title } : node
      )
    }));
  };
  
  const handleAddOption = (id: string) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => {
        if (node.id === id) {
          return {
            ...node,
            options: [...(node.options || []), '']
          };
        }
        return node;
      })
    }));
  };
  
  const handleOptionChange = (id: string, index: number, value: string) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => {
        if (node.id === id && node.options) {
          const newOptions = [...node.options];
          newOptions[index] = value;
          return { ...node, options: newOptions };
        }
        return node;
      })
    }));
  };
  
  const handleOptionRemove = (id: string, index: number) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => {
        if (node.id === id && node.options) {
          const newOptions = [...node.options];
          newOptions.splice(index, 1);
          return { ...node, options: newOptions };
        }
        return node;
      })
    }));
  };
  
  const handleDeleteNode = (id: string) => {
    // First remove all connections associated with this node
    const filteredConnections = workflow.connections.filter(
      conn => conn.source !== id && conn.target !== id
    );
    
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== id),
      connections: filteredConnections,
      selectedNode: prev.selectedNode === id ? null : prev.selectedNode
    }));
    
    toast.success("Node deleted");
  };
  
  const addNewNode = (type: 'greeting' | 'question' | 'response') => {
    const centerX = canvasRef.current 
      ? canvasRef.current.clientWidth / 2 - 128 
      : 300;
    const centerY = canvasRef.current 
      ? canvasRef.current.clientHeight / 2 - 100 
      : 300;
    
    const newNode: Node = {
      id: `${type}-${uuidv4()}`,
      type,
      title: type === 'greeting' 
        ? 'Greeting' 
        : type === 'question' 
          ? 'Question' 
          : 'Response Branch',
      content: type === 'greeting' 
        ? 'Enter your greeting message here...' 
        : type === 'question' 
          ? 'Enter your question here...' 
          : 'Response Options:',
      position: { x: centerX, y: centerY },
      options: type === 'response' ? [''] : undefined
    };
    
    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      selectedNode: newNode.id
    }));
    
    toast.success(`New ${type} node added`);
  };
  
  const handleDeleteConnection = (id: string) => {
    setWorkflow(prev => ({
      ...prev,
      connections: prev.connections.filter(conn => conn.id !== id)
    }));
    toast.success("Connection removed");
  };
  
  // Render temporary connection line when creating new connection
  const renderTemporaryConnection = () => {
    if (workflow.connectingFrom) {
      const sourceNode = workflow.nodes.find(n => n.id === workflow.connectingFrom);
      
      if (sourceNode) {
        const sourceX = sourceNode.position.x + 128; // Center of node
        const sourceY = sourceNode.position.y + 130; // Bottom of node
        const targetX = mousePos.x;
        const targetY = mousePos.y;
        
        const midY = (sourceY + targetY) / 2;
        const path = `M${sourceX},${sourceY} C${sourceX},${midY} ${targetX},${midY} ${targetX},${targetY}`;
        
        return (
          <path
            d={path}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
            strokeDasharray="5,5"
            className="connector"
          />
        );
      }
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b p-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-medium">Workflow Builder</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => addNewNode('greeting')}
          >
            <MessageCircle size={16} />
            Add Greeting
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => addNewNode('question')}
          >
            <HelpCircle size={16} />
            Add Question
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => addNewNode('response')}
          >
            <GitBranch size={16} />
            Add Response
          </Button>
        </div>
      </div>
      
      <div 
        ref={canvasRef}
        className="workflow-canvas flex-1 relative overflow-auto"
        onDragOver={handleDragOver}
        onDrop={handleDragEnd}
        onClick={() => setWorkflow(prev => ({ ...prev, selectedNode: null }))}
      >
        {/* SVG layer for connections */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {Object.entries(svgPaths).map(([id, path]) => (
            <g key={id} className="group">
              <path
                d={path}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                className="connector"
              />
              <path
                d={path}
                fill="none"
                stroke="transparent"
                strokeWidth="12"
                className="cursor-pointer pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConnection(id);
                }}
              />
              <circle 
                cx="0" cy="0" r="8" 
                fill="white" 
                stroke="#ef4444" 
                strokeWidth="2"
                className="opacity-0 group-hover:opacity-100 pointer-events-auto cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConnection(id);
                }}
                style={{
                  transform: `translate(${path.split(' ')[1].split(',')[0]}px, ${parseInt(path.split(' ')[1].split(',')[1]) - 20}px)`
                }}
              >
                <title>Delete connection</title>
              </circle>
              <Trash 
                size={12} 
                className="opacity-0 group-hover:opacity-100 text-red-500 pointer-events-auto cursor-pointer"
                style={{
                  transform: `translate(${parseInt(path.split(' ')[1].split(',')[0]) - 6}px, ${parseInt(path.split(' ')[1].split(',')[1]) - 26}px)`
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConnection(id);
                }}
              />
            </g>
          ))}
          {renderTemporaryConnection()}
        </svg>
        
        {/* Nodes layer */}
        {workflow.nodes.map((node) => (
          <WorkflowNode
            key={node.id}
            node={node}
            selected={workflow.selectedNode === node.id}
            onSelect={handleNodeSelect}
            onStartConnection={handleStartConnection}
            onEndConnection={handleEndConnection}
            onDragStart={handleDragStart}
            onContentChange={handleContentChange}
            onTitleChange={handleTitleChange}
            onAddOption={handleAddOption}
            onOptionChange={handleOptionChange}
            onOptionRemove={handleOptionRemove}
            onDelete={handleDeleteNode}
          />
        ))}
        
        {/* Add node button (floating) */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-3">
          <div 
            className="add-node-button tooltip-wrapper"
            onClick={() => addNewNode('response')}
          >
            <GitBranch size={18} />
            <span className="tooltip">Add Response</span>
          </div>
          <div 
            className="add-node-button tooltip-wrapper"
            onClick={() => addNewNode('question')}
          >
            <HelpCircle size={18} />
            <span className="tooltip">Add Question</span>
          </div>
          <div 
            className="add-node-button tooltip-wrapper"
            onClick={() => addNewNode('greeting')}
          >
            <MessageCircle size={18} />
            <span className="tooltip">Add Greeting</span>
          </div>
          <div className="add-node-button bg-primary">
            <Plus size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowCanvas;
