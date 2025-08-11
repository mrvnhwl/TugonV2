import React from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";

function Piecewisetopic() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <BackButton />

        {/* Topic Name */}
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Piecewise Functions
        </h1>

        {/* Topic Description */}
        <p className="text-gray-700 bg-white p-4 rounded border border-gray-300 shadow-sm">
          A <strong>piecewise function</strong> is defined by different expressions
          depending on the domain interval. Each rule applies to a specific part of
          the input range.
        </p>

        {/* Important Concepts */}
        <div className="bg-blue-50 p-4 rounded border border-blue-300 shadow-sm">
          <p className="text-blue-800 font-semibold mb-2">Important Concepts:</p>
          <ul className="list-disc list-inside text-blue-800">
            <li>A piecewise function uses different formulas for different x-ranges.</li>
            <li>Use clear interval notation and avoid gaps or overlapping definitions.</li>
            <li>Graph with filled or open circles to indicate included or excluded endpoints.</li>
            <li>Test boundary values carefully to ensure correct behavior.</li>
          </ul>
        </div>

        {/* Examples */}
        <h2 className="text-xl font-semibold text-gray-800">Examples</h2>
        <div className="grid gap-4">
          <div className="bg-white p-4 rounded border border-gray-300 shadow-sm">
            <p className="text-sm text-gray-800 mb-2 font-semibold">
              Example 1: Absolute Value as a Piecewise Function
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-3 rounded border border-gray-300">
{`f(x) = {
  -x   if x < 0
   x   if x ≥ 0
}

function f(x: number): number {
  if (x < 0) return -x;
  return x;
}

f(-3); // 3
f(4);  // 4`}
            </pre>
          </div>
          <div className="bg-white p-4 rounded border border-gray-300 shadow-sm">
            <p className="text-sm text-gray-800 mb-2 font-semibold">
              Example 2: Custom Piecewise Function
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-3 rounded border border-gray-300">
{`h(x) = {
  -x        if x < 0
  x^2       if 0 ≤ x ≤ 2
  2x + 1    if x > 2
}

function h(x: number): number {
  if (x < 0) return -x;
  if (x <= 2) return x * x;
  return 2 * x + 1;
}

h(-3); // 3
h(1);  // 1
h(4);  // 9`}
            </pre>
          </div>
        </div>

        {/* Tips Box */}
        <div className="bg-green-50 p-4 rounded border border-green-300 shadow-sm">
          <p className="text-green-800 font-semibold mb-2">✅ Tips for Piecewise Functions:</p>
          <ul className="list-disc list-inside text-green-800 space-y-1">
            <li>Clearly define each interval without overlap or gaps.</li>
            <li>Use closed/open circles when graphing boundaries correctly.</li>
            <li>Always validate behavior at boundary values.</li>
            <li>Label your graph segments clearly.</li>
          </ul>
        </div>

        {/* Embedded Video */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Watch: Understanding Piecewise Functions</h3>
          <iframe
            width="100%"
            height="500"
            src="https://www.youtube.com/embed/OYOXMyFKotc?si=opgyf682WDfpoOrf"
            title="Piecewise Functions Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="rounded border border-gray-300"
          ></iframe>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Piecewisetopic;
