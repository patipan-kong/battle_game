#!/bin/bash
echo "================================"
echo "Battle Game - Installation"
echo "================================"
echo ""

echo "Installing Server Dependencies..."
cd server
npm install
cd ..

echo ""
echo "Installing Client Dependencies..."
cd client
npm install
cd ..

echo ""
echo "================================"
echo "Installation Complete!"
echo "================================"
echo ""
echo "To start the game:"
echo "1. Run: cd server && npm start"
echo "2. In a new terminal, run: cd client && npm start"
echo "3. Open http://localhost:3000 in your browser"
echo ""
