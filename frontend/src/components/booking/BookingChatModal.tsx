import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, CheckCheck, Clock, User, Sparkles, MessageSquare } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Booking } from '../../types';

interface Message {
  id: string;
  sender: 'client' | 'provider';
  text: string;
  timestamp: string;
  isDelivered?: boolean;
}

interface BookingChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  currentRole: 'client' | 'provider';
}

export const BookingChatModal: React.FC<BookingChatModalProps> = ({
  isOpen,
  onClose,
  booking,
  currentRole,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize messages for this booking
  useEffect(() => {
    if (!isOpen) return;

    const savedKey = `chat_booking_${booking.id}`;
    const saved = localStorage.getItem(savedKey);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
        return;
      } catch (e) {
        // fallback
      }
    }

    // Default pre-seeded conversation
    const otherName = currentRole === 'client' ? (booking.provider_name || 'Tutor') : (booking.client_name || 'Student');
    const initial: Message[] = [
      {
        id: '1',
        sender: currentRole === 'client' ? 'provider' : 'client',
        text: `Hi! Thank you for booking this session on "${booking.service_title}". Do you have any specific materials, problem sets, or chapters you'd like to prioritize?`,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDelivered: true,
      },
      {
        id: '2',
        sender: currentRole,
        text: "Yes, I'll have the practice problems and lecture notes ready before our call!",
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDelivered: true,
      }
    ];
    setMessages(initial);
  }, [isOpen, booking.id, currentRole, booking.provider_name, booking.client_name, booking.service_title]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const saveMessages = (updated: Message[]) => {
    setMessages(updated);
    localStorage.setItem(`chat_booking_${booking.id}`, JSON.stringify(updated));
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: currentRole,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isDelivered: true,
    };

    const updated = [...messages, newMsg];
    saveMessages(updated);
    setInputValue('');

    // Simulate smart auto-reply from the other party after 1.5s
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        "Sounds great! Looking forward to reviewing this during our scheduled time.",
        "Got it! I've noted this down and will prepare tailored practice questions for you.",
        "Perfect. See you on our video call link at session start!",
        "Thanks for letting me know. Feel free to send over any PDFs or links whenever you're ready."
      ];
      const replyMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: currentRole === 'client' ? 'provider' : 'client',
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDelivered: true,
      };
      saveMessages([...updated, replyMsg]);
    }, 1400);
  };

  const quickReplies = currentRole === 'client' ? [
    "Looking forward to our session!",
    "Can we focus on past exam questions?",
    "I have uploaded the syllabus.",
    "Will join the call 2 mins early!"
  ] : [
    "Please have your questions ready!",
    "I've prepared custom practice sets.",
    "Looking forward to our session!",
    "Feel free to share any code/repo beforehand."
  ];

  const counterpartName = currentRole === 'client' ? (booking.provider_name || 'Tutor') : (booking.client_name || 'Student');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="-m-6 flex flex-col h-[560px] bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-950/40 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {counterpartName.charAt(0)}
              </div>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {counterpartName}
                </h3>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {currentRole === 'client' ? 'Verified Tutor' : 'Student'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 truncate max-w-[280px]">
                Re: {booking.service_title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-zinc-50/30 dark:bg-zinc-950/20">
          <div className="text-center my-2">
            <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800/60 px-3 py-1 rounded-full">
              End-to-End Encrypted Session Messaging • Booking #{booking.id}
            </span>
          </div>

          {messages.map((msg) => {
            const isMe = msg.sender === currentRole;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm transition-all ${
                    isMe
                      ? 'bg-brand-600 text-white rounded-br-none dark:bg-brand-500'
                      : 'bg-white border border-zinc-200 text-zinc-800 rounded-bl-none dark:bg-zinc-800 dark:border-zinc-700/60 dark:text-zinc-200'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-zinc-400 px-1">
                  <span>{msg.timestamp}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-brand-500" />}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 italic">
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:0.4s]" />
              </div>
              <span>{counterpartName} is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick reply suggestion chips */}
        <div className="px-6 py-2 border-t border-zinc-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Sparkles className="w-3.5 h-3.5 text-brand-500 shrink-0" />
          {quickReplies.map((qr, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(qr)}
              className="text-[11px] font-medium whitespace-nowrap px-2.5 py-1 rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 transition-all dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-brand-950/40 dark:hover:text-brand-300"
            >
              {qr}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              title="Attach homework PDF or notes"
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Send message to ${counterpartName}...`}
              className="flex-1 text-xs sm:text-sm bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-4 py-2.5 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!inputValue.trim()}
              className="rounded-xl px-3 py-2"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </Modal>
  );
};
