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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <BackButton />

        {/* Topic Name */}
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Composition of Functions
        </h1>

        {/* Topic Description */}
        <p className="text-gray-700 bg-white p-4 rounded border border-gray-300 shadow-sm">
          The <strong>composition of functions</strong> combines two functions into
          one by applying one function to the result of another. If we have
          functions <code>f(x)</code> and <code>g(x)</code>, then{" "}
          <code>f(g(x))</code> means applying <code>g(x)</code> first, then applying{" "}
          <code>f</code> to the result.
        </p>

        {/* Important Concepts */}
        <div className="bg-blue-50 p-4 rounded border border-blue-300 shadow-sm">
          <p className="text-blue-800 font-semibold mb-2">Important Concepts:</p>
          <ul className="list-disc list-inside text-blue-800">
            <li>
              The order of composition matters: <code>f(g(x))</code> is generally
              different from <code>g(f(x))</code>.
            </li>
            <li>
              Always start with the innermost function and work outward.
            </li>
            <li>
              Composition allows us to create more complex operations from simpler
              ones.
            </li>
          </ul>
        </div>

        {/* Examples */}
        <h2 className="text-xl font-semibold text-gray-800">Examples</h2>
        <div className="bg-white p-4 rounded border border-gray-300 shadow-sm space-y-4">
          <div className="bg-gray-100 p-4 rounded">
            <p className="font-semibold text-gray-800">g(x) = x + 2</p>
            <p className="text-sm text-gray-700">Example: g(4) = 6</p>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="font-semibold text-gray-800">f(x) = 3x - 4</p>
            <p className="text-sm text-gray-700">Example: f(4) = 8</p>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="font-semibold text-gray-800">Composition: f(g(x))</p>
            <pre className="whitespace-pre-wrap text-sm">
{`f(g(x)) = 3(x + 2) - 4
         = 3x + 6 - 4
         = 3x + 2`}
            </pre>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="font-semibold text-gray-800">Composition: g(f(x))</p>
            <pre className="whitespace-pre-wrap text-sm">
{`g(f(x)) = (3x - 4) + 2
         = 3x - 2`}
            </pre>
          </div>
        </div>

        {/* Interactive Input */}
        <h2 className="text-xl font-semibold text-gray-800">
          Try It Yourself:
        </h2>
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
            <p className="text-gray-800 font-semibold">
              g({inputValue}) = {functionG(inputValue)}
            </p>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="text-gray-800 font-semibold">
              f({inputValue}) = {functionF(inputValue)}
            </p>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="text-gray-800 font-semibold">
              f(g({inputValue})) = {compositionFG(inputValue)}
            </p>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="text-gray-800 font-semibold">
              g(f({inputValue})) = {compositionGF(inputValue)}
            </p>
          </div>
        </div>

        {/* Embedded Video */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">
            Watch: Composition of Functions
          </h3>
          <iframe
            width="100%"
            height="500"
            src="https://www.youtube.com/embed/ZFPkQkURSxk?si=BjMaBb2DctJ3QLcU"
            title="Composition of Functions Video"
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

export default Compositiontopic;
