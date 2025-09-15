import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X, Bot, User, Loader2 } from 'lucide-react'

const SimpleChatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your TRILO AI assistant. I can help you with tasks, productivity tips, and team management. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Simple AI responses based on keywords
  const getAIResponse = async (userMessage) => {
    const lowerMessage = userMessage.toLowerCase()
    
    // Simple keyword-based responses
    if (lowerMessage.includes('task') || lowerMessage.includes('create')) {
      return "To create a task, go to the Tasks page and click 'New Task'. You can set title, description, due date, and assign it to team members."
    }
    
    if (lowerMessage.includes('team') || lowerMessage.includes('invite')) {
      return "To invite someone to your team, go to Teams page, select a team, and use the 'Invite Member' section. You'll see a list of available users."
    }
    
    if (lowerMessage.includes('productivity') || lowerMessage.includes('focus')) {
      return "Try using the Pomodoro Timer! Set 25-minute work sessions with 5-minute breaks. This technique helps maintain focus and prevents burnout."
    }
    
    if (lowerMessage.includes('calendar') || lowerMessage.includes('schedule')) {
      return "The Calendar view shows all your tasks on a visual timeline. You can see due dates, plan your week, and manage your schedule effectively."
    }
    
    if (lowerMessage.includes('notification') || lowerMessage.includes('reminder')) {
      return "Check the Notifications page for all your alerts. You'll see team invitations, task due dates, and can manage your notification preferences."
    }
    
    if (lowerMessage.includes('report') || lowerMessage.includes('analytics')) {
      return "Visit the Reports page to see your productivity insights, task completion rates, and daily progress summaries."
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return "I can help you with: creating tasks, managing teams, using the timer, checking notifications, viewing reports, and productivity tips. Just ask!"
    }
    
    // Default helpful response
    return "I'm here to help you be more productive! You can ask me about tasks, teams, the timer, calendar, notifications, or any TRILO features. What would you like to know?"
  }

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)

    try {
      // Get AI response
      const aiResponse = await getAIResponse(inputText)
      
      const botMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'bot',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error getting AI response:', error)
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble right now. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickQuestions = [
    "How do I create a task?",
    "How to invite team members?",
    "Productivity tips",
    "How to use the timer?",
    "Check notifications"
  ]

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
        title="AI Assistant"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Chat Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <span className="font-semibold">TRILO AI Assistant</span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputText(question)}
                  className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about TRILO..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SimpleChatbot
