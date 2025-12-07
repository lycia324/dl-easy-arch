import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'zh';

const translations = {
  en: {
    "toolbar.select": "Select & Move (V)",
    "toolbar.pan": "Pan Canvas (H)",
    "toolbar.addLayer": "Add Convolution Layer",
    "toolbar.addOp": "Add Sum Operation",
    "toolbar.addInput": "Add Input Node",
    "toolbar.export": "Export SVG",
    "toolbar.clear": "Clear Canvas",
    "toolbar.alignLeft": "Align Left",
    "toolbar.alignCenterX": "Align Center X",
    "toolbar.alignRight": "Align Right",
    "toolbar.distributeH": "Distribute Horizontally",
    "toolbar.alignTop": "Align Top",
    "toolbar.alignCenterY": "Align Center Y",
    "toolbar.alignBottom": "Align Bottom",
    "toolbar.distributeV": "Distribute Vertically",
    "toolbar.language": "Switch Language",
    
    "props.nodeTitle": "Node Properties",
    "props.edgeTitle": "Edge Properties",
    "props.label": "Label",
    "props.subLabel": "Details (Sub-label)",
    "props.width": "Width",
    "props.height": "Height",
    "props.color": "Color",
    "props.style": "Style",
    "props.dashed": "Dashed Line",
    "props.placeholder.details": "e.g. 64 channels",
    "props.placeholder.edge": "e.g. 1x1 conv",
    "props.pos.x": "X Position",
    "props.pos.y": "Y Position",

    "color.white": "White",
    "color.blue": "Blue",
    "color.green": "Green",
    "color.yellow": "Yellow",
    "color.red": "Red",
    "color.purple": "Purple",
    "color.pink": "Pink",
    "color.gray": "Gray",

    "controls.title": "Controls",
    "controls.select": "Select Mode",
    "controls.pan": "Pan Mode",
    "controls.multiSelect": "Multi-Select",
    "controls.connect": "Connect",
    "controls.snap": "Nodes snap to grid (10px)",
    "controls.click": "Click",
    "controls.drag": "Drag",
    "controls.noSnap": "Disable Snap",
    "controls.targeting": "Targeting..."
  },
  zh: {
    "toolbar.select": "选择与移动 (V)",
    "toolbar.pan": "拖动画布 (H)",
    "toolbar.addLayer": "添加卷积层",
    "toolbar.addOp": "添加求和操作",
    "toolbar.addInput": "添加输入节点",
    "toolbar.export": "导出 SVG",
    "toolbar.clear": "清空画布",
    "toolbar.alignLeft": "左对齐",
    "toolbar.alignCenterX": "水平居中",
    "toolbar.alignRight": "右对齐",
    "toolbar.distributeH": "水平分布",
    "toolbar.alignTop": "顶对齐",
    "toolbar.alignCenterY": "垂直居中",
    "toolbar.alignBottom": "底对齐",
    "toolbar.distributeV": "垂直分布",
    "toolbar.language": "切换语言",

    "props.nodeTitle": "节点属性",
    "props.edgeTitle": "连线属性",
    "props.label": "标签",
    "props.subLabel": "详细信息 (副标签)",
    "props.width": "宽度",
    "props.height": "高度",
    "props.color": "颜色",
    "props.style": "样式",
    "props.dashed": "虚线样式",
    "props.placeholder.details": "例如: 64通道",
    "props.placeholder.edge": "例如: 1x1 卷积",
    "props.pos.x": "X 坐标",
    "props.pos.y": "Y 坐标",

    "color.white": "白色",
    "color.blue": "蓝色",
    "color.green": "绿色",
    "color.yellow": "黄色",
    "color.red": "红色",
    "color.purple": "紫色",
    "color.pink": "粉色",
    "color.gray": "灰色",

    "controls.title": "操作指南",
    "controls.select": "选择模式",
    "controls.pan": "拖拽模式",
    "controls.multiSelect": "多选",
    "controls.connect": "连接节点",
    "controls.snap": "节点自动对齐网格 (10px)",
    "controls.click": "点击",
    "controls.drag": "拖拽",
    "controls.noSnap": "取消对齐",
    "controls.targeting": "选择目标..."
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: keyof typeof translations['en']) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};