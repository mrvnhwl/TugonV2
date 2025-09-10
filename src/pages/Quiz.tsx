import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Timer, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

interface Question {
  id: string;
  question: string;
  time_limit: number;
  points: number;
}

interface Answer {
  id: string;
  answer: string;
  is_correct: boolean;
}

function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [score, setScore] = useState<number>(0);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [questions, setQuestions] = useState<Question[]>([]);

  const returnTo = location.state?.returnTo || '/challenge';

  // Hide navbar while on quiz page
  useEffect(() => {
    document.body.classList.add('hide-navbar');
    return () => {
      document.body.classList.remove('hide-navbar');
    };
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  useEffect(() => {
    if (currentQuestion) {
      setTimeLeft(30);
      loadAnswers(currentQuestion.id);
      setIsAnswered(false);
    }
  }, [currentQuestion]);

  useEffect(() => {
    if (timeLeft > 0 && !isAnswered) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      handleTimeout();
    }
  }, [timeLeft, isAnswered]);

  const loadQuiz = async () => {
    try {
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', id)
        .single();

      if (quizError) throw quizError;

      if (quizData) {
        setQuiz(quizData);

        const { data: questionsData, error: qErr } = await supabase
          .from('questions')
          .select('*')
          .eq('quiz_id', id)
          .order('created_at');

        if (qErr) throw qErr;

        if (questionsData && questionsData.length > 0) {
          setQuestions(questionsData);
          setCurrentQuestion(questionsData[0]);
        }
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      toast.error('Failed to load quiz.');
    }
  };

  const loadAnswers = async (questionId: string) => {
    try {
      const { data: answersData, error } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', questionId);

      if (error) throw error;
      if (answersData) setAnswers(answersData);
    } catch (e) {
      console.error('Error loading answers:', e);
      toast.error('Failed to load answers.');
    }
  };

  const handleTimeout = () => {
    setIsAnswered(true);
  };

  const handleAnswer = (answer: Answer) => {
    if (isAnswered) return;
    setIsAnswered(true);

    if (answer.is_correct && currentQuestion) {
      const timeBonus = Math.floor((timeLeft / 30) * currentQuestion.points);
      setScore((prev) => prev + timeBonus);
    }
  };

  const nextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      const nextIndex = questionIndex + 1;
      setQuestionIndex(nextIndex);
      setCurrentQuestion(questions[nextIndex]);
    } else {
      finishQuiz();
    }
  };

  const prevQuestion = () => {
    if (questionIndex > 0) {
      const prevIndex = questionIndex - 1;
      setQuestionIndex(prevIndex);
      setCurrentQuestion(questions[prevIndex]);
    }
  };

  const finishQuiz = async () => {
    try {
      await supabase.from('user_progress').insert({
        user_id: user?.id,
        quiz_id: id,
        score,
        user_email: user?.email,
      });
      toast.success('Challenge Completed!');
    } catch (e) {
      console.error('Error saving progress:', e);
      toast.error('Failed to save progress.');
    }
    navigate(returnTo);
  };

  if (!quiz || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <MathJaxContext>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              <MathJax dynamic>{quiz.title}</MathJax>
            </h1>
            <div className="flex items-center space-x-2">
              <Timer className="h-5 w-5 text-indigo-600" />
              <span className="text-lg font-semibold">{timeLeft}s</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              <MathJax dynamic>{currentQuestion.question}</MathJax>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {answers.map((answer) => (
                <button
                  key={answer.id}
                  onClick={() => handleAnswer(answer)}
                  disabled={isAnswered}
                  className={`p-4 rounded-lg text-left transition-all ${
                    isAnswered
                      ? answer.is_correct
                        ? 'bg-green-100 border-green-500'
                        : 'bg-red-100 border-red-500'
                      : 'bg-gray-100 hover:bg-indigo-100 border-transparent'
                  } border-2`}
                >
                  <div className="flex items-center">
                    <span className="flex-grow">
                      <MathJax dynamic>{answer.answer}</MathJax>
                    </span>
                    {isAnswered &&
                      (answer.is_correct ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center mt-6">
            <button
              onClick={prevQuestion}
              disabled={questionIndex === 0}
              className="bg-gray-200 px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Prev
            </button>
            <div className="text-lg font-semibold">
              Question {questionIndex + 1} of {questions.length}
            </div>
            <button
              onClick={nextQuestion}
              className="bg-indigo-500 text-white px-4 py-2 rounded-lg"
            >
              {questionIndex === questions.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </MathJaxContext>
  );
}

export default Quiz;
