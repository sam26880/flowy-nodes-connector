
import React, { useState } from 'react';
import { X, Trash2, Save, Calendar, User, FileText, Code, Paperclip, Plus, Trash, Link } from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
      codeReferences: [],
      attachments: []
    }
  );
  
  const [assignee, setAssignee] = useState<string>('');
  const [newCodeRef, setNewCodeRef] = useState({ name: '', url: '' });
  const [newAttachment, setNewAttachment] = useState('');
  
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

  const handleAddCodeReference = () => {
    if (newCodeRef.name && newCodeRef.url) {
      setSettings({
        ...settings,
        codeReferences: [...(settings.codeReferences || []), { ...newCodeRef }]
      });
      setNewCodeRef({ name: '', url: '' });
    }
  };

  const handleRemoveCodeReference = (index: number) => {
    setSettings({
      ...settings,
      codeReferences: settings.codeReferences?.filter((_, i) => i !== index)
    });
  };

  const handleAddAttachment = () => {
    if (newAttachment && !settings.attachments?.includes(newAttachment)) {
      setSettings({
        ...settings,
        attachments: [...(settings.attachments || []), newAttachment]
      });
      setNewAttachment('');
    }
  };

  const handleRemoveAttachment = (attachment: string) => {
    setSettings({
      ...settings,
      attachments: settings.attachments?.filter(a => a !== attachment)
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
          
          {/* Code References */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Code size={16} />
              Code References
            </label>
            
            {settings.codeReferences && settings.codeReferences.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Name</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settings.codeReferences.map((codeRef, index) => (
                    <TableRow key={index}>
                      <TableCell className="py-2">{codeRef.name}</TableCell>
                      <TableCell className="py-2 truncate max-w-[180px]">
                        <a href={codeRef.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate block">
                          {codeRef.url}
                        </a>
                      </TableCell>
                      <TableCell className="py-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500"
                          onClick={() => handleRemoveCodeReference(index)}
                        >
                          <Trash size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            <div className="flex gap-2 items-end">
              <div className="space-y-1 flex-1">
                <label className="text-xs text-muted-foreground">Name</label>
                <Input 
                  value={newCodeRef.name}
                  onChange={(e) => setNewCodeRef({...newCodeRef, name: e.target.value})}
                  placeholder="e.g. API Endpoint"
                  className="h-8"
                />
              </div>
              <div className="space-y-1 flex-1">
                <label className="text-xs text-muted-foreground">URL</label>
                <Input 
                  value={newCodeRef.url}
                  onChange={(e) => setNewCodeRef({...newCodeRef, url: e.target.value})}
                  placeholder="https://..."
                  className="h-8"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 shrink-0"
                onClick={handleAddCodeReference}
              >
                <Plus size={14} className="mr-1" />
                Add
              </Button>
            </div>
          </div>
          
          {/* Assigned To */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User size={16} />
              Assign Task To
            </label>
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
            <div className="flex gap-2">
              <Input 
                placeholder="Enter assignee name..."
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="h-8 flex-1"
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 shrink-0"
                onClick={handleAddAssignee}
              >
                <Plus size={14} className="mr-1" />
                Add
              </Button>
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
              <SelectTrigger className="h-8">
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
              Attach Wikis
            </label>
            
            {settings.attachments && settings.attachments.length > 0 && (
              <div className="space-y-2">
                {settings.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between bg-secondary/50 rounded-md p-2">
                    <span className="text-sm">{attachment}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500"
                      onClick={() => handleRemoveAttachment(attachment)}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-2">
              <Select 
                value={newAttachment} 
                onValueChange={setNewAttachment}
              >
                <SelectTrigger className="h-8 flex-1">
                  <SelectValue placeholder="Select attachment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Patient Guide">Patient Guide</SelectItem>
                  <SelectItem value="Treatment Plan">Treatment Plan</SelectItem>
                  <SelectItem value="Billing Information">Billing Information</SelectItem>
                  <SelectItem value="Aftercare Instructions">Aftercare Instructions</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 shrink-0"
                onClick={handleAddAttachment}
                disabled={!newAttachment}
              >
                <Plus size={14} className="mr-1" />
                Add
              </Button>
            </div>
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
