import React, { useEffect, useMemo, useRef, useState } from "react";

// Step-like type to avoid tight coupling with AnswerWizard's Step
type StepLike = { id: string; label: string } & Record<string, any>;

export type GraphPoint = { x: number; y: number };
export type GraphValue = { xLimit: number | null; yLimit: number | null; points: GraphPoint[] };

type Props = {
  step: StepLike;
  value?: GraphValue;
  onChange: (v: GraphValue) => void;
};

export default function CartesianPlane({ step, value, onChange }: Props) {
  // Inputs for limits
  const [xLimitInput, setXLimitInput] = useState<string>("10");
  const [yLimitInput, setYLimitInput] = useState<string>("10");

  // Limits and points (controlled by parent but managed locally for UX)
  const [xLimit, setXLimit] = useState<number | null>(value?.xLimit ?? null);
  const [yLimit, setYLimit] = useState<number | null>(value?.yLimit ?? null);
  const [points, setPoints] = useState<GraphPoint[]>(value?.points ?? []);

  // Responsive canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<number>(600); // square canvas size in CSS px

  const hasPlane = useMemo(() => xLimit !== null && yLimit !== null, [xLimit, yLimit]);

  const scale = useMemo(() => {
    if (!hasPlane) return { sx: 1, sy: 1 };
    return {
      sx: size / (2 * (xLimit as number)),
      sy: size / (2 * (yLimit as number)),
    };
  }, [hasPlane, xLimit, yLimit, size]);

  // Sync from parent value
  useEffect(() => {
    if (!value) return;
    setXLimit(value.xLimit ?? null);
    setYLimit(value.yLimit ?? null);
    setPoints(Array.isArray(value.points) ? value.points : []);
    if (value.xLimit != null) setXLimitInput(String(value.xLimit));
    if (value.yLimit != null) setYLimitInput(String(value.yLimit));
  }, [value?.xLimit, value?.yLimit, JSON.stringify(value?.points ?? [])]);

  // Observe container width for responsiveness
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.floor(entry.contentRect.width);
        setSize(Math.max(240, w));
      }
    });
    ro.observe(el);
    // Initial size
    const w0 = Math.floor(el.getBoundingClientRect().width);
    setSize(Math.max(240, w0));
    return () => ro.disconnect();
  }, []);

  const generatePlane = () => {
    const clamp = (v: number) => Math.max(1, Math.min(20, Math.floor(v)));
    const xl = clamp(Number(xLimitInput) || 0);
    const yl = clamp(Number(yLimitInput) || 0);
    setXLimit(xl);
    setYLimit(yl);
    setPoints([]);
    onChange({ xLimit: xl, yLimit: yl, points: [] });
  };

  const drawPlane = (ctx: CanvasRenderingContext2D) => {
    const dpr = window.devicePixelRatio || 1;
    const canvas = ctx.canvas;
    // Resize backing store
    if (canvas.width !== size * dpr || canvas.height !== size * dpr) {
      canvas.width = size * dpr;
      canvas.height = size * dpr;
    }
    // Match CSS size
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Clear
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    if (!hasPlane) return;

    const cx = size / 2;
    const cy = size / 2;
    const { sx, sy } = scale;

    // Axes
    ctx.strokeStyle = "#9ca3af"; // gray-400
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(size, cy);
    ctx.stroke();

    // Grid lines (integer steps)
    ctx.strokeStyle = "#e5e7eb"; // gray-200
    ctx.lineWidth = 1;
    for (let i = -((xLimit as number)); i <= (xLimit as number); i++) {
      if (i === 0) continue;
      const x = cx + i * sx;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
    for (let j = -((yLimit as number)); j <= (yLimit as number); j++) {
      if (j === 0) continue;
      const y = cy - j * sy;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }

    // Ticks and labels
    ctx.fillStyle = "#374151"; // gray-700
    ctx.strokeStyle = "#6b7280"; // gray-500
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let i = -((xLimit as number)); i <= (xLimit as number); i++) {
      const x = cx + i * sx;
      ctx.beginPath();
      ctx.moveTo(x, cy - 5);
      ctx.lineTo(x, cy + 5);
      ctx.stroke();
      if (i !== 0) ctx.fillText(String(i), x, cy + 8);
    }
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let j = -((yLimit as number)); j <= (yLimit as number); j++) {
      const y = cy - j * sy;
      ctx.beginPath();
      ctx.moveTo(cx - 5, y);
      ctx.lineTo(cx + 5, y);
      ctx.stroke();
      if (j !== 0) ctx.fillText(String(j), cx - 8, y);
    }
  };

  const drawPoints = (ctx: CanvasRenderingContext2D) => {
    if (!hasPlane) return;
    const cx = size / 2;
    const cy = size / 2;
    const { sx, sy } = scale;
    if (points.length > 1) {
      ctx.strokeStyle = "#3b82f6"; // blue-500
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + points[0].x * sx, cy - points[0].y * sy);
      for (let k = 1; k < points.length; k++) {
        ctx.lineTo(cx + points[k].x * sx, cy - points[k].y * sy);
      }
      ctx.stroke();
    }
    ctx.fillStyle = "#ef4444"; // red-500
    for (const p of points) {
      ctx.beginPath();
      ctx.arc(cx + p.x * sx, cy - p.y * sy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Redraw on changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawPlane(ctx);
    drawPoints(ctx);
  }, [hasPlane, xLimit, yLimit, size, scale, points]);

  const onCanvasClick: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
    if (!hasPlane) return;
    const rect = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect();
    const cssX = e.clientX - rect.left;
    const cssY = e.clientY - rect.top;
    const cx = size / 2;
    const cy = size / 2;
    const { sx, sy } = scale;
    const x = (cssX - cx) / sx;
    const y = (cy - cssY) / sy;
    const rx = Math.round(x * 100) / 100;
    const ry = Math.round(y * 100) / 100;
    setPoints((prev) => {
      const next = [...prev, { x: rx, y: ry }];
      onChange({ xLimit, yLimit, points: next });
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-gray-600">xLimit (1-20)</label>
          <input
            type="number"
            className="w-28 rounded-md border border-gray-300 px-2 py-1"
            min={1}
            max={20}
            value={xLimitInput}
            onChange={(e) => setXLimitInput(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600">yLimit (1-20)</label>
          <input
            type="number"
            className="w-28 rounded-md border border-gray-300 px-2 py-1"
            min={1}
            max={20}
            value={yLimitInput}
            onChange={(e) => setYLimitInput(e.target.value)}
          />
        </div>
        <button type="button" className="px-3 py-1.5 rounded-md bg-indigo-600 text-white" onClick={generatePlane}>
          Generate Plane
        </button>
      </div>

      {/* Canvas */}
      <div className="rounded-lg ring-1 ring-black/10 bg-white p-3">
        <div className="text-sm font-medium text-gray-700 mb-2">{step.label || "Cartesian Plane"}</div>
        <div ref={containerRef} className="w-full">
          <canvas
            ref={canvasRef}
            width={size}
            height={size}
            onClick={onCanvasClick}
            style={{ width: size, height: size, cursor: hasPlane ? "crosshair" : "not-allowed" }}
          />
        </div>
        {!hasPlane && (
          <div className="text-xs text-gray-500 mt-2">Enter limits and click "Generate Plane" to start.</div>
        )}
      </div>

      {/* Points list */}
      {hasPlane && (
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Clicked Points</div>
          {points.length === 0 ? (
            <div className="text-xs text-gray-500">No points yet. Click on the canvas to add points.</div>
          ) : (
            <ul className="text-sm text-gray-800 space-y-1 list-disc pl-5">
              {points.map((p, i) => (
                <li key={`${p.x},${p.y},${i}`}>({p.x}, {p.y})</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
