import React, { useState } from "react";
import BackButton from "../../components/BackButton";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Scatter,
} from "recharts";

function InteractiveGraph() {
  const [inputX, setInputX] = useState(0);
  const [inputY, setInputY] = useState(0);

  const linearFunction = (x: number) => 2 * x + 1;
  const quadraticFunction = (x: number) => x * x - 4 * x + 3;
  const rationalFunction = (x: number) => (x === 2 ? null : 1 / (x - 2));

  const graphData = Array.from({ length: 100 }, (_, i) => {
    const x = i - 50;
    const rational = rationalFunction(x);
    return {
      x,
      linear: linearFunction(x),
      quadratic: quadraticFunction(x),
      rational: rational !== null ? rational : undefined,
    };
  });

  const pointDataX = [
    {
      x: inputX,
      linear: linearFunction(inputX),
      quadratic: quadraticFunction(inputX),
      rational: rationalFunction(inputX),
    },
  ];

  const pointDataY = [
    {
      x: inputY,
      linear: linearFunction(inputY),
      quadratic: quadraticFunction(inputY),
      rational: rationalFunction(inputY),
    },
  ];

  const values = [inputX, inputY];
  const minX = Math.min(-5, ...values) - 2;
  const maxX = Math.max(5, ...values) + 2;

  const outputs = [
    linearFunction(inputX),
    linearFunction(inputY),
    quadraticFunction(inputX),
    quadraticFunction(inputY),
    rationalFunction(inputX),
    rationalFunction(inputY),
  ].filter((v) => v !== null) as number[];

  const minY = Math.min(...outputs, -10) - 2;
  const maxY = Math.max(...outputs, 10) + 2;

  return (
    <div className="space-y-6 p-4 max-w-5xl mx-auto">
      {/* Concept Box */}
      <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-400">
      <BackButton />
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Concepts of Functions</h3>
        <p className="text-sm text-blue-700 mb-3">
          A <strong>function</strong> is a mathematical relationship where each input has exactly one output.
        </p>
        <div className="grid grid-cols-3 gap-4 text-sm text-blue-700">
          <div>
            <strong>Linear Function:</strong><br />
            Forms a straight line.<br />
            <code>f(x) = 2x + 1</code>
          </div>
          <div>
            <strong>Quadratic Function:</strong><br />
            Creates a parabola.<br />
            <code>f(x) = x² - 4x + 3</code>
          </div>
          <div>
            <strong>Rational Function:</strong><br />
            Involves division, can be undefined.<br />
            <code>f(x) = 1 / (x - 2)</code>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
        <label className="text-sm text-gray-700">
          Input X:
          <input
            type="number"
            value={inputX}
            onChange={(e) => setInputX(Number(e.target.value))}
            className="mt-1 w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
          />
        </label>
        <label className="text-sm text-gray-700">
          Input Y:
          <input
            type="number"
            value={inputY}
            onChange={(e) => setInputY(Number(e.target.value))}
            className="mt-1 w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
          />
        </label>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 text-center">
        Below is a graph showing how different functions behave. Points are plotted based on your chosen x and y values.
      </p>

      {/* Graph */}
      <div className="bg-white p-4 rounded shadow-md max-w-3xl mx-auto">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={graphData}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="x" type="number" domain={[minX, maxX]} />
            <YAxis type="number" domain={[minY, maxY]} />
            <Tooltip />
            <Legend />

            {/* Function Lines */}
            <Line type="monotone" dataKey="linear" stroke="#3b82f6" name="Linear f(x) = 2x + 1" dot={false} />
            <Line type="monotone" dataKey="quadratic" stroke="#22c55e" name="Quadratic f(x) = x² - 4x + 3" dot={false} />
            <Line type="monotone" dataKey="rational" stroke="#ef4444" name="Rational f(x) = 1 / (x - 2)" dot={false} />

            {/* X Inputs */}
            <Scatter data={pointDataX} dataKey="linear" fill="#1d4ed8" name="Linear @ X" />
            <Scatter data={pointDataX} dataKey="quadratic" fill="#15803d" name="Quadratic @ X" />
            <Scatter data={pointDataX} dataKey="rational" fill="#991b1b" name="Rational @ X" />

            {/* Y Inputs */}
            <Scatter data={pointDataY} dataKey="linear" fill="#93c5fd" name="Linear @ Y" />
            <Scatter data={pointDataY} dataKey="quadratic" fill="#86efac" name="Quadratic @ Y" />
            <Scatter data={pointDataY} dataKey="rational" fill="#fecaca" name="Rational @ Y" />

            {/* Connection Lines */}
            <Line
              data={[pointDataX[0], pointDataY[0]]}
              dataKey="linear"
              stroke="#60a5fa"
              strokeDasharray="5 5"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              data={[pointDataX[0], pointDataY[0]]}
              dataKey="quadratic"
              stroke="#4ade80"
              strokeDasharray="5 5"
              dot={false}
              isAnimationActive={false}
            />
            {pointDataX[0].rational !== null && pointDataY[0].rational !== null && (
              <Line
                data={[pointDataX[0], pointDataY[0]]}
                dataKey="rational"
                stroke="#f87171"
                strokeDasharray="5 5"
                dot={false}
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default InteractiveGraph;
