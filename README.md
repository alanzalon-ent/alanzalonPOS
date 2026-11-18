# Orderglow Pos

Build a modern, high-performance Point of Sale (POS) frontend web application called "Alanzalon Enterprise POS" tailored for cafes, restaurants, and retail shops. The design must be clean, responsive, and optimized for fast-action touch or mouse interactions (dark sidebar or top header, bright product cards, and a clear sticky receipt cart).



Key Features & Layout Requirements:



1. Top Navigation Bar:

   - App Name: "Alanzalon Enterprise POS" with a live status indicator (Connected/Offline).

   - Navigation tabs/buttons: Cashier Grid, Active Orders (KDS view), Customer Display (CFD preview), and Inventory Management.



2. Main Cashier View (Split Screen):

   - Left Side (70% width) - Product Catalog & Grid:

     * Category filter pills at the top (All, Coffee, Non-Coffee, Pastries, etc.).

     * Search bar for quick product name or barcode lookup.

     * Product Grid featuring visual cards with product name, stock badge, and price (in PHP/₱). Clicking a card adds it to the cart instantly.

   - Right Side (30% width) - Cart & Checkout Panel:

     * List of selected cart items with quantity controls (+ / -, remove) and subtotal per item.

     * Discount and Tax toggle or summary.

     * Large Total Amount display.

     * Action buttons: "Hold Order", "Cancel", and a prominent green "Charge / Checkout" button.



3. Checkout Modal / Payment Screen:

   - When "Charge" is clicked, open a smooth modal supporting multiple payment methods: Cash, Card, and E-Wallet.

   - Input for cash tendered with automatic change calculation.

   - Confirmation button that triggers a success alert/receipt popup and clears the cart.



4. Secondary Views (Tabs or Modals):

   - Kitchen Display System (KDS) View: Shows incoming orders in a kanban-style card layout with status columns (Pending, Preparing, Ready) and a "Tap-to-Done" action.

   - Customer Facing Display (CFD) Preview: A live summary screen showing current items scanned and total amount for the customer.



5. Technical Guidelines:

   - Use Tailwind CSS for a sleek, professional UI design.

   - Make the UI ready to connect to a local REST API and Socket.io backend (e.g., endpoints like GET /api/products and POST /api/orders).

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://orderglow-pos.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/cf4e0803-4580-4235-bae6-904155627537).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
