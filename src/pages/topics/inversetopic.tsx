import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";

function Inversetopic() {
  const [inputValue, setInputValue] = useState(0);

  const originalFunction = (x: number) => 2 * x + 3; // f(x) = 2x + 3
  const inverseFunction = (y: number) => (y - 3) / 2; // f⁻¹(y) = (y - 3) / 2

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <BackButton />

        {/* Topic Name */}
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Inverse Functions
        </h1>

        {/* Topic Description */}
        <p className="text-gray-700 bg-white p-4 rounded border border-gray-300 shadow-sm">
          An <strong>inverse function</strong> reverses the operation of the
          original function. If f(x) maps x to y, then the inverse function f⁻¹(y)
          maps y back to x.
        </p>

        {/* Important Concepts */}
        <div className="bg-blue-50 p-4 rounded border border-blue-300 shadow-sm">
          <p className="text-blue-800 font-semibold mb-2">Important Concepts:</p>
          <ul className="list-disc list-inside text-blue-800">
            <li>
              An inverse function exists only if the original function is
              one-to-one (bijective).
            </li>
            <li>
              The graph of a function and its inverse are symmetric about the
              line y = x.
            </li>
            <li>
              To find the inverse, solve the equation y = f(x) for x in terms of
              y.
            </li>
          </ul>
        </div>

        {/* Example Section */}
        <h2 className="text-xl font-semibold text-gray-800">
          Example: Exploring Inverse Functions
        </h2>
        <label className="block text-sm text-gray-700 mb-2">
          Enter an input value for the original function f(x) = 2x + 3:
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
              Original Function: f(x) = 2x + 3
            </p>
            <p className="text-sm text-gray-700">
              f({inputValue}) = {originalFunction(inputValue)}
            </p>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="font-semibold text-gray-800">
              Inverse Function: f⁻¹(y) = (y - 3) / 2
            </p>
            <p className="text-sm text-gray-700">
              f⁻¹({originalFunction(inputValue)}) ={" "}
              {inverseFunction(originalFunction(inputValue))}
            </p>
          </div>
        </div>

        {/* Embedded Video */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">
            Watch: Inverse Functions Explained
          </h3>
          <iframe
            width="100%"
            height="500"
            src="https://www.youtube.com/embed/TN4ybFiuV3k?si=y2e-ffaS93Lafcfc"
            title="Inverse Functions Video"
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

export default Inversetopic;
