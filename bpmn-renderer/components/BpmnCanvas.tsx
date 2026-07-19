"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import NavigatedViewer from "bpmn-js/lib/NavigatedViewer";

import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";

export interface BpmnCanvasHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

interface BpmnCanvasProps {
  xml: string;
  /** Called with a human-readable message when the XML fails to import. */
  onError?: (message: string) => void;
  /** Called once the diagram has been imported successfully. */
  onImported?: () => void;
}

const BpmnCanvas = forwardRef<BpmnCanvasHandle, BpmnCanvasProps>(
  function BpmnCanvas({ xml, onError, onImported }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<NavigatedViewer | null>(null);

    // Create the viewer once, tear it down on unmount.
    useEffect(() => {
      if (!containerRef.current) return;

      const viewer = new NavigatedViewer({
        container: containerRef.current,
      });
      viewerRef.current = viewer;

      return () => {
        viewer.destroy();
        viewerRef.current = null;
      };
    }, []);

    // Re-import whenever the XML changes.
    useEffect(() => {
      const viewer = viewerRef.current;
      if (!viewer || !xml) return;

      let cancelled = false;

      viewer
        .importXML(xml)
        .then((result: { warnings: unknown[] }) => {
          if (cancelled) return;
          // Fit the diagram to the viewport.
          const canvas = viewer.get("canvas") as {
            zoom: (mode: string) => void;
          };
          canvas.zoom("fit-viewport");
          onImported?.();
          if (result.warnings?.length) {
            // Warnings are non-fatal (e.g. unknown extension elements).
            // eslint-disable-next-line no-console
            console.warn("BPMN import warnings:", result.warnings);
          }
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          const message =
            err instanceof Error ? err.message : "Failed to render diagram.";
          onError?.(message);
        });

      return () => {
        cancelled = true;
      };
    }, [xml, onError, onImported]);

    useImperativeHandle(ref, () => ({
      zoomIn() {
        const viewer = viewerRef.current;
        if (!viewer) return;
        const zoomScroll = viewer.get("zoomScroll") as {
          stepZoom: (delta: number) => void;
        };
        zoomScroll.stepZoom(1);
      },
      zoomOut() {
        const viewer = viewerRef.current;
        if (!viewer) return;
        const zoomScroll = viewer.get("zoomScroll") as {
          stepZoom: (delta: number) => void;
        };
        zoomScroll.stepZoom(-1);
      },
      resetZoom() {
        const viewer = viewerRef.current;
        if (!viewer) return;
        const canvas = viewer.get("canvas") as {
          zoom: (mode: string) => void;
        };
        canvas.zoom("fit-viewport");
      },
    }));

    return (
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%" }}
        aria-label="BPMN diagram canvas"
      />
    );
  }
);

export default BpmnCanvas;
