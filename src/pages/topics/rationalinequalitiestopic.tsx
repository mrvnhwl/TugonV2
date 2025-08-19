import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";

function RationalEquationsInequalities() {
  const [equationInput, setEquationInput] = useState(0);
  const [inequalityInput, setInequalityInput] = useState(0);

  const solveEquation = (x: number) => {
    if (x === 0) return "No solution (undefined at x = 0)";
    return 1 / x === 2 ? "x = 0.5" : "No solution for x = " + x;
  };

  const checkInequality = (x: number) => {
    if (x === 0) return "No solution (undefined at x = 0)";
    return 1 / x > 1 ? "True" : "False";
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <BackButton />

        {/* ===== Rational Equations Section ===== */}
        <section className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            Rational Equations
          </h1>

          {/* Topic Description */}
          <p className="text-gray-700">
            A <strong>rational equation</strong> is an equation that contains
            one or more rational expressions. These are solved by finding a
            common denominator, eliminating it, and solving the resulting
            equation—while keeping in mind restrictions in the domain.
          </p>

          {/* Important Concepts */}
          <div className="bg-blue-100 p-4 rounded border-l-4 border-blue-500">
            <p className="text-blue-800 font-semibold mb-2">
              Important Concepts:
            </p>
            <ul className="list-disc list-inside text-blue-800">
              <li>
                Multiply through by the least common denominator (LCD) to
                eliminate fractions.
              </li>
              <li>
                Always check for extraneous solutions caused by restricted
                values.
              </li>
              <li>
                The equation is undefined if any denominator equals zero.
              </li>
            </ul>
          </div>

          {/* Video */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">
              Watch: How to Solve Rational Equations
            </h3>
            <iframe
              width="100%"
              height="500"
              src="https://www.youtube.com/embed/1fR_9ke5-n8?si=uCCnVeIVd0vPITwk"
              title="Rational Equations Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="rounded border border-gray-300"
            ></iframe>
          </div>

          {/* Example */}
          <div className="bg-gray-100 p-4 rounded">
            <p className="font-semibold text-gray-800">
              Example: Solve 1 / x = 2
            </p>
            <label className="block text-sm text-gray-700 mb-2">
              Enter a value for x:
              <input
                type="number"
                value={equationInput}
                onChange={(e) => setEquationInput(Number(e.target.value))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              />
            </label>
            <p className="text-sm text-gray-700">
              Result: {solveEquation(equationInput)}
            </p>
          </div>
        </section>

        {/* ===== Rational Inequalities Section ===== */}
        <section className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            Rational Inequalities
          </h1>

          {/* Topic Description */}
          <p className="text-gray-700">
            A <strong>rational inequality</strong> compares two rational
            expressions using inequality symbols. The solution requires finding
            the critical points from the numerator and denominator and testing
            intervals to determine where the inequality holds.
          </p>

          {/* Important Concepts */}
          <div className="bg-blue-100 p-4 rounded border-l-4 border-blue-500">
            <p className="text-blue-800 font-semibold mb-2">
              Important Concepts:
            </p>
            <ul className="list-disc list-inside text-blue-800">
              <li>
                Determine points where the numerator or denominator is zero.
              </li>
              <li>Divide the number line into intervals based on these points.</li>
              <li>
                Test a point from each interval to see if the inequality is
                satisfied.
              </li>
            </ul>
          </div>

          {/* Video */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">
              Watch: Solving Rational Inequalities
            </h3>
            <iframe
              width="100%"
              height="500"
              src="https://www.youtube.com/embed/gfnVHwhEe6U?si=oaJfoZFFKhpkMXoP"
              title="Rational Inequalities Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="rounded border border-gray-300"
            ></iframe>
          </div>

          {/* Example */}
          <div className="bg-gray-100 p-4 rounded">
            <p className="font-semibold text-gray-800">
              Example: Check if 1 / x &gt; 1
            </p>
            <label className="block text-sm text-gray-700 mb-2">
              Enter a value for x:
              <input
                type="number"
                value={inequalityInput}
                onChange={(e) => setInequalityInput(Number(e.target.value))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              />
            </label>
            <p className="text-sm text-gray-700">
              Result: {checkInequality(inequalityInput)}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default RationalEquationsInequalities;
