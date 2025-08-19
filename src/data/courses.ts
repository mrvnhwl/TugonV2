// src/data/courses.ts
// Shared course list for rendering cards and navigation.

export type Course = {
	id: number;
	title: string;
	description: string;
	lessons: number;
	exercises: number;
};

export const courses: Course[] = [
	{ id: 1, title: "Introduction to Functions", description: "Learn about functions, notation, domain, and range.", lessons: 12, exercises: 120 },
	{ id: 2, title: "Evaluating Functions", description: "Practice evaluating functions at numeric and algebraic inputs.", lessons: 12, exercises: 120 },
	{ id: 3, title: "Piecewise-Defined Functions", description: "Understand and analyze piecewise definitions and continuity.", lessons: 12, exercises: 120 },
	{ id: 4, title: "Operations on Functions", description: "Add, subtract, multiply, divide functions and explore their effects.", lessons: 12, exercises: 120 },
	{ id: 5, title: "Composition of Functions", description: "Compose functions and interpret composite models.", lessons: 12, exercises: 120 },
	{ id: 6, title: "Rational Functions", description: "Explore behavior, domains, and features of rational functions.", lessons: 12, exercises: 120 },
	{ id: 7, title: "Graphing Rational Functions", description: "Graph rational functions using asymptotes and key points.", lessons: 12, exercises: 120 },
	{ id: 8, title: "Rational Equations and Inequalities", description: "Solve rational equations and inequalities safely and accurately.", lessons: 12, exercises: 120 },
	{ id: 9, title: "Inverse Functions", description: "Find and verify inverses; understand one-to-one functions.", lessons: 12, exercises: 120 },
	{ id: 10, title: "Exponential Functions", description: "Model growth and decay with exponential functions.", lessons: 12, exercises: 120 },
	{ id: 11, title: "Logarithmic Functions", description: "Work with logs, properties, and exponential-log relationships.", lessons: 12, exercises: 120 },
];

export const getCourseById = (id: number) => courses.find((c) => c.id === id);
