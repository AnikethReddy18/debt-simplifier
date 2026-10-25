# Debt Simplifier

## Live Demo

[Open Debt Simplifier](https://debt-simplifier.vercel.app/)

## Overview
Debt Simplifier is a lightweight, zero-friction web application designed to track shared expenses and calculate the mathematically optimal way to settle debts. 

### The Problem
When friends, roommates, or travelers share expenses, tracking who owes whom quickly becomes a tangled web of micro-transactions. Existing market alternatives (like Splitwise) have become increasingly bloated with social feeds, ads, and paywalls that restrict core features like algorithmic debt simplification. 

### The User
Debt Simplifier is built for tight-knit groups: college roommates, startup co-founders on work trips, and weekend travelers. Who need a fast, transparent, and completely free tool to figure out exactly who needs to pay whom, with the absolute fewest number of transactions.

### The Solution: Minimum Cash Flow Algorithm
At the heart of the application is a graph-based Minimum Cash Flow algorithm. If Alice owes Bob $10, Bob owes Charlie $10, and Charlie owes Alice $10, the algorithm recognizes the closed loop and cancels the debts out to $0. It reduces complex webs of debt into the simplest possible settlement instructions.

---

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the database via Prisma (ensure your database URL is set in a `.env` file):
   ```bash
   npx prisma generate
   npx prisma db push
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

## Known Limitations
* **Manual Entry:** Receipt scanning (OCR) is not supported; expenses must be entered manually.
* **Adding Group Members:** To add someone you have to share a link or code; Adding friends directly should be implemented
* **Payment System is not Integrated** UPI/Other payment system are not integrated. 
