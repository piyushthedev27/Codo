import { CinemaScript } from '../services/cinemaService';

export interface FeaturedVideo {
    title: string;
    duration: string;
    views: string;
    xp: string;
    tags: string[];
    image: string;
    script: CinemaScript;
}

export const featuredVideos: FeaturedVideo[] = [
    {
        title: 'Closures & Scope Explained',
        duration: '8 min',
        views: '2.3k',
        xp: '+150 XP',
        tags: ['JavaScript', 'Intermediate'],
        image: '/thumbnails/thumbnail_closures.png',
        script: {
            title: "Closures & Scope Explained",
            states: [
                {
                    id: "intro",
                    narration: "Welcome! Today we are diving into JavaScript Closures and Scope. Let's see how nested functions access variables.",
                    codeSnippet: null,
                    duration: 6,
                    next: "state_2",
                    choices: null,
                    blockBuilder: null
                },
                {
                    id: "state_2",
                    narration: "First, look at this simple outer function. It declares a variable called 'secret'.",
                    codeSnippet: "function outer() {\n  let secret = 'Found me!';\n}",
                    duration: 5,
                    next: "state_3",
                    choices: null,
                    blockBuilder: null
                },
                {
                    id: "state_3",
                    narration: "Inside 'outer', we define 'inner'. Notice how 'inner' can magically access 'secret' from the parent scope!",
                    codeSnippet: "function outer() {\n  let secret = 'Found me!';\n  function inner() {\n    console.log(secret);\n  }\n  return inner;\n}",
                    duration: 8,
                    next: "state_interactive",
                    choices: null,
                    blockBuilder: null
                },
                {
                    id: "state_interactive",
                    narration: "Time to test your knowledge. Construct the closure logic by placing the blocks in order.",
                    codeSnippet: "function createCounter() {\n  let count = 0;\n  return function() {\n    // Build the logic below to increment and return count\n  };\n}",
                    duration: 6,
                    next: null,
                    choices: null,
                    blockBuilder: {
                        shuffledBlocks: ["count", "return", "++", ";"],
                        correctSequence: ["return", "++", "count", ";"],
                        successNextState: "state_outro"
                    }
                },
                {
                    id: "state_outro",
                    narration: "Excellent! The inner function remembers the 'count' variable even after 'createCounter' has finished running. That's a closure!",
                    codeSnippet: "const myCounter = createCounter();\nmyCounter(); // 1\nmyCounter(); // 2",
                    duration: 8,
                    next: null,
                    choices: null,
                    blockBuilder: null
                }
            ]
        }
    },
    {
        title: 'How Async/Await Works',
        duration: '12 min',
        views: '4.1k',
        xp: '+200 XP',
        tags: ['JavaScript', 'Advanced'],
        image: '/thumbnails/thumbnail_async.png',
        script: {
            title: "How Async/Await Works",
            states: [
                {
                    id: "intro",
                    narration: "Tired of messy Promise `.then()` chains? Async and Await are here to rescue your JavaScript code.",
                    codeSnippet: null,
                    duration: 6,
                    next: "state_2",
                    choices: null,
                    blockBuilder: null
                },
                {
                    id: "state_2",
                    narration: "By adding the 'async' keyword to a function, it automatically wraps the return value in a Promise.",
                    codeSnippet: "async function getUser() {\n  return { name: 'Alice' };\n}",
                    duration: 6,
                    next: "state_3",
                    choices: null,
                    blockBuilder: null
                },
                {
                    id: "state_3",
                    narration: "Inside that async function, you can use 'await' to pause execution until a Promise resolves, making asynchronous code look synchronous!",
                    codeSnippet: "async function fetchUser() {\n  const response = await fetch('/api/user');\n  const data = await response.json();\n  return data;\n}",
                    duration: 8,
                    next: "state_interactive",
                    choices: null,
                    blockBuilder: null
                },
                {
                    id: "state_interactive",
                    narration: "Let's assemble an await statement. How do you correctly fetch and await data?",
                    codeSnippet: "async function getScore() {\n  // Build the code to fetch the score\n}",
                    duration: 5,
                    next: null,
                    choices: null,
                    blockBuilder: {
                        shuffledBlocks: ["fetch('/score')", "=", "const score", "await"],
                        correctSequence: ["const score", "=", "await", "fetch('/score')"],
                        successNextState: "state_outro"
                    }
                },
                {
                    id: "state_outro",
                    narration: "Spot on! Async/Await makes your code readable while still running non-blocking operations under the hood.",
                    codeSnippet: "async function app() {\n  try {\n    const data = await fetchData();\n  } catch (err) {\n    console.error(err);\n  }\n}",
                    duration: 8,
                    next: null,
                    choices: null,
                    blockBuilder: null
                }
            ]
        }
    },
    {
        title: 'Python List Comprehensions',
        duration: '6 min',
        views: '1.8k',
        xp: '+100 XP',
        tags: ['Python', 'Beginner'],
        image: '/thumbnails/thumbnail_python.png',
        script: {
            title: "Python List Comprehensions",
            states: [
                {
                    id: "intro",
                    narration: "Welcome to Python! Let's learn how to create lists quickly and elegantly using List Comprehensions.",
                    codeSnippet: null,
                    duration: 6,
                    next: "state_2",
                    choices: null,
                    blockBuilder: null
                },
                {
                    id: "state_2",
                    narration: "Normally, you might use a loop and '.append()' to create a new list. This takes multiple lines.",
                    codeSnippet: "squares = []\nfor x in range(5):\n    squares.append(x**2)",
                    duration: 6,
                    next: "state_3",
                    choices: null,
                    blockBuilder: null
                },
                {
                    id: "state_3",
                    narration: "With a list comprehension, you can squash that entire loop into a single, highly readable line!",
                    codeSnippet: "squares = [x**2 for x in range(5)]\n# Result: [0, 1, 4, 9, 16]",
                    duration: 7,
                    next: "state_interactive",
                    choices: null,
                    blockBuilder: null
                },
                {
                    id: "state_interactive",
                    narration: "Assemble the correct syntax to create a list of numbers multiplied by 10.",
                    codeSnippet: "numbers = [1, 2, 3]\n\n# Create [10, 20, 30]",
                    duration: 5,
                    next: null,
                    choices: null,
                    blockBuilder: {
                        shuffledBlocks: ["for n", "[n * 10", "in numbers]"],
                        correctSequence: ["[n * 10", "for n", "in numbers]"],
                        successNextState: "state_outro"
                    }
                },
                {
                    id: "state_outro",
                    narration: "Perfect! List comprehensions are a staple of pythonic code, making your data transformations clean and efficient.",
                    codeSnippet: "evens = [x for x in nums if x % 2 == 0]",
                    duration: 7,
                    next: null,
                    choices: null,
                    blockBuilder: null
                }
            ]
        }
    },
    {
        title: 'React Hooks Deep Dive',
        duration: '15 min',
        views: '5.2k',
        xp: '+250 XP',
        tags: ['React', 'Advanced'],
        image: '/thumbnails/thumbnail_react.png',
        script: {
            title: "React Hooks Deep Dive",
            states: [
                {
                    id: "intro",
                    narration: "Let's dive into React Hooks. We'll explore how useEffect manages side effects and data fetching.",
                    codeSnippet: null,
                    duration: 6,
                    next: "state_2",
                    choices: null,
                    blockBuilder: null
                },
                {
                    id: "state_2",
                    narration: "The useEffect hook takes a function, determining what happens after the component renders.",
                    codeSnippet: "useEffect(() => {\n  document.title = 'Hello World';\n});",
                    duration: 6,
                    next: "state_3",
                    choices: null,
                    blockBuilder: null
                },
                {
                    id: "state_3",
                    narration: "By adding a dependency array as the second argument, you can control exactly when the effect re-runs.",
                    codeSnippet: "useEffect(() => {\n  fetchData(userId);\n}, [userId]); // Only runs when userId changes",
                    duration: 7,
                    next: "state_interactive",
                    choices: null,
                    blockBuilder: null
                },
                {
                    id: "state_interactive",
                    narration: "How do you trigger a useEffect only ONCE when the component mounts? Assemble the code.",
                    codeSnippet: "useEffect(() => {\n  console.log('Mounted!');\n} // Finish this line",
                    duration: 5,
                    next: null,
                    choices: null,
                    blockBuilder: {
                        shuffledBlocks: ["[]", ", ", ");"],
                        correctSequence: [", ", "[]", ");"],
                        successNextState: "state_outro"
                    }
                },
                {
                    id: "state_outro",
                    narration: "Exactly! An empty dependency array tells React to run the effect only on the initial mount. Great job!",
                    codeSnippet: "useEffect(() => {\n  window.addEventListener('scroll', handleScroll);\n  return () => window.removeEventListener('scroll', handleScroll);\n}, []);",
                    duration: 8,
                    next: null,
                    choices: null,
                    blockBuilder: null
                }
            ]
        }
    }
];
