export type Category =
  | "All"
  | "Square Shape"
  | "Zen Shape"
  | "Round Shape"
  | "Pyramid Shape"
  | "Peace Shape";

export const CATEGORIES: Category[] = [
  "All",
  "Square Shape",
  "Zen Shape",
  "Round Shape",
  "Pyramid Shape",
  "Peace Shape",
];

export type Product = {
  id: number;
  name: string;
  size: string;
  type: Category;
  height: string;
  img: string;
};

export const PRODUCTS: Product[] = [
  { id: 1, name: "Square Shape", size: "350ML", type: "Square Shape", height: "h-80", img: "/images/s3.png" },
  { id: 2, name: "Square Shape", size: "500ML", type: "Square Shape", height: "h-80", img: "/images/s2.png" },
  { id: 3, name: "Square Shape", size: "1 Liter", type: "Square Shape", height: "h-80", img: "/images/s1.png" },

  { id: 4, name: "Zen Shape", size: "350ML", type: "Zen Shape", height: "h-80", img: "/images/z33.png" },
  { id: 5, name: "Zen Shape", size: "500ML", type: "Zen Shape", height: "h-80", img: "/images/z22.png" },
  { id: 6, name: "Zen Shape", size: "1 Liter", type: "Zen Shape", height: "h-80", img: "/images/z11.png" },

  { id: 7, name: "Round Shape", size: "300ML", type: "Round Shape", height: "h-80", img: "/images/r33.png" },
  { id: 8, name: "Round Shape", size: "500ML", type: "Round Shape", height: "h-80", img: "/images/r22.png" },
  { id: 9, name: "Round Shape", size: "1 Liter", type: "Round Shape", height: "h-80", img: "/images/r11.png" },

  { id: 10, name: "Peace Shape", size: "500ML", type: "Peace Shape", height: "h-80", img: "/images/p1.png" },
  { id: 11, name: "Peace Shape", size: "500ML", type: "Peace Shape", height: "h-80", img: "/images/p2.png" },

  { id: 12, name: "Pyramid Shape", size: "500ML", type: "Pyramid Shape", height: "h-80", img: "/images/py.png" },
];