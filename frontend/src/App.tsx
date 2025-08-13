import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Upload, Send, FileText, Bot, User, AlertCircle, X, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isRelated?: boolean;
  confidence?: number;
}

interface Session {
  sessionId: string;
  filename: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          text: "👋 Hi there! I'm your AI document assistant. I can help you understand and analyze any document you upload. Just share a PDF, Word document, or text file, and I'll be happy to chat with you about its content!",
          sender: 'bot',
          timestamp: new Date(),
        }
      ]);
    }
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF, Word document, or text file.');
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSession({
        sessionId: response.data.session_id,
        filename: response.data.filename,
      });

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: `📄 Great! I've uploaded "${response.data.filename}" and I'm ready to help you understand it. Feel free to ask me anything about the document - I can summarize, explain, count items, or answer any questions you have!`,
          sender: 'bot',
          timestamp: new Date(),
        }
      ]);

    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !session) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('/chat', {
        message: inputMessage,
        session_id: session.sessionId,
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date(),
        isRelated: response.data.is_related,
        confidence: response.data.confidence,
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const resetSession = () => {
    setSession(null);
    setUploadedFile(null);
    setMessages([
      {
        id: '1',
        text: "👋 Hi there! I'm your AI document assistant. I can help you understand and analyze any document you upload. Just share a PDF, Word document, or text file, and I'll be happy to chat with you about its content!",
        sender: 'bot',
        timestamp: new Date(),
      }
    ]);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">AI Document Chat</h1>
          </div>
          {session && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-300 bg-white/10 px-3 py-1 rounded-full">
                <FileText className="h-4 w-4" />
                <span>{session.filename}</span>
              </div>
              <button
                onClick={resetSession}
                className="text-sm text-red-400 hover:text-red-300 font-medium bg-red-500/10 hover:bg-red-500/20 px-3 py-1 rounded-full transition-colors"
              >
                New Document
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col p-6 space-y-6 overflow-hidden">
   
        {!session && (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 max-w-md w-full text-center">
              <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-3">
                Upload a Document
              </h2>
              <p className="text-gray-300 mb-6">
                Upload a PDF, Word document, or text file to start chatting about its content.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto font-medium transition-all duration-200 transform hover:scale-105"
              >
                {isUploading ? (
                  <>
                    <div className="typing-indicator"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Choose File</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 backdrop-blur-lg border border-red-500/30 rounded-xl p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span className="text-red-200">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex-1 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-white/20 text-white backdrop-blur-sm'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {message.sender === 'bot' && (
                      <div className="p-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                        <Bot className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="text-sm whitespace-pre-line leading-relaxed">{message.text}</div>
                      {message.sender === 'bot' && message.isRelated !== undefined && (
                        <div className="mt-2 text-xs">
                          {message.isRelated ? (
                            <span className="text-green-400 bg-green-500/20 px-2 py-1 rounded-full">✓ Related to document</span>
                          ) : (
                            <span className="text-orange-400 bg-orange-500/20 px-2 py-1 rounded-full">⚠ Not related to document</span>
                          )}
                        </div>
                      )}
                    </div>
                    {message.sender === 'user' && (
                      <div className="p-1 bg-white/20 rounded-full">
                        <User className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-3 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                    <div className="typing-indicator"></div>
                    <span className="text-sm text-gray-300">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            {session && messages.length > 1 && !isLoading && (
              <div className="flex flex-wrap gap-2 justify-start">
                <button
                  onClick={() => setInputMessage("What are the main findings?")}
                  className="text-xs bg-purple-500/20 text-purple-300 px-3 py-2 rounded-full hover:bg-purple-500/30 transition-colors border border-purple-500/30"
                >
                  What are the main findings?
                </button>
                <button
                  onClick={() => setInputMessage("How many recommendations are there?")}
                  className="text-xs bg-green-500/20 text-green-300 px-3 py-2 rounded-full hover:bg-green-500/30 transition-colors border border-green-500/30"
                >
                  Count recommendations
                </button>
                <button
                  onClick={() => setInputMessage("Can you summarize this document?")}
                  className="text-xs bg-pink-500/20 text-pink-300 px-3 py-2 rounded-full hover:bg-pink-500/30 transition-colors border border-pink-500/30"
                >
                  Summarize document
                </button>
                <button
                  onClick={() => setInputMessage("What are the key conclusions?")}
                  className="text-xs bg-orange-500/20 text-orange-300 px-3 py-2 rounded-full hover:bg-orange-500/30 transition-colors border border-orange-500/30"
                >
                  Key conclusions
                </button>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-white/20 p-6">
            <div className="flex space-x-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={session ? "Ask me anything about the document... (e.g., 'What are the main points?', 'Can you explain this section?')" : "Upload a document first to start chatting..."}
                disabled={!session || isLoading}
                className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-white/5 disabled:cursor-not-allowed text-white placeholder-gray-400"
              />
              <button
                onClick={handleSendMessage}
                disabled={!session || !inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 transform hover:scale-105"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 