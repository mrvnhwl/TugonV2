import React from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";

function Operationstopic() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <BackButton />
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Operations on Functions
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <p className="text-gray-700">
            Just like numbers, functions can be added, subtracted, multiplied, and divided. These operations allow us to build new functions from existing ones and are especially helpful when modeling complex scenarios.
          </p>

          <p className="text-gray-700">
            If you have two functions, f(x) and g(x), the operations are defined as follows:
          </p>

          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Addition:</strong> (f + g)(x) = f(x) + g(x)</li>
            <li><strong>Subtraction:</strong> (f - g)(x) = f(x) - g(x)</li>
            <li><strong>Multiplication:</strong> (f × g)(x) = f(x) × g(x)</li>
            <li><strong>Division:</strong> (f ÷ g)(x) = f(x) ÷ g(x), where g(x) ≠ 0</li>
          </ul>

          <p className="text-gray-700">
            Let's go through some concrete examples using TypeScript to see how these operations work in practice.
          </p>

          <div className="bg-gray-100 p-4 rounded">
            <p className="text-sm text-gray-800 mb-2 font-semibold">Example 1: Function Addition</p>
            <pre className="whitespace-pre-wrap text-sm">
{`function f(x: number): number {
  return x + 2;
}

function g(x: number): number {
  return 3 * x;
}

function add(x: number): number {
  return f(x) + g(x); // (f + g)(x)
}

add(2); // f(2) + g(2) = 4 + 6 = 10`}
            </pre>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="text-sm text-gray-800 mb-2 font-semibold">Example 2: Function Subtraction</p>
            <pre className="whitespace-pre-wrap text-sm">
{`function subtract(x: number): number {
  return f(x) - g(x); // (f - g)(x)
}

subtract(2); // f(2) - g(2) = 4 - 6 = -2`}
            </pre>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="text-sm text-gray-800 mb-2 font-semibold">Example 3: Function Multiplication</p>
            <pre className="whitespace-pre-wrap text-sm">
{`function multiply(x: number): number {
  return f(x) * g(x); // (f × g)(x)
}

multiply(2); // f(2) * g(2) = 4 * 6 = 24`}
            </pre>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="text-sm text-gray-800 mb-2 font-semibold">Example 4: Function Division</p>
            <pre className="whitespace-pre-wrap text-sm">
{`function divide(x: number): number | string {
  const denominator = g(x);
  if (denominator === 0) return "undefined";
  return f(x) / denominator;
}

divide(1); // (1 + 2) / (3 * 1) = 3 / 3 = 1
divide(0); // (0 + 2) / (3 * 0) = 2 / 0 = undefined`}
            </pre>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="text-sm text-gray-800 mb-2 font-semibold">Example 5: Using Expressions</p>
            <pre className="whitespace-pre-wrap text-sm">
{`// Define directly as expressions
const sum = (x: number) => (x + 2) + (3 * x);
sum(2); // 4 + 6 = 10

const diff = (x: number) => (x + 2) - (3 * x);
diff(1); // 3 - 3 = 0`}
            </pre>
          </div>

          <div className="bg-green-100 p-4 rounded border-l-4 border-green-500">
            <p className="text-green-800">
              ✅ <strong>Key Tips:</strong>
            </p>
            <ul className="list-disc list-inside text-green-800 space-y-1">
              <li>Always simplify each function result before combining.</li>
              <li>Be cautious with division—make sure the denominator isn't zero.</li>
              <li>Use parentheses to group expressions when substituting.</li>
              <li>You can define composite functions by chaining results: f(g(x)).</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Operationstopic;