import { useState, useRef, useEffect } from "react";
import { Send, Loader, Sparkles } from "lucide-react";
import axios from "axios";
import { BASE_URL } from "../../utils";

export default function ChatbotWindow({ studentId }) {
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "bot",
      message:
        'Xin chào bạn! Tôi là "Bạn Đồng Hành" 🌟 Mình ở đây để lắng nghe và hỗ trợ bạn. Có gì mình có thể giúp bạn hôm nay không?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === "" || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: "user",
      message: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/chatbot/chat/`, {
        student_id: studentId,
        message: inputValue,
      });

      const botMessage = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        message:
          response.data.reply ||
          "Mình hiểu rồi. Bạn có cần mình giúp gì thêm không?",
        timestamp: new Date(),
        sentiment: response.data.sentiment,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        message: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto h-screen md:h-[650px] flex flex-col bg-white rounded-xl md:shadow-xl overflow-hidden border border-teal-100">
      <div className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white px-4 md:px-6 py-4 md:py-5 shadow-md">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
          <h3 className="text-lg md:text-xl font-bold">Bạn Đồng Hành</h3>
        </div>
        <p className="text-sm text-cyan-100">
          Trợ lý AI hỗ trợ tinh thần và tâm lý học sinh
        </p>
      </div>

      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-b from-white to-cyan-50 space-y-4"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 md:py-4 rounded-xl text-sm md:text-base leading-relaxed font-medium transition-all duration-200 ${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-br-none shadow-md"
                  : "bg-white text-gray-800 border-2 border-teal-200 rounded-bl-none shadow-sm hover:shadow-md"
              }`}
            >
              {msg.message}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 px-4 py-3 rounded-xl border-2 border-teal-200 rounded-bl-none shadow-sm flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin text-teal-600" />
              <span className="text-sm font-medium">
                Bạn Đồng Hành đang soạn tin...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t-2 border-teal-100 p-4 md:p-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn của bạn..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 md:py-4 border-2 border-teal-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 text-sm md:text-base disabled:bg-gray-50 transition-all duration-200 placeholder:text-gray-400"
          />
          <button
            onClick={handleSendMessage}
            disabled={inputValue.trim() === "" || isLoading}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white px-4 md:px-6 py-3 md:py-4 rounded-lg transition-all duration-200 flex items-center justify-center hover:shadow-md shadow-sm"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
