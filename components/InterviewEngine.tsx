'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Mic, MicOff, Volume2, VolumeX, Sparkles, Upload } from 'lucide-react';
import FinalReport from './FinalReport';

interface Message {
  role: 'user' | 'interviewer';
  text: string;
}

interface Avatar {
  id: string;
  name: string;
  role: string;
  gender: 'male' | 'female';
  desc: string;
  image: string;
}

const INITIAL_AVATARS: Avatar[] = [
  { id: 'alex', name: 'Alex', role: 'Technical Lead', gender: 'male', desc: 'Strict, deep technical & system design focus.', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
  { id: 'sophia', name: 'Sophia', role: 'HR Manager', gender: 'female', desc: 'Friendly, behavioral & communication focused.', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80' },
  { id: 'david', name: 'David', role: 'Principal Architect', gender: 'male', desc: 'Direct, problem-solving & edge-case master.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
];

export default function InterviewEngine({ topic = "React.js", difficulty = "Intermediate" }) {
  const [avatars, setAvatars] = useState<Avatar[]>(INITIAL_AVATARS);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [hiringReport, setHiringReport] = useState<any>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  useEffect(() => {
    const updateVoices = () => {
      if ('speechSynthesis' in window) {
        setAvailableVoices(window.speechSynthesis.getVoices());
      }
    };
    updateVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const speakText = (text: string, avatarOverride?: Avatar) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const currentAvatar = avatarOverride || selectedAvatar;
    if (!currentAvatar) return;

    const speechUtterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    let voice = null;

    if (currentAvatar.gender === 'female') {
      voice = voices.find(v => {
        const name = v.name.toLowerCase();
        return name.includes('female') || name.includes('zira') || name.includes('aria') || 
               name.includes('samantha') || name.includes('victoria') || name.includes('karen') || 
               name.includes('hazel') || name.includes('heera');
      }) || voices.find(v => v.lang.includes('en'));
      
      speechUtterance.pitch = 1.4;
      speechUtterance.rate = 1.0;
    } else {
      voice = voices.find(v => {
        const name = v.name.toLowerCase();
        return name.includes('male') || name.includes('david') || name.includes('mark') || 
               name.includes('george') || name.includes('brian') || name.includes('ryan');
      }) || voices.find(v => v.lang.includes('en'));

      speechUtterance.pitch = 0.8;
      speechUtterance.rate = 0.95;
    }

    if (voice) {
      speechUtterance.voice = voice;
    }

    speechUtterance.onstart = () => setIsSpeaking(true);
    speechUtterance.onend = () => setIsSpeaking(false);
    speechUtterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(speechUtterance);
  };

  const toggleListening = () => {
    stopSpeech();
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Use Google Chrome.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setInputValue((prev) => (prev ? `${prev} ${speechToText}` : speechToText));
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatars(prev => prev.map(a => a.id === id ? { ...a, image: result } : a));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFieldChange = (id: string, field: 'name' | 'role', value: string) => {
    setAvatars(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const startInterviewWithAvatar = (avatar: Avatar) => {
    setSelectedAvatar(avatar);
    const initialText = `Hello! I am ${avatar.name}, your ${avatar.role}. Today we will test your knowledge on ${topic} at an ${difficulty} level. Let's begin. Could you start by telling me a bit about your experience with ${topic}?`;
    setMessages([{ role: 'interviewer', text: initialText }]);
    speakText(initialText, avatar);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSpeaking) stopSpeech();
    setInputValue(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;
    stopSpeech();

    const newMessages: Message[] = [...messages, { role: 'user', text: inputValue }];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/interview-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          difficulty,
          conversationHistory: newMessages,
        }),
      });

      const data = await response.json();

      if (data.is_interview_complete) {
        setInterviewComplete(true);
        setHiringReport(data.hiring_report);
        const completionText = "Thank you for your time. The interview is now complete. I am generating your final report.";
        setMessages((prev) => [...prev, { role: 'interviewer', text: completionText }]);
        speakText(completionText);
      } else {
        if (data.next_question) {
          setMessages((prev) => [...prev, { role: 'interviewer', text: data.next_question }]);
          speakText(data.next_question);
        }
      }
    } catch (error) {
      console.error("Failed to fetch next step:", error);
    } finally {
      setIsTyping(false);
    }
  };

  if (!selectedAvatar) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-4xl w-full text-center space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 bg-cyan-950/60 border border-cyan-800/50 px-4 py-2 rounded-full text-cyan-400 text-sm font-semibold">
            <Sparkles size={16} /> Choose & Customize Your AI Interviewer
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Select Your Panelist</h1>
          <p className="text-zinc-400">Customize names, roles, and upload folder pictures freely.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mb-8">
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              className="bg-zinc-900 border border-zinc-800 hover:border-cyan-500 rounded-2xl p-6 flex flex-col items-center text-center shadow-xl transition-all"
            >
              <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4 shadow-lg border-2 border-cyan-500/50 group">
                <img src={avatar.image} alt={avatar.name} className="w-full h-full object-cover" />
                <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-xs text-white">
                  <Upload size={16} className="mb-1 text-cyan-400" /> Upload Image
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, avatar.id)} className="hidden" />
                </label>
              </div>

              <div className="w-full mb-2">
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider block text-left mb-1">Bot Name</label>
                <input
                  type="text"
                  value={avatar.name}
                  onChange={(e) => handleFieldChange(avatar.id, 'name', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white text-center font-bold py-1.5 rounded-lg focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="w-full mb-3">
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider block text-left mb-1">Role ({avatar.gender})</label>
                <input
                  type="text"
                  value={avatar.role}
                  onChange={(e) => handleFieldChange(avatar.id, 'role', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-cyan-400 text-center text-xs font-semibold py-1.5 rounded-lg focus:border-cyan-500 outline-none"
                />
              </div>

              <p className="text-zinc-400 text-xs mb-6 flex-1">{avatar.desc}</p>
              
              <button
                onClick={() => startInterviewWithAvatar(avatar)}
                className="w-full bg-zinc-800 hover:bg-cyan-500 hover:text-black font-bold py-3 rounded-xl transition-colors cursor-pointer"
              >
                Start Interview 🚀
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (interviewComplete && hiringReport) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-4">
         <FinalReport report={hiringReport} />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-black text-white">
      <div className="w-1/3 bg-zinc-950 flex flex-col items-center justify-center p-8 border-r border-zinc-900 relative">
        <div className={`relative flex items-center justify-center w-40 h-40 rounded-full overflow-hidden mb-6 shadow-2xl transition-all duration-500 border-4 ${isSpeaking ? 'border-cyan-400 shadow-cyan-500/80 scale-105 animate-pulse' : 'border-zinc-800'}`}>
          <img src={selectedAvatar.image} alt={selectedAvatar.name} className="w-full h-full object-cover" />
          {isSpeaking && (
            <span className="absolute bottom-2 bg-cyan-500 text-black px-2 py-0.5 rounded-full text-xs font-bold animate-bounce flex items-center gap-1">
              <Volume2 size={12} /> Speaking
            </span>
          )}
        </div>
        <h2 className="text-2xl font-bold mb-1">{selectedAvatar.name}</h2>
        <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wider mb-4">{selectedAvatar.role}</p>
        
        <button
          onClick={() => { setIsMuted(!isMuted); if(!isMuted) stopSpeech(); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all mb-4 cursor-pointer ${isMuted ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-zinc-900 text-cyan-400 border border-zinc-800 hover:bg-zinc-800'}`}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          {isMuted ? "Voice Muted (Click to Unmute)" : "Voice Active (Click to Mute)"}
        </button>

        <p className="text-sm text-zinc-400 text-center bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800">
          {isSpeaking ? "Speaking question..." : isTyping ? "Analyzing your response..." : "Listening carefully..."}
        </p>
      </div>

      <div className="w-2/3 flex flex-col bg-black h-full">
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-4 rounded-2xl flex gap-4 ${msg.role === 'user' ? 'bg-cyan-600 text-white rounded-br-sm' : 'bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-sm rounded-bl-sm'}`}>
                {msg.role === 'interviewer' && <Bot className="mt-1 flex-shrink-0 text-cyan-400" size={20} />}
                <p className="leading-relaxed">{msg.text}</p>
                {msg.role === 'user' && <User className="mt-1 flex-shrink-0 text-white" size={20} />}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-zinc-950 border-t border-zinc-900">
          <div className="flex items-center gap-3 bg-zinc-900 rounded-full p-2 pr-4 focus-within:ring-2 focus-within:ring-cyan-500 transition-all border border-zinc-800">
            <button
              onClick={toggleListening}
              type="button"
              className={`p-3 rounded-full transition-all cursor-pointer ${isListening ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/50' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
              title="Speak your answer"
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isListening ? "Listening... Speak now..." : "Type or click mic to speak your answer..."}
              className="flex-1 bg-transparent outline-none px-4 py-2 text-white placeholder-zinc-500"
              disabled={isTyping}
            />

            <button 
              onClick={handleSendMessage}
              disabled={isTyping || !inputValue.trim()}
              className="bg-cyan-500 hover:bg-cyan-400 text-black p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold cursor-pointer"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}