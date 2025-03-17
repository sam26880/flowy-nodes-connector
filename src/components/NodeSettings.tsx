
import React, { useState } from 'react';
import { X, Trash2, Save, Calendar, User, FileText, Code, Paperclip, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Node } from '@/types/workflow';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

interface NodeSettingsProps {
  node: Node;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (nodeId: string, updatedSettings: Node['customSettings']) => void;
  onDelete: (nodeId: string) => void;
}

const NodeSettings: React.FC<NodeSettingsProps> = ({
  node,
  open,
  onOpenChange,
  onSave,
  onDelete
}) => {
  const [settings, setSettings] = useState<Node['customSettings']>(
    node.customSettings || {
      assignedTo: [],
      description: '',
      dueDate: '',
      codeReference: '',
      attachments: ''
    }
  );
  
  const [assignee, setAssignee] = useState<string>('');
  
  const handleSave = () => {
    onSave(node.id, settings);
    onOpenChange(false);
  };
  
  const handleAddAssignee = () => {
    if (assignee && !settings.assignedTo?.includes(assignee)) {
      setSettings({
        ...settings,
        assignedTo: [...(settings.assignedTo || []), assignee]
      });
      setAssignee('');
    }
  };
  
  const handleRemoveAssignee = (name: string) => {
    setSettings({
      ...settings,
      assignedTo: settings.assignedTo?.filter(a => a !== name)
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl font-bold">
            Configure {node.title}
          </SheetTitle>
          <SheetDescription>
            Adjust properties for this workflow node.
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6 py-4">
          {/* Node Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Code size={16} />
              Node Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant={node.type === 'greeting' ? 'default' : 'outline'} 
                className="h-9"
              >
                Greeting
              </Button>
              <Button 
                variant={node.type === 'question' ? 'default' : 'outline'} 
                className="h-9"
              >
                Question
              </Button>
              <Button 
                variant={node.type === 'response' ? 'default' : 'outline'} 
                className="h-9"
              >
                Response
              </Button>
            </div>
          </div>
          
          {/* Code Reference */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Code size={16} />
              Code Reference
            </label>
            <Input 
              placeholder="Enter code reference..."
              value={settings.codeReference || ''}
              onChange={(e) => setSettings({...settings, codeReference: e.target.value})}
              className="h-9"
            />
          </div>
          
          {/* Assigned To */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User size={16} />
              Assign Task To
            </label>
            <div className="flex gap-2">
              <Input 
                placeholder="Enter assignee name..."
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="h-9 flex-1"
              />
              <Button 
                variant="outline" 
                size="icon" 
                className="h-9 w-9"
                onClick={handleAddAssignee}
              >
                <Plus size={16} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {settings.assignedTo?.map(name => (
                <div 
                  key={name} 
                  className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center gap-1"
                >
                  {name}
                  <button 
                    className="text-secondary-foreground/70 hover:text-secondary-foreground" 
                    onClick={() => handleRemoveAssignee(name)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Task Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <FileText size={16} />
              Task Description
            </label>
            <Textarea 
              placeholder="Enter task description..."
              value={settings.description || ''}
              onChange={(e) => setSettings({...settings, description: e.target.value})}
              className="min-h-[80px]"
            />
          </div>
          
          {/* Due Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar size={16} />
              Task Due Date
            </label>
            <Select 
              value={settings.dueDate || ''} 
              onValueChange={(value) => setSettings({...settings, dueDate: value})}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select due date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediately">Immediately</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="next-week">Next Week</SelectItem>
                <SelectItem value="two-weeks">In Two Weeks</SelectItem>
                <SelectItem value="next-month">Next Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Attachments */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Paperclip size={16} />
              Attach Wiki
            </label>
            <Select 
              value={settings.attachments || ''} 
              onValueChange={(value) => setSettings({...settings, attachments: value})}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select attachment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patient-guide">Patient Guide</SelectItem>
                <SelectItem value="treatment-plan">Treatment Plan</SelectItem>
                <SelectItem value="billing-info">Billing Information</SelectItem>
                <SelectItem value="aftercare">Aftercare Instructions</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Background Color */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Background Color</label>
            <div className="flex flex-wrap gap-3">
              {['bg-blue-50', 'bg-green-50', 'bg-yellow-50', 'bg-purple-50', 'bg-pink-50', 'bg-gray-50'].map((color) => (
                <div 
                  key={color}
                  className={`w-8 h-8 rounded-full cursor-pointer border ${color} ${node.color === color ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => {}}
                />
              ))}
            </div>
          </div>
        </div>
        
        <SheetFooter className="pt-4 flex justify-between sm:justify-between gap-4 border-t">
          <Button 
            variant="destructive" 
            className="flex-1 sm:flex-none"
            onClick={() => onDelete(node.id)}
          >
            <Trash2 size={16} className="mr-2" />
            Delete Node
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1 sm:flex-none"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 sm:flex-none"
              onClick={handleSave}
            >
              <Save size={16} className="mr-2" />
              Save Changes
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default NodeSettings;
