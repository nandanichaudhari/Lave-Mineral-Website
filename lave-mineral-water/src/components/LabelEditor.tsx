"use client";
//import { useState, useRef, useCallback, useEffect } from "react";
// import {
//   Stage, Layer, Rect, Text, Transformer, Image as KonvaImage,
//   Circle, Line, RegularPolygon, Star, Arrow, Group, Path,
// } from "react-konva";
// import Konva from "konva";
import React, { useState, useRef, useCallback, useEffect } from "react";
// ─── Types ───────────────────────────────────────────────────────────────────

import {
  Circle, Square, Triangle, Star, Heart, Plus, Check, X,
  Cloud, MessageCircle, ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  Sun, Moon, Eye, Target, Zap, AtSign, Hash, Minus, Slash,
  Hexagon, Pentagon, Octagon, Diamond, Bookmark, Shield, Flag,
  Smile, Frown, Meh, Infinity, Crosshair, Anchor, Bell, Flame,
  Sparkles, Crown, Gem, Rocket, Globe, Leaf, Flower2, Trees,
  Snowflake, Waves, Wind, Droplets, Fish, Bird, Bug, Rabbit,
  Pizza, Coffee, IceCream2, Apple, Banana, Cherry,
  Music, Music2, Headphones, Mic, Radio, Tv,
  Camera, Gamepad2, Trophy, Medal, Gift, PartyPopper,
  Bike, Car, Plane, Train, Ship, Umbrella,
  Home, Building2, Mountain, Tent, Palmtree,
  Swords, Wand2, Dice5, Puzzle, Footprints, Handshake,
} from "lucide-react";
import type { LucideIcon } from "lucide-react"; // ← ADD THIS LINE

export const ICON_MAP: Record<string, LucideIcon> = {
  circle: Circle,
  square: Square,
  triangle: Triangle,
  star: Star,
  heart: Heart,
  plus: Plus,
  check: Check,
  x: X,
  cloud: Cloud,
  "message-circle": MessageCircle,
  "arrow-right": ArrowRight,
  "arrow-left": ArrowLeft,
  "arrow-up": ArrowUp,
  "arrow-down": ArrowDown,
  sun: Sun,
  moon: Moon,
  eye: Eye,
  target: Target,
  zap: Zap,
  "at-sign": AtSign,
  hash: Hash,
  minus: Minus,
  slash: Slash,
  hexagon: Hexagon,
  pentagon: Pentagon,
  octagon: Octagon,
  diamond: Diamond,
  bookmark: Bookmark,
  shield: Shield,
  flag: Flag,
  smile: Smile,
  frown: Frown,
  meh: Meh,
  infinity: Infinity,
  crosshair: Crosshair,
  anchor: Anchor,
  bell: Bell,
  flame: Flame,
  // ✨ NEW
  sparkles: Sparkles,
  crown: Crown,
  gem: Gem,
  rocket: Rocket,
  globe: Globe,
  leaf: Leaf,
  flower: Flower2,
  trees: Trees,
  snowflake: Snowflake,
  waves: Waves,
  wind: Wind,
  droplets: Droplets,
  fish: Fish,
  bird: Bird,
  bug: Bug,
  rabbit: Rabbit,
  pizza: Pizza,
  coffee: Coffee,
  "ice-cream": IceCream2,
  apple: Apple,
  banana: Banana,
  cherry: Cherry,
  music: Music,
  "music-2": Music2,
  headphones: Headphones,
  mic: Mic,
  radio: Radio,
  tv: Tv,
  camera: Camera,
  gamepad: Gamepad2,
  trophy: Trophy,
  medal: Medal,
  gift: Gift,
  party: PartyPopper,
  bike: Bike,
  car: Car,
  plane: Plane,
  train: Train,
  ship: Ship,
  umbrella: Umbrella,
  home: Home,
  building: Building2,
  mountain: Mountain,
  tent: Tent,
  palmtree: Palmtree,
  swords: Swords,
  wand: Wand2,
  dice: Dice5,
  puzzle: Puzzle,
  footprints: Footprints,
  handshake: Handshake,
};

type Tool = "select" | "draw" | "templates" | "elements" | "text" | "upload" | "bg" | "ai";

interface CanvasElement {
  id: string;
  type: "rect" | "text" | "image" | "icon" | "circle" | "star" | "triangle";
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
  opacity?: number;
  radius?: number;
  points?: number[];
  imageUrl?: string;
  draggable?: boolean;
  fontStyle?: string;
  align?: string;
  letterSpacing?: number;
  numPoints?: number;
  innerRadius?: number;
  outerRadius?: number;
  sides?: number;
  scaleX?: number;
  scaleY?: number;

  iconName?: string;
}

interface HistoryState {
  elements: CanvasElement[];
}

interface AIGeneratedDesign {
  name: string;
  background: string;
  elements: CanvasElement[];
  bgStyle: React.CSSProperties;
}

interface DrawStroke {
  id: string;
  points: number[];
  stroke: string;
  strokeWidth: number;
  opacity: number;
}

const COLOR_PALETTE = [
  "#0a0a0a", "#ffffff", "#e8e8e8", "#4badd4", "#1a6fa8", "#f5c842", "#f0e030",
  "#e84040", "#e87830", "#2ecc71", "#9b59b6", "#cc3333", "#555566", "#334455",
  "#c9a84c", "#7ed4a0", "#00e5ff", "#e85c20", "#5c3d8a", "#c4705a",
];

const FONT_FAMILIES = ["Outfit", "DM Sans", "Mono", "Cursive", "Georgia", "Trebuchet MS", "Palatino"];


// ─── SVGCanvas.tsx ─────────────────────────────────────────────────────────
// Drop-in replacement for the react-konva Stage/Layer block.
// Accepts the same CanvasElement[] data — no business logic changes needed.

//import React, { useRef, useCallback, useState, useEffect } from "react";

// ── Types (copy from LabelEditor or import) ──────────────────────────────────



interface SVGCanvasProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  width: number; height: number; scale: number;
  elements: CanvasElement[];
  drawStrokes: DrawStroke[];
  currentStroke: DrawStroke | null;
  selectedId: string | null;
  editingTextId: string | null;
  activeTool: string;
  onSelectElement: (id: string) => void;
  onDeselect: () => void;
  onElementDragEnd: (id: string, x: number, y: number) => void;
  onElementTransformEnd: (id: string, patch: Partial<CanvasElement>) => void;
  onTextDblClick: (id: string) => void;
  onDrawStart: (e: React.PointerEvent<SVGSVGElement>) => void;
  onDrawMove: (e: React.PointerEvent<SVGSVGElement>) => void;
  onDrawEnd: (e: React.PointerEvent<SVGSVGElement>) => void;
  onElementDelete: (id: string) => void;
}







// ── Selection Handles (replaces Konva Transformer) ───────────────────────────
function SelectionHandles({
  el, scale, onResizeEnd,onDelete,
}: {
  el: CanvasElement;
  scale: number;
  onResizeEnd: (patch: Partial<CanvasElement>) => void;
  onDelete: () => void; 
}) {
  const w = el.width ?? 80;
  const h = el.height ?? 80;
  const ox = el.x;
  const oy = el.y;

  const HANDLE_R = 5 / scale;
  const BORDER_W = 1.5 / scale;
  const rot = el.rotation ?? 0;
  const pivotX = ox + w / 2;
  const pivotY = oy + h / 2;

  const anchors = [
    { id: "tl", cx: ox,       cy: oy       },
    { id: "tc", cx: ox + w/2, cy: oy       },
    { id: "tr", cx: ox + w,   cy: oy       },
    { id: "ml", cx: ox,       cy: oy + h/2 },
    { id: "mr", cx: ox + w,   cy: oy + h/2 },
    { id: "bl", cx: ox,       cy: oy + h   },
    { id: "bc", cx: ox + w/2, cy: oy + h   },
    { id: "br", cx: ox + w,   cy: oy + h   },
  ];

  const dragRef = useRef<{
    handle: string;
    startX: number; startY: number;
    origX: number; origY: number;
    origW: number; origH: number;
  } | null>(null);

  const handleAnchorPointerDown = useCallback((e: React.PointerEvent, handleId: string) => {
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    dragRef.current = {
      handle: handleId,
      startX: e.clientX, startY: e.clientY,
      origX: el.x, origY: el.y,
      origW: el.width ?? 80, origH: el.height ?? 80,
    };
  }, [el]);

  const handleAnchorPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    e.stopPropagation();
    const { handle, startX, startY, origX, origY, origW, origH } = dragRef.current;
    const dx = (e.clientX - startX) / scale;
    const dy = (e.clientY - startY) / scale;

    let newX = origX, newY = origY, newW = origW, newH = origH;

    if (handle.includes("r")) newW = Math.max(20, origW + dx);
    if (handle.includes("l")) { newW = Math.max(20, origW - dx); newX = origX + (origW - newW); }
    if (handle.includes("b")) newH = Math.max(20, origH + dy);
    if (handle.includes("t")) { newH = Math.max(20, origH - dy); newY = origY + (origH - newH); }

    onResizeEnd({ x: newX, y: newY, width: newW, height: newH });
  }, [scale, onResizeEnd]);

  const handleAnchorPointerUp = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    dragRef.current = null;
  }, []);

  return (
    <g transform={rot ? `rotate(${rot} ${pivotX} ${pivotY})` : undefined}>
      <rect
        x={ox} y={oy} width={w} height={h}
        fill="none" stroke="#0ea5e9"
        strokeWidth={BORDER_W}
        strokeDasharray={`${4 / scale},${2 / scale}`}
        style={{ pointerEvents: "none" }}
      />
      {anchors.map(a => (
        <rect
          key={a.id}
          x={a.cx - HANDLE_R} y={a.cy - HANDLE_R}
          width={HANDLE_R * 2} height={HANDLE_R * 2}
          fill="#38bdf8" stroke="#0284c7" strokeWidth={BORDER_W}
          rx={1 / scale}
          style={{ pointerEvents: "all", cursor: "nwse-resize" }}
          onPointerDown={e => handleAnchorPointerDown(e, a.id)}
          onPointerMove={handleAnchorPointerMove}
          onPointerUp={handleAnchorPointerUp}
        />
      ))}
      <g
        transform={`translate(${ox + w + 6 / scale}, ${oy - 6 / scale})`}
        style={{ cursor: "pointer", pointerEvents: "all" }}
        onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); onDelete(); }}
        onClick={(e) => { e.stopPropagation(); }}
      >
  <circle r={8 / scale} fill="#ef4444" />
  <text
    textAnchor="middle"
    dominantBaseline="central"
    fontSize={10 / scale}
    fill="white"
    style={{ pointerEvents: "none", userSelect: "none" }}
  >✕</text>
</g>

    </g>
  );
}

// ── Draggable wrapper for each element ───────────────────────────────────────
function DraggableElement({
  el, scale, isSelected, activeTool, editingTextId,
  onSelect, onDragEnd, onTransformEnd, onTextDblClick, onDelete, children,
}: {
  el: CanvasElement; scale: number;
  isSelected: boolean; activeTool: string; editingTextId: string | null;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onTransformEnd: (patch: Partial<CanvasElement>) => void;
  onTextDblClick: () => void;
  onDelete: () => void;   // ← ADD THIS LINE
  children: React.ReactNode;
}) {
  const dragStart = useRef<{ px: number; py: number; ex: number; ey: number } | null>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (activeTool === "draw" || editingTextId) return;
    e.stopPropagation();
    onSelect();
    if (!el.draggable) return;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    dragStart.current = { px: e.clientX, py: e.clientY, ex: el.x, ey: el.y };
  }, [activeTool, editingTextId, el, onSelect]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStart.current) return;
    e.stopPropagation();
    const dx = (e.clientX - dragStart.current.px) / scale;
    const dy = (e.clientY - dragStart.current.py) / scale;
    // Live position update (call parent's setElements directly for smooth drag)
    // For simplicity we update on pointerUp — for live drag wire into onDragMove prop
  }, [scale]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragStart.current) return;
    e.stopPropagation();
    const dx = (e.clientX - dragStart.current.px) / scale;
    const dy = (e.clientY - dragStart.current.py) / scale;
    const newX = dragStart.current.ex + dx;
    const newY = dragStart.current.ey + dy;
    dragStart.current = null;
    onDragEnd(newX, newY);
  }, [scale, onDragEnd]);

  const handleDblClick = useCallback((e: React.MouseEvent) => {
    if (el.type === "text") { e.stopPropagation(); onTextDblClick(); }
  }, [el.type, onTextDblClick]);

  return (
    <g
      style={{ cursor: activeTool === "draw" ? "crosshair" : el.draggable ? "move" : "default" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={handleDblClick}
    >
      {children}
      {isSelected && (
        <SelectionHandles el={el} scale={scale} onResizeEnd={onTransformEnd}  onDelete={onDelete} />
      )}
    </g>
  );
}

function ShapeRenderer({ el }: { el: CanvasElement }) {
  const fill   = el.fill     ?? "transparent";
  const stroke = el.stroke   ?? "none";
  const sw     = el.strokeWidth ?? 0;
  const op     = el.opacity  ?? 1;
  const rot    = el.rotation ?? 0;
  const w      = el.width    ?? 80;
  const h      = el.height   ?? 80;

  const pivotX = el.x + w / 2;
  const pivotY = el.y + h / 2;
  const transform = rot ? `rotate(${rot} ${pivotX} ${pivotY})` : undefined;
  const common = { opacity: op, transform };

  switch (el.type) {

    case "rect":
      return <rect x={el.x} y={el.y} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={sw} rx={2} {...common} />;

    case "text": {
      const fontSize   = el.fontSize   ?? 20;
      const fontFamily = el.fontFamily ?? "Outfit";
      const fontWeight = el.fontStyle === "bold" ? "bold" : "normal";
      const fontStyle  = el.fontStyle === "italic" ? "italic" : "normal";
      const ls         = el.letterSpacing ?? 0;
      return (
        <text
          x={el.x} y={el.y}
          fontSize={fontSize}
          fontFamily={fontFamily}
          fontWeight={fontWeight}
          fontStyle={fontStyle}
          fill={fill}
          letterSpacing={ls}
          opacity={op}
          dominantBaseline="hanging"
          transform={rot ? `rotate(${rot} ${el.x} ${el.y})` : undefined}
          data-id={el.id}
          style={{ userSelect: "none" }}
        >
          {el.text}
        </text>
      );
    }

    case "image":
      return el.imageUrl ? (
        <image
          href={el.imageUrl}
          x={el.x} y={el.y}
          width={w} height={h}
          preserveAspectRatio="xMidYMid meet"
          {...common}
        />
      ) : null;

 case "icon": {
  const IconComp = ICON_MAP[el.iconName ?? "circle"];
  if (!IconComp) return null;
  const iconColor = (stroke === "none" || !stroke) ? "#4badd4" : stroke;
  const iconFill = (fill === "transparent" || fill === "none" || !fill) ? "none" : fill;
  return (
    <svg
      x={el.x} y={el.y}
      width={w} height={h}
      viewBox="0 0 24 24"
      opacity={op}
      overflow="visible"
      transform={transform}
    >
      <style>{`
        .icon-fill-${el.id} path, 
        .icon-fill-${el.id} circle, 
        .icon-fill-${el.id} rect, 
        .icon-fill-${el.id} polygon { 
          fill: ${iconFill} !important; 
        }
      `}</style>
      <g className={`icon-fill-${el.id}`}>
        <IconComp size={24} color={iconColor} strokeWidth={sw || 2} />
      </g>
    </svg>
  );
}

    case "circle":
  return (
    <circle
      cx={el.x} cy={el.y} r={el.radius ?? 40}
      fill={fill} stroke={stroke} strokeWidth={sw}
      opacity={op}
    />
  );

case "star":
case "triangle":
  // Render as a simple circle fallback — templates use these decoratively
  return (
    <circle
      cx={el.x} cy={el.y} r={el.radius ?? (el.outerRadius ?? 30)}
      fill={fill} stroke={stroke} strokeWidth={sw}
      opacity={op}
    />
  );
    default:
      return <rect x={el.x} y={el.y} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={sw} {...common} />;
  }
}

// ── Utility: points array → SVG polyline string ──────────────────────────────
function pointsToSVG(pts: number[]): string {
  const pairs: string[] = [];
  for (let i = 0; i < pts.length - 1; i += 2)
    pairs.push(`${pts[i]},${pts[i + 1]}`);
  return pairs.join(" ");
}
// ── DrawStroke renderer ───────────────────────────────────────────────────────
function StrokeLayer({ strokes, current }: { strokes: DrawStroke[]; current: DrawStroke | null }) {
  const renderStroke = (s: DrawStroke) => (
    <polyline
      key={s.id}
      points={pointsToSVG(s.points)}
      fill="none"
      stroke={s.stroke}
      strokeWidth={s.strokeWidth}
      opacity={s.opacity}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
  return (
    <g style={{ pointerEvents: "none" }}>
      {strokes.map(renderStroke)}
      {current && renderStroke(current)}
    </g>
  );
}

// ── Main SVGCanvas component ──────────────────────────────────────────────────
function SVGCanvas({
  svgRef, width, height, scale,
  elements, drawStrokes, currentStroke,
  selectedId, editingTextId, activeTool,
  onSelectElement, onDeselect,
  onElementDragEnd, onElementTransformEnd,
  onTextDblClick,
  onDrawStart, onDrawMove, onDrawEnd,onElementDelete, 
}: SVGCanvasProps) {

  return (
    <svg
      //ref={svgRef}
      ref={svgRef as React.RefObject<SVGSVGElement>}
      width={width}
      height={height}
      viewBox={`0 0 ${width / scale} ${height / scale}`}
      style={{
        position: "absolute", top: 0, left: 0,
        cursor: activeTool === "draw" ? "crosshair" : "default",
        overflow: "visible",
      }}
      onPointerDown={activeTool === "draw" ? (e) => onDrawStart(e as any) : undefined}
      onPointerMove={activeTool === "draw" ? (e) => onDrawMove(e as any) : undefined}
      onPointerUp={activeTool === "draw" ? (e) => onDrawEnd(e as any) : undefined}
      onClick={(e) => {
        if (e.target === e.currentTarget) onDeselect();
      }}
    >
      {/* Elements layer */}
      {elements.map(el => (
        <DraggableElement
          key={el.id}
          el={el}
          scale={scale}
          isSelected={el.id === selectedId && !editingTextId}
          activeTool={activeTool}
          editingTextId={editingTextId}
          onSelect={() => onSelectElement(el.id)}
          onDragEnd={(x, y) => onElementDragEnd(el.id, x, y)}
          onTransformEnd={(patch) => onElementTransformEnd(el.id, patch)}
          onTextDblClick={() => onTextDblClick(el.id)}
          onDelete={() => onElementDelete(el.id)} 
        >
          <ShapeRenderer el={el} />
        </DraggableElement>
      ))}

      {/* Draw strokes layer (above elements, non-interactive) */}
      <StrokeLayer strokes={drawStrokes} current={currentStroke} />
    </svg>
  );
}
// ─── TEMPLATES ────────────────────────────────────────────────────────────────
const TEMPLATE_DESIGNS = [
  {
    id: "t1", name: "Azure Depths", bg: "#0d1f3c",
    elements: [
      { id: "e1", type: "rect" as const, x: 0, y: 0, width: 500, height: 700, fill: "#0d1f3c", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true },
      { id: "e2", type: "rect" as const, x: 0, y: 480, width: 500, height: 220, fill: "#0a4a7a", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.5, draggable: true },
      { id: "e3", type: "rect" as const, x: 40, y: 40, width: 420, height: 620, fill: "transparent", stroke: "#4badd4", strokeWidth: 1, rotation: 0, opacity: 0.4, draggable: true },
      { id: "e4", type: "circle" as const, x: 400, y: 120, radius: 80, fill: "#1a6fa8", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.15, draggable: true },
      { id: "e5", type: "circle" as const, x: 80, y: 550, radius: 110, fill: "#4badd4", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.08, draggable: true },
      { id: "e6", type: "text" as const, x: 50, y: 90, text: "LAVE", fontSize: 110, fontFamily: "Georgia", fontStyle: "bold", fill: "#ffffff", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true, letterSpacing: 8 },
      { id: "e7", type: "rect" as const, x: 50, y: 220, width: 260, height: 2, fill: "#4badd4", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true },
      { id: "e8", type: "text" as const, x: 52, y: 234, text: "MINERAL WATER", fontSize: 16, fontFamily: "Outfit", fontStyle: "normal", fill: "#4badd4", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true, letterSpacing: 6 },
      { id: "e9", type: "text" as const, x: 52, y: 280, text: "NATURALLY PURIFIED · EST. 2024", fontSize: 10, fontFamily: "Outfit", fontStyle: "normal", fill: "#4badd480", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.7, draggable: true, letterSpacing: 3 },
    ]
  },
  {
    id: "t2", name: "Ivory Luxe", bg: "#f9f5ef",
    elements: [
      { id: "e1", type: "rect" as const, x: 0, y: 0, width: 500, height: 700, fill: "#f9f5ef", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true },
      { id: "e2", type: "rect" as const, x: 30, y: 30, width: 440, height: 640, fill: "transparent", stroke: "#c8b89a", strokeWidth: 1.5, rotation: 0, opacity: 1, draggable: true },
      { id: "e3", type: "rect" as const, x: 42, y: 42, width: 416, height: 616, fill: "transparent", stroke: "#c8b89a", strokeWidth: 0.5, rotation: 0, opacity: 0.5, draggable: true },
      { id: "e4", type: "circle" as const, x: 250, y: 180, radius: 60, fill: "transparent", stroke: "#c8b89a", strokeWidth: 1, rotation: 0, opacity: 0.6, draggable: true },
      { id: "e5", type: "text" as const, x: 250, y: 155, text: "✦", fontSize: 28, fontFamily: "Georgia", fontStyle: "normal", fill: "#c8b89a", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true, align: "center" },
      { id: "e6", type: "text" as const, x: 80, y: 260, text: "LAVE", fontSize: 88, fontFamily: "Palatino", fontStyle: "bold", fill: "#2c1810", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true, letterSpacing: 12 },
      { id: "e7", type: "text" as const, x: 100, y: 370, text: "MINERAL  WATER", fontSize: 14, fontFamily: "Outfit", fontStyle: "normal", fill: "#8a7560", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true, letterSpacing: 7 },
      { id: "e8", type: "rect" as const, x: 100, y: 360, width: 300, height: 1, fill: "#c8b89a", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true },
      { id: "e9", type: "rect" as const, x: 100, y: 398, width: 300, height: 1, fill: "#c8b89a", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true },
    ]
  },
  {
    id: "t3", name: "Obsidian Gold", bg: "#0a0a0a",
    elements: [
      { id: "e1", type: "rect" as const, x: 0, y: 0, width: 500, height: 700, fill: "#0a0a0a", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true },
      { id: "e2", type: "rect" as const, x: 0, y: 0, width: 500, height: 4, fill: "#d4af37", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true },
      { id: "e3", type: "rect" as const, x: 0, y: 696, width: 500, height: 4, fill: "#d4af37", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true },
      { id: "e4", type: "rect" as const, x: 50, y: 50, width: 400, height: 600, fill: "transparent", stroke: "#d4af37", strokeWidth: 0.8, rotation: 0, opacity: 0.3, draggable: true },
      { id: "e5", type: "star" as const, x: 250, y: 140, numPoints: 6, innerRadius: 20, outerRadius: 35, fill: "#d4af37", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.8, draggable: true },
      { id: "e6", type: "text" as const, x: 55, y: 185, text: "LAVE", fontSize: 100, fontFamily: "Georgia", fontStyle: "bold", fill: "#d4af37", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true, letterSpacing: 10 },
      { id: "e7", type: "rect" as const, x: 55, y: 308, width: 390, height: 1.5, fill: "#d4af37", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.6, draggable: true },
      { id: "e8", type: "text" as const, x: 55, y: 322, text: "MINERAL WATER", fontSize: 15, fontFamily: "Outfit", fontStyle: "normal", fill: "#d4af37", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.9, draggable: true, letterSpacing: 8 },
      { id: "e9", type: "text" as const, x: 55, y: 360, text: "PREMIUM · PURE · REFINED", fontSize: 10, fontFamily: "Outfit", fontStyle: "normal", fill: "#d4af37", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.5, draggable: true, letterSpacing: 4 },
    ]
  },
  {
    id: "t4", name: "Forest Spring", bg: "#1a2e1a",
    elements: [
      { id: "e1", type: "rect" as const, x: 0, y: 0, width: 500, height: 700, fill: "#1a2e1a", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true },
      { id: "e2", type: "rect" as const, x: 0, y: 560, width: 500, height: 140, fill: "#0f1f0f", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true },
      { id: "e3", type: "circle" as const, x: 420, y: 80, radius: 100, fill: "#2ecc71", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.05, draggable: true },
      { id: "e4", type: "circle" as const, x: 60, y: 600, radius: 120, fill: "#2ecc71", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.06, draggable: true },
      { id: "e5", type: "text" as const, x: 45, y: 80, text: "LAVE", fontSize: 100, fontFamily: "Georgia", fontStyle: "bold", fill: "#e8f5e9", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true, letterSpacing: 6 },
      { id: "e6", type: "rect" as const, x: 45, y: 200, width: 340, height: 2, fill: "#4caf50", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.8, draggable: true },
      { id: "e7", type: "text" as const, x: 45, y: 216, text: "SPRING WATER", fontSize: 16, fontFamily: "Outfit", fontStyle: "normal", fill: "#81c784", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true, letterSpacing: 7 },
      { id: "e8", type: "text" as const, x: 45, y: 256, text: "FROM THE HEART OF NATURE", fontSize: 10, fontFamily: "Outfit", fontStyle: "normal", fill: "#4caf5080", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.7, draggable: true, letterSpacing: 3 },
      { id: "e9", type: "text" as const, x: 45, y: 580, text: "100% NATURAL  ·  NO ADDITIVES", fontSize: 10, fontFamily: "Outfit", fontStyle: "normal", fill: "#81c784", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.7, draggable: true, letterSpacing: 3 },
    ]
  },
  {
    id: "t5", name: "Arctic Mist", bg: "#e8f4fd",
    elements: [
      { id: "e1", type: "rect" as const, x: 0, y: 0, width: 500, height: 700, fill: "#e8f4fd", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true },
      { id: "e2", type: "rect" as const, x: 0, y: 0, width: 500, height: 350, fill: "#bde0f7", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.4, draggable: true },
      { id: "e3", type: "circle" as const, x: 350, y: 180, radius: 140, fill: "#ffffff", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.5, draggable: true },
      { id: "e4", type: "circle" as const, x: 120, y: 500, radius: 90, fill: "#4badd4", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.08, draggable: true },
      { id: "e5", type: "text" as const, x: 48, y: 100, text: "LAVE", fontSize: 105, fontFamily: "Trebuchet MS", fontStyle: "bold", fill: "#0d4f7a", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true, letterSpacing: 4 },
      { id: "e6", type: "text" as const, x: 50, y: 220, text: "ARCTIC MINERAL WATER", fontSize: 14, fontFamily: "Outfit", fontStyle: "normal", fill: "#2980b9", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true, letterSpacing: 4 },
      { id: "e7", type: "rect" as const, x: 50, y: 210, width: 340, height: 1.5, fill: "#2980b9", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.5, draggable: true },
      { id: "e8", type: "text" as const, x: 50, y: 260, text: "GLACIALLY PURE · CRISP · CLEAN", fontSize: 10, fontFamily: "Outfit", fontStyle: "normal", fill: "#2980b9", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.6, draggable: true, letterSpacing: 3 },
    ]
  },
  {
    id: "t6", name: "Noir Élégant", bg: "#111111",
    elements: [
      { id: "e1", type: "rect" as const, x: 0, y: 0, width: 500, height: 700, fill: "#111111", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true },
      { id: "e2", type: "rect" as const, x: 60, y: 60, width: 6, height: 580, fill: "#e0e0e0", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.15, draggable: true },
      { id: "e3", type: "rect" as const, x: 434, y: 60, width: 6, height: 580, fill: "#e0e0e0", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.15, draggable: true },
      { id: "e4", type: "rect" as const, x: 60, y: 60, width: 380, height: 6, fill: "#e0e0e0", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.15, draggable: true },
      { id: "e5", type: "rect" as const, x: 60, y: 634, width: 380, height: 6, fill: "#e0e0e0", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.15, draggable: true },
      { id: "e6", type: "text" as const, x: 80, y: 180, text: "LAVE", fontSize: 96, fontFamily: "Palatino", fontStyle: "bold", fill: "#ffffff", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true, letterSpacing: 14 },
      { id: "e7", type: "rect" as const, x: 80, y: 300, width: 340, height: 1, fill: "#ffffff", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.2, draggable: true },
      { id: "e8", type: "text" as const, x: 80, y: 316, text: "EAU MINÉRALE NATURELLE", fontSize: 13, fontFamily: "Outfit", fontStyle: "normal", fill: "#9e9e9e", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true, letterSpacing: 5 },
      { id: "e9", type: "text" as const, x: 80, y: 356, text: "SINCE 2024", fontSize: 10, fontFamily: "Outfit", fontStyle: "normal", fill: "#616161", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true, letterSpacing: 6 },
    ]
  },
  {
    id: "t7", name: "Sunrise Coral", bg: "#fff8f5",
    elements: [
      { id: "e1", type: "rect" as const, x: 0, y: 0, width: 500, height: 700, fill: "#fff8f5", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true },
      { id: "e2", type: "rect" as const, x: 0, y: 0, width: 500, height: 280, fill: "#ff6b6b", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.08, draggable: true },
      { id: "e3", type: "circle" as const, x: 440, y: 60, radius: 90, fill: "#ff8e53", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.12, draggable: true },
      { id: "e4", type: "circle" as const, x: 50, y: 650, radius: 80, fill: "#ff6b6b", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.1, draggable: true },
      { id: "e5", type: "text" as const, x: 45, y: 90, text: "LAVE", fontSize: 100, fontFamily: "Georgia", fontStyle: "bold", fill: "#c0392b", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true, letterSpacing: 6 },
      { id: "e6", type: "rect" as const, x: 45, y: 212, width: 320, height: 2.5, fill: "#e74c3c", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.4, draggable: true },
      { id: "e7", type: "text" as const, x: 45, y: 226, text: "FLAVOURED WATER", fontSize: 16, fontFamily: "Outfit", fontStyle: "normal", fill: "#e74c3c", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true, letterSpacing: 5 },
      { id: "e8", type: "text" as const, x: 45, y: 266, text: "TROPICAL · FRUITY · REFRESHING", fontSize: 10, fontFamily: "Outfit", fontStyle: "normal", fill: "#e74c3c", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.5, draggable: true, letterSpacing: 3 },
    ]
  },
  {
    id: "t8", name: "Violet Storm", bg: "#1a0a2e",
    elements: [
      { id: "e1", type: "rect" as const, x: 0, y: 0, width: 500, height: 700, fill: "#1a0a2e", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true },
      { id: "e2", type: "circle" as const, x: 250, y: 350, radius: 240, fill: "#6c3483", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.1, draggable: true },
      { id: "e3", type: "circle" as const, x: 400, y: 150, radius: 100, fill: "#9b59b6", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.08, draggable: true },
      { id: "e4", type: "rect" as const, x: 45, y: 45, width: 410, height: 610, fill: "transparent", stroke: "#9b59b6", strokeWidth: 1, rotation: 0, opacity: 0.2, draggable: true },
      { id: "e5", type: "star" as const, x: 75, y: 120, numPoints: 4, innerRadius: 8, outerRadius: 18, fill: "#bb8fce", stroke: "", strokeWidth: 0, rotation: 45, opacity: 0.6, draggable: true },
      { id: "e6", type: "text" as const, x: 50, y: 150, text: "LAVE", fontSize: 100, fontFamily: "Georgia", fontStyle: "bold", fill: "#e8daef", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true, letterSpacing: 8 },
      { id: "e7", type: "rect" as const, x: 50, y: 272, width: 370, height: 1.5, fill: "#9b59b6", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.7, draggable: true },
      { id: "e8", type: "text" as const, x: 50, y: 286, text: "CRYSTAL WATER", fontSize: 16, fontFamily: "Outfit", fontStyle: "normal", fill: "#bb8fce", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true, letterSpacing: 6 },
      { id: "e9", type: "text" as const, x: 50, y: 326, text: "PURE ESSENCE · MYSTIC FLOW", fontSize: 10, fontFamily: "Outfit", fontStyle: "normal", fill: "#9b59b6", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.7, draggable: true, letterSpacing: 3 },
    ]
  },
  {
    id: "t9", name: "Sage Wellness", bg: "#f4f7f0",
    elements: [
      { id: "e1", type: "rect" as const, x: 0, y: 0, width: 500, height: 700, fill: "#f4f7f0", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true },
      { id: "e2", type: "rect" as const, x: 0, y: 400, width: 500, height: 300, fill: "#8fad7a", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.12, draggable: true },
      { id: "e3", type: "circle" as const, x: 380, y: 520, radius: 120, fill: "#8fad7a", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.1, draggable: true },
      { id: "e4", type: "rect" as const, x: 45, y: 45, width: 410, height: 610, fill: "transparent", stroke: "#8fad7a", strokeWidth: 1.5, rotation: 0, opacity: 0.4, draggable: true },
      { id: "e5", type: "text" as const, x: 65, y: 110, text: "LAVE", fontSize: 92, fontFamily: "Palatino", fontStyle: "bold", fill: "#3d5a3e", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true, letterSpacing: 10 },
      { id: "e6", type: "rect" as const, x: 65, y: 224, width: 300, height: 1.5, fill: "#8fad7a", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true },
      { id: "e7", type: "text" as const, x: 65, y: 238, text: "WELLNESS WATER", fontSize: 15, fontFamily: "Outfit", fontStyle: "normal", fill: "#5d7a5e", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true, letterSpacing: 6 },
      { id: "e8", type: "text" as const, x: 65, y: 278, text: "BALANCED · ALKALINE · PURE", fontSize: 10, fontFamily: "Outfit", fontStyle: "normal", fill: "#8fad7a", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.8, draggable: true, letterSpacing: 3 },
      { id: "e9", type: "rect" as const, x: 65, y: 296, width: 300, height: 1, fill: "#8fad7a", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.3, draggable: true },
    ]
  },
  {
    id: "t10", name: "Midnight Luxe", bg: "#0c1a2e",
    elements: [
      { id: "e1", type: "rect" as const, x: 20, y: 20, width: 460, height: 560, fill: "#0c1a2e", stroke: "#c9a84c", strokeWidth: 3, rotation: 0, opacity: 1, draggable: true },
      { id: "e2", type: "rect" as const, x: 20, y: 20, width: 460, height: 4, fill: "#c9a84c", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true },
      { id: "e3", type: "rect" as const, x: 20, y: 576, width: 460, height: 4, fill: "#c9a84c", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true },
      { id: "e4", type: "text" as const, x: 60, y: 90, text: "LAVE", fontSize: 100, fontFamily: "Palatino", fill: "#c9a84c", rotation: 0, opacity: 1, draggable: true, fontStyle: "bold", letterSpacing: 14 },
      { id: "e5", type: "rect" as const, x: 60, y: 210, width: 340, height: 1, fill: "#c9a84c", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.6, draggable: true },
      { id: "e6", type: "text" as const, x: 60, y: 224, text: "MINERAL WATER", fontSize: 14, fontFamily: "Outfit", fill: "#c9a84c", rotation: 0, opacity: 0.85, draggable: true, letterSpacing: 8 },
      { id: "e7", type: "text" as const, x: 60, y: 290, text: "PURE · NATURAL · PREMIUM", fontSize: 11, fontFamily: "Outfit", fill: "#7a9bbf", rotation: 0, opacity: 0.8, draggable: true, letterSpacing: 3 },
      { id: "e8", type: "circle" as const, x: 390, y: 480, radius: 40, fill: "transparent", stroke: "#c9a84c", strokeWidth: 1, rotation: 0, opacity: 0.3, draggable: true },
      { id: "e9", type: "circle" as const, x: 390, y: 480, radius: 28, fill: "transparent", stroke: "#c9a84c", strokeWidth: 1, rotation: 0, opacity: 0.5, draggable: true },
    ]
  },
  {
    id: "t11", name: "Arctic Frost", bg: "#f0f8ff",
    elements: [
      { id: "e1", type: "rect" as const, x: 20, y: 20, width: 460, height: 560, fill: "#f0f8ff", stroke: "#b8dff0", strokeWidth: 2, rotation: 0, opacity: 1, draggable: true },
      { id: "e2", type: "rect" as const, x: 20, y: 20, width: 12, height: 560, fill: "#4badd4", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true },
      { id: "e3", type: "text" as const, x: 55, y: 110, text: "LAVE", fontSize: 88, fontFamily: "Georgia", fill: "#0d4f6e", rotation: 0, opacity: 1, draggable: true, fontStyle: "bold", letterSpacing: 6 },
      { id: "e4", type: "text" as const, x: 55, y: 220, text: "MINERAL", fontSize: 22, fontFamily: "DM Sans", fill: "#4badd4", rotation: 0, opacity: 1, draggable: true, letterSpacing: 10 },
      { id: "e5", type: "text" as const, x: 55, y: 252, text: "WATER", fontSize: 22, fontFamily: "DM Sans", fill: "#4badd4", rotation: 0, opacity: 1, draggable: true, letterSpacing: 10 },
      { id: "e6", type: "rect" as const, x: 55, y: 295, width: 240, height: 2, fill: "#4badd4", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.4, draggable: true },
      { id: "e7", type: "text" as const, x: 55, y: 310, text: "REFRESHINGLY PURE", fontSize: 11, fontFamily: "Outfit", fill: "#4badd4", rotation: 0, opacity: 0.7, draggable: true, letterSpacing: 4 },
      { id: "e8", type: "circle" as const, x: 380, y: 450, radius: 55, fill: "#d8eef8", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.6, draggable: true },
      { id: "e9", type: "circle" as const, x: 380, y: 450, radius: 38, fill: "#b8dff0", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.5, draggable: true },
    ]
  },
  {
    id: "t12", name: "Emerald Botanica", bg: "#0d2b1d",
    elements: [
      { id: "e1", type: "rect" as const, x: 20, y: 20, width: 460, height: 560, fill: "#0d2b1d", stroke: "#3d8b5e", strokeWidth: 2, rotation: 0, opacity: 1, draggable: true },
      { id: "e2", type: "rect" as const, x: 360, y: 20, width: 120, height: 560, fill: "#163d27", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true },
      { id: "e3", type: "text" as const, x: 55, y: 95, text: "LAVE", fontSize: 95, fontFamily: "Palatino", fill: "#7ed4a0", rotation: 0, opacity: 1, draggable: true, fontStyle: "bold" },
      { id: "e4", type: "rect" as const, x: 55, y: 207, width: 280, height: 2, fill: "#3d8b5e", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.8, draggable: true },
      { id: "e5", type: "text" as const, x: 55, y: 220, text: "SPRING WATER", fontSize: 16, fontFamily: "Outfit", fill: "#3d8b5e", rotation: 0, opacity: 1, draggable: true, letterSpacing: 7 },
      { id: "e6", type: "text" as const, x: 55, y: 270, text: "FROM THE HEART OF NATURE", fontSize: 11, fontFamily: "Outfit", fill: "#5aaa78", rotation: 0, opacity: 0.7, draggable: true, letterSpacing: 4 },
      { id: "e7", type: "star" as const, x: 405, y: 300, numPoints: 6, innerRadius: 18, outerRadius: 36, fill: "transparent", stroke: "#3d8b5e", strokeWidth: 1, rotation: 0, opacity: 0.5, draggable: true },
    ]
  },
  {
    id: "t13", name: "Tokyo Zen", bg: "#faf6f0",
    elements: [
      { id: "e1", type: "rect" as const, x: 20, y: 20, width: 460, height: 560, fill: "#faf6f0", stroke: "#e8ddd0", strokeWidth: 2, rotation: 0, opacity: 1, draggable: true },
      { id: "e2", type: "rect" as const, x: 20, y: 280, width: 460, height: 300, fill: "#1a0a00", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true },
      { id: "e3", type: "text" as const, x: 60, y: 100, text: "LAVE", fontSize: 82, fontFamily: "Palatino", fill: "#1a0a00", rotation: 0, opacity: 1, draggable: true, fontStyle: "bold", letterSpacing: 10 },
      { id: "e4", type: "text" as const, x: 60, y: 198, text: "水 · MINERAL WATER", fontSize: 14, fontFamily: "Outfit", fill: "#8b6f5c", rotation: 0, opacity: 1, draggable: true, letterSpacing: 3 },
      { id: "e5", type: "text" as const, x: 60, y: 240, text: "純粋な自然の水", fontSize: 13, fontFamily: "Outfit", fill: "#c4a882", rotation: 0, opacity: 0.6, draggable: true },
      { id: "e6", type: "text" as const, x: 60, y: 310, text: "PURE", fontSize: 52, fontFamily: "Georgia", fill: "#f5ede2", rotation: 0, opacity: 1, draggable: true, letterSpacing: 8 },
      { id: "e7", type: "text" as const, x: 60, y: 375, text: "NATURAL · FRESH", fontSize: 13, fontFamily: "Outfit", fill: "#c4a882", rotation: 0, opacity: 0.8, draggable: true, letterSpacing: 5 },
    ]
  },
  {
    id: "t14", name: "Desert Rose", bg: "#f7e8e0",
    elements: [
      { id: "e1", type: "rect" as const, x: 20, y: 20, width: 460, height: 560, fill: "#f7e8e0", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true },
      { id: "e2", type: "rect" as const, x: 20, y: 400, width: 460, height: 180, fill: "#c4705a", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true },
      { id: "e3", type: "circle" as const, x: 380, y: 130, radius: 90, fill: "#e8b4a0", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.35, draggable: true },
      { id: "e4", type: "text" as const, x: 55, y: 85, text: "LAVE", fontSize: 96, fontFamily: "Palatino", fill: "#7a3828", rotation: 0, opacity: 1, draggable: true, fontStyle: "bold" },
      { id: "e5", type: "rect" as const, x: 55, y: 200, width: 300, height: 2, fill: "#c4705a", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true },
      { id: "e6", type: "text" as const, x: 55, y: 215, text: "EAU MINÉRALE", fontSize: 16, fontFamily: "Outfit", fill: "#c4705a", rotation: 0, opacity: 1, draggable: true, letterSpacing: 7 },
      { id: "e7", type: "text" as const, x: 55, y: 270, text: "NATURELLE", fontSize: 13, fontFamily: "Outfit", fill: "#c4705a", rotation: 0, opacity: 0.7, draggable: true, letterSpacing: 5 },
      { id: "e8", type: "text" as const, x: 55, y: 430, text: "PURE · NATURAL", fontSize: 14, fontFamily: "Outfit", fill: "#fdf0ea", rotation: 0, opacity: 0.9, draggable: true, letterSpacing: 5 },
    ]
  },
  {
    id: "t15", name: "Electric Storm", bg: "#080c18",
    elements: [
      { id: "e1", type: "rect" as const, x: 20, y: 20, width: 460, height: 560, fill: "#080c18", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true },
      { id: "e2", type: "rect" as const, x: 20, y: 20, width: 460, height: 3, fill: "#00e5ff", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true },
      { id: "e3", type: "rect" as const, x: 20, y: 577, width: 460, height: 3, fill: "#00e5ff", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true },
      { id: "e4", type: "text" as const, x: 50, y: 100, text: "LAVE", fontSize: 98, fontFamily: "Trebuchet MS", fill: "#00e5ff", rotation: 0, opacity: 1, draggable: true, fontStyle: "bold", letterSpacing: 8 },
      { id: "e5", type: "rect" as const, x: 50, y: 218, width: 360, height: 2, fill: "#00e5ff", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.4, draggable: true },
      { id: "e6", type: "text" as const, x: 50, y: 232, text: "MINERAL WATER", fontSize: 15, fontFamily: "Outfit", fill: "#00e5ff", rotation: 0, opacity: 0.9, draggable: true, letterSpacing: 9 },
      { id: "e7", type: "text" as const, x: 50, y: 290, text: "ULTRA PURE · 500ML", fontSize: 12, fontFamily: "Outfit", fill: "#5599cc", rotation: 0, opacity: 0.7, draggable: true, letterSpacing: 3 },
      { id: "e8", type: "circle" as const, x: 380, y: 460, radius: 48, fill: "transparent", stroke: "#00e5ff", strokeWidth: 1, rotation: 0, opacity: 0.2, draggable: true },
      { id: "e9", type: "circle" as const, x: 380, y: 460, radius: 32, fill: "transparent", stroke: "#00e5ff", strokeWidth: 1, rotation: 0, opacity: 0.3, draggable: true },
      { id: "e10", type: "circle" as const, x: 380, y: 460, radius: 16, fill: "#00e5ff", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.15, draggable: true },
    ]
  },
  {
    id: "t16", name: "Maison Blanche", bg: "#ffffff",
    elements: [
      { id: "e1", type: "rect" as const, x: 20, y: 20, width: 460, height: 560, fill: "#ffffff", stroke: "#d8d0c4", strokeWidth: 2, rotation: 0, opacity: 1, draggable: true },
      { id: "e2", type: "rect" as const, x: 60, y: 60, width: 380, height: 480, fill: "transparent", stroke: "#c8c0b4", strokeWidth: 1, rotation: 0, opacity: 1, draggable: true },
      { id: "e3", type: "text" as const, x: 90, y: 120, text: "LAVE", fontSize: 84, fontFamily: "Palatino", fill: "#1a1a1a", rotation: 0, opacity: 1, draggable: true, fontStyle: "bold", letterSpacing: 12 },
      { id: "e4", type: "rect" as const, x: 90, y: 220, width: 320, height: 1, fill: "#8a7a6a", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.5, draggable: true },
      { id: "e5", type: "text" as const, x: 90, y: 234, text: "EAU MINÉRALE NATURELLE", fontSize: 11, fontFamily: "Outfit", fill: "#8a7a6a", rotation: 0, opacity: 1, draggable: true, letterSpacing: 5 },
      { id: "e6", type: "rect" as const, x: 90, y: 252, width: 320, height: 1, fill: "#8a7a6a", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.5, draggable: true },
      { id: "e7", type: "star" as const, x: 250, y: 380, numPoints: 4, innerRadius: 12, outerRadius: 24, fill: "#8a7a6a", stroke: "", strokeWidth: 0, rotation: 45, opacity: 0.4, draggable: true },
      { id: "e8", type: "text" as const, x: 90, y: 420, text: "PURE · NATURELLE · RAFFINÉE", fontSize: 10, fontFamily: "Outfit", fill: "#8a7a6a", rotation: 0, opacity: 0.6, draggable: true, letterSpacing: 4 },
    ]
  },
  {
    id: "t17", name: "Volcanic Spring", bg: "#1a1208",
    elements: [
      { id: "e1", type: "rect" as const, x: 20, y: 20, width: 460, height: 560, fill: "#1a1208", stroke: "#e85c20", strokeWidth: 3, rotation: 0, opacity: 1, draggable: true },
      { id: "e2", type: "rect" as const, x: 20, y: 20, width: 8, height: 560, fill: "#e85c20", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true },
      { id: "e3", type: "rect" as const, x: 472, y: 20, width: 8, height: 560, fill: "#e85c20", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true },
      { id: "e4", type: "text" as const, x: 55, y: 95, text: "LAVE", fontSize: 96, fontFamily: "Trebuchet MS", fill: "#ffffff", rotation: 0, opacity: 1, draggable: true, fontStyle: "bold", letterSpacing: 6 },
      { id: "e5", type: "rect" as const, x: 55, y: 210, width: 340, height: 3, fill: "#e85c20", stroke: "", strokeWidth: 0, rotation: 0, opacity: 1, draggable: true },
      { id: "e6", type: "text" as const, x: 55, y: 226, text: "VOLCANIC SPRING", fontSize: 16, fontFamily: "Outfit", fill: "#e85c20", rotation: 0, opacity: 1, draggable: true, letterSpacing: 7 },
      { id: "e7", type: "text" as const, x: 55, y: 275, text: "MINERAL WATER", fontSize: 12, fontFamily: "Outfit", fill: "#8a6030", rotation: 0, opacity: 0.8, draggable: true, letterSpacing: 4 },
      { id: "e8", type: "triangle" as const, x: 380, y: 450, radius: 40, sides: 3, fill: "transparent", stroke: "#e85c20", strokeWidth: 2, rotation: 0, opacity: 0.35, draggable: true },
    ]
  },
  {
    id: "t18", name: "Lavender Mist", bg: "#f0eaf8",
    elements: [
      { id: "e1", type: "rect" as const, x: 20, y: 20, width: 460, height: 560, fill: "#f0eaf8", stroke: "#c5aee0", strokeWidth: 2, rotation: 0, opacity: 1, draggable: true },
      { id: "e2", type: "circle" as const, x: 400, y: 100, radius: 110, fill: "#dac8f0", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.35, draggable: true },
      { id: "e3", type: "text" as const, x: 55, y: 100, text: "LAVE", fontSize: 90, fontFamily: "Palatino", fill: "#5c3d8a", rotation: 0, opacity: 1, draggable: true, fontStyle: "bold" },
      { id: "e4", type: "rect" as const, x: 55, y: 210, width: 300, height: 2, fill: "#9b7ec8", stroke: "", strokeWidth: 0, rotation: 0, opacity: 0.6, draggable: true },
      { id: "e5", type: "text" as const, x: 55, y: 226, text: "MINERAL WATER", fontSize: 15, fontFamily: "Outfit", fill: "#7b5ba8", rotation: 0, opacity: 1, draggable: true, letterSpacing: 7 },
      { id: "e6", type: "text" as const, x: 55, y: 270, text: "LAVENDER INFUSED · SPA GRADE", fontSize: 11, fontFamily: "Outfit", fill: "#9b7ec8", rotation: 0, opacity: 0.7, draggable: true, letterSpacing: 3 },
      { id: "e7", type: "star" as const, x: 250, y: 430, numPoints: 6, innerRadius: 14, outerRadius: 28, fill: "transparent", stroke: "#9b7ec8", strokeWidth: 1, rotation: 0, opacity: 0.4, draggable: true },
      { id: "e8", type: "text" as const, x: 55, y: 470, text: "PURE · CALM · PURE", fontSize: 10, fontFamily: "Outfit", fill: "#9b7ec8", rotation: 0, opacity: 0.5, draggable: true, letterSpacing: 6 },
    ]
  },
];

// ─── SHAPES CATALOG ───────────────────────────────────────────────────────────
const SHAPES_CATALOG = [
  { id: "circle",         label: "Circle",    category: "Basic" },
  { id: "square",         label: "Square",    category: "Basic" },
  { id: "triangle",       label: "Triangle",  category: "Basic" },
  { id: "diamond",        label: "Diamond",   category: "Basic" },
  { id: "pentagon",       label: "Pentagon",  category: "Basic" },
  { id: "hexagon",        label: "Hexagon",   category: "Basic" },
  { id: "octagon",        label: "Octagon",   category: "Basic" },
  { id: "star",           label: "Star",      category: "Stars" },
  { id: "sun",            label: "Sun",       category: "Stars" },
  { id: "moon",           label: "Moon",      category: "Stars" },
  { id: "zap",            label: "Zap",       category: "Stars" },
  { id: "flame",          label: "Flame",     category: "Stars" },
  { id: "arrow-right",    label: "→",         category: "Arrows" },
  { id: "arrow-left",     label: "←",         category: "Arrows" },
  { id: "arrow-up",       label: "↑",         category: "Arrows" },
  { id: "arrow-down",     label: "↓",         category: "Arrows" },
  { id: "heart",          label: "Heart",     category: "Symbols" },
  { id: "plus",           label: "Plus",      category: "Symbols" },
  { id: "minus",          label: "Minus",     category: "Symbols" },
  { id: "check",          label: "Check",     category: "Symbols" },
  { id: "x",              label: "X",         category: "Symbols" },
  { id: "slash",          label: "Slash",     category: "Symbols" },
  { id: "infinity",       label: "Infinity",  category: "Symbols" },
  { id: "at-sign",        label: "At",        category: "Symbols" },
  { id: "hash",           label: "Hash",      category: "Symbols" },
  { id: "eye",            label: "Eye",       category: "Symbols" },
  { id: "target",         label: "Target",    category: "Symbols" },
  { id: "crosshair",      label: "Crosshair", category: "Symbols" },
  { id: "cloud",          label: "Cloud",     category: "Nature" },
  { id: "anchor",         label: "Anchor",    category: "Nature" },
  { id: "smile",          label: "Smile",     category: "Faces" },
  { id: "frown",          label: "Frown",     category: "Faces" },
  { id: "meh",            label: "Meh",       category: "Faces" },
  { id: "message-circle", label: "Chat",      category: "UI" },
  { id: "shield",         label: "Shield",    category: "UI" },
  { id: "bookmark",       label: "Bookmark",  category: "UI" },
  { id: "flag",           label: "Flag",      category: "UI" },
  { id: "bell",           label: "Bell",      category: "UI" },

  // ✨ Magic
  { id: "sparkles",   label: "Sparkles",  category: "Magic" },
  { id: "crown",      label: "Crown",     category: "Magic" },
  { id: "gem",        label: "Gem",       category: "Magic" },
  { id: "wand",       label: "Wand",      category: "Magic" },
  { id: "rocket",     label: "Rocket",    category: "Magic" },
  { id: "party",      label: "Party",     category: "Magic" },
  { id: "gift",       label: "Gift",      category: "Magic" },
  { id: "trophy",     label: "Trophy",    category: "Magic" },
  { id: "medal",      label: "Medal",     category: "Magic" },

  // 🌿 Nature
  { id: "globe",      label: "Globe",     category: "Nature" },
  { id: "leaf",       label: "Leaf",      category: "Nature" },
  { id: "flower",     label: "Flower",    category: "Nature" },
  { id: "trees",      label: "Trees",     category: "Nature" },
  { id: "snowflake",  label: "Snowflake", category: "Nature" },
  { id: "waves",      label: "Waves",     category: "Nature" },
  { id: "wind",       label: "Wind",      category: "Nature" },
  { id: "droplets",   label: "Droplets",  category: "Nature" },
  { id: "mountain",   label: "Mountain",  category: "Nature" },
  { id: "palmtree",   label: "Palm",      category: "Nature" },

  // 🐾 Animals
  { id: "fish",       label: "Fish",      category: "Animals" },
  { id: "bird",       label: "Bird",      category: "Animals" },
  { id: "bug",        label: "Bug",       category: "Animals" },
  { id: "rabbit",     label: "Rabbit",    category: "Animals" },

  // 🍕 Food
  { id: "pizza",      label: "Pizza",     category: "Food" },
  { id: "coffee",     label: "Coffee",    category: "Food" },
  { id: "ice-cream",  label: "Ice Cream", category: "Food" },
  { id: "apple",      label: "Apple",     category: "Food" },
  { id: "banana",     label: "Banana",    category: "Food" },
  { id: "cherry",     label: "Cherry",    category: "Food" },

  // 🎵 Media
  { id: "music",      label: "Music",     category: "Media" },
  { id: "music-2",    label: "Music 2",   category: "Media" },
  { id: "headphones", label: "Headphones",category: "Media" },
  { id: "mic",        label: "Mic",       category: "Media" },
  { id: "radio",      label: "Radio",     category: "Media" },
  { id: "tv",         label: "TV",        category: "Media" },
  { id: "camera",     label: "Camera",    category: "Media" },
  { id: "gamepad",    label: "Gamepad",   category: "Media" },

  // 🚗 Travel
  { id: "bike",       label: "Bike",      category: "Travel" },
  { id: "car",        label: "Car",       category: "Travel" },
  { id: "plane",      label: "Plane",     category: "Travel" },
  { id: "train",      label: "Train",     category: "Travel" },
  { id: "ship",       label: "Ship",      category: "Travel" },
  { id: "umbrella",   label: "Umbrella",  category: "Travel" },
  { id: "tent",       label: "Tent",      category: "Travel" },

  // 🏠 Places
  { id: "home",       label: "Home",      category: "Places" },
  { id: "building",   label: "Building",  category: "Places" },

  // ⚔️ Fun
  { id: "swords",     label: "Swords",    category: "Fun" },
  { id: "dice",       label: "Dice",      category: "Fun" },
  { id: "puzzle",     label: "Puzzle",    category: "Fun" },
  { id: "footprints", label: "Footprints",category: "Fun" },
  { id: "handshake",  label: "Handshake", category: "Fun" },
];

const SHAPE_CATEGORIES = [
  "All", "Basic", "Stars", "Arrows", "Symbols",
  "Nature", "Animals", "Food", "Media", "Travel", "Places",
  "Magic", "Faces", "UI", "Fun"
];

const CATEGORY_COLORS: Record<string, string> = {
  Basic:   "#4badd4",
  Stars:   "#f5c842",
  Arrows:  "#2ecc71",
  Symbols: "#e84040",
  Nature:  "#4caf50",
  Animals: "#e87830",
  Food:    "#e85c20",
  Media:   "#9b59b6",
  Travel:  "#1a6fa8",
  Places:  "#c9a84c",
  Magic:   "#bb8fce",
  Faces:   "#f5c842",
  UI:      "#4badd4",
  Fun:     "#e84040",
};

const BOTTLE_SHAPES = [
  { id: "Round", label: "Round", src: "/bottles/RoundShape.png", labelTop: "34%", labelLeft: "13%", labelWidth: "74%", labelHeight: "34%", perspectiveStrength: 30 },
  { id: "Pyramid", label: "Pyramid", src: "/bottles/PyramidShape.png", labelTop: "38%", labelLeft: "22%", labelWidth: "56%", labelHeight: "30%", perspectiveStrength: 25 },
  { id: "Zen", label: "Zen", src: "/bottles/ZenShape.png", labelTop: "36%", labelLeft: "20%", labelWidth: "60%", labelHeight: "26%", perspectiveStrength: 15 },
  { id: "Square", label: "Square", src: "/bottles/SquareShape.png", labelTop: "36%", labelLeft: "14%", labelWidth: "72%", labelHeight: "30%", perspectiveStrength: 20 },
  { id: "Peace", label: "Peace", src: "/bottles/PeaceShape.png", labelTop: "32%", labelLeft: "18%", labelWidth: "64%", labelHeight: "36%", perspectiveStrength: 20 },
];



const AI_PROMPT_EXAMPLES = [
  "Luxury black & gold premium water",
  "Fresh mint green spa water",
  "Ocean blue mineral water",
  "Minimalist white elegant label",
  "Tropical fruit flavored water",
  "Dark forest botanical water",
  "Rose pink feminine hydration",
  "Electric neon sports water",
];

function uid() { return Math.random().toString(36).slice(2, 9); }

function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative flex flex-col items-center" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 px-2 py-1 rounded bg-sky-900 text-white text-xs whitespace-nowrap shadow-xl pointer-events-none">{label}</div>
      )}
    </div>
  );
}

function SidebarBtn({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return (
    <Tooltip label={label}>
      <button onClick={onClick}
        className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-200 gap-1 group
          ${active ? "bg-sky-400/20 text-sky-600 ring-1 ring-sky-400/60" : "text-sky-700 hover:bg-sky-100 hover:text-sky-600"}`}>
        <span className="text-lg">{icon}</span>
        <span className="text-[9px] font-medium tracking-wide uppercase">{label}</span>
      </button>
    </Tooltip>
  );
}

interface DrawToolbarProps {
  drawColor: string; setDrawColor: (c: string) => void;
  drawSize: number; setDrawSize: (s: number) => void;
  onClear: () => void; onClose: () => void;
}
function DrawToolbar({ drawColor, setDrawColor, drawSize, setDrawSize, onClear, onClose }: DrawToolbarProps) {
  const DRAW_COLORS = ["#0a0a0a", "#ffffff", "#e84040", "#4badd4", "#2ecc71", "#f5c842", "#9b59b6", "#e87830"];
  return (
    <div className="w-80 bg-white border-r border-sky-100 flex flex-col p-4 gap-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-sky-800 uppercase tracking-widest">✏️ Draw</h3>
        <button onClick={onClose} className="text-sky-300 hover:text-sky-600">✕</button>
      </div>
      <div className="bg-sky-50 rounded-xl p-3 border border-sky-100">
        <p className="text-[10px] text-sky-500 uppercase tracking-widest font-semibold mb-2">Brush Color</p>
        <div className="flex gap-2 flex-wrap">
          {DRAW_COLORS.map(c => (
            <button key={c} onClick={() => setDrawColor(c)}
              className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${drawColor === c ? "border-sky-500 ring-2 ring-sky-300/50 scale-110" : "border-white shadow-sm"}`}
              style={{ backgroundColor: c }} />
          ))}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-sky-400">Custom</span>
            <input type="color" value={drawColor} onChange={e => setDrawColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
          </div>
        </div>
      </div>
      <div className="bg-sky-50 rounded-xl p-3 border border-sky-100">
        <p className="text-[10px] text-sky-500 uppercase tracking-widest font-semibold mb-2">Brush Size: {drawSize}px</p>
        <input type="range" min={1} max={40} value={drawSize} onChange={e => setDrawSize(Number(e.target.value))} className="w-full accent-sky-400" />
        <div className="flex justify-between text-[9px] text-sky-300 mt-1"><span>Fine</span><span>Medium</span><span>Bold</span></div>
      </div>
      <button onClick={onClear} className="w-full py-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 text-red-500 text-sm font-semibold transition-all">🗑 Clear All Drawings</button>
    </div>
  );
}

interface AIPanelProps {
  aiPrompt: string; setAiPrompt: (v: string) => void;
  aiLoading: boolean; aiError: string | null;
  aiResults: AIGeneratedDesign[]; aiGenerated: boolean;
  onGenerate: () => void; onReset: () => void;
  onApply: (d: AIGeneratedDesign) => void; onClose: () => void;
}
  function AIPanel({ aiPrompt, setAiPrompt, aiLoading, aiError, aiResults, aiGenerated, onGenerate, onReset, onApply, onClose }: AIPanelProps) {
  const [cooldown, setCooldown] = useState(false);

  const handleGenerate = () => {
    setCooldown(true);
    onGenerate();
    setTimeout(() => setCooldown(false), 10000);
  };
  return (
    <div className="w-80 bg-white border-r border-sky-100 flex flex-col overflow-y-auto">
      <div className="px-4 pt-4 pb-3 border-b border-sky-50 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-sky-500 flex items-center justify-center shadow-sm">
              <span className="text-white text-[10px] font-black">AI</span>
            </div>
            <h3 className="text-sm font-bold text-sky-800 uppercase tracking-widest">AI Generator</h3>
          </div>
          <button onClick={onClose} className="text-sky-300 hover:text-sky-600">✕</button>
        </div>
        <p className="text-[11px] text-sky-400 leading-relaxed">Describe your ideal water bottle label and get 3 unique AI-generated designs instantly.</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] text-sky-500 uppercase tracking-widest font-semibold">Your Prompt</label>
          <div className="relative">
            <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleGenerate(); }}
              placeholder="e.g. Luxury black & gold premium mineral water…" rows={3}
              className="w-full bg-sky-50 border border-sky-200 rounded-xl px-3 py-2.5 text-sm text-sky-900 placeholder-sky-300 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 transition-all resize-none leading-relaxed" />
            {aiPrompt && <button onClick={() => setAiPrompt("")} className="absolute top-2 right-2 text-sky-300 hover:text-sky-500 text-xs">✕</button>}
          </div>
          <button onClick={handleGenerate} disabled={!aiPrompt.trim() || aiLoading || cooldown}
            className={`w-full py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-2
              ${!aiPrompt.trim() || aiLoading ? "bg-sky-100 text-sky-300 cursor-not-allowed" : "bg-gradient-to-r from-violet-500 to-sky-500 text-white hover:opacity-90 hover:scale-[1.01] shadow-lg shadow-violet-200/50"}`}>
            {aiLoading ? <><span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating…</> : <>✦ Generate Label Designs</>}
          </button>
        </div>
        {!aiGenerated && !aiLoading && (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] text-sky-400 uppercase tracking-widest font-semibold">Try an example</p>
            <div className="flex flex-col gap-1.5">
              {AI_PROMPT_EXAMPLES.map((p, i) => (
                <button key={i} onClick={() => setAiPrompt(p)}
                  className="text-left px-3 py-2 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-100 hover:border-sky-300 text-xs text-sky-600 transition-all duration-150 group">
                  <span className="text-sky-300 mr-1.5 group-hover:text-violet-400">✦</span>{p}
                </button>
              ))}
            </div>
          </div>
        )}
        {aiError && <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl"><span className="text-red-400 text-sm mt-0.5">⚠</span><div><p className="text-xs text-red-600 font-medium mb-0.5">Generation failed</p><p className="text-[11px] text-red-400">{aiError}</p></div></div>}
        {aiLoading && <div className="flex flex-col gap-3">{[1,2,3].map(i => <div key={i} className="rounded-xl border border-sky-100 overflow-hidden animate-pulse"><div className="h-28 bg-gradient-to-r from-sky-100 to-sky-50" /><div className="p-3"><div className="h-3 w-24 bg-sky-100 rounded" /></div></div>)}</div>}
        {aiGenerated && aiResults.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-sky-400 uppercase tracking-widest font-semibold">Generated Designs</p>
              <button onClick={onReset} className="text-[10px] text-sky-400 hover:text-violet-500">↺ New</button>
            </div>
            {aiResults.map((design, idx) => (
              <div key={idx} className="rounded-xl border border-sky-100 hover:border-violet-300 overflow-hidden transition-all duration-200 hover:shadow-md group">
                <div className="h-28 flex items-center justify-center relative overflow-hidden" style={design.bgStyle}>
                  <div className="relative z-10 flex flex-col items-center gap-0.5 px-3">
                    {design.elements.filter(el => el.type === "text").slice(0, 2).map((el, ei) => (
                      <span key={ei} style={{ fontFamily: el.fontFamily || "Georgia", color: el.fill || "#1a5f8a", fontSize: ei === 0 ? "22px" : "9px", fontWeight: el.fontStyle === "bold" ? "bold" : "normal", letterSpacing: el.letterSpacing ? `${el.letterSpacing * 0.5}px` : undefined, opacity: el.opacity ?? 1, lineHeight: 1.1, textAlign: "center" }}>{el.text}</span>
                    ))}
                  </div>
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/80 flex items-center justify-center"><span className="text-[9px] text-sky-600 font-bold">{idx + 1}</span></div>
                </div>
                <div className="p-3 flex items-center justify-between bg-white">
                  <div><p className="text-xs font-semibold text-sky-800">{design.name}</p><p className="text-[10px] text-sky-400">{design.elements.length} elements</p></div>
                  <button onClick={() => onApply(design)} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-sky-500 text-white text-[11px] font-bold hover:opacity-90 shadow-sm">Apply</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LabelEditor() {
  const [activeTool, setActiveTool] = useState<Tool>("templates");
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryState[]>([{ elements: [] }]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [show3D, setShow3D] = useState(false);
  const [selected3DBottle, setSelected3DBottle] = useState("Round");
  const [bgPattern, setBgPattern] = useState(0);
  const [bgPrimary, setBgPrimary] = useState("#d6eef8");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [elemCategory, setElemCategory] = useState("All");
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [canvasBaseW, setCanvasBaseW] = useState(500);
  const [canvasBaseH, setCanvasBaseH] = useState(700);
  const [borderSize, setBorderSize] = useState(8);
  const [drawStrokes, setDrawStrokes] = useState<DrawStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<DrawStroke | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState("#0a0a0a");
  const [drawSize, setDrawSize] = useState(4);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResults, setAiResults] = useState<AIGeneratedDesign[]>([]);
  const [aiGenerated, setAiGenerated] = useState(false);

  const canvasW = Math.round(canvasBaseW * (zoom / 100));
  const canvasH = Math.round(canvasBaseH * (zoom / 100));
  const scale = zoom / 100;

  const svgRef = useRef<SVGSVGElement>(null);
  //const trRef = useRef<Konva.Transformer>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef(elements);
  useEffect(() => { elementsRef.current = elements; }, [elements]);

  const resizeDragRef = useRef<{ dir: "e"|"s"|"se"; startX: number; startY: number; startW: number; startH: number } | null>(null);
  const startCanvasResize = useCallback((dir: "e"|"s"|"se") => (e: React.MouseEvent) => {
    e.preventDefault();
    resizeDragRef.current = { dir, startX: e.clientX, startY: e.clientY, startW: canvasBaseW, startH: canvasBaseH };
    const onMove = (ev: MouseEvent) => {
      if (!resizeDragRef.current) return;
      const { dir, startX, startY, startW, startH } = resizeDragRef.current;
      const dx = Math.round((ev.clientX - startX) / scale / 10) * 10;
      const dy = Math.round((ev.clientY - startY) / scale / 10) * 10;
      if (dir === "e" || dir === "se") setCanvasBaseW(Math.max(200, Math.min(1200, startW + dx)));
      if (dir === "s" || dir === "se") setCanvasBaseH(Math.max(200, Math.min(1600, startH + dy)));
    };
    const onUp = () => { resizeDragRef.current = null; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [canvasBaseW, canvasBaseH, scale]);

  const pushHistory = useCallback((newElems: CanvasElement[]) => {
    setHistory(prev => { const next = prev.slice(0, historyIdx + 1); next.push({ elements: newElems }); return next; });
    setHistoryIdx(prev => prev + 1);
    setElements(newElems);
  }, [historyIdx]);

  const undo = useCallback(() => { if (historyIdx <= 0) return; const prev = historyIdx - 1; setHistoryIdx(prev); setElements(history[prev].elements); setSelectedId(null); }, [history, historyIdx]);
  const redo = useCallback(() => { if (historyIdx >= history.length - 1) return; const next = historyIdx + 1; setHistoryIdx(next); setElements(history[next].elements); }, [history, historyIdx]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (editingTextId) return;
      if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") { e.preventDefault(); redo(); }
      if (e.key === "Delete" && selectedId) { const newElems = elementsRef.current.filter(el => el.id !== selectedId); pushHistory(newElems); setSelectedId(null); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo, selectedId, pushHistory, editingTextId]);

  // useEffect(() => {
  //   if (!trRef.current) return;
  //   //const stage = stageRef.current;
  //   if (!stage) return;
  //   if (editingTextId) { trRef.current.nodes([]); trRef.current.getLayer()?.batchDraw(); return; }
  //   if (selectedId) { const node = stage.findOne(`#${selectedId}`); if (node) { trRef.current.nodes([node]); trRef.current.getLayer()?.batchDraw(); } }
  //   else { trRef.current.nodes([]); trRef.current.getLayer()?.batchDraw(); }
  // }, [selectedId, elements, editingTextId]);


  //const svgBox = svgRef.current!.getBoundingClientRect();
//const wrapperBox = canvasWrapperRef.current!.getBoundingClientRect();
// el.x and el.y are already in canvas coords, just scale them:
//const absX = svgBox.left - wrapperBox.left + el.x * scale;
//const absY = svgBox.top - wrapperBox.top + el.y * scale;
// Then use absX/absY instead of stageBox.left + absPos.x

  // ❌ REMOVE the old startInlineTextEdit entirely, replace with:
const startInlineTextEdit = useCallback((elementId: string) => {
  const el = elementsRef.current.find(e => e.id === elementId);
  if (!el || el.type !== "text") return;
  if (!svgRef.current || !canvasWrapperRef.current) return;

  setEditingTextId(elementId);

  // Find the SVG text node and hide it while editing
  const svgTextNode = svgRef.current.querySelector(`[data-id="${elementId}"]`) as SVGTextElement | null;
  if (svgTextNode) svgTextNode.style.visibility = "hidden";

  const svgBox = svgRef.current.getBoundingClientRect();
  const wrapperBox = canvasWrapperRef.current.getBoundingClientRect();
  const absX = svgBox.left - wrapperBox.left + el.x * scale;
  const absY = svgBox.top  - wrapperBox.top  + el.y * scale;

  const textarea = document.createElement("textarea");
  textarea.value = el.text || "";
  textarea.style.cssText = [
    `position:absolute`,
    `left:${absX}px`,
    `top:${absY}px`,
    `width:${Math.max((el.width || 300) * scale, 120)}px`,
    `min-height:${(el.fontSize || 20) * scale * 1.4}px`,
    `font-size:${(el.fontSize || 20) * scale}px`,
    `font-family:${el.fontFamily || "Outfit"}`,
    `font-weight:${el.fontStyle === "bold" ? "bold" : "normal"}`,
    `color:${el.fill || "#1a5f8a"}`,
    `background:rgba(255,255,255,0.12)`,
    `border:2px dashed rgba(14,165,233,0.8)`,
    `border-radius:3px`,
    `outline:none`,
    `padding:2px 4px`,
    `resize:none`,
    `overflow:hidden`,
    `line-height:1.2`,
    `z-index:1000`,
    `transform-origin:left top`,
    el.rotation ? `transform:rotate(${el.rotation}deg)` : "",
  ].join(";");

  canvasWrapperRef.current.appendChild(textarea);
  textarea.focus();
  textarea.select();

  const resize = () => { textarea.style.height = "auto"; textarea.style.height = `${textarea.scrollHeight}px`; };
  textarea.addEventListener("input", resize);
  resize();

  const finishEdit = () => {
  const newText = textarea.value;
  if (svgTextNode) svgTextNode.style.visibility = "visible";
  if (textarea.parentNode) textarea.parentNode.removeChild(textarea);
  const bbox = svgTextNode?.getBBox?.();
  const newElems = elementsRef.current.map(e => e.id === elementId ? { 
    ...e, 
    text: newText,
    width: bbox ? bbox.width : e.width,
    height: bbox ? bbox.height : e.height,
  } : e);
  setHistory(prev => { const cur = prev.slice(0, historyIdx + 1); cur.push({ elements: newElems }); return cur; });
  setHistoryIdx(prev => prev + 1);
  setElements(newElems);
  setEditingTextId(null);
  setSelectedId(elementId);
};

  textarea.addEventListener("blur", finishEdit);
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Escape" || (e.key === "Enter" && (e.ctrlKey || e.metaKey))) {
      e.preventDefault(); textarea.blur();
    }
    e.stopPropagation();
  });
}, [scale, historyIdx]);

  const addText = (preset: "heading"|"sub"|"body") => {
    const configs = {
      heading: { text: "Heading Text", fontSize: 48, fontFamily: "Georgia", fill: "#1a5f8a", fontStyle: "bold" },
      sub: { text: "Subheading", fontSize: 28, fontFamily: "Outfit", fill: "#2a7fb0", fontStyle: "normal" },
      body: { text: "Body text goes here", fontSize: 16, fontFamily: "Outfit", fill: "#555577", fontStyle: "normal" },
    };
    const cfg = configs[preset];
    const el: CanvasElement = { id: uid(), type: "text", x: 80, y: 100, ...cfg,width: cfg.text.length * (cfg.fontSize * 0.6),  // ← ADD THIS
  height: cfg.fontSize * 1.4, rotation: 0, opacity: 1, draggable: true };
    pushHistory([...elements, el]); setSelectedId(el.id);
  };

 const addShape = (shapeId: string) => {
  const shapeMeta = SHAPES_CATALOG.find(s => s.id === shapeId);
  const color = CATEGORY_COLORS[shapeMeta?.category ?? "Basic"] ?? "#4badd4";

  const el: CanvasElement = {
    id: uid(),
    type: "icon",
    iconName: shapeId,
    x: 210,
    y: 310,
    width: 80,
    height: 80,
    stroke: color,   // ← uses category color
    strokeWidth: 2,
    fill: "none",
    rotation: 0,
    opacity: 1,
    draggable: true,
  };
  pushHistory([...elements, el]);
  setSelectedId(el.id);
};
  const loadTemplate = (tmpl: typeof TEMPLATE_DESIGNS[0]) => {
    const newElems = tmpl.elements.map(e => ({ ...e, id: uid() }));
    pushHistory(newElems); setBgPrimary(tmpl.bg); setBgPattern(0); setSelectedId(null);
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => { const url = ev.target?.result as string; setUploadedImages(prev => [url, ...prev]); };
    reader.readAsDataURL(file);
  };

  const addImageToCanvas = (url: string) => {
    const img = new window.Image(); img.src = url;
    img.onload = () => { const el: CanvasElement = { id: uid(), type: "image", x: 60, y: 60, width: 200, height: 150, imageUrl: url, rotation: 0, opacity: 1, draggable: true }; pushHistory([...elements, el]); setSelectedId(el.id); };
  };

  const selectedEl = elements.find(e => e.id === selectedId) || null;

  const updateSelected = useCallback((patch: Partial<CanvasElement>) => {
    setElements(prev => prev.map(e => e.id === selectedId ? { ...e, ...patch } : e));
  }, [selectedId]);

  const updateSelectedAndHistory = useCallback((patch: Partial<CanvasElement>) => {
    const newElems = elementsRef.current.map(e => e.id === selectedId ? { ...e, ...patch } : e);
    pushHistory(newElems);
  }, [selectedId, pushHistory]);

 const handleDrawMouseDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
  const svgRect = svgRef.current!.getBoundingClientRect();
  const x = (e.clientX - svgRect.left) / scale;
  const y = (e.clientY - svgRect.top) / scale;
  const newStroke: DrawStroke = {
    id: uid(), points: [x, y],
    stroke: drawColor, strokeWidth: drawSize, opacity: 1
  };
  setCurrentStroke(newStroke);
  setIsDrawing(true);
}, [drawColor, drawSize, scale]);   // ← must have this closing line

  const handleDrawMouseMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
  if (!isDrawing || !currentStroke) return;
  if (!svgRef.current) return;
  const svgRect = svgRef.current.getBoundingClientRect();
  const x = (e.clientX - svgRect.left) / scale;
  const y = (e.clientY - svgRect.top)  / scale;
  setCurrentStroke(prev => prev ? { ...prev, points: [...prev.points, x, y] } : prev);
}, [isDrawing, currentStroke, scale]);

  const handleDrawMouseUp = useCallback((_e: React.PointerEvent<SVGSVGElement>) => {
  if (!isDrawing || !currentStroke) return;
  setDrawStrokes(prev => [...prev, currentStroke]);
  setCurrentStroke(null);
  setIsDrawing(false);
}, [isDrawing, currentStroke]);

  const generateAILabel = useCallback(async () => {
    if (!aiPrompt.trim() || aiLoading) return;
    setAiLoading(true); setAiError(null); setAiResults([]); setAiGenerated(false);
    try {
      const response = await fetch("/api/generate-label", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: aiPrompt }) });
      if (!response.ok) { const errData = await response.json().catch(() => ({})); throw new Error(errData.error || `HTTP ${response.status}`); }
      const data = await response.json();
      const rawText: string = data.text || "";
      let cleaned = rawText.replace(/^```json\s*/im, "").replace(/^```\s*/im, "").replace(/\s*```$/im, "").trim();
      const arrStart = cleaned.indexOf("["), arrEnd = cleaned.lastIndexOf("]");
      if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) cleaned = cleaned.slice(arrStart, arrEnd + 1);
      const tryParse = (str: string): unknown => { try { return JSON.parse(str); } catch { return null; } };
      let parsed = tryParse(cleaned);
      if (!parsed) { const lc = cleaned.lastIndexOf("}]"), la = cleaned.lastIndexOf("},"); if (lc !== -1) parsed = tryParse(cleaned.slice(0, lc + 2)); else if (la !== -1) parsed = tryParse(cleaned.slice(0, la + 1) + "]"); }
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Could not parse AI response.");
      const designs: AIGeneratedDesign[] = (parsed as {name:string;background:string;elements:CanvasElement[]}[]).slice(0, 3).map(d => {
        const bg = d.background || "#d6eef8";
        return { name: d.name || "AI Design", background: bg, bgStyle: { backgroundColor: bg }, elements: (d.elements || []).map((el: CanvasElement) => ({ ...el, id: uid(), draggable: true })) };
      });
      setAiResults(designs); setAiGenerated(true);
    } catch { setAiError("Generation failed. Please try again."); } finally { setAiLoading(false); }
  }, [aiPrompt, aiLoading]);

  const applyAIDesign = useCallback((design: AIGeneratedDesign) => {
    pushHistory(design.elements); setBgPrimary(design.background); setBgPattern(0); setSelectedId(null);
  }, [pushHistory]);

  const drawBgToCanvas = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.fillStyle = bgPrimary; ctx.fillRect(0, 0, w, h);
    if (bgPattern === 1) { const g = ctx.createLinearGradient(0,0,w,h); g.addColorStop(0, bgPrimary); g.addColorStop(1, "#1a6fa8"); ctx.fillStyle = g; ctx.fillRect(0,0,w,h); }
    else if (bgPattern === 2) { const g = ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,Math.max(w,h)/2); g.addColorStop(0, bgPrimary); g.addColorStop(1, "#0d1b2a"); ctx.fillStyle = g; ctx.fillRect(0,0,w,h); }
    else if (bgPattern === 6) { const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0, "#ffffff"); g.addColorStop(1, bgPrimary); ctx.fillStyle = g; ctx.fillRect(0,0,w,h); }
  }, [bgPrimary, bgPattern]);

 // REMOVE: stageRef.current.toCanvas(...)
// ADD: serialize SVG → canvas using XMLSerializer + drawImage
const exportPNG = useCallback(() => {
  if (!svgRef.current) return;
  const PR = 2;
  const svgEl = svgRef.current;
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgEl);
  const out = document.createElement("canvas");
  out.width = canvasBaseW * PR; out.height = canvasBaseH * PR;
  const ctx = out.getContext("2d")!;
  drawBgToCanvas(ctx, out.width, out.height);
  const img = new window.Image();
  const blob = new Blob([svgStr], { type: "image/svg+xml" });
  img.src = URL.createObjectURL(blob);
  img.onload = () => {
    ctx.drawImage(img, 0, 0, out.width, out.height);
    URL.revokeObjectURL(img.src);
    const a = document.createElement("a");
    a.href = out.toDataURL("image/png");
    a.download = "lave-label.png"; a.click();
  };
}, [drawBgToCanvas, canvasBaseW, canvasBaseH]);

  // ❌ REMOVE old captureLabelWithBg, replace with:
const captureLabelWithBg = useCallback((): Promise<string> => {
  return new Promise((resolve) => {
    if (!svgRef.current) { resolve(""); return; }

    const PR = 2;
    const W = canvasBaseW * PR;
    const H = canvasBaseH * PR;
    const out = document.createElement("canvas");
    out.width = W; out.height = H;
    const ctx = out.getContext("2d");
    if (!ctx) { resolve(""); return; }

    drawBgToCanvas(ctx, W, H);

    // Temporarily hide selection handles before capture
    const prevSelected = selectedId;
    setSelectedId(null);

    // Give React one frame to re-render without handles
    requestAnimationFrame(() => {
      if (!svgRef.current) { resolve(""); return; }
      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svgRef.current);
      const blob = new Blob([svgStr], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const img = new window.Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, W, H);
        URL.revokeObjectURL(url);
        setSelectedId(prevSelected); // restore selection
        resolve(out.toDataURL("image/png"));
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(""); };
      img.src = url;
    });
  });
}, [drawBgToCanvas, canvasBaseW, canvasBaseH, selectedId]);

  const patternStyles: React.CSSProperties[] = [
    { backgroundColor: bgPrimary },
    { background: `linear-gradient(135deg, ${bgPrimary}, #1a6fa8)` },
    { background: `radial-gradient(circle at 50% 50%, ${bgPrimary}, #0d1b2a)` },
    { backgroundColor: "#f8f8f8", backgroundImage: "radial-gradient(circle, #aaa 1px, transparent 1px)", backgroundSize: "12px 12px" },
    { backgroundColor: bgPrimary, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.15) 20px, rgba(255,255,255,0.15) 21px)" },
    { backgroundColor: "#dde8f2", backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(26,111,168,0.15) 28px, rgba(26,111,168,0.15) 29px), repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(26,111,168,0.15) 28px, rgba(26,111,168,0.15) 29px)" },
    { background: `linear-gradient(180deg, #ffffff 0%, ${bgPrimary} 100%)` },
  ];
  const bgStyle = patternStyles[bgPattern] || patternStyles[0];

  // ─── 3D Preview ─────────────────────────────────────────────────────────────
  const Preview3D = () => {
    const [labelDataUrl, setLabelDataUrl] = useState<string | null>(null);
    const [bottleLoaded, setBottleLoaded] = useState(false);
    const [previewMode, setPreviewMode] = useState<"bottle" | "label">("bottle");
    const bottleConfig = BOTTLE_SHAPES.find(b => b.id === selected3DBottle) || BOTTLE_SHAPES[0];

    useEffect(() => { captureLabelWithBg().then(url => setLabelDataUrl(url)); }, []);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShow3D(false)}>
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-[520px] max-w-[95vw] max-h-[92vh] p-6 flex flex-col items-center gap-4 border border-sky-100 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between w-full shrink-0">
            <h2 className="text-sky-800 text-base font-bold tracking-widest uppercase">Preview</h2>
            <button onClick={() => setShow3D(false)} className="text-sky-300 hover:text-sky-700 text-xl leading-none">✕</button>
          </div>

          {/* Mode toggle buttons */}
          <div className="flex gap-2 w-full shrink-0">
            <button
              onClick={() => setPreviewMode("bottle")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                previewMode === "bottle"
                  ? "bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-200"
                  : "bg-sky-50 text-sky-600 border-sky-200 hover:border-sky-400 hover:bg-sky-100"
              }`}
            >
              🫙 Preview on Bottle
            </button>
            <button
              onClick={() => setPreviewMode("label")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                previewMode === "label"
                  ? "bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-200"
                  : "bg-sky-50 text-sky-600 border-sky-200 hover:border-sky-400 hover:bg-sky-100"
              }`}
            >
              🏷️ Preview Label
            </button>
          </div>

          {/* Bottle shape selector — only in bottle mode */}
          {previewMode === "bottle" && (
            <div className="flex gap-2 flex-wrap justify-center shrink-0">
              {BOTTLE_SHAPES.map(b => (
                <button key={b.id} onClick={() => setSelected3DBottle(b.id)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 ${
                    selected3DBottle === b.id
                      ? "bg-sky-500 text-white shadow-md shadow-sky-200"
                      : "bg-sky-100 text-sky-600 hover:bg-sky-200"
                  }`}>
                  {b.label}
                </button>
              ))}
            </div>
          )}

          {/* Preview content */}
          {previewMode === "bottle" ? (
            <div className="relative flex items-center justify-center shrink-0" style={{ width: 260, height: 360, background: "radial-gradient(ellipse at 50% 60%, rgba(186,230,255,0.35) 0%, rgba(255,255,255,0.1) 70%)", transformOrigin: "top center" }}>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-4 rounded-full" style={{ background: "rgba(0,60,140,0.12)", filter: "blur(8px)" }} />
              <div className="relative h-[320px] flex items-center justify-center">
                <img
                  src={bottleConfig.src}
                  alt={bottleConfig.label}
                  className="h-full object-contain select-none"
                  style={{ filter: "drop-shadow(0 12px 20px rgba(0,80,180,0.2))", maxWidth: 220 }}
                  onLoad={() => setBottleLoaded(true)}
                />
                {labelDataUrl && bottleLoaded && (
                  <div className="absolute overflow-hidden" style={{ top: bottleConfig.labelTop, left: bottleConfig.labelLeft, width: bottleConfig.labelWidth, height: bottleConfig.labelHeight, borderRadius: "4px", boxShadow: "inset 4px 0 12px rgba(0,0,0,0.18), inset -4px 0 12px rgba(0,0,0,0.18)", pointerEvents: "none" }}>
                    <img src={labelDataUrl} alt="label preview" style={{ width: "100%", height: "100%", objectFit: "fill", display: "block", maskImage: "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,1) 12%, rgba(0,0,0,1) 88%, rgba(0,0,0,0.7) 100%)", WebkitMaskImage: "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,1) 12%, rgba(0,0,0,1) 88%, rgba(0,0,0,0.7) 100%)" }} />
                    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(to right, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.18) 20%, rgba(255,255,255,0) 45%, rgba(255,255,255,0) 55%, rgba(255,255,255,0.12) 80%, rgba(255,255,255,0.06) 100%)", pointerEvents: "none" }} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Label-only preview */
            <div className="flex flex-col items-center gap-3 shrink-0 w-full">
              {labelDataUrl ? (
                <div className="border-2 border-sky-100 rounded-xl overflow-hidden shadow-md w-full flex items-center justify-center" style={{ background: "#f0f8ff", padding: "16px" }}>
                  <img
                    src={labelDataUrl}
                    alt="label"
                    style={{ maxWidth: "100%", maxHeight: 360, objectFit: "contain", display: "block", borderRadius: "8px", boxShadow: "0 4px 24px rgba(14,165,233,0.12)" }}
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-sky-50 rounded-xl flex items-center justify-center border border-sky-100">
                  <div className="flex flex-col items-center gap-2 text-sky-300">
                    <span className="inline-block w-5 h-5 border-2 border-sky-300/30 border-t-sky-400 rounded-full animate-spin" />
                    <span className="text-sm">Generating preview…</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Single export button at the bottom */}
          <button
            onClick={exportPNG}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-white text-sm font-bold hover:opacity-90 shadow-lg shadow-amber-200/50 flex items-center justify-center gap-2 shrink-0 transition-all hover:scale-[1.01]"
          >
            ↓ Export Label as PNG
          </button>
        </div>
      </div>
    );
  };

  // ─── Secondary Panel ────────────────────────────────────────────────────────
  const SecondaryPanel = () => {
    const filteredShapes = SHAPES_CATALOG.filter(s => {
      const matchesSearch = !searchQuery || s.label.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = elemCategory === "All" || s.category === elemCategory;
      return matchesSearch && matchesCategory;
    });

    if (activeTool === "templates") return (
      <div className="w-80 bg-white border-r border-sky-100 flex flex-col overflow-y-auto p-4 gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-sky-800 uppercase tracking-widest">Templates</h3>
          <button onClick={() => setActiveTool("select")} className="text-sky-300 hover:text-sky-600">✕</button>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-sky-400 bg-sky-50 rounded-lg px-3 py-1.5 border border-sky-100">
          <span>✦</span><span>{TEMPLATE_DESIGNS.length} templates available</span>
        </div>
        <button onClick={() => { pushHistory([]); setBgPrimary("#ffffff"); }}
          className="w-full py-2.5 rounded-xl border border-dashed border-sky-400/60 text-sky-600 text-sm hover:border-sky-500 hover:bg-sky-50 transition-all font-medium">
          ✦ Start from Scratch
        </button>
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATE_DESIGNS.map(t => (
            <button key={t.id} onClick={() => loadTemplate(t)}
              className="flex flex-col items-center gap-0 rounded-xl overflow-hidden border border-sky-100 hover:border-sky-400/60 hover:scale-[1.02] transition-all duration-200 group">
              <div className="w-full h-32 relative overflow-hidden" style={{ backgroundColor: t.bg }}>
                <div className="absolute inset-0 flex flex-col justify-center px-3 py-2">
                  {t.elements.filter(e => e.type === "text").slice(0, 2).map((el, i) => (
                    <span key={i} style={{ fontFamily: el.fontFamily || "Georgia", color: el.fill || "#fff", fontSize: i === 0 ? "20px" : "7px", fontWeight: el.fontStyle === "bold" ? "bold" : "normal", letterSpacing: el.letterSpacing ? `${el.letterSpacing * 0.3}px` : undefined, opacity: el.opacity ?? 1, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden" }}>{el.text}</span>
                  ))}
                  {t.elements.filter(e => e.type === "rect" && e.width && e.width < 400 && e.height && e.height && e.height < 10).slice(0, 1).map((el, i) => (
                    <div key={i} style={{ width: "60%", height: 1.5, backgroundColor: el.fill || "#fff", opacity: 0.6, margin: "3px 0" }} />
                  ))}
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
              </div>
              <span className="text-[11px] text-sky-500 py-2 font-medium">{t.name}</span>
            </button>
          ))}
        </div>
      </div>
    );

    if (activeTool === "elements") return (
      <div className="w-80 bg-white border-r border-sky-100 flex flex-col p-4 gap-3 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-sky-800 uppercase tracking-widest">Elements</h3>
          <button onClick={() => setActiveTool("select")} className="text-sky-300 hover:text-sky-600">✕</button>
        </div>
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search shapes…"
          className="w-full bg-sky-50 border border-sky-200 rounded-lg px-3 py-2 text-sm text-sky-900 placeholder-sky-300 focus:outline-none focus:border-sky-400 transition-all" />
        <div className="flex gap-1.5 flex-wrap">
          {SHAPE_CATEGORIES.map(c => (
            <button key={c} onClick={() => setElemCategory(c)}
              className={`px-2 py-0.5 rounded-full text-[9px] font-semibold transition-all ${elemCategory === c ? "bg-sky-500 text-white" : "bg-sky-100 text-sky-600 hover:bg-sky-200"}`}>
              {c}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-sky-400">{filteredShapes.length} / {SHAPES_CATALOG.length} shapes</p>
        <div className="grid grid-cols-4 gap-1.5 overflow-y-auto">
          {filteredShapes.map(s => (
            <button key={s.id} onClick={() => addShape(s.id)}
              className="flex flex-col items-center justify-center h-14 rounded-xl bg-sky-50 hover:bg-sky-100 hover:border-sky-400/50 border border-sky-100 hover:scale-105 transition-all duration-200 text-lg text-sky-700 gap-0.5">
             {(() => {
  const IconComp = ICON_MAP[s.id];
  return IconComp
? <IconComp size={20} strokeWidth={1.5} style={{ color: CATEGORY_COLORS[s.category] ?? "#4badd4" }} />    : <span className="text-sky-400 text-sm">?</span>;
})()}
<span className="text-[7px] text-sky-400 leading-tight text-center px-0.5 truncate w-full">
  {s.label}
</span>
            </button>
          ))}
        </div>
      </div>
    );

    if (activeTool === "text") return (
      <div className="w-80 bg-white border-r border-sky-100 flex flex-col p-4 gap-3 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-sky-800 uppercase tracking-widest">Text</h3>
          <button onClick={() => setActiveTool("select")} className="text-sky-300 hover:text-sky-600">✕</button>
        </div>
        <button onClick={() => addText("heading")} className="w-full py-3 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-100 hover:border-sky-300 text-sky-900 text-left px-4 transition-all group"><span className="text-2xl font-bold group-hover:text-sky-600">Add a Heading</span></button>
        <button onClick={() => addText("sub")} className="w-full py-3 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-100 hover:border-sky-300 text-sky-700 text-left px-4 transition-all group"><span className="text-lg font-semibold group-hover:text-sky-600">Add a Subheading</span></button>
        <button onClick={() => addText("body")} className="w-full py-3 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-100 hover:border-sky-300 text-sky-500 text-left px-4 transition-all group"><span className="text-sm group-hover:text-sky-600">Add body text</span></button>
        <div className="mt-2">
          <p className="text-xs text-sky-400 uppercase tracking-wider mb-2">Font Styles</p>
          {FONT_FAMILIES.map(f => (
            <button key={f} onClick={() => { if (selectedId) updateSelectedAndHistory({ fontFamily: f }); }}
              className="w-full py-2 px-3 text-left rounded-lg hover:bg-sky-50 text-sky-800 text-sm transition-all" style={{ fontFamily: f }}>{f}</button>
          ))}
        </div>
        <p className="text-[10px] text-sky-400 mt-1 bg-sky-50 rounded-lg p-2 border border-sky-100">💡 Double-click any text on canvas to edit it directly</p>
      </div>
    );

    if (activeTool === "upload") return (
      <div className="w-80 bg-white border-r border-sky-100 flex flex-col p-4 gap-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-sky-800 uppercase tracking-widest">Upload</h3>
          <button onClick={() => setActiveTool("select")} className="text-sky-300 hover:text-sky-600">✕</button>
        </div>
        <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleImageUpload(f); }}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 ${dragOver ? "border-sky-400 bg-sky-50 scale-[1.02]" : "border-sky-200 hover:border-sky-400 hover:bg-sky-50"}`}>
          <span className="text-3xl mb-2 text-sky-400">☁</span>
          <p className="text-sm text-sky-600">Click or drag & drop</p>
          <p className="text-xs text-sky-400 mt-1">PNG, JPG, SVG</p>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
        {uploadedImages.length > 0 && <div className="grid grid-cols-2 gap-2">{uploadedImages.map((url, i) => (<button key={i} onClick={() => addImageToCanvas(url)} className="aspect-square rounded-lg overflow-hidden border border-sky-200 hover:border-sky-400 hover:scale-105 transition-all"><img src={url} alt="" className="w-full h-full object-cover" /></button>))}</div>}
      </div>
    );

    if (activeTool === "bg") return (
      <div className="w-80 bg-white border-r border-sky-100 flex flex-col p-4 gap-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-sky-600 uppercase tracking-widest">Background</h3>
          <button onClick={() => setActiveTool("select")} className="text-sky-300 hover:text-sky-600">✕</button>
        </div>
        <div>
          <p className="text-[10px] text-sky-400 uppercase tracking-widest mb-2">Pattern</p>
          <div className="grid grid-cols-4 gap-2">{patternStyles.map((style, i) => (<button key={i} onClick={() => setBgPattern(i)} className={`h-14 rounded-lg border-2 transition-all hover:scale-105 ${bgPattern === i ? "border-sky-500 ring-2 ring-sky-300/50" : "border-sky-100 hover:border-sky-300"}`} style={style} />))}</div>
        </div>
        <div>
          <p className="text-[10px] text-sky-400 uppercase tracking-widest mb-2">Primary Color</p>
          <div className="flex flex-wrap gap-2">
            {COLOR_PALETTE.map(c => (<button key={c} onClick={() => setBgPrimary(c)} className={`w-7 h-7 rounded-full border-2 hover:scale-110 transition-all ${bgPrimary === c ? "border-sky-500 ring-2 ring-sky-300/50" : "border-transparent"}`} style={{ backgroundColor: c }} />))}
            <div className="flex items-center gap-2"><span className="text-xs text-sky-400">Custom</span><input type="color" value={bgPrimary} onChange={e => setBgPrimary(e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent" /></div>
          </div>
        </div>
      </div>
    );
    return null;
  };

  // ─── Properties Panel ────────────────────────────────────────────────────────
  const PropertiesPanel = () => (
    <div className="w-72 bg-white border-l border-sky-100 flex flex-col overflow-y-auto">
      {selectedEl ? (
        <>
          {selectedEl.type === "text" && (
            <div className="p-4 border-b border-sky-50">
              <p className="text-[10px] text-sky-500 uppercase tracking-widest font-bold mb-1">Text Style</p>
              <p className="text-[10px] text-sky-400 mb-3 bg-sky-50 rounded-lg px-2 py-1.5 border border-sky-100">✏️ Double-click text on canvas to edit</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {FONT_FAMILIES.slice(0, 4).map(f => (<button key={f} onClick={() => updateSelectedAndHistory({ fontFamily: f })} className={`py-1.5 rounded-lg text-xs transition-all border ${selectedEl.fontFamily === f ? "border-sky-500 bg-sky-50 text-sky-700" : "border-sky-100 text-sky-600 hover:border-sky-300"}`} style={{ fontFamily: f }}>{f}</button>))}
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-sky-400 w-10">Size</span>
                <input type="range" min={8} max={200} value={selectedEl.fontSize || 20} onChange={e => updateSelected({ fontSize: Number(e.target.value) })} onMouseUp={e => updateSelectedAndHistory({ fontSize: Number((e.target as HTMLInputElement).value) })} className="flex-1 accent-sky-400" />
                <span className="text-xs text-sky-800 w-8 text-right">{selectedEl.fontSize || 20}</span>
              </div>
              <div className="flex gap-2 mb-3">
                <button onClick={() => updateSelectedAndHistory({ fontStyle: selectedEl.fontStyle === "bold" ? "normal" : "bold" })} className={`w-9 h-9 rounded-lg font-bold border transition-all ${selectedEl.fontStyle === "bold" ? "bg-sky-500 border-sky-400 text-white" : "border-sky-200 text-sky-600"}`}>B</button>
                <button onClick={() => updateSelectedAndHistory({ fontStyle: selectedEl.fontStyle === "italic" ? "normal" : "italic" })} className={`w-9 h-9 rounded-lg italic border transition-all ${selectedEl.fontStyle === "italic" ? "bg-sky-500 border-sky-400 text-white" : "border-sky-200 text-sky-600"}`}>I</button>
              </div>
            </div>
          )}
          <div className="p-4 border-b border-sky-50">
            <p className="text-[10px] text-sky-400 uppercase tracking-widest mb-3">Position & Size</p>
            <div className="grid grid-cols-2 gap-3">
              {[{label:"X",key:"x",val:Math.round(selectedEl.x)},{label:"Y",key:"y",val:Math.round(selectedEl.y)},{label:"W",key:"width",val:Math.round(selectedEl.width||0)},{label:"H",key:"height",val:Math.round(selectedEl.height||0)}].map(({label,key,val}) => (
                <div key={key} className="flex items-center gap-2 bg-sky-50 rounded-lg px-2 py-1.5">
                  <span className="text-[10px] text-sky-400 w-4">{label}</span>
                  <input type="number" value={val} onChange={e => updateSelected({ [key]: Number(e.target.value) })} onBlur={e => updateSelectedAndHistory({ [key]: Number(e.target.value) })} className="flex-1 bg-transparent text-sky-800 text-xs outline-none w-0" />
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-sky-400 w-14">Rotation</span>
              <input type="range" min={0} max={360} value={selectedEl.rotation || 0} onChange={e => updateSelected({ rotation: Number(e.target.value) })} onMouseUp={e => updateSelectedAndHistory({ rotation: Number((e.target as HTMLInputElement).value) })} className="flex-1 accent-sky-400" />
              <span className="text-xs text-sky-800 w-8 text-right">{Math.round(selectedEl.rotation || 0)}°</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-sky-400 w-14">Opacity</span>
              <input type="range" min={0} max={1} step={0.01} value={selectedEl.opacity ?? 1} onChange={e => updateSelected({ opacity: Number(e.target.value) })} onMouseUp={e => updateSelectedAndHistory({ opacity: Number((e.target as HTMLInputElement).value) })} className="flex-1 accent-sky-400" />
              <span className="text-xs text-sky-800 w-8 text-right">{Math.round((selectedEl.opacity ?? 1) * 100)}%</span>
            </div>
          </div>
          <div className={`p-4 border-b border-sky-50 ${selectedEl.type === "icon" ? "hidden" : ""}`}>
            <p className="text-[10px] text-sky-400 uppercase tracking-widest mb-3">Color</p>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTE.map(c => (<button key={c} onClick={() => updateSelectedAndHistory(selectedEl.type === "icon" ? { stroke: c } : { fill: c })} className={`w-7 h-7 rounded-full border-2 hover:scale-110 transition-all ${selectedEl.fill === c ? "border-sky-500 ring-2 ring-sky-300/50" : "border-transparent"}`} style={{ backgroundColor: c }} />))}
              <div className="flex items-center gap-2 mt-1"><span className="text-xs text-sky-400">Custom</span><input type="color" value={selectedEl.type === "icon" ? (selectedEl.stroke || "#4badd4") : (selectedEl.fill || "#ffffff")} onChange={e => updateSelectedAndHistory(selectedEl.type === "icon" ? { stroke: e.target.value } : { fill: e.target.value })} className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent" /></div>
            </div>
          </div>
{selectedEl.type === "icon" && (
  <div className="p-4 border-b border-sky-50">
    <p className="text-[10px] text-sky-400 uppercase tracking-widest mb-3">Icon Color</p>
    <div className="flex flex-wrap gap-2">
      {COLOR_PALETTE.map(c => (
        <button key={c} onClick={() => updateSelectedAndHistory({ stroke: c })}
          className={`w-7 h-7 rounded-full border-2 hover:scale-110 transition-all ${selectedEl.stroke === c ? "border-sky-500 ring-2 ring-sky-300/50" : "border-transparent"}`}
          style={{ backgroundColor: c }} />
      ))}
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-sky-400">Custom</span>
        <input type="color" value={selectedEl.stroke || "#4badd4"}
          onChange={e => updateSelectedAndHistory({ stroke: e.target.value })}
          className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent" />
      </div>
    </div>
  </div>
)}

{selectedEl.type === "icon" && (
  <div className="p-4 border-b border-sky-50">
    <p className="text-[10px] text-sky-400 uppercase tracking-widest mb-3">Icon Fill</p>
    <div className="flex flex-wrap gap-2">
      {/* "None" button */}
      <button onClick={() => updateSelectedAndHistory({ fill: "none" })}
        className={`w-7 h-7 rounded-full border-2 hover:scale-110 transition-all text-[9px] text-sky-400 ${selectedEl.fill === "none" ? "border-sky-500" : "border-sky-100"}`}>
        ∅
      </button>
      {COLOR_PALETTE.map(c => (
        <button key={c} onClick={() => updateSelectedAndHistory({ fill: c })}
          className={`w-7 h-7 rounded-full border-2 hover:scale-110 transition-all ${selectedEl.fill === c ? "border-sky-500 ring-2 ring-sky-300/50" : "border-transparent"}`}
          style={{ backgroundColor: c }} />
      ))}
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-sky-400">Custom</span>
        <input type="color" value={selectedEl.fill === "none" ? "#ffffff" : (selectedEl.fill || "#ffffff")}
          onChange={e => updateSelectedAndHistory({ fill: e.target.value })}
          className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent" />
      </div>
    </div>
  </div>
)}

          <div className="p-4">
            <p className="text-[10px] text-sky-400 uppercase tracking-widest mb-3">Layer</p>
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
              {[...elements].reverse().map(el => (
                <div key={el.id} onClick={() => setSelectedId(el.id)} className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs transition-all ${el.id === selectedId ? "bg-sky-100 border border-sky-300 text-sky-700" : "hover:bg-sky-50 text-sky-600"}`}>
                  <span className="flex items-center gap-2"><span className="text-sky-400">{el.type === "text" ? "T" : "□"}</span>{el.type === "text" ? (el.text?.slice(0, 16) || "Text") : el.type.charAt(0).toUpperCase() + el.type.slice(1)}</span>
                  <span className="w-2 h-2 rounded-full bg-sky-400/60" />
                </div>
              ))}
            </div>
            {selectedEl && (
              <div className="flex gap-2 mt-3">
                <button onClick={() => { const copy = { ...selectedEl, id: uid(), x: selectedEl.x + 20, y: selectedEl.y + 20 }; pushHistory([...elements, copy]); }} className="flex-1 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-xs text-sky-600 transition-all border border-sky-100">Dupe</button>
                <button onClick={() => { const idx = elements.findIndex(e => e.id === selectedId); if (idx <= 0) return; const arr = [...elements]; [arr[idx-1], arr[idx]] = [arr[idx], arr[idx-1]]; pushHistory(arr); }} className="flex-1 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-xs text-sky-600 transition-all border border-sky-100">↑</button>
                <button onClick={() => { const idx = elements.findIndex(e => e.id === selectedId); if (idx >= elements.length - 1) return; const arr = [...elements]; [arr[idx], arr[idx+1]] = [arr[idx+1], arr[idx]]; pushHistory(arr); }} className="flex-1 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-xs text-sky-600 transition-all border border-sky-100">↓</button>
                <button onClick={() => { pushHistory(elements.filter(e => e.id !== selectedId)); setSelectedId(null); }} className="flex-1 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-xs text-red-500 transition-all border border-red-100">✕</button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-sky-300 gap-3 p-8 text-center">
          {activeTool === "draw" ? (
            <>
              <span className="text-4xl">✏️</span>
              <p className="text-sm text-sky-400 font-semibold">Draw Mode Active</p>
              <p className="text-xs text-sky-300">Click and drag on the canvas to draw.</p>
              <div className="mt-3 flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between bg-sky-50 rounded-lg px-3 py-2 border border-sky-100"><span className="text-xs text-sky-500">Brush Color</span><div className="w-6 h-6 rounded-full border border-sky-200" style={{ backgroundColor: drawColor }} /></div>
                <div className="flex items-center justify-between bg-sky-50 rounded-lg px-3 py-2 border border-sky-100"><span className="text-xs text-sky-500">Brush Size</span><span className="text-xs text-sky-700 font-mono">{drawSize}px</span></div>
                <div className="flex items-center justify-between bg-sky-50 rounded-lg px-3 py-2 border border-sky-100"><span className="text-xs text-sky-500">Strokes</span><span className="text-xs text-sky-700 font-mono">{drawStrokes.length}</span></div>
              </div>
            </>
          ) : (
            <>
              <span className="text-4xl">◱</span>
              <p className="text-sm text-sky-400">Select an element to edit properties</p>
              <p className="text-xs text-sky-300 mt-2">Double-click any text to edit directly</p>
            </>
          )}
        </div>
      )}
    </div>
  );



  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-sky-50 text-sky-900 select-none font-sans overflow-hidden" style={{ fontFamily: "'DM Sans', 'Outfit', sans-serif" }}>
      {/* TOP NAVBAR */}
      <nav className="flex items-center justify-between px-5 py-2.5 bg-white border-b border-sky-100 z-30 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-sky-700 flex items-center justify-center shadow-lg shadow-sky-300/40">
              <span className="text-white text-xs font-black">L</span>
            </div>
            <span className="text-sky-900 font-light text-lg tracking-wide"><em className="text-sky-500 not-italic font-semibold">Lave</em> Mineral</span>
          </div>
          <div className="w-px h-5 bg-sky-100 mx-2" />
          <span className="text-sky-500 text-sm">Label Designer</span>
          {activeTool === "draw" && <div className="flex items-center gap-1.5 bg-violet-100 text-violet-600 rounded-full px-3 py-1 text-[11px] font-semibold"><span>✏️</span> Draw Mode</div>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={undo} title="Undo (Ctrl+Z)" className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-sky-50 text-sky-400 hover:text-sky-600 transition-all text-lg disabled:opacity-30" disabled={historyIdx <= 0}>↩</button>
          <button onClick={redo} title="Redo (Ctrl+Y)" className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-sky-50 text-sky-400 hover:text-sky-600 transition-all text-lg disabled:opacity-30" disabled={historyIdx >= history.length - 1}>↪</button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShow3D(true)} className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-semibold hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg shadow-sky-300/40"><span>✦</span> 3D Preview</button>
          <button onClick={exportPNG} className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-white text-sm font-bold hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg shadow-amber-300/40">↓ Export PNG</button>
        </div>
      </nav>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR */}
        <div className="w-[72px] bg-white border-r border-sky-100 flex flex-col items-center py-3 gap-1 z-20 shrink-0 shadow-sm">
          <SidebarBtn icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="3" /><path d="M7 7h4v4H7zM13 7h4v4h-4zM7 13h4v4H7zM13 13h4v4h-4z" /></svg>} label="Templates" active={activeTool === "templates"} onClick={() => setActiveTool(activeTool === "templates" ? "select" : "templates")} />
          <SidebarBtn icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12,2 22,20 2,20" /><circle cx="12" cy="14" r="1" /></svg>} label="Elements" active={activeTool === "elements"} onClick={() => setActiveTool(activeTool === "elements" ? "select" : "elements")} />
          <SidebarBtn icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 6h16M4 12h16M4 18h10" /></svg>} label="Text" active={activeTool === "text"} onClick={() => setActiveTool(activeTool === "text" ? "select" : "text")} />
          <SidebarBtn icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>} label="Upload" active={activeTool === "upload"} onClick={() => setActiveTool(activeTool === "upload" ? "select" : "upload")} />
          <SidebarBtn icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" opacity="0.15" /><path d="M3 9h18M9 21V9" /></svg>} label="BG" active={activeTool === "bg"} onClick={() => setActiveTool(activeTool === "bg" ? "select" : "bg")} />
          <SidebarBtn icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z" /><circle cx="5" cy="5" r="1" fill="currentColor" /><circle cx="19" cy="19" r="1" fill="currentColor" /></svg>} label="AI" active={activeTool === "ai"} onClick={() => setActiveTool(activeTool === "ai" ? "select" : "ai")} />
          <div className="flex-1" />
          <SidebarBtn icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" /></svg>} label="Select" active={activeTool === "select"} onClick={() => setActiveTool("select")} />
          <SidebarBtn icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 21l1.09-3.26a2 2 0 01.49-.77l13-13a2 2 0 012.83 0l1.62 1.62a2 2 0 010 2.83l-13 13a2 2 0 01-.77.49L2 21z" /><path d="M16 5l3 3" /></svg>} label="Draw" active={activeTool === "draw"} onClick={() => { setActiveTool(activeTool === "draw" ? "select" : "draw"); setSelectedId(null); }} />
        </div>

        {/* SECONDARY PANEL */}
        {["templates", "elements", "text", "upload", "bg"].includes(activeTool) && <SecondaryPanel />}
        {activeTool === "ai" && <AIPanel aiPrompt={aiPrompt} setAiPrompt={setAiPrompt} aiLoading={aiLoading} aiError={aiError} aiResults={aiResults} aiGenerated={aiGenerated} onGenerate={generateAILabel} onReset={() => { setAiGenerated(false); setAiResults([]); setAiError(null); }} onApply={applyAIDesign} onClose={() => setActiveTool("select")} />}
        {activeTool === "draw" && <DrawToolbar drawColor={drawColor} setDrawColor={setDrawColor} drawSize={drawSize} setDrawSize={setDrawSize} onClear={() => setDrawStrokes([])} onClose={() => setActiveTool("select")} />}

        {/* CANVAS AREA */}
        <div className="flex-1 flex flex-col overflow-hidden bg-sky-50"
          onMouseMove={e => { const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect(); setMousePos({ x: Math.round((e.clientX - rect.left) / scale), y: Math.round((e.clientY - rect.top) / scale) }); }}>
          <div className="flex items-center justify-between px-4 py-2 border-b border-sky-100 bg-white/80 shrink-0">
            <div className="flex gap-4"><button className="text-sm font-semibold text-sky-700 border-b-2 border-sky-400 pb-1">Design</button></div>
            <span className="text-xs text-sky-400 font-mono">{mousePos.x}, {mousePos.y}</span>
          </div>
          <div className="flex-1 overflow-auto flex items-center justify-center" style={{ padding: borderSize, backgroundImage: "radial-gradient(circle, rgba(14,165,233,0.12) 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
            <div ref={canvasWrapperRef} className="shadow-2xl shadow-sky-200/60 rounded-sm relative" style={{ width: canvasW, height: canvasH, ...bgStyle, cursor: activeTool === "draw" ? "crosshair" : "default" }}>
              <SVGCanvas
                svgRef={svgRef}
                width={canvasW}
                height={canvasH}
                scale={scale}
                elements={elements}
                drawStrokes={drawStrokes}
                currentStroke={currentStroke}
                selectedId={selectedId}
                editingTextId={editingTextId}
                activeTool={activeTool}
                onSelectElement={setSelectedId}
                onDeselect={() => setSelectedId(null)}
                onElementDragEnd={(id, x, y) => {
                    pushHistory(elementsRef.current.map(e => e.id === id ? {...e, x, y} : e));
                 }}
                onElementTransformEnd={(id, patch) => pushHistory(
                   elementsRef.current.map(e => e.id === id ? {...e, ...patch} : e)
                  )}
                onTextDblClick={startInlineTextEdit}
                onDrawStart={handleDrawMouseDown}
                onDrawMove={handleDrawMouseMove}
                onDrawEnd={handleDrawMouseUp}
                onElementDelete={(id) => {   // ← ADD THIS BLOCK
                  pushHistory(elementsRef.current.filter(e => e.id !== id));
                  setSelectedId(null);
               }}
/>
              <div onMouseDown={startCanvasResize("e")} className="absolute top-0 right-[-6px] w-3 h-full cursor-ew-resize z-10 flex items-center justify-center group"><div className="w-1.5 h-12 rounded-full bg-sky-300/70 group-hover:bg-sky-500 transition-colors shadow-sm" /></div>
              <div onMouseDown={startCanvasResize("s")} className="absolute bottom-[-6px] left-0 h-3 w-full cursor-ns-resize z-10 flex items-center justify-center group"><div className="h-1.5 w-12 rounded-full bg-sky-300/70 group-hover:bg-sky-500 transition-colors shadow-sm" /></div>
              <div onMouseDown={startCanvasResize("se")} className="absolute bottom-[-8px] right-[-8px] w-5 h-5 cursor-nwse-resize z-20 flex items-center justify-center group"><div className="w-3 h-3 rounded-sm bg-sky-400 group-hover:bg-sky-600 transition-colors shadow-md border-2 border-white" /></div>
            </div>
          </div>
          {/* Bottom toolbar */}
          <div className="flex items-center justify-center gap-3 py-2 border-t border-sky-100 bg-white/80 shrink-0 flex-wrap px-4">
            <div className="flex items-center gap-1.5">
              <button onClick={() => setZoom(z => Math.max(25, z - 10))} className="w-7 h-7 flex items-center justify-center rounded-full bg-sky-50 hover:bg-sky-100 text-sky-600 text-sm transition-all border border-sky-100">−</button>
              <span className="text-xs text-sky-700 font-mono w-12 text-center">{zoom}%</span>
              <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="w-7 h-7 flex items-center justify-center rounded-full bg-sky-50 hover:bg-sky-100 text-sky-600 text-sm transition-all border border-sky-100">+</button>
              <button onClick={() => setZoom(100)} className="text-xs text-sky-400 hover:text-sky-600 transition-colors">Reset</button>
            </div>
            <div className="w-px h-5 bg-sky-100" />
            <div className="flex items-center gap-1.5 bg-sky-50 rounded-lg px-3 py-1 border border-sky-100">
              <span className="text-[10px] text-sky-500 font-mono">{canvasBaseW} × {canvasBaseH}</span>
              <span className="text-[10px] text-sky-300">px</span>
            </div>
            <div className="w-px h-5 bg-sky-100" />
            <div className="flex items-center gap-2 bg-sky-50 rounded-lg px-2 py-1 border border-sky-100">
              <span className="text-[10px] text-sky-400 font-semibold uppercase tracking-wide">Border</span>
              <input type="range" min={0} max={120} step={4} value={borderSize} onChange={e => setBorderSize(Number(e.target.value))} className="w-20 accent-sky-400" />
              <span className="text-[10px] text-sky-700 font-mono w-7 text-right">{borderSize}px</span>
            </div>
            {activeTool === "draw" && drawStrokes.length > 0 && (
              <><div className="w-px h-5 bg-sky-100" /><button onClick={() => setDrawStrokes([])} className="px-3 py-1 rounded-lg bg-red-50 text-red-400 text-xs font-semibold border border-red-100 hover:bg-red-100 transition-all">🗑 Clear Drawings</button></>
            )}
          </div>
        </div>

        {/* RIGHT PROPERTIES PANEL */}
        <PropertiesPanel />
      </div>

      {show3D && <Preview3D />}
    </div>
  );
}