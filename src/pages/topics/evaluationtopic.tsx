import React from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";

function Evaluationtopic() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <BackButton />
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Evaluation of Functions
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <p className="text-gray-700">
            To evaluate a function means to find the output value, <code>f(x)</code>, for a given input <code>x</code>. You simply substitute the value into the function and simplify.
          </p>

          <div className="bg-gray-100 p-4 rounded">
            <p className="text-sm text-gray-800 mb-2 font-semibold">Example 1: Quadratic Function</p>
            <pre className="whitespace-pre-wrap text-sm">
{`function f(x: number): number {
  return x * x + 3 * x - 4;
}

f(2);   // 2² + 3×2 - 4 = 4 + 6 - 4 = 6
f(-1);  // (-1)² + 3×(-1) - 4 = 1 - 3 - 4 = -6
f(0);   // 0² + 3×0 - 4 = -4`}
            </pre>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="text-sm text-gray-800 mb-2 font-semibold">Example 2: Rational Function</p>
            <pre className="whitespace-pre-wrap text-sm">
{`function g(t: number): number | string {
  if (t === 1) return "undefined";
  return 5 / (t - 1);
}

g(3); // 5 / (3 - 1) = 5 / 2 = 2.5
g(1); // undefined because denominator is 0
g(0); // 5 / (0 - 1) = -5`}
            </pre>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="text-sm text-gray-800 mb-2 font-semibold">Example 3: Piecewise Function</p>
            <pre className="whitespace-pre-wrap text-sm">
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

          <div className="bg-gray-100 p-4 rounded">
            <p className="text-sm text-gray-800 mb-2 font-semibold">Example 4: Function with Multiple Variables</p>
            <pre className="whitespace-pre-wrap text-sm">
{`function area(length: number, width: number): number {
  return length * width;
}

area(5, 3);  // 5 × 3 = 15
area(10, 0); // 10 × 0 = 0`}
            </pre>
          </div>

          <div className="bg-yellow-100 p-4 rounded border-l-4 border-yellow-500">
            <p className="text-yellow-800">
              ⚠️ <strong>Watch Out:</strong> Always check for undefined values such as division by zero or values outside of the function's domain.
            </p>
          </div>

          <div className="bg-green-100 p-4 rounded border-l-4 border-green-500">
            <p className="text-green-800 font-semibold">✅ Tips for Evaluating Functions:</p>
            <ul className="list-disc list-inside text-green-800 space-y-1">
              <li>Substitute the input value carefully into the function.</li>
              <li>Follow the correct order of operations (PEMDAS).</li>
              <li>Look out for special rules like absolute value or piecewise conditions.</li>
              <li>Label your intermediate steps for clarity.</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Evaluationtopic;