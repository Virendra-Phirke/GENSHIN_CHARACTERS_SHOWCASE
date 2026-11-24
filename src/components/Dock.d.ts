import React from 'react';

export interface DockItem {
  icon?: React.ReactNode;
  label?: string;
  onClick?: () => void;
  active?: boolean;
  badge?: string | number | boolean;
  className?: string;
  separator?: boolean;
  disabled?: boolean;
  menu?: any[];
}

export interface DockProps {
  items?: DockItem[];
  position?: 'bottom' | 'top' | 'left' | 'right';
  theme?: 'dark' | 'light';
  baseItemSize?: number;
  magnification?: number;
  distance?: number;
  panelHeight?: number;
  gap?: number;
  roundness?: number;
  spring?: { mass?: number; stiffness?: number; damping?: number };
  bounce?: boolean;
  autoHide?: boolean;
  tiles?: boolean;
  showLabels?: boolean;
  showIndicators?: boolean;
  showBadges?: boolean;
  badgeColor?: string;
  accentColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function Dock(props: DockProps): React.JSX.Element;
