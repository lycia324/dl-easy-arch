import React, { memo } from 'react';
import { NodeData, NodeType } from '../types';
import { GripHorizontal } from 'lucide-react';

interface NodeComponentProps {
  data: NodeData;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

export const NodeComponent: React.FC<NodeComponentProps> = memo(({ data, isSelected, onMouseDown }) => {
  const { type, label, subLabel, color, symbol } = data;

  const baseClasses = `absolute flex flex-col items-center justify-center transition-shadow cursor-grab active:cursor-grabbing border-2 border-black`;
  const selectedClasses = isSelected ? 'ring-4 ring-blue-400/50 z-50' : 'z-10 hover:z-20';
  
  // Style variations based on scientific paper aesthetics
  
  if (type === NodeType.OPERATION) {
    return (
      <div
        style={{ left: data.x, top: data.y, width: 48, height: 48 }}
        className={`${baseClasses} ${selectedClasses} rounded-full ${color || 'bg-yellow-100'} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
        onMouseDown={onMouseDown}
      >
        <span className="text-2xl font-bold font-paper">{symbol || '+'}</span>
      </div>
    );
  }

  if (type === NodeType.INPUT || type === NodeType.OUTPUT) {
    return (
      <div
        style={{ left: data.x, top: data.y, width: data.width || 100, height: 40 }}
        className={`${baseClasses} ${selectedClasses} rounded-full border-dashed ${color || 'bg-gray-50'}`}
        onMouseDown={onMouseDown}
      >
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
    );
  }

  // Standard Layer Node (The "Box")
  return (
    <div
      style={{ left: data.x, top: data.y, width: data.width || 140, height: data.height || 60 }}
      className={`${baseClasses} ${selectedClasses} rounded-lg ${color || 'bg-white'} shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`}
      onMouseDown={onMouseDown}
    >
      <div className="flex flex-col items-center pointer-events-none">
        <span className="font-paper font-bold text-lg leading-tight">{label}</span>
        {subLabel && (
          <span className="font-sans text-[10px] text-gray-600 bg-white/50 px-1 rounded mt-1 border border-black/10">
            {subLabel}
          </span>
        )}
      </div>
      
      {/* Visual Grip Hint */}
      <div className="absolute top-1 right-1 opacity-0 hover:opacity-20 transition-opacity">
        <GripHorizontal size={12} />
      </div>
    </div>
  );
});