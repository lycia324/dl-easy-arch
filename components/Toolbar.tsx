import React from 'react';
import { 
  Square, Circle, ArrowRight, Trash2, 
  Download, AlignLeft, AlignCenter, AlignRight, 
  ArrowUpToLine, AlignCenterVertical, ArrowDownToLine,
  Hand, MousePointer2, AlignHorizontalDistributeCenter, AlignVerticalDistributeCenter,
  Languages
} from 'lucide-react';
import { NodeType, OpSymbol } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ToolbarProps {
  onAddNode: (type: NodeType, label?: string, symbol?: OpSymbol) => void;
  onClear: () => void;
  onExport: () => void;
  onAlign: (direction: 'left' | 'center-x' | 'right' | 'top' | 'center-y' | 'bottom' | 'distribute-h' | 'distribute-v') => void;
  selectionCount: number;
  toolMode: 'select' | 'pan';
  setToolMode: (mode: 'select' | 'pan') => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  onAddNode, onClear, onExport, onAlign, 
  selectionCount, toolMode, setToolMode 
}) => {
  const { t, language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-50 items-center">
      
      {/* Main Toolbar */}
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl p-2 flex items-center gap-2">
        
        {/* Tools */}
        <div className="flex gap-1 pr-4 border-r-2 border-gray-100">
          <button 
            onClick={() => setToolMode('select')}
            className={`p-2 rounded flex flex-col items-center gap-1 group ${toolMode === 'select' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-50 text-gray-600'}`}
            title={t('toolbar.select')}
          >
            <MousePointer2 size={20} />
          </button>
          <button 
            onClick={() => setToolMode('pan')}
            className={`p-2 rounded flex flex-col items-center gap-1 group ${toolMode === 'pan' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-50 text-gray-600'}`}
            title={t('toolbar.pan')}
          >
            <Hand size={20} />
          </button>
        </div>

        {/* Nodes */}
        <div className="flex gap-1 pr-4 border-r-2 border-gray-100 pl-2">
          <button 
            onClick={() => onAddNode(NodeType.LAYER, "Conv2d")}
            className="p-2 hover:bg-blue-50 rounded text-blue-600 flex flex-col items-center gap-1 group"
            title={t('toolbar.addLayer')}
          >
            <Square size={20} />
          </button>
          
          <button 
            onClick={() => onAddNode(NodeType.OPERATION, "Sum", OpSymbol.SUM)}
            className="p-2 hover:bg-yellow-50 rounded text-yellow-600 flex flex-col items-center gap-1 group"
            title={t('toolbar.addOp')}
          >
            <Circle size={20} />
          </button>

          <button 
            onClick={() => onAddNode(NodeType.INPUT, "Input")}
            className="p-2 hover:bg-gray-50 rounded text-gray-600 flex flex-col items-center gap-1 group"
            title={t('toolbar.addInput')}
          >
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pl-2 items-center">
          <button 
            onClick={onExport}
            className="p-2 hover:bg-green-50 text-green-700 rounded-lg transition-colors"
            title={t('toolbar.export')}
          >
            <Download size={18} />
          </button>

          <button 
            onClick={onClear}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title={t('toolbar.clear')}
          >
            <Trash2 size={18} />
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1"></div>

          <button 
            onClick={toggleLanguage}
            className="p-2 hover:bg-purple-50 text-purple-700 rounded-lg transition-colors flex items-center gap-1.5"
            title={t('toolbar.language')}
          >
            <Languages size={18} />
            <span className="font-bold text-xs pt-0.5">{language === 'en' ? 'EN' : '中'}</span>
          </button>
        </div>
      </div>

      {/* Alignment Toolbar (Contextual) */}
      {selectionCount > 1 && (
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl p-1 flex gap-1 animate-in fade-in slide-in-from-top-2">
          <button onClick={() => onAlign('left')} className="p-1.5 hover:bg-gray-100 rounded text-gray-700" title={t('toolbar.alignLeft')}>
            <AlignLeft size={16} />
          </button>
          <button onClick={() => onAlign('center-x')} className="p-1.5 hover:bg-gray-100 rounded text-gray-700" title={t('toolbar.alignCenterX')}>
            <AlignCenter size={16} />
          </button>
          <button onClick={() => onAlign('right')} className="p-1.5 hover:bg-gray-100 rounded text-gray-700" title={t('toolbar.alignRight')}>
            <AlignRight size={16} />
          </button>
          <button onClick={() => onAlign('distribute-h')} className="p-1.5 hover:bg-gray-100 rounded text-gray-700" title={t('toolbar.distributeH')}>
            <AlignHorizontalDistributeCenter size={16} />
          </button>
          
          <div className="w-px bg-gray-200 mx-1"></div>
          
          <button onClick={() => onAlign('top')} className="p-1.5 hover:bg-gray-100 rounded text-gray-700" title={t('toolbar.alignTop')}>
            <ArrowUpToLine size={16} />
          </button>
          <button onClick={() => onAlign('center-y')} className="p-1.5 hover:bg-gray-100 rounded text-gray-700" title={t('toolbar.alignCenterY')}>
            <AlignCenterVertical size={16} />
          </button>
          <button onClick={() => onAlign('bottom')} className="p-1.5 hover:bg-gray-100 rounded text-gray-700" title={t('toolbar.alignBottom')}>
            <ArrowDownToLine size={16} />
          </button>
          <button onClick={() => onAlign('distribute-v')} className="p-1.5 hover:bg-gray-100 rounded text-gray-700" title={t('toolbar.distributeV')}>
            <AlignVerticalDistributeCenter size={16} />
          </button>
        </div>
      )}
    </div>
  );
};