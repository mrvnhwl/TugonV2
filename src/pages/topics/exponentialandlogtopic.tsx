import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";
function ExponentialLogarithmictopic() {
  const [inputValue, setInputValue] = useState(1);

  const exponentialFunction = (x: number) => Math.pow(2, x); // f(x) = 2^x
  const logarithmicFunction = (y: number) => Math.log2(y);   // f⁻¹(y) = log₂(y)

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <BackButton />
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Exponential and Logarithmic Functions
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <p className="text-gray-700">
            An <strong>exponential function</strong> has the form <code>f(x) = a^x</code>, where the variable is the exponent. Its inverse is the <strong>logarithmic function</strong> <code>f⁻¹(x) = logₐ(x)</code>.
          </p>

          <div className="bg-green-100 p-4 rounded border-l-4 border-green-500">
            <p className="text-green-800 font-semibold mb-2">Key Points:</p>
            <ul className="list-disc list-inside text-green-800">
              <li>Exponential growth is rapid and used in modeling populations, finance, etc.</li>
              <li>Logarithms undo exponential functions and are useful in solving for exponents.</li>
              <li>logₐ(b) answers the question: “To what power must a be raised to get b?”</li>
              <li>The base of a logarithm must be positive and not equal to 1.</li>
            </ul>
          </div>

          <h2 className="text-xl font-semibold text-gray-800">Explore the Functions</h2>

          <label className="block text-sm text-gray-700 mb-2">
            Enter a value for x (input of exponential function):
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-green-200"
            />
          </label>

          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded">
              <p className="font-semibold text-gray-800">Exponential Function: f(x) = 2^x</p>
              <p className="text-sm text-gray-700">f({inputValue}) = {exponentialFunction(inputValue)}</p>
            </div>

            <div className="bg-gray-100 p-4 rounded">
              <p className="font-semibold text-gray-800">Logarithmic Function: f⁻¹(y) = log₂(y)</p>
              <p className="text-sm text-gray-700">
                f⁻¹({exponentialFunction(inputValue)}) = {logarithmicFunction(exponentialFunction(inputValue)).toFixed(4)}
              </p>
            </div>
          </div>

          <p className="text-gray-700">
            Exponential and logarithmic functions are inverse operations. Understanding them is key in fields such as science, engineering, and computer science.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ExponentialLogarithmictopic;
