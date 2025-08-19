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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <BackButton />

        {/* Topic Name */}
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Rational Functions
        </h1>

        {/* Topic Description */}
        <p className="text-gray-700 bg-white p-4 rounded border border-gray-300 shadow-sm">
          A <strong>rational function</strong> is a ratio of two polynomial functions.
          For example, <code>f(x) = 1/x</code> or <code>f(x) = 1/(x - 2)</code>.
          These functions often have restrictions on their domain to avoid values
          that make the denominator zero.
        </p>

        {/* Important Concepts */}
        <div className="bg-blue-50 p-4 rounded border border-blue-300 shadow-sm">
          <p className="text-blue-800 font-semibold mb-2">Important Concepts:</p>
          <ul className="list-disc list-inside text-blue-800">
            <li>
              Rational functions are undefined where their denominator equals zero.
            </li>
            <li>
              They often have vertical and horizontal asymptotes.
            </li>
            <li>
              The graph behavior near asymptotes is key for understanding their
              properties.
            </li>
          </ul>
        </div>

        {/* Examples */}
        <h2 className="text-xl font-semibold text-gray-800">Examples</h2>
        <div className="bg-white p-4 rounded border border-gray-300 shadow-sm space-y-4">
          <div className="bg-gray-100 p-4 rounded">
            <p className="font-semibold text-gray-800">f(x) = 1 / x</p>
            <p className="text-sm text-gray-700">Example: If x = 4, then f(4) = 0.25</p>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="font-semibold text-gray-800">f(x) = 1 / (x - 2)</p>
            <p className="text-sm text-gray-700">Example: If x = 3, then f(3) = 1.00</p>
          </div>
        </div>

        {/* Interactive Input */}
        <h2 className="text-xl font-semibold text-gray-800">Try It Yourself:</h2>
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
            <p className="font-semibold text-gray-800">
              Rational Function: f(x) = 1 / x
            </p>
            <p className="text-sm text-gray-700">
              f({inputValue}) = {rationalFunction(inputValue)}
            </p>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="font-semibold text-gray-800">
              Shifted Rational Function: f(x) = 1 / (x - 2)
            </p>
            <p className="text-sm text-gray-700">
              f({inputValue}) = {shiftedRationalFunction(inputValue)}
            </p>
          </div>
        </div>

        {/* Embedded Video */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Watch: Rational Functions</h3>
          <iframe
            width="100%"
            height="500"
            src="https://www.youtube.com/embed/XE-Z2-F3oWw?si=lmVcZniVQARpA4Ne"
            title="Rational Functions Video"
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

export default Rationaltopic;
