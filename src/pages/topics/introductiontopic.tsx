import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";
import { Link } from "react-router-dom";

function Introductiontopic() {
  const [inputValue, setInputValue] = useState(0);

  const linearFunction = (x: number) => x + 3;
  const quadraticFunction = (x: number) => 3 * x * x - 4;
  const rationalFunction = (x: number) => {
    if (x === 0) return "undefined";
    return (1 / x).toFixed(2);
  };

  return (
    
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <BackButton />
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Introduction to Functions
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <p className="text-gray-700">
            A <strong>function</strong> is a rule that maps a number to another unique number. The input to the function is called the independent variable, and the output is called the dependent variable.
          </p>

          <div className="bg-blue-100 p-4 rounded border-l-4 border-blue-500">
            <p className="text-blue-800 font-semibold mb-2">Key Point:</p>
            <ul className="list-disc list-inside text-blue-800">
              <li>A function is a rule mapping a number to another unique number.</li>
              <li>The input is called the independent variable, and the output is the dependent variable.</li>
              <li>The graph of a function passes the vertical line test: a vertical line intersects the graph at most once.</li>
            </ul>
          </div>

          <h2 className="text-xl font-semibold text-gray-800">Explore Some Functions</h2>

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
              <p className="font-semibold text-gray-800">Linear Function: f(x) = x + 3</p>
              <p className="text-sm text-gray-700">f({inputValue}) = {linearFunction(inputValue)}</p>
              <p className="text-sm text-gray-600">Example: If x = 2, then f(2) = 2 + 3 = 5.</p>
            </div>

            <div className="bg-gray-100 p-4 rounded">
              <p className="font-semibold text-gray-800">Quadratic Function: f(x) = 3x² - 4</p>
              <p className="text-sm text-gray-700">f({inputValue}) = {quadraticFunction(inputValue)}</p>
              <p className="text-sm text-gray-600">Example: If x = -1, then f(-1) = 3(-1)² - 4 = -1.</p>
            </div>

            <div className="bg-gray-100 p-4 rounded">
              <p className="font-semibold text-gray-800">Rational Function: f(x) = 1 / x</p>
              <p className="text-sm text-gray-700">f({inputValue}) = {rationalFunction(inputValue)}</p>
              <p className="text-sm text-gray-600">Example: If x = 4, then f(4) = 1 / 4 = 0.25.</p>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-800">Important Definitions</h2>

          <div className="bg-green-100 p-4 rounded border-l-4 border-green-500">
            <p className="text-green-800 font-semibold mb-2">Domain and Range:</p>
            <ul className="list-disc list-inside text-green-800">
              <li>The <strong>domain</strong> of a function is the set of all possible input values.</li>
              <li>The <strong>range</strong> of a function is the set of all possible output values.</li>
              <li>Example: For f(x) = 1 / x, the domain is all real numbers except x = 0, and the range is all real numbers except f(x) = 0.</li>
            </ul>
          </div>

          <div className="bg-yellow-100 p-4 rounded border-l-4 border-yellow-500">
            <p className="text-yellow-800 font-semibold mb-2">Vertical Line Test:</p>
            <p className="text-yellow-800">A graph represents a function if and only if every vertical line intersects the graph at most once.</p>
          </div>

          <div className="text-center mt-6">
            <Link
              to="/graphs"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-200"
            >
              Go to Graph Page
            </Link>
          </div>

          <p className="text-gray-700">
            Functions help us understand relationships in mathematics and beyond, such as plotting graphs and exploring domains and ranges. Practice is essential to mastering these concepts.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Introductiontopic;