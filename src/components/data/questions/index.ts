// Utility functions for backward compatibility and convenience
import type { Topic, Question, GivenQuestion } from './types';

// import other categories...
// Topic 1 Intro to Functions
import { Topic1_Category1 } from './topic1/category1';
import { Topic1_Category2 } from './topic1/category2';
import { Topic1_Category3 } from './topic1/category3';
import { Topic1_Category4 } from './topic1/category4';
// Topic 2 Evaluating Functions
import { Topic2_Category1 } from './topic2/category1';
import { Topic2_Category2 } from './topic2/category2';
import { Topic2_Category3 } from './topic2/category3';
// Topic 3 PieceWise Functions
import { Topic3_Category1 } from './topic3/category1';
import { Topic3_Category2 } from './topic3/category2';
import { Topic3_Category3 } from './topic3/category3';
// Topic 4 Operations on Functions
import { Topic4_Category1 } from './topic4/category1';
import { Topic4_Category2 } from './topic4/category2';
import { Topic4_Category3 } from './topic4/category3';
// Topic 5 Composite Functions
import { Topic5_Category1 } from './topic5/category1';
import { Topic5_Category2 } from './topic5/category2';
import { Topic5_Category3 } from './topic5/category3';

export const defaultTopics: Topic[] = [
  {
    id: 1,
    name: "INTRODUCTION TO FUNCTIONS",
    description: "Learn about functions, notation, domain, and range.",
    level: [
      Topic1_Category1,
      Topic1_Category2,
      Topic1_Category3,
      Topic1_Category4
    ]
  },
  {
    id: 2,
    name: "Evaluating Functions",
    description: "Practice evaluating functions at numeric and algebraic inputs.",
    level:[
        Topic2_Category1,
        Topic2_Category2,
        Topic2_Category3
    ]

  },
  {
    id: 3,
    name: "Piecewise-Defined Functions",
    description: "Understand and analyze piecewise definitions and continuity.",
   
    level: [
        Topic3_Category1,
        Topic3_Category2,
        Topic3_Category3
    ]
  },
  {
    id: 4,
    name: "Operations on Functions",
    description: "Add, subtract, multiply, divide functions and explore their effects.",

    level: [
        Topic4_Category1,
        Topic4_Category2,
        Topic4_Category3
    ]
    },
    {
    id: 5,
    name: "Composition of Functions",
    description: "Compose functions and interpret composite models.",
    level: [
        Topic5_Category1,
        Topic5_Category2,
        Topic5_Category3
    ]
    }
  // ...other topics
];

export const getTopicById = (id: number): Topic | undefined => {
  return defaultTopics.find(topic => topic.id === id);
};

export const getCategoryByIds = (topicId: number, categoryId: number): Question | undefined => {
  const topic = getTopicById(topicId);
  return topic?.level.find(category => category.category_id === categoryId);
};

export const getQuestionByIds = (topicId: number, categoryId: number, questionId: number): GivenQuestion | undefined => {
  const category = getCategoryByIds(topicId, categoryId);
  return category?.given_question.find(question => question.question_id === questionId);
};

// For TugonSense compatibility (maps to Course type from courses.ts)
export type Course = {
  id: number;
  title: string;
  description: string;

};

export const getTopicsAsCourses = (): Course[] => {
  return defaultTopics.map(topic => ({
    id: topic.id,
    title: topic.name,
    description: topic.description,
 
  }));
};

// Legacy exports for backward compatibility
export const courses = getTopicsAsCourses();
export const getCourseById = (id: number): Course | undefined => {
  const topic = getTopicById(id);
  return topic ? {
    id: topic.id,
    title: topic.name,
    description: topic.description
  } : undefined;
};