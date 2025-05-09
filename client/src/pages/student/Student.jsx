import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useJoinChallengeMutation } from "../../redux/api/api";
import useMutationToast from "../../hooks/useMutationToast";
import { useNavigate } from "react-router-dom";
import { setChallengeID } from "../../redux/reducers/auth";
import {server} from "../../constants/config"; // adjust path as needed
import axios from "axios"; // Make sure axios is installed

const Student = () => {
  const [key, setKey] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [joinChallenge, joinStatus] = useJoinChallengeMutation();
  const [showBot, setShowBot] = useState(false);
const [chatInput, setChatInput] = useState("");
const [messages, setMessages] = useState([
  { from: "bot", text: "Hi! I'm CodeBot. How can I assist you today?" },
]);


  useMutationToast({
    ...joinStatus,
    successMessage: joinStatus.data?.message || "Challenge joined successfully",
  });

  const handleKeyChange = (e) => setKey(e.target.value);

  const handleSubmitKey = async () => {
    if (!key.trim()) {
      alert("Please enter a valid access key.");
      return;
    }
    try {
      await joinChallenge({ challengeKey: key });
    } catch (error) {
      console.error("Error while joining challenge:", error);
    }
  };

  useEffect(() => {
    if (joinStatus.isSuccess && joinStatus.data?.challengeID) {
      dispatch(setChallengeID(joinStatus.data.challengeID));
      navigate("/challenge-page");
    }
  }, [joinStatus.isSuccess, joinStatus.data, dispatch, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center py-16 px-4 text-white">
      {/* Title Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-yellow-400 drop-shadow-sm">
          Welcome, <span className="text-cyan-400">Student</span>
        </h1>
        <p className="mt-3 text-lg text-gray-300 max-w-2xl mx-auto">
          Participate in contests or quizzes to sharpen your placement skills.
        </p>
      </div>

      {/* Cards Section */}
      <div className="flex flex-wrap justify-center gap-10 w-full max-w-5xl px-4">
        {/* Join Coding Contest Card */}
        <div className="bg-[#1F2937] border border-gray-700 rounded-xl p-8 w-full sm:w-[350px] text-center shadow hover:shadow-lg hover:scale-105 transition duration-300">
          <h3 className="text-2xl font-bold text-yellow-300 mb-4">
            🚀 Join Contest
          </h3>
          <p className="text-gray-300 mb-5 text-sm">
            Enter your contest key to access the challenge.
          </p>
          <input
            type="text"
            value={key}
            onChange={handleKeyChange}
            placeholder="Enter access key"
            className="w-full border border-gray-900 bg-gray-800 text-white placeholder-gray-400 py-2 px-4 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <button
            onClick={handleSubmitKey}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 rounded-md transition duration-200 shadow"
          >
            Join Now
          </button>
        </div>

        {/* Quiz Card */}
        <div className="bg-[#1F2937] border border-gray-700 rounded-xl p-8 w-full sm:w-[350px] text-center shadow hover:shadow-lg hover:scale-105 transition duration-300">
          <h3 className="text-2xl font-bold text-cyan-300 mb-4">
            🧠 Take a Quiz
          </h3>
          <p className="text-gray-300 mb-5 text-sm">
            Test your knowledge with quick and fun quizzes.
          </p>
          <button
            onClick={() => navigate("/user/quiz/dashboard")}
            className="w-full bg-cyan-400 hover:bg-cyan-300 text-black font-bold py-2 rounded-md transition duration-200 shadow"
          >
            Start Quiz
          </button>
        </div>
        {/* Footer Section */}
        <div className="mt-16 w-full border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
          <p>
            Need help? Reach out to us at{" "}
            <a
              href="mailto:ramtiwari7081@gmail.com"
              className="text-yellow-400 hover:underline"
            >
              support@codenest.com
            </a>{" "}
            or ask in the{" "}
            <a
              href="https://wa.me/919696734338"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              student help group
            </a>
            .
          </p>
          <p className="mt-2 opacity-60">
            © 2025 CodeNest Team. All rights reserved.
          </p>
        </div>
      </div>

      {/* Floating Chat Button */}
<div className="fixed bottom-6 right-6 z-50">
  <button
    onClick={() => setShowBot(true)}
    className="bg-cyan-400 hover:bg-cyan-300 text-black font-bold px-4 py-3 rounded-full shadow-lg transition duration-300"
  >
    🤖 Ask CodeBot
  </button>
</div>

{/* Sidebar Chat UI */}
{showBot && (
 <div className="fixed top-30 right-0 h-[80%] sm:h-[70%] w-[70%] sm:w-[350px] bg-[#1F2937] text-white z-50 shadow-xl flex flex-col">
    {/* Header */}
    <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-[#111827]">
      <h2 className="text-lg font-bold text-yellow-300">CodeBot Assistant</h2>
      <button
        onClick={() => setShowBot(false)}
        className="text-gray-400 hover:text-white text-2xl"
      >
        &times;
      </button>
    </div>

    {/* Messages */}
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`w-fit max-w-[80%] px-4 py-2 rounded-xl ${
            msg.from === "bot"
              ? "bg-gray-700 text-white"
              : "bg-cyan-400 text-black self-end ml-auto"
          }`}
        >
          {msg.text}
        </div>
      ))}
    </div>

    {/* Input */}
    <div className="p-4 border-t border-gray-700 bg-[#111827]">
      <form
onSubmit={(e) => {
  e.preventDefault();
  if (!chatInput.trim()) return;

  const newMsg = { from: "user", text: chatInput };
  setMessages((prev) => [...prev, newMsg]);

  // Clear input
  setChatInput("");

  // Send user message to backend
  axios
    .post(`${server}/chatbot/chat`, { message: chatInput })
    .then((response) => {
      console.log(response)
      const botMsg = response.data?.reply || "Sorry, no response.";
      setMessages((prev) => [...prev, { from: "bot", text: botMsg }]);
    })
    .catch((error) => {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Error reaching CodeBot backend." },
      ]);
    });
}}
        className="flex gap-2"
      >
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Ask something..."
          className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
        <button
          type="submit"
          className="bg-cyan-400 text-black px-4 py-2 rounded-md hover:bg-cyan-300 font-bold"
        >
          Send
        </button>
      </form>
    </div>
  </div>
)}

    </div>
  );
};

export default Student;
