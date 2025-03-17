
export interface Node {
  id: string;
  type: 'greeting' | 'question' | 'response';
  title: string;
  content: string;
  position: { x: number; y: number };
  options?: string[];
}

export interface Connection {
  id: string;
  source: string;
  target: string;
}

export interface WorkflowState {
  nodes: Node[];
  connections: Connection[];
  selectedNode: string | null;
  connectingFrom: string | null;
}
