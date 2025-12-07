import React, { useState, useRef, useCallback, useEffect } from 'react';
import { NodeComponent } from './components/NodeComponent';
import { EdgeComponent } from './components/EdgeComponent';
import { Toolbar } from './components/Toolbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { exportToSvg } from './services/svgExporter';
import { NodeType, NodeData, EdgeData, DiagramState, OpSymbol, ViewTransform } from './types';
import { Zap } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

const INITIAL_STATE: DiagramState = {
  nodes: [
    { id: '1', type: NodeType.INPUT, label: 'Input Image', x: 340, y: 60, width: 120, height: 40, color: 'bg-gray-50' },
    { id: '2', type: NodeType.LAYER, label: 'Conv 7x7', subLabel: '64, /2', x: 340, y: 160, width: 140, height: 60, color: 'bg-blue-100' },
    { id: '3', type: NodeType.LAYER, label: 'MaxPool', subLabel: '3x3, /2', x: 340, y: 260, width: 140, height: 60, color: 'bg-pink-100' },
  ],
  edges: [
    { id: 'e1', from: '1', to: '2' },
    { id: 'e2', from: '2', to: '3', dashed: true },
  ]
};

const GRID_SIZE = 10;

function NeuroGraph() {
  const { t } = useLanguage();
  const [diagram, setDiagram] = useState<DiagramState>(INITIAL_STATE);
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  
  // Canvas View State
  const [view, setView] = useState<ViewTransform>({ x: 0, y: 0, scale: 1 });
  const [toolMode, setToolMode] = useState<'select' | 'pan'>('select');
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Drag State
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Connection Mode State
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [connectionStartId, setConnectionStartId] = useState<string | null>(null);

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);

  // Keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(true);
      if (e.key === 'Control' || e.key === 'Meta') setIsCtrlPressed(true);
      
      // Shortcuts
      if (e.key === 'v') setToolMode('select');
      if (e.key === 'h') setToolMode('pan');
      
      if ((e.key === 'Delete' || e.key === 'Backspace')) {
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

        if (selectedNodeIds.size > 0) {
           setDiagram(prev => ({
            nodes: prev.nodes.filter(n => !selectedNodeIds.has(n.id)),
            edges: prev.edges.filter(e => !selectedNodeIds.has(e.from) && !selectedNodeIds.has(e.to))
          }));
          setSelectedNodeIds(new Set());
        }

        if (selectedEdgeId) {
          setDiagram(prev => ({
            ...prev,
            edges: prev.edges.filter(e => e.id !== selectedEdgeId)
          }));
          setSelectedEdgeId(null);
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false);
        setConnectionStartId(null);
      }
      if (e.key === 'Control' || e.key === 'Meta') setIsCtrlPressed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedNodeIds, selectedEdgeId]);

  // --- Mouse / Canvas Logic ---

  const getCanvasCoordinates = (e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - view.x) / view.scale,
      y: (e.clientY - rect.top - view.y) / view.scale
    };
  };

  const handleNodeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    // Connection Logic (Shift + Click)
    if (isShiftPressed) {
      if (connectionStartId === null) {
        setConnectionStartId(id);
      } else if (connectionStartId !== id) {
        const newEdge: EdgeData = {
          id: `e-${Date.now()}`,
          from: connectionStartId,
          to: id
        };
        setDiagram(prev => ({ ...prev, edges: [...prev.edges, newEdge] }));
        setConnectionStartId(null);
      }
      return;
    }

    // Selection Logic
    if (toolMode === 'select') {
      const coords = getCanvasCoordinates(e);
      const node = diagram.nodes.find(n => n.id === id);
      
      // Clear edge selection when clicking a node
      setSelectedEdgeId(null);

      if (isCtrlPressed) {
        // Toggle selection
        setSelectedNodeIds(prev => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      } else {
        // Single select (unless already selected, then start drag group)
        if (!selectedNodeIds.has(id)) {
          setSelectedNodeIds(new Set([id]));
        }
      }

      // Start Dragging
      setIsDraggingNode(true);
      if (node) {
        setDragOffset({ x: coords.x - node.x, y: coords.y - node.y });
      }
    }
  };

  const handleEdgeClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (toolMode === 'select' && !isShiftPressed) {
      setSelectedEdgeId(id);
      setSelectedNodeIds(new Set()); // Clear node selection
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Pan Mode
    if (toolMode === 'pan' || (toolMode === 'select' && e.button === 1)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - view.x, y: e.clientY - view.y });
      return;
    }

    // Clear Selection if clicking empty space
    if (!isCtrlPressed && !isShiftPressed) {
      setSelectedNodeIds(new Set());
      setSelectedEdgeId(null);
      setConnectionStartId(null);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setView(prev => ({
        ...prev,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      }));
      return;
    }

    if (isDraggingNode && selectedNodeIds.size > 0) {
      const coords = getCanvasCoordinates(e);
      
      if (selectedNodeIds.size === 1) {
        const id = Array.from(selectedNodeIds)[0];
        
        const rawX = coords.x - dragOffset.x;
        const rawY = coords.y - dragOffset.y;
        
        // If Alt is held, skip snap. Otherwise, snap to grid.
        const newX = e.altKey ? rawX : Math.round(rawX / GRID_SIZE) * GRID_SIZE;
        const newY = e.altKey ? rawY : Math.round(rawY / GRID_SIZE) * GRID_SIZE;

        setDiagram(prev => ({
          ...prev,
          nodes: prev.nodes.map(n => 
            n.id === id 
              ? { ...n, x: newX, y: newY } 
              : n
          )
        }));
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingNode(false);
    setIsPanning(false);
  };

  // --- Node & Edge Updates ---
  const handleUpdateNode = (id: string, updates: Partial<NodeData>) => {
    setDiagram(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === id ? { ...n, ...updates } : n)
    }));
  };

  const handleUpdateEdge = (id: string, updates: Partial<EdgeData>) => {
    setDiagram(prev => ({
      ...prev,
      edges: prev.edges.map(e => e.id === id ? { ...e, ...updates } : e)
    }));
  };

  // --- Alignment Logic ---
  const handleAlign = (direction: 'left' | 'center-x' | 'right' | 'top' | 'center-y' | 'bottom' | 'distribute-h' | 'distribute-v') => {
    if (selectedNodeIds.size < 2) return;

    setDiagram(prev => {
      const selectedNodes = prev.nodes.filter(n => selectedNodeIds.has(n.id));
      if (selectedNodes.length === 0) return prev;
      
      let newSelectedNodes = [...selectedNodes];

      let value = 0;
      switch (direction) {
        case 'left':
          value = Math.min(...selectedNodes.map(n => n.x));
          newSelectedNodes = selectedNodes.map(n => ({ ...n, x: value }));
          break;
        case 'right':
          const maxRight = Math.max(...selectedNodes.map(n => n.x + (n.width || 140)));
          newSelectedNodes = selectedNodes.map(n => ({ ...n, x: maxRight - (n.width || 140) }));
          break;
        case 'center-x':
          const avgX = selectedNodes.reduce((acc, n) => acc + n.x + (n.width || 140)/2, 0) / selectedNodes.length;
          newSelectedNodes = selectedNodes.map(n => ({ ...n, x: avgX - (n.width || 140)/2 }));
          break;
        case 'top':
          value = Math.min(...selectedNodes.map(n => n.y));
          newSelectedNodes = selectedNodes.map(n => ({ ...n, y: value }));
          break;
        case 'bottom':
          const maxBottom = Math.max(...selectedNodes.map(n => n.y + (n.height || 60)));
          newSelectedNodes = selectedNodes.map(n => ({ ...n, y: maxBottom - (n.height || 60) }));
          break;
        case 'center-y':
          const avgY = selectedNodes.reduce((acc, n) => acc + n.y + (n.height || 60)/2, 0) / selectedNodes.length;
          newSelectedNodes = selectedNodes.map(n => ({ ...n, y: avgY - (n.height || 60)/2 }));
          break;
        
        case 'distribute-h':
          newSelectedNodes.sort((a, b) => a.x - b.x);
          if (newSelectedNodes.length > 2) {
            const first = newSelectedNodes[0];
            const last = newSelectedNodes[newSelectedNodes.length - 1];
            const totalSpan = (last.x + (last.width||140)/2) - (first.x + (first.width||140)/2);
            const step = totalSpan / (newSelectedNodes.length - 1);
            
            newSelectedNodes = newSelectedNodes.map((node, i) => {
              if (i === 0 || i === newSelectedNodes.length - 1) return node;
              const newCenterX = (first.x + (first.width||140)/2) + step * i;
              return { ...node, x: newCenterX - (node.width||140)/2 };
            });
          }
          break;

        case 'distribute-v':
           newSelectedNodes.sort((a, b) => a.y - b.y);
           if (newSelectedNodes.length > 2) {
             const first = newSelectedNodes[0];
             const last = newSelectedNodes[newSelectedNodes.length - 1];
             const totalSpan = (last.y + (last.height||60)/2) - (first.y + (first.height||60)/2);
             const step = totalSpan / (newSelectedNodes.length - 1);
             
             newSelectedNodes = newSelectedNodes.map((node, i) => {
               if (i === 0 || i === newSelectedNodes.length - 1) return node;
               const newCenterY = (first.y + (first.height||60)/2) + step * i;
               return { ...node, y: newCenterY - (node.height||60)/2 };
             });
           }
           break;
      }

      const nodeMap = new Map(newSelectedNodes.map(n => [n.id, n]));
      return {
        ...prev,
        nodes: prev.nodes.map(n => nodeMap.get(n.id) || n)
      };
    });
  };

  // --- Node Adding ---
  const addNode = (type: NodeType, label: string = "Node", symbol?: OpSymbol) => {
    // Add near center of current view
    const centerX = -view.x / view.scale + (canvasRef.current?.clientWidth || 800) / 2 / view.scale;
    const centerY = -view.y / view.scale + (canvasRef.current?.clientHeight || 600) / 2 / view.scale;

    const snappedX = Math.round((centerX + (Math.random() * 40 - 20)) / GRID_SIZE) * GRID_SIZE;
    const snappedY = Math.round((centerY + (Math.random() * 40 - 20)) / GRID_SIZE) * GRID_SIZE;

    const newNode: NodeData = {
      id: `n-${Date.now()}`,
      type,
      label,
      symbol,
      x: snappedX,
      y: snappedY,
      width: type === NodeType.OPERATION ? 48 : 140,
      height: type === NodeType.OPERATION ? 48 : 60,
      color: type === NodeType.LAYER ? 'bg-blue-100' : 
             type === NodeType.OPERATION ? 'bg-yellow-100' : 'bg-gray-50'
    };
    setDiagram(prev => ({ ...prev, nodes: [...prev.nodes, newNode] }));
  };

  // Get active item for properties panel
  const activeNode = selectedNodeIds.size === 1 
    ? diagram.nodes.find(n => n.id === Array.from(selectedNodeIds)[0]) 
    : undefined;
  
  const activeEdge = selectedEdgeId 
    ? diagram.edges.find(e => e.id === selectedEdgeId)
    : undefined;

  return (
    <div className="w-full h-screen bg-neutral-50 flex overflow-hidden">
      
      {/* Canvas Area */}
      <div 
        ref={canvasRef}
        className={`flex-1 relative overflow-hidden bg-grid select-none ${toolMode === 'pan' || isPanning ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseDown={handleCanvasMouseDown}
      >
        <div 
          className="absolute origin-top-left transition-transform duration-75 ease-out will-change-transform"
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
        >
          {/* Edges Layer */}
          <svg className="absolute top-0 left-0 w-[5000px] h-[5000px] pointer-events-none z-0 overflow-visible">
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="black" />
              </marker>
            </defs>
            {diagram.edges.map(edge => {
              const fromNode = diagram.nodes.find(n => n.id === edge.from);
              const toNode = diagram.nodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;
              return (
                <EdgeComponent 
                    key={edge.id} 
                    edge={edge} 
                    fromNode={fromNode} 
                    toNode={toNode}
                    isSelected={edge.id === selectedEdgeId}
                    onSelect={(e) => handleEdgeClick(e, edge.id)}
                />
              );
            })}
             {connectionStartId && isShiftPressed && (
                <text x={diagram.nodes.find(n => n.id === connectionStartId)?.x} y={(diagram.nodes.find(n => n.id === connectionStartId)?.y || 0) - 20} className="fill-blue-500 font-bold text-sm">{t('controls.targeting')}</text>
             )}
          </svg>

          {/* Nodes Layer */}
          {diagram.nodes.map(node => (
            <NodeComponent 
              key={node.id} 
              data={node} 
              isSelected={selectedNodeIds.has(node.id) || connectionStartId === node.id}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)} 
            />
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar 
        onAddNode={addNode} 
        onClear={() => { setDiagram({ nodes: [], edges: [] }); setSelectedNodeIds(new Set()); setSelectedEdgeId(null); }}
        onExport={() => exportToSvg(diagram)}
        onAlign={handleAlign}
        selectionCount={selectedNodeIds.size}
        toolMode={toolMode}
        setToolMode={setToolMode}
      />

      {/* Properties Panel */}
      {(activeNode || activeEdge) && (
        <PropertiesPanel 
          node={activeNode}
          edge={activeEdge} 
          onUpdateNode={handleUpdateNode}
          onUpdateEdge={handleUpdateEdge}
          onClose={() => { setSelectedNodeIds(new Set()); setSelectedEdgeId(null); }}
        />
      )}

      {/* Legend / Guide */}
      <div className="absolute bottom-4 left-4 bg-white/90 border border-gray-200 p-4 rounded-lg shadow-sm backdrop-blur-sm pointer-events-none select-none">
        <h3 className="font-paper font-bold mb-2 flex items-center gap-2"><Zap size={14} className="text-yellow-600"/> {t('controls.title')}</h3>
        <ul className="text-xs space-y-1 text-gray-600 font-mono">
          <li className="flex items-center gap-2"><span className="font-bold border px-1 rounded">V</span> {t('controls.select')}</li>
          <li className="flex items-center gap-2"><span className="font-bold border px-1 rounded">H</span> {t('controls.pan')}</li>
          <li className="flex items-center gap-2"><span className="font-bold border px-1 rounded">Ctrl</span> + {t('controls.click')} {t('controls.multiSelect')}</li>
          <li className="flex items-center gap-2"><span className="font-bold border px-1 rounded">Shift</span> + {t('controls.click')} {t('controls.connect')}</li>
          <li className="flex items-center gap-2"><span className="font-bold border px-1 rounded">Alt</span> + {t('controls.drag')} {t('controls.noSnap')}</li>
          <li className="flex items-center gap-2 text-blue-600 font-bold mt-2">{t('controls.snap')}</li>
        </ul>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <NeuroGraph />
    </LanguageProvider>
  );
}