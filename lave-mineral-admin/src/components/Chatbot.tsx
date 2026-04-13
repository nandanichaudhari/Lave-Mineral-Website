"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";

const ADMIN_PHONE = "917000939190";
const ADMIN_DISPLAY = "+91 7000939190";
const WA_LINK = `https://wa.me/${ADMIN_PHONE}`;
const WA_SUPPORT = `https://wa.me/${ADMIN_PHONE}?text=Hi%2C%20I%20need%20support%20from%20Lave%20Mineral`;

const CSS = `
.lave-chatbot-root {
  --lv-navy: #0a1628;
  --lv-navy2: #102040;
  --lv-blue: #1a6fa8;
  --lv-sky: #2d9fe3;
  --lv-ice: #e8f5fd;
  --lv-frost: #f4faff;
  --lv-white: #ffffff;
  --lv-slate: #4a5e72;
  --lv-mist: #8da3b5;
  --lv-border: #d4e8f5;
  --lv-gold2: #e8c96a;
  --lv-green: #2ecc8a;
  --lv-red: #f43f5e;
  --lv-shadow-lg: 0 24px 64px rgba(10, 22, 40, 0.22);
}

.lave-chatbot-root *,
.lave-chatbot-root *::before,
.lave-chatbot-root *::after {
  box-sizing: border-box;
}

.lave-chatbot-root .lv-toggle {
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(145deg, var(--lv-sky), var(--lv-blue));
  border: none;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(45, 159, 227, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s;
}

.lave-chatbot-root .lv-toggle:hover {
  transform: scale(1.12);
  box-shadow: 0 12px 44px rgba(45, 159, 227, 0.7);
}

.lave-chatbot-root .lv-badge {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 16px;
  height: 16px;
  background: #f43f5e;
  border-radius: 50%;
  border: 2.5px solid white;
  animation: lv-blink 2s infinite;
}

@keyframes lv-blink {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: .7; transform: scale(1.25); }
}

.lave-chatbot-root .lv-win {
  position: fixed;
  bottom: 108px;
  right: 28px;
  width: 400px;
  max-width: calc(100vw - 36px);
  height: 600px;
  max-height: calc(100vh - 148px);
  background: var(--lv-white);
  border-radius: 20px;
  box-shadow: var(--lv-shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 9998;
  border: 1px solid rgba(26, 111, 168, 0.15);
  transform-origin: bottom right;
  transition: transform .35s cubic-bezier(.34,1.56,.64,1), opacity .28s ease;
}

.lave-chatbot-root .lv-win.lv-closed {
  transform: scale(.88) translateY(22px);
  opacity: 0;
  pointer-events: none;
}

.lave-chatbot-root .lv-win.lv-open {
  transform: scale(1) translateY(0);
  opacity: 1;
  pointer-events: all;
}

.lave-chatbot-root .c-head {
  background: linear-gradient(135deg, var(--lv-navy) 0%, var(--lv-navy2) 50%, #0e3a6a 100%);
  padding: 18px 20px 15px;
  display: flex;
  align-items: center;
  gap: 13px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.lave-chatbot-root .c-head::after {
  content: "";
  position: absolute;
  right: -20px;
  top: -20px;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(45,159,227,.2) 0%, transparent 70%);
  border-radius: 50%;
}

.lave-chatbot-root .c-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--lv-sky), var(--lv-blue));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(45,159,227,.4);
}

.lave-chatbot-root .c-head-info h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--lv-white);
  letter-spacing: .02em;
  margin: 0;
}

.lave-chatbot-root .c-head-info p {
  font-size: .72rem;
  font-weight: 400;
  color: rgba(255,255,255,.6);
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 2px 0 0;
}

.lave-chatbot-root .online {
  width: 7px;
  height: 7px;
  background: var(--lv-green);
  border-radius: 50%;
  display: inline-block;
  animation: lv-blink 2.5s infinite;
}

.lave-chatbot-root .end-chat-btn {
  margin-left: auto;
  background: rgba(244,63,94,0.15);
  color: #f87171;
  border: 1px solid rgba(244,63,94,0.3);
  border-radius: 8px;
  padding: 5px 10px;
  font-size: .68rem;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: .03em;
  flex-shrink: 0;
  transition: all .2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.lave-chatbot-root .end-chat-btn:hover {
  background: rgba(244,63,94,0.3);
  color: #fff;
  border-color: rgba(244,63,94,0.6);
}

.lave-chatbot-root .chips {
  display: flex;
  gap: 7px;
  padding: 11px 14px 9px;
  overflow-x: auto;
  scrollbar-width: none;
  flex-shrink: 0;
  background: var(--lv-frost);
  border-bottom: 1px solid var(--lv-border);
}

.lave-chatbot-root .chips::-webkit-scrollbar {
  display: none;
}

.lave-chatbot-root .chip {
  white-space: nowrap;
  padding: 5px 13px;
  border-radius: 20px;
  border: 1px solid var(--lv-border);
  background: var(--lv-white);
  color: var(--lv-blue);
  font-size: .72rem;
  font-weight: 600;
  letter-spacing: .02em;
  cursor: pointer;
  flex-shrink: 0;
  transition: all .2s;
}

.lave-chatbot-root .chip:hover {
  background: var(--lv-blue);
  color: var(--lv-white);
  border-color: var(--lv-blue);
}

.lave-chatbot-root .msgs {
  flex: 1;
  overflow-y: auto;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 13px;
  scroll-behavior: smooth;
}

.lave-chatbot-root .msgs::-webkit-scrollbar {
  width: 3px;
}

.lave-chatbot-root .msgs::-webkit-scrollbar-thumb {
  background: var(--lv-border);
  border-radius: 4px;
}

.lave-chatbot-root .msg {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  animation: lv-pop .25s ease;
}

@keyframes lv-pop {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.lave-chatbot-root .msg.user {
  flex-direction: row-reverse;
}

.lave-chatbot-root .m-av {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--lv-frost);
  border: 1.5px solid var(--lv-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: .9rem;
  flex-shrink: 0;
}

.lave-chatbot-root .msg.user .m-av {
  background: linear-gradient(135deg, var(--lv-sky), var(--lv-blue));
  border: none;
}

.lave-chatbot-root .bbl {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: .83rem;
  line-height: 1.6;
  color: var(--lv-navy);
  word-break: break-word;
}

.lave-chatbot-root .msg.bot .bbl {
  background: var(--lv-frost);
  border: 1px solid var(--lv-border);
  border-bottom-left-radius: 4px;
}

.lave-chatbot-root .msg.user .bbl {
  background: linear-gradient(135deg, var(--lv-sky), var(--lv-blue));
  color: white;
  border-bottom-right-radius: 4px;
}

.lave-chatbot-root .agent-choice {
  background: var(--lv-white);
  border: 1px solid var(--lv-border);
  border-radius: 13px;
  padding: 14px;
  margin-top: 9px;
}

.lave-chatbot-root .agent-choice p {
  font-size: .82rem;
  color: var(--lv-slate);
  margin-bottom: 10px;
  line-height: 1.5;
}

.lave-chatbot-root .choice-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1.5px solid var(--lv-border);
  background: var(--lv-white);
  color: var(--lv-blue);
  font-size: .82rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 8px;
  transition: all .2s;
  text-align: left;
}

.lave-chatbot-root .choice-btn:last-child {
  margin-bottom: 0;
}

.lave-chatbot-root .choice-btn:hover {
  background: var(--lv-blue);
  color: white;
  border-color: var(--lv-blue);
}

.lave-chatbot-root .choice-btn span {
  font-size: .9rem;
}

.lave-chatbot-root .end-overlay {
  position: absolute;
  inset: 0;
  background: rgba(10,22,40,0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.lave-chatbot-root .end-box {
  background: white;
  border-radius: 16px;
  padding: 28px 24px;
  text-align: center;
  max-width: 280px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.lave-chatbot-root .end-box h4 {
  font-size: 1.1rem;
  color: var(--lv-navy);
  margin-bottom: 8px;
}

.lave-chatbot-root .end-box p {
  font-size: .82rem;
  color: var(--lv-slate);
  margin-bottom: 18px;
  line-height: 1.5;
}

.lave-chatbot-root .end-ended {
  text-align: center;
  padding: 40px 20px;
}

.lave-chatbot-root .end-ended .end-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.lave-chatbot-root .end-ended h4 {
  font-size: 1.1rem;
  color: var(--lv-navy);
  margin-bottom: 6px;
}

.lave-chatbot-root .end-ended p {
  font-size: .82rem;
  color: var(--lv-mist);
}

.lave-chatbot-root .card {
  background: var(--lv-white);
  border: 1px solid var(--lv-border);
  border-radius: 13px;
  padding: 14px;
  margin-top: 9px;
  font-size: .8rem;
}

.lave-chatbot-root .card-title {
  font-size: .95rem;
  color: var(--lv-navy);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 7px;
  font-weight: 700;
}

.lave-chatbot-root .cinfo-row {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 6px 0;
  border-bottom: 1px solid var(--lv-frost);
  font-size: .79rem;
  color: var(--lv-slate);
}

.lave-chatbot-root .cinfo-row:last-of-type {
  border-bottom: none;
}

.lave-chatbot-root .cinfo-row strong {
  color: var(--lv-navy);
  min-width: 80px;
  font-weight: 600;
}

.lave-chatbot-root .cta-row {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.lave-chatbot-root .cta-btn {
  flex: 1;
  min-width: 100px;
  padding: 8px 12px;
  border-radius: 9px;
  border: none;
  cursor: pointer;
  font-size: .76rem;
  font-weight: 600;
  letter-spacing: .03em;
  text-align: center;
  text-decoration: none;
  transition: all .2s;
  display: inline-block;
}

.lave-chatbot-root .cta-primary {
  background: var(--lv-blue);
  color: white;
}

.lave-chatbot-root .cta-primary:hover {
  background: var(--lv-navy);
}

.lave-chatbot-root .cta-ghost {
  background: var(--lv-frost);
  color: var(--lv-blue);
  border: 1px solid var(--lv-border) !important;
}

.lave-chatbot-root .cta-ghost:hover {
  background: var(--lv-ice);
  border-color: var(--lv-sky) !important;
}

.lave-chatbot-root .cta-wa {
  background: #25d366;
  color: white;
}

.lave-chatbot-root .cta-wa:hover {
  background: #1da851;
}

.lave-chatbot-root .trk-id {
  font-size: .76rem;
  color: var(--lv-mist);
  letter-spacing: .06em;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.lave-chatbot-root .trk-id strong {
  color: var(--lv-navy);
}

.lave-chatbot-root .trk-step {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 7px 0;
  position: relative;
}

.lave-chatbot-root .trk-step:not(:last-child)::after {
  content: "";
  position: absolute;
  left: 13px;
  top: 30px;
  width: 2px;
  height: calc(100% - 4px);
  background: var(--lv-border);
}

.lave-chatbot-root .trk-dot {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: .75rem;
  flex-shrink: 0;
  font-weight: 700;
}

.lave-chatbot-root .trk-dot.done {
  background: var(--lv-green);
  color: white;
}

.lave-chatbot-root .trk-dot.active {
  background: var(--lv-sky);
  color: white;
  animation: lv-blink 2s infinite;
}

.lave-chatbot-root .trk-dot.wait {
  background: var(--lv-frost);
  color: var(--lv-mist);
  border: 1.5px solid var(--lv-border);
}

.lave-chatbot-root .trk-info b {
  font-size: .81rem;
  color: var(--lv-navy);
  font-weight: 600;
  display: block;
}

.lave-chatbot-root .trk-info small {
  font-size: .71rem;
  color: var(--lv-mist);
  display: block;
}

.lave-chatbot-root .prod-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 8px;
}

.lave-chatbot-root .prod-item {
  background: var(--lv-frost);
  border: 1px solid var(--lv-border);
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.lave-chatbot-root .pname {
  font-size: .78rem;
  font-weight: 700;
  color: var(--lv-navy);
}

.lave-chatbot-root .pdesc {
  font-size: .7rem;
  color: var(--lv-mist);
}

.lave-chatbot-root .pprice {
  font-size: .82rem;
  font-weight: 700;
  color: var(--lv-blue);
  margin-top: 3px;
}

.lave-chatbot-root .label-wrap {
  display: flex;
  gap: 14px;
  align-items: center;
  margin-top: 8px;
}

.lave-chatbot-root .lbl-prev {
  width: 64px;
  height: 108px;
  flex-shrink: 0;
  background: linear-gradient(160deg, var(--lv-white), var(--lv-ice));
  border-radius: 9px;
  border: 2px solid var(--lv-sky);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  box-shadow: 0 6px 20px rgba(45,159,227,.18);
}

.lave-chatbot-root .lw {
  font-size: 1.4rem;
}

.lave-chatbot-root .lt {
  font-size: .55rem;
  font-weight: 700;
  color: var(--lv-navy);
  letter-spacing: .08em;
}

.lave-chatbot-root .ls {
  font-size: .45rem;
  color: var(--lv-mist);
  letter-spacing: .06em;
}

.lave-chatbot-root .lbl-prev hr {
  width: 36px;
  border: none;
  border-top: 1px solid var(--lv-border);
  margin: 2px 0;
}

.lave-chatbot-root .label-features {
  list-style: none;
  padding: 0;
  margin: 0;
}

.lave-chatbot-root .label-features li {
  font-size: .77rem;
  color: var(--lv-slate);
  padding: 2px 0;
  display: flex;
  align-items: center;
  gap: 5px;
}

.lave-chatbot-root .label-features li::before {
  content: "✓";
  color: var(--lv-sky);
  font-weight: 700;
  font-size: .75rem;
}

.lave-chatbot-root .stars-row {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin: 12px 0;
}

.lave-chatbot-root .star {
  font-size: 1.7rem;
  cursor: pointer;
  transition: transform .2s;
  filter: grayscale(1);
  opacity: .4;
  user-select: none;
}

.lave-chatbot-root .star.lit {
  filter: none;
  opacity: 1;
  transform: scale(1.15);
}

.lave-chatbot-root .star:hover {
  transform: scale(1.25);
}

.lave-chatbot-root .review-ta {
  width: 100%;
  border: 1px solid var(--lv-border);
  border-radius: 9px;
  padding: 9px 12px;
  font-size: .8rem;
  color: var(--lv-navy);
  resize: none;
  outline: none;
  transition: border-color .2s;
  min-height: 72px;
}

.lave-chatbot-root .review-ta:focus {
  border-color: var(--lv-sky);
}

.lave-chatbot-root .review-sent {
  text-align: center;
  padding: 10px 0 4px;
  font-size: .85rem;
  color: var(--lv-green);
  font-weight: 600;
}

.lave-chatbot-root .sug-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 9px;
}

.lave-chatbot-root .sug {
  padding: 5px 12px;
  border: 1px solid var(--lv-border);
  border-radius: 14px;
  font-size: .74rem;
  color: var(--lv-blue);
  background: var(--lv-white);
  cursor: pointer;
  font-weight: 500;
  transition: all .2s;
}

.lave-chatbot-root .sug:hover {
  background: var(--lv-blue);
  color: white;
  border-color: var(--lv-blue);
}

.lave-chatbot-root .typing-dot {
  display: flex;
  gap: 5px;
  padding: 10px 13px;
  background: var(--lv-frost);
  border: 1px solid var(--lv-border);
  border-radius: 14px;
  border-bottom-left-radius: 3px;
  width: fit-content;
}

.lave-chatbot-root .typing-dot span {
  width: 6px;
  height: 6px;
  background: var(--lv-sky);
  border-radius: 50%;
  display: inline-block;
  animation: lv-td .9s infinite;
}

.lave-chatbot-root .typing-dot span:nth-child(2) {
  animation-delay: .15s;
}

.lave-chatbot-root .typing-dot span:nth-child(3) {
  animation-delay: .3s;
}

@keyframes lv-td {
  0%, 80%, 100% { transform: translateY(0); opacity: .45; }
  40% { transform: translateY(-6px); opacity: 1; }
}

.lave-chatbot-root .c-input-wrap {
  padding: 12px 13px;
  border-top: 1px solid var(--lv-border);
  display: flex;
  gap: 9px;
  align-items: flex-end;
  background: var(--lv-white);
  flex-shrink: 0;
}

.lave-chatbot-root .cinput {
  flex: 1;
  border: 1.5px solid var(--lv-border);
  border-radius: 22px;
  padding: 9px 16px;
  font-size: .83rem;
  color: var(--lv-navy);
  outline: none;
  resize: none;
  max-height: 80px;
  line-height: 1.45;
  transition: border-color .2s;
  background: white;
}

.lave-chatbot-root .cinput:focus {
  border-color: var(--lv-sky);
}

.lave-chatbot-root .cinput:disabled {
  background: var(--lv-frost);
  cursor: not-allowed;
  opacity: .6;
}

.lave-chatbot-root .csend {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--lv-sky), var(--lv-blue));
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform .2s, box-shadow .2s;
  box-shadow: 0 4px 12px rgba(45,159,227,.35);
}

.lave-chatbot-root .csend:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(45,159,227,.5);
}

.lave-chatbot-root .csend:disabled {
  opacity: .4;
  cursor: not-allowed;
  transform: none;
}

.lave-chatbot-root .csend svg {
  width: 17px;
  height: 17px;
  fill: white;
}

.lave-chatbot-root .c-foot {
  text-align: center;
  font-size: .63rem;
  color: var(--lv-mist);
  padding: 4px 0 9px;
  letter-spacing: .06em;
  text-transform: uppercase;
  background: var(--lv-white);
  flex-shrink: 0;
}

.lave-chatbot-root .c-foot a {
  color: #25d366;
  text-decoration: none;
  font-weight: 600;
}

@media (max-width: 640px) {
  .lave-chatbot-root .lv-toggle {
    width: 58px;
    height: 58px;
    right: 16px;
    bottom: 16px;
  }

  .lave-chatbot-root .lv-win {
    right: 12px;
    left: 12px;
    bottom: 86px;
    width: auto;
    max-width: none;
    height: min(78vh, 620px);
  }

  .lave-chatbot-root .prod-grid {
    grid-template-columns: 1fr;
  }

  .lave-chatbot-root .bbl {
    max-width: 88%;
  }
}
`;

const SYS = `You are the official Virtual Assistant for LAVE MINERAL WATER — a premium Indian mineral water brand. You represent the brand with professionalism, warmth, and clarity.

BRAND: Lave Mineral Water | HQ: Bhopal, MP, India | Founded: 2018
Certifications: BIS IS 14543, FSSAI, ISO 9001:2015 | pH: 7.2–7.6

PRODUCTS:
1. Still 250ml — ₹18/btl, Case(24): ₹390
2. Still 500ml — ₹28/btl, Case(24): ₹620
3. Still 1L — ₹40/btl, Case(12): ₹440
4. Sparkling 330ml — ₹45/btl, Case(24): ₹990
5. Sparkling 750ml — ₹75/btl, Case(12): ₹820
6. Premium 1L — ₹55/btl, Case(12): ₹600
7. Premium 500ml — ₹38/btl, Case(24): ₹840
8. Bulk 20L Can — ₹180/can, Pack(4): ₹680
9. Custom Branded — from ₹60/btl (min 500 units)

ORDERS: Modify within 2hrs | Cancel within 4hrs (full refund) | 4–12hrs: 10% fee | After dispatch: no cancel
BULK DISCOUNTS: 5% (10–24 cases) | 10% (25–49) | 15% (50–99) | 20% (100+)
DELIVERY: Standard 2–5 days | Express 24–48hrs +₹80 | Same-day Bhopal +₹50 | Free above ₹1500

CONTACT: WhatsApp/Phone: +91 7000939190 | support@lave-mineral.com | Mon–Sat 9AM–7PM
RETURNS: Damaged: report 48hrs with photo | Wrong: report 24hrs | Refund: 5–7 days
PAYMENT: UPI, Cards, Net Banking, EMI 0% on ₹3000+, COD up to ₹2000

GUIDELINES:
- Professional, warm, solution-focused
- Concise unless detail needed
- Always mention WhatsApp +91 7000939190 when suggesting to contact
- Respond in user's language (Hindi or English)`;

type IntentKind = "track" | "contact" | "products" | "label" | "review" | null;

interface ApiMsg {
  role: "user" | "assistant";
  content: string;
}

interface Msg {
  id: string;
  kind: "user" | "bot";
  text: string;
  card?: IntentKind;
  withSugg?: boolean;
  isAgentChoice?: boolean;
}

let cssInjected = false;

function injectCSS(): void {
  if (cssInjected) return;
  cssInjected = true;
  const el = document.createElement("style");
  el.setAttribute("data-lave-chatbot", "true");
  el.textContent = CSS;
  document.head.appendChild(el);
}

let idCounter = 0;
const uid = (): string => String(++idCounter);
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

function fmt(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
}

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function detectIntent(text: string): IntentKind {
  if (
    /(lv-\d{6}|track.*order|order.*track|where.*my order|order.*status|shipment)/i.test(
      text
    )
  )
    return "track";

  if (
    /(label.*design|design.*label|custom.*label|label.*studio|bottle.*design|branded bottle)/i.test(
      text
    )
  )
    return "label";

  if (
    /(contact.*admin|speak.*human|talk.*person|reach.*team|connect.*support|admin|speak.*agent|need help.*urgent|whatsapp|call|phone number)/i.test(
      text
    )
  )
    return "contact";

  if (/(product|pricing|price|catalogue|catalog|what.*sell|bottle.*size|range)/i.test(text))
    return "products";

  if (/(review|feedback|rate|rating|experience)/i.test(text)) return "review";

  return null;
}

const TrackCard: React.FC = () => (
  <div className="card">
    <div className="card-title">
      <span>📦</span> Sample Order Status
    </div>
    <div className="trk-id">
      Order ID: <strong>LV-004821</strong> &nbsp;|&nbsp; Placed: 25 Mar 2026
    </div>
    {[
      { s: "done", label: "Order Placed & Confirmed", time: "25 Mar · 10:30 AM" },
      { s: "done", label: "Payment Confirmed", time: "25 Mar · 10:32 AM" },
      { s: "done", label: "Processing at Facility", time: "25 Mar · 2:00 PM" },
      { s: "done", label: "Quality Check Passed", time: "26 Mar · 9:00 AM" },
      { s: "active", label: "Out for Delivery", time: "Expected today by 6:00 PM" },
      { s: "wait", label: "Delivered", time: "" },
    ].map((row, i) => (
      <div className="trk-step" key={i}>
        <div className={`trk-dot ${row.s}`}>
          {row.s === "done" ? "✓" : row.s === "active" ? "→" : "○"}
        </div>
        <div className="trk-info">
          <b style={row.s === "wait" ? { color: "var(--lv-mist)" } : undefined}>
            {row.label}
          </b>
          {row.time && <small>{row.time}</small>}
        </div>
      </div>
    ))}
    <div style={{ marginTop: 10, fontSize: ".78rem", color: "var(--lv-slate)" }}>
      Provide your <strong>Order ID (LV-XXXXXX)</strong> for your specific order, or{" "}
      <a
        href={`${WA_SUPPORT}&text=Track%20my%20order`}
        target="_blank"
        rel="noreferrer"
        style={{ color: "var(--lv-sky)", fontWeight: 600 }}
      >
        WhatsApp us
      </a>.
    </div>
  </div>
);

const ContactCard: React.FC = () => (
  <div className="card">
    <div className="card-title">
      <span>📞</span> Lave Support Team
    </div>
    {[
      { ico: "💬", label: "WhatsApp", val: ADMIN_DISPLAY },
      { ico: "📞", label: "Phone", val: ADMIN_DISPLAY },
      { ico: "📧", label: "General", val: "support@lave-mineral.com" },
      { ico: "📧", label: "Bulk", val: "bulk@lave-mineral.com" },
      { ico: "🕐", label: "Hours", val: "Mon–Sat · 9AM–7PM IST" },
      { ico: "📍", label: "Office", val: "Govindpura, Bhopal – 462023, MP" },
    ].map((r, i) => (
      <div className="cinfo-row" key={i}>
        <span>{r.ico}</span>
        <strong>{r.label}:</strong>
        <span>{r.val}</span>
      </div>
    ))}
    <div className="cta-row">
      <a className="cta-btn cta-wa" href={WA_SUPPORT} target="_blank" rel="noreferrer">
        💬 WhatsApp Now
      </a>
      <a className="cta-btn cta-ghost" href={`tel:${ADMIN_PHONE}`}>
        📞 Call Us
      </a>
      <a className="cta-btn cta-ghost" href="mailto:support@lave-mineral.com">
        📧 Email
      </a>
    </div>
  </div>
);

const ProductsCard: React.FC<{ onSuggest: (text: string) => void }> = ({ onSuggest }) => (
  <div className="card">
    <div className="card-title">
      <span>🛒</span> Lave Product Catalogue
    </div>
    <div className="prod-grid">
      {[
        { n: "Still 250ml", d: "Case of 24 bottles", p: "₹18/btl · ₹390/case" },
        { n: "Still 500ml", d: "Case of 24 bottles", p: "₹28/btl · ₹620/case" },
        { n: "Still 1L", d: "Case of 12 bottles", p: "₹40/btl · ₹440/case" },
        { n: "Sparkling 330ml", d: "Naturally carbonated", p: "₹45/btl · ₹990/case" },
        { n: "Sparkling 750ml", d: "Naturally carbonated", p: "₹75/btl · ₹820/case" },
        { n: "Premium 1L", d: "pH 7.4 · Mineral-enriched", p: "₹55/btl · ₹600/case" },
        { n: "Bulk 20L Can", d: "Dispensing can", p: "₹180/can · ₹680/4" },
        { n: "Custom Branded", d: "Min. 500 units", p: "From ₹60/btl" },
      ].map((item, i) => (
        <div className="prod-item" key={i}>
          <div className="pname">{item.n}</div>
          <div className="pdesc">{item.d}</div>
          <div className="pprice">{item.p}</div>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 10, fontSize: ".75rem", color: "var(--lv-mist)" }}>
      ✦ Bulk discounts: 5% (10–24) · 10% (25–49) · 15% (50–99) · 20% (100+)
    </div>
    <div className="cta-row" style={{ marginTop: 10 }}>
      <a
        className="cta-btn cta-wa"
        href={`${WA_SUPPORT}&text=I%20want%20to%20place%20an%20order`}
        target="_blank"
        rel="noreferrer"
      >
        💬 Order via WhatsApp
      </a>
    </div>
    <div className="sug-row">
      <span className="sug" onClick={() => onSuggest("Place a bulk order")}>
        📋 Bulk Order
      </span>
      <span className="sug" onClick={() => onSuggest("How to place an order")}>
        🛒 How to Order
      </span>
      <span className="sug" onClick={() => onSuggest("Custom branded bottles")}>
        🎨 Custom Bottles
      </span>
    </div>
  </div>
);

const LabelCard: React.FC = () => (
  <div className="card">
    <div className="card-title">
      <span>🎨</span> Lave Label Studio
    </div>
    <div className="label-wrap">
      <div className="lbl-prev">
        <div className="lw">💧</div>
        <div className="lt">LAVE</div>
        <hr />
        <div className="ls">YOUR BRAND</div>
        <div className="ls">MINERAL WATER</div>
      </div>
      <ul className="label-features">
        {[
          "18 premium templates",
          "Upload logo/artwork",
          "Glossy, Matte & Holographic",
          "QR code integration",
          "Custom colours & typography",
          "Preview before ordering",
        ].map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
    </div>
    <div style={{ marginTop: 12, fontSize: ".77rem", color: "var(--lv-slate)", lineHeight: 1.7 }}>
      <strong>Specs:</strong> 65×100mm (1L) · 50×80mm (500ml) · 38×65mm (250ml)
      <br />
      Min. 500 bottles · Lead time: 5–7 days after approval
    </div>
    <div className="cta-row" style={{ marginTop: 12 }}>
      <a className="cta-btn cta-primary" href="/custom-bottle">
        🎨 Open Label Studio
      </a>
      <a
        className="cta-btn cta-wa"
        href={`${WA_SUPPORT}&text=I%20need%20custom%20label%20design`}
        target="_blank"
        rel="noreferrer"
      >
        💬 WhatsApp Design Team
      </a>
    </div>
  </div>
);

const REVIEW_LABELS = ["", "Poor", "Below Average", "Average", "Good", "Excellent"];

const ReviewCard: React.FC<{
  onSubmit: (rating: number, text: string) => void;
  onSkip: () => void;
}> = ({ onSubmit, onSkip }) => {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="review-sent">
        ⭐ Thank you for your {REVIEW_LABELS[rating || 5]} rating!
        <br />
        <span style={{ fontSize: ".75rem", color: "var(--lv-mist)", fontWeight: 400 }}>
          Your feedback is recorded. We appreciate your trust in Lave Mineral.
        </span>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title">
        <span>⭐</span> Rate Your Experience
      </div>
      <div className="stars-row">
        {[1, 2, 3, 4, 5].map((v) => (
          <span
            key={v}
            className={`star${v <= rating ? " lit" : ""}`}
            onClick={() => setRating(v)}
          >
            ★
          </span>
        ))}
      </div>
      <textarea
        className="review-ta"
        rows={3}
        placeholder="Share your thoughts (optional)…"
        value={text}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
      />
      <div className="cta-row" style={{ marginTop: 10 }}>
        <button
          className="cta-btn cta-primary"
          onClick={() => {
            setDone(true);
            onSubmit(rating || 5, text);
          }}
        >
          Submit Feedback
        </button>
        <button className="cta-btn cta-ghost" onClick={onSkip}>
          Maybe Later
        </button>
      </div>
    </div>
  );
};

const AgentChoiceCard: React.FC<{
  onChooseBot: () => void;
  onChooseAgent: () => void;
}> = ({ onChooseBot, onChooseAgent }) => (
  <div className="agent-choice">
    <p>How would you like to proceed?</p>
    <button className="choice-btn" onClick={onChooseBot}>
      <span>🤖 Chat with AI Assistant</span>
      <span>›</span>
    </button>
    <button className="choice-btn" onClick={onChooseAgent}>
      <span>👤 Connect with a Human Agent</span>
      <span>›</span>
    </button>
  </div>
);

const TypingDots: React.FC = () => (
  <div className="typing-dot">
    <span />
    <span />
    <span />
  </div>
);

const CHIPS: { label: string; query: string }[] = [
  { label: "📦 Track Order", query: "Track my order" },
  { label: "🛒 Products", query: "Show products and pricing" },
  { label: "🎨 Label Design", query: "How to design a custom bottle label" },
  { label: "📋 Bulk Order", query: "Place a bulk order" },
  { label: "🚚 Delivery", query: "Delivery and shipping details" },
  { label: "↩️ Returns", query: "Return and refund policy" },
  { label: "💳 Payment", query: "Payment methods accepted" },
];

const EndChatDialog: React.FC<{
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ onConfirm, onCancel }) => (
  <div className="end-overlay">
    <div className="end-box">
      <h4>End this chat?</h4>
      <p>Are you sure you want to end the conversation? You can always start a new one.</p>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          className="cta-btn cta-ghost"
          onClick={onCancel}
          style={{ border: "1px solid var(--lv-border)" }}
        >
          Cancel
        </button>
        <button
          className="cta-btn"
          onClick={onConfirm}
          style={{ background: "var(--lv-red)", color: "white", flex: 1 }}
        >
          End Chat
        </button>
      </div>
    </div>
  </div>
);

const ChatEndedScreen: React.FC<{ onRestart: () => void }> = ({ onRestart }) => (
  <div className="msgs" style={{ justifyContent: "center", alignItems: "center" }}>
    <div className="end-ended">
      <div className="end-icon">👋</div>
      <h4>Chat Ended</h4>
      <p style={{ marginBottom: 16 }}>
        Thank you for contacting Lave Mineral Water. Have a great day!
      </p>
      <a
        className="cta-btn cta-wa"
        href={WA_SUPPORT}
        target="_blank"
        rel="noreferrer"
        style={{
          display: "block",
          marginBottom: 10,
          borderRadius: 9,
          padding: "9px 16px",
          textDecoration: "none",
          fontSize: ".82rem",
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        💬 Still need help? WhatsApp us
      </a>
      <button
        className="cta-btn cta-primary"
        onClick={onRestart}
        style={{
          width: "100%",
          borderRadius: 9,
          padding: "9px 16px",
          fontSize: ".82rem",
          cursor: "pointer",
        }}
      >
        🔄 Start New Chat
      </button>
    </div>
  </div>
);

const LaveChatbot: React.FC = () => {
  useEffect(() => {
    injectCSS();
  }, []);

  const [open, setOpen] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [exchanges, setExchanges] = useState(0);
  const [reviewAsked, setReviewAsked] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [chatMode, setChatMode] = useState<"pending" | "bot" | "agent">("pending");

  const apiHistory = useRef<ApiMsg[]>([]);
  const msgsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const addBot = useCallback(
    (text: string, withSugg = false, card: IntentKind = null, isAgentChoice = false) => {
      setMessages((prev) => [...prev, { id: uid(), kind: "bot", text, withSugg, card, isAgentChoice }]);
    },
    []
  );

  const maybeReview = useCallback(
    (exch: number) => {
      if (!reviewAsked && exch >= 3) {
        setReviewAsked(true);
        setTimeout(() => {
          addBot(
            "We sincerely hope your experience has been satisfactory. 😊\n\nWe would greatly appreciate a moment of your time to share your feedback.",
            false,
            "review"
          );
        }, 1200);
      }
    },
    [reviewAsked, addBot]
  );

  const handleChooseBot = useCallback(() => {
    setChatMode("bot");
    setTimeout(() => {
      addBot(
        `Great! I'm your Lave Mineral Water AI Assistant. 💧\n\nI can help you with:\n• Order tracking & placement\n• Product information & pricing\n• Custom label design\n• Bulk orders & delivery\n• Returns & refunds\n\nHow may I assist you today?`,
        true
      );
    }, 300);
  }, [addBot]);

  const handleChooseAgent = useCallback(() => {
    setChatMode("agent");
    setTimeout(() => {
      addBot(
        `Connecting you to a live agent now! 👤\n\nPlease tap the button below to open WhatsApp and chat directly with our support team.\n\nOur team is available **Mon–Sat, 9AM–7PM IST**.`,
        false,
        "contact"
      );
    }, 300);

    setTimeout(() => {
      window.open(WA_SUPPORT, "_blank");
    }, 800);
  }, [addBot]);

  const toggleChat = useCallback(() => {
    setOpen((prev) => {
      const nowOpen = !prev;
      if (nowOpen && !greeted) {
        setGreeted(true);
        setTimeout(() => {
          setMessages((old) => [
            ...old,
            {
              id: uid(),
              kind: "bot",
              text: `Welcome to **Lave Mineral Water**! 💧\n\nHow would you like to proceed?`,
              isAgentChoice: true,
            },
          ]);
        }, 380);
      }
      return nowOpen;
    });
  }, [greeted]);

  const handleEndChat = useCallback(() => {
    setShowEndDialog(false);
    setChatEnded(true);
    setIsTyping(false);
  }, []);

  const handleRestart = useCallback(() => {
    setChatEnded(false);
    setMessages([]);
    setInputVal("");
    setExchanges(0);
    setReviewAsked(false);
    setChatMode("pending");
    apiHistory.current = [];

    setTimeout(() => {
      setMessages([
        {
          id: uid(),
          kind: "bot",
          text: `Welcome back to **Lave Mineral Water**! 💧\n\nHow would you like to proceed?`,
          isAgentChoice: true,
        },
      ]);
    }, 300);
  }, []);

  const handleReviewSubmit = useCallback(
    (rating: number, text: string) => {
      console.info("[Lave Review]", { rating, text, ts: new Date().toISOString() });
      setTimeout(() => {
        addBot(
          `Thank you for rating us **${REVIEW_LABELS[rating]}** — ${rating}/5 stars. Your feedback helps us improve.\n\nIs there anything else I can assist you with?`
        );
      }, 800);
    },
    [addBot]
  );

  const handleReviewSkip = useCallback(() => {
    setTimeout(() => {
      addBot("Of course! Feel free to share feedback anytime. Is there anything else I can help with?");
    }, 500);
  }, [addBot]);

  const send = useCallback(
    async (override?: string) => {
      if (chatMode !== "bot") return;

      const txt = (override ?? inputVal).trim();
      if (!txt) return;

      setInputVal("");
      if (inputRef.current) inputRef.current.style.height = "auto";

      setMessages((prev) => [...prev, { id: uid(), kind: "user", text: txt }]);
      apiHistory.current = [...apiHistory.current, { role: "user", content: txt }];

      const newExch = exchanges + 1;
      setExchanges(newExch);

      const intent = detectIntent(txt);
      setIsTyping(true);
      await sleep(500);
      setIsTyping(false);

      if (intent === "track") {
        addBot(
          "Here is a sample order status view. Please share your **Order ID** (format: LV-XXXXXX) for your specific order.",
          false,
          "track"
        );
        apiHistory.current = [...apiHistory.current, { role: "assistant", content: "[Showed tracking card]" }];
        maybeReview(newExch);
        return;
      }

      if (intent === "contact") {
        addBot(
          "I'd be glad to connect you with our support team. Tap **WhatsApp Now** to chat directly:",
          false,
          "contact"
        );
        apiHistory.current = [...apiHistory.current, { role: "assistant", content: "[Showed contact card]" }];
        maybeReview(newExch);
        return;
      }

      if (intent === "products") {
        addBot(
          "Here is our complete product range — BIS IS 14543 certified and FSSAI approved.",
          false,
          "products"
        );
        apiHistory.current = [...apiHistory.current, { role: "assistant", content: "[Showed products card]" }];
        maybeReview(newExch);
        return;
      }

      if (intent === "label") {
        addBot(
          "Our **Label Studio** lets you create personalised bottle labels — ideal for events, gifting, and brand launches.",
          false,
          "label"
        );
        apiHistory.current = [...apiHistory.current, { role: "assistant", content: "[Showed label card]" }];
        maybeReview(newExch);
        return;
      }

      if (intent === "review") {
        if (!reviewAsked) {
          setReviewAsked(true);
          addBot("We'd love to hear your feedback!", false, "review");
        }
        return;
      }

      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            system: SYS,
            messages: apiHistory.current,
          }),
        });

        const data = await res.json();
        const reply: string =
          data.content?.map((b: { text?: string }) => b.text ?? "").join("") ||
          `I apologise for the inconvenience. Please reach us:\n\n💬 WhatsApp: ${ADMIN_DISPLAY}\n📧 support@lave-mineral.com`;

        addBot(reply);
        apiHistory.current = [...apiHistory.current, { role: "assistant", content: reply }];

        if (/(contact us|support team|email us|call us|reach us|whatsapp)/i.test(reply)) {
          setTimeout(() => addBot("Here are our contact details:", false, "contact"), 700);
        }
      } catch {
        addBot(
          `I'm experiencing a connectivity issue. Please contact us directly:\n\n💬 **WhatsApp:** ${ADMIN_DISPLAY}\n📧 support@lave-mineral.com`
        );
        setTimeout(() => addBot("Tap below to reach us instantly:", false, "contact"), 600);
      }

      maybeReview(newExch);
    },
    [inputVal, exchanges, reviewAsked, chatMode, addBot, maybeReview]
  );

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const onInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputVal(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 80)}px`;
  };

  const inputDisabled = chatEnded || chatMode === "pending";

  return (
    <div className="lave-chatbot-root">
      <button
        className="lv-toggle"
        onClick={toggleChat}
        title="Lave Support"
        aria-label="Open Lave chat"
      >
        {!open && <div className="lv-badge" />}
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="27" height="27" viewBox="0 0 24 24" fill="white">
            <path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2zm-2 10H6v-2h12v2zm0-3H6V7h12v2z" />
          </svg>
        )}
      </button>

      <div className={`lv-win ${open ? "lv-open" : "lv-closed"}`} role="dialog" aria-label="Lave Virtual Assistant">
        <div className="c-head">
          <div className="c-avatar">💧</div>
          <div className="c-head-info">
            <h3>Lave Virtual Assistant</h3>
            <p>
              <span className="online" />
              Online &nbsp;·&nbsp; Replies Instantly
            </p>
          </div>
          {!chatEnded && (
            <button className="end-chat-btn" onClick={() => setShowEndDialog(true)}>
              ✕ End Chat
            </button>
          )}
        </div>

        {showEndDialog && (
          <EndChatDialog onConfirm={handleEndChat} onCancel={() => setShowEndDialog(false)} />
        )}

        {chatMode === "bot" && !chatEnded && (
          <div className="chips">
            {CHIPS.map((c) => (
              <div className="chip" key={c.query} onClick={() => send(c.query)}>
                {c.label}
              </div>
            ))}
          </div>
        )}

        {chatEnded ? (
          <ChatEndedScreen onRestart={handleRestart} />
        ) : (
          <div className="msgs" ref={msgsRef}>
            {messages.map((msg) => (
              <div className={`msg ${msg.kind}`} key={msg.id}>
                <div className="m-av">{msg.kind === "user" ? "👤" : "💧"}</div>
                <div className="bbl">
                  {msg.kind === "user" ? (
                    <span dangerouslySetInnerHTML={{ __html: esc(msg.text) }} />
                  ) : (
                    <span dangerouslySetInnerHTML={{ __html: fmt(msg.text) }} />
                  )}

                  {msg.isAgentChoice && chatMode === "pending" && (
                    <AgentChoiceCard onChooseBot={handleChooseBot} onChooseAgent={handleChooseAgent} />
                  )}

                  {msg.card === "track" && <TrackCard />}
                  {msg.card === "contact" && <ContactCard />}
                  {msg.card === "products" && <ProductsCard onSuggest={(t) => send(t)} />}
                  {msg.card === "label" && <LabelCard />}
                  {msg.card === "review" && (
                    <ReviewCard onSubmit={handleReviewSubmit} onSkip={handleReviewSkip} />
                  )}

                  {msg.withSugg && (
                    <div className="sug-row">
                      <span className="sug" onClick={() => send("Track my order")}>
                        📦 Track Order
                      </span>
                      <span className="sug" onClick={() => send("Show products and pricing")}>
                        🛒 Products
                      </span>
                      <span className="sug" onClick={() => send("Place a bulk order")}>
                        📋 Bulk Order
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="msg bot">
                <div className="m-av">💧</div>
                <TypingDots />
              </div>
            )}
          </div>
        )}

        {!chatEnded && (
          <div className="c-input-wrap">
            <textarea
              className="cinput"
              ref={inputRef}
              rows={1}
              placeholder={
                chatMode === "bot"
                  ? "Type your query here…"
                  : chatMode === "agent"
                  ? "Type your message…"
                  : "Please choose an option above…"
              }
              value={inputVal}
              onChange={onInput}
              onKeyDown={onKey}
              disabled={inputDisabled}
            />
            <button className="csend" onClick={() => send()} disabled={inputDisabled} aria-label="Send message">
              <svg viewBox="0 0 24 24">
                <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
              </svg>
            </button>
          </div>
        )}

        <div className="c-foot">
          Lave Mineral &nbsp;·&nbsp;
          <a href={WA_LINK} target="_blank" rel="noreferrer">
            💬 {ADMIN_DISPLAY}
          </a>
        </div>
      </div>
    </div>
  );
};

export default LaveChatbot;