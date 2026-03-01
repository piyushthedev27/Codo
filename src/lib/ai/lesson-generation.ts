/**
 * Lesson Generation with OpenAI Integration
 * Generates AI-powered lessons with synthetic peer interactions and voice coaching points
 */

import { openai, withRetry } from './openai-client'
import type { PeerInteraction, VoiceCoachingPoint } from '../../types/database'
import type { AIPeerProfile } from '../../types/database'

export interface LessonGenerationRequest {
  topic: string
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  learningStyle: 'visual' | 'practical' | 'mixed'
  duration: number // in minutes
  userDomain: string
  aiPeers: AIPeerProfile[]
  includeVoiceCoaching: boolean
}

export interface LessonSection {
  id: string
  title: string
  content: string
  codeExamples?: CodeExample[]
  interactiveElements?: InteractiveElement[]
  estimatedDuration: number
}

export interface CodeExample {
  id: string
  language: string
  code: string
  explanation: string
  runnable: boolean
}

export interface InteractiveElement {
  id: string
  type: 'quiz' | 'code_challenge' | 'drag_drop' | 'fill_blank'
  question: string
  options?: string[]
  correctAnswer: string | string[]
  explanation: string
}

export interface GeneratedLesson {
  title: string
  topic: string
  difficulty_level: number
  content: {
    sections: LessonSection[]
    learningObjectives: string[]
    prerequisites: string[]
    summary: string
  }
  peer_interactions: PeerInteraction[]
  voice_coaching_points: VoiceCoachingPoint[]
  estimated_duration: number
  xp_reward: number
}

// Cached lesson content for demo mode
const DEMO_LESSONS: Record<string, GeneratedLesson> = {
  'react-hooks': {
    title: 'React Hooks Fundamentals',
    topic: 'React Hooks',
    difficulty_level: 2,
    content: {
      sections: [
        {
          id: '1',
          title: 'Introduction to React Hooks',
          content: 'React Hooks are functions that let you use state and other React features in functional components. They were introduced in React 16.8 and have revolutionized how we write React applications.',
          codeExamples: [
            {
              id: 'hook-example-1',
              language: 'javascript',
              code: `import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}`,
              explanation: 'This example shows the useState hook in action. It manages local state in a functional component.',
              runnable: true
            }
          ],
          estimatedDuration: 5
        },
        {
          id: '2',
          title: 'useState Hook Deep Dive',
          content: 'The useState hook is the most commonly used hook. It returns an array with two elements: the current state value and a function to update it.',
          codeExamples: [
            {
              id: 'usestate-example',
              language: 'javascript',
              code: `const [state, setState] = useState(initialValue);

// Multiple state variables
const [name, setName] = useState('');
const [age, setAge] = useState(0);
const [isVisible, setIsVisible] = useState(true);`,
              explanation: 'You can use multiple useState hooks in a single component for different pieces of state.',
              runnable: false
            }
          ],
          interactiveElements: [
            {
              id: 'quiz-1',
              type: 'quiz',
              question: 'What does useState return?',
              options: [
                'Just the current state value',
                'Just the setter function',
                'An array with current value and setter function',
                'An object with value and setter'
              ],
              correctAnswer: 'An array with current value and setter function',
              explanation: 'useState returns an array where the first element is the current state value and the second is the setter function.'
            }
          ],
          estimatedDuration: 8
        },
        {
          id: '3',
          title: 'useEffect Hook',
          content: 'The useEffect hook lets you perform side effects in functional components. It serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount combined.',
          codeExamples: [
            {
              id: 'useeffect-example',
              language: 'javascript',
              code: `import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    document.title = \`You clicked \${count} times\`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}`,
              explanation: 'This useEffect runs after every render, updating the document title.',
              runnable: true
            }
          ],
          estimatedDuration: 10
        }
      ],
      learningObjectives: [
        'Understand what React Hooks are and why they were introduced',
        'Learn to use useState for managing component state',
        'Master useEffect for handling side effects',
        'Apply hooks in practical React components'
      ],
      prerequisites: [
        'Basic React knowledge',
        'Understanding of functional components',
        'JavaScript ES6+ syntax'
      ],
      summary: 'React Hooks provide a powerful way to use state and lifecycle features in functional components, making your code more reusable and easier to test.'
    },
    peer_interactions: [
      {
        id: 'peer-1',
        peer_id: 'sarah',
        interaction_type: 'question',
        content: "I'm confused about when to use useState vs useEffect. Can you explain the difference?",
        trigger_point: 1,
        user_response_required: true,
        xp_reward: 50
      },
      {
        id: 'peer-2',
        peer_id: 'alex',
        interaction_type: 'comment',
        content: "Great explanation! I like how you showed the array destructuring with useState.",
        trigger_point: 2,
        user_response_required: false,
        xp_reward: 25
      },
      {
        id: 'peer-3',
        peer_id: 'jordan',
        interaction_type: 'mistake',
        content: "Wait, I think I'm using useEffect wrong. I put it inside a loop and my app is crashing!",
        trigger_point: 3,
        user_response_required: true,
        xp_reward: 75
      }
    ],
    voice_coaching_points: [
      {
        id: 'voice-1',
        trigger_condition: 'user_mentions_class_components',
        voice_prompt: "I notice you mentioned class components. While hooks can't be used in classes, they provide similar functionality in a more concise way. Would you like me to show you how to convert a class component to use hooks?",
        context_data: { topic: 'hooks_vs_classes' },
        response_expected: true
      },
      {
        id: 'voice-2',
        trigger_condition: 'user_struggles_with_useeffect',
        voice_prompt: "UseEffect can be tricky at first. Remember, it runs after every render by default. If you want it to run only once, pass an empty dependency array as the second argument.",
        context_data: { topic: 'useeffect_dependencies' },
        response_expected: false
      }
    ],
    estimated_duration: 23,
    xp_reward: 200
  },
  'javascript-async': {
    title: 'JavaScript Async/Await Mastery',
    topic: 'Async Programming',
    difficulty_level: 3,
    content: {
      sections: [
        {
          id: '1',
          title: 'Understanding Asynchronous JavaScript',
          content: 'JavaScript is single-threaded, but it can handle asynchronous operations through the event loop. Understanding async/await is crucial for modern JavaScript development.',
          codeExamples: [
            {
              id: 'async-example-1',
              language: 'javascript',
              code: `// Promise-based approach
function fetchData() {
  return fetch('/api/data')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));
}

// Async/await approach
async function fetchDataAsync() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}`,
              explanation: 'Async/await makes asynchronous code look and behave more like synchronous code.',
              runnable: false
            }
          ],
          estimatedDuration: 7
        }
      ],
      learningObjectives: [
        'Master async/await syntax',
        'Understand error handling with try/catch',
        'Learn when to use async/await vs Promises'
      ],
      prerequisites: [
        'JavaScript fundamentals',
        'Understanding of Promises',
        'Basic error handling'
      ],
      summary: 'Async/await provides a cleaner way to work with asynchronous JavaScript code.'
    },
    peer_interactions: [
      {
        id: 'peer-async-1',
        peer_id: 'alex',
        interaction_type: 'question',
        content: "Should I always use async/await instead of .then()? When is one better than the other?",
        trigger_point: 1,
        user_response_required: true,
        xp_reward: 60
      }
    ],
    voice_coaching_points: [
      {
        id: 'voice-async-1',
        trigger_condition: 'user_mixes_async_await_with_then',
        voice_prompt: "I see you're mixing async/await with .then(). While this works, it's generally better to stick with one approach for consistency. Async/await is usually more readable.",
        context_data: { topic: 'async_consistency' },
        response_expected: false
      }
    ],
    estimated_duration: 15,
    xp_reward: 150
  },
  'react-hooks-intro': {
    title: 'Introduction to React Hooks',
    topic: 'React Hooks',
    difficulty_level: 2,
    content: {
      sections: [
        {
          id: '1',
          title: 'Introduction to React Hooks',
          content: 'React Hooks are functions that let you use state and other React features in functional components. They were introduced in React 16.8 and have revolutionized how we write React applications.',
          codeExamples: [
            {
              id: 'hook-example-1',
              language: 'javascript',
              code: `import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}`,
              explanation: 'This example shows the useState hook in action. It manages local state in a functional component.',
              runnable: true
            }
          ],
          estimatedDuration: 5
        },
        {
          id: '2',
          title: 'useState Hook Deep Dive',
          content: 'The useState hook is the most commonly used hook. It returns an array with two elements: the current state value and a function to update it.',
          codeExamples: [
            {
              id: 'usestate-example',
              language: 'javascript',
              code: `const [state, setState] = useState(initialValue);

// Multiple state variables
const [name, setName] = useState('');
const [age, setAge] = useState(0);
const [isVisible, setIsVisible] = useState(true);`,
              explanation: 'You can use multiple useState hooks in a single component for different pieces of state.',
              runnable: false
            }
          ],
          interactiveElements: [
            {
              id: 'quiz-1',
              type: 'quiz',
              question: 'What does useState return?',
              options: [
                'Just the current state value',
                'Just the setter function',
                'An array with current value and setter function',
                'An object with value and setter'
              ],
              correctAnswer: 'An array with current value and setter function',
              explanation: 'useState returns an array where the first element is the current state value and the second is the setter function.'
            }
          ],
          estimatedDuration: 8
        },
        {
          id: '3',
          title: 'useEffect Hook',
          content: 'The useEffect hook lets you perform side effects in functional components. It serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount combined.',
          codeExamples: [
            {
              id: 'useeffect-example',
              language: 'javascript',
              code: `import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    document.title = \`You clicked \${count} times\`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}`,
              explanation: 'This useEffect runs after every render, updating the document title.',
              runnable: true
            }
          ],
          estimatedDuration: 10
        }
      ],
      learningObjectives: [
        'Understand what React Hooks are and why they were introduced',
        'Learn to use useState for managing component state',
        'Master useEffect for handling side effects',
        'Apply hooks in practical React components'
      ],
      prerequisites: [
        'Basic React knowledge',
        'Understanding of functional components',
        'JavaScript ES6+ syntax'
      ],
      summary: 'React Hooks provide a powerful way to use state and lifecycle features in functional components, making your code more reusable and easier to test.'
    },
    peer_interactions: [
      {
        id: 'peer-1',
        peer_id: 'sarah',
        interaction_type: 'question',
        content: "I'm confused about when to use useState vs useEffect. Can you explain the difference?",
        trigger_point: 1,
        user_response_required: true,
        xp_reward: 50
      },
      {
        id: 'peer-2',
        peer_id: 'alex',
        interaction_type: 'comment',
        content: "Great explanation! I like how you showed the array destructuring with useState.",
        trigger_point: 2,
        user_response_required: false,
        xp_reward: 25
      }
    ],
    voice_coaching_points: [
      {
        id: 'voice-1',
        trigger_condition: 'user_mentions_class_components',
        voice_prompt: "I notice you mentioned class components. While hooks can't be used in classes, they provide similar functionality in a more concise way. Would you like me to show you how to convert a class component to use hooks?",
        context_data: { topic: 'hooks_vs_classes' },
        response_expected: true
      }
    ],
    estimated_duration: 23,
    xp_reward: 200
  },
  'typescript-basics': {
    title: 'TypeScript Fundamentals',
    topic: 'TypeScript',
    difficulty_level: 1,
    content: {
      sections: [
        {
          id: '1',
          title: 'What is TypeScript?',
          content: 'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. It adds optional static typing, classes, and interfaces to JavaScript, making it easier to build and maintain large-scale applications.',
          codeExamples: [
            {
              id: 'ts-example-1',
              language: 'typescript',
              code: `// JavaScript
function greet(name) {
  return "Hello, " + name;
}

// TypeScript
function greet(name: string): string {
  return "Hello, " + name;
}

greet("World"); // ✓ OK
greet(42); // ✗ Error: Argument of type 'number' is not assignable to parameter of type 'string'`,
              explanation: 'TypeScript adds type annotations to catch errors at compile time rather than runtime.',
              runnable: true
            }
          ],
          estimatedDuration: 6
        },
        {
          id: '2',
          title: 'Basic Types',
          content: 'TypeScript provides several basic types including string, number, boolean, array, tuple, enum, any, void, null, and undefined.',
          codeExamples: [
            {
              id: 'types-example',
              language: 'typescript',
              code: `// Primitive types
let name: string = "Alice";
let age: number = 30;
let isActive: boolean = true;

// Arrays
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ["Alice", "Bob"];

// Tuple
let person: [string, number] = ["Alice", 30];

// Enum
enum Color {
  Red,
  Green,
  Blue
}
let favoriteColor: Color = Color.Blue;`,
              explanation: 'TypeScript offers a rich type system to describe your data structures.',
              runnable: true
            }
          ],
          interactiveElements: [
            {
              id: 'quiz-ts-1',
              type: 'quiz',
              question: 'Which of these is NOT a basic TypeScript type?',
              options: ['string', 'number', 'boolean', 'integer'],
              correctAnswer: 'integer',
              explanation: 'TypeScript uses "number" for all numeric values, there is no separate "integer" type.'
            }
          ],
          estimatedDuration: 10
        },
        {
          id: '3',
          title: 'Interfaces and Type Aliases',
          content: 'Interfaces and type aliases allow you to define custom types and shape of objects in TypeScript.',
          codeExamples: [
            {
              id: 'interface-example',
              language: 'typescript',
              code: `// Interface
interface User {
  id: number;
  name: string;
  email: string;
  isAdmin?: boolean; // Optional property
}

// Type alias
type Point = {
  x: number;
  y: number;
};

// Using the types
const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com"
};

const point: Point = { x: 10, y: 20 };`,
              explanation: 'Interfaces and type aliases help you define reusable type definitions.',
              runnable: true
            }
          ],
          estimatedDuration: 9
        }
      ],
      learningObjectives: [
        'Understand what TypeScript is and its benefits',
        'Learn basic TypeScript types',
        'Create and use interfaces and type aliases',
        'Apply type safety in your code'
      ],
      prerequisites: [
        'JavaScript fundamentals',
        'Basic programming concepts',
        'Understanding of variables and functions'
      ],
      summary: 'TypeScript adds static typing to JavaScript, helping you catch errors early and write more maintainable code.'
    },
    peer_interactions: [
      {
        id: 'peer-ts-1',
        peer_id: 'jordan',
        interaction_type: 'question',
        content: "Why would I use TypeScript instead of just JavaScript? Isn't it extra work?",
        trigger_point: 1,
        user_response_required: true,
        xp_reward: 40
      },
      {
        id: 'peer-ts-2',
        peer_id: 'sarah',
        interaction_type: 'comment',
        content: "I love how TypeScript catches my typos before I even run the code!",
        trigger_point: 2,
        user_response_required: false,
        xp_reward: 20
      }
    ],
    voice_coaching_points: [
      {
        id: 'voice-ts-1',
        trigger_condition: 'user_confused_about_types',
        voice_prompt: "Types might seem confusing at first, but they're like labels that tell TypeScript what kind of data to expect. Think of them as helpful guardrails that prevent mistakes.",
        context_data: { topic: 'type_basics' },
        response_expected: false
      }
    ],
    estimated_duration: 25,
    xp_reward: 120
  },
  'react-state-management': {
    title: 'React State Management',
    topic: 'State Management',
    difficulty_level: 3,
    content: {
      sections: [
        {
          id: '1',
          title: 'Understanding State Management',
          content: 'State management is crucial in React applications. As your app grows, managing state across components becomes challenging. Learn about Context API, Redux, and modern patterns.',
          codeExamples: [
            {
              id: 'context-example',
              language: 'javascript',
              code: `import React, { createContext, useContext, useState } from 'react';

// Create context
const ThemeContext = createContext();

// Provider component
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Consumer component
function ThemedButton() {
  const { theme, setTheme } = useContext(ThemeContext);
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current theme: {theme}
    </button>
  );
}`,
              explanation: 'Context API provides a way to share state across components without prop drilling.',
              runnable: true
            }
          ],
          estimatedDuration: 12
        },
        {
          id: '2',
          title: 'Redux Fundamentals',
          content: 'Redux is a predictable state container for JavaScript apps. It helps you manage global state with a single source of truth.',
          codeExamples: [
            {
              id: 'redux-example',
              language: 'javascript',
              code: `import { createStore } from 'redux';

// Reducer
function counterReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    default:
      return state;
  }
}

// Store
const store = createStore(counterReducer);

// Dispatch actions
store.dispatch({ type: 'INCREMENT' });
console.log(store.getState()); // { count: 1 }`,
              explanation: 'Redux uses actions and reducers to manage state changes predictably.',
              runnable: false
            }
          ],
          estimatedDuration: 15
        }
      ],
      learningObjectives: [
        'Understand different state management approaches',
        'Learn Context API for simple state sharing',
        'Master Redux for complex state management',
        'Choose the right tool for your use case'
      ],
      prerequisites: [
        'React fundamentals',
        'React Hooks knowledge',
        'Component composition understanding'
      ],
      summary: 'Effective state management is key to building scalable React applications. Choose the right tool based on your needs.'
    },
    peer_interactions: [
      {
        id: 'peer-state-1',
        peer_id: 'alex',
        interaction_type: 'question',
        content: "When should I use Context API vs Redux? Redux seems more complicated.",
        trigger_point: 1,
        user_response_required: true,
        xp_reward: 70
      }
    ],
    voice_coaching_points: [
      {
        id: 'voice-state-1',
        trigger_condition: 'user_overuses_redux',
        voice_prompt: "I notice you're considering Redux. For simpler state needs, Context API might be sufficient. Redux is powerful but adds complexity. Consider your app's scale.",
        context_data: { topic: 'state_tool_selection' },
        response_expected: true
      }
    ],
    estimated_duration: 27,
    xp_reward: 250
  },
  'css-grid-flexbox': {
    title: 'CSS Grid & Flexbox Mastery',
    topic: 'CSS Layouts',
    difficulty_level: 1,
    content: {
      sections: [
        {
          id: '1',
          title: 'Introduction to Modern CSS Layouts',
          content: 'CSS Grid and Flexbox are powerful layout systems that make it easy to create responsive, flexible designs without floats or positioning hacks.',
          codeExamples: [
            {
              id: 'flex-example',
              language: 'css',
              code: `.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.item {
  flex: 1;
  padding: 1rem;
}`,
              explanation: 'Flexbox is perfect for one-dimensional layouts (rows or columns).',
              runnable: true
            }
          ],
          estimatedDuration: 7
        },
        {
          id: '2',
          title: 'CSS Grid Fundamentals',
          content: 'CSS Grid is a two-dimensional layout system that excels at creating complex layouts with rows and columns.',
          codeExamples: [
            {
              id: 'grid-example',
              language: 'css',
              code: `.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto;
  gap: 20px;
}

.grid-item {
  background: #f0f0f0;
  padding: 20px;
}

.featured {
  grid-column: span 2;
  grid-row: span 2;
}`,
              explanation: 'Grid allows you to create complex layouts with precise control over rows and columns.',
              runnable: true
            }
          ],
          interactiveElements: [
            {
              id: 'quiz-css-1',
              type: 'quiz',
              question: 'When should you use Flexbox vs Grid?',
              options: [
                'Always use Grid, it\'s newer',
                'Flexbox for 1D layouts, Grid for 2D layouts',
                'Always use Flexbox, it\'s simpler',
                'They\'re interchangeable'
              ],
              correctAnswer: 'Flexbox for 1D layouts, Grid for 2D layouts',
              explanation: 'Flexbox excels at one-dimensional layouts (row or column), while Grid is best for two-dimensional layouts (rows and columns).'
            }
          ],
          estimatedDuration: 10
        }
      ],
      learningObjectives: [
        'Understand when to use Flexbox vs Grid',
        'Master Flexbox properties and alignment',
        'Create complex layouts with CSS Grid',
        'Build responsive designs with modern CSS'
      ],
      prerequisites: [
        'Basic HTML knowledge',
        'CSS fundamentals',
        'Understanding of the box model'
      ],
      summary: 'Modern CSS layout techniques make it easier than ever to create beautiful, responsive designs.'
    },
    peer_interactions: [
      {
        id: 'peer-css-1',
        peer_id: 'sarah',
        interaction_type: 'question',
        content: "I keep getting confused about justify-content vs align-items. Can you help?",
        trigger_point: 1,
        user_response_required: true,
        xp_reward: 45
      }
    ],
    voice_coaching_points: [
      {
        id: 'voice-css-1',
        trigger_condition: 'user_struggles_with_alignment',
        voice_prompt: "Remember: justify-content works along the main axis, align-items works along the cross axis. In a row, main is horizontal. In a column, main is vertical.",
        context_data: { topic: 'flexbox_alignment' },
        response_expected: false
      }
    ],
    estimated_duration: 17,
    xp_reward: 100
  },
  'nodejs-apis': {
    title: 'Building REST APIs with Node.js',
    topic: 'Backend Development',
    difficulty_level: 2,
    content: {
      sections: [
        {
          id: '1',
          title: 'Introduction to REST APIs',
          content: 'REST (Representational State Transfer) is an architectural style for building web services. Learn how to create scalable APIs with Node.js and Express.',
          codeExamples: [
            {
              id: 'express-example',
              language: 'javascript',
              code: `const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// Routes
app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

app.post('/api/users', (req, res) => {
  const user = req.body;
  // Save user to database
  res.status(201).json({ user });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});`,
              explanation: 'Express makes it easy to create RESTful APIs with clean routing.',
              runnable: false
            }
          ],
          estimatedDuration: 10
        },
        {
          id: '2',
          title: 'HTTP Methods and Status Codes',
          content: 'Understanding HTTP methods (GET, POST, PUT, DELETE) and status codes (200, 201, 404, 500) is crucial for building proper REST APIs.',
          codeExamples: [
            {
              id: 'crud-example',
              language: 'javascript',
              code: `// CRUD operations
app.get('/api/posts/:id', (req, res) => {
  // Read - 200 OK
  res.json({ post: {} });
});

app.post('/api/posts', (req, res) => {
  // Create - 201 Created
  res.status(201).json({ post: {} });
});

app.put('/api/posts/:id', (req, res) => {
  // Update - 200 OK
  res.json({ post: {} });
});

app.delete('/api/posts/:id', (req, res) => {
  // Delete - 204 No Content
  res.status(204).send();
});`,
              explanation: 'Each HTTP method has a specific purpose in RESTful design.',
              runnable: false
            }
          ],
          interactiveElements: [
            {
              id: 'quiz-api-1',
              type: 'quiz',
              question: 'Which HTTP method should be used to update a resource?',
              options: ['GET', 'POST', 'PUT', 'DELETE'],
              correctAnswer: 'PUT',
              explanation: 'PUT is used to update existing resources, while POST creates new ones.'
            }
          ],
          estimatedDuration: 12
        },
        {
          id: '3',
          title: 'Error Handling and Validation',
          content: 'Proper error handling and input validation are essential for building robust APIs.',
          codeExamples: [
            {
              id: 'error-handling',
              language: 'javascript',
              code: `// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// Input validation
app.post('/api/users', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required'
    });
  }
  
  // Process request
  res.status(201).json({ user: { email } });
});`,
              explanation: 'Always validate input and handle errors gracefully.',
              runnable: false
            }
          ],
          estimatedDuration: 13
        }
      ],
      learningObjectives: [
        'Understand REST API principles',
        'Build APIs with Express.js',
        'Implement proper error handling',
        'Use HTTP methods and status codes correctly'
      ],
      prerequisites: [
        'JavaScript fundamentals',
        'Basic Node.js knowledge',
        'Understanding of HTTP'
      ],
      summary: 'Building REST APIs with Node.js and Express is a fundamental skill for backend development.'
    },
    peer_interactions: [
      {
        id: 'peer-api-1',
        peer_id: 'jordan',
        interaction_type: 'question',
        content: "What's the difference between PUT and PATCH? When should I use each one?",
        trigger_point: 2,
        user_response_required: true,
        xp_reward: 65
      },
      {
        id: 'peer-api-2',
        peer_id: 'alex',
        interaction_type: 'comment',
        content: "Great explanation of status codes! I always forget which one to use.",
        trigger_point: 2,
        user_response_required: false,
        xp_reward: 30
      }
    ],
    voice_coaching_points: [
      {
        id: 'voice-api-1',
        trigger_condition: 'user_forgets_error_handling',
        voice_prompt: "Don't forget to add error handling! Every API endpoint should handle potential errors gracefully and return appropriate status codes.",
        context_data: { topic: 'error_handling' },
        response_expected: false
      }
    ],
    estimated_duration: 35,
    xp_reward: 300
  }
}

/**
 * Generate a lesson using OpenAI API with fallback to cached content
 */
export async function generateLesson(request: LessonGenerationRequest): Promise<GeneratedLesson> {
  try {
    // Check for cached demo content first
    const demoKey = request.topic.toLowerCase().replace(/\s+/g, '-')
    if (DEMO_LESSONS[demoKey]) {
      console.log(`Using cached lesson for topic: ${request.topic}`)
      return DEMO_LESSONS[demoKey]
    }

    // Generate lesson content with OpenAI
    const lessonContent = await withRetry(async () => {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert programming instructor creating interactive lessons. Generate a comprehensive lesson that includes:
            1. Clear explanations appropriate for ${request.skillLevel} level
            2. Practical code examples
            3. Interactive elements (quizzes, challenges)
            4. Learning objectives and prerequisites
            
            The lesson should be engaging and include opportunities for peer interaction.
            Format the response as a structured JSON object.`
          },
          {
            role: 'user',
            content: `Create a ${request.duration}-minute lesson on "${request.topic}" for ${request.skillLevel} level learners in the ${request.userDomain} domain. Learning style preference: ${request.learningStyle}.`
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })

      return response.choices[0].message.content
    })

    // Generate peer interactions
    const peerInteractions = await generatePeerInteractions(request, lessonContent || '')

    // Generate voice coaching points if requested
    const voiceCoachingPoints = request.includeVoiceCoaching
      ? await generateVoiceCoachingPoints(request, lessonContent || '')
      : []

    // Parse and structure the lesson content
    const lesson = await parseLessonContent(lessonContent || '', request, peerInteractions, voiceCoachingPoints)

    return lesson

  } catch (error) {
    console.error('Error generating lesson:', error)

    // Fallback to a generic lesson structure
    return generateFallbackLesson(request)
  }
}

/**
 * Generate AI peer interactions for the lesson
 */
async function generatePeerInteractions(
  request: LessonGenerationRequest,
  lessonContent: string
): Promise<PeerInteraction[]> {
  try {
    const response = await withRetry(async () => {
      return await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Generate realistic peer interactions for a programming lesson. Create 2-3 interactions where AI peers ask questions, make comments, or need help. Each peer has a distinct personality:
            - Sarah: Curious, asks clarifying questions
            - Alex: Analytical, compares approaches
            - Jordan: Supportive, offers encouragement
            
            Format as JSON array with: peer_id, interaction_type, content, trigger_point, user_response_required, xp_reward`
          },
          {
            role: 'user',
            content: `Create peer interactions for this lesson content: ${lessonContent.substring(0, 500)}...`
          }
        ],
        max_tokens: 800,
        temperature: 0.8
      })
    })

    const content = response.choices[0].message.content
    if (!content) return []

    try {
      const interactions = JSON.parse(content)
      return Array.isArray(interactions) ? interactions : []
    } catch {
      return []
    }

  } catch (error) {
    console.error('Error generating peer interactions:', error)
    return []
  }
}

/**
 * Generate voice coaching points for the lesson
 */
async function generateVoiceCoachingPoints(
  request: LessonGenerationRequest,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _lessonContent: string
): Promise<VoiceCoachingPoint[]> {
  try {
    const response = await withRetry(async () => {
      return await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Generate voice coaching points for a programming lesson. These are contextual prompts that trigger when users show certain behaviors or ask specific questions. Keep responses concise and helpful.
            
            Format as JSON array with: trigger_condition, voice_prompt, context_data, response_expected`
          },
          {
            role: 'user',
            content: `Create 2-3 voice coaching points for: ${request.topic} at ${request.skillLevel} level`
          }
        ],
        max_tokens: 600,
        temperature: 0.7
      })
    })

    const content = response.choices[0].message.content
    if (!content) return []

    try {
      const points = JSON.parse(content)
      return Array.isArray(points) ? points : []
    } catch {
      return []
    }

  } catch (error) {
    console.error('Error generating voice coaching points:', error)
    return []
  }
}

/**
 * Parse lesson content from OpenAI response
 */
async function parseLessonContent(
  content: string,
  request: LessonGenerationRequest,
  peerInteractions: PeerInteraction[],
  voiceCoachingPoints: VoiceCoachingPoint[]
): Promise<GeneratedLesson> {
  try {
    const parsed = JSON.parse(content)

    return {
      title: parsed.title || `${request.topic} Lesson`,
      topic: request.topic,
      difficulty_level: request.skillLevel === 'beginner' ? 1 : request.skillLevel === 'intermediate' ? 2 : 3,
      content: {
        sections: parsed.sections || [],
        learningObjectives: parsed.learningObjectives || [],
        prerequisites: parsed.prerequisites || [],
        summary: parsed.summary || ''
      },
      peer_interactions: peerInteractions,
      voice_coaching_points: voiceCoachingPoints,
      estimated_duration: request.duration,
      xp_reward: Math.floor(request.duration * 10) // 10 XP per minute
    }
  } catch (error) {
    console.error('Error parsing lesson content:', error)
    return generateFallbackLesson(request)
  }
}

/**
 * Generate a fallback lesson when OpenAI fails
 */
function generateFallbackLesson(request: LessonGenerationRequest): GeneratedLesson {
  return {
    title: `${request.topic} - Interactive Lesson`,
    topic: request.topic,
    difficulty_level: request.skillLevel === 'beginner' ? 1 : request.skillLevel === 'intermediate' ? 2 : 3,
    content: {
      sections: [
        {
          id: '1',
          title: `Introduction to ${request.topic}`,
          content: `Welcome to this interactive lesson on ${request.topic}. This lesson is designed for ${request.skillLevel} level learners and will take approximately ${request.duration} minutes to complete.`,
          estimatedDuration: Math.floor(request.duration / 3)
        },
        {
          id: '2',
          title: 'Core Concepts',
          content: `Let's explore the fundamental concepts of ${request.topic}. We'll cover the essential knowledge you need to understand this topic thoroughly.`,
          estimatedDuration: Math.floor(request.duration / 2)
        },
        {
          id: '3',
          title: 'Practice and Application',
          content: `Now let's apply what you've learned about ${request.topic} with some practical examples and exercises.`,
          estimatedDuration: Math.floor(request.duration / 6)
        }
      ],
      learningObjectives: [
        `Understand the basics of ${request.topic}`,
        `Apply ${request.topic} concepts in practical scenarios`,
        `Identify common patterns and best practices`
      ],
      prerequisites: [
        'Basic programming knowledge',
        `Familiarity with ${request.userDomain} concepts`
      ],
      summary: `This lesson provides a comprehensive introduction to ${request.topic} with practical examples and interactive elements.`
    },
    peer_interactions: [
      {
        id: 'fallback-peer-1',
        peer_id: 'sarah',
        interaction_type: 'question',
        content: `I'm excited to learn about ${request.topic}! Can you explain how this relates to what we learned before?`,
        trigger_point: 1,
        user_response_required: true,
        xp_reward: 50
      }
    ],
    voice_coaching_points: request.includeVoiceCoaching ? [
      {
        id: 'fallback-voice-1',
        trigger_condition: 'user_asks_for_help',
        voice_prompt: `I'm here to help you understand ${request.topic}. Feel free to ask me any questions as we go through the lesson.`,
        context_data: { topic: request.topic },
        response_expected: true
      }
    ] : [],
    estimated_duration: request.duration,
    xp_reward: Math.floor(request.duration * 8)
  }
}

/**
 * Get available demo lessons
 */
export function getDemoLessons(): Array<{ key: string; title: string; topic: string; difficulty: number }> {
  return Object.entries(DEMO_LESSONS).map(([key, lesson]) => ({
    key,
    title: lesson.title,
    topic: lesson.topic,
    difficulty: lesson.difficulty_level
  }))
}

/**
 * Get a specific demo lesson by key
 */
export function getDemoLesson(key: string): GeneratedLesson | null {
  return DEMO_LESSONS[key] || null
}