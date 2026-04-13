"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  Stage,
  Layer,
  Rect,
  Text,
  Transformer,
  Image as KonvaImage,
  Circle,
  Line,
  RegularPolygon,
  Star,
  Arrow,
} from "react-konva";
import Konva from "konva";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tool =
  | "select"
  | "draw"
  | "templates"
  | "elements"
  | "text"
  | "upload"
  | "bg";

interface CanvasElement {
  id: string;
  type:
    | "rect"
    | "text"
    | "circle"
    | "line"
    | "image"
    | "triangle"
    | "star"
    | "pentagon"
    | "hexagon"
    | "octagon"
    | "arrow"
    | "heart"
    | "diamond"
    | "cross"
    | "ellipse";
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
}

interface HistoryState {
  elements: CanvasElement[];
}

const COLOR_PALETTE = [
  "#0a0a0a",
  "#ffffff",
  "#e8e8e8",
  "#4badd4",
  "#1a6fa8",
  "#f5c842",
  "#f0e030",
  "#e84040",
  "#e87830",
  "#2ecc71",
  "#9b59b6",
  "#cc3333",
  "#555566",
  "#334455",
];

const FONT_FAMILIES = [
  "Outfit",
  "DM Sans",
  "Mono",
  "Cursive",
  "Georgia",
  "Trebuchet MS",
  "Palatino",
];

const TEMPLATE_DESIGNS = [
  {
    id: "t1",
    name: "Classic Blue",
    elements: [
      {
        id: "e1",
        type: "rect" as const,
        x: 20,
        y: 20,
        width: 460,
        height: 560,
        fill: "#d6eef8",
        stroke: "#1a6fa8",
        strokeWidth: 4,
        rotation: 0,
        opacity: 1,
        draggable: true,
      },
      {
        id: "e2",
        type: "text" as const,
        x: 60,
        y: 80,
        text: "LAVE",
        fontSize: 96,
        fontFamily: "Georgia",
        fill: "#1a5f8a",
        rotation: 0,
        opacity: 1,
        draggable: true,
        fontStyle: "bold",
      },
      {
        id: "e3",
        type: "text" as const,
        x: 80,
        y: 200,
        text: "MINERAL WATER",
        fontSize: 22,
        fontFamily: "Outfit",
        fill: "#2a7fb0",
        rotation: 0,
        opacity: 1,
        draggable: true,
        letterSpacing: 6,
      },
      {
        id: "e4",
        type: "rect" as const,
        x: 80,
        y: 240,
        width: 340,
        height: 2,
        fill: "#1a6fa8",
        stroke: "",
        strokeWidth: 0,
        rotation: 0,
        opacity: 0.5,
        draggable: true,
      },
      {
        id: "e5",
        type: "text" as const,
        x: 80,
        y: 260,
        text: "PURE · NATURAL · REFRESHING®",
        fontSize: 14,
        fontFamily: "Outfit",
        fill: "#1a6fa8",
        rotation: 0,
        opacity: 0.8,
        draggable: true,
        letterSpacing: 2,
      },
    ],
  },
  {
    id: "t2",
    name: "Minimal White",
    elements: [
      {
        id: "e1",
        type: "rect" as const,
        x: 20,
        y: 20,
        width: 460,
        height: 560,
        fill: "#ffffff",
        stroke: "#cccccc",
        strokeWidth: 2,
        rotation: 0,
        opacity: 1,
        draggable: true,
      },
      {
        id: "e2",
        type: "text" as const,
        x: 100,
        y: 120,
        text: "LAVE",
        fontSize: 80,
        fontFamily: "DM Sans",
        fill: "#1a1a2e",
        rotation: 0,
        opacity: 1,
        draggable: true,
      },
      {
        id: "e3",
        type: "text" as const,
        x: 80,
        y: 220,
        text: "MINERAL WATER",
        fontSize: 18,
        fontFamily: "DM Sans",
        fill: "#555577",
        rotation: 0,
        opacity: 1,
        draggable: true,
      },
    ],
  },
  {
    id: "t3",
    name: "Elegant Dark",
    elements: [
      {
        id: "e1",
        type: "rect" as const,
        x: 20,
        y: 20,
        width: 460,
        height: 560,
        fill: "#0d1b2a",
        stroke: "#f5c842",
        strokeWidth: 3,
        rotation: 0,
        opacity: 1,
        draggable: true,
      },
      {
        id: "e2",
        type: "text" as const,
        x: 80,
        y: 120,
        text: "LAVE",
        fontSize: 90,
        fontFamily: "Georgia",
        fill: "#f5c842",
        rotation: 0,
        opacity: 1,
        draggable: true,
      },
      {
        id: "e3",
        type: "text" as const,
        x: 80,
        y: 230,
        text: "MINERAL WATER",
        fontSize: 20,
        fontFamily: "Outfit",
        fill: "#ffffff",
        rotation: 0,
        opacity: 0.9,
        draggable: true,
      },
    ],
  },
  {
    id: "t4",
    name: "Nature Fresh",
    elements: [
      {
        id: "e1",
        type: "rect" as const,
        x: 20,
        y: 20,
        width: 460,
        height: 560,
        fill: "#e8f5e9",
        stroke: "#2ecc71",
        strokeWidth: 3,
        rotation: 0,
        opacity: 1,
        draggable: true,
      },
      {
        id: "e2",
        type: "text" as const,
        x: 100,
        y: 100,
        text: "LAVE",
        fontSize: 80,
        fontFamily: "Georgia",
        fill: "#2e7d32",
        fontStyle: "bold",
        rotation: 0,
        opacity: 1,
        draggable: true,
      },
      {
        id: "e3",
        type: "text" as const,
        x: 110,
        y: 200,
        text: "NATURAL WATER",
        fontSize: 20,
        fontFamily: "Outfit",
        fill: "#388e3c",
        rotation: 0,
        opacity: 1,
        draggable: true,
      },
    ],
  },
  {
    id: "t5",
    name: "Aqua Wave",
    elements: [
      {
        id: "e1",
        type: "rect" as const,
        x: 20,
        y: 20,
        width: 460,
        height: 560,
        fill: "#d0f0ff",
        stroke: "",
        strokeWidth: 0,
        rotation: 0,
        opacity: 1,
        draggable: true,
      },
      {
        id: "e2",
        type: "text" as const,
        x: 80,
        y: 120,
        text: "LAVE",
        fontSize: 85,
        fontFamily: "Trebuchet MS",
        fill: "#0288d1",
        fontStyle: "bold",
        rotation: 0,
        opacity: 1,
        draggable: true,
      },
      {
        id: "e3",
        type: "text" as const,
        x: 80,
        y: 250,
        text: "PURE WATER",
        fontSize: 18,
        fontFamily: "Outfit",
        fill: "#01579b",
        rotation: 0,
        opacity: 1,
        draggable: true,
      },
    ],
  },
  {
    id: "t6",
    name: "Luxury Gold",
    elements: [
      {
        id: "e1",
        type: "rect" as const,
        x: 20,
        y: 20,
        width: 460,
        height: 560,
        fill: "#000000",
        stroke: "#f5c842",
        strokeWidth: 3,
        rotation: 0,
        opacity: 1,
        draggable: true,
      },
      {
        id: "e2",
        type: "text" as const,
        x: 90,
        y: 140,
        text: "LAVE",
        fontSize: 90,
        fontFamily: "Georgia",
        fill: "#f5c842",
        fontStyle: "bold",
        rotation: 0,
        opacity: 1,
        draggable: true,
      },
      {
        id: "e3",
        type: "text" as const,
        x: 120,
        y: 260,
        text: "PREMIUM WATER",
        fontSize: 18,
        fontFamily: "Outfit",
        fill: "#ffffff",
        rotation: 0,
        opacity: 1,
        draggable: true,
      },
    ],
  },
  {
    id: "t7",
    name: "Fruity Splash",
    elements: [
      {
        id: "e1",
        type: "rect" as const,
        x: 20,
        y: 20,
        width: 460,
        height: 560,
        fill: "#ffe5e5",
        stroke: "",
        strokeWidth: 0,
        rotation: 0,
        opacity: 1,
        draggable: true,
      },
      {
        id: "e2",
        type: "text" as const,
        x: 80,
        y: 260,
        text: "LAVE",
        fontSize: 75,
        fontFamily: "Cursive",
        fill: "#b71c1c",
        rotation: 0,
        opacity: 1,
        draggable: true,
      },
      {
        id: "e3",
        type: "text" as const,
        x: 120,
        y: 330,
        text: "FLAVORED WATER",
        fontSize: 16,
        fontFamily: "Outfit",
        fill: "#d32f2f",
        rotation: 0,
        opacity: 1,
        draggable: true,
      },
    ],
  },
  {
    id: "t8",
    name: "Ice Cool",
    elements: [
      {
        id: "e1",
        type: "rect" as const,
        x: 20,
        y: 20,
        width: 460,
        height: 560,
        fill: "#e1f5fe",
        stroke: "",
        strokeWidth: 0,
        rotation: 0,
        opacity: 1,
        draggable: true,
      },
      {
        id: "e2",
        type: "text" as const,
        x: 90,
        y: 120,
        text: "LAVE",
        fontSize: 85,
        fontFamily: "DM Sans",
        fill: "#01579b",
        fontStyle: "bold",
        rotation: 0,
        opacity: 1,
        draggable: true,
      },
      {
        id: "e3",
        type: "text" as const,
        x: 100,
        y: 220,
        text: "ICE WATER",
        fontSize: 20,
        fontFamily: "Outfit",
        fill: "#0277bd",
        rotation: 0,
        opacity: 1,
        draggable: true,
      },
    ],
  },
  {
    id: "t9",
    name: "Sunset",
    elements: [
      {
        id: "e1",
        type: "rect" as const,
        x: 20,
        y: 20,
        width: 460,
        height: 560,
        fill: "#ffcc80",
        stroke: "",
        strokeWidth: 0,
        rotation: 0,
        opacity: 1,
        draggable: true,
      },
      {
        id: "e2",
        type: "text" as const,
        x: 100,
        y: 140,
        text: "LAVE",
        fontSize: 80,
        fontFamily: "Georgia",
        fill: "#e65100",
        fontStyle: "bold",
        rotation: 0,
        opacity: 1,
        draggable: true,
      },
      {
        id: "e3",
        type: "text" as const,
        x: 120,
        y: 240,
        text: "SUNSET WATER",
        fontSize: 18,
        fontFamily: "Outfit",
        fill: "#bf360c",
        rotation: 0,
        opacity: 1,
        draggable: true,
      },
    ],
  },
];

const SHAPES_CATALOG = [
  { id: "rect", label: "Rectangle", icon: "▬", category: "Basic" },
  { id: "square", label: "Square", icon: "■", category: "Basic" },
  { id: "circle", label: "Circle", icon: "●", category: "Basic" },
  { id: "ellipse", label: "Ellipse", icon: "⬭", category: "Basic" },
  { id: "triangle", label: "Triangle", icon: "▲", category: "Basic" },
  { id: "right-triangle", label: "Right Triangle", icon: "◥", category: "Basic" },
  { id: "diamond", label: "Diamond", icon: "◆", category: "Basic" },
  { id: "pentagon", label: "Pentagon", icon: "⬠", category: "Basic" },
  { id: "hexagon", label: "Hexagon", icon: "⬡", category: "Basic" },
  { id: "heptagon", label: "Heptagon", icon: "⬡", category: "Basic" },
  { id: "octagon", label: "Octagon", icon: "⯃", category: "Basic" },
  { id: "decagon", label: "Decagon", icon: "⬟", category: "Basic" },
  { id: "star4", label: "Star 4pt", icon: "✦", category: "Stars" },
  { id: "star5", label: "Star 5pt", icon: "★", category: "Stars" },
  { id: "star6", label: "Star 6pt", icon: "✶", category: "Stars" },
  { id: "star8", label: "Star 8pt", icon: "✴", category: "Stars" },
  { id: "star12", label: "Star 12pt", icon: "✳", category: "Stars" },
  { id: "starburst", label: "Starburst", icon: "✸", category: "Stars" },
  { id: "arrow-right", label: "Arrow →", icon: "→", category: "Arrows" },
  { id: "arrow-left", label: "Arrow ←", icon: "←", category: "Arrows" },
  { id: "arrow-up", label: "Arrow ↑", icon: "↑", category: "Arrows" },
  { id: "arrow-down", label: "Arrow ↓", icon: "↓", category: "Arrows" },
  { id: "double-arrow", label: "Double →", icon: "↔", category: "Arrows" },
  { id: "line-h", label: "H Line", icon: "─", category: "Lines" },
  { id: "line-v", label: "V Line", icon: "│", category: "Lines" },
  { id: "line-d1", label: "Diag /", icon: "╱", category: "Lines" },
  { id: "line-d2", label: "Diag \\", icon: "╲", category: "Lines" },
  { id: "heart", label: "Heart", icon: "♥", category: "Symbols" },
  { id: "heart-outline", label: "Heart ○", icon: "♡", category: "Symbols" },
  { id: "cross", label: "Cross +", icon: "✚", category: "Symbols" },
  { id: "cloud", label: "Cloud", icon: "☁", category: "Symbols" },
  { id: "water-drop", label: "Drop", icon: "💧", category: "Symbols" },
  { id: "rounded-rect", label: "Rounded Rect", icon: "▢", category: "Badges" },
  { id: "pill", label: "Pill", icon: "⬬", category: "Badges" },
  { id: "frame-square", label: "Sq Frame", icon: "□", category: "Frames" },
  { id: "frame-circle", label: "Circ Frame", icon: "○", category: "Frames" },
  { id: "frame-diamond", label: "Dia Frame", icon: "◇", category: "Frames" },
  { id: "semicircle", label: "Semicircle", icon: "◗", category: "Decorative" },
  { id: "chevron", label: "Chevron", icon: "›", category: "Decorative" },
];

const SHAPE_CATEGORIES = [
  "All",
  "Basic",
  "Stars",
  "Arrows",
  "Lines",
  "Symbols",
  "Badges",
  "Frames",
  "Decorative",
];

const BOTTLE_SHAPES = [
  {
    id: "Square",
    label: "Square",
    src: "/bottles/SquareShape.png",
    labelTop: "38%",
    labelLeft: "14%",
    labelWidth: "72%",
    labelHeight: "32%",
    perspectiveStrength: 20,
  },
  {
    id: "Pyramid",
    label: "Pyramid",
    src: "/bottles/PyramidShape.png",
    labelTop: "36%",
    labelLeft: "18%",
    labelWidth: "62%",
    labelHeight: "30%",
    perspectiveStrength: 25,
  },
  {
    id: "Zen",
    label: "Zen",
    src: "/bottles/ZenShape.png",
    labelTop: "38%",
    labelLeft: "22%",
    labelWidth: "56%",
    labelHeight: "24%",
    perspectiveStrength: 15,
  },
  {
    id: "Round",
    label: "Round",
    src: "/bottles/RoundShape.png",
    labelTop: "36%",
    labelLeft: "12%",
    labelWidth: "76%",
    labelHeight: "30%",
    perspectiveStrength: 30,
  },
  {
    id: "Peace",
    label: "Peace",
    src: "/bottles/PeaceShape.png",
    labelTop: "34%",
    labelLeft: "18%",
    labelWidth: "64%",
    labelHeight: "34%",
    perspectiveStrength: 20,
  },
];

const TEMPLATE_BG: Record<string, CSSProperties> = {
  t1: { background: "#d6eef8" },
  t2: { background: "#ffffff" },
  t3: { background: "#0d1b2a" },
  t4: { background: "#e8f5e9" },
  t5: { background: "#d0f0ff" },
  t6: { background: "#000000" },
  t7: { background: "#ffe5e5" },
  t8: { background: "#e1f5fe" },
  t9: { background: "#ffcc80" },
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function Tooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 px-2 py-1 rounded bg-sky-900 text-white text-xs whitespace-nowrap shadow-xl pointer-events-none">
          {label}
        </div>
      )}
    </div>
  );
}

function SidebarBtn({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip label={label}>
      <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-200 gap-1 group
          ${
            active
              ? "bg-sky-400/20 text-sky-600 ring-1 ring-sky-400/60"
              : "text-sky-700 hover:bg-sky-100 hover:text-sky-600"
          }`}
      >
        <span className="text-lg">{icon}</span>
        <span className="text-[9px] font-medium tracking-wide uppercase">
          {label}
        </span>
      </button>
    </Tooltip>
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
  const [, setRotating] = useState(true);
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

  const canvasW = Math.round(canvasBaseW * (zoom / 100));
  const canvasH = Math.round(canvasBaseH * (zoom / 100));
  const scale = zoom / 100;

  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  const elementsRef = useRef(elements);
  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  const pushHistory = useCallback(
    (newElems: CanvasElement[]) => {
      setHistory((prev) => {
        const next = prev.slice(0, historyIdx + 1);
        next.push({ elements: newElems });
        return next;
      });
      setHistoryIdx((prev) => prev + 1);
      setElements(newElems);
    },
    [historyIdx]
  );

  const undo = useCallback(() => {
    if (historyIdx <= 0) return;
    const prev = historyIdx - 1;
    setHistoryIdx(prev);
    setElements(history[prev].elements);
    setSelectedId(null);
  }, [history, historyIdx]);

  const redo = useCallback(() => {
    if (historyIdx >= history.length - 1) return;
    const next = historyIdx + 1;
    setHistoryIdx(next);
    setElements(history[next].elements);
  }, [history, historyIdx]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (editingTextId) return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }

      if (e.key === "Delete" && selectedId) {
        const newElems = elementsRef.current.filter((el) => el.id !== selectedId);
        pushHistory(newElems);
        setSelectedId(null);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo, selectedId, pushHistory, editingTextId]);

  useEffect(() => {
    if (!trRef.current) return;
    const stage = stageRef.current;
    if (!stage) return;

    if (editingTextId) {
      trRef.current.nodes([]);
      trRef.current.getLayer()?.batchDraw();
      return;
    }

    if (selectedId) {
      const node = stage.findOne(`#${selectedId}`);
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer()?.batchDraw();
      }
    } else {
      trRef.current.nodes([]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId, elements, editingTextId]);

  const startInlineTextEdit = useCallback(
    (elementId: string) => {
      const el = elementsRef.current.find((e) => e.id === elementId);
      if (!el || el.type !== "text") return;
      if (!stageRef.current || !canvasWrapperRef.current) return;

      setEditingTextId(elementId);

      if (trRef.current) {
        trRef.current.nodes([]);
        trRef.current.getLayer()?.batchDraw();
      }

      const stage = stageRef.current;
      const textNode = stage.findOne(`#${elementId}`) as Konva.Text | null;
      if (!textNode) return;

      const stageBox = stage.container().getBoundingClientRect();
      const wrapperBox = canvasWrapperRef.current.getBoundingClientRect();
      const absPos = textNode.getAbsolutePosition();

      const textarea = document.createElement("textarea");
      textarea.value = el.text || "";
      textarea.style.position = "absolute";
      textarea.style.left = `${stageBox.left - wrapperBox.left + absPos.x}px`;
      textarea.style.top = `${stageBox.top - wrapperBox.top + absPos.y}px`;
      textarea.style.width = `${Math.max((el.width || 300) * scale, 120)}px`;
      textarea.style.minHeight = `${(el.fontSize || 20) * scale * 1.4}px`;
      textarea.style.fontSize = `${(el.fontSize || 20) * scale}px`;
      textarea.style.fontFamily = el.fontFamily || "Outfit";
      textarea.style.fontWeight =
        el.fontStyle === "bold" ? "bold" : "normal";
      textarea.style.fontStyle =
        el.fontStyle === "italic" ? "italic" : "normal";
      textarea.style.color = el.fill || "#1a5f8a";
      textarea.style.background = "rgba(255,255,255,0.12)";
      textarea.style.border = "2px dashed rgba(14,165,233,0.8)";
      textarea.style.borderRadius = "3px";
      textarea.style.outline = "none";
      textarea.style.padding = "2px 4px";
      textarea.style.resize = "none";
      textarea.style.overflow = "hidden";
      textarea.style.lineHeight = "1.2";
      textarea.style.zIndex = "1000";
      textarea.style.transformOrigin = "left top";

      if (el.rotation) {
        textarea.style.transform = `rotate(${el.rotation}deg)`;
      }

      textNode.hide();
      stage.batchDraw();

      canvasWrapperRef.current.appendChild(textarea);
      textarea.focus();
      textarea.select();

      const resize = () => {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      };

      textarea.addEventListener("input", resize);
      resize();

      const finishEdit = () => {
        const newText = textarea.value;
        textNode.show();
        stage.batchDraw();

        if (textarea.parentNode) {
          textarea.parentNode.removeChild(textarea);
        }

        const latest = elementsRef.current;
        const newElems = latest.map((e) =>
          e.id === elementId ? { ...e, text: newText } : e
        );

        setHistory((prev) => {
          const cur = prev.slice(0, historyIdx + 1);
          cur.push({ elements: newElems });
          return cur;
        });
        setHistoryIdx((prev) => prev + 1);
        setElements(newElems);
        setEditingTextId(null);
        setSelectedId(elementId);
      };

      textarea.addEventListener("blur", finishEdit);
      textarea.addEventListener("keydown", (e) => {
        if (
          e.key === "Escape" ||
          (e.key === "Enter" && (e.ctrlKey || e.metaKey))
        ) {
          e.preventDefault();
          textarea.blur();
        }
        e.stopPropagation();
      });
    },
    [scale, historyIdx]
  );

  const addText = (preset: "heading" | "sub" | "body") => {
    const configs = {
      heading: {
        text: "Heading Text",
        fontSize: 48,
        fontFamily: "Georgia",
        fill: "#1a5f8a",
        fontStyle: "bold",
      },
      sub: {
        text: "Subheading",
        fontSize: 28,
        fontFamily: "Outfit",
        fill: "#2a7fb0",
        fontStyle: "normal",
      },
      body: {
        text: "Body text goes here",
        fontSize: 16,
        fontFamily: "Outfit",
        fill: "#555577",
        fontStyle: "normal",
      },
    };

    const cfg = configs[preset];
    const el: CanvasElement = {
      id: uid(),
      type: "text",
      x: 80,
      y: 100,
      ...cfg,
      rotation: 0,
      opacity: 1,
      draggable: true,
    };

    pushHistory([...elements, el]);
    setSelectedId(el.id);
  };

  const addShape = (shapeId: string) => {
    const cx = 250;
    const cy = 350;
    let el: CanvasElement;

    switch (shapeId) {
      case "circle":
      case "frame-circle":
      case "semicircle":
        el = {
          id: uid(),
          type: "circle",
          x: cx,
          y: cy,
          radius: 60,
          fill: shapeId === "frame-circle" ? "transparent" : "#4badd4",
          stroke: "#1a6fa8",
          strokeWidth: shapeId === "frame-circle" ? 4 : 2,
          rotation: 0,
          opacity: shapeId === "semicircle" ? 0.7 : 1,
          draggable: true,
        };
        break;

      case "ellipse":
      case "pill":
        el = {
          id: uid(),
          type: "ellipse",
          x: cx - 80,
          y: cy - 30,
          width: shapeId === "pill" ? 180 : 160,
          height: shapeId === "pill" ? 60 : 90,
          fill: "#4badd4",
          stroke: "#1a6fa8",
          strokeWidth: 2,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
        break;

      case "triangle":
        el = {
          id: uid(),
          type: "triangle",
          x: cx,
          y: cy,
          radius: 70,
          sides: 3,
          fill: "#4badd4",
          stroke: "#1a6fa8",
          strokeWidth: 2,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
        break;

      case "right-triangle":
        el = {
          id: uid(),
          type: "triangle",
          x: cx,
          y: cy,
          radius: 70,
          sides: 3,
          fill: "#e84040",
          stroke: "#cc0000",
          strokeWidth: 2,
          rotation: 90,
          opacity: 1,
          draggable: true,
        };
        break;

      case "diamond":
      case "frame-diamond":
      case "water-drop":
        el = {
          id: uid(),
          type: "diamond",
          x: cx,
          y: cy,
          width: 100,
          height: 130,
          fill:
            shapeId === "frame-diamond"
              ? "transparent"
              : shapeId === "water-drop"
              ? "#4badd4"
              : "#f5c842",
          stroke:
            shapeId === "frame-diamond"
              ? "#4badd4"
              : shapeId === "water-drop"
              ? "#1a6fa8"
              : "#d4a800",
          strokeWidth: shapeId === "frame-diamond" ? 4 : 2,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
        break;

      case "pentagon":
        el = {
          id: uid(),
          type: "pentagon",
          x: cx,
          y: cy,
          radius: 65,
          sides: 5,
          fill: "#9b59b6",
          stroke: "#7d3c98",
          strokeWidth: 2,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
        break;

      case "hexagon":
        el = {
          id: uid(),
          type: "hexagon",
          x: cx,
          y: cy,
          radius: 65,
          sides: 6,
          fill: "#2ecc71",
          stroke: "#27ae60",
          strokeWidth: 2,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
        break;

      case "heptagon":
        el = {
          id: uid(),
          type: "hexagon",
          x: cx,
          y: cy,
          radius: 65,
          sides: 7,
          fill: "#e87830",
          stroke: "#d35400",
          strokeWidth: 2,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
        break;

      case "octagon":
        el = {
          id: uid(),
          type: "octagon",
          x: cx,
          y: cy,
          radius: 65,
          sides: 8,
          fill: "#e84040",
          stroke: "#c0392b",
          strokeWidth: 2,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
        break;

      case "decagon":
        el = {
          id: uid(),
          type: "hexagon",
          x: cx,
          y: cy,
          radius: 65,
          sides: 10,
          fill: "#4badd4",
          stroke: "#1a6fa8",
          strokeWidth: 2,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
        break;

      case "star4":
        el = {
          id: uid(),
          type: "star",
          x: cx,
          y: cy,
          numPoints: 4,
          innerRadius: 30,
          outerRadius: 70,
          fill: "#f5c842",
          stroke: "#d4a800",
          strokeWidth: 2,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
        break;

      case "star5":
        el = {
          id: uid(),
          type: "star",
          x: cx,
          y: cy,
          numPoints: 5,
          innerRadius: 30,
          outerRadius: 70,
          fill: "#f5c842",
          stroke: "#d4a800",
          strokeWidth: 2,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
        break;

      case "star6":
        el = {
          id: uid(),
          type: "star",
          x: cx,
          y: cy,
          numPoints: 6,
          innerRadius: 35,
          outerRadius: 70,
          fill: "#e84040",
          stroke: "#cc0000",
          strokeWidth: 2,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
        break;

      case "star8":
        el = {
          id: uid(),
          type: "star",
          x: cx,
          y: cy,
          numPoints: 8,
          innerRadius: 35,
          outerRadius: 70,
          fill: "#9b59b6",
          stroke: "#7d3c98",
          strokeWidth: 2,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
        break;

      case "star12":
        el = {
          id: uid(),
          type: "star",
          x: cx,
          y: cy,
          numPoints: 12,
          innerRadius: 40,
          outerRadius: 70,
          fill: "#2ecc71",
          stroke: "#27ae60",
          strokeWidth: 2,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
        break;

      case "starburst":
        el = {
          id: uid(),
          type: "star",
          x: cx,
          y: cy,
          numPoints: 16,
          innerRadius: 45,
          outerRadius: 70,
          fill: "#f5c842",
          stroke: "#d4a800",
          strokeWidth: 2,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
        break;

      case "arrow-right":
        el = {
          id: uid(),
          type: "arrow",
          x: cx - 80,
          y: cy,
          points: [0, 0, 160, 0],
          fill: "#4badd4",
          stroke: "#1a6fa8",
          strokeWidth: 4,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
        break;

      case "arrow-left":
        el = {
          id: uid(),
          type: "arrow",
          x: cx + 80,
          y: cy,
          points: [0, 0, -160, 0],
          fill: "#4badd4",
          stroke: "#1a6fa8",
          strokeWidth: 4,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
        break;

      case "arrow-up":
        el = {
          id: uid(),
          type: "arrow",
          x: cx,
          y: cy + 80,
          points: [0, 0, 0, -160],
          fill: "#4badd4",
          stroke: "#1a6fa8",
          strokeWidth: 4,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
        break;

      case "arrow-down":
        el = {
          id: uid(),
          type: "arrow",
          x: cx,
          y: cy - 80,
          points: [0, 0, 0, 160],
          fill: "#4badd4",
          stroke: "#1a6fa8",
          strokeWidth: 4,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
        break;

      case "double-arrow":
        el = {
          id: uid(),
          type: "arrow",
          x: cx - 80,
          y: cy,
          points: [0, 0, 160, 0],
          fill: "#4badd4",
          stroke: "#1a6fa8",
          strokeWidth: 4,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
        break;

      case "line-h":
        el = {
          id: uid(),
          type: "line",
          x: cx - 80,
          y: cy,
          points: [0, 0, 160, 0],
          stroke: "#4badd4",
          strokeWidth: 3,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
        break;

      case "line-v":
        el = {
          id: uid(),
          type: "line",
          x: cx,
          y: cy - 80,
          points: [0, 0, 0, 160],
          stroke: "#4badd4",
          strokeWidth: 3,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
        break;

      case "line-d1":
        el = {
          id: uid(),
          type: "line",
          x: cx - 60,
          y: cy - 60,
          points: [0, 0, 120, 120],
          stroke: "#4badd4",
          strokeWidth: 3,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
        break;

      case "line-d2":
        el = {
          id: uid(),
          type: "line",
          x: cx + 60,
          y: cy - 60,
          points: [0, 0, -120, 120],
          stroke: "#4badd4",
          strokeWidth: 3,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
        break;

      case "heart":
      case "heart-outline":
        el = {
          id: uid(),
          type: "heart",
          x: cx,
          y: cy,
          width: 120,
          height: 100,
          fill: shapeId === "heart" ? "#e84040" : "transparent",
          stroke: "#e84040",
          strokeWidth: 2,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
        break;

      case "cross":
        el = {
          id: uid(),
          type: "cross",
          x: cx,
          y: cy,
          width: 120,
          height: 120,
          fill: "#4badd4",
          stroke: "",
          strokeWidth: 0,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
        break;

      case "square":
        el = {
          id: uid(),
          type: "rect",
          x: cx - 60,
          y: cy - 60,
          width: 120,
          height: 120,
          fill: "#4badd4",
          stroke: "#1a6fa8",
          strokeWidth: 2,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
        break;

      case "rounded-rect":
        el = {
          id: uid(),
          type: "rect",
          x: cx - 80,
          y: cy - 40,
          width: 160,
          height: 80,
          fill: "#4badd4",
          stroke: "#1a6fa8",
          strokeWidth: 2,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
        break;

      case "frame-square":
        el = {
          id: uid(),
          type: "rect",
          x: cx - 70,
          y: cy - 70,
          width: 140,
          height: 140,
          fill: "transparent",
          stroke: "#4badd4",
          strokeWidth: 4,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
        break;

      case "chevron":
        el = {
          id: uid(),
          type: "arrow",
          x: cx - 40,
          y: cy,
          points: [0, 0, 80, 0],
          fill: "#4badd4",
          stroke: "#4badd4",
          strokeWidth: 3,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
        break;

      case "cloud":
        el = {
          id: uid(),
          type: "circle",
          x: cx,
          y: cy,
          radius: 55,
          fill: "#e0f2fe",
          stroke: "#7dd3fc",
          strokeWidth: 3,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
        break;

      default:
        el = {
          id: uid(),
          type: "rect",
          x: cx - 80,
          y: cy - 50,
          width: 160,
          height: 100,
          fill: "#4badd4",
          stroke: "#1a6fa8",
          strokeWidth: 2,
          rotation: 0,
          opacity: 1,
          draggable: true,
        };
    }

    pushHistory([...elements, el]);
    setSelectedId(el.id);
  };

  const loadTemplate = (tmpl: (typeof TEMPLATE_DESIGNS)[0]) => {
    const newElems = tmpl.elements.map((e) => ({ ...e, id: uid() }));
    pushHistory(newElems);
    setSelectedId(null);
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setUploadedImages((prev) => [url, ...prev]);
    };
    reader.readAsDataURL(file);
  };

  const addImageToCanvas = (url: string) => {
    const img = new window.Image();
    img.src = url;
    img.onload = () => {
      const el: CanvasElement = {
        id: uid(),
        type: "image",
        x: 60,
        y: 60,
        width: 200,
        height: 150,
        imageUrl: url,
        rotation: 0,
        opacity: 1,
        draggable: true,
      };
      pushHistory([...elements, el]);
      setSelectedId(el.id);
    };
  };

  const selectedEl = elements.find((e) => e.id === selectedId) || null;

  const updateSelected = useCallback(
    (patch: Partial<CanvasElement>) => {
      setElements((prev) =>
        prev.map((e) => (e.id === selectedId ? { ...e, ...patch } : e))
      );
    },
    [selectedId]
  );

  const updateSelectedAndHistory = useCallback(
    (patch: Partial<CanvasElement>) => {
      const newElems = elementsRef.current.map((e) =>
        e.id === selectedId ? { ...e, ...patch } : e
      );
      pushHistory(newElems);
    },
    [selectedId, pushHistory]
  );

  const drawBgToCanvas = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.fillStyle = bgPrimary;
      ctx.fillRect(0, 0, w, h);

      switch (bgPattern) {
        case 1: {
          const g = ctx.createLinearGradient(0, 0, w, h);
          g.addColorStop(0, bgPrimary);
          g.addColorStop(1, "#1a6fa8");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
          break;
        }
        case 2: {
          const g = ctx.createRadialGradient(
            w / 2,
            h / 2,
            0,
            w / 2,
            h / 2,
            Math.max(w, h) / 2
          );
          g.addColorStop(0, bgPrimary);
          g.addColorStop(1, "#0d1b2a");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
          break;
        }
        case 6: {
          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, "#ffffff");
          g.addColorStop(1, bgPrimary);
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
          break;
        }
      }
    },
    [bgPrimary, bgPattern]
  );

  const exportPNG = useCallback(() => {
    if (!stageRef.current) return;

    const stageCanvas = stageRef.current.toCanvas({ pixelRatio: 2 });
    const out = document.createElement("canvas");
    out.width = stageCanvas.width;
    out.height = stageCanvas.height;

    const ctx = out.getContext("2d");
    if (!ctx) return;

    drawBgToCanvas(ctx, out.width, out.height);
    ctx.drawImage(stageCanvas, 0, 0);

    const a = document.createElement("a");
    a.href = out.toDataURL("image/png");
    a.download = "lave-mineral-label.png";
    a.click();
  }, [drawBgToCanvas]);

  const captureLabelWithBg = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      if (trRef.current) {
        trRef.current.nodes([]);
        trRef.current.getLayer()?.batchDraw();
      }

      setTimeout(() => {
        if (!stageRef.current) {
          resolve("");
          return;
        }

        const PR = 2;
        const W = canvasBaseW * PR;
        const H = canvasBaseH * PR;

        const out = document.createElement("canvas");
        out.width = W;
        out.height = H;

        const ctx = out.getContext("2d");
        if (!ctx) {
          resolve("");
          return;
        }

        ctx.clearRect(0, 0, W, H);
        drawBgToCanvas(ctx, W, H);

        const stageDataUrl = stageRef.current.toDataURL({
          pixelRatio: PR / scale,
          mimeType: "image/png",
        });

        const img = new window.Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, W, H);
          resolve(out.toDataURL("image/png"));
        };
        img.src = stageDataUrl;
      }, 80);
    });
  }, [drawBgToCanvas, canvasBaseW, canvasBaseH, scale]);

  const patternStyles: CSSProperties[] = [
    { backgroundColor: bgPrimary },
    { background: `linear-gradient(135deg, ${bgPrimary}, #1a6fa8)` },
    { background: `radial-gradient(circle at 50% 50%, ${bgPrimary}, #0d1b2a)` },
    {
      backgroundColor: "#f8f8f8",
      backgroundImage: "radial-gradient(circle, #aaa 1px, transparent 1px)",
      backgroundSize: "12px 12px",
    },
    {
      backgroundColor: bgPrimary,
      backgroundImage:
        "repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.15) 20px, rgba(255,255,255,0.15) 21px)",
    },
    {
      backgroundColor: "#dde8f2",
      backgroundImage:
        "repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(26,111,168,0.15) 28px, rgba(26,111,168,0.15) 29px), repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(26,111,168,0.15) 28px, rgba(26,111,168,0.15) 29px)",
    },
    { background: `linear-gradient(180deg, #ffffff 0%, ${bgPrimary} 100%)` },
  ];

  const bgStyle = patternStyles[bgPattern] || patternStyles[0];

  const Preview3D = () => {
    const [labelDataUrl, setLabelDataUrl] = useState<string | null>(null);
    const [bottleLoaded, setBottleLoaded] = useState(false);

    const bottleConfig =
      BOTTLE_SHAPES.find((b) => b.id === selected3DBottle) || BOTTLE_SHAPES[3];

    useEffect(() => {
      captureLabelWithBg().then((url) => setLabelDataUrl(url));
    }, []);

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={() => setShow3D(false)}
      >
        <div
          className="relative bg-gradient-to-b from-sky-50 to-white rounded-3xl shadow-2xl w-[820px] max-w-[95vw] p-8 flex flex-col items-center gap-6 border border-sky-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between w-full">
            <h2 className="text-sky-800 text-xl font-bold tracking-widest uppercase">
              3D Preview
            </h2>
            <button
              onClick={() => setShow3D(false)}
              className="text-sky-300 hover:text-sky-700 text-2xl transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="flex gap-3 flex-wrap justify-center">
            {BOTTLE_SHAPES.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelected3DBottle(b.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200
                  ${
                    selected3DBottle === b.id
                      ? "bg-sky-500 text-white shadow-lg shadow-sky-200"
                      : "bg-sky-100 text-sky-600 hover:bg-sky-200"
                  }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          <div
            className="relative w-[340px] h-[560px] flex items-center justify-center"
            style={{
              background:
                "radial-gradient(ellipse at 50% 70%, rgba(186,230,255,0.4) 0%, transparent 70%)",
            }}
          >
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-40 h-4 rounded-full"
              style={{
                background: "rgba(0,80,160,0.10)",
                filter: "blur(8px)",
              }}
            />

            <div className="relative h-[520px] flex items-center justify-center">
              <img
                src={bottleConfig.src}
                alt={bottleConfig.label}
                className="h-full object-contain select-none"
                style={{
                  filter:
                    "drop-shadow(0 16px 24px rgba(0,80,180,0.18)) drop-shadow(0 3px 6px rgba(0,0,0,0.12))",
                }}
                onLoad={() => setBottleLoaded(true)}
              />

              {labelDataUrl && bottleLoaded && (
                <div
                  className="absolute overflow-hidden"
                  style={{
                    top: bottleConfig.labelTop,
                    left: bottleConfig.labelLeft,
                    width: bottleConfig.labelWidth,
                    height: bottleConfig.labelHeight,
                    borderRadius: "4px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.22)",
                    pointerEvents: "none",
                  }}
                >
                  <img
                    src={labelDataUrl}
                    alt="label"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "fill",
                      display: "block",
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <button
              onClick={exportPNG}
              className="px-6 py-2 rounded-full bg-amber-400 text-amber-900 text-sm font-bold hover:bg-amber-500 transition-all shadow-md shadow-amber-100"
            >
              ↓ Export PNG
            </button>
          </div>

          <p className="text-xs text-sky-400">Click outside to close</p>
        </div>
      </div>
    );
  };

  const SecondaryPanel = () => {
    const filteredShapes = SHAPES_CATALOG.filter((s) => {
      const matchesSearch =
        !searchQuery || s.label.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        elemCategory === "All" || s.category === elemCategory;
      return matchesSearch && matchesCategory;
    });

    if (activeTool === "templates")
      return (
        <div className="w-80 bg-white border-r border-sky-100 flex flex-col overflow-y-auto p-4 gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-sky-800 uppercase tracking-widest">
              Templates
            </h3>
            <button
              onClick={() => setActiveTool("select")}
              className="text-sky-300 hover:text-sky-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <button
            onClick={() => pushHistory([])}
            className="w-full py-2.5 rounded-xl border border-dashed border-sky-400/60 text-sky-600 text-sm hover:border-sky-500 hover:bg-sky-50 transition-all duration-200 font-medium"
          >
            ✦ Start from Scratch
          </button>

          <div className="grid grid-cols-2 gap-3">
            {TEMPLATE_DESIGNS.map((t) => (
              <button
                key={t.id}
                onClick={() => loadTemplate(t)}
                className="flex flex-col items-center gap-2 rounded-xl overflow-hidden border border-sky-100 hover:border-sky-400/60 hover:scale-[1.02] transition-all duration-200 bg-sky-50/50"
              >
                <div
                  className="w-full h-28 flex items-center justify-center"
                  style={TEMPLATE_BG[t.id] || { background: "#e0f2fe" }}
                >
                  <span
                    className="font-bold text-2xl"
                    style={
                      ["t3", "t6"].includes(t.id)
                        ? { color: "#f5c842" }
                        : { color: "#1a5f8a" }
                    }
                  >
                    LAVE
                  </span>
                </div>
                <span className="text-[11px] text-sky-500 pb-2">{t.name}</span>
              </button>
            ))}
          </div>
        </div>
      );

    if (activeTool === "elements")
      return (
        <div className="w-80 bg-white border-r border-sky-100 flex flex-col p-4 gap-3 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-sky-800 uppercase tracking-widest">
              Elements
            </h3>
            <button
              onClick={() => setActiveTool("select")}
              className="text-sky-300 hover:text-sky-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search shapes…"
            className="w-full bg-sky-50 border border-sky-200 rounded-lg px-3 py-2 text-sm text-sky-900 placeholder-sky-300 focus:outline-none focus:border-sky-400 transition-all"
          />

          <div className="flex gap-1.5 flex-wrap">
            {SHAPE_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setElemCategory(c)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                  elemCategory === c
                    ? "bg-sky-500 text-white"
                    : "bg-sky-100 text-sky-600 hover:bg-sky-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <p className="text-[10px] text-sky-400">{filteredShapes.length} shapes</p>

          <div className="grid grid-cols-4 gap-2 overflow-y-auto">
            {filteredShapes.map((s) => (
              <button
                key={s.id}
                onClick={() => addShape(s.id)}
                className="flex flex-col items-center justify-center h-16 rounded-xl bg-sky-50 hover:bg-sky-100 hover:border-sky-400/50 border border-sky-100 hover:scale-105 transition-all duration-200 text-xl text-sky-700 gap-0.5"
              >
                <span>{s.icon}</span>
                <span className="text-[8px] text-sky-400 leading-tight text-center px-0.5">
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      );

    if (activeTool === "text")
      return (
        <div className="w-80 bg-white border-r border-sky-100 flex flex-col p-4 gap-3 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-sky-800 uppercase tracking-widest">
              Text
            </h3>
            <button
              onClick={() => setActiveTool("select")}
              className="text-sky-300 hover:text-sky-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <button
            onClick={() => addText("heading")}
            className="w-full py-3 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-100 hover:border-sky-300 text-sky-900 text-left px-4 transition-all duration-200 group"
          >
            <span className="text-2xl font-bold group-hover:text-sky-600">
              Add a Heading
            </span>
          </button>

          <button
            onClick={() => addText("sub")}
            className="w-full py-3 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-100 hover:border-sky-300 text-sky-700 text-left px-4 transition-all duration-200 group"
          >
            <span className="text-lg font-semibold group-hover:text-sky-600">
              Add a Subheading
            </span>
          </button>

          <button
            onClick={() => addText("body")}
            className="w-full py-3 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-100 hover:border-sky-300 text-sky-500 text-left px-4 transition-all duration-200 group"
          >
            <span className="text-sm group-hover:text-sky-600">
              Add body text
            </span>
          </button>

          <div className="mt-2">
            <p className="text-xs text-sky-400 uppercase tracking-wider mb-2">
              Font Styles
            </p>
            {FONT_FAMILIES.map((f) => (
              <button
                key={f}
                onClick={() => {
                  if (selectedId) updateSelectedAndHistory({ fontFamily: f });
                }}
                className="w-full py-2 px-3 text-left rounded-lg hover:bg-sky-50 text-sky-800 text-sm transition-all"
                style={{ fontFamily: f }}
              >
                {f}
              </button>
            ))}
          </div>

          <p className="text-[10px] text-sky-400 mt-1 bg-sky-50 rounded-lg p-2 border border-sky-100">
            💡 Double-click any text on canvas to edit it directly
          </p>
        </div>
      );

    if (activeTool === "upload")
      return (
        <div className="w-80 bg-white border-r border-sky-100 flex flex-col p-4 gap-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-sky-800 uppercase tracking-widest">
              Upload
            </h3>
            <button
              onClick={() => setActiveTool("select")}
              className="text-sky-300 hover:text-sky-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files[0];
              if (f) handleImageUpload(f);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300
            ${
              dragOver
                ? "border-sky-400 bg-sky-50 scale-[1.02]"
                : "border-sky-200 hover:border-sky-400 hover:bg-sky-50"
            }`}
          >
            <span className="text-3xl mb-2 text-sky-400">☁</span>
            <p className="text-sm text-sky-600">Click or drag & drop</p>
            <p className="text-xs text-sky-400 mt-1">PNG, JPG, SVG</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImageUpload(f);
            }}
          />

          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {uploadedImages.map((url, i) => (
                <button
                  key={i}
                  onClick={() => addImageToCanvas(url)}
                  className="aspect-square rounded-lg overflow-hidden border border-sky-200 hover:border-sky-400 hover:scale-105 transition-all duration-200"
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      );

    if (activeTool === "bg")
      return (
        <div className="w-80 bg-white border-r border-sky-100 flex flex-col p-4 gap-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-sky-600 uppercase tracking-widest">
              Background
            </h3>
            <button
              onClick={() => setActiveTool("select")}
              className="text-sky-300 hover:text-sky-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <div>
            <p className="text-[10px] text-sky-400 uppercase tracking-widest mb-2">
              Pattern
            </p>
            <div className="grid grid-cols-4 gap-2">
              {patternStyles.map((style, i) => (
                <button
                  key={i}
                  onClick={() => setBgPattern(i)}
                  className={`h-14 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                    bgPattern === i
                      ? "border-sky-500 ring-2 ring-sky-300/50"
                      : "border-sky-100 hover:border-sky-300"
                  }`}
                  style={style}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] text-sky-400 uppercase tracking-widest mb-2">
              Primary Color
            </p>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => setBgPrimary(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                    bgPrimary === c
                      ? "border-sky-500 ring-2 ring-sky-300/50"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <div className="flex items-center gap-2">
                <span className="text-xs text-sky-400">Custom</span>
                <input
                  type="color"
                  value={bgPrimary}
                  onChange={(e) => setBgPrimary(e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      );

    return null;
  };

  const PropertiesPanel = () => (
    <div className="w-72 bg-white border-l border-sky-100 flex flex-col overflow-y-auto">
      {selectedEl ? (
        <>
          {selectedEl.type === "text" && (
            <div className="p-4 border-b border-sky-50">
              <p className="text-[10px] text-sky-500 uppercase tracking-widest font-bold mb-1">
                Text Style
              </p>
              <p className="text-[10px] text-sky-400 mb-3 bg-sky-50 rounded-lg px-2 py-1.5 border border-sky-100">
                ✏️ Double-click text on canvas to edit
              </p>

              <div className="grid grid-cols-2 gap-2 mb-3">
                {FONT_FAMILIES.slice(0, 4).map((f) => (
                  <button
                    key={f}
                    onClick={() => updateSelectedAndHistory({ fontFamily: f })}
                    className={`py-1.5 rounded-lg text-xs transition-all border ${
                      selectedEl.fontFamily === f
                        ? "border-sky-500 bg-sky-50 text-sky-700"
                        : "border-sky-100 text-sky-600 hover:border-sky-300"
                    }`}
                    style={{ fontFamily: f }}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-sky-400 w-10">Size</span>
                <input
                  type="range"
                  min={8}
                  max={200}
                  value={selectedEl.fontSize || 20}
                  onChange={(e) =>
                    updateSelected({ fontSize: Number(e.target.value) })
                  }
                  onMouseUp={(e) =>
                    updateSelectedAndHistory({
                      fontSize: Number((e.target as HTMLInputElement).value),
                    })
                  }
                  className="flex-1 accent-sky-400"
                />
                <span className="text-xs text-sky-800 w-8 text-right">
                  {selectedEl.fontSize || 20}
                </span>
              </div>

              <div className="flex gap-2 mb-3">
                <button
                  onClick={() =>
                    updateSelectedAndHistory({
                      fontStyle:
                        selectedEl.fontStyle === "bold" ? "normal" : "bold",
                    })
                  }
                  className={`w-9 h-9 rounded-lg font-bold border transition-all ${
                    selectedEl.fontStyle === "bold"
                      ? "bg-sky-500 border-sky-400 text-white"
                      : "border-sky-200 text-sky-600"
                  }`}
                >
                  B
                </button>
                <button
                  onClick={() =>
                    updateSelectedAndHistory({
                      fontStyle:
                        selectedEl.fontStyle === "italic" ? "normal" : "italic",
                    })
                  }
                  className={`w-9 h-9 rounded-lg italic border transition-all ${
                    selectedEl.fontStyle === "italic"
                      ? "bg-sky-500 border-sky-400 text-white"
                      : "border-sky-200 text-sky-600"
                  }`}
                >
                  I
                </button>
              </div>

              <div className="flex gap-2">
                {["left", "center", "right"].map((a) => (
                  <button
                    key={a}
                    onClick={() => updateSelectedAndHistory({ align: a })}
                    className={`flex-1 py-1.5 rounded-lg text-xs border transition-all ${
                      selectedEl.align === a
                        ? "bg-sky-100 border-sky-400 text-sky-700"
                        : "border-sky-100 text-sky-400 hover:border-sky-300"
                    }`}
                  >
                    {a === "left"
                      ? "⬛▱▱"
                      : a === "center"
                      ? "▱⬛▱"
                      : "▱▱⬛"}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 border-b border-sky-50">
            <p className="text-[10px] text-sky-400 uppercase tracking-widest mb-3">
              Position & Size
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "X", key: "x", val: Math.round(selectedEl.x) },
                { label: "Y", key: "y", val: Math.round(selectedEl.y) },
                { label: "W", key: "width", val: Math.round(selectedEl.width || 0) },
                { label: "H", key: "height", val: Math.round(selectedEl.height || 0) },
              ].map(({ label, key, val }) => (
                <div
                  key={key}
                  className="flex items-center gap-2 bg-sky-50 rounded-lg px-2 py-1.5"
                >
                  <span className="text-[10px] text-sky-400 w-4">{label}</span>
                  <input
                    type="number"
                    value={val}
                    onChange={(e) =>
                      updateSelected({ [key]: Number(e.target.value) })
                    }
                    onBlur={(e) =>
                      updateSelectedAndHistory({ [key]: Number(e.target.value) })
                    }
                    className="flex-1 bg-transparent text-sky-800 text-xs outline-none w-0"
                  />
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-sky-400 w-14">Rotation</span>
              <input
                type="range"
                min={0}
                max={360}
                value={selectedEl.rotation || 0}
                onChange={(e) =>
                  updateSelected({ rotation: Number(e.target.value) })
                }
                onMouseUp={(e) =>
                  updateSelectedAndHistory({
                    rotation: Number((e.target as HTMLInputElement).value),
                  })
                }
                className="flex-1 accent-sky-400"
              />
              <span className="text-xs text-sky-800 w-8 text-right">
                {Math.round(selectedEl.rotation || 0)}°
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-sky-400 w-14">Opacity</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={selectedEl.opacity ?? 1}
                onChange={(e) =>
                  updateSelected({ opacity: Number(e.target.value) })
                }
                onMouseUp={(e) =>
                  updateSelectedAndHistory({
                    opacity: Number((e.target as HTMLInputElement).value),
                  })
                }
                className="flex-1 accent-sky-400"
              />
              <span className="text-xs text-sky-800 w-8 text-right">
                {Math.round((selectedEl.opacity ?? 1) * 100)}%
              </span>
            </div>
          </div>

          <div className="p-4 border-b border-sky-50">
            <p className="text-[10px] text-sky-400 uppercase tracking-widest mb-3">
              Color
            </p>

            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => updateSelectedAndHistory({ fill: c })}
                  className={`w-7 h-7 rounded-full border-2 hover:scale-110 transition-all ${
                    selectedEl.fill === c
                      ? "border-sky-500 ring-2 ring-sky-300/50"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}

              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-sky-400">Custom</span>
                <input
                  type="color"
                  value={selectedEl.fill || "#ffffff"}
                  onChange={(e) =>
                    updateSelectedAndHistory({ fill: e.target.value })
                  }
                  className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                />
              </div>
            </div>
          </div>

          <div className="p-4">
            <p className="text-[10px] text-sky-400 uppercase tracking-widest mb-3">
              Layer
            </p>

            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
              {[...elements].reverse().map((el) => (
                <div
                  key={el.id}
                  onClick={() => setSelectedId(el.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs transition-all
                    ${
                      el.id === selectedId
                        ? "bg-sky-100 border border-sky-300 text-sky-700"
                        : "hover:bg-sky-50 text-sky-600"
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sky-400">
                      {el.type === "text" ? "T" : "□"}
                    </span>
                    {el.type === "text"
                      ? el.text?.slice(0, 18) || "Text"
                      : el.type.charAt(0).toUpperCase() + el.type.slice(1)}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-sky-400/60" />
                </div>
              ))}
            </div>

            {selectedEl && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    const copy = {
                      ...selectedEl,
                      id: uid(),
                      x: selectedEl.x + 20,
                      y: selectedEl.y + 20,
                    };
                    pushHistory([...elements, copy]);
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-xs text-sky-600 transition-all border border-sky-100"
                >
                  Dupe
                </button>

                <button
                  onClick={() => {
                    const idx = elements.findIndex((e) => e.id === selectedId);
                    if (idx <= 0) return;
                    const arr = [...elements];
                    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
                    pushHistory(arr);
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-xs text-sky-600 transition-all border border-sky-100"
                >
                  ↑
                </button>

                <button
                  onClick={() => {
                    const idx = elements.findIndex((e) => e.id === selectedId);
                    if (idx >= elements.length - 1) return;
                    const arr = [...elements];
                    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
                    pushHistory(arr);
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-xs text-sky-600 transition-all border border-sky-100"
                >
                  ↓
                </button>

                <button
                  onClick={() => {
                    pushHistory(elements.filter((e) => e.id !== selectedId));
                    setSelectedId(null);
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-xs text-red-500 transition-all border border-red-100"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-sky-300 gap-3 p-8 text-center">
          <span className="text-4xl">◱</span>
          <p className="text-sm text-sky-400">
            Select an element on the canvas to edit its properties
          </p>
          <p className="text-xs text-sky-300 mt-2">
            Double-click any text to edit it directly on canvas
          </p>
        </div>
      )}
    </div>
  );

  const renderElement = (el: CanvasElement) => {
  const commonProps = {
    id: el.id,
    x: el.x,
    y: el.y,
    rotation: el.rotation || 0,
    opacity: el.opacity ?? 1,
    draggable: !editingTextId,
    onClick: () => {
      if (!editingTextId) setSelectedId(el.id);
    },
    onTap: () => {
      if (!editingTextId) setSelectedId(el.id);
    },
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
      const newElems = elementsRef.current.map((elem) =>
        elem.id === el.id ? { ...elem, x: e.target.x(), y: e.target.y() } : elem
      );
      pushHistory(newElems);
    },
    onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
      const node = e.target;
      const newElems = elementsRef.current.map((elem) =>
        elem.id === el.id
          ? {
              ...elem,
              x: node.x(),
              y: node.y(),
              width: Math.max(5, node.width() * node.scaleX()),
              height: Math.max(5, node.height() * node.scaleY()),
              rotation: node.rotation(),
            }
          : elem
      );
      node.scaleX(1);
      node.scaleY(1);
      pushHistory(newElems);
    },
  };

  switch (el.type) {
    case "rect":
      return (
        <Rect
          key={el.id}
          {...commonProps}
          width={el.width || 100}
          height={el.height || 60}
          fill={el.fill || "#4badd4"}
          stroke={el.stroke}
          strokeWidth={el.strokeWidth}
          cornerRadius={4}
        />
      );

    case "circle":
      return (
        <Circle
          key={el.id}
          {...commonProps}
          radius={el.radius || 40}
          fill={el.fill || "#4badd4"}
          stroke={el.stroke}
          strokeWidth={el.strokeWidth}
        />
      );

    case "ellipse":
      return (
        <Rect
          key={el.id}
          {...commonProps}
          width={el.width || 160}
          height={el.height || 80}
          fill={el.fill || "#4badd4"}
          stroke={el.stroke}
          strokeWidth={el.strokeWidth}
          cornerRadius={(el.height || 80) / 2}
        />
      );

    case "triangle":
      return (
        <RegularPolygon
          key={el.id}
          {...commonProps}
          sides={el.sides || 3}
          radius={el.radius || 60}
          fill={el.fill || "#4badd4"}
          stroke={el.stroke}
          strokeWidth={el.strokeWidth}
        />
      );

    case "pentagon":
      return (
        <RegularPolygon
          key={el.id}
          {...commonProps}
          sides={5}
          radius={el.radius || 60}
          fill={el.fill || "#9b59b6"}
          stroke={el.stroke}
          strokeWidth={el.strokeWidth}
        />
      );

    case "hexagon":
      return (
        <RegularPolygon
          key={el.id}
          {...commonProps}
          sides={el.sides || 6}
          radius={el.radius || 60}
          fill={el.fill || "#2ecc71"}
          stroke={el.stroke}
          strokeWidth={el.strokeWidth}
        />
      );

    case "octagon":
      return (
        <RegularPolygon
          key={el.id}
          {...commonProps}
          sides={el.sides || 8}
          radius={el.radius || 60}
          fill={el.fill || "#e84040"}
          stroke={el.stroke}
          strokeWidth={el.strokeWidth}
        />
      );

    case "star":
      return (
        <Star
          key={el.id}
          {...commonProps}
          numPoints={el.numPoints || 5}
          innerRadius={el.innerRadius || 30}
          outerRadius={el.outerRadius || 70}
          fill={el.fill || "#f5c842"}
          stroke={el.stroke}
          strokeWidth={el.strokeWidth}
        />
      );

    case "arrow":
      return (
        <Arrow
          key={el.id}
          {...commonProps}
          points={el.points || [0, 0, 100, 0]}
          fill={el.fill || "#4badd4"}
          stroke={el.stroke || el.fill || "#1a6fa8"}
          strokeWidth={el.strokeWidth || 3}
          pointerLength={12}
          pointerWidth={10}
        />
      );

    case "line":
      return (
        <Line
          key={el.id}
          {...commonProps}
          points={el.points || [0, 0, 100, 0]}
          stroke={el.stroke || "#4badd4"}
          strokeWidth={el.strokeWidth || 3}
          lineCap="round"
        />
      );

    case "diamond": {
      const w = (el.width || 100) / 2;
      const h = (el.height || 130) / 2;
      return (
        <Line
          key={el.id}
          {...commonProps}
          points={[0, -h, w, 0, 0, h, -w, 0]}
          closed
          fill={el.fill || "#f5c842"}
          stroke={el.stroke || "#d4a800"}
          strokeWidth={el.strokeWidth || 1}
        />
      );
    }

    case "heart": {
      const hw = (el.width || 120) / 2;
      const hh = el.height || 100;
      return (
        <Line
          key={el.id}
          {...commonProps}
          points={[
            0,
            hh * 0.35,
            hw * 0.1,
            hh * 0.15,
            hw * 0.35,
            0,
            hw * 0.6,
            0,
            hw,
            hh * 0.25,
            hw,
            hh * 0.5,
            0,
            hh,
            -hw,
            hh * 0.5,
            -hw,
            hh * 0.25,
            -hw * 0.6,
            0,
            -hw * 0.35,
            0,
            -hw * 0.1,
            hh * 0.15,
          ]}
          closed
          fill={el.fill || "#e84040"}
          stroke={el.stroke || "#c0392b"}
          strokeWidth={el.strokeWidth || 2}
          tension={0.4}
        />
      );
    }

    case "cross": {
      const cw = el.width || 100;
      const ch = el.height || 100;
      const t = cw * 0.28;
      return (
        <Line
          key={el.id}
          {...commonProps}
          points={[
            -t,
            -ch / 2,
            t,
            -ch / 2,
            t,
            -t,
            cw / 2,
            -t,
            cw / 2,
            t,
            t,
            t,
            t,
            ch / 2,
            -t,
            ch / 2,
            -t,
            t,
            -cw / 2,
            t,
            -cw / 2,
            -t,
            -t,
            -t,
          ]}
          closed
          fill={el.fill || "#4badd4"}
          stroke={el.stroke || ""}
          strokeWidth={el.strokeWidth || 0}
        />
      );
    }

    case "text":
      return (
        <Text
          key={el.id}
          {...commonProps}
          text={el.text || ""}
          fontSize={el.fontSize || 20}
          fontFamily={el.fontFamily || "Outfit"}
          fill={el.fill || "#1a5f8a"}
          fontStyle={el.fontStyle || "normal"}
          align={el.align || "left"}
          letterSpacing={el.letterSpacing || 0}
          width={el.width}
          onDblClick={() => startInlineTextEdit(el.id)}
          onDblTap={() => startInlineTextEdit(el.id)}
        />
      );

    case "image":
      if (el.imageUrl) {
        const img = new window.Image();
        img.src = el.imageUrl;
        return (
          <KonvaImage
            key={el.id}
            {...commonProps}
            image={img}
            width={el.width || 200}
            height={el.height || 150}
          />
        );
      }
      return null;

    default:
      return null;
  }
};
  return (
    <div
      className="flex flex-col h-screen bg-sky-50 text-sky-900 select-none font-sans overflow-hidden"
      style={{ fontFamily: "'DM Sans', 'Outfit', sans-serif" }}
    >
      <nav className="flex items-center justify-between px-5 py-2.5 bg-white border-b border-sky-100 z-30 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-sky-700 flex items-center justify-center shadow-lg shadow-sky-300/40">
              <span className="text-white text-xs font-black">L</span>
            </div>
            <span className="text-sky-900 font-light text-lg tracking-wide">
              <em className="text-sky-500 not-italic font-semibold">Lave</em>{" "}
              Mineral
            </span>
          </div>
          <div className="w-px h-5 bg-sky-100 mx-2" />
          <span className="text-sky-500 text-sm">My Label Design</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            title="Undo (Ctrl+Z)"
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-sky-50 text-sky-400 hover:text-sky-600 transition-all text-lg disabled:opacity-30"
            disabled={historyIdx <= 0}
          >
            ↩
          </button>
          <button
            onClick={redo}
            title="Redo (Ctrl+Y)"
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-sky-50 text-sky-400 hover:text-sky-600 transition-all text-lg disabled:opacity-30"
            disabled={historyIdx >= history.length - 1}
          >
            ↪
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShow3D(true)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-semibold hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg shadow-sky-300/40"
          >
            <span>✦</span> 3D Preview
          </button>

          <button
            onClick={exportPNG}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-white text-sm font-bold hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg shadow-amber-300/40"
          >
            ↓ Export PNG
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[72px] bg-white border-r border-sky-100 flex flex-col items-center py-3 gap-1 z-20 shrink-0 shadow-sm">
          <SidebarBtn
            icon={
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="2" y="2" width="20" height="20" rx="3" />
                <path d="M7 7h4v4H7zM13 7h4v4h-4zM7 13h4v4H7zM13 13h4v4h-4z" />
              </svg>
            }
            label="Templates"
            active={activeTool === "templates"}
            onClick={() =>
              setActiveTool(activeTool === "templates" ? "select" : "templates")
            }
          />

          <SidebarBtn
            icon={
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <polygon points="12,2 22,20 2,20" />
                <circle cx="12" cy="14" r="1" />
              </svg>
            }
            label="Elements"
            active={activeTool === "elements"}
            onClick={() =>
              setActiveTool(activeTool === "elements" ? "select" : "elements")
            }
          />

          <SidebarBtn
            icon={
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M4 6h16M4 12h16M4 18h10" />
              </svg>
            }
            label="Text"
            active={activeTool === "text"}
            onClick={() => setActiveTool(activeTool === "text" ? "select" : "text")}
          />

          <SidebarBtn
            icon={
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
            }
            label="Upload"
            active={activeTool === "upload"}
            onClick={() =>
              setActiveTool(activeTool === "upload" ? "select" : "upload")
            }
          />

          <SidebarBtn
            icon={
              <svg
                width="28"
                height="28"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M50 10 C25 10 10 28 10 48 C10 68 25 82 48 84 C52 84 55 81 55 77 C55 74 57 72 60 72 L68 72 C80 72 90 63 90 52 C90 30 72 10 50 10Z"
                  fill="#F4A07A"
                />
                <ellipse cx="60" cy="72" rx="8" ry="6" fill="#2a2a3a" />
                <circle cx="32" cy="42" r="8" fill="#3ecfb2" />
                <circle cx="50" cy="30" r="8" fill="#e040a0" />
                <circle cx="68" cy="42" r="8" fill="#a060e0" />
                <circle cx="38" cy="60" r="8" fill="#4090e0" />
                <circle cx="60" cy="55" r="7" fill="#e05050" />
              </svg>
            }
            label="BG"
            active={activeTool === "bg"}
            onClick={() => setActiveTool(activeTool === "bg" ? "select" : "bg")}
          />

          <div className="flex-1" />

          <SidebarBtn
            icon={
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
              </svg>
            }
            label="Select"
            active={activeTool === "select"}
            onClick={() => setActiveTool("select")}
          />

          <SidebarBtn
            icon={
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M3 17L9 11l4 4 8-8" />
              </svg>
            }
            label="Draw"
            active={activeTool === "draw"}
            onClick={() => setActiveTool("draw")}
          />
        </div>

        {["templates", "elements", "text", "upload", "bg"].includes(activeTool) && (
          <SecondaryPanel />
        )}

        <div
          className="flex-1 flex flex-col overflow-hidden bg-sky-50"
          onMouseMove={(e) =>
            setMousePos({
              x: Math.round(e.nativeEvent.offsetX / scale),
              y: Math.round(e.nativeEvent.offsetY / scale),
            })
          }
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-sky-100 bg-white/80 shrink-0">
            <div className="flex gap-4">
              <button className="text-sm font-semibold text-sky-700 border-b-2 border-sky-400 pb-1">
                Design
              </button>
              <button className="text-sm text-sky-400 hover:text-sky-600 transition-colors pb-1">
                Preview
              </button>
            </div>
            <span className="text-xs text-sky-400 font-mono">
              {mousePos.x}, {mousePos.y}
            </span>
          </div>

          <div
            className="flex-1 overflow-auto flex items-center justify-center"
            style={{
              padding: borderSize,
              backgroundImage:
                "radial-gradient(circle, rgba(14,165,233,0.12) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          >
            <div
              ref={canvasWrapperRef}
              className="shadow-2xl shadow-sky-200/60 rounded-sm relative"
              style={{ width: canvasW, height: canvasH, ...bgStyle }}
            >
              <Stage
                ref={stageRef}
                width={canvasW}
                height={canvasH}
                scaleX={scale}
                scaleY={scale}
                onClick={(e) => {
                  if (editingTextId) return;
                  if (e.target === e.target.getStage()) setSelectedId(null);
                }}
              >
                <Layer>
                  {elements.map(renderElement)}
                  <Transformer
                    ref={trRef}
                    rotateEnabled
                    enabledAnchors={[
                      "top-left",
                      "top-right",
                      "bottom-left",
                      "bottom-right",
                      "middle-left",
                      "middle-right",
                      "top-center",
                      "bottom-center",
                    ]}
                    boundBoxFunc={(oldBox, newBox) =>
                      newBox.width < 10 || newBox.height < 10 ? oldBox : newBox
                    }
                    anchorFill="#38bdf8"
                    anchorStroke="#0284c7"
                    borderStroke="#0ea5e9"
                    borderDash={[4, 2]}
                    anchorSize={8}
                    anchorCornerRadius={2}
                  />
                </Layer>
              </Stage>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 py-2 border-t border-sky-100 bg-white/80 shrink-0 flex-wrap px-4">
            <div className="flex items-center gap-1.5 bg-sky-50 rounded-full px-3 py-1.5 border border-sky-100">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-sky-400"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="3" />
              </svg>
              <span className="text-xs text-sky-500">Grid</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setZoom((z) => Math.max(25, z - 10))}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-sky-50 hover:bg-sky-100 text-sky-600 text-sm transition-all border border-sky-100"
              >
                −
              </button>
              <span className="text-xs text-sky-700 font-mono w-12 text-center">
                {zoom}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(200, z + 10))}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-sky-50 hover:bg-sky-100 text-sky-600 text-sm transition-all border border-sky-100"
              >
                +
              </button>
              <button
                onClick={() => setZoom(100)}
                className="text-xs text-sky-400 hover:text-sky-600 transition-colors"
              >
                Reset
              </button>
            </div>

            <div className="w-px h-5 bg-sky-100" />

            <div className="flex items-center gap-1.5 bg-sky-50 rounded-lg px-2 py-1 border border-sky-100">
              <span className="text-[10px] text-sky-400 font-semibold uppercase tracking-wide">
                W
              </span>
              <input
                type="number"
                min={200}
                max={1200}
                step={10}
                value={canvasBaseW}
                onChange={(e) =>
                  setCanvasBaseW(
                    Math.max(200, Math.min(1200, Number(e.target.value)))
                  )
                }
                className="w-14 bg-transparent text-xs text-sky-800 outline-none font-mono text-center"
              />
              <span className="text-[10px] text-sky-300">px</span>
            </div>

            <div className="flex items-center gap-1.5 bg-sky-50 rounded-lg px-2 py-1 border border-sky-100">
              <span className="text-[10px] text-sky-400 font-semibold uppercase tracking-wide">
                H
              </span>
              <input
                type="number"
                min={200}
                max={1600}
                step={10}
                value={canvasBaseH}
                onChange={(e) =>
                  setCanvasBaseH(
                    Math.max(200, Math.min(1600, Number(e.target.value)))
                  )
                }
                className="w-14 bg-transparent text-xs text-sky-800 outline-none font-mono text-center"
              />
              <span className="text-[10px] text-sky-300">px</span>
            </div>

            <div className="w-px h-5 bg-sky-100" />

            <div className="flex items-center gap-2 bg-sky-50 rounded-lg px-2 py-1 border border-sky-100">
              <span className="text-[10px] text-sky-400 font-semibold uppercase tracking-wide">
                Border
              </span>
              <input
                type="range"
                min={0}
                max={120}
                step={4}
                value={borderSize}
                onChange={(e) => setBorderSize(Number(e.target.value))}
                className="w-20 accent-sky-400"
              />
              <span className="text-[10px] text-sky-700 font-mono w-7 text-right">
                {borderSize}px
              </span>
            </div>
          </div>
        </div>

        <PropertiesPanel />
      </div>

      {show3D && <Preview3D />}
    </div>
  );
}