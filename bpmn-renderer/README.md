# BPMN Renderer

A small [Next.js](https://nextjs.org/) app that opens a BPMN 2.0 file from your
computer and renders it in the browser using
[**bpmn-js**](https://bpmn.io/toolkit/bpmn-js/) — the same JavaScript toolkit
from Camunda / bpmn.io that powers the online BPMN modeler.

It's a read-only **viewer**: pick a `.bpmn` (or `.xml`) file, and the diagram is
rendered with full pan / zoom navigation. No file ever leaves your machine — the
file is read locally in the browser with the `FileReader` API.

## Features

- **Open from your computer** — click _Open file…_ or drag-and-drop a
  `.bpmn` / `.xml` file onto the canvas.
- **Faithful rendering** via bpmn-js `NavigatedViewer` (pan by dragging, zoom
  with the scroll wheel).
- **Zoom controls** — zoom in / out and fit-to-viewport buttons.
- **Graceful errors** — invalid or non-BPMN files show a clear message instead
  of a blank screen.
- A sample diagram lives in [`public/samples/order-process.bpmn`](public/samples/order-process.bpmn).

## Getting started

```bash
cd bpmn-renderer
npm install
npm run dev
```

Then open <http://localhost:3000> and load a BPMN file.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — production build
- `npm run start` — serve the production build

## How it works

bpmn-js relies on browser-only APIs, so the viewer is isolated in a client
component (`components/BpmnCanvas.tsx`) that is loaded with
`next/dynamic({ ssr: false })` — it never runs during server-side rendering.

`app/page.tsx` handles opening the file (file input + drag-and-drop), reads it as
text, and passes the XML to the canvas, which calls `viewer.importXML(...)` and
fits the result to the viewport.

## Notes

This project is a self-contained subdirectory of the `pulsepoint` repository and
has its own `package.json` / dependency tree; it does not share anything with the
root app.
