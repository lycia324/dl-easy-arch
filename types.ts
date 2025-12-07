export enum NodeType {
  LAYER = 'LAYER',
  OPERATION = 'OPERATION',
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
  NOTE = 'NOTE'
}

export enum OpSymbol {
  SUM = '+',
  MULT = '×',
  CONCAT = '©',
  DOT = '•'
}

export interface NodeData {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string; // Tailwind color class meant for background
  subLabel?: string; // e.g. "3x3, 64"
  symbol?: OpSymbol;
}

export interface EdgeData {
  id: string;
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
}

export interface DiagramState {
  nodes: NodeData[];
  edges: EdgeData[];
}

export interface ViewTransform {
  x: number;
  y: number;
  scale: number;
}
