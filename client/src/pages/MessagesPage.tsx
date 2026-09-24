import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Send, 
  ShieldCheck, 
  ArrowLeft, 
  ExternalLink, 
  Check 
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const MessagesPage: React.FC = () => {
  const { conversations, sendMessage } = useMarketplace();
  const [selectedConvId, setSelectedConvId] = useState<string>(conversations[0]?.id || '');
  const [inputText, setInputText] = useState('');
  const [isMeetupScheduled, setIsMeetupScheduled] = useState(false);

  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;
    sendMessage(activeConv.id, inputText);
    setInputText('');
  };

  const handleProposeMeetup = () => {
    if (!activeConv) return;
    sendMessage(
      activeConv.id,
      "📍 Proposed In-Campus Meetup: Central Library Ground Floor Lobby at 4:30 PM today. Let me know if that works!"
    );
    setIsMeetupScheduled(true);
    setTimeout(() => setIsMeetupScheduled(false), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Title */}
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Campus Trade Messages</h1>
        <p className="text-xs text-slate-400">Direct peer-to-peer chats with verified university students</p>
      </div>

      {/* Main Two-Column Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-12 min-h-[620px] max-h-[750px]">
        
        {/* Left Col: Threads List (md: 4 cols) */}
        <div className={`md:col-span-4 border-r border-slate-800 flex flex-col ${selectedConvId && 'hidden md:flex'}`}>
          <div className="p-3.5 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Conversations ({conversations.length})</span>
            <span className="text-[10px] text-emerald-400 font-mono">Live</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {conversations.map((conv) => {
              const isSelected = conv.id === activeConv?.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`p-3.5 cursor-pointer transition-colors flex items-start space-x-3 ${
                    isSelected ? 'bg-slate-800/80' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <img
                    src={conv.partnerAvatar}
                    alt={conv.partnerName}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white truncate">{conv.partnerName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{conv.lastMessageTime}</span>
                    </div>

                    <p className="text-[11px] text-emerald-400 font-medium truncate mt-0.5">
                      {conv.listingTitle} (₹{conv.listingPrice.toLocaleString('en-IN')})
                    </p>

                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Active Chat Room (md: 8 cols) */}
        {activeConv ? (
          <div className={`md:col-span-8 flex flex-col h-full bg-slate-950/40 ${!selectedConvId && 'hidden md:flex'}`}>
            
            {/* Chat Room Header */}
            <div className="p-3 sm:p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedConvId('')}
                  className="md:hidden p-1.5 text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <img
                  src={activeConv.partnerAvatar}
                  alt={activeConv.partnerName}
                  className="w-9 h-9 rounded-xl object-cover ring-1 ring-emerald-500/40"
                />

                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs sm:text-sm font-semibold text-white">{activeConv.partnerName}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-[11px] text-slate-400">{activeConv.partnerCollege}</span>
                </div>
              </div>

              {/* Item Snapshot Widget */}
              <div className="hidden sm:flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                <img
                  src={activeConv.listingImage}
                  alt=""
                  className="w-7 h-7 rounded-md object-cover"
                />
                <div className="text-left">
                  <div className="text-slate-200 font-medium text-[11px] max-w-[140px] truncate">
                    {activeConv.listingTitle}
                  </div>
                  <div className="text-emerald-400 font-bold font-mono text-[10px]">
                    ₹{activeConv.listingPrice.toLocaleString('en-IN')}
                  </div>
                </div>
                <Link
                  to={`/listing/${activeConv.listingId}`}
                  className="p-1 text-slate-400 hover:text-white"
                  title="View Item Details"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Safe Meetup Banner */}
            <div className="px-4 py-2 bg-emerald-950/40 border-b border-emerald-900/40 text-[11px] text-emerald-300 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Collex Safe Meetup: Trade in daylight at Central Library or SAC. Hand over code after testing.</span>
              </div>
              <button
                type="button"
                onClick={handleProposeMeetup}
                className="font-semibold underline hover:text-emerald-200 shrink-0 ml-2"
              >
                Propose Meetup
              </button>
            </div>

            {isMeetupScheduled && (
              <div className="mx-4 mt-2 p-2.5 rounded-xl bg-emerald-900/40 border border-emerald-600 text-emerald-200 text-xs flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Meetup spot dispatched into conversation thread.</span>
              </div>
            )}

            {/* Messages Bubbles Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeConv.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-xs ${
                      msg.isMe
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/60'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-1 px-1">
                    {msg.isMe ? 'You' : msg.senderName} • {msg.time}
                  </span>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/80">
              <form onSubmit={handleSend} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Type a message or negotiate meetup details..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>
        ) : (
          <div className="md:col-span-8 flex items-center justify-center p-8 text-center text-slate-500 text-xs">
            Select a conversation on the left to start messaging.
          </div>
        )}

      </div>

    </div>
  );
};
