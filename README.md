# High-Performance Virtualized Data Grid

A high-performance virtualized data grid built with React and TypeScript.  
The grid supports rendering 100,000+ rows while keeping the actual DOM node count small by only rendering the visible window of rows.

## Features

- Virtualized row rendering for 100,000+ rows
- Scroll-position-based visible row calculation
- Overscan strategy for smoother high-speed scrolling
- `requestAnimationFrame` scheduling for scroll updates
- Type-safe column configuration system
- Sorting by column
- Global filtering/search
- Custom cell rendering
- Reusable `useVirtualRows` hook
- Performance stats showing rendered rows and cells

## Tech Stack

- React
- TypeScript
- Vite
- CSS

## Why This Project

Rendering 100,000+ table rows directly creates a large number of DOM nodes and can make scrolling slow or unresponsive.

This project solves that by using windowed rendering:

```txt
100,000+ rows in data
↓
calculate visible row range from scrollTop
↓
render only visible rows + overscan
↓
move visible rows into position using translate

## Getting Started
