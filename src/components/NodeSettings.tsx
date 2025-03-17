
import React, { useState } from 'react';
import { X, Trash2, Save, Calendar, User, FileText, Code, Paperclip, Plus, Trash, Table } from 'lucide-react';
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
  // Initialize settings with the current node settings or empty defaults
  const [settings, setSettings] = useState<Node['customSettings']>(
    node.customSettings || {
      tasks: []
    }
  );
  
  // Initialize with an empty task row for new entries
  const emptyTask = {
    code: '',
    codeUrl: '',
    assignedTo: '',
    description: '',
    dueDate: '',
    attachWiki: ''
  };
  
  // Add a new empty task row
  const handleAddTask = () => {
    setSettings({
      ...settings,
      tasks: [...(settings.tasks || []), { ...emptyTask }]
    });
  };
  
  // Remove a task row by index
  const handleRemoveTask = (index: number) => {
    setSettings({
      ...settings,
      tasks: settings.tasks?.filter((_, i) => i !== index) || []
    });
  };
  
  // Update a specific field in a task
  const handleTaskChange = (index: number, field: string, value: string) => {
    const updatedTasks = [...(settings.tasks || [])];
    updatedTasks[index] = {
      ...updatedTasks[index],
      [field]: value
    };
    
    setSettings({
      ...settings,
      tasks: updatedTasks
    });
  };
  
  // Save settings and close the sheet
  const handleSave = () => {
    onSave(node.id, settings);
    onOpenChange(false);
  };

  // Check if we have any tasks with data
  const hasData = settings.tasks && settings.tasks.some(task => 
    task.code || task.assignedTo || task.description || task.dueDate || task.attachWiki
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl overflow-y-auto">
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
                disabled
              >
                Greeting
              </Button>
              <Button 
                variant={node.type === 'question' ? 'default' : 'outline'} 
                className="h-9"
                disabled
              >
                Question
              </Button>
              <Button 
                variant={node.type === 'response' ? 'default' : 'outline'} 
                className="h-9"
                disabled
              >
                Response
              </Button>
            </div>
          </div>
          
          {/* Tasks Table */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium flex items-center gap-2">
                <Table size={16} />
                Task Settings
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddTask}
                className="h-8"
              >
                <Plus size={14} className="mr-1" />
                Add Task
              </Button>
            </div>
            
            {(settings.tasks && settings.tasks.length > 0) ? (
              <div className="border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">Code Reference</TableHead>
                      <TableHead className="w-[120px]">Assigned To</TableHead>
                      <TableHead className="w-[180px]">Description</TableHead>
                      <TableHead className="w-[120px]">Due Date</TableHead>
                      <TableHead className="w-[120px]">Attach Wiki</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settings.tasks.map((task, index) => (
                      <TableRow key={index}>
                        <TableCell className="p-2 align-top">
                          <div className="space-y-1">
                            <Input 
                              value={task.code}
                              onChange={(e) => handleTaskChange(index, 'code', e.target.value)}
                              placeholder="Code name"
                              className="h-8 text-xs"
                            />
                            <Input 
                              value={task.codeUrl || ''}
                              onChange={(e) => handleTaskChange(index, 'codeUrl', e.target.value)}
                              placeholder="URL (optional)"
                              className="h-8 text-xs"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="p-2 align-top">
                          <Input 
                            value={task.assignedTo}
                            onChange={(e) => handleTaskChange(index, 'assignedTo', e.target.value)}
                            placeholder="Assignee"
                            className="h-8 text-xs"
                          />
                        </TableCell>
                        <TableCell className="p-2 align-top">
                          <Textarea 
                            value={task.description}
                            onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                            placeholder="Task description"
                            className="h-20 text-xs min-h-[80px] resize-none"
                          />
                        </TableCell>
                        <TableCell className="p-2 align-top">
                          <Select 
                            value={task.dueDate} 
                            onValueChange={(value) => handleTaskChange(index, 'dueDate', value)}
                          >
                            <SelectTrigger className="h-8 text-xs">
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
                        </TableCell>
                        <TableCell className="p-2 align-top">
                          <Select 
                            value={task.attachWiki} 
                            onValueChange={(value) => handleTaskChange(index, 'attachWiki', value)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select wiki" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Patient Guide">Patient Guide</SelectItem>
                              <SelectItem value="Treatment Plan">Treatment Plan</SelectItem>
                              <SelectItem value="Billing Information">Billing Information</SelectItem>
                              <SelectItem value="Aftercare Instructions">Aftercare Instructions</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="p-2 align-top">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500"
                            onClick={() => handleRemoveTask(index)}
                          >
                            <Trash size={14} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 border rounded-md bg-muted/20">
                <p className="text-sm text-muted-foreground">No tasks configured</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddTask}
                  className="mt-2"
                >
                  <Plus size={14} className="mr-1" />
                  Add Task Row
                </Button>
              </div>
            )}
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
