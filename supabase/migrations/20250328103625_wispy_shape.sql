/*
  # Create Sample Quizzes Using Functions (Math Version)

  This migration adds sample quiz data about Grade 11 General Math - Functions.
*/

-- Function to create a quiz
CREATE OR REPLACE FUNCTION create_quiz(p_id UUID, p_title TEXT, p_description TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO quizzes (id, title, description)
  VALUES (p_id, p_title, p_description);
END;
$$ LANGUAGE plpgsql;

-- Function to create a question
CREATE OR REPLACE FUNCTION create_question(p_id UUID, p_quiz_id UUID, p_question TEXT, p_time_limit INT, p_points INT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO questions (id, quiz_id, question, time_limit, points)
  VALUES (p_id, p_quiz_id, p_question, p_time_limit, p_points);
END;
$$ LANGUAGE plpgsql;

-- Function to create an answer
CREATE OR REPLACE FUNCTION create_answer(p_question_id UUID, p_answer TEXT, p_is_correct BOOLEAN)
RETURNS VOID AS $$
BEGIN
  INSERT INTO answers (question_id, answer, is_correct)
  VALUES (p_question_id, p_answer, p_is_correct);
END;
$$ LANGUAGE plpgsql;

-- =========================
-- Insert Sample Quizzes
-- =========================

-- Functions Quiz 1
SELECT create_quiz('11111111-1111-1111-1111-111111111111', 'Functions Basics', 'Test your knowledge of functions and their properties!');

-- Question 1
SELECT create_question('21111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'What is the domain of the function f(x) = 1/x?', 30, 1000);
SELECT create_answer('21111111-1111-1111-1111-111111111111', 'All real numbers except 0', true);
SELECT create_answer('21111111-1111-1111-1111-111111111111', 'All real numbers', false);
SELECT create_answer('21111111-1111-1111-1111-111111111111', 'Positive real numbers', false);
SELECT create_answer('21111111-1111-1111-1111-111111111111', 'Negative real numbers', false);

-- Question 2
SELECT create_question('22222222-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'What is the range of f(x) = x^2?', 30, 1000);
SELECT create_answer('22222222-1111-1111-1111-111111111111', 'All real numbers greater than or equal to 0', true);
SELECT create_answer('22222222-1111-1111-1111-111111111111', 'All real numbers', false);
SELECT create_answer('22222222-1111-1111-1111-111111111111', 'All negative numbers', false);
SELECT create_answer('22222222-1111-1111-1111-111111111111', 'All positive numbers', false);

-- Question 3
SELECT create_question('23333333-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'What type of function is f(x) = 3x + 2?', 30, 1000);
SELECT create_answer('23333333-1111-1111-1111-111111111111', 'Linear', true);
SELECT create_answer('23333333-1111-1111-1111-111111111111', 'Quadratic', false);
SELECT create_answer('23333333-1111-1111-1111-111111111111', 'Exponential', false);
SELECT create_answer('23333333-1111-1111-1111-111111111111', 'Cubic', false);

-- Question 4
SELECT create_question('24444444-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'What is the y-intercept of f(x) = 2x - 5?', 30, 1000);
SELECT create_answer('24444444-1111-1111-1111-111111111111', '-5', true);
SELECT create_answer('24444444-1111-1111-1111-111111111111', '2', false);
SELECT create_answer('24444444-1111-1111-1111-111111111111', '0', false);
SELECT create_answer('24444444-1111-1111-1111-111111111111', '5', false);

-- Question 5
SELECT create_question('25555555-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Which of the following is a quadratic function?', 30, 1000);
SELECT create_answer('25555555-1111-1111-1111-111111111111', 'f(x) = x^2 + 3x + 2', true);
SELECT create_answer('25555555-1111-1111-1111-111111111111', 'f(x) = 2x + 1', false);
SELECT create_answer('25555555-1111-1111-1111-111111111111', 'f(x) = 3^x', false);
SELECT create_answer('25555555-1111-1111-1111-111111111111', 'f(x) = 1/x', false);

-- Question 6
SELECT create_question('26666666-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'What is the inverse of f(x) = 2x + 3?', 30, 1000);
SELECT create_answer('26666666-1111-1111-1111-111111111111', 'f⁻¹(x) = (x - 3)/2', true);
SELECT create_answer('26666666-1111-1111-1111-111111111111', 'f⁻¹(x) = 2x - 3', false);
SELECT create_answer('26666666-1111-1111-1111-111111111111', 'f⁻¹(x) = (x + 3)/2', false);
SELECT create_answer('26666666-1111-1111-1111-111111111111', 'f⁻¹(x) = 2x + 3', false);

-- Question 7
SELECT create_question('27777777-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'What is the value of f(3) if f(x) = x^2 - 4x + 1?', 30, 1000);
SELECT create_answer('27777777-1111-1111-1111-111111111111', '4', true);
SELECT create_answer('27777777-1111-1111-1111-111111111111', '2', false);
SELECT create_answer('27777777-1111-1111-1111-111111111111', '0', false);
SELECT create_answer('27777777-1111-1111-1111-111111111111', '-2', false);

-- Question 8
SELECT create_question('28888888-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'What is the vertex of f(x) = (x - 2)^2 + 3?', 30, 1000);
SELECT create_answer('28888888-1111-1111-1111-111111111111', '(2, 3)', true);
SELECT create_answer('28888888-1111-1111-1111-111111111111', '(-2, 3)', false);
SELECT create_answer('28888888-1111-1111-1111-111111111111', '(3, 2)', false);
SELECT create_answer('28888888-1111-1111-1111-111111111111', '(0, 3)', false);

-- Question 9
SELECT create_question('29999999-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'If f(x) = √x, what is the domain of f?', 30, 1000);
SELECT create_answer('29999999-1111-1111-1111-111111111111', 'All real numbers greater than or equal to 0', true);
SELECT create_answer('29999999-1111-1111-1111-111111111111', 'All real numbers', false);
SELECT create_answer('29999999-1111-1111-1111-111111111111', 'All real numbers less than 0', false);
SELECT create_answer('29999999-1111-1111-1111-111111111111', 'All positive real numbers', false);

-- Question 10
SELECT create_question('2AAAAAAA-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Which of the following represents an exponential function?', 30, 1000);
SELECT create_answer('2AAAAAAA-1111-1111-1111-111111111111', 'f(x) = 2^x', true);
SELECT create_answer('2AAAAAAA-1111-1111-1111-111111111111', 'f(x) = x^2', false);
SELECT create_answer('2AAAAAAA-1111-1111-1111-111111111111', 'f(x) = 3x + 1', false);
SELECT create_answer('2AAAAAAA-1111-1111-1111-111111111111', 'f(x) = 1/x', false);

-- Functions Quiz 2
SELECT create_quiz('33333333-3333-3333-3333-333333333333', 'Advanced Functions', 'Explore advanced topics in functions including composition and inverses.');

SELECT create_question('41111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'What is the inverse of f(x) = 2x + 3?', 30, 1000);
SELECT create_answer('41111111-1111-1111-1111-111111111111', 'f⁻¹(x) = (x - 3)/2', true);
SELECT create_answer('41111111-1111-1111-1111-111111111111', 'f⁻¹(x) = 2x - 3', false);
SELECT create_answer('41111111-1111-1111-1111-111111111111', 'f⁻¹(x) = x/2 + 3', false);
SELECT create_answer('41111111-1111-1111-1111-111111111111', 'f⁻¹(x) = 2x + 3', false);

SELECT create_question('42222222-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'If f(x) = x + 1 and g(x) = 2x, what is f(g(3))?', 30, 1000);
SELECT create_answer('42222222-1111-1111-1111-111111111111', '7', true);
SELECT create_answer('42222222-1111-1111-1111-111111111111', '9', false);
SELECT create_answer('42222222-1111-1111-1111-111111111111', '6', false);
SELECT create_answer('42222222-1111-1111-1111-111111111111', '8', false);

SELECT create_question('43333333-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'What is the vertex of f(x) = (x - 2)^2 + 3?', 30, 1000);
SELECT create_answer('43333333-1111-1111-1111-111111111111', '(2, 3)', true);
SELECT create_answer('43333333-1111-1111-1111-111111111111', '(-2, 3)', false);
SELECT create_answer('43333333-1111-1111-1111-111111111111', '(3, 2)', false);
SELECT create_answer('43333333-1111-1111-1111-111111111111', '(0, 3)', false);

-- Functions Quiz 3
SELECT create_quiz('44444444-4444-4444-4444-444444444444', 'Function Applications', 'Apply your knowledge of functions in real-world problems!');

SELECT create_question('51111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'If f(x) = 5x - 4, what is f(2)?', 30, 1000);
SELECT create_answer('51111111-1111-1111-1111-111111111111', '6', true);
SELECT create_answer('51111111-1111-1111-1111-111111111111', '10', false);
SELECT create_answer('51111111-1111-1111-1111-111111111111', '4', false);
SELECT create_answer('51111111-1111-1111-1111-111111111111', '1', false);

SELECT create_question('52222222-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'What is the zero of f(x) = x - 7?', 30, 1000);
SELECT create_answer('52222222-1111-1111-1111-111111111111', '7', true);
SELECT create_answer('52222222-1111-1111-1111-111111111111', '0', false);
SELECT create_answer('52222222-1111-1111-1111-111111111111', '-7', false);
SELECT create_answer('52222222-1111-1111-1111-111111111111', '1', false);

SELECT create_question('53333333-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'What is f(0) for f(x) = 3x^2 - 2x + 1?', 30, 1000);
SELECT create_answer('53333333-1111-1111-1111-111111111111', '1', true);
SELECT create_answer('53333333-1111-1111-1111-111111111111', '0', false);
SELECT create_answer('53333333-1111-1111-1111-111111111111', '-1', false);
SELECT create_answer('53333333-1111-1111-1111-111111111111', '2', false);