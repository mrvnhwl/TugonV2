import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";

function RationalEquationsInequalities() {
  const [equationInput, setEquationInput] = useState(0);
  const [inequalityInput, setInequalityInput] = useState(0);

  const solveEquation = (x: number) => {
    // Example: Solve 1 / x = 2
    if (x === 0) return "No solution (undefined at x = 0)";
    return (1 / x === 2) ? "x = 0.5" : "No solution for x = " + x;
  };

  const checkInequality = (x: number) => {
    // Example: Check if 1 / x > 1
    if (x === 0) return "No solution (undefined at x = 0)";
    return (1 / x > 1) ? "True" : "False";

  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <BackButton />
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Solving Rational Equations and Inequalities
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <p className="text-gray-700">
            Rational equations and inequalities involve rational expressions and their comparisons. Solutions require analyzing the domain and addressing undefined values in the rational expressions.
          </p>

          <div className="bg-blue-100 p-4 rounded border-l-4 border-blue-500">
            <p className="text-blue-800 font-semibold mb-2">Key Points:</p>
            <ul className="list-disc list-inside text-blue-800">
              <li>Rational equations are solved by eliminating the denominators through multiplication.</li>
              <li>Inequalities require testing intervals based on critical points from the numerator and denominator.</li>
              <li>Always check for restrictions in the domain caused by division by zero.</li>
            </ul>
          </div>

          <h2 className="text-xl font-semibold text-gray-800">Solving a Rational Equation</h2>

          <label className="block text-sm text-gray-700 mb-2">
            Enter a value for x to check if it satisfies the equation 1 / x = 2:
            <input
              type="number"
              value={equationInput}
              onChange={(e) => setEquationInput(Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
            />
          </label>
          <div className="bg-gray-100 p-4 rounded">
            <p className="font-semibold text-gray-800">Result:</p>
            <p className="text-sm text-gray-700">{solveEquation(equationInput)}</p>
          </div>

          <h2 className="text-xl font-semibold text-gray-800">Testing a Rational Inequality</h2>

          <label className="block text-sm text-gray-700 mb-2">
            Enter a value for x to check if 1 / x {'>'} 1:

            <input
              type="number"
              value={inequalityInput}
              onChange={(e) => setInequalityInput(Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
            />
          </label>
          <div className="bg-gray-100 p-4 rounded">
            <p className="font-semibold text-gray-800">Result:</p>
            <p className="text-sm text-gray-700">{checkInequality(inequalityInput)}</p>
          </div>

          <p className="text-gray-700">
            Solving rational equations and inequalities requires careful handling of restrictions in the domain and an understanding of how to manipulate rational expressions.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default RationalEquationsInequalities;
