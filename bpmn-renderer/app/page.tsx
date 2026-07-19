"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { BpmnCanvasHandle } from "@/components/BpmnCanvas";

// bpmn-js relies on browser-only APIs, so it must never render on the server.
const BpmnCanvas = dynamic(() => import("@/components/BpmnCanvas"), {
  ssr: false,
});

const ACCEPTED = ".bpmn,.xml";

export default function Home() {
  const [xml, setXml] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<BpmnCanvasHandle>(null);

  const loadFile = useCallback((file: File) => {
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result;
      if (typeof content === "string") {
        setFileName(file.name);
        setXml(content);
      } else {
        setError("Could not read the selected file as text.");
      }
    };
    reader.onerror = () => setError("Could not read the selected file.");
    reader.readAsText(file);
  }, []);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) loadFile(file);
      // Allow re-selecting the same file.
      e.target.value = "";
    },
    [loadFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) loadFile(file);
    },
    [loadFile]
  );

  const onImportError = useCallback((message: string) => {
    setError(`This file could not be rendered as BPMN: ${message}`);
  }, []);

  const hasDiagram = xml.length > 0 && !error;

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Toolbar */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.75rem 1rem",
          background: "var(--panel)",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>
          BPMN Renderer
        </span>

        <button style={buttonStyle} onClick={() => fileInputRef.current?.click()}>
          Open file…
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED}
          onChange={onInputChange}
          style={{ display: "none" }}
        />

        {fileName && (
          <span
            style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}
            title={fileName}
          >
            {fileName}
          </span>
        )}

        <div style={{ marginLeft: "auto", display: "flex", gap: "0.4rem" }}>
          <button
            style={iconButtonStyle}
            disabled={!hasDiagram}
            onClick={() => canvasRef.current?.zoomOut()}
            title="Zoom out"
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            style={iconButtonStyle}
            disabled={!hasDiagram}
            onClick={() => canvasRef.current?.resetZoom()}
            title="Fit to viewport"
            aria-label="Fit to viewport"
          >
            ⤢
          </button>
          <button
            style={iconButtonStyle}
            disabled={!hasDiagram}
            onClick={() => canvasRef.current?.zoomIn()}
            title="Zoom in"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          style={{
            padding: "0.6rem 1rem",
            background: "rgba(248, 113, 113, 0.12)",
            color: "var(--danger)",
            borderBottom: "1px solid var(--border)",
            fontSize: "0.9rem",
            flexShrink: 0,
          }}
        >
          {error}
        </div>
      )}

      {/* Canvas / drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        style={{
          position: "relative",
          flex: 1,
          background: isDragging ? "var(--panel-2)" : "#fff",
          transition: "background 0.15s ease",
        }}
      >
        {hasDiagram ? (
          <BpmnCanvas ref={canvasRef} xml={xml} onError={onImportError} />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              color: "var(--text-dim)",
              pointerEvents: "none",
              padding: "2rem",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "3rem", opacity: 0.5 }}>◈</div>
            <p style={{ margin: 0, fontSize: "1.05rem", color: "var(--text)" }}>
              Open a BPMN diagram
            </p>
            <p style={{ margin: 0, maxWidth: 420 }}>
              Click <strong>Open file…</strong> or drag a{" "}
              <code>.bpmn</code> / <code>.xml</code> file here to render it.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

const buttonStyle: React.CSSProperties = {
  background: "var(--accent)",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "0.45rem 0.85rem",
  fontSize: "0.9rem",
  fontWeight: 600,
  cursor: "pointer",
};

const iconButtonStyle: React.CSSProperties = {
  background: "var(--panel-2)",
  color: "var(--text)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  width: 34,
  height: 34,
  fontSize: "1.1rem",
  lineHeight: 1,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};
