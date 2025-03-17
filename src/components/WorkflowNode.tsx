
import React, { useState } from 'react';
import { Node } from '@/types/workflow';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, GripVertical, Plus, MoreVertical, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";

interface WorkflowNodeProps {
  node: Node;
  selected: boolean;
  onSelect: (id: string) => void;
  onStartConnection: (id: string) => void;
  onEndConnection: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onContentChange: (id: string, content: string) => void;
  onTitleChange: (id: string, title: string) => void;
  onAddOption?: (id: string) => void;
  onOptionChange?: (id: string, index: number, value: string) => void;
  onOptionRemove?: (id: string, index: number) => void;
  onDelete: (id: string) => void;
}

const WorkflowNode: React.FC<WorkflowNodeProps> = ({
  node,
  selected,
  onSelect,
  onStartConnection,
  onEndConnection,
  onDragStart,
  onContentChange,
  onTitleChange,
  onAddOption,
  onOptionChange,
  onOptionRemove,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [nodeColor, setNodeColor] = useState<string>(() => {
    if (node.type === 'greeting') return 'bg-blue-50';
    if (node.type === 'question') return 'bg-green-50';
    return 'bg-yellow-50';
  });
  
  const nodeColorClass = {
    greeting: 'bg-node-greeting border-blue-200',
    question: 'bg-node-question border-green-200',
    response: 'bg-node-response border-yellow-200'
  }[node.type];

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(e, node.id);
  };

  const handleColorChange = (color: string) => {
    setNodeColor(color);
  };

  return (
    <>
      <div
        className={cn(
          'node absolute w-64 rounded-xl p-4 border shadow-sm animate-scale-in',
          nodeColorClass,
          selected ? 'ring-2 ring-primary' : ''
        )}
        style={{ left: `${node.position.x}px`, top: `${node.position.y}px` }}
        onClick={() => onSelect(node.id)}
      >
        <div 
          className="absolute -top-3 left-1/2 transform -translate-x-1/2 cursor-pointer connector-port z-10"
          onClick={(e) => {
            e.stopPropagation();
            onEndConnection(node.id);
          }}
        />
        
        <div className="flex justify-between items-center mb-2">
          <div 
            className="cursor-move px-1"
            draggable
            onDragStart={handleDragStart}
          >
            <GripVertical size={16} className="text-gray-400" />
          </div>
          
          {isEditing ? (
            <input
              className="font-medium text-sm flex-1 ml-1 bg-transparent border-b border-gray-300 focus:border-primary outline-none px-1"
              value={node.title}
              onChange={(e) => onTitleChange(node.id, e.target.value)}
              autoFocus
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
            />
          ) : (
            <h3 
              className="font-medium text-sm flex-1 ml-1 cursor-text"
              onClick={() => setIsEditing(true)}
            >
              {node.title}
            </h3>
          )}
          
          <div className="flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full hover:bg-gray-100"
                >
                  <MoreVertical size={14} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="end">
                <div className="flex flex-col gap-1 text-sm">
                  <Button
                    variant="ghost" 
                    className="justify-start h-8 px-2 text-xs"
                    onClick={() => setIsConfigOpen(true)}
                  >
                    <Settings size={14} className="mr-2" />
                    Configure
                  </Button>
                  <Button
                    variant="ghost" 
                    className="justify-start h-8 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(node.id);
                    }}
                  >
                    <X size={14} className="mr-2" />
                    Delete
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <Textarea
          className="w-full bg-white/70 backdrop-blur-sm border text-sm resize-none min-h-[60px]"
          value={node.content}
          onChange={(e) => onContentChange(node.id, e.target.value)}
          placeholder="Enter content..."
        />
        
        {node.type === 'response' && (
          <div className="mt-3">
            <div className="text-xs font-medium text-gray-500 mb-1">Response Options:</div>
            {node.options?.map((option, index) => (
              <div key={index} className="flex items-center mt-1">
                <input
                  className="flex-1 text-sm px-1 py-0.5 border-b border-gray-200 option-input"
                  value={option}
                  onChange={(e) => onOptionChange?.(node.id, index, e.target.value)}
                  placeholder="Option text..."
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-1 hover:text-red-500"
                  onClick={() => onOptionRemove?.(node.id, index)}
                >
                  <X size={12} />
                </Button>
              </div>
            ))}
            <div 
              className="flex items-center text-xs text-gray-400 mt-2 cursor-pointer hover:text-primary"
              onClick={() => onAddOption?.(node.id)}
            >
              <Plus size={14} className="mr-1" />
              New option...
            </div>
          </div>
        )}
        
        <div 
          className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 cursor-pointer connector-port"
          onClick={(e) => {
            e.stopPropagation();
            onStartConnection(node.id);
          }}
        />
      </div>

      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Configure {node.title}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Node Type</label>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant={node.type === 'greeting' ? 'default' : 'outline'} 
                  className="h-8"
                  onClick={() => {}} // This would be handled by an onTypeChange prop
                >
                  Greeting
                </Button>
                <Button 
                  variant={node.type === 'question' ? 'default' : 'outline'} 
                  className="h-8"
                  onClick={() => {}} // This would be handled by an onTypeChange prop
                >
                  Question
                </Button>
                <Button 
                  variant={node.type === 'response' ? 'default' : 'outline'} 
                  className="h-8"
                  onClick={() => {}} // This would be handled by an onTypeChange prop
                >
                  Response
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Background Color</label>
              <div className="flex flex-wrap gap-2">
                {['bg-blue-50', 'bg-green-50', 'bg-yellow-50', 'bg-purple-50', 'bg-pink-50', 'bg-gray-50'].map((color) => (
                  <div 
                    key={color}
                    className={`w-6 h-6 rounded-full cursor-pointer border ${color} ${nodeColor === color ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => handleColorChange(color)}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsConfigOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setIsConfigOpen(false)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WorkflowNode;
