import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";

function FunctionProblemSolvingtopic() {
  const [xValue, setXValue] = useState(0);

  const functionExample = (x: number) => 3 * x * x - 2 * x + 5; // Example function: f(x) = 3x² - 2x + 5

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <BackButton />
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Problem Solving Involving Functions
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <p className="text-gray-700">
            Functions are powerful tools in mathematics for modeling real-world situations. To solve problems involving functions, we evaluate them at specific values, interpret results, and sometimes compose or invert them.
          </p>

          <div className="bg-yellow-100 p-4 rounded border-l-4 border-yellow-500">
            <p className="text-yellow-800 font-semibold mb-2">Example Problem:</p>
            <p className="text-yellow-800">
              A function is defined as <code>f(x) = 3x² - 2x + 5</code>. What is the value of the function when x = {xValue}?
            </p>
          </div>

          <h2 className="text-xl font-semibold text-gray-800">Try It Yourself</h2>

          <label className="block text-sm text-gray-700 mb-2">
            Enter a value for x:
            <input
              type="number"
              value={xValue}
              onChange={(e) => setXValue(Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-yellow-200"
            />
          </label>

          <div className="bg-gray-100 p-4 rounded">
            <p className="font-semibold text-gray-800">Function: f(x) = 3x² - 2x + 5</p>
            <p className="text-sm text-gray-700">
              f({xValue}) = 3({xValue})² - 2({xValue}) + 5 = {functionExample(xValue)}
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-400">
            <p className="text-blue-800 font-semibold mb-2">Tips for Problem Solving:</p>
            <ul className="list-disc list-inside text-blue-800">
              <li>Understand the function's rule and what it models.</li>
              <li>Substitute the given value(s) correctly.</li>
              <li>Simplify step-by-step to avoid mistakes.</li>
              <li>Interpret the result in the context of the problem.</li>
            </ul>
          </div>

          <p className="text-gray-700">
            Function problems can also involve graphs, multiple variables, or inverse functions. Practice helps build intuition and problem-solving skills.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default FunctionProblemSolvingtopic;
