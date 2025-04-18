import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";

function Rationaltopic() {
  const [inputValue, setInputValue] = useState(0);

  const rationalFunction = (x: number) => {
    if (x === 0) return "undefined"; 
    return (1 / x).toFixed(2);
  };

  const shiftedRationalFunction = (x: number) => {
    if (x === 2) return "undefined"; 
    return (1 / (x - 2)).toFixed(2);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <BackButton />
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Rational Functions
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <p className="text-gray-700">
            A <strong>rational function</strong> is a ratio of two polynomial functions. For example, f(x) = 1/x or f(x) = 1/(x - 2).
            Rational functions often have restrictions on their domain, such as avoiding values that make the denominator zero.
          </p>

          <div className="bg-blue-100 p-4 rounded border-l-4 border-blue-500">
            <p className="text-blue-800 font-semibold mb-2">Key Points:</p>
            <ul className="list-disc list-inside text-blue-800">
              <li>Rational functions are undefined where their denominator equals zero.</li>
              <li>They often feature vertical asymptotes and horizontal asymptotes in their graphs.</li>
            </ul>
          </div>

          <h2 className="text-xl font-semibold text-gray-800">Explore Rational Functions</h2>

          <label className="block text-sm text-gray-700 mb-2">
            Choose an input value (x):
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
            />
          </label>

          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded">
              <p className="font-semibold text-gray-800">Rational Function: f(x) = 1 / x</p>
              <p className="text-sm text-gray-700">f({inputValue}) = {rationalFunction(inputValue)}</p>
              <p className="text-sm text-gray-600">Example: If x = 4, then f(4) = 1 / 4 = 0.25.</p>
            </div>

            <div className="bg-gray-100 p-4 rounded">
              <p className="font-semibold text-gray-800">Shifted Rational Function: f(x) = 1 / (x - 2)</p>
              <p className="text-sm text-gray-700">f({inputValue}) = {shiftedRationalFunction(inputValue)}</p>
              <p className="text-sm text-gray-600">Example: If x = 3, then f(3) = 1 / (3 - 2) = 1.00.</p>
            </div>
          </div>

          <p className="text-gray-700">
            Rational functions are fundamental in mathematics and are used in various fields to model real-world relationships. Their behavior near asymptotes is particularly important in graphing and analysis.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Rationaltopic;
