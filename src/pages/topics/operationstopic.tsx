import React from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";

function Operationstopic() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <BackButton />

        {/* Topic Name */}
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Operations on Functions
        </h1>

        {/* Topic Description */}
        <p className="text-gray-700 bg-white p-4 rounded border border-gray-300 shadow-sm">
          Just like numbers, functions can be added, subtracted, multiplied, and
          divided. These operations allow us to build new functions from existing
          ones and are especially useful when modeling complex situations.
        </p>

        {/* Important Concepts */}
        <div className="bg-blue-50 p-4 rounded border border-blue-300 shadow-sm">
          <p className="text-blue-800 font-semibold mb-2">Important Concepts:</p>
          <ul className="list-disc list-inside text-blue-800">
            <li>
              <strong>Addition:</strong> <code>(f + g)(x) = f(x) + g(x)</code>
            </li>
            <li>
              <strong>Subtraction:</strong> <code>(f - g)(x) = f(x) - g(x)</code>
            </li>
            <li>
              <strong>Multiplication:</strong> <code>(f × g)(x) = f(x) × g(x)</code>
            </li>
            <li>
              <strong>Division:</strong> <code>(f ÷ g)(x) = f(x) ÷ g(x)</code>,
              where <code>g(x) ≠ 0</code>
            </li>
            <li>
              Always check for undefined cases like division by zero.
            </li>
          </ul>
        </div>

        {/* Examples */}
        <h2 className="text-xl font-semibold text-gray-800">Examples</h2>
        <div className="grid gap-4">
          <div className="bg-white p-4 rounded border border-gray-300 shadow-sm">
            <p className="text-sm text-gray-800 mb-2 font-semibold">
              Example 1: Function Addition
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-3 rounded border border-gray-300">
{`function f(x: number): number {
  return x + 2;
}

function g(x: number): number {
  return 3 * x;
}

function add(x: number): number {
  return f(x) + g(x);
}

add(2); // 4 + 6 = 10`}
            </pre>
          </div>

          <div className="bg-white p-4 rounded border border-gray-300 shadow-sm">
            <p className="text-sm text-gray-800 mb-2 font-semibold">
              Example 2: Function Subtraction
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-3 rounded border border-gray-300">
{`function subtract(x: number): number {
  return f(x) - g(x);
}

subtract(2); // 4 - 6 = -2`}
            </pre>
          </div>

          <div className="bg-white p-4 rounded border border-gray-300 shadow-sm">
            <p className="text-sm text-gray-800 mb-2 font-semibold">
              Example 3: Function Multiplication
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-3 rounded border border-gray-300">
{`function multiply(x: number): number {
  return f(x) * g(x);
}

multiply(2); // 4 * 6 = 24`}
            </pre>
          </div>

          <div className="bg-white p-4 rounded border border-gray-300 shadow-sm">
            <p className="text-sm text-gray-800 mb-2 font-semibold">
              Example 4: Function Division
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-3 rounded border border-gray-300">
{`function divide(x: number): number | string {
  const denominator = g(x);
  if (denominator === 0) return "undefined";
  return f(x) / denominator;
}

divide(1); // 3 / 3 = 1
divide(0); // 2 / 0 = undefined`}
            </pre>
          </div>

          <div className="bg-white p-4 rounded border border-gray-300 shadow-sm">
            <p className="text-sm text-gray-800 mb-2 font-semibold">
              Example 5: Using Expressions Directly
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-3 rounded border border-gray-300">
{`const sum = (x: number) => (x + 2) + (3 * x);
sum(2); // 10

const diff = (x: number) => (x + 2) - (3 * x);
diff(1); // 0`}
            </pre>
          </div>
        </div>

        {/* Tips Box */}
        <div className="bg-green-50 p-4 rounded border border-green-300 shadow-sm">
          <p className="text-green-800 font-semibold mb-2">✅ Key Tips:</p>
          <ul className="list-disc list-inside text-green-800 space-y-1">
            <li>Simplify each function before combining results.</li>
            <li>Check for division by zero before dividing.</li>
            <li>Use parentheses to keep operations clear.</li>
            <li>Composite functions can be created by nesting: f(g(x)).</li>
          </ul>
        </div>

        {/* Embedded Video */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Watch: Operations on Functions</h3>
          <iframe
            width="100%"
            height="500"
            src="https://www.youtube.com/embed/3gaxVHVI4cI?si=0lhAkujS2_sB39sx"
            title="Operations on Functions Video"
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

export default Operationstopic;
