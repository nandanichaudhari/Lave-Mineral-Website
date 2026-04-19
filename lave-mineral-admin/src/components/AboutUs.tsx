"use client";
import { useState, useEffect, useRef } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --blue-deep: #0a1628;
    --blue-mid: #1a3a6b;
    --blue-brand: #1d5cc8;
    --blue-bright: #3b82f6;
    --blue-light: #dbeafe;
    --blue-pale: #eff6ff;
    --accent: #3b82f6;
    --gold: #c9a84c;
    --white: #ffffff;
    --gray-50: #f8fafc;
    --gray-100: #f1f5f9;
    --gray-300: #cbd5e1;
    --gray-500: #64748b;
    --gray-700: #334155;
    --gray-900: #0f172a;
    --font-display: 'Playfair Display', serif;
    --font-body: 'DM Sans', sans-serif;
    --shadow-blue: 0 20px 60px rgba(29,92,200,0.15);
    --shadow-lg: 0 10px 40px rgba(0,0,0,0.1);
    --radius: 16px;
    --radius-sm: 10px;
  }

  html { scroll-behavior: smooth; }

  body {
    font-family: var(--font-body);
    background: var(--white);
    color: var(--gray-900);
    overflow-x: hidden;
  }

  /* KEYFRAMES */
  @keyframes floatBlob {
    0%, 100% { transform: translateY(0) scale(1); }
    33% { transform: translateY(-20px) scale(1.04); }
    66% { transform: translateY(10px) scale(0.97); }
  }
  @keyframes pulseRing {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(1.6); }
  }
  @keyframes breatheLine {
    0%, 100% { height: 20px; opacity: 0.6; }
    50% { height: 40px; opacity: 1; }
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes dropFall {
    0% { transform: translateY(-10px) scaleY(0.8); opacity: 0; }
    60% { transform: translateY(4px) scaleY(1.05); opacity: 1; }
    100% { transform: translateY(0) scaleY(1); opacity: 1; }
  }
  @keyframes timelineDot {
    0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
    50% { box-shadow: 0 0 0 8px rgba(59,130,246,0); }
  }
  @keyframes ripple {
    0% { transform: scale(0.8); opacity: 0.8; }
    100% { transform: scale(2.4); opacity: 0; }
  }

  /* ─── HERO (light blue/white theme) ─── */
  .hero {
    min-height: 92vh;
    background: linear-gradient(160deg, #ffffff 0%, #eff6ff 40%, #dbeafe 75%, #bfdbfe 100%);
    position: relative; overflow: hidden;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 80px 24px 80px;
    text-align: center;
  }

  /* Subtle ripple rings */
  .hero-ripple {
    position: absolute; border-radius: 50%;
    border: 1px solid rgba(29,92,200,0.08);
    pointer-events: none;
  }
  .ripple-1 { width: 420px; height: 420px; top: 50%; left: 50%; transform: translate(-50%,-50%) scale(1); animation: ripple 5s ease-out infinite; }
  .ripple-2 { width: 420px; height: 420px; top: 50%; left: 50%; transform: translate(-50%,-50%); animation: ripple 5s ease-out infinite 1.6s; }
  .ripple-3 { width: 420px; height: 420px; top: 50%; left: 50%; transform: translate(-50%,-50%); animation: ripple 5s ease-out infinite 3.2s; }

  /* Floating blobs — light blue tones */
  .hero-blob { position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none; }
  .blob-1 {
    width: 480px; height: 480px;
    background: radial-gradient(circle, rgba(147,197,253,0.45) 0%, transparent 70%);
    top: -80px; left: -120px;
    animation: floatBlob 9s ease-in-out infinite;
  }
  .blob-2 {
    width: 380px; height: 380px;
    background: radial-gradient(circle, rgba(191,219,254,0.5) 0%, transparent 70%);
    bottom: -60px; right: -80px;
    animation: floatBlob 11s ease-in-out infinite reverse;
  }
  .blob-3 {
    width: 260px; height: 260px;
    background: radial-gradient(circle, rgba(96,165,250,0.25) 0%, transparent 70%);
    top: 40%; right: 12%;
    animation: floatBlob 13s ease-in-out infinite 2s;
  }

  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(29,92,200,0.06);
    border: 1px solid rgba(29,92,200,0.15);
    border-radius: 50px; padding: 8px 18px;
    margin-bottom: 32px;
    animation: fadeUp 0.8s ease both;
  }
  .badge-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--blue-brand); position: relative;
  }
  .badge-dot::after {
    content: ''; position: absolute; inset: -3px;
    border-radius: 50%; background: rgba(29,92,200,0.25);
    animation: pulseRing 2s ease-in-out infinite;
  }
  .badge-text {
    font-size: 12px; font-weight: 600; color: var(--blue-brand);
    letter-spacing: 1.5px; text-transform: uppercase;
  }

  .hero-title {
    font-family: var(--font-display);
    font-size: clamp(42px, 7vw, 88px);
    font-weight: 700; line-height: 1.05;
    color: var(--blue-deep); margin-bottom: 24px;
    animation: fadeUp 0.8s ease 0.2s both;
  }
  .hero-title em {
    font-style: italic;
    background: linear-gradient(90deg, #1d5cc8, #3b82f6, #60a5fa, #3b82f6);
    background-size: 200% auto;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
  }
  .hero-sub {
    font-size: 18px; font-weight: 300; color: var(--gray-500);
    max-width: 520px; line-height: 1.75; margin-bottom: 44px;
    animation: fadeUp 0.8s ease 0.4s both;
  }
  .hero-actions {
    display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;
    animation: fadeUp 0.8s ease 0.6s both;
  }
  .btn-primary {
    background: var(--blue-brand); color: white;
    border: none; border-radius: 50px;
    padding: 16px 36px; font-size: 15px; font-weight: 700;
    cursor: pointer; font-family: var(--font-body);
    transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
    letter-spacing: 0.3px;
  }
  .btn-primary:hover {
    transform: translateY(-2px); background: var(--blue-mid);
    box-shadow: 0 12px 30px rgba(29,92,200,0.3);
  }
  .btn-secondary {
    background: transparent;
    border: 1.5px solid rgba(29,92,200,0.3);
    color: var(--blue-brand); border-radius: 50px;
    padding: 16px 36px; font-size: 15px; font-weight: 500;
    cursor: pointer; font-family: var(--font-body);
    transition: background 0.2s, border-color 0.2s;
  }
  .btn-secondary:hover {
    background: rgba(29,92,200,0.06);
    border-color: var(--blue-brand);
  }
  .scroll-indicator {
    position: absolute; bottom: 32px; left: 50%;
    transform: translateX(-50%);
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    animation: fadeUp 0.8s ease 1s both;
  }
  .scroll-text {
    font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
    color: rgba(29,92,200,0.4);
  }
  .scroll-line {
    width: 1px; background: rgba(29,92,200,0.25);
    animation: breatheLine 2s ease-in-out infinite;
  }

  /* STATS STRIP */
  .stats-strip {
    background: var(--blue-brand);
    padding: 28px 48px;
    display: flex; align-items: center; justify-content: center;
    gap: 0;
  }
  .stat-item {
    flex: 1; text-align: center; max-width: 200px;
    padding: 0 24px;
    position: relative;
  }
  .stat-item + .stat-item::before {
    content: ''; position: absolute; left: 0; top: 50%;
    transform: translateY(-50%);
    height: 40px; width: 1px; background: rgba(255,255,255,0.2);
  }
  .stat-num {
    font-family: var(--font-display);
    font-size: 32px; font-weight: 700; color: white;
    line-height: 1.1;
  }
  .stat-label { font-size: 12px; color: rgba(255,255,255,0.7); margin-top: 4px; letter-spacing: 0.5px; }

  /* SECTION COMMON */
  .section { padding: 96px 48px; max-width: 1200px; margin: 0 auto; }
  .eyebrow {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 16px;
  }
  .eyebrow-line { width: 40px; height: 1px; background: var(--blue-brand); }
  .eyebrow-text {
    font-size: 11px; font-weight: 700; letter-spacing: 2.5px;
    text-transform: uppercase; color: var(--blue-brand);
  }
  .section-title {
    font-family: var(--font-display);
    font-size: clamp(32px, 4vw, 52px);
    font-weight: 700; line-height: 1.15; color: var(--blue-deep);
    margin-bottom: 16px;
  }
  .section-title em { font-style: italic; color: var(--blue-brand); }

  /* STORY */
  .story-wrapper {
    display: grid; grid-template-columns: 1fr 400px;
    gap: 80px; align-items: center;
  }
  .story-text p {
    font-size: 16px; line-height: 1.8; color: var(--gray-700);
    margin-bottom: 20px;
  }
  .story-quote {
    border-left: 3px solid var(--blue-brand);
    padding: 20px 28px; margin: 32px 0;
    background: var(--blue-pale); border-radius: 0 12px 12px 0;
  }
  .story-quote p {
    font-family: var(--font-display);
    font-style: italic; font-size: 17px;
    color: var(--blue-deep); line-height: 1.6; margin: 0;
  }
  .story-visual {
    background: linear-gradient(145deg, var(--blue-pale) 0%, #dbeafe 100%);
    border-radius: 24px; padding: 40px;
    text-align: center;
    transition: transform 0.4s, box-shadow 0.4s;
    border: 1px solid rgba(29,92,200,0.1);
    cursor: default;
  }
  .story-visual:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-blue);
  }
  .drop-icon {
    font-size: 64px; margin-bottom: 20px;
    animation: dropFall 1s ease both 0.3s;
    display: block;
  }
  .brand-name-card {
    font-family: var(--font-display);
    font-size: 22px; font-weight: 700; color: var(--blue-deep);
    margin-bottom: 6px;
  }
  .brand-tagline-card { font-size: 13px; color: var(--gray-500); margin-bottom: 24px; }
  .badge-row { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
  .story-badge {
    padding: 7px 16px; border-radius: 50px;
    border: 1.5px solid var(--blue-brand);
    font-size: 12px; font-weight: 600; color: var(--blue-brand);
    cursor: default; transition: all 0.25s;
    letter-spacing: 0.3px;
  }
  .story-badge:hover {
    background: var(--blue-brand); color: white;
    transform: translateY(-1px);
  }

  /* VALUES */
  .values-section {
    background: var(--gray-50);
    padding: 96px 0;
  }
  .values-inner { max-width: 1200px; margin: 0 auto; padding: 0 48px; }
  .values-header { text-align: center; margin-bottom: 64px; }
  .values-sub {
    font-size: 17px; color: var(--gray-500); max-width: 520px;
    margin: 0 auto; line-height: 1.7;
  }
  .values-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .value-card {
    background: white; border-radius: var(--radius);
    padding: 36px 32px;
    border: 1px solid var(--gray-100);
    transition: transform 0.35s, box-shadow 0.35s;
    position: relative; overflow: hidden;
    cursor: default;
  }
  .value-card::after {
    content: ''; position: absolute;
    bottom: 0; left: 0; right: 0; height: 3px;
    background: var(--blue-brand);
    transform: scaleX(0) translateX(-100%);
    transform-origin: left;
    transition: transform 0.4s ease;
  }
  .value-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-blue); }
  .value-card:hover::after { transform: scaleX(1) translateX(0); }
  .value-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: var(--blue-pale);
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; margin-bottom: 20px;
    transition: background 0.3s;
  }
  .value-card:hover .value-icon { background: var(--blue-brand); }
  .value-title {
    font-family: var(--font-display);
    font-size: 19px; font-weight: 700;
    color: var(--blue-deep); margin-bottom: 10px;
  }
  .value-desc { font-size: 14px; color: var(--gray-500); line-height: 1.7; }

  /* BUSINESS DETAILS + JOURNEY */
  .details-section {
    padding: 96px 48px; max-width: 1200px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 80px; align-items: start;
  }
  .info-table {
    width: 100%; border-collapse: collapse; margin-top: 24px;
  }
  .info-table td {
    padding: 14px 0; border-bottom: 1px solid var(--gray-100);
    font-size: 14px; vertical-align: top;
  }
  .info-table td:first-child {
    font-weight: 600; color: var(--gray-500);
    text-transform: uppercase; font-size: 11px;
    letter-spacing: 1px; width: 35%; padding-right: 20px;
  }
  .info-table td:last-child { color: var(--gray-900); }
  .info-card {
    background: var(--blue-brand); border-radius: var(--radius);
    padding: 28px 36px; margin-top: 24px;
    display: flex; align-items: center; gap: 12px;
  }
  .info-card-icon { font-size: 22px; }
  .info-card-text { font-size: 14px; font-weight: 700; color: white; }

  /* TIMELINE */
  .timeline { margin-top: 24px; position: relative; }
  .timeline::before {
    content: ''; position: absolute; left: 9px; top: 6px; bottom: 6px;
    width: 2px; background: linear-gradient(to bottom, var(--blue-brand), var(--blue-light));
  }
  .timeline-item { padding-left: 36px; margin-bottom: 36px; position: relative; }
  .timeline-dot {
    position: absolute; left: 0; top: 5px;
    width: 20px; height: 20px; border-radius: 50%;
    background: var(--blue-brand);
    border: 3px solid white;
    box-shadow: 0 0 0 2px var(--blue-brand);
    animation: timelineDot 2.5s ease-in-out infinite;
  }
  .timeline-dot.past { background: var(--blue-bright); animation: none; }
  .timeline-date {
    font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--blue-brand); margin-bottom: 6px;
  }
  .timeline-title {
    font-family: var(--font-display);
    font-size: 17px; font-weight: 700; color: var(--blue-deep); margin-bottom: 6px;
  }
  .timeline-desc { font-size: 14px; color: var(--gray-500); line-height: 1.6; }

  /* PRODUCTS */
  .products-section {
    background: var(--blue-deep); padding: 96px 48px;
  }
  .products-inner { max-width: 1200px; margin: 0 auto; }
  .products-header { margin-bottom: 56px; }
  .products-header .eyebrow-line { background: var(--accent); }
  .products-header .eyebrow-text { color: var(--accent); }
  .products-header .section-title { color: white; }
  .products-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  .product-chip {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: var(--radius-sm);
    padding: 20px 24px;
    display: flex; align-items: center; gap: 14px;
    transition: background 0.3s, border-color 0.3s, transform 0.3s;
    cursor: default;
  }
  .product-chip:hover {
    background: rgba(255,255,255,0.12);
    border-color: rgba(96,165,250,0.4);
    transform: translateX(6px);
  }
  .chip-dot {
    width: 10px; height: 10px; border-radius: 50%;
    background: var(--accent); flex-shrink: 0;
    transition: transform 0.3s;
  }
  .product-chip:hover .chip-dot { transform: scale(1.5); }
  .chip-text { font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.85); }

  /* CONTACT */
  .contact-section {
    background: linear-gradient(135deg, var(--gray-900) 0%, var(--blue-deep) 60%, var(--blue-mid) 100%);
    padding: 96px 48px;
    position: relative; overflow: hidden;
  }
  .contact-glow {
    position: absolute;
    width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%);
    left: 50%; top: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
  .contact-inner { max-width: 1200px; margin: 0 auto; position: relative; z-index: 1; }
  .contact-header { text-align: center; margin-bottom: 64px; }
  .contact-header .eyebrow-line { background: var(--accent); }
  .contact-header .eyebrow-text { color: var(--accent); }
  .contact-header .eyebrow { justify-content: center; }
  .contact-title {
    font-family: var(--font-display);
    font-size: clamp(36px, 5vw, 62px);
    font-weight: 700; color: white; line-height: 1.1; margin-bottom: 16px;
  }
  .contact-title em { font-style: italic; color: var(--accent); }
  .contact-sub { font-size: 17px; color: rgba(255,255,255,0.5); }
  .contact-grid {
    display: grid; grid-template-columns: repeat(2, 1fr);
    gap: 20px; max-width: 700px; margin: 0 auto;
  }
  .contact-card {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: var(--radius);
    padding: 28px 28px;
    transition: background 0.3s, border-color 0.3s, transform 0.3s, box-shadow 0.3s;
    cursor: default;
  }
  .contact-card:hover {
    background: rgba(255,255,255,0.1);
    border-color: rgba(96,165,250,0.3);
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  }
  .contact-icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; margin-bottom: 16px;
    transition: background 0.3s;
  }
  .contact-card:hover .contact-icon { background: var(--blue-brand); }
  .contact-label {
    font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
    text-transform: uppercase; color: rgba(255,255,255,0.4);
    margin-bottom: 8px;
  }
  .contact-value { font-size: 15px; color: rgba(255,255,255,0.85); line-height: 1.6; }
  .contact-value a {
    color: var(--accent); text-decoration: none;
    transition: color 0.2s;
  }
  .contact-value a:hover { color: white; }

  /* FOOTER */
  .footer {
    background: var(--gray-900); padding: 28px 48px;
    text-align: center;
  }
  .footer-text {
    font-size: 13px; color: rgba(255,255,255,0.3);
  }
  .footer-text span { color: rgba(255,255,255,0.5); }

  /* REVEAL ANIMATION */
  .reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
  .reveal.visible { opacity: 1; transform: translateY(0); }
  .reveal-delay-1 { transition-delay: 0.1s; }
  .reveal-delay-2 { transition-delay: 0.2s; }
  .reveal-delay-3 { transition-delay: 0.3s; }
  .reveal-delay-4 { transition-delay: 0.4s; }
  .reveal-delay-5 { transition-delay: 0.5s; }

  /* GRADIENT DIVIDER */
  .grad-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--blue-light), transparent);
  }

  @media (max-width: 900px) {
    .section { padding: 64px 24px; }
    .story-wrapper { grid-template-columns: 1fr; gap: 40px; }
    .values-grid { grid-template-columns: 1fr 1fr; }
    .details-section { grid-template-columns: 1fr; gap: 48px; padding: 64px 24px; }
    .products-grid { grid-template-columns: 1fr 1fr; }
    .contact-grid { grid-template-columns: 1fr; }
    .stats-strip { gap: 0; padding: 24px; flex-wrap: wrap; }
  }

  @media (max-width: 600px) {
    .values-grid { grid-template-columns: 1fr; }
    .products-grid { grid-template-columns: 1fr; }
    .hero-title { font-size: 38px; }
  }
`;

const values = [
  { icon: "💧", title: "Purity First", desc: "Every bottle undergoes rigorous purification ensuring the cleanest, safest mineral water reaches you." },
  { icon: "🤝", title: "Customer First", desc: "We believe satisfaction matters as much as the product. Our team is always courteous and prompt." },
  { icon: "📍", title: "Local Roots", desc: "Proudly based in Arera Colony, Bhopal — deeply connected to the community we serve every day." },
  { icon: "🚀", title: "Growing Vision", desc: "We continually expand our product lines to serve a wider client base across Madhya Pradesh." },
  { icon: "✅", title: "Quality Assured", desc: "GST-registered and fully compliant, our operations meet every standard for trust and quality." },
  { icon: "⚡", title: "Fast Delivery", desc: "Reliable, prompt delivery to your home or business — making pure water always accessible." },
];

const timeline = [
  { date: "May 2024", title: "GST Registration Completed", desc: "Lave Mineral Water officially established as a partnership firm in Bhopal.", past: true },
  { date: "Mid 2024", title: "Distribution Launched", desc: "Launch of packaged mineral water distribution across Arera Colony and surrounding localities.", past: true },
  { date: "Late 2024", title: "Business Expansion", desc: "Expanded to bulk supply, water cans, and home delivery services for residential and business customers.", past: true },
  { date: "2025", title: "New Product Lines", desc: "Ongoing expansion to new product lines and a larger client base across Madhya Pradesh.", past: false },
];

const products = [
  "Packaged Water", "Bulk Supply", "Water Cans", "Jar Delivery", "Home Delivery", "Business Orders",
];

export default function LaveMineralAboutUs() {
  const revealRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const addReveal = (el: HTMLElement | null, delay = 0) => {
    if (el) {
      el.classList.add("reveal");
      if (delay) el.classList.add(`reveal-delay-${delay}`);
      revealRefs.current.push(el);
    }
  };

  return (
    <>
      <style>{styles}</style>

      {/* HERO — light blue/white theme, no navbar */}
      <section className="hero">
        <div className="hero-ripple ripple-1" />
        <div className="hero-ripple ripple-2" />
        <div className="hero-ripple ripple-3" />
        <div className="hero-blob blob-1" />
        <div className="hero-blob blob-2" />
        <div className="hero-blob blob-3" />
        <div className="hero-badge">
          <div className="badge-dot" />
          <span className="badge-text">GST Registered · Bhopal, MP</span>
        </div>
        <h1 className="hero-title">
          About <em>Lave</em><br />Mineral Water
        </h1>
        <p className="hero-sub">
          Lave Mineral Water brings certified pure, mineral-rich water directly to your home or business across Arera Colony and beyond.
        </p>
        <div className="hero-actions">
          <button className="btn-primary">Order Water</button>
          <button className="btn-secondary">Our Story ↓</button>
        </div>
        <div className="scroll-indicator">
          <span className="scroll-text">Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* STATS STRIP */}
      <div className="stats-strip">
        {[
          { num: "2024", label: "GST Registered" },
          { num: "100%", label: "Pure Mineral Water" },
          { num: "Arera", label: "Colony, Bhopal" },
          { num: "24/7", label: "Customer Support" },
        ].map((s, i) => (
          <div className="stat-item" key={i}>
            <div className="stat-num">{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* STORY */}
      <div className="grad-divider" />
      <section id="story" className="section">
        <div className="story-wrapper">
          <div className="story-text">
            <div className="eyebrow" ref={(el) => addReveal(el as HTMLElement | null)}>
              <div className="eyebrow-line" />
              <span className="eyebrow-text">Our Story</span>
            </div>
            <h2 className="section-title" ref={(el) => addReveal(el as HTMLElement | null, 1)}>
              Born from a belief<br />in <em>pure water</em>
            </h2>
            <p ref={(el) => addReveal(el as HTMLElement | null, 2)}>
              Lave Mineral Water is a registered partnership firm rooted in the heart of Bhopal, Madhya Pradesh. GST-registered in May 2024, we set out with a single conviction — that every person deserves access to genuinely pure, mineral-rich water.
            </p>
            <p ref={(el) => addReveal(el as HTMLElement | null, 3)}>
              Located prominently in Arera Colony, we act as a one-stop destination for customers both local and from across Bhopal. Our team is dedicated, courteous, and always ready to assist with any query you may have.
            </p>
            <div className="story-quote" ref={(el) => addReveal(el as HTMLElement | null, 4)}>
              <p>"Customer satisfaction is as important as the products and services we offer — this belief is the core of everything we do at Lave."</p>
            </div>
          </div>
          <div className="story-visual" ref={(el) => addReveal(el as HTMLElement | null, 2)}>
            <span className="drop-icon">💧</span>
            <div className="brand-name-card">Lave Mineral Water</div>
            <div className="brand-tagline-card">Pure · Natural · Trusted</div>
            <div className="badge-row">
              <span className="story-badge">Mineral Rich</span>
              <span className="story-badge">BIS Compliant</span>
              <span className="story-badge">Bhopal's Own</span>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <div className="grad-divider" />
      <section id="values" className="values-section">
        <div className="values-inner">
          <div className="values-header">
            <div className="eyebrow" style={{ justifyContent: "center" }} ref={(el) => addReveal(el as HTMLElement | null)}>
              <div className="eyebrow-line" />
              <span className="eyebrow-text">Why Choose Us</span>
              <div className="eyebrow-line" />
            </div>
            <h2 className="section-title" ref={(el) => addReveal(el as HTMLElement | null, 1)}>
              Our core <em>values</em>
            </h2>
            <p className="values-sub" ref={(el) => addReveal(el as HTMLElement | null, 2)}>
              Everything we do is driven by these principles — for our customers, our community, and our planet.
            </p>
          </div>
          <div className="values-grid">
            {values.map((v, i) => (
              <div className="value-card" key={i} ref={(el) => addReveal(el as HTMLElement | null, (i % 3 + 1) as 1 | 2 | 3)}>
                <div className="value-icon">{v.icon}</div>
                <div className="value-title">{v.title}</div>
                <div className="value-desc">{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BUSINESS DETAILS + JOURNEY */}
      <div className="grad-divider" />
      <div id="details" className="details-section">
        <div>
          <div className="eyebrow" ref={(el) => addReveal(el as HTMLElement | null)}>
            <div className="eyebrow-line" />
            <span className="eyebrow-text">Business Details</span>
          </div>
          <h2 className="section-title" ref={(el) => addReveal(el as HTMLElement | null, 1)}>
            Registered &amp; <em>verified</em><br />by law
          </h2>
          <p style={{ color: "var(--gray-500)", fontSize: 15, lineHeight: 1.7, marginBottom: 24 }} ref={(el) => addReveal(el as HTMLElement | null, 2)}>
            All our operations are fully compliant, transparent, and backed by official government registration — giving you complete peace of mind.
          </p>
          <table className="info-table" ref={(el) => addReveal(el as HTMLElement | null, 3)}>
            <tbody>
              {[
                ["Legal Name", "LAVE MINERAL WATER"],
                ["Status", "Registered Partnership Firm"],
                ["GST Date", "30 May 2024"],
                ["Category", "Mineral Water Manufacturer"],
                ["Address", "Flat No. 53, MIG Anand Apartment, Near 12 No. Bus Stop, E 7 Arera Colony, Bhopal – 462016"],
              ].map(([k, v]) => (
                <tr key={k}><td>{k}</td><td>{v}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="info-card" ref={(el) => addReveal(el as HTMLElement | null, 4)}>
            <span className="info-card-icon">🏢</span>
            <span className="info-card-text">Company Information</span>
          </div>
        </div>

        <div>
          <div className="eyebrow" ref={(el) => addReveal(el as HTMLElement | null)}>
            <div className="eyebrow-line" />
            <span className="eyebrow-text">Our Journey</span>
          </div>
          <h2 className="section-title" ref={(el) => addReveal(el as HTMLElement | null, 1)}>
            Milestones &amp; <em>products</em>
          </h2>
          <div className="timeline" ref={(el) => addReveal(el as HTMLElement | null, 2)}>
            {timeline.map((t, i) => (
              <div className="timeline-item" key={i}>
                <div className={`timeline-dot${t.past ? " past" : ""}`} />
                <div className="timeline-date">{t.date}</div>
                <div className="timeline-title">{t.title}</div>
                <div className="timeline-desc">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRODUCTS */}
      <div className="grad-divider" />
      <section className="products-section">
        <div className="products-inner">
          <div className="products-header" ref={(el) => addReveal(el as HTMLElement | null)}>
            <div className="eyebrow">
              <div className="eyebrow-line" />
              <span className="eyebrow-text">What We Offer</span>
            </div>
            <h2 className="section-title">Water for every <em>need</em></h2>
          </div>
          <div className="products-grid">
            {products.map((p, i) => (
              <div className="product-chip" key={i} ref={(el) => addReveal(el as HTMLElement | null, (i % 3 + 1) as 1 | 2 | 3)}>
                <div className="chip-dot" />
                <span className="chip-text">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="contact-section">
        <div className="contact-glow" />
        <div className="contact-inner">
          <div className="contact-header">
            <div className="eyebrow" ref={(el) => addReveal(el as HTMLElement | null)}>
              <div className="eyebrow-line" />
              <span className="eyebrow-text">Get In Touch</span>
              <div className="eyebrow-line" />
            </div>
            <h2 className="contact-title" ref={(el) => addReveal(el as HTMLElement | null, 1)}>
              Visit or <em>call us</em> today
            </h2>
            <p className="contact-sub" ref={(el) => addReveal(el as HTMLElement | null, 2)}>
              We're always here to fulfill your water needs — quickly, locally, and with a smile.
            </p>
          </div>
          <div className="contact-grid">
            {[
              { icon: "📞", label: "Phone Numbers", value: <>
                <a href="tel:+919669903474">+91 96699 03474</a><br />
                <a href="tel:+918719900277">+91 87199 00277</a>
              </> },
              { icon: "📍", label: "Visit Us", value: "Near Radisson Hotel, Gulmohar Colony, Bhopal – 462016" },
              { icon: "🕐", label: "Business Hours", value: "Mon – Sat: 9am – 7pm\nSunday: 10am – 4pm" },
              { icon: "🗺️", label: "Service Areas", value: "Bhopal & surrounding areas\nHome & office delivery available" },
            ].map((c, i) => (
              <div className="contact-card" key={i} ref={(el) => addReveal(el as HTMLElement | null, (i % 2 + 1) as 1 | 2)}>
                <div className="contact-icon">{c.icon}</div>
                <div className="contact-label">{c.label}</div>
                <div className="contact-value">{c.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p className="footer-text">
          © 2024 <span>Lave Mineral Water</span> · Registered Partnership Firm · Bhopal, Madhya Pradesh
        </p>
      </footer>
    </>
  );
}