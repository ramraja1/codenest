import { responseBot } from "../utils/chatbot.js";
import Question from "../models/questionModel.js";
import Example from "../models/exampleModle.js";
import TestCase from "../models/testCaseModel.js";
import Challenge from "../models/challengeModel.js"; // ✅ Import

import Quiz from "../models/quizModel.js";
import QuizQuestion from "../models/quizQuestionModel.js"; // Alias for clarity

let dsaHistory = [
  {
    role: "system",
    content: `
      You are a coding assistant who only responds in raw JSON. When the user asks for questions (e.g., "Add 3 array questions"), reply ONLY with a valid JSON array of N objects — no explanations, markdown, or headings — where N is the number requested in the user message.

      Each question must follow this exact schema:
      [
        {
          "title": "String",
          "problemStatement": "String",
          "inputFormat": "String",
          "outputFormat": "String",
          "constraints": ["String"],
          "maxScore": "String",
          "difficulty": "String",
          "tags": ["String"],
          "hints": ["String"],
          "timeLimit": "String",
          "memoryLimit": "String",
          "difficultyScore": Number,
          "sampleSolution": "String",
          "languagesAllowed": ["String"],
          "estimatedSolveTime": "String",
          "boilerplateCode": {
            "cpp": "String",
            "python": "String",
            "javascript": "String",
            "java": "String"
          },
          "examples": [
            {
              "input": "String",
              "output": "String",
              "explanation": "String"
            }
          ],
          "testCases": [
            {
              "input": "String",
              "output": "String",
              "type": "Single-line" | "Multi-line" | "Edge Case",
              "isHidden": Boolean
            }
          ]
        }
      ]

      DO NOT include markdown, explanations, code blocks, or text — only return valid JSON that can be directly saved to MongoDB.
    `,
  },
];

export const handleDSAChat = async (req, res) => {
  try {
    const { message, challengeID } = req.body;

    if (!message) return res.status(400).json({ error: "Message is required" });
    if (!challengeID) return res.status(400).json({ error: "Challenge ID is required" });

    dsaHistory.push({ role: "user", content: message });
    const trimmed = [dsaHistory[0], ...dsaHistory.slice(-2)];
    const botReply = await responseBot(trimmed);
    dsaHistory.push({ role: "assistant", content: botReply });

    let questions;
    try {
      questions = JSON.parse(botReply);
    } catch (err) {
      return res.status(400).json({ error: "Invalid JSON from bot", botReply });
    }

    let savedCount = 0;

    for (const q of questions) {
      const {
        title,
        problemStatement,
        inputFormat,
        outputFormat,
        constraints,
        maxScore,
        difficulty,
        tags,
        hints,
        timeLimit,
        memoryLimit,
        difficultyScore,
        sampleSolution,
        languagesAllowed,
        estimatedSolveTime,
        boilerplateCode,
        examples,
        testCases,
      } = q;

      // Save examples
      let exampleIds = [];
      if (examples && examples.length > 0) {
        for (const ex of examples) {
          const newEx = new Example(ex);
          await newEx.save();
          exampleIds.push(newEx._id);
        }
      }

      // Save the question
      const newQuestion = new Question({
        title,
        problemStatement,
        inputFormat,
        outputFormat,
        constraints,
        maxScore,
        difficulty: difficulty || "Easy",
        tags,
        author: req.admin?._id || null,
        hints,
        timeLimit,
        memoryLimit,
        difficultyScore,
        sampleSolution,
        languagesAllowed,
        estimatedSolveTime,
        boilerplateCode,
        examples: exampleIds,
      });

      await newQuestion.save();

      // ✅ Push to challenge
      await Challenge.findByIdAndUpdate(
        challengeID,
        { $push: { questions: newQuestion._id } },
        { new: true }
      );

      // Save test cases
      if (testCases && testCases.length > 0) {
        for (const t of testCases) {
          const newTest = new TestCase({
            input: t.input,
            output: t.output,
            type: t.type || "Single-line",
            isHidden: t.isHidden || false,
            question: newQuestion._id,
          });
          await newTest.save();
        }
      }

      savedCount++;
    }

    res.json({
      message: `✅ ${savedCount} question${savedCount > 1 ? "s" : ""} saved and linked to the challenge!`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "DSA bot error",
      details: err.message,
    });
  }
};


let mcqHistory = [
  {
    role: "system",
    content: `
      You are a quiz assistant who generates multiple choice questions based on user requests. The user will provide a natural language command, such as "Give me 3 array questions from easy to moderate difficulty," and you should generate that number of questions with the appropriate difficulty and topic as per the request.

      Here’s the structure you should follow for each MCQ:
      [
        {
          "text": "Question text",  // The question prompt
          "options": ["Option A", "Option B", "Option C", "Option D"],  // List of options
          "correctAnswerIndex": 1,  // Index of the correct answer (0-based)
          "marks": 2,  // Marks for the question
          "difficulty": "easy",  // Difficulty level (easy, medium, hard)
          "explanation": "Explanation of the correct answer",  // Explanation for the correct answer
          "tags": ["tag1", "tag2"]  // Tags relevant to the question
        }
      ]

      The user might ask for questions on a specific topic or difficulty level, like:
      - "Give me 3 array questions from easy to moderate difficulty."
      - "Generate 5 questions on sorting algorithms with medium difficulty."
      - "Create 4 hard-level questions on strings."

      You should:
      1. Understand the number of questions the user wants.
      2. Identify the topic (e.g., array, strings, algorithms) or difficulty (e.g., easy, medium, hard).
      3. Ensure that the difficulty is between the range of easy and hard (if specified).
      4. Return the correct number of questions in valid JSON format with all necessary fields.

      Do not include any extra formatting — only valid JSON.
    `,
  },
];

export const handleMCQChat = async (req, res) => {
  try {
    const { message, quizID } = req.body;

    if (!message) return res.status(400).json({ error: "Message is required" });
    if (!quizID) return res.status(400).json({ error: "Quiz ID is required" });

    // Fetch the quiz to validate it exists
    const quiz = await Quiz.findById(quizID);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    // Get bot reply
    mcqHistory.push({ role: "user", content: message });
    const trimmed = [mcqHistory[0], ...mcqHistory.slice(-2)];
    const botReply = await responseBot(trimmed);
    mcqHistory.push({ role: "assistant", content: botReply });

    // Parse bot reply
    let questions;
    try {
      questions = JSON.parse(botReply);
    } catch (err) {
      return res.status(400).json({ error: "Invalid JSON from bot", botReply });
    }

    let savedIds = [];

    for (const q of questions) {
      const newQuestion = new QuizQuestion({
        text: q.text,
        type: "mcq",
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
        marks: q.marks || 1,
        difficulty: q.difficulty || "medium",
        explanation: q.explanation || "",
        tags: q.tags || [],
        createdBy: req.admin?._id, // assumes admin is attached via auth middleware
      });

      await newQuestion.save();
      savedIds.push(newQuestion._id);
    }

    // Push to quiz
    await Quiz.findByIdAndUpdate(
      quizID,
      { $push: { questions: { $each: savedIds } } },
      { new: true }
    );

    res.json({
      message: `✅ ${savedIds.length} MCQ${savedIds.length > 1 ? "s" : ""} added to the quiz successfully.`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "MCQ bot error", details: err.message });
  }
};
