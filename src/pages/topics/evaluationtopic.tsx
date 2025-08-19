import React from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";

function Evaluationtopic() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <BackButton />

        {/* Topic Name */}
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Evaluation of Functions
        </h1>

        {/* Topic Description */}
        <p className="text-gray-700 bg-white p-4 rounded border border-gray-300 shadow-sm">
          To <strong>evaluate a function</strong> means to find the output value,{" "}
          <code>f(x)</code>, for a given input <code>x</code>. You substitute the
          value into the function and simplify the result.
        </p>

        {/* Important Concepts */}
        <div className="bg-blue-50 p-4 rounded border border-blue-300 shadow-sm">
          <p className="text-blue-800 font-semibold mb-2">Important Concepts:</p>
          <ul className="list-disc list-inside text-blue-800">
            <li>Evaluating a function means finding its output for a specific input.</li>
            <li>Always substitute the value of x carefully into the function.</li>
            <li>Follow the correct order of operations (PEMDAS).</li>
            <li>Be cautious of undefined values like division by zero.</li>
          </ul>
        </div>

        {/* Examples */}
        <h2 className="text-xl font-semibold text-gray-800">Examples</h2>
        <div className="grid gap-4">
          <div className="bg-white p-4 rounded border border-gray-300 shadow-sm">
            <p className="text-sm text-gray-800 mb-2 font-semibold">
              Example 1: Quadratic Function
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-3 rounded border border-gray-300">
{`function f(x: number): number {
  return x * x + 3 * x - 4;
}

f(2);   // 2² + 3×2 - 4 = 4 + 6 - 4 = 6
f(-1);  // (-1)² + 3×(-1) - 4 = 1 - 3 - 4 = -6
f(0);   // 0² + 3×0 - 4 = -4`}
            </pre>
          </div>

          <div className="bg-white p-4 rounded border border-gray-300 shadow-sm">
            <p className="text-sm text-gray-800 mb-2 font-semibold">
              Example 2: Rational Function
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-3 rounded border border-gray-300">
{`function g(t: number): number | string {
  if (t === 1) return "undefined";
  return 5 / (t - 1);
}

g(3); // 5 / (3 - 1) = 5 / 2 = 2.5
g(1); // undefined because denominator is 0
g(0); // 5 / (0 - 1) = -5`}
            </pre>
          </div>

          <div className="bg-white p-4 rounded border border-gray-300 shadow-sm">
            <p className="text-sm text-gray-800 mb-2 font-semibold">
              Example 3: Piecewise Function
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-3 rounded border border-gray-300">
{`function h(x: number): number {
  if (x < 0) return -x;
  if (x >= 0 && x <= 2) return x * x;
  return 2 * x + 1;
}

h(-3);  // -(-3) = 3
h(1);   // 1 * 1 = 1
h(4);   // 2 * 4 + 1 = 9`}
            </pre>
          </div>

          <div className="bg-white p-4 rounded border border-gray-300 shadow-sm">
            <p className="text-sm text-gray-800 mb-2 font-semibold">
              Example 4: Function with Multiple Variables
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-3 rounded border border-gray-300">
{`function area(length: number, width: number): number {
  return length * width;
}

area(5, 3);  // 5 × 3 = 15
area(10, 0); // 10 × 0 = 0`}
            </pre>
          </div>
        </div>

        {/* Warning Box */}
        <div className="bg-yellow-50 p-4 rounded border border-yellow-300 shadow-sm">
          <p className="text-yellow-800">
            ⚠️ <strong>Watch Out:</strong> Always check for undefined values such
            as division by zero or values outside of the function's domain.
          </p>
        </div>

        {/* Tips Box */}
        <div className="bg-green-50 p-4 rounded border border-green-300 shadow-sm">
          <p className="text-green-800 font-semibold mb-2">
            ✅ Tips for Evaluating Functions:
          </p>
          <ul className="list-disc list-inside text-green-800 space-y-1">
            <li>Substitute the input value carefully into the function.</li>
            <li>Follow the correct order of operations (PEMDAS).</li>
            <li>Look out for special rules like absolute value or piecewise conditions.</li>
            <li>Label your intermediate steps for clarity.</li>
          </ul>
        </div>

        {/* Embedded Video */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Watch: How to Evaluate Functions</h3>
          <iframe
            width="100%"
            height="500"
            src="https://www.youtube.com/embed/HyNie_PYgsY?si=zzBg1KogJ0011Xnx"
            title="YouTube video player"
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

export default Evaluationtopic;
