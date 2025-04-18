-- Functions Basics Quiz
INSERT INTO quizzes (id, title, description) VALUES 
('11111111-1111-1111-1111-111111111111', 'Functions Basics', 'Test your knowledge of functions in Grade 11 General Math!');

INSERT INTO questions (id, quiz_id, question, time_limit, points) VALUES
('21111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'What is the domain of the function f(x) = √(x - 3)?', 30, 1000),
('22222222-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'What is the range of the function f(x) = x² + 2?', 30, 1000),
('23333333-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'What is f⁻¹(x) if f(x) = 2x + 5?', 30, 1000),
('24444444-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Which of the following represents a function?', 30, 1000),
('25555555-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'What is the y-intercept of f(x) = -3x + 7?', 30, 1000),
('26666666-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'If f(x) = x² and g(x) = x + 1, what is (f ∘ g)(2)?', 30, 1000),
('27777777-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'What is the vertex of f(x) = (x + 4)² - 2?', 30, 1000),
('28888888-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'What is the zero of the function f(x) = x² - 16?', 30, 1000),
('29999999-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Is f(x) = 3/x a one-to-one function?', 30, 1000),
('21101010-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'What is the effect of a negative leading coefficient in a quadratic function?', 30, 1000);

-- Science Quiz renamed to Advanced Functions
INSERT INTO quizzes (id, title, description) VALUES 
('33333333-3333-3333-3333-333333333333', 'Advanced Functions', 'Explore advanced function concepts in Grade 11 General Math!');

INSERT INTO questions (id, quiz_id, question, time_limit, points) VALUES
('41111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'What is the equation of a line with slope 2 and y-intercept -3?', 30, 1000),
('42222222-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Simplify f(x) = (x² - 9)/(x - 3)', 30, 1000),
('43333333-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'What is the inverse of f(x) = (x - 4)/3?', 30, 1000),
('44444444-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'What type of function is f(x) = |x|?', 30, 1000),
('45555555-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'What is the maximum value of f(x) = -x² + 4x + 1?', 30, 1000),
('46666666-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Which function has a vertical asymptote at x = 0?', 30, 1000),
('47777777-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'What is the degree of the polynomial f(x) = x³ - 2x² + x - 5?', 30, 1000),
('48888888-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'What is the end behavior of f(x) = -2x³?', 30, 1000),
('49999999-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'What is the horizontal asymptote of f(x) = 3/(x + 1)?', 30, 1000),
('41101010-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'What is the solution to f(x) = 0 if f(x) = x² - 5x + 6?', 30, 1000);

-- History Quiz renamed to Functions Applications
INSERT INTO quizzes (id, title, description) VALUES 
('44444444-4444-4444-4444-444444444444', 'Functions Applications', 'Apply your knowledge of functions in real-world problems!');

INSERT INTO questions (id, quiz_id, question, time_limit, points) VALUES
('51111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'Which describes the transformation of f(x) = (x - 2)² + 3 from f(x) = x²?', 30, 1000),
('52222222-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'What is the zero of the function f(x) = x² - 9?', 30, 1000),
('53333333-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'Is f(x) = 3/x a one-to-one function?', 30, 1000),
('54444444-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'What is the average rate of change of f(x) = 2x + 5 between x = 1 and x = 4?', 30, 1000),
('55555555-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'A quadratic function has zeros at x = -2 and x = 5. What is the equation?', 30, 1000),
('56666666-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'What is the maximum or minimum value of f(x) = (x - 3)² - 4?', 30, 1000),
('57777777-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'If f(x) = 4x - 1, what is f(3)?', 30, 1000),
('58888888-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'What is the equation of a function that opens downward and has vertex at (2, 3)?', 30, 1000),
('59999999-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'Which function represents exponential growth?', 30, 1000),
('51101010-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'If f(x) = x² and g(x) = 2x, what is (f ∘ g)(1)?', 30, 1000);
