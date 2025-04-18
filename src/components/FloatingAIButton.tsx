import React, { useState } from 'react';

const FloatingAIButton = ({ onWrongAnswer }: { onWrongAnswer: (questionId: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleWrongAnswer = async (questionId: string) => {
    setLoading(true);
    try {
      // Replace with your actual AI API call
      const apiResponse = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`, // Use the environment variable
        },
        body: JSON.stringify({
          model: 'text-davinci-003',
          prompt: `Explain why the answer is wrong for question ${questionId}.`,
          max_tokens: 100,
        }),
      });

      const data = await apiResponse.json();
      setResponse(data.choices[0].text || 'No explanation available.');
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setResponse('BOBO KA.');
    } finally {
      setLoading(false);
      setIsOpen(true);
    }
  };

  return (
    <>
      <button
        className="fixed bottom-4 right-4 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700"
        onClick={() => handleWrongAnswer('example-question-id')}
      >
        AI Help
      </button>
      {isOpen && (
        <div className="fixed bottom-16 right-4 bg-white p-4 rounded-lg shadow-lg w-64">
          <h3 className="font-bold text-gray-900">AI Explanation</h3>
          {loading ? (
            <p className="text-gray-700">Loading...</p>
          ) : (
            <p className="text-gray-700">{response}</p>
          )}
          <button
            className="mt-2 text-indigo-600 hover:underline"
            onClick={() => setIsOpen(false)}
          >
            Close
          </button>
        </div>
      )}
    </>
  );
};

export default FloatingAIButton;