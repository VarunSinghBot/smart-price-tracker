import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";

function Chat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "👋 Hello! I'm your Price Tracker Assistant. Ask me about product prices, deals, or tracking!",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState("ai-assistant");
  const [chatCount, setChatCount] = useState(5);

  // Mock chat list
  const chats = [
    {
      id: "ai-assistant",
      name: "AI Assistant",
      icon: "🤖",
      lastMessage: "I'm here to help!",
      unread: 0,
      online: true
    },
    {
      id: "deals-group",
      name: "Best Deals",
      icon: "💰",
      lastMessage: "New deals available!",
      unread: 3,
      online: false
    },
    {
      id: "electronics-group",
      name: "Electronics Chat",
      icon: "📱",
      lastMessage: "iPhone prices dropped",
      unread: 1,
      online: false
    },
    {
      id: "fashion-group",
      name: "Fashion Alerts",
      icon: "👗",
      lastMessage: "Sale starting soon",
      unread: 0,
      online: false
    },
    {
      id: "support",
      name: "Customer Support",
      icon: "💬",
      lastMessage: "How can we help?",
      unread: 0,
      online: true
    }
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: "user",
      text: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate bot response
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        text: "I'm here to help! This feature is coming soon. Stay tuned! 🚀",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);

    setInputMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    setChatCount(prev => prev + 1);
    const newChatId = `new-chat-${chatCount}`;
    const newChat = {
      id: newChatId,
      name: `New Chat ${chatCount}`,
      icon: "💬",
      lastMessage: "Start a conversation...",
      unread: 0,
      online: true
    };
    chats.push(newChat);
    setSelectedChat(newChatId);
    setMessages([
      {
        id: Date.now(),
        type: "bot",
        text: "👋 Hello! How can I help you today?",
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const currentChat = chats.find(chat => chat.id === selectedChat);

  return (
    <DashboardLayout>
      {/* Main Chat Container with Sidebar */}
      <div className="flex gap-4 h-[calc(100vh-200px)] md:h-[calc(100vh-180px)]">
        {/* Left Sidebar - Chat List */}
        <div className="hidden md:block w-80 bg-white border-4 border-black drop-shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col">
          {/* Sidebar Header */}
          <div className="bg-[#6B9B8E] border-b-4 border-black p-4">
            <h3 className="text-lg font-bold text-black">Chats</h3>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b-2 border-gray-200">
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full px-3 py-2 border-2 border-black text-sm font-medium focus:outline-none focus:border-[#6B9B8E]"
            />
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`w-full p-4 flex items-center gap-3 border-b-2 border-gray-200 hover:bg-[#E8F4F1] transition-colors text-left ${
                  selectedChat === chat.id ? "bg-[#E8DCC4]" : "bg-white"
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-[#F4A460] border-2 border-black flex items-center justify-center text-xl shrink-0">
                    {chat.icon}
                  </div>
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-gray-800 truncate">{chat.name}</h4>
                    {chat.unread > 0 && (
                      <span className="px-2 py-1 bg-[#F4A460] text-white text-xs font-bold border border-black">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>

          {/* New Chat Button */}
          <div className="p-3 border-t-4 border-black">
            <button 
              onClick={handleNewChat}
              className="w-full px-4 py-2 bg-[#F4A460] text-white font-bold border-2 border-black hover:bg-[#E89450] transition-colors drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Chat
            </button>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 bg-white border-4 border-black drop-shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col">
          {/* Chat Header */}
          <div className="bg-[#6B9B8E] border-b-4 border-black p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#F4A460] border-2 border-black flex items-center justify-center text-2xl">
                {currentChat?.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-black">{currentChat?.name}</h3>
                <p className="text-sm text-black">
                  {currentChat?.online ? "Online • Always here to help" : "Offline"}
                </p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#E8DCC4]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] md:max-w-[60%] p-4 border-2 border-black ${
                    message.type === "user"
                      ? "bg-[#F4A460] text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                      : "bg-white text-gray-800 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                  }`}
                >
                  <p className="font-medium">{message.text}</p>
                  <p className={`text-xs mt-2 ${message.type === "user" ? "text-white/80" : "text-gray-500"}`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="border-t-4 border-black p-4 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border-2 border-black font-medium focus:outline-none focus:border-[#6B9B8E]"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 md:px-6 py-3 bg-[#F4A460] text-white font-bold border-2 border-black hover:bg-[#E89450] transition-colors drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Chat;
