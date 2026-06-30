import pythonIcon from "../assets/icons/python.svg";
import mountainIcon from "../assets/icons/mountain-chapter.svg";
import swordIcon from "../assets/icons/sword-badge.svg";
import trophyIcon from "../assets/icons/trophy-badge.svg";
import shieldIcon from "../assets/icons/shield-badge.svg";
import sparklesIcon from "../assets/icons/sparkles-badge.svg";

export const TRACKS = [
  {
    name: "Python Fundamentals",
    slug: "python",
    icon: pythonIcon,
    description: "Master Python from the ground up — variables, loops, functions, and beyond.",
    chapters: [
      {
        name: "Input & Output",
        icon: mountainIcon,
        levels: [
          {
            name: "Hello, World!",
            objective: [
              { type: "text", value: "Use " },
              { type: "code", value: "print()" },
              { type: "text", value: " to display the message " },
              { type: "code", value: '"Hello, World!"' },
            ],
            hint: [
              { type: "text", value: "Try: " },
              { type: "code", value: 'print("Hello, World!")' },
            ],
            explanation: [
              { type: "code", value: "print()" },
              { type: "text", value: " is a built-in Python function that outputs text to the console. You pass a string inside parentheses." },
            ],
            startingCode: "",
            solution: 'print("Hello, World!")',
            tests: [{ expected: "Hello, World!\n" }],
            maxLines: 2,
            maxTime: 1,
          },

          {
            name: "Print a Variable",
            objective: [
              { type: "text", value: "Create a variable " },
              { type: "code", value: "x" },
              { type: "text", value: " with value " },
              { type: "code", value: "5" },
              { type: "text", value: ", then print it." },
            ],
            hint: [
              { type: "text", value: "Try: " },
              { type: "code", value: "x = 5\nprint(x)" },
            ],
            explanation: [
              { type: "text", value: "A variable stores data in memory. " },
              { type: "code", value: "x = 5" },
              { type: "text", value: " assigns the integer 5 to x. Then " },
              { type: "code", value: "print(x)" },
              { type: "text", value: " outputs its value." },
            ],
            startingCode: "",
            solution: "x = 5\nprint(x)",
            tests: [{ expected: "5\n" }],
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "Printing Multiple Values",
            objective: [
              { type: "text", value: "Create variables " },
              { type: "code", value: "name" },
              { type: "text", value: " and " },
              { type: "code", value: "age" },
              { type: "text", value: " with values " },
              { type: "code", value: '"Alex"' },
              { type: "text", value: " and " },
              { type: "code", value: "18" },
              { type: "text", value: ", then print both values." },
            ],
            hint: [
              { type: "text", value: "Try: " },
              { type: "code", value: 'name = "Alex"\nage = 18\nprint(name, age)' },
            ],
            explanation: [
              { type: "text", value: "You can pass multiple arguments into " },
              { type: "code", value: "print()" },
              { type: "text", value: ". Python separates them with spaces." },
            ],
            startingCode: "",
            solution: 'name = "Alex"\nage = 18\nprint(name, age)',
            tests: [{ expected: "Alex 18\n" }],
            maxLines: 4,
            maxTime: 1,
          },

          {
            name: "User Input",
            objective: [
              { type: "text", value: "Use " },
              { type: "code", value: "input()" },
              { type: "text", value: " to ask " },
              { type: "code", value: '"What is your name?"' },
              { type: "text", value: " and store the answer in " },
              { type: "code", value: "name" },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Try: " },
              { type: "code", value: 'name = input("What is your name?")' },
            ],
            explanation: [
              { type: "code", value: "input()" },
              { type: "text", value: " displays a prompt and waits for the user to type something. The result is returned as text." },
            ],
            startingCode: "",
            solution: 'name = input("What is your name?")',
            maxLines: 2,
            maxTime: 1,
          },

          {
            name: "Echo Machine",
            objective: [
              { type: "text", value: "Read a value using " },
              { type: "code", value: "input()" },
              { type: "text", value: " and print it back to the user." },
            ],
            hint: [
              { type: "text", value: "Try: " },
              { type: "code", value: "text = input()\nprint(text)" },
            ],
            explanation: [
              { type: "text", value: "Data entered by the user can be stored in a variable and displayed later." },
            ],
            startingCode: "",
            solution: "text = input()\nprint(text)",
            tests: [
              {
                input: "Python",
                expected: "Python\n",
              },
            ],
            maxLines: 2,
            maxTime: 1,
          },

          {
            name: "Formatted Output",
            objective: [
              { type: "text", value: "Read an age, store it in " },
              { type: "code", value: "age" },
              { type: "text", value: ", then print " },
              { type: "code", value: 'I am {age} years old' },
              { type: "text", value: " using an f-string." },
            ],
            hint: [
              { type: "text", value: "Try: " },
              { type: "code", value: 'age = int(input())\nprint(f"I am {age} years old")' },
            ],
            explanation: [
              { type: "text", value: "An " },
              { type: "code", value: "f-string" },
              { type: "text", value: " lets you insert variables directly inside text using " },
              { type: "code", value: "{}" },
              { type: "text", value: "." },
            ],
            startingCode: "",
            solution: 'age = int(input())\nprint(f"I am {age} years old")',
            tests: [
              {
                input: "25",
                expected: "I am 25 years old\n",
              },
            ],
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "Meet the Traveler",
            objective: [
              { type: "text", value: "Read a name and age, then print " },
              { type: "code", value: "{name} is {age} years old" },
              { type: "text", value: " using an f-string." },
            ],
            hint: [
              { type: "text", value: "Try: " },
              { type: "code", value: 'name = input()\nage = int(input())\nprint(f"{name} is {age} years old")' },
            ],
            explanation: [
              { type: "text", value: "f-strings can include multiple variables inside the same message." },
            ],
            startingCode: "",
            solution: 'name = input()\nage = int(input())\nprint(f"{name} is {age} years old")',
            tests: [
              {
                input: "Alex\n18",
                expected: "Alex is 18 years old\n",
              },
            ],
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "The Adventurer's Passport",
            objective: [
              { type: "text", value: "Read a traveler's name and age, then print:" },
              { type: "code", value: "Welcome, {name}!" },
              { type: "text", value: " and " },
              { type: "code", value: "You are {age} years old." },
            ],
            hint: [
              { type: "text", value: "Use two inputs and two f-strings." },
            ],
            explanation: [
              { type: "text", value: "This challenge combines everything learned in this chapter: " },
              { type: "code", value: "input()" },
              { type: "text", value: ", variables, " },
              { type: "code", value: "int()" },
              { type: "text", value: ", and formatted output." },
            ],
            startingCode: "",
            solution: 'name = input()\nage = int(input())\nprint(f"Welcome, {name}!")\nprint(f"You are {age} years old.")',
            tests: [
              {
                input: "Alice\n20",
                expected: "Welcome, Alice!\nYou are 20 years old.\n",
              },
            ],
            maxLines: 4,
            maxTime: 1,
          },
        ],
      },
      {
        name: "Variables & Data Types",
        icon: shieldIcon,
        levels: [
          {
            name: "String Variable",
            objective: [
              { type: "text", value: "Create a variable " },
              { type: "code", value: "greeting" },
              { type: "text", value: " with value " },
              { type: "code", value: '"Hello"' },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Try: " },
              { type: "code", value: 'greeting = "Hello"' },
            ],
            explanation: [
              { type: "text", value: "A string is a sequence of characters enclosed in quotes. Strings can be stored inside variables." },
            ],
            startingCode: "",
            solution: 'greeting = "Hello"',
            tests: [{ expected: "" }],
            maxLines: 2,
            maxTime: 1,
          },

          {
            name: "Integer & Float",
            objective: [
              { type: "text", value: "Create " },
              { type: "code", value: "count = 10" },
              { type: "text", value: " and " },
              { type: "code", value: "price = 19.99" },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Write both assignments, one per line." },
            ],
            explanation: [
              { type: "text", value: "Integers are whole numbers, while floats contain decimal values." },
            ],
            startingCode: "",
            solution: "count = 10\nprice = 19.99",
            tests: [{ expected: "" }],
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "Boolean Type",
            objective: [
              { type: "text", value: "Create " },
              { type: "code", value: "is_ready" },
              { type: "text", value: " and set it to " },
              { type: "code", value: "True" },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Try: " },
              { type: "code", value: "is_ready = True" },
            ],
            explanation: [
              { type: "text", value: "Booleans represent truth values and can only be " },
              { type: "code", value: "True" },
              { type: "text", value: " or " },
              { type: "code", value: "False" },
              { type: "text", value: "." },
            ],
            startingCode: "",
            solution: "is_ready = True",
            tests: [{ expected: "" }],
            maxLines: 2,
            maxTime: 1,
          },

          {
            name: "Printing Different Types",
            objective: [
              { type: "text", value: "Create " },
              { type: "code", value: 'name = "Alex"' },
              { type: "text", value: ", " },
              { type: "code", value: "age = 18" },
              { type: "text", value: ", and print both variables." },
            ],
            hint: [
              { type: "text", value: "Print both variables using " },
              { type: "code", value: "print()" },
              { type: "text", value: "." },
            ],
            explanation: [
              { type: "text", value: "Variables can store different data types and still be printed together." },
            ],
            startingCode: "",
            solution: 'name = "Alex"\nage = 18\nprint(name, age)',
            tests: [{ expected: "Alex 18\n" }],
            maxLines: 4,
            maxTime: 1,
          },

          {
            name: "Variable Update",
            objective: [
              { type: "text", value: "Create " },
              { type: "code", value: "score = 10" },
              { type: "text", value: ", then change it to " },
              { type: "code", value: "20" },
              { type: "text", value: " and print it." },
            ],
            hint: [
              { type: "text", value: "Assign a new value to the same variable." },
            ],
            explanation: [
              { type: "text", value: "Variables can be reassigned to hold new values." },
            ],
            startingCode: "",
            solution: "score = 10\nscore = 20\nprint(score)",
            tests: [{ expected: "20\n" }],
            maxLines: 4,
            maxTime: 1,
          },

          {
            name: "Type Conversion",
            objective: [
              { type: "text", value: "Read a number, convert it using " },
              { type: "code", value: "int()" },
              { type: "text", value: ", and store it in " },
              { type: "code", value: "age" },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Try: " },
              { type: "code", value: "age = int(input())" },
            ],
            explanation: [
              { type: "code", value: "input()" },
              { type: "text", value: " always returns text. " },
              { type: "code", value: "int()" },
              { type: "text", value: " converts it into an integer." },
            ],
            startingCode: "",
            solution: "age = int(input())",
            tests: [{ input: "25", expected: "" }],
            maxLines: 2,
            maxTime: 1,
          },

          {
            name: "Type Checking",
            objective: [
              { type: "text", value: "Read an integer into " },
              { type: "code", value: "x" },
              { type: "text", value: " using " },
              { type: "code", value: "int(input())" },
              { type: "text", value: ", then print its type using " },
              { type: "code", value: "type()" },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Use " },
              { type: "code", value: "print(type(x))" },
              { type: "text", value: "." },
            ],
            explanation: [
              { type: "code", value: "type()" },
              { type: "text", value: " returns the type of a variable." },
            ],
            startingCode: "x = int(input())\n",
            solution: "print(type(x))",
            tests: [
              {
                input: "5",
                expected: "<class 'int'>\n",
              },
            ],
            maxLines: 2,
            maxTime: 1,
          },

          {
            name: "Character Profile",
            objective: [
              { type: "text", value: "Read a player's name and age, then print " },
              { type: "code", value: "{name} is level {age}" },
              { type: "text", value: " using an f-string." },
            ],
            hint: [
              { type: "text", value: "Read two inputs and use an f-string." },
            ],
            explanation: [
              { type: "text", value: "Variables can store multiple kinds of information and be combined into messages." },
            ],
            startingCode: "",
            solution: 'name = input()\nage = int(input())\nprint(f"{name} is level {age}")',
            tests: [
              {
                input: "Mage\n12",
                expected: "Mage is level 12\n",
              },
            ],
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "Data Collector",
            objective: [
              { type: "text", value: "Read a name, age, and whether a player is ready. Then print all three values." },
            ],
            hint: [
              { type: "text", value: "Use variables and an f-string." },
            ],
            explanation: [
              { type: "text", value: "This challenge combines strings, integers, booleans, variables, conversion, and formatted output." },
            ],
            startingCode: "",
            solution: 'name = input()\nage = int(input())\nready = input()\nprint(f"{name} | {age} | {ready}")',
            tests: [
              {
                input: "Alex\n18\nTrue",
                expected: "Alex | 18 | True\n",
              },
            ],
            maxLines: 4,
            maxTime: 1,
          },
        ]
      },
      {
        name: "Math & Logical Operators",
        icon: swordIcon,
        levels: [
          {
            name: "Basic Arithmetic",
            objective: [
              { type: "text", value: "Create " },
              { type: "code", value: "result = 10 + 5" },
              { type: "text", value: " and print it." },
            ],
            hint: [
              { type: "text", value: "Try: " },
              { type: "code", value: "result = 10 + 5\nprint(result)" },
            ],
            explanation: [
              { type: "text", value: "Python supports arithmetic operators such as " },
              { type: "code", value: "+" },
              { type: "text", value: ", " },
              { type: "code", value: "-" },
              { type: "text", value: ", " },
              { type: "code", value: "*" },
              { type: "text", value: ", and " },
              { type: "code", value: "/" },
              { type: "text", value: "." },
            ],
            startingCode: "",
            solution: "result = 10 + 5\nprint(result)",
            tests: [{ expected: "15\n" }],
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "More Math Operations",
            objective: [
              { type: "text", value: "Create " },
              { type: "code", value: "result = 12 - 4 * 2" },
              { type: "text", value: " and print it." },
            ],
            hint: [
              { type: "text", value: "Store the expression in a variable and print it." },
            ],
            explanation: [
              { type: "text", value: "Python follows mathematical precedence rules when evaluating expressions." },
            ],
            startingCode: "",
            solution: "result = 12 - 4 * 2\nprint(result)",
            tests: [{ expected: "4\n" }],
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "Division & Powers",
            objective: [
              { type: "text", value: "Create " },
              { type: "code", value: "value = 2 ** 3" },
              { type: "text", value: " and print it." },
            ],
            hint: [
              { type: "text", value: "Use the " },
              { type: "code", value: "**" },
              { type: "text", value: " operator." },
            ],
            explanation: [
              { type: "code", value: "**" },
              { type: "text", value: " raises a number to a power." },
            ],
            startingCode: "",
            solution: "value = 2 ** 3\nprint(value)",
            tests: [{ expected: "8\n" }],
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "Modulo Operator",
            objective: [
              { type: "text", value: "Compute " },
              { type: "code", value: "17 % 3" },
              { type: "text", value: " and store it in " },
              { type: "code", value: "remainder" },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Try: " },
              { type: "code", value: "remainder = 17 % 3" },
            ],
            explanation: [
              { type: "text", value: "The " },
              { type: "code", value: "%" },
              { type: "text", value: " operator returns the remainder after division." },
            ],
            startingCode: "",
            solution: "remainder = 17 % 3",
            tests: [{ expected: "" }],
            maxLines: 2,
            maxTime: 1,
          },

          {
            name: "Comparison Operators",
            objective: [
              { type: "text", value: "Check whether " },
              { type: "code", value: "10 > 5" },
              { type: "text", value: " and store the result in " },
              { type: "code", value: "is_greater" },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Try: " },
              { type: "code", value: "is_greater = 10 > 5" },
            ],
            explanation: [
              { type: "text", value: "Comparison operators return either " },
              { type: "code", value: "True" },
              { type: "text", value: " or " },
              { type: "code", value: "False" },
              { type: "text", value: "." },
            ],
            startingCode: "",
            solution: "is_greater = 10 > 5",
            tests: [{ expected: "" }],
            maxLines: 2,
            maxTime: 1,
          },

          {
            name: "Equality Check",
            objective: [
              { type: "text", value: "Store the result of " },
              { type: "code", value: "7 == 7" },
              { type: "text", value: " inside " },
              { type: "code", value: "same" },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Use " },
              { type: "code", value: "==" },
              { type: "text", value: " to compare values." },
            ],
            explanation: [
              { type: "code", value: "==" },
              { type: "text", value: " checks whether two values are equal." },
            ],
            startingCode: "",
            solution: "same = 7 == 7",
            tests: [{ expected: "" }],
            maxLines: 2,
            maxTime: 1,
          },

          {
            name: "Logical Operators",
            objective: [
              { type: "text", value: "Create " },
              { type: "code", value: "result = True and False" },
              { type: "text", value: " and print it." },
            ],
            hint: [
              { type: "text", value: "Try: " },
              { type: "code", value: "result = True and False\nprint(result)" },
            ],
            explanation: [
              { type: "code", value: "and" },
              { type: "text", value: ", " },
              { type: "code", value: "or" },
              { type: "text", value: ", and " },
              { type: "code", value: "not" },
              { type: "text", value: " are used to combine boolean values." },
            ],
            startingCode: "",
            solution: "result = True and False\nprint(result)",
            tests: [{ expected: "False\n" }],
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "Combining Conditions",
            objective: [
              { type: "text", value: "Create " },
              { type: "code", value: "result = (5 > 3) and (8 == 8)" },
              { type: "text", value: " and print it." },
            ],
            hint: [
              { type: "text", value: "Combine comparisons using " },
              { type: "code", value: "and" },
              { type: "text", value: "." },
            ],
            explanation: [
              { type: "text", value: "Logical operators can combine multiple comparison results." },
            ],
            startingCode: "",
            solution: "result = (5 > 3) and (8 == 8)\nprint(result)",
            tests: [{ expected: "True\n" }],
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "Treasure Calculator",
            objective: [
              { type: "text", value: "Read two integers and print their sum, product, and whether the first number is greater than the second." },
            ],
            hint: [
              { type: "text", value: "Use " },
              { type: "code", value: "+" },
              { type: "text", value: ", " },
              { type: "code", value: "*" },
              { type: "text", value: ", and " },
              { type: "code", value: ">" },
              { type: "text", value: "." },
            ],
            explanation: [
              { type: "text", value: "This challenge combines arithmetic operations, comparisons, variables, and formatted output." },
            ],
            startingCode: "",
            solution: 'a = int(input())\nb = int(input())\nprint(a + b)\nprint(a * b)\nprint(a > b)',
            tests: [
              {
                input: "10\n5",
                expected: "15\n50\nTrue\n",
              },
            ],
            maxLines: 5,
            maxTime: 1,
          },
        ]
      },
      {
        name: "Conditionals",
        icon: trophyIcon,
        levels: [
          {
            name: "Simple If",
            objective: [
              { type: "text", value: "Read an integer into " },
              { type: "code", value: "x" },
              { type: "text", value: ". If " },
              { type: "code", value: "x > 0" },
              { type: "text", value: ", print " },
              { type: "code", value: '"Positive"' },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Try:" },
              { type: "code", value: 'x = int(input())\nif x > 0:\n    print("Positive")' },
            ],
            explanation: [
              { type: "text", value: "The " },
              { type: "code", value: "if" },
              { type: "text", value: " statement runs code only when its condition is true." },
            ],
            startingCode: "x = int(input())\n",
            solution: 'if x > 0:\n    print("Positive")',
            tests: [{ input: "5", expected: "Positive\n" }],
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "Checking Equality",
            objective: [
              { type: "text", value: "Read a number into " },
              { type: "code", value: "x" },
              { type: "text", value: ". If " },
              { type: "code", value: "x == 10" },
              { type: "text", value: ", print " },
              { type: "code", value: '"Ten"' },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Use " },
              { type: "code", value: "==" },
              { type: "text", value: " inside an if statement." },
            ],
            explanation: [
              { type: "code", value: "==" },
              { type: "text", value: " checks whether two values are equal." },
            ],
            startingCode: "x = int(input())\n",
            solution: 'if x == 10:\n    print("Ten")',
            tests: [
              { input: "10", expected: "Ten\n" },
              { input: "7", expected: "" },
            ],
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "If-Else",
            objective: [
              { type: "text", value: "Read an age into " },
              { type: "code", value: "age" },
              { type: "text", value: ". If " },
              { type: "code", value: "age >= 18" },
              { type: "text", value: ", print " },
              { type: "code", value: '"Adult"' },
              { type: "text", value: ", otherwise print " },
              { type: "code", value: '"Minor"' },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Use " },
              { type: "code", value: "if" },
              { type: "text", value: " and " },
              { type: "code", value: "else" },
              { type: "text", value: "." },
            ],
            explanation: [
              { type: "code", value: "else" },
              { type: "text", value: " provides an alternative path when the condition is false." },
            ],
            startingCode: "age = int(input())\n",
            solution: 'if age >= 18:\n    print("Adult")\nelse:\n    print("Minor")',
            tests: [
              { input: "20", expected: "Adult\n" },
              { input: "15", expected: "Minor\n" },
            ],
            maxLines: 5,
            maxTime: 1,
          },

          {
            name: "Multiple Conditions",
            objective: [
              { type: "text", value: "Read a number into " },
              { type: "code", value: "x" },
              { type: "text", value: ". If " },
              { type: "code", value: "x > 0 and x < 10" },
              { type: "text", value: ", print " },
              { type: "code", value: '"Small Positive"' },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Combine comparisons using " },
              { type: "code", value: "and" },
              { type: "text", value: "." },
            ],
            explanation: [
              { type: "text", value: "Conditions can be combined using logical operators." },
            ],
            startingCode: "x = int(input())\n",
            solution: 'if x > 0 and x < 10:\n    print("Small Positive")',
            tests: [
              { input: "5", expected: "Small Positive\n" },
              { input: "15", expected: "" },
            ],
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "Elif Chain",
            objective: [
              { type: "text", value: "Read a score into " },
              { type: "code", value: "score" },
              { type: "text", value: ". Print " },
              { type: "code", value: '"A"' },
              { type: "text", value: " if it is at least 90, " },
              { type: "code", value: '"B"' },
              { type: "text", value: " if it is at least 80, otherwise print " },
              { type: "code", value: '"C"' },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Use " },
              { type: "code", value: "if" },
              { type: "text", value: ", " },
              { type: "code", value: "elif" },
              { type: "text", value: ", and " },
              { type: "code", value: "else" },
              { type: "text", value: "." },
            ],
            explanation: [
              { type: "code", value: "elif" },
              { type: "text", value: " allows you to check several conditions in sequence." },
            ],
            startingCode: "score = int(input())\n",
            solution: 'if score >= 90:\n    print("A")\nelif score >= 80:\n    print("B")\nelse:\n    print("C")',
            tests: [
              { input: "95", expected: "A\n" },
              { input: "85", expected: "B\n" },
              { input: "70", expected: "C\n" },
            ],
            maxLines: 6,
            maxTime: 1,
          },

          {
            name: "Pass or Fail",
            objective: [
              { type: "text", value: "Read a score. Print " },
              { type: "code", value: '"Pass"' },
              { type: "text", value: " if it is at least " },
              { type: "code", value: "60" },
              { type: "text", value: ", otherwise print " },
              { type: "code", value: '"Fail"' },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "This is similar to " },
              { type: "code", value: "If-Else" },
              { type: "text", value: "." },
            ],
            explanation: [
              { type: "text", value: "Conditionals are useful for making decisions based on user input." },
            ],
            startingCode: "",
            solution: 'score = int(input())\nif score >= 60:\n    print("Pass")\nelse:\n    print("Fail")',
            tests: [
              { input: "75", expected: "Pass\n" },
              { input: "40", expected: "Fail\n" },
            ],
            maxLines: 5,
            maxTime: 1,
          },

          {
            name: "The Castle Gate",
            objective: [
              { type: "text", value: "A guard allows travelers into the castle." },
              { type: "text", value: " Read an age and print " },
              { type: "code", value: '"Welcome"' },
              { type: "text", value: " if the traveler is at least " },
              { type: "code", value: "18" },
              { type: "text", value: ", otherwise print " },
              { type: "code", value: '"Come Back Later"' },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Use an " },
              { type: "code", value: "if-else" },
              { type: "text", value: " statement." },
            ],
            explanation: [
              { type: "text", value: "This challenge combines input, comparisons, and conditional branching." },
            ],
            startingCode: "",
            solution: 'age = int(input())\nif age >= 18:\n    print("Welcome")\nelse:\n    print("Come Back Later")',
            tests: [
              { input: "20", expected: "Welcome\n" },
              { input: "12", expected: "Come Back Later\n" },
            ],
            maxLines: 5,
            maxTime: 1,
          },
        ]
      },
      {
        name: "Loops",
        icon: sparklesIcon,
        levels: [
          {
            name: "For Loop with Range",
            objective: [
              { type: "text", value: "Use a " },
              { type: "code", value: "for" },
              { type: "text", value: " loop to print numbers " },
              { type: "code", value: "0" },
              { type: "text", value: " through " },
              { type: "code", value: "4" },
              { type: "text", value: " using " },
              { type: "code", value: "range(5)" },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Try:" },
              { type: "code", value: "for i in range(5):\n    print(i)" },
            ],
            explanation: [
              { type: "text", value: "A " },
              { type: "code", value: "for" },
              { type: "text", value: " loop iterates over a sequence. " },
              { type: "code", value: "range(5)" },
              { type: "text", value: " produces numbers from 0 to 4." },
            ],
            startingCode: "",
            solution: "for i in range(5):\n    print(i)",
            tests: [{ expected: "0\n1\n2\n3\n4\n" }],
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "Custom Range",
            objective: [
              { type: "text", value: "Use " },
              { type: "code", value: "range(2, 6)" },
              { type: "text", value: " to print the numbers from " },
              { type: "code", value: "2" },
              { type: "text", value: " to " },
              { type: "code", value: "5" },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Loop over " },
              { type: "code", value: "range(2, 6)" },
              { type: "text", value: "." },
            ],
            explanation: [
              { type: "code", value: "range(start, end)" },
              { type: "text", value: " begins at " },
              { type: "code", value: "start" },
              { type: "text", value: " and stops before " },
              { type: "code", value: "end" },
              { type: "text", value: "." },
            ],
            startingCode: "",
            solution: "for i in range(2, 6):\n    print(i)",
            tests: [{ expected: "2\n3\n4\n5\n" }],
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "Loop Over a List",
            objective: [
              { type: "text", value: "Loop over " },
              { type: "code", value: 'items = ["a", "b", "c"]' },
              { type: "text", value: " and print each item." },
            ],
            hint: [
              { type: "text", value: "Try:" },
              { type: "code", value: "for item in items:\n    print(item)" },
            ],
            explanation: [
              { type: "text", value: "A " },
              { type: "code", value: "for" },
              { type: "text", value: " loop can iterate directly over list elements." },
            ],
            startingCode: 'items = ["a", "b", "c"]\n',
            solution: "for item in items:\n    print(item)",
            tests: [{ expected: "a\nb\nc\n" }],
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "While Loop",
            objective: [
              { type: "text", value: "Use a " },
              { type: "code", value: "while" },
              { type: "text", value: " loop to print numbers " },
              { type: "code", value: "0" },
              { type: "text", value: " to " },
              { type: "code", value: "3" },
              { type: "text", value: ". Start with " },
              { type: "code", value: "i = 0" },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Don't forget to increment " },
              { type: "code", value: "i" },
              { type: "text", value: "." },
            ],
            explanation: [
              { type: "text", value: "A " },
              { type: "code", value: "while" },
              { type: "text", value: " loop continues running while its condition remains true." },
            ],
            startingCode: "i = 0\n",
            solution: "while i <= 3:\n    print(i)\n    i += 1",
            tests: [{ expected: "0\n1\n2\n3\n" }],
            maxLines: 4,
            maxTime: 1,
          },

          {
            name: "Counting Down",
            objective: [
              { type: "text", value: "Use a " },
              { type: "code", value: "while" },
              { type: "text", value: " loop to print numbers from " },
              { type: "code", value: "3" },
              { type: "text", value: " down to " },
              { type: "code", value: "1" },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Start with " },
              { type: "code", value: "i = 3" },
              { type: "text", value: " and decrease it." },
            ],
            explanation: [
              { type: "text", value: "Variables inside a " },
              { type: "code", value: "while" },
              { type: "text", value: " loop can increase or decrease." },
            ],
            startingCode: "i = 3\n",
            solution: "while i >= 1:\n    print(i)\n    i -= 1",
            tests: [{ expected: "3\n2\n1\n" }],
            maxLines: 4,
            maxTime: 1,
          },

          {
            name: "Break Statement",
            objective: [
              { type: "text", value: "Loop through " },
              { type: "code", value: "range(10)" },
              { type: "text", value: " and stop when " },
              { type: "code", value: "i == 5" },
              { type: "text", value: ", printing each value before stopping." },
            ],
            hint: [
              { type: "text", value: "Use " },
              { type: "code", value: "break" },
              { type: "text", value: " inside an " },
              { type: "code", value: "if" },
              { type: "text", value: " statement." },
            ],
            explanation: [
              { type: "code", value: "break" },
              { type: "text", value: " exits a loop immediately." },
            ],
            startingCode: "",
            solution: "for i in range(10):\n    if i == 5:\n        break\n    print(i)",
            tests: [{ expected: "0\n1\n2\n3\n4\n" }],
            maxLines: 5,
            maxTime: 1,
          },

          {
            name: "Continue Statement",
            objective: [
              { type: "text", value: "Loop through " },
              { type: "code", value: "range(5)" },
              { type: "text", value: " and skip printing " },
              { type: "code", value: "2" },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Use " },
              { type: "code", value: "continue" },
              { type: "text", value: " when " },
              { type: "code", value: "i == 2" },
              { type: "text", value: "." },
            ],
            explanation: [
              { type: "code", value: "continue" },
              { type: "text", value: " skips the rest of the current iteration and moves to the next one." },
            ],
            startingCode: "",
            solution: "for i in range(5):\n    if i == 2:\n        continue\n    print(i)",
            tests: [{ expected: "0\n1\n3\n4\n" }],
            maxLines: 5,
            maxTime: 1,
          },

          {
            name: "Training Grounds",
            objective: [
              { type: "text", value: "A warrior trains for " },
              { type: "code", value: "n" },
              { type: "text", value: " days. Read " },
              { type: "code", value: "n" },
              { type: "text", value: " and print the numbers from " },
              { type: "code", value: "1" },
              { type: "text", value: " to " },
              { type: "code", value: "n" },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Use " },
              { type: "code", value: "range()" },
              { type: "text", value: " and a " },
              { type: "code", value: "for" },
              { type: "text", value: " loop." },
            ],
            explanation: [
              { type: "text", value: "This challenge combines input, loops, variables, and counting." },
            ],
            startingCode: "",
            solution: "n = int(input())\nfor i in range(1, n + 1):\n    print(i)",
            tests: [
              {
                input: "4",
                expected: "1\n2\n3\n4\n",
              },
            ],
            maxLines: 3,
            maxTime: 1,
          },
        ]
      },
      {
        name: "Data Structures",
        icon: shieldIcon,
        levels: [
          {
            name: "Create a List",
            objective: [
              { type: "text", value: "Create a list " },
              { type: "code", value: "nums" },
              { type: "text", value: " with values " },
              { type: "code", value: "[1, 2, 3]" },
              { type: "text", value: " and print it." },
            ],
            hint: [
              { type: "text", value: "Try:" },
              { type: "code", value: "nums = [1, 2, 3]\nprint(nums)" },
            ],
            explanation: [
              { type: "text", value: "A list is an ordered collection written using " },
              { type: "code", value: "[]" },
              { type: "text", value: "." },
            ],
            startingCode: "",
            solution: "nums = [1, 2, 3]\nprint(nums)",
            tests: [{ expected: "[1, 2, 3]\n" }],
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "Access List Items",
            objective: [
              { type: "text", value: "Create " },
              { type: "code", value: "nums = [1, 2, 3]" },
              { type: "text", value: " and print the first item." },
            ],
            hint: [
              { type: "text", value: "Lists start at index " },
              { type: "code", value: "0" },
              { type: "text", value: "." },
            ],
            explanation: [
              { type: "text", value: "List elements can be accessed using indexes like " },
              { type: "code", value: "nums[0]" },
              { type: "text", value: "." },
            ],
            startingCode: "nums = [1, 2, 3]\n",
            solution: "print(nums[0])",
            tests: [{ expected: "1\n" }],
            maxLines: 2,
            maxTime: 1,
          },

          {
            name: "List Methods",
            objective: [
              { type: "text", value: "Create " },
              { type: "code", value: 'fruits = ["apple", "banana"]' },
              { type: "text", value: ", append " },
              { type: "code", value: '"cherry"' },
              { type: "text", value: ", then print the list." },
            ],
            hint: [
              { type: "text", value: "Use " },
              { type: "code", value: 'fruits.append("cherry")' },
              { type: "text", value: "." },
            ],
            explanation: [
              { type: "code", value: ".append()" },
              { type: "text", value: " adds an item to the end of a list." },
            ],
            startingCode: 'fruits = ["apple", "banana"]\n',
            solution: 'fruits.append("cherry")\nprint(fruits)',
            tests: [{ expected: "['apple', 'banana', 'cherry']\n" }],
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "List Length",
            objective: [
              { type: "text", value: "Print the number of items in " },
              { type: "code", value: "[1, 2, 3]" },
              { type: "text", value: " using " },
              { type: "code", value: "len()" },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Try " },
              { type: "code", value: "print(len(nums))" },
              { type: "text", value: "." },
            ],
            explanation: [
              { type: "code", value: "len()" },
              { type: "text", value: " returns the number of items in a collection." },
            ],
            startingCode: "nums = [1, 2, 3]\n",
            solution: "print(len(nums))",
            tests: [{ expected: "3\n" }],
            maxLines: 2,
            maxTime: 1,
          },

          {
            name: "Create a Dictionary",
            objective: [
              { type: "text", value: "Create a dictionary " },
              { type: "code", value: "person" },
              { type: "text", value: " with keys " },
              { type: "code", value: '"name"' },
              { type: "text", value: " and " },
              { type: "code", value: '"age"' },
              { type: "text", value: " set to " },
              { type: "code", value: '"Alice"' },
              { type: "text", value: " and " },
              { type: "code", value: "30" },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Try:" },
              { type: "code", value: 'person = {"name": "Alice", "age": 30}' },
            ],
            explanation: [
              { type: "text", value: "Dictionaries store key-value pairs inside " },
              { type: "code", value: "{}" },
              { type: "text", value: "." },
            ],
            startingCode: "",
            solution: 'person = {"name": "Alice", "age": 30}',
            tests: [{ expected: "" }],
            maxLines: 2,
            maxTime: 1,
          },

          {
            name: "Dictionary Access",
            objective: [
              { type: "text", value: "Print the value of key " },
              { type: "code", value: '"name"' },
              { type: "text", value: " from " },
              { type: "code", value: 'person = {"name": "Alice", "age": 30}' },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Use " },
              { type: "code", value: 'person["name"]' },
              { type: "text", value: "." },
            ],
            explanation: [
              { type: "text", value: "Dictionary values are accessed using their keys." },
            ],
            startingCode: 'person = {"name": "Alice", "age": 30}\n',
            solution: 'print(person["name"])',
            tests: [{ expected: "Alice\n" }],
            maxLines: 2,
            maxTime: 1,
          },

          {
            name: "Tuple & Set",
            objective: [
              { type: "text", value: "Create a tuple " },
              { type: "code", value: "coords = (10, 20)" },
              { type: "text", value: " and a set " },
              { type: "code", value: "{1, 2, 3}" },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Write them on separate lines." },
            ],
            explanation: [
              { type: "text", value: "Tuples use " },
              { type: "code", value: "()" },
              { type: "text", value: " and sets use " },
              { type: "code", value: "{}" },
              { type: "text", value: "." },
            ],
            startingCode: "",
            solution: "coords = (10, 20)\nunique = {1, 2, 3}",
            tests: [{ expected: "" }],
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "Unique Values",
            objective: [
              { type: "text", value: "Create a set containing " },
              { type: "code", value: "{1, 1, 2, 2, 3}" },
              { type: "text", value: " and print it." },
            ],
            hint: [
              { type: "text", value: "Sets automatically remove duplicates." },
            ],
            explanation: [
              { type: "text", value: "Sets only keep unique values." },
            ],
            startingCode: "",
            solution: "numbers = {1, 1, 2, 2, 3}\nprint(numbers)",
            tests: [],
            maxLines: 2,
            maxTime: 1,
          },

          {
            name: "Inventory Manager",
            objective: [
              { type: "text", value: "An adventurer has items " },
              { type: "code", value: '["Sword", "Shield", "Potion"]' },
              { type: "text", value: ". Print the first item and the total number of items." },
            ],
            hint: [
              { type: "text", value: "Use indexing and " },
              { type: "code", value: "len()" },
              { type: "text", value: "." },
            ],
            explanation: [
              { type: "text", value: "This challenge combines list creation, indexing, and collection size." },
            ],
            startingCode: 'items = ["Sword", "Shield", "Potion"]\n',
            solution: "print(items[0])\nprint(len(items))",
            tests: [
              {
                expected: "Sword\n3\n",
              },
            ],
            maxLines: 2,
            maxTime: 1,
          },
        ]
      },
      {
        name: "Functions",
        icon: mountainIcon,
        levels: [
          {
            name: "Define a Function",
            objective: [
              { type: "text", value: "Define " },
              { type: "code", value: "def greet():" },
              { type: "text", value: " that prints " },
              { type: "code", value: '"Hello!"' },
              { type: "text", value: ", then call it." },
            ],
            hint: [
              { type: "text", value: "Try:" },
              { type: "code", value: 'def greet():\n    print("Hello!")\ngreet()' },
            ],
            explanation: [
              { type: "code", value: "def" },
              { type: "text", value: " creates a reusable block of code called a function." },
            ],
            startingCode: "",
            solution: 'def greet():\n    print("Hello!")\ngreet()',
            tests: [{ expected: "Hello!\n" }],
            maxLines: 4,
            maxTime: 1,
          },

          {
            name: "Calling Twice",
            objective: [
              { type: "text", value: "Define " },
              { type: "code", value: "greet()" },
              { type: "text", value: " that prints " },
              { type: "code", value: '"Hi"' },
              { type: "text", value: ", then call it two times." },
            ],
            hint: [
              { type: "text", value: "Functions can be called multiple times." },
            ],
            explanation: [
              { type: "text", value: "A function definition is written once but can be executed many times." },
            ],
            startingCode: "",
            solution: 'def greet():\n    print("Hi")\n\ngreet()\ngreet()',
            tests: [{ expected: "Hi\nHi\n" }],
            maxLines: 5,
            maxTime: 1,
          },

          {
            name: "Function with Parameters",
            objective: [
              { type: "text", value: "Define " },
              { type: "code", value: "def square(n):" },
              { type: "text", value: " that prints " },
              { type: "code", value: "n * n" },
              { type: "text", value: ", then call " },
              { type: "code", value: "square(4)" },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Use a parameter named " },
              { type: "code", value: "n" },
              { type: "text", value: "." },
            ],
            explanation: [
              { type: "text", value: "Parameters allow functions to work with different values." },
            ],
            startingCode: "",
            solution: "def square(n):\n    print(n * n)\n\nsquare(4)",
            tests: [{ expected: "16\n" }],
            maxLines: 4,
            maxTime: 1,
          },

          {
            name: "Two Parameters",
            objective: [
              { type: "text", value: "Define " },
              { type: "code", value: "def multiply(a, b):" },
              { type: "text", value: " that prints " },
              { type: "code", value: "a * b" },
              { type: "text", value: ". Call it with " },
              { type: "code", value: "multiply(3, 4)" },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Functions may have multiple parameters." },
            ],
            explanation: [
              { type: "text", value: "Parameters are separated by commas in the function definition." },
            ],
            startingCode: "",
            solution: "def multiply(a, b):\n    print(a * b)\n\nmultiply(3, 4)",
            tests: [{ expected: "12\n" }],
            maxLines: 4,
            maxTime: 1,
          },

          {
            name: "Return Value",
            objective: [
              { type: "text", value: "Define " },
              { type: "code", value: "def add(a, b):" },
              { type: "text", value: " that " },
              { type: "code", value: "return" },
              { type: "text", value: "s the sum. Call it and print the result." },
            ],
            hint: [
              { type: "text", value: "Use " },
              { type: "code", value: "return" },
              { type: "text", value: " instead of " },
              { type: "code", value: "print()" },
              { type: "text", value: " inside the function." },
            ],
            explanation: [
              { type: "code", value: "return" },
              { type: "text", value: " sends a value back to whoever called the function." },
            ],
            startingCode: "",
            solution: "def add(a, b):\n    return a + b\n\nprint(add(3, 7))",
            tests: [{ expected: "10\n" }],
            maxLines: 4,
            maxTime: 1,
          },

          {
            name: "Store Returned Values",
            objective: [
              { type: "text", value: "Define " },
              { type: "code", value: "def double(n):" },
              { type: "text", value: " that returns " },
              { type: "code", value: "n * 2" },
              { type: "text", value: ". Store the result of " },
              { type: "code", value: "double(5)" },
              { type: "text", value: " in " },
              { type: "code", value: "result" },
              { type: "text", value: " and print it." },
            ],
            hint: [
              { type: "text", value: "Returned values can be assigned to variables." },
            ],
            explanation: [
              { type: "text", value: "Functions can provide results that are used later in the program." },
            ],
            startingCode: "",
            solution: "def double(n):\n    return n * 2\n\nresult = double(5)\nprint(result)",
            tests: [{ expected: "10\n" }],
            maxLines: 5,
            maxTime: 1,
          },

          {
            name: "Default Parameters",
            objective: [
              { type: "text", value: "Define " },
              { type: "code", value: "def power(base, exp=2):" },
              { type: "text", value: " that returns " },
              { type: "code", value: "base ** exp" },
              { type: "text", value: ". Call " },
              { type: "code", value: "power(5)" },
              { type: "text", value: " and print the result." },
            ],
            hint: [
              { type: "text", value: "Use a default value for " },
              { type: "code", value: "exp" },
              { type: "text", value: "." },
            ],
            explanation: [
              { type: "text", value: "Default parameters are used when an argument is omitted." },
            ],
            startingCode: "",
            solution: "def power(base, exp=2):\n    return base ** exp\n\nprint(power(5))",
            tests: [{ expected: "25\n" }],
            maxLines: 4,
            maxTime: 1,
          },

          {
            name: "Potion Brewer",
            objective: [
              { type: "text", value: "Create a function " },
              { type: "code", value: "brew(amount)" },
              { type: "text", value: " that returns " },
              { type: "code", value: "amount * 3" },
              { type: "text", value: ". Call it with " },
              { type: "code", value: "4" },
              { type: "text", value: " and print the result." },
            ],
            hint: [
              { type: "text", value: "This challenge combines parameters, return values, and function calls." },
            ],
            explanation: [
              { type: "text", value: "Functions allow complex behavior to be packaged into reusable pieces." },
            ],
            startingCode: "",
            solution: "def brew(amount):\n    return amount * 3\n\nprint(brew(4))",
            tests: [{ expected: "12\n" }],
            maxLines: 4,
            maxTime: 1,
          },
        ]
      },
      {
        name: "Practices",
        icon: trophyIcon,
        levels: [
          {
            name: "Calculator Function",
            objective: [{ type: "text", value: "Define " }, { type: "code", value: "def calculate(a, b, op):" }, { type: "text", value: " that returns " }, { type: "code", value: "a + b" }, { type: "text", value: " if op is " }, { type: "code", value: '"add"' }, { type: "text", value: ", else " }, { type: "code", value: "a - b" }, { type: "text", value: ". Call " }, { type: "code", value: 'calculate(10, 5, "add")' }, { type: "text", value: "." }],
            hint: [{ type: "text", value: 'Use if op == "add": return a + b' }],
            explanation: [{ type: "text", value: "Functions can contain conditional logic. By combining parameters, if/else, and return, you can build flexible utilities." }],
            startingCode: "",
            solution: 'def calculate(a, b, op):\n    if op == "add":\n        return a + b\n    else:\n        return a - b\nprint(calculate(10, 5, "add"))',
            maxLines: 7,
            maxTime: 1,
          },
          {
            name: "List Filter",
            objective: [{ type: "text", value: "Define " }, { type: "code", value: "def get_evens(nums):" }, { type: "text", value: " that returns a list of even numbers from " }, { type: "code", value: "nums" }, { type: "text", value: ". Use " }, { type: "code", value: "[1, 2, 3, 4, 5, 6]" }, { type: "text", value: "." }],
            hint: [{ type: "text", value: "Use a for loop and if n % 2 == 0" }],
            explanation: [{ type: "text", value: "A common pattern is to iterate over a list, test each element with a condition, and collect matching items into a new list." }],
            startingCode: "",
            solution: "def get_evens(nums):\n    result = []\n    for n in nums:\n        if n % 2 == 0:\n            result.append(n)\n    return result\nprint(get_evens([1, 2, 3, 4, 5, 6]))",
            maxLines: 8,
            maxTime: 1,
          },
          {
            name: "Word Counter",
            objective: [{ type: "text", value: "Read a line of text with " }, { type: "code", value: "input()" }, { type: "text", value: ", then count how many times " }, { type: "code", value: '"the"' }, { type: "text", value: " appears using " }, { type: "code", value: ".count()" }, { type: "text", value: ". Print the count." }],
            hint: [{ type: "text", value: 'Use: text.count("the")' }],
            explanation: [{ type: "text", value: "The .count() method returns how many times a substring appears in a string. It's case-sensitive by default." }],
            startingCode: 'text = input()\n',
            solution: 'print(text.count("the"))',
            tests: [{ input: "the cat and the dog", expected: "2\n" }],
            maxLines: 2,
            maxTime: 1,
          },
        ],
      },
      {
        name: "OOP",
        icon: swordIcon,
        levels: [
          {
            name: "Define a Class",
            objective: [
              { type: "text", value: "Define an empty class " },
              { type: "code", value: "Dog" },
              { type: "text", value: " using " },
              { type: "code", value: "class Dog:" },
              { type: "text", value: " and " },
              { type: "code", value: "pass" },
              { type: "text", value: "." }
            ],
            hint: [
              { type: "text", value: "Try:" },
              { type: "code", value: "class Dog:\n    pass" }
            ],
            explanation: [
              { type: "text", value: "A class is a blueprint for creating objects. " },
              { type: "code", value: "class" },
              { type: "text", value: " defines a new type, while " },
              { type: "code", value: "pass" },
              { type: "text", value: " acts as a placeholder." }
            ],
            startingCode: "",
            solution: "class Dog:\n    pass",
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "Create an Object",
            objective: [
              { type: "text", value: "Create an object named " },
              { type: "code", value: "dog" },
              { type: "text", value: " from " },
              { type: "code", value: "Dog" },
              { type: "text", value: "." }
            ],
            hint: [
              { type: "text", value: "Use " },
              { type: "code", value: "Dog()" },
              { type: "text", value: " to create an object." }
            ],
            explanation: [
              { type: "text", value: "Objects are instances of classes." }
            ],
            startingCode: "class Dog:\n    pass\n",
            solution: "dog = Dog()",
            maxLines: 2,
            maxTime: 1,
          },

          {
            name: "Constructor & Attributes",
            objective: [
              { type: "text", value: "Define " },
              { type: "code", value: "class Dog:" },
              { type: "text", value: " with " },
              { type: "code", value: "__init__(self, name):" },
              { type: "text", value: " storing " },
              { type: "code", value: "self.name = name" },
              { type: "text", value: "." }
            ],
            hint: [
              { type: "text", value: "Use " },
              { type: "code", value: "self.name = name" },
              { type: "text", value: " inside the constructor." }
            ],
            explanation: [
              { type: "code", value: "__init__" },
              { type: "text", value: " runs automatically when an object is created." }
            ],
            startingCode: "",
            solution: "class Dog:\n    def __init__(self, name):\n        self.name = name",
            maxLines: 4,
            maxTime: 1,
          },

          {
            name: "Read an Attribute",
            objective: [
              { type: "text", value: "Create " },
              { type: "code", value: 'Dog(\"Rex\")' },
              { type: "text", value: " and print its " },
              { type: "code", value: "name" },
              { type: "text", value: " attribute." }
            ],
            hint: [
              { type: "text", value: "Use " },
              { type: "code", value: "dog.name" },
              { type: "text", value: "." }
            ],
            explanation: [
              { type: "text", value: "Attributes store information inside objects." }
            ],
            startingCode:
      `class Dog:
          def __init__(self, name):
              self.name = name

      `,
            solution:
      `dog = Dog("Rex")
      print(dog.name)`,
            tests: [
              { expected: "Rex\n" }
            ],
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "Class Methods",
            objective: [
              { type: "text", value: "Add method " },
              { type: "code", value: "bark(self)" },
              { type: "text", value: " to " },
              { type: "code", value: "Dog" },
              { type: "text", value: " that prints " },
              { type: "code", value: '"Woof!"' },
              { type: "text", value: ". Create " },
              { type: "code", value: 'Dog("Rex")' },
              { type: "text", value: " and call " },
              { type: "code", value: "bark()" },
              { type: "text", value: "." }
            ],
            hint: [
              { type: "text", value: "Methods belong inside a class." }
            ],
            explanation: [
              { type: "text", value: "Methods are functions defined inside classes." }
            ],
            startingCode: "",
            solution:
      `class Dog:
          def __init__(self, name):
              self.name = name

          def bark(self):
              print("Woof!")

      dog = Dog("Rex")
      dog.bark()`,
            tests: [
              { expected: "Woof!\n" }
            ],
            maxLines: 8,
            maxTime: 1,
          },

          {
            name: "Attribute Methods",
            objective: [
              { type: "text", value: "Modify " },
              { type: "code", value: "bark()" },
              { type: "text", value: " so it prints " },
              { type: "code", value: '"Rex says Woof!"' },
              { type: "text", value: " using " },
              { type: "code", value: "self.name" },
              { type: "text", value: "." }
            ],
            hint: [
              { type: "text", value: "Use an f-string." }
            ],
            explanation: [
              { type: "text", value: "Methods can access instance attributes through " },
              { type: "code", value: "self" },
              { type: "text", value: "." }
            ],
            startingCode: "",
            solution:
      `class Dog:
          def __init__(self, name):
              self.name = name

          def bark(self):
              print(f"{self.name} says Woof!")

      dog = Dog("Rex")
      dog.bark()`,
            tests: [
              { expected: "Rex says Woof!\n" }
            ],
            maxLines: 8,
            maxTime: 1,
          },

          {
            name: "Inheritance",
            objective: [
              { type: "text", value: "Define " },
              { type: "code", value: "class Puppy(Dog):" },
              { type: "text", value: " that inherits from " },
              { type: "code", value: "Dog" },
              { type: "text", value: "." }
            ],
            hint: [
              { type: "text", value: "Subclass syntax uses parentheses." }
            ],
            explanation: [
              { type: "text", value: "Inheritance lets one class reuse another class's behavior." }
            ],
            startingCode: "class Dog:\n    pass\n",
            solution: "class Puppy(Dog):\n    pass",
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "Override a Method",
            objective: [
              { type: "text", value: "Override " },
              { type: "code", value: "bark()" },
              { type: "text", value: " inside " },
              { type: "code", value: "Puppy" },
              { type: "text", value: " so it prints " },
              { type: "code", value: '"Yip!"' },
              { type: "text", value: "." }
            ],
            hint: [
              { type: "text", value: "Create a new method with the same name." }
            ],
            explanation: [
              { type: "text", value: "Child classes can replace inherited behavior." }
            ],
            startingCode:
      `class Dog:
          def bark(self):
              print("Woof!")

      `,
            solution:
      `class Puppy(Dog):
          def bark(self):
              print("Yip!")

      p = Puppy()
      p.bark()`,
            tests: [
              { expected: "Yip!\n" }
            ],
            maxLines: 6,
            maxTime: 1,
          },

          {
            name: "Pet Simulator",
            objective: [
              { type: "text", value: "Create a class " },
              { type: "code", value: "Cat" },
              { type: "text", value: " with attribute " },
              { type: "code", value: "name" },
              { type: "text", value: " and method " },
              { type: "code", value: "speak()" },
              { type: "text", value: " that prints " },
              { type: "code", value: '"Milo says Meow!"' },
              { type: "text", value: "." }
            ],
            hint: [
              { type: "text", value: "Combine constructors, attributes, and methods." }
            ],
            explanation: [
              { type: "text", value: "This challenge reviews all OOP concepts learned in this chapter." }
            ],
            startingCode: "",
            solution:
      `class Cat:
          def __init__(self, name):
              self.name = name

          def speak(self):
              print(f"{self.name} says Meow!")

      cat = Cat("Milo")
      cat.speak()`,
            tests: [
              { expected: "Milo says Meow!\n" }
            ],
            maxLines: 9,
            maxTime: 1,
          },
        ],
      },
      {
        name: "File Handling",
        icon: shieldIcon,
        levels: [
          {
            name: "Write a File",
            objective: [
              { type: "text", value: "Open " },
              { type: "code", value: '"test.txt"' },
              { type: "text", value: " in write mode using " },
              { type: "code", value: "with open(...) as f:" },
              { type: "text", value: " and write " },
              { type: "code", value: '"Hello"' },
              { type: "text", value: "." }
            ],
            hint: [
              { type: "text", value: "Try:" },
              { type: "code", value: 'with open("test.txt", "w") as f:\n    f.write("Hello")' }
            ],
            explanation: [
              { type: "text", value: "The " },
              { type: "code", value: "with" },
              { type: "text", value: " statement automatically closes files. " },
              { type: "code", value: '"w"' },
              { type: "text", value: " mode creates or overwrites a file." }
            ],
            startingCode: "",
            solution: 'with open("test.txt", "w") as f:\n    f.write("Hello")',
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "Read a File",
            objective: [
              { type: "text", value: "Open " },
              { type: "code", value: '"test.txt"' },
              { type: "text", value: " in read mode and print its content using " },
              { type: "code", value: "f.read()" },
              { type: "text", value: "." }
            ],
            hint: [
              { type: "text", value: "Try:" },
              { type: "code", value: 'with open("test.txt", "r") as f:\n    print(f.read())' }
            ],
            explanation: [
              { type: "code", value: '"r"' },
              { type: "text", value: " mode opens a file for reading, and " },
              { type: "code", value: "read()" },
              { type: "text", value: " returns its contents as a string." }
            ],
            startingCode: "",
            solution: 'with open("test.txt", "r") as f:\n    print(f.read())',
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "Append to a File",
            objective: [
              { type: "text", value: "Open " },
              { type: "code", value: '"log.txt"' },
              { type: "text", value: " in append mode and write " },
              { type: "code", value: '"done"' },
              { type: "text", value: "." }
            ],
            hint: [
              { type: "text", value: "Use mode " },
              { type: "code", value: '"a"' },
              { type: "text", value: "." }
            ],
            explanation: [
              { type: "code", value: '"a"' },
              { type: "text", value: " appends content to the end of a file instead of overwriting it." }
            ],
            startingCode: "",
            solution: 'with open("log.txt", "a") as f:\n    f.write("done")',
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "Read Lines",
            objective: [
              { type: "text", value: "Open " },
              { type: "code", value: '"notes.txt"' },
              { type: "text", value: " and print the result of " },
              { type: "code", value: "f.readlines()" },
              { type: "text", value: "." }
            ],
            hint: [
              { type: "text", value: "Try:" },
              { type: "code", value: 'with open("notes.txt") as f:\n    print(f.readlines())' }
            ],
            explanation: [
              { type: "code", value: "readlines()" },
              { type: "text", value: " returns a list containing every line in the file." }
            ],
            startingCode: "",
            solution: 'with open("notes.txt") as f:\n    print(f.readlines())',
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "Count File Lines",
            objective: [
              { type: "text", value: "Open " },
              { type: "code", value: '"notes.txt"' },
              { type: "text", value: " and print how many lines it contains." }
            ],
            hint: [
              { type: "text", value: "Use " },
              { type: "code", value: "len(f.readlines())" },
              { type: "text", value: "." }
            ],
            explanation: [
              { type: "text", value: "Files and lists can work together. " },
              { type: "code", value: "readlines()" },
              { type: "text", value: " returns a list, so " },
              { type: "code", value: "len()" },
              { type: "text", value: " can count its items." }
            ],
            startingCode: "",
            solution: 'with open("notes.txt") as f:\n    print(len(f.readlines()))',
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "Read JSON",
            objective: [
              { type: "text", value: "Import " },
              { type: "code", value: "json" },
              { type: "text", value: ", open " },
              { type: "code", value: '"data.json"' },
              { type: "text", value: " and load it with " },
              { type: "code", value: "json.load(f)" },
              { type: "text", value: ", then print it." }
            ],
            hint: [
              { type: "text", value: "Try:" },
              { type: "code", value: 'import json\nwith open("data.json") as f:\n    print(json.load(f))' }
            ],
            explanation: [
              { type: "code", value: "json.load()" },
              { type: "text", value: " converts JSON data into Python objects such as dictionaries or lists." }
            ],
            startingCode: "",
            solution: 'import json\n\nwith open("data.json") as f:\n    print(json.load(f))',
            maxLines: 4,
            maxTime: 1,
          },

          {
            name: "Save JSON",
            objective: [
              { type: "text", value: "Import " },
              { type: "code", value: "json" },
              { type: "text", value: ", create " },
              { type: "code", value: '{"score": 100}' },
              { type: "text", value: " and save it into " },
              { type: "code", value: '"save.json"' },
              { type: "text", value: " using " },
              { type: "code", value: "json.dump()" },
              { type: "text", value: "." }
            ],
            hint: [
              { type: "text", value: "Use " },
              { type: "code", value: 'json.dump(data, f)' },
              { type: "text", value: "." }
            ],
            explanation: [
              { type: "code", value: "json.dump()" },
              { type: "text", value: " writes Python data structures into a JSON file." }
            ],
            startingCode: "",
            solution:
      'import json\n\ndata = {"score": 100}\n\nwith open("save.json", "w") as f:\n    json.dump(data, f)',
            maxLines: 6,
            maxTime: 1,
          },

          {
            name: "Journal Keeper",
            objective: [
              { type: "text", value: "Open " },
              { type: "code", value: '"journal.txt"' },
              { type: "text", value: " in append mode and write " },
              { type: "code", value: '"Today was great!\\n"' },
              { type: "text", value: " into it." }
            ],
            hint: [
              { type: "text", value: "Combine " },
              { type: "code", value: "with open()" },
              { type: "text", value: " with append mode." }
            ],
            explanation: [
              { type: "text", value: "This challenge reviews opening files, append mode, and writing text." }
            ],
            startingCode: "",
            solution:
      'with open("journal.txt", "a") as f:\n    f.write("Today was great!\\n")',
            maxLines: 3,
            maxTime: 1,
          },
        ],
      },
      {
        name: "Error Handling",
        icon: sparklesIcon,
        levels: [
          {
            name: "Try-Except",
            objective: [
              { type: "text", value: "Wrap " },
              { type: "code", value: 'print(int("abc"))' },
              { type: "text", value: " in " },
              { type: "code", value: "try" },
              { type: "text", value: " and catch " },
              { type: "code", value: "ValueError" },
              { type: "text", value: ", printing " },
              { type: "code", value: '"Error"' },
              { type: "text", value: "." }
            ],
            hint: [
              { type: "text", value: "Try:" },
              { type: "code", value: 'try:\n    print(int("abc"))\nexcept ValueError:\n    print("Error")' }
            ],
            explanation: [
              { type: "code", value: "try" },
              { type: "text", value: " allows code that might fail to execute safely, while " },
              { type: "code", value: "except" },
              { type: "text", value: " handles errors without crashing the program." }
            ],
            startingCode: "",
            solution:
      'try:\n    print(int("abc"))\nexcept ValueError:\n    print("Error")',
            tests: [{ expected: "Error\n" }],
            maxLines: 5,
            maxTime: 1,
          },

          {
            name: "Safe Division",
            objective: [
              { type: "text", value: "Wrap " },
              { type: "code", value: "10 / 0" },
              { type: "text", value: " in a " },
              { type: "code", value: "try" },
              { type: "text", value: " block and catch " },
              { type: "code", value: "ZeroDivisionError" },
              { type: "text", value: ", printing " },
              { type: "code", value: '"Cannot Divide"' },
              { type: "text", value: "." }
            ],
            hint: [
              { type: "text", value: "Catch " },
              { type: "code", value: "ZeroDivisionError" },
              { type: "text", value: "." }
            ],
            explanation: [
              { type: "text", value: "Division by zero raises a " },
              { type: "code", value: "ZeroDivisionError" },
              { type: "text", value: "." }
            ],
            startingCode: "",
            solution:
      'try:\n    print(10 / 0)\nexcept ZeroDivisionError:\n    print("Cannot Divide")',
            tests: [{ expected: "Cannot Divide\n" }],
            maxLines: 5,
            maxTime: 1,
          },

          {
            name: "Multiple Exceptions",
            objective: [
              { type: "text", value: "Catch both " },
              { type: "code", value: "ValueError" },
              { type: "text", value: " and " },
              { type: "code", value: "ZeroDivisionError" },
              { type: "text", value: " around " },
              { type: "code", value: 'int("x") / 0' },
              { type: "text", value: "." }
            ],
            hint: [
              { type: "text", value: "Use two " },
              { type: "code", value: "except" },
              { type: "text", value: " blocks." }
            ],
            explanation: [
              { type: "text", value: "Programs can react differently to different types of errors." }
            ],
            startingCode: "",
            solution:
      'try:\n    result = int("x") / 0\nexcept ValueError:\n    print("ValueError")\nexcept ZeroDivisionError:\n    print("ZeroDivisionError")',
            tests: [{ expected: "ValueError\n" }],
            maxLines: 7,
            maxTime: 1,
          },

          {
            name: "Catch Any Error",
            objective: [
              { type: "text", value: "Use " },
              { type: "code", value: "except Exception:" },
              { type: "text", value: " to catch any error raised by " },
              { type: "code", value: 'int("hello")' },
              { type: "text", value: " and print " },
              { type: "code", value: '"Oops"' },
              { type: "text", value: "." }
            ],
            hint: [
              { type: "text", value: "Use the generic " },
              { type: "code", value: "Exception" },
              { type: "text", value: " class." }
            ],
            explanation: [
              { type: "code", value: "Exception" },
              { type: "text", value: " can catch most runtime errors." }
            ],
            startingCode: "",
            solution:
      'try:\n    int("hello")\nexcept Exception:\n    print("Oops")',
            tests: [{ expected: "Oops\n" }],
            maxLines: 4,
            maxTime: 1,
          },

          {
            name: "Finally Block",
            objective: [
              { type: "text", value: "Add a " },
              { type: "code", value: "finally" },
              { type: "text", value: " block that prints " },
              { type: "code", value: '"Done"' },
              { type: "text", value: " after attempting " },
              { type: "code", value: "10 / 0" },
              { type: "text", value: "." }
            ],
            hint: [
              { type: "text", value: "Remember that " },
              { type: "code", value: "finally" },
              { type: "text", value: " always runs." }
            ],
            explanation: [
              { type: "code", value: "finally" },
              { type: "text", value: " executes whether or not an exception occurs." }
            ],
            startingCode: "",
            solution:
      'try:\n    10 / 0\nexcept ZeroDivisionError:\n    print("Error")\nfinally:\n    print("Done")',
            tests: [{ expected: "Error\nDone\n" }],
            maxLines: 6,
            maxTime: 1,
          },

          {
            name: "Broken Calculator",
            objective: [
              { type: "text", value: "Try converting " },
              { type: "code", value: 'input()' },
              { type: "text", value: " into an integer. If it fails, print " },
              { type: "code", value: '"Invalid Number"' },
              { type: "text", value: "." }
            ],
            hint: [
              { type: "text", value: "Combine " },
              { type: "code", value: "input()" },
              { type: "text", value: " with " },
              { type: "code", value: "try/except" },
              { type: "text", value: "." }
            ],
            explanation: [
              { type: "text", value: "This challenge combines user input, type conversion, and exception handling." }
            ],
            startingCode: "",
            solution:
      'try:\n    x = int(input())\n    print(x)\nexcept ValueError:\n    print("Invalid Number")',
            tests: [
              { input: "42", expected: "42\n" },
              { input: "abc", expected: "Invalid Number\n" }
            ],
            maxLines: 5,
            maxTime: 1,
          },
        ],
      },
      {
        name: "Modules & Packages",
        icon: mountainIcon,
        levels: [
          {
            name: "Import Math",
            objective: [
              { type: "text", value: "Import " },
              { type: "code", value: "math" },
              { type: "text", value: " and print " },
              { type: "code", value: "math.sqrt(16)" },
              { type: "text", value: "." }
            ],
            hint: [
              { type: "text", value: "Try:" },
              { type: "code", value: "import math\nprint(math.sqrt(16))" }
            ],
            explanation: [
              { type: "text", value: "Modules contain reusable code. The " },
              { type: "code", value: "math" },
              { type: "text", value: " module provides mathematical functions and constants." }
            ],
            startingCode: "",
            solution: "import math\nprint(math.sqrt(16))",
            tests: [{ expected: "4.0\n" }],
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "Using Constants",
            objective: [
              { type: "text", value: "Import " },
              { type: "code", value: "math" },
              { type: "text", value: " and print " },
              { type: "code", value: "math.pi" },
              { type: "text", value: "." }
            ],
            hint: [
              { type: "text", value: "Use " },
              { type: "code", value: "math.pi" },
              { type: "text", value: "." }
            ],
            explanation: [
              { type: "text", value: "Modules can provide constants in addition to functions." }
            ],
            startingCode: "",
            solution: "import math\nprint(math.pi)",
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "Import from Module",
            objective: [
              { type: "text", value: "Import only " },
              { type: "code", value: "randint" },
              { type: "text", value: " from " },
              { type: "code", value: "random" },
              { type: "text", value: " and print " },
              { type: "code", value: "randint(1, 10)" },
              { type: "text", value: "." }
            ],
            hint: [
              { type: "text", value: "Try:" },
              { type: "code", value: "from random import randint\nprint(randint(1, 10))" }
            ],
            explanation: [
              { type: "text", value: "Specific functions can be imported directly from a module." }
            ],
            startingCode: "",
            solution: "from random import randint\nprint(randint(1, 10))",
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "Import Multiple Names",
            objective: [
              { type: "text", value: "Import " },
              { type: "code", value: "choice" },
              { type: "text", value: " and " },
              { type: "code", value: "randint" },
              { type: "text", value: " from " },
              { type: "code", value: "random" },
              { type: "text", value: "." }
            ],
            hint: [
              { type: "text", value: "Use a comma between imported names." }
            ],
            explanation: [
              { type: "text", value: "Several functions can be imported in a single statement." }
            ],
            startingCode: "",
            solution:
      "from random import choice, randint",
            maxLines: 2,
            maxTime: 1,
          },

          {
            name: "Alias Import",
            objective: [
              { type: "text", value: "Import " },
              { type: "code", value: "datetime" },
              { type: "text", value: " as " },
              { type: "code", value: "dt" },
              { type: "text", value: " and print " },
              { type: "code", value: "dt.datetime.now()" },
              { type: "text", value: "." }
            ],
            hint: [
              { type: "text", value: "Try:" },
              { type: "code", value: "import datetime as dt\nprint(dt.datetime.now())" }
            ],
            explanation: [
              { type: "text", value: "Aliases shorten long module names." }
            ],
            startingCode: "",
            solution: "import datetime as dt\nprint(dt.datetime.now())",
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "Import Everything",
            objective: [
              { type: "text", value: "Import everything from " },
              { type: "code", value: "math" },
              { type: "text", value: " and print " },
              { type: "code", value: "sqrt(25)" },
              { type: "text", value: "." }
            ],
            hint: [
              { type: "text", value: "Use " },
              { type: "code", value: "from math import *" },
              { type: "text", value: "." }
            ],
            explanation: [
              { type: "text", value: "Wildcard imports bring all public names into the current namespace." }
            ],
            startingCode: "",
            solution:
      "from math import *\nprint(sqrt(25))",
            tests: [{ expected: "5.0\n" }],
            maxLines: 3,
            maxTime: 1,
          },

          {
            name: "Random Adventurer",
            objective: [
              { type: "text", value: "Import " },
              { type: "code", value: "choice" },
              { type: "text", value: " from " },
              { type: "code", value: "random" },
              { type: "text", value: ", create the list " },
              { type: "code", value: '["Warrior", "Mage", "Archer"]' },
              { type: "text", value: " and print a random element from it." }
            ],
            hint: [
              { type: "text", value: "Use " },
              { type: "code", value: "choice(classes)" },
              { type: "text", value: "." }
            ],
            explanation: [
              { type: "text", value: "This challenge combines imports, lists, and function calls." }
            ],
            startingCode: "",
            solution:
      'from random import choice\n\nclasses = ["Warrior", "Mage", "Archer"]\nprint(choice(classes))',
            maxLines: 4,
            maxTime: 1,
          },
        ],
      },
    ],
  },
];

// Auto-generate sequential IDs
TRACKS.forEach((track) => {
  track.id = TRACKS.indexOf(track) + 1;
  track.chapters.forEach((chapter, ci) => {
    chapter.id = ci + 1;
  });
  let levelId = 1;
  track.chapters.forEach((chapter) => {
    chapter.levels.forEach((level) => {
      level.id = levelId++;
    });
  });
});
