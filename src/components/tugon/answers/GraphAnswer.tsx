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

// CartesianPlane component per requirements
export default function CartesianPlane({ step, value, onChange }: Props) {
  // Inputs for limits
  const [xLimitInput, setXLimitInput] = useState<string>("10");
  const [yLimitInput, setYLimitInput] = useState<string>("10");

  // Parsed and clamped limits (1..20)
  const [xLimit, setXLimit] = useState<number | null>(value?.xLimit ?? null);
  const [yLimit, setYLimit] = useState<number | null>(value?.yLimit ?? null);

  // Points (in math coordinates)
  const [points, setPoints] = useState<Array<{ x: number; y: number }>>(value?.points ?? []);

  // keep inputs in sync if value changes from outside
  useEffect(() => {
    if (value) {
      setXLimit(value.xLimit ?? null);
      setYLimit(value.yLimit ?? null);
      setPoints(Array.isArray(value.points) ? value.points : []);
      // If limits came from parent, reflect them in the inputs
      if (value.xLimit != null) setXLimitInput(String(value.xLimit));
      if (value.yLimit != null) setYLimitInput(String(value.yLimit));
    }
  }, [value?.xLimit, value?.yLimit, JSON.stringify(value?.points ?? [])]);

  // Canvas refs/config
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const CSS_SIZE = 600; // 600x600 canvas area

  const hasPlane = useMemo(() => xLimit !== null && yLimit !== null, [xLimit, yLimit]);

  const scale = useMemo(() => {
    if (!hasPlane) return { sx: 1, sy: 1 };
    const sx = CSS_SIZE / (2 * (xLimit as number));
    const sy = CSS_SIZE / (2 * (yLimit as number));
    return { sx, sy };
  }, [hasPlane, xLimit, yLimit]);

  // Generate Plane: set limits and reset points
  const generatePlane = () => {
    const clamp = (v: number) => Math.max(1, Math.min(20, Math.floor(v)));
    const xl = clamp(Number(xLimitInput) || 0);
    const yl = clamp(Number(yLimitInput) || 0);
    setXLimit(xl);
    setYLimit(yl);
    setPoints([]); // reset points on new plane
    onChange({ xLimit: xl, yLimit: yl, points: [] });
  };

  // Helpers to draw
  const drawPlane = (ctx: CanvasRenderingContext2D) => {
    // Setup DPR scaling
    const dpr = window.devicePixelRatio || 1;
    const canvas = ctx.canvas;
    if (canvas.width !== CSS_SIZE * dpr || canvas.height !== CSS_SIZE * dpr) {
      canvas.width = CSS_SIZE * dpr;
      canvas.height = CSS_SIZE * dpr;
    }
    // Set CSS size
    canvas.style.width = `${CSS_SIZE}px`;
    canvas.style.height = `${CSS_SIZE}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // scale drawing to CSS pixels

    // Clear
    ctx.clearRect(0, 0, CSS_SIZE, CSS_SIZE);

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CSS_SIZE, CSS_SIZE);

    if (!hasPlane) return;

    const cx = CSS_SIZE / 2;
    const cy = CSS_SIZE / 2;
    const { sx, sy } = scale;

    // Axes
    ctx.strokeStyle = "#9ca3af"; // gray-400
    ctx.lineWidth = 1;
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, CSS_SIZE);
    ctx.stroke();
    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(CSS_SIZE, cy);
    ctx.stroke();

    // Grid lines at each integer (light gray), excluding the axes already drawn
    ctx.strokeStyle = "#e5e7eb"; // gray-200
    ctx.lineWidth = 1;
    // Vertical grid lines
    for (let i = -((xLimit as number)); i <= (xLimit as number); i++) {
      if (i === 0) continue; // skip y-axis (already drawn)
      const x = cx + i * sx;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CSS_SIZE);
      ctx.stroke();
    }
    // Horizontal grid lines
    for (let j = -((yLimit as number)); j <= (yLimit as number); j++) {
      if (j === 0) continue; // skip x-axis
      const y = cy - j * sy;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CSS_SIZE, y);
      ctx.stroke();
    }

    // Tick marks and labels on axes (integer steps)
    ctx.fillStyle = "#374151"; // gray-700 labels
    ctx.strokeStyle = "#6b7280"; // gray-500 ticks
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    // X ticks
    for (let i = -((xLimit as number)); i <= (xLimit as number); i++) {
      const x = cx + i * sx;
      // tick
      ctx.beginPath();
      ctx.moveTo(x, cy - 5);
      ctx.lineTo(x, cy + 5);
      ctx.stroke();
      // label (skip 0 to avoid overlap)
      if (i !== 0) ctx.fillText(String(i), x, cy + 8);
    }

    // Y ticks
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let j = -((yLimit as number)); j <= (yLimit as number); j++) {
      const y = cy - j * sy;
      // tick
      ctx.beginPath();
      ctx.moveTo(cx - 5, y);
      ctx.lineTo(cx + 5, y);
      ctx.stroke();
      // label (skip 0)
      if (j !== 0) ctx.fillText(String(j), cx - 8, y);
    }
  };

  const drawPoints = (ctx: CanvasRenderingContext2D) => {
    if (!hasPlane) return;
    const cx = CSS_SIZE / 2;
    const cy = CSS_SIZE / 2;
    const { sx, sy } = scale;
    // Connect points with a line (polyline)
    if (points.length > 1) {
      ctx.strokeStyle = "#3b82f6"; // blue-500
      ctx.lineWidth = 2;
      ctx.beginPath();
      const p0 = points[0];
      ctx.moveTo(cx + p0.x * sx, cy - p0.y * sy);
      for (let k = 1; k < points.length; k++) {
        const p = points[k];
        ctx.lineTo(cx + p.x * sx, cy - p.y * sy);
      }
      ctx.stroke();
    }
    // Draw points on top
    ctx.fillStyle = "#ef4444"; // red-500
    for (const p of points) {
      const px = cx + p.x * sx;
      const py = cy - p.y * sy;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Redraw whenever plane or points change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawPlane(ctx);
    drawPoints(ctx);
  }, [hasPlane, xLimit, yLimit, scale, points]);

  // Click handler to add a point
  const onCanvasClick: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
    if (!hasPlane) return;
    const rect = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect();
    const cssX = e.clientX - rect.left; // in CSS pixels
    const cssY = e.clientY - rect.top;

    const cx = CSS_SIZE / 2;
    const cy = CSS_SIZE / 2;
    const { sx, sy } = scale;

    const x = (cssX - cx) / sx;
    const y = (cy - cssY) / sy;
    // Round to 2 decimals for display cleanliness
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
        <button
          type="button"
          className="px-3 py-1.5 rounded-md bg-indigo-600 text-white"
          onClick={generatePlane}
        >
          Generate Plane
        </button>
      </div>

      {/* Canvas */}
      <div className="rounded-lg ring-1 ring-black/10 bg-white p-3">
        <div className="text-sm font-medium text-gray-700 mb-2">{step.label || "Cartesian Plane"}</div>
        <canvas
          ref={canvasRef}
          width={CSS_SIZE}
          height={CSS_SIZE}
          onClick={onCanvasClick}
          style={{ width: CSS_SIZE, height: CSS_SIZE, cursor: hasPlane ? "crosshair" : "not-allowed" }}
        />
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
