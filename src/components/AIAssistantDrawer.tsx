import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  HelpCircle, 
  Layers, 
  ShieldAlert, 
  Info,
  QrCode
} from 'lucide-react';

interface ChatMsg {
  role: 'assistant' | 'user';
  text: string;
}

export const AIAssistantDrawer: React.FC = () => {
  const { 
    isAiAssistantOpen, 
    setIsAiAssistantOpen, 
    selectedParcel, 
    selectedBuilding, 
    selectedFloor, 
    selectedUnit,
    validationReport,
    proposedUlpins
  } = useApp();

  const proposed = selectedUnit ? proposedUlpins[selectedUnit.id] : null;

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'assistant',
      text: `Hello! I am the VerticalMap 3D Assistant for DoLR. I can answer questions about 3D ULPIN generation, vertical property stratification, Z elevation coordinates, topology validation warnings, and floor segmentation. Ask any question or click a suggestion below.`
    }
  ]);
  const [inputVal, setInputVal] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const suggestedQuestions = [
    "What is this property?",
    "Explain this 3D ULPIN.",
    "How many floors does this building have?",
    "Why did validation fail?",
    "What does the Z coordinate mean?",
    "Show me the units on Floor 3."
  ];

  const handleSend = async (queryText?: string) => {
    const promptToSend = queryText || inputVal;
    if (!promptToSend.trim() || loading) return;

    const userMsg: ChatMsg = { role: 'user', text: promptToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputVal('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          context: {
            parcelId: selectedParcel.id,
            surveyNumber: selectedParcel.surveyNumber,
            buildingName: selectedBuilding.name,
            floorCount: selectedBuilding.totalFloors,
            unitNumber: selectedUnit?.unitNumber,
            proposedUlpin: proposed?.ulpin3D,
            elevationM: selectedUnit?.elevationM,
            validationStatus: validationReport?.overallStatus,
            validationWarning: validationReport?.checks.find(c => c.status === 'WARNING')?.message
          }
        })
      });

      const data = await res.json();
      if (data.success && data.answer) {
        setMessages(prev => [...prev, { role: 'assistant', text: data.answer }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: "Insufficient data available for this query." }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: "Unable to reach assistant service. Please check your connection." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isAiAssistantOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-200" />
            </div>
            <div>
              <h3 className="text-sm font-bold">VerticalMap Assistant</h3>
              <p className="text-[10px] text-slate-400">Grounded in Active 3D Cadastral State</p>
            </div>
          </div>

          <button
            onClick={() => setIsAiAssistantOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Context Banner */}
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
          <span>Active: <strong>{selectedParcel.id}</strong> • {selectedBuilding.buildingCode} • Unit {selectedUnit?.unitNumber || '302'}</span>
          <span className="font-mono text-blue-700">Z: +{selectedUnit?.elevationM || 10.2}m</span>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                    : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 italic pl-8">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-blue-600" />
              VerticalMap Assistant is analyzing cadastral context...
            </div>
          )}
        </div>

        {/* Suggested Quick Questions */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Suggested Cadastral Prompts:
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="text-[11px] bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 px-2 py-1 rounded-md transition-colors text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about 3D ULPIN, Z coordinate, validation..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
