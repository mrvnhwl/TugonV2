import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";

function Logarithmictopic() {
  const [inputValue, setInputValue] = useState(1);

  const logarithmicFunction = (y: number) => {
    if (y <= 0) return "undefined"; // logs not defined for non-positive numbers
    return Math.log2(y).toFixed(4); // log base 2
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <BackButton />

        {/* Topic Name */}
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Logarithmic Functions
        </h1>

        {/* Topic Description */}
        <p className="text-gray-700 bg-white p-4 rounded border border-gray-300 shadow-sm">
          A <strong>logarithmic function</strong> is the inverse of an exponential function. 
          In general, <code>logₐ(x)</code> answers the question: 
          “To what power must the base <code>a</code> be raised, to get <code>x</code>?”
        </p>

        {/* Important Concepts */}
        <div className="bg-yellow-50 p-4 rounded border border-yellow-300 shadow-sm">
          <p className="text-yellow-800 font-semibold mb-2">Important Concepts:</p>
          <ul className="list-disc list-inside text-yellow-800">
            <li>Domain: <code>x &gt; 0</code> (logarithms are undefined for zero or negative values).</li>
            <li>Range: all real numbers (<code>-∞</code> to <code>+∞</code>).</li>
            <li>If <code>a &gt; 1</code>, the log function increases; if <code>0 &lt; a &lt; 1</code>, it decreases.</li>
            <li>The graph of <code>y = logₐ(x)</code> is the reflection of <code>y = a^x</code> across the line <code>y = x</code>.</li>
          </ul>
        </div>

        {/* Example Section */}
        <h2 className="text-xl font-semibold text-gray-800">
          Example: Exploring f(x) = log₂(x)
        </h2>
        <label className="block text-sm text-gray-700 mb-2">
          Enter a positive value for x:
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-yellow-200"
          />
        </label>

        <div className="bg-gray-100 p-4 rounded">
          <p className="font-semibold text-gray-800">
            Logarithmic Function: f(x) = log₂(x)
          </p>
          <p className="text-sm text-gray-700">
            f({inputValue}) = {logarithmicFunction(inputValue)}
          </p>
        </div>

        {/* Embedded Video */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">
            Watch: Logarithmic Functions Explained
          </h3>
          <iframe
            width="100%"
            height="500"
            src="https://www.youtube.com/embed/kqVpPSzkTYA?si=0mXoAbnD7zKSpu9u"
            title="Logarithmic Functions Video"
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

export default Logarithmictopic;
