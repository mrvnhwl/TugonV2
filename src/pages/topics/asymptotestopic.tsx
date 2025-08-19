import React from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";

function Asymptotestopic() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <BackButton />

        {/* Topic Name */}
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Graphing Rational Functions
        </h1>
        <h2 className="text-xl font-semibold text-gray-800 text-center">
          Vertical, Horizontal, and Oblique Asymptotes
        </h2>

        {/* Topic Description */}
        <p className="text-gray-700 bg-white p-4 rounded border border-gray-300 shadow-sm">
          An <strong>asymptote</strong> is a line that a graph approaches but never touches. 
          Rational functions often have vertical, horizontal, or oblique asymptotes, 
          which help describe the function's behavior at extreme values or undefined points.
        </p>

        {/* Important Concepts */}
        <div className="bg-blue-50 p-4 rounded border border-blue-300 shadow-sm">
          <p className="text-blue-800 font-semibold mb-2">Important Concepts:</p>
          <ul className="list-disc list-inside text-blue-800">
            <li>
              <strong>Vertical asymptotes</strong> occur where the denominator of a rational function equals zero.
            </li>
            <li>
              <strong>Horizontal asymptotes</strong> describe the end behavior of a function as x approaches ±∞.
            </li>
            <li>
              <strong>Oblique asymptotes</strong> appear when the degree of the numerator is one higher than the degree of the denominator.
            </li>
          </ul>
        </div>

        {/* Examples */}
        <h2 className="text-xl font-semibold text-gray-800">Examples</h2>
        <div className="space-y-4 bg-white p-4 rounded border border-gray-300 shadow-sm">
          <div className="bg-gray-100 p-4 rounded">
            <p className="font-semibold text-gray-800">Vertical Asymptote</p>
            <p className="text-sm text-gray-700">
              Example: f(x) = 1 / (x - 2) has a vertical asymptote at x = 2.
            </p>
            <img
              src="/images/vertical.png"
              alt="Graph with vertical asymptote"
              className="mt-2 w-full h-auto rounded shadow"
            />
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="font-semibold text-gray-800">Horizontal Asymptote</p>
            <p className="text-sm text-gray-700">
              Example: f(x) = 3 / (x + 1) has a horizontal asymptote at y = 0.
            </p>
            <img
              src="/images/horizontal.png"
              alt="Graph with horizontal asymptote"
              className="mt-2 w-full h-auto rounded shadow"
            />
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="font-semibold text-gray-800">Oblique Asymptote</p>
            <p className="text-sm text-gray-700">
              Example: f(x) = (2x² + 3) / (x) has an oblique asymptote y = 2x.
            </p>
            <img
              src="/images/oblique.png"
              alt="Graph with oblique asymptote"
              className="mt-2 w-full h-auto rounded shadow"
            />
          </div>
        </div>

        {/* Embedded Video */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Watch: Asymptotes</h3>
          <iframe
            width="100%"
            height="500"
            src="https://www.youtube.com/embed/qGCKjuhA4eQ?si=GHfjGJHOgg2R-j9V"
            title="Asymptotes Video"
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

export default Asymptotestopic;
