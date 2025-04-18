import React from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";


function Asymptotestopic() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <BackButton />
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Vertical, Horizontal, and Oblique Asymptotes
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <p className="text-gray-700">
            An <strong>asymptote</strong> is a line that a graph approaches but never touches. Rational functions often have vertical, horizontal, or oblique asymptotes, which help describe the function's behavior at extreme values or undefined points.
          </p>

          <div className="bg-blue-100 p-4 rounded border-l-4 border-blue-500">
            <p className="text-blue-800 font-semibold mb-2">Key Points:</p>
            <ul className="list-disc list-inside text-blue-800">
              <li><strong>Vertical asymptotes</strong> occur where the denominator of a rational function equals zero.</li>
              <li><strong>Horizontal asymptotes</strong> describe the end behavior of a function as x approaches ±∞.</li>
              <li><strong>Oblique asymptotes</strong> appear when the degree of the numerator is one higher than the degree of the denominator.</li>
            </ul>
          </div>

          <h2 className="text-xl font-semibold text-gray-800">Examples of Asymptotes</h2>

          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded">
              <p className="font-semibold text-gray-800">Vertical Asymptote</p>
              <p className="text-sm text-gray-700">Example: f(x) = 1 / (x - 2) has a vertical asymptote at x = 2.</p>
              <img
                src="/images/vertical-asymptote.png"
                alt="Graph with vertical asymptote"
                className="mt-2 w-full h-auto rounded shadow"
              />
            </div>

            <div className="bg-gray-100 p-4 rounded">
              <p className="font-semibold text-gray-800">Horizontal Asymptote</p>
              <p className="text-sm text-gray-700">Example: f(x) = 3 / (x + 1) has a horizontal asymptote at y = 0.</p>
              <img
                src="/images/horizontal-asymptote.png"
                alt="Graph with horizontal asymptote"
                className="mt-2 w-full h-auto rounded shadow"
              />
            </div>

            <div className="bg-gray-100 p-4 rounded">
              <p className="font-semibold text-gray-800">Oblique Asymptote</p>
              <p className="text-sm text-gray-700">Example: f(x) = (2x² + 3) / (x) has an oblique asymptote y = 2x.</p>
              <img
                src="/images/oblique-asymptote.png"
                alt="Graph with oblique asymptote"
                className="mt-2 w-full h-auto rounded shadow"
              />
            </div>
          </div>

          <p className="text-gray-700">
            Understanding asymptotes is essential for analyzing the behavior of rational functions and sketching their graphs accurately.
          </p>
        </div>
      </main>
      <BackButton />
      <Footer />
    </div>
  );
}

export default Asymptotestopic;
