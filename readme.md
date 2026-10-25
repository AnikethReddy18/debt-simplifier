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

At the heart of the application is a graph-based Minimum Cash Flow algorithm. If Alice owes Bob 10, Bob owes Charlie 10, and Charlie owes Alice 10, the algorithm recognizes the closed loop and cancels the debts out to 0. It reduces complex webs of debt into the simplest possible settlement instructions.

## Setup Instructions

### Prerequisites

* Node.js (v16 or higher)

* npm or yarn

### Backend Setup

1. Navigate to the backend directory:

   ```
   cd backend
   
   ```

2. Install dependencies:

   ```
   npm install
   
   ```

3. Initialize the database via Prisma (ensure your database URL is set in a `.env` file):

   ```
   npx prisma contract emit
   npx prisma db init
   
   ```

4. Start the backend server:

   ```
   npm run dev
   
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```
   cd frontend
   
   ```

2. Install dependencies:

   ```
   npm install
   
   ```

3. Start the Vite development server:

   ```
   npm run dev
   
   ```

## Known Limitations

* **Manual Entry:** Receipt scanning (OCR) is not supported; expenses must be entered manually.

* **Adding Group Members:** To add someone you have to share a link or code; Adding friends directly should be implemented

* **Payment System is not Integrated:** UPI/Other payment systems are not integrated.

## Product Write-Up

### 1. What problem does your tool solve, and who is the user?

Hostel students and friend groups constantly share expenses, creating tangled webs of mutual debt. Currently, major apps gatekeep debt-simplification features behind paywalls and are cluttered with unnecessary social feeds. This tool targets users who just want a frictionless, entirely free utility to instantly calculate the fastest way to settle group expenses without the corporate bloat.

### 2. What were the two or three most important product decisions you made, and why?

* **Simple Algorithm Approach:** I implemented a straightforward Minimum Cash Flow algorithm. Using a simpler algorithm ensures predictable, fast resolution of debts without over-engineering the backend logic.

* **Database Structure:** Using Prisma, I structured the database to optimize for quick balance aggregation rather than just an append-only transaction ledger. This ensures the group dashboard loads instantly, even as transaction volume grows.

* **Zero-Bloat Interface:** I designed the React frontend to be purely functional. Stripping away social feeds and premium upsells creates a distraction-free experience focused entirely on settling balances quickly.

### 3. What did you cut from scope, and what would you build next if you had more time?

I cut receipt scanning (OCR) from the initial scope to ensure the core simplification logic was flawlessly stable for deployment. Given more time, I would implement OCR for automatic expense entry, significantly streamline the user flow for adding friends directly to groups (rather than just codes/links), and integrate these features seamlessly into the UI.

### 4. What broke or surprised you during development, and how did you handle it?

I was surprised by the complexity of handling relational data queries when calculating the initial net balances for the group. Trying to aggregate who paid for what, and who owes what, across multiple users and groups natively in the database (via complex SQL/Prisma aggregations) became overly difficult to manage. I handled this by shifting the aggregation logic to the application layer. I used Prisma to fetch the raw transaction ledger, and then used standard array methods in the Node.js backend to map out the net balances before feeding them into the simplification algorithm. This kept the codebase much cleaner and easier to debug.
