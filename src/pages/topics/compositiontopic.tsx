import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";


function Compositiontopic() {
  const [inputValue, setInputValue] = useState(0);

  const functionG = (x: number) => x + 2; // g(x) = x + 2
  const functionF = (x: number) => 3 * x - 4; // f(x) = 3x - 4

  const compositionFG = (x: number) => functionF(functionG(x)); // f(g(x))
  const compositionGF = (x: number) => functionG(functionF(x)); // g(f(x))

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <BackButton />
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Composition of Functions
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <p className="text-gray-700">
            The <strong>composition of functions</strong> combines two functions into a single function. If we have functions f(x) and g(x), then the composition f(g(x)) means applying g(x) first and then applying f to the result.
          </p>

          <div className="bg-blue-100 p-4 rounded border-l-4 border-blue-500">
            <p className="text-blue-800 font-semibold mb-2">Key Point:</p>
            <ul className="list-disc list-inside text-blue-800">
              <li>The order of composition matters: f(g(x)) is generally different from g(f(x)).</li>
              <li>Always start with the innermost function and work outward.</li>
            </ul>
          </div>

          <h2 className="text-xl font-semibold text-gray-800">Explore Function Composition</h2>

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
              <p className="font-semibold text-gray-800">g(x) = x + 2</p>
              <p className="text-sm text-gray-700">g({inputValue}) = {functionG(inputValue)}</p>
            </div>

            <div className="bg-gray-100 p-4 rounded">
              <p className="font-semibold text-gray-800">f(x) = 3x - 4</p>
              <p className="text-sm text-gray-700">f({inputValue}) = {functionF(inputValue)}</p>
            </div>

            <div className="bg-gray-100 p-4 rounded">
              <p className="font-semibold text-gray-800">Composition: f(g(x))</p>
              <p className="text-sm text-gray-700">f(g({inputValue})) = {compositionFG(inputValue)}</p>
            </div>

            <div className="bg-gray-100 p-4 rounded">
              <p className="font-semibold text-gray-800">Composition: g(f(x))</p>
              <p className="text-sm text-gray-700">g(f({inputValue})) = {compositionGF(inputValue)}</p>
            </div>
          </div>

          <p className="text-gray-700">
            Understanding composition of functions is important in mathematics, as it allows us to combine operations and analyze their combined effect.
          </p>
        </div>
      </main>
      <BackButton />
      <Footer />
    </div>
  );
}

export default Compositiontopic;
