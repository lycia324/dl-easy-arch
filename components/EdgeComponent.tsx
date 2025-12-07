import React from 'react';
import { NodeData, EdgeData } from '../types';

interface EdgeComponentProps {
  edge: EdgeData;
  fromNode: NodeData;
  toNode: NodeData;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

export const EdgeComponent: React.FC<EdgeComponentProps> = ({ edge, fromNode, toNode, isSelected, onSelect }) => {
  // Calculate centers
  const fromW = fromNode.width || (fromNode.type === 'OPERATION' ? 48 : 140);
  const fromH = fromNode.height || (fromNode.type === 'OPERATION' ? 48 : 60);
  const toW = toNode.width || (toNode.type === 'OPERATION' ? 48 : 140);
  const toH = toNode.height || (toNode.type === 'OPERATION' ? 48 : 60);

  let x1 = fromNode.x + fromW / 2;
  let y1 = fromNode.y + fromH / 2;
  let x2 = toNode.x + toW / 2;
  let y2 = toNode.y + toH / 2;

  // --- Visual Snap Logic ---
  // If coordinates are very close (within 8px), snap them to the average to make the line straight.
  // This compensates for grid-snap offsets between different sized nodes (e.g. 140px vs 48px widths).
  const SNAP_THRESHOLD = 8;

  if (Math.abs(x1 - x2) < SNAP_THRESHOLD) {
    const avgX = (x1 + x2) / 2;
    x1 = avgX;
    x2 = avgX;
  }

  if (Math.abs(y1 - y2) < SNAP_THRESHOLD) {
    const avgY = (y1 + y2) / 2;
    y1 = avgY;
    y2 = avgY;
  }

  // Simple path logic
  const path = `M ${x1} ${y1} L ${x2} ${y2}`;

  // Calculate angle for text
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  return (
    <g className="group cursor-pointer" onClick={onSelect}>
      {/* Invisible thick path for easier clicking */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth="12"
        fill="none"
        className="pointer-events-auto"
      />
      
      {/* Selection Glow */}
      {isSelected && (
        <path
          d={path}
          stroke="#60a5fa" 
          strokeWidth="4"
          fill="none"
          opacity="0.5"
        />
      )}

      {/* Visible Path */}
      <path
        d={path}
        stroke={isSelected ? "#2563eb" : "black"}
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
        strokeDasharray={edge.dashed ? "5,5" : "none"}
        className="pointer-events-none"
      />

      {/* Label */}
      {edge.label && (
        <g transform={`translate(${midX}, ${midY})`}>
          <rect x="-15" y="-10" width="30" height="20" fill="white" rx="4" className={isSelected ? 'stroke-blue-500 stroke-1' : ''} />
          <text
            x="0"
            y="4"
            textAnchor="middle"
            className={`text-[10px] font-mono ${isSelected ? 'fill-blue-600 font-bold' : 'fill-gray-600'}`}
          >
            {edge.label}
          </text>
        </g>
      )}
    </g>
  );
};