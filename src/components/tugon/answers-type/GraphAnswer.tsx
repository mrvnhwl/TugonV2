import React, { useEffect, useMemo, useRef, useState } from "react";

// Step-like type to avoid tight coupling with AnswerWizard's Step
type StepLike = { id: string; label?: string } & Record<string, any>;

export type GraphPoint = { x: number; y: number };
export type GraphValue = { xLimit: number | null; yLimit: number | null; points: GraphPoint[] };

type Props = {
  step: StepLike;
  value?: GraphValue;
  onChange: (v: GraphValue) => void;
  hideControls?: boolean;
  onPointsCommit?: (points: GraphPoint[]) => void; // notify parent after drag ends or point add
};

export default function CartesianPlane({ step, value, onChange, hideControls, onPointsCommit }: Props) {
  // Inputs for limits
  const [xLimitInput, setXLimitInput] = useState<string>("10");
  const [yLimitInput, setYLimitInput] = useState<string>("10");

  // Limits and points (controlled by parent but managed locally for UX)
  const [xLimit, setXLimit] = useState<number | null>(value?.xLimit ?? null);
  const [yLimit, setYLimit] = useState<number | null>(value?.yLimit ?? null);
  const [points, setPoints] = useState<GraphPoint[]>(value?.points ?? []);
  const [zoom, setZoom] = useState<number>(1); // 1x zoom by default
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Responsive square area
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<number>(600); // square plane size in CSS px

  const hasPlane = useMemo(() => xLimit !== null && yLimit !== null, [xLimit, yLimit]);

  const scale = useMemo(() => {
    if (!hasPlane) return { sx: 1, sy: 1 };
    return {
      sx: (size / (2 * (xLimit as number))) * zoom,
      sy: (size / (2 * (yLimit as number))) * zoom,
    };
  }, [hasPlane, xLimit, yLimit, size, zoom]);

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
  // Helpers to convert between plane coords and pixels
  const cx = size / 2;
  const cy = size / 2;
  const toPx = (p: GraphPoint) => ({ x: cx + p.x * (scale.sx || 1), y: cy - p.y * (scale.sy || 1) });
  const fromPx = (px: number, py: number): GraphPoint => {
    const x = (px - cx) / (scale.sx || 1);
    const y = (cy - py) / (scale.sy || 1);
    // Snap to nearest 0.1
    const q = (v: number) => Math.round(v * 10) / 10;
    return { x: q(x), y: q(y) };
  };

  // Click to add a point
  const onSvgClick: React.MouseEventHandler<SVGSVGElement> = (e) => {
    if (!hasPlane) return;
    // Avoid adding when dragging
    if ((e.target as HTMLElement).getAttribute("data-draggable") === "true") return;
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const pt = fromPx(e.clientX - rect.left, e.clientY - rect.top);
    setPoints((prev) => {
      const next = [...prev, pt];
      onChange({ xLimit, yLimit, points: next });
      return next;
    });
  };

  // Drag handlers
  const onCircleMouseDown = (idx: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDragIndex(idx);
  };
  const onSvgMouseMove: React.MouseEventHandler<SVGSVGElement> = (e) => {
    if (dragIndex === null || !hasPlane) return;
    e.preventDefault();
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const pt = fromPx(e.clientX - rect.left, e.clientY - rect.top);
    // Optional: clamp to limits
    const clamp = (v: number, lim: number | null) => {
      if (lim == null) return v;
      return Math.max(-lim, Math.min(lim, v));
    };
    // Snap to 0.1 and clamp
    const q = (v: number) => Math.round(v * 10) / 10;
    const nx = q(clamp(pt.x, xLimit));
    const ny = q(clamp(pt.y, yLimit));
    setPoints((prev) => {
      const next = [...prev];
      next[dragIndex] = { x: nx, y: ny };
      onChange({ xLimit, yLimit, points: next });
      return next;
    });
  };
  const onSvgMouseUp: React.MouseEventHandler<SVGSVGElement> = () => {
    if (dragIndex !== null) setDragIndex(null);
  // commit points back to parent (sync to textarea upstream)
  onPointsCommit?.(points);
  };

  // Zoom with wheel (Ctrl/Cmd + wheel to avoid accidental zooms)
  const onWheel: React.WheelEventHandler<SVGSVGElement> = (e) => {
    if (!hasPlane) return;
    if (!(e.ctrlKey || e.metaKey)) return; // require modifier
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.max(0.5, Math.min(4, z * factor)));
  };

  return (
    <div className="space-y-4">
      {!hideControls && (
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
      )}

      {/* SVG Plane */}
      <div className="rounded-lg ring-1 ring-black/10 bg-white p-3">
        <div className="text-sm font-medium text-gray-700 mb-2">{step.label || "Cartesian Plane"}</div>
        <div ref={containerRef} className="w-full">
          <svg
            width={size}
            height={size}
            onClick={onSvgClick}
            onMouseMove={onSvgMouseMove}
            onMouseUp={onSvgMouseUp}
            onWheel={onWheel}
            style={{ width: size, height: size, cursor: hasPlane ? (dragIndex !== null ? "grabbing" : "crosshair") : "not-allowed" }}
          >
            {/* Background */}
            <rect x={0} y={0} width={size} height={size} fill="#ffffff" />
            {hasPlane && (
              <g>
                {/* Minor grid lines at 0.1 increments when zoomed enough */}
                {(() => {
                  const elems: JSX.Element[] = [];
                  const pxPerTenthX = (scale.sx || 1) * 0.1;
                  const pxPerTenthY = (scale.sy || 1) * 0.1;
                  const showMinorX = pxPerTenthX >= 8;
                  const showMinorY = pxPerTenthY >= 8;
                  if (showMinorX) {
                    const iMin = Math.ceil(-(xLimit as number) * 10);
                    const iMax = Math.floor((xLimit as number) * 10);
                    for (let i = iMin; i <= iMax; i++) {
                      if (i % 10 === 0) continue; // skip whole numbers
                      const x = cx + (i * (scale.sx || 1)) / 10;
                      elems.push(
                        <line key={`vm-${i}`} x1={x} y1={0} x2={x} y2={size} stroke="#e5e7eb" strokeWidth={1} strokeDasharray="2 3" opacity={0.7} />
                      );
                    }
                  }
                  if (showMinorY) {
                    const jMin = Math.ceil(-(yLimit as number) * 10);
                    const jMax = Math.floor((yLimit as number) * 10);
                    for (let j = jMin; j <= jMax; j++) {
                      if (j % 10 === 0) continue; // skip whole numbers
                      const y = cy - (j * (scale.sy || 1)) / 10;
                      elems.push(
                        <line key={`hm-${j}`} x1={0} y1={y} x2={size} y2={y} stroke="#e5e7eb" strokeWidth={1} strokeDasharray="2 3" opacity={0.7} />
                      );
                    }
                  }
                  return <g>{elems}</g>;
                })()}

                {/* Major grid lines at integers */}
                <g stroke="#d1d5db" strokeWidth={1.5}>
                  {Array.from({ length: (xLimit as number) * 2 + 1 }, (_, i) => i - (xLimit as number)).map((i) => {
                    if (i === 0) return null;
                    const x = cx + i * (scale.sx || 1);
                    return <line key={`vx-${i}`} x1={x} y1={0} x2={x} y2={size} />;
                  })}
                  {Array.from({ length: (yLimit as number) * 2 + 1 }, (_, j) => j - (yLimit as number)).map((j) => {
                    if (j === 0) return null;
                    const y = cy - j * (scale.sy || 1);
                    return <line key={`hy-${j}`} x1={0} y1={y} x2={size} y2={y} />;
                  })}
                </g>
                {/* Axes */}
                <g stroke="#9ca3af" strokeWidth={1}>
                  <line x1={cx} y1={0} x2={cx} y2={size} />
                  <line x1={0} y1={cy} x2={size} y2={cy} />
                </g>
                {/* Ticks and labels with decimals when zoomed */}
                {(() => {
                  const elems: JSX.Element[] = [];
                  const pxPerTenthX = (scale.sx || 1) * 0.1;
                  const pxPerTenthY = (scale.sy || 1) * 0.1;
                  const labelStepX = pxPerTenthX >= 40 ? 0.1 : pxPerTenthX >= 12 ? 0.5 : 1;
                  const labelStepY = pxPerTenthY >= 40 ? 0.1 : pxPerTenthY >= 12 ? 0.5 : 1;
                  const fmt = (v: number) => (Math.abs(v % 1) < 1e-9 ? String(Math.round(v)) : v.toFixed(1));
                  // X labels
                  for (let vx = -xLimit!; vx <= xLimit! + 1e-9; vx += labelStepX) {
                    const x = cx + vx * (scale.sx || 1);
                    elems.push(
                      <g key={`tx-${vx.toFixed(1)}`} stroke="#6b7280" strokeWidth={1}>
                        <line x1={x} y1={cy - 5} x2={x} y2={cy + 5} />
                        {Math.abs(vx) > 1e-9 && (
                          <text x={x} y={cy + 14} textAnchor="middle" fontSize={12} fill="#374151">{fmt(Number(vx.toFixed(1)))}</text>
                        )}
                      </g>
                    );
                  }
                  // Y labels
                  for (let vy = -yLimit!; vy <= yLimit! + 1e-9; vy += labelStepY) {
                    const y = cy - vy * (scale.sy || 1);
                    elems.push(
                      <g key={`ty-${vy.toFixed(1)}`} stroke="#6b7280" strokeWidth={1}>
                        <line x1={cx - 5} y1={y} x2={cx + 5} y2={y} />
                        {Math.abs(vy) > 1e-9 && (
                          <text x={cx - 8} y={y} textAnchor="end" dominantBaseline="middle" fontSize={12} fill="#374151">{fmt(Number(vy.toFixed(1)))}</text>
                        )}
                      </g>
                    );
                  }
                  return <g>{elems}</g>;
                })()}
                {/* Polyline through points */}
                {points.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    points={points.map((p) => {
                      const px = toPx(p);
                      return `${px.x},${px.y}`;
                    }).join(" ")}
                  />
                )}
                {/* Draggable points */}
                {points.map((p, i) => {
                  const px = toPx(p);
                  return (
                    <circle
                      key={`p-${i}`}
                      cx={px.x}
                      cy={px.y}
                      r={6}
                      fill={dragIndex === i ? "red" : "blue"}
                      data-draggable="true"
                      onMouseDown={onCircleMouseDown(i)}
                    />
                  );
                })}
                {/* Tooltip for active point */}
                {dragIndex !== null && points[dragIndex] && (() => {
                  const p = points[dragIndex];
                  const px = toPx(p);
                  const label = `(${p.x.toFixed(1)}, ${p.y.toFixed(1)})`;
                  return (
                    <g key="drag-label">
                      <rect x={px.x + 8} y={px.y - 22} width={label.length * 7.2} height={18} rx={4} fill="#111827" opacity={0.85} />
                      <text x={px.x + 12} y={px.y - 9} fontSize={12} fill="#ffffff">{label}</text>
                    </g>
                  );
                })()}
              </g>
            )}
          </svg>
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
