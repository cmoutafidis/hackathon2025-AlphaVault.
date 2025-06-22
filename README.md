# AlphaVault — Token Discovery & Swap Analytics Platform

AlphaVault is a streamlined, data-driven **Token Discovery and Analytics dashboard** built for the Solana ecosystem using **Jupiter Aggregator APIs**. The platform enables users to explore token market data, monitor key metrics, and access swap estimates based on real-time liquidity and slippage.

---

## Overview

The project addresses the need for an organized, accessible interface to discover tokens and analyze market conditions within the Solana DeFi space. By integrating Jupiter's pricing and swap quote APIs, AlphaVault presents users with actionable token insights through a clean, responsive interface.

***Notably, this project was independently developed by a single participant, while other teams in the hackathon comprised 4–5 members.*** Every aspect — from concept, design, and API integration to implementation and deployment — was executed individually within the event timeline.

---

## Features

- **Token Discovery Dashboard:** Browse token information including price, market cap, liquidity, volatility, and volume.
- **Advanced Search & Filters:** Quickly locate tokens by symbol or name, and filter based on volatility, slippage, and liquidity levels.
- **Real-Time Token Metrics:** Integrated token data using Jupiter’s public APIs.
- **Responsive UI:** Intuitive layout optimized for both desktop and mobile.

---

## Technical Implementation

**Frontend:**
- Vite + Vanilla JS (modular, component-based approach)
- Custom CSS (clean, modern financial dashboard style)

**APIs:**
- **Jupiter Aggregator APIs**
  - `quoteAPI.js` — Fetches swap quotes
  - `priceAPI.js` — Retrieves token prices and liquidity data
  - `tokenAPI.js` — Fetches supported token metadata

**Deployment:**
- Local development server via Vite  
- Code structured in a modular `/src` directory for scalability

---

## Installation & Usage

**Local Setup:**

```bash
git clone https://github.com/Lokeshrao69/AlphaVault..git
cd AlphaVault/vite-project
npm install
npm run dev
