/* oxlint-disable react/set-state-in-effect */
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Send, 
  ShieldCheck, 
  ArrowLeft, 
  ExternalLink, 
  Check, 
  Tag, 
  MapPin, 
  CheckCircle2, 
  MoreVertical, 
  Flag, 
  Ban, 
  Star,
  AlertTriangle
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/chatService';
import type { ApiConversation, ApiMessage } from '../services/chatService';
import { transactionService } from '../services/transactionService';
import type { ApiTransaction, SafeMeetupSpot } from '../services/transactionService';

export const MessagesPage: React.FC = () => {
  const { conversations: mockConversations } = useMarketplace();
  const { user: authUser } = useAuth();

  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string>('');
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [activeTransaction, setActiveTransaction] = useState<ApiTransaction | null>(null);
  const [safeSpots, setSafeSpots] = useState<SafeMeetupSpot[]>([]);

  // Modals
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerPriceInput, setOfferPriceInput] = useState('');
  const [isMeetupModalOpen, setIsMeetupModalOpen] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState('Central Library Entrance');
  const [meetupTime, setMeetupTime] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [reportReason, setReportReason] = useState('SCAM_SUSPICION');
  const [reportDesc, setReportDesc] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Fetch Conversations and Safe Meetup Spots
  useEffect(() => {
    let isMounted = true;
    chatService.getConversations()
      .then((res) => {
        if (!isMounted) return;
        if (res && res.length > 0) {
          setConversations(res);
          setSelectedConvId(res[0].id || (res[0]._id as string));
        } else if (mockConversations.length > 0) {
          // Fallback to mock
          const mappedMock: ApiConversation[] = mockConversations.map((m) => ({
            id: m.id,
            buyer: { fullName: 'Aryan Sharma', college: 'IIT Bombay' },
            seller: { fullName: m.partnerName, avatar: m.partnerAvatar, college: m.partnerCollege },
            listing: { title: m.listingTitle, price: m.listingPrice, images: [m.listingImage], status: 'ACTIVE', college: m.partnerCollege },
            lastMessage: m.lastMessage,
            lastMessageAt: m.lastMessageTime,
            unreadCountBuyer: 0,
            unreadCountSeller: 0,
            isBlocked: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
          setConversations(mappedMock);
          setSelectedConvId(mappedMock[0].id);
        }
      })
      .catch(() => {
        // Fallback
      });

    transactionService.getSafeMeetupSpots()
      .then((spots) => {
        if (isMounted && spots) setSafeSpots(spots);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [mockConversations]);

  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  // 2. Setup Socket.IO for active conversation
  useEffect(() => {
    if (!selectedConvId) return;

    const socket = chatService.getSocket();

    // Join room
    socket.emit('join_conversation', { conversationId: selectedConvId });
    socket.emit('mark_read', { conversationId: selectedConvId });

    // Load message history
    chatService.getMessages(selectedConvId)
      .then((msgs) => setMessages(msgs))
      .catch(() => {
        // Fallback to mock messages if API fails
        const mockItem = mockConversations.find(c => c.id === selectedConvId);
        if (mockItem) {
          setMessages(mockItem.messages.map(m => ({
            id: m.id,
            conversation: selectedConvId,
            sender: { fullName: m.senderName },
            text: m.text,
            type: 'TEXT',
            createdAt: m.time,
          })));
        }
      });

    // Load transaction state if any
    transactionService.getTransactionByConversation(selectedConvId)
      .then((tx) => setActiveTransaction(tx))
      .catch(() => {});

    // Socket Event Listeners
    const handleNewMessage = (msg: ApiMessage) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    };

    const handleOfferResolved = (payload: { messageId: string; status: string; transaction?: ApiTransaction }) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === payload.messageId || m._id === payload.messageId) {
            return {
              ...m,
              offer: m.offer ? { ...m.offer, status: payload.status as 'ACCEPTED' | 'REJECTED' | 'COUNTERED' } : undefined,
            };
          }
          return m;
        })
      );
      if (payload.transaction) {
        setActiveTransaction(payload.transaction);
      }
    };

    const handleUserTyping = () => setPartnerTyping(true);
    const handleUserStopTyping = () => setPartnerTyping(false);

    socket.on('new_message', handleNewMessage);
    socket.on('offer_resolved', handleOfferResolved);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    return () => {
      socket.emit('leave_conversation', { conversationId: selectedConvId });
      socket.off('new_message', handleNewMessage);
      socket.off('offer_resolved', handleOfferResolved);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
    };
  }, [selectedConvId, mockConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. Send Text Message
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    const socket = chatService.getSocket();
    socket.emit('send_message', {
      conversationId: activeConv.id,
      text: inputText.trim(),
      type: 'TEXT',
    });

    socket.emit('typing_stop', { conversationId: activeConv.id });
    setInputText('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!activeConv) return;
    const socket = chatService.getSocket();
    socket.emit('typing_start', { conversationId: activeConv.id });

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit('typing_stop', { conversationId: activeConv.id });
    }, 1500);
  };

  // 4. Send Custom Offer
  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(offerPriceInput);
    if (!price || price <= 0 || !activeConv) return;

    const socket = chatService.getSocket();
    socket.emit('send_message', {
      conversationId: activeConv.id,
      text: `Made an offer of ₹${price.toLocaleString('en-IN')}`,
      type: 'OFFER',
      offerPrice: price,
    });

    setIsOfferModalOpen(false);
    setOfferPriceInput('');
  };

  // 5. Respond to an Offer
  const handleOfferResponse = (messageId: string, action: 'ACCEPT' | 'REJECT') => {
    if (!activeConv) return;
    const socket = chatService.getSocket();
    socket.emit('respond_offer', {
      conversationId: activeConv.id,
      messageId,
      action,
    });
  };

  // 6. Propose Meetup Spot
  const handleProposeMeetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTransaction) return;

    try {
      const updated = await transactionService.updateMeetupSpot(activeTransaction.id, {
        spotName: selectedSpot,
        scheduledDate: meetupTime ? new Date(meetupTime).toISOString() : new Date().toISOString(),
      });
      setActiveTransaction(updated);
      setIsMeetupModalOpen(false);

      // Send chat confirmation
      const socket = chatService.getSocket();
      socket.emit('send_message', {
        conversationId: activeConv.id,
        text: `📍 Campus Meetup Proposed: ${selectedSpot}. Please confirm below!`,
        type: 'TEXT',
      });

      setActionSuccessNotice('Meetup scheduled! Waiting for peer confirmation.');
      setTimeout(() => setActionSuccessNotice(null), 3000);
    } catch {
      alert('Could not update meetup spot');
    }
  };

  // 7. Confirm Physical Handoff
  const handleConfirmHandoff = async () => {
    if (!activeTransaction) return;

    try {
      const updated = await transactionService.confirmHandoff(activeTransaction.id);
      setActiveTransaction(updated);

      if (updated.status === 'COMPLETED') {
        setActionSuccessNotice('Transaction completed! Please leave a peer review.');
        setIsReviewModalOpen(true);
      } else {
        setActionSuccessNotice('Your handoff confirmation recorded! Waiting for peer.');
      }
      setTimeout(() => setActionSuccessNotice(null), 4000);
    } catch {
      alert('Could not confirm handoff');
    }
  };

  // 8. Submit Mutual Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTransaction) return;

    try {
      await transactionService.createReview({
        transactionId: activeTransaction.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setIsReviewModalOpen(false);
      setActionSuccessNotice('Thank you! Peer review submitted and trust score updated.');
      setTimeout(() => setActionSuccessNotice(null), 4000);
    } catch (err) {
      alert((err as Error).message || 'Review submission failed');
    }
  };

  // 9. Block User & Report
  const handleBlockUser = async () => {
    if (!activeConv) return;
    if (window.confirm('Block this student? You will no longer receive messages.')) {
      await chatService.blockConversation(activeConv.id);
      setIsMenuOpen(false);
      setActionSuccessNotice('User blocked.');
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv || !reportDesc.trim()) return;

    await chatService.reportConversation(activeConv.id, reportReason, reportDesc.trim());
    setIsReportModalOpen(false);
    setReportDesc('');
    setActionSuccessNotice('Report submitted to campus moderation team.');
    setTimeout(() => setActionSuccessNotice(null), 4000);
  };

  // Participant details
  const partner = activeConv
    ? (activeConv.buyer.fullName === authUser?.fullName ? activeConv.seller : activeConv.buyer)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Campus Trade Messages</h1>
          <p className="text-xs text-slate-400">Direct peer communication with verified students. Real-time offers and safe meetup coordination.</p>
        </div>

        {/* In-Person Campus Safety Advice Pill */}
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-800/40 text-[11px] text-emerald-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Privacy Protected: Direct phone numbers and personal emails are hidden.</span>
        </div>
      </div>

      {actionSuccessNotice && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessNotice}</span>
        </div>
      )}

      {/* Main Two-Column Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-12 min-h-[640px] max-h-[780px]">
        
        {/* Left Col: Threads List */}
        <div className={`md:col-span-4 border-r border-slate-800 flex flex-col ${selectedConvId && 'hidden md:flex'}`}>
          <div className="p-3.5 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Conversations ({conversations.length})</span>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
              Socket.IO Live
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {conversations.map((conv) => {
              const isSelected = conv.id === activeConv?.id;
              const other = conv.buyer.fullName === authUser?.fullName ? conv.seller : conv.buyer;
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`p-3.5 cursor-pointer transition-colors flex items-start space-x-3 ${
                    isSelected ? 'bg-slate-800/80' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <img
                    src={other.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                    alt={other.fullName}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white truncate">{other.fullName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <p className="text-[11px] text-emerald-400 font-medium truncate mt-0.5">
                      {conv.listing?.title} (₹{conv.listing?.price?.toLocaleString('en-IN')})
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

        {/* Right Col: Active Chat Room */}
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
                  src={partner?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                  alt={partner?.fullName}
                  className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700"
                />

                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-semibold text-white">{partner?.fullName}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {partner?.college || 'IIT Bombay'} • Trust Score: {partner?.trustScore || 85}/100
                  </p>
                </div>
              </div>

              {/* Actions & Safety Menu */}
              <div className="flex items-center space-x-2 relative">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 hover:bg-emerald-900 text-xs font-medium flex items-center space-x-1"
                >
                  <Tag className="w-3 h-3" />
                  <span>Send Offer</span>
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-1 z-50 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsReportModalOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg flex items-center space-x-2"
                      >
                        <Flag className="w-3.5 h-3.5 text-amber-400" />
                        <span>Report Conversation</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleBlockUser}
                        className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-950/30 rounded-lg flex items-center space-x-2"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Block Student</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Listing Preview Banner Inside Chat Header */}
            {activeConv.listing && (
              <div className="px-4 py-2.5 bg-slate-900/50 border-b border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <img
                    src={activeConv.listing.images?.[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'}
                    alt=""
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-800 shrink-0"
                  />
                  <div className="truncate">
                    <span className="font-semibold text-slate-200 truncate block">{activeConv.listing.title}</span>
                    <span className="text-[11px] text-emerald-400 font-mono">Listed for ₹{activeConv.listing.price?.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {activeTransaction && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                      Status: {activeTransaction.status}
                    </span>
                  )}
                  {activeConv.listing.id && (
                    <Link
                      to={`/listing/${activeConv.listing.id}`}
                      className="text-slate-400 hover:text-white"
                      title="View Listing Page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Transaction Meetup Banner (If offer accepted) */}
            {activeTransaction && (
              <div className="m-3 p-3.5 rounded-xl bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-1.5 font-semibold text-white">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>Campus Meetup: {activeTransaction.meetupSpot.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Agreed Price: ₹{activeTransaction.agreedPrice.toLocaleString('en-IN')} • Status: {activeTransaction.status}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsMeetupModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-medium"
                  >
                    Change Spot
                  </button>

                  {activeTransaction.status !== 'COMPLETED' ? (
                    <button
                      type="button"
                      onClick={handleConfirmHandoff}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs flex items-center space-x-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Confirm Handoff</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsReviewModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-xs flex items-center space-x-1"
                    >
                      <Star className="w-3 h-3" />
                      <span>Leave Review</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {messages.map((msg) => {
                const isMe = msg.sender.fullName === authUser?.fullName || msg.sender.fullName === 'Aryan Sharma';
                const isOffer = msg.type === 'OFFER';

                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] sm:max-w-md ${isOffer ? 'w-full max-w-sm' : ''}`}>
                      
                      {/* Interactive Offer Card */}
                      {isOffer && msg.offer ? (
                        <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-3 shadow-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center">
                              <Tag className="w-3 h-3 mr-1" /> Campus Peer Offer
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              msg.offer.status === 'ACCEPTED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                              msg.offer.status === 'REJECTED' ? 'bg-red-950 text-red-300 border border-red-800' :
                              'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}>
                              {msg.offer.status}
                            </span>
                          </div>

                          <div className="flex items-baseline space-x-2">
                            <span className="text-2xl font-extrabold text-white font-mono">
                              ₹{msg.offer.price.toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs text-slate-400">proposed for {activeConv.listing?.title}</span>
                          </div>

                          {/* Seller Action Controls */}
                          {!isMe && msg.offer.status === 'PENDING' && (
                            <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
                              <button
                                type="button"
                                onClick={() => handleOfferResponse(msg.id, 'ACCEPT')}
                                className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
                              >
                                Accept Offer
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOfferResponse(msg.id, 'REJECT')}
                                className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white text-xs"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Standard Chat Bubble */
                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            isMe
                              ? 'bg-emerald-600 text-white rounded-tr-xs'
                              : 'bg-slate-800 text-slate-200 rounded-tl-xs border border-slate-750'
                          }`}
                        >
                          <p>{msg.text}</p>
                          <div className={`mt-1 text-[9px] flex items-center justify-end space-x-1 ${isMe ? 'text-emerald-200' : 'text-slate-400'}`}>
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isMe && <Check className="w-2.5 h-2.5" />}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {partnerTyping && (
                <div className="flex items-center space-x-1.5 text-xs text-slate-400 pl-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce delay-200" />
                  <span className="text-[11px] text-slate-500 ml-1">{partner?.fullName} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center space-x-2">
              <input
                type="text"
                placeholder={`Message ${partner?.fullName || 'student'}...`}
                value={inputText}
                onChange={handleInputChange}
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none"
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
        ) : (
          <div className="md:col-span-8 flex items-center justify-center text-slate-500 text-xs">
            Select a conversation to start chatting
          </div>
        )}

      </div>

      {/* 1. Send Offer Modal */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={() => setIsOfferModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl z-10 space-y-4">
            <h3 className="text-base font-bold text-white">Make an Offer</h3>
            <p className="text-xs text-slate-400">Enter your proposed cash/UPI amount for this campus item.</p>

            <form onSubmit={handleSendOffer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Offer Price (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 700"
                  value={offerPriceInput}
                  onChange={(e) => setOfferPriceInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="w-1/2 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs"
                >
                  Dispatch Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Meetup Spot Scheduler Modal */}
      {isMeetupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={() => setIsMeetupModalOpen(false)} />
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl z-10 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center">
              <MapPin className="w-4 h-4 text-emerald-400 mr-2" />
              Configure Campus Meetup Spot
            </h3>
            <p className="text-xs text-slate-400">
              Pick a designated, well-lit public campus location for the physical handoff.
            </p>

            <form onSubmit={handleProposeMeetup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Approved Safe Spots</label>
                <select
                  value={selectedSpot}
                  onChange={(e) => setSelectedSpot(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                >
                  {safeSpots.map((spot) => (
                    <option key={spot.name} value={spot.name}>
                      {spot.name} ({spot.landmark})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Meetup Time</label>
                <input
                  type="datetime-local"
                  value={meetupTime}
                  onChange={(e) => setMeetupTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMeetupModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs"
                >
                  Propose Meetup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Leave Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={() => setIsReviewModalOpen(false)} />
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl z-10 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center">
              <Star className="w-4 h-4 text-amber-400 mr-2" />
              Peer Trade Review
            </h3>
            <p className="text-xs text-slate-400">
              Your feedback directly updates the student’s explainable Collex Trust Score.
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Star Rating (1 - 5)</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`p-2 rounded-lg border ${
                        reviewRating >= star
                          ? 'bg-amber-950/80 border-amber-600 text-amber-400'
                          : 'border-slate-800 text-slate-600'
                      }`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Review Comments</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Was the student on time? Was the item exactly as described?"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-amber-600 text-white font-semibold text-xs"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={() => setIsReportModalOpen(false)} />
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl z-10 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center text-red-400">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Report Conversation
            </h3>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reason for Report</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                >
                  <option value="SCAM_SUSPICION">Scam or Payment Fraud Suspicion</option>
                  <option value="HARASSMENT">Harassment or Abusive Behavior</option>
                  <option value="NO_SHOW">Repeated Meetup No-Show</option>
                  <option value="INAPPROPRIATE_ITEM">Inappropriate or Prohibited Goods</option>
                  <option value="OTHER">Other Community Policy Violation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide specific details for campus moderators to investigate..."
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs"
                >
                  Submit to Moderators
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
