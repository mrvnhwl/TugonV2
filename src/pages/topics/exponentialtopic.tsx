import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";

function Exponentialtopic() {
  const [inputValue, setInputValue] = useState(1);

  const exponentialFunction = (x: number) => Math.pow(2, x); // f(x) = 2^x

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <BackButton />

        {/* Topic Name */}
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Exponential Functions
        </h1>

        {/* Topic Description */}
        <p className="text-gray-700 bg-white p-4 rounded border border-gray-300 shadow-sm">
          An <strong>exponential function</strong> has the form{" "}
          <code>f(x) = a^x</code>, where the variable is in the exponent. 
          These functions are widely used to model growth and decay processes 
          in science, finance, and engineering.
        </p>

        {/* Important Concepts */}
        <div className="bg-green-50 p-4 rounded border border-green-300 shadow-sm">
          <p className="text-green-800 font-semibold mb-2">Important Concepts:</p>
          <ul className="list-disc list-inside text-green-800">
            <li>The base <code>a</code> must be positive and not equal to 1.</li>
            <li>If <code>a &gt; 1</code>, the function represents exponential growth.</li>
            <li>If <code>0 &lt; a &lt; 1</code>, the function represents exponential decay.</li>
            <li>Exponential growth is rapid and increases without bound as x increases.</li>
          </ul>
        </div>

        {/* Example Section */}
        <h2 className="text-xl font-semibold text-gray-800">
          Example: Exploring f(x) = 2<sup>x</sup>
        </h2>
        <label className="block text-sm text-gray-700 mb-2">
          Enter a value for x:
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-green-200"
          />
        </label>

        <div className="bg-gray-100 p-4 rounded">
          <p className="font-semibold text-gray-800">
            Exponential Function: f(x) = 2<sup>x</sup>
          </p>
          <p className="text-sm text-gray-700">
            f({inputValue}) = {exponentialFunction(inputValue)}
          </p>
        </div>

        {/* Embedded Video */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">
            Watch: Exponential Functions Explained
          </h3>
          <iframe
            width="100%"
            height="500"
            src="https://www.youtube.com/embed/9tutJ5xrRwg?si=WEzcnw1kptuhCAGX"
            title="Exponential Functions Video"
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

export default Exponentialtopic;
