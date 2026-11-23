import type { CSSProperties, ComponentType } from "react";

export interface CircularCarouselItem {
  src: string;
  fallback?: string;
  alt?: string;
  title?: string;
  subtitle?: string;
  [key: string]: unknown;
}

export interface CircularCarouselProps {
  items?: CircularCarouselItem[];
  preset?: "cylinder" | "panorama" | "wheel" | "billboard" | string;
  intro?: "rise" | "spin" | "assemble" | "none" | string;
  cardWidth?: number;
  aspectRatio?: number | string;
  gap?: number;
  curve?: number;
  tilt?: number;
  perspective?: number;
  autoplay?: "drift" | "step" | "none" | boolean | string;
  speed?: number;
  interval?: number;
  direction?: "left" | "right" | "bounce" | string;
  bounceInterval?: number;
  draggable?: boolean;
  momentum?: number;
  snap?: boolean;
  pauseOnHover?: boolean;
  focusOnClick?: boolean;
  parallax?: number;
  stretch?: number;
  depthFade?: number;
  fadeColor?: string;
  innerShade?: number;
  cornerRadius?: number;
  captions?: boolean;
  onChange?: (index: number) => void;
  onItemClick?: (item: CircularCarouselItem, index: number) => void;
  className?: string;
  style?: CSSProperties;
}

declare const CircularCarousel: ComponentType<CircularCarouselProps>;
export default CircularCarousel;
