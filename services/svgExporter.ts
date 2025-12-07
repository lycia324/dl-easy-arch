import { DiagramState, NodeType, NodeData, EdgeData } from '../types';

export const exportToSvg = (diagram: DiagramState) => {
  const { nodes, edges } = diagram;
  if (nodes.length === 0) return;

  // Calculate bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach(node => {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + (node.width || 140));
    maxY = Math.max(maxY, node.y + (node.height || 60));
  });

  // Add padding
  const padding = 50;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;
  const width = maxX - minX;
  const height = maxY - minY;

  // Helper to map Tailwind colors to hex for SVG
  const getColor = (cls?: string) => {
    if (cls?.includes('blue')) return '#dbeafe';
    if (cls?.includes('pink')) return '#fce7f3';
    if (cls?.includes('yellow')) return '#fef9c3';
    if (cls?.includes('gray')) return '#f9fafb';
    return '#ffffff';
  };

  const createNodeHtml = (node: NodeData) => {
    const w = node.width || 140;
    const h = node.height || 60;
    const bg = getColor(node.color);
    const borderStyle = (node.type === NodeType.INPUT || node.type === NodeType.OUTPUT) ? 'dashed' : 'solid';
    const borderRadius = (node.type === NodeType.OPERATION || node.type === NodeType.INPUT || node.type === NodeType.OUTPUT) ? '999px' : '8px';
    const shadow = (node.type !== NodeType.INPUT && node.type !== NodeType.OUTPUT) ? 'box-shadow: 2px 2px 0px 0px rgba(0,0,0,1);' : '';
    
    // Inline styles for the node
    const style = `
      width: 100%; height: 100%;
      background-color: ${bg};
      border: 2px ${borderStyle} black;
      border-radius: ${borderRadius};
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      ${shadow}
      box-sizing: border-box;
      font-family: 'Times New Roman', serif;
    `;

    let content = '';
    if (node.type === NodeType.OPERATION) {
      content = `<span style="font-size: 24px; font-weight: bold;">${node.symbol || '+'}</span>`;
    } else {
      content = `
        <span style="font-size: 16px; font-weight: bold; line-height: 1;">${node.label}</span>
        ${node.subLabel ? `<span style="font-size: 10px; color: #4b5563; background: rgba(255,255,255,0.5); padding: 0 4px; border-radius: 4px; margin-top: 4px; border: 1px solid rgba(0,0,0,0.1); font-family: sans-serif;">${node.subLabel}</span>` : ''}
      `;
    }

    return `
      <div xmlns="http://www.w3.org/1999/xhtml" style="${style}">
        ${content}
      </div>
    `;
  };

  // Generate SVG content
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${minX} ${minY} ${width} ${height}">
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="black" />
        </marker>
      </defs>
      
      <!-- Edges -->
      ${edges.map(edge => {
        const from = nodes.find(n => n.id === edge.from);
        const to = nodes.find(n => n.id === edge.to);
        if (!from || !to) return '';
        
        const fW = from.width || (from.type === 'OPERATION' ? 48 : 140);
        const fH = from.height || (from.type === 'OPERATION' ? 48 : 60);
        const tW = to.width || (to.type === 'OPERATION' ? 48 : 140);
        const tH = to.height || (to.type === 'OPERATION' ? 48 : 60);

        let x1 = from.x + fW / 2;
        let y1 = from.y + fH / 2;
        let x2 = to.x + tW / 2;
        let y2 = to.y + tH / 2;
        
        // --- Visual Snap Logic for Export ---
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
        
        const dashArray = edge.dashed ? 'stroke-dasharray="5,5"' : '';

        return `<path d="M ${x1} ${y1} L ${x2} ${y2}" stroke="black" stroke-width="2" fill="none" marker-end="url(#arrowhead)" ${dashArray} />`;
      }).join('')}

      <!-- Nodes -->
      ${nodes.map(node => {
        const w = node.width || (node.type === NodeType.OPERATION ? 48 : 140);
        const h = node.height || (node.type === NodeType.OPERATION ? 48 : 60);
        return `
          <foreignObject x="${node.x}" y="${node.y}" width="${w}" height="${h}">
            ${createNodeHtml(node)}
          </foreignObject>
        `;
      }).join('')}
    </svg>
  `;

  // Download
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `architecture_${Date.now()}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};