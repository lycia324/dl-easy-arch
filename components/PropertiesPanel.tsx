import React from 'react';
import { NodeData, EdgeData } from '../types';
import { X, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PropertiesPanelProps {
  node?: NodeData;
  edge?: EdgeData;
  onUpdateNode?: (id: string, updates: Partial<NodeData>) => void;
  onUpdateEdge?: (id: string, updates: Partial<EdgeData>) => void;
  onClose: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ node, edge, onUpdateNode, onUpdateEdge, onClose }) => {
  const { t } = useLanguage();
  const isEdge = !!edge;

  const COLORS = [
    { class: 'bg-white', label: t('color.white') },
    { class: 'bg-blue-100', label: t('color.blue') },
    { class: 'bg-green-100', label: t('color.green') },
    { class: 'bg-yellow-100', label: t('color.yellow') },
    { class: 'bg-red-100', label: t('color.red') },
    { class: 'bg-purple-100', label: t('color.purple') },
    { class: 'bg-pink-100', label: t('color.pink') },
    { class: 'bg-gray-100', label: t('color.gray') },
  ];

  return (
    <div className="absolute top-20 right-4 w-64 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl p-4 z-40 animate-in slide-in-from-right-10 fade-in duration-200">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
        <h3 className="font-paper font-bold text-lg">{isEdge ? t('props.edgeTitle') : t('props.nodeTitle')}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="space-y-4">
        
        {/* === NODE PROPERTIES === */}
        {node && onUpdateNode && (
          <>
            {/* Label */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('props.label')}</label>
              <input
                type="text"
                value={node.label}
                onChange={(e) => onUpdateNode(node.id, { label: e.target.value })}
                className="w-full px-2 py-1.5 border-2 border-gray-200 rounded font-bold text-sm focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            {/* SubLabel */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('props.subLabel')}</label>
              <input
                type="text"
                value={node.subLabel || ''}
                onChange={(e) => onUpdateNode(node.id, { subLabel: e.target.value })}
                placeholder={t('props.placeholder.details')}
                className="w-full px-2 py-1.5 border-2 border-gray-200 rounded font-mono text-xs focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Dimensions */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('props.width')}</label>
                <input
                  type="number"
                  value={node.width || 140}
                  onChange={(e) => onUpdateNode(node.id, { width: Number(e.target.value) })}
                  className="w-full px-2 py-1.5 border-2 border-gray-200 rounded font-mono text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('props.height')}</label>
                <input
                  type="number"
                  value={node.height || 60}
                  onChange={(e) => onUpdateNode(node.id, { height: Number(e.target.value) })}
                  className="w-full px-2 py-1.5 border-2 border-gray-200 rounded font-mono text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t('props.color')}</label>
              <div className="grid grid-cols-4 gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.class}
                    onClick={() => onUpdateNode(node.id, { color: c.class })}
                    className={`w-8 h-8 rounded-full border-2 ${c.class} ${
                      node.color === c.class ? 'border-black ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-400'
                    } transition-all`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
            
            {/* Position Readout (Read only) */}
            <div className="pt-2 border-t border-gray-100 flex justify-between text-[10px] text-gray-400 font-mono">
              <span>X: {Math.round(node.x)}</span>
              <span>Y: {Math.round(node.y)}</span>
            </div>
          </>
        )}

        {/* === EDGE PROPERTIES === */}
        {edge && onUpdateEdge && (
          <>
            {/* Label */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('props.label')}</label>
              <input
                type="text"
                value={edge.label || ''}
                onChange={(e) => onUpdateEdge(edge.id, { label: e.target.value })}
                placeholder={t('props.placeholder.edge')}
                className="w-full px-2 py-1.5 border-2 border-gray-200 rounded font-mono text-sm focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Style */}
            <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t('props.style')}</label>
               <label className="flex items-center gap-2 cursor-pointer p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${edge.dashed ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}`}>
                    {edge.dashed && <Check size={12} className="text-white" />}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={!!edge.dashed} 
                    onChange={(e) => onUpdateEdge(edge.id, { dashed: e.target.checked })} 
                  />
                  <span className="text-sm">{t('props.dashed')}</span>
               </label>
            </div>
          </>
        )}

      </div>
    </div>
  );
};