import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  ShoppingBag, 
  MessageSquare, 
  Mail, 
  Tag, 
  ArrowRightLeft, 
  Star, 
  ShieldAlert, 
  Bell,
  Code2,
  CheckCircle,
  FolderTree
} from 'lucide-react';

interface ModelProposal {
  name: string;
  icon: React.ElementType;
  description: string;
  keyFields: string[];
  campusScope: string;
}

const PROPOSED_MODELS: ModelProposal[] = [
  {
    name: 'College',
    icon: Building2,
    description: 'Campus institution entity managing domain whitelists and hyperlocal boundaries.',
    keyFields: ['name', 'code', 'domains', 'location.coordinates', 'isActive'],
    campusScope: 'Root tenant partition'
  },
  {
    name: 'User',
    icon: Users,
    description: 'Verified student profile linked strictly to authenticated college domains.',
    keyFields: ['email', 'fullName', 'collegeId', 'trustScore', 'verificationBadge'],
    campusScope: 'Bound to College'
  },
  {
    name: 'Listing',
    icon: ShoppingBag,
    description: 'Marketplace goods offered for sell, rent, exchange, or giveaway.',
    keyFields: ['title', 'category', 'listingType', 'price', 'condition', 'photos', 'sellerId'],
    campusScope: 'Hyperlocal to campus'
  },
  {
    name: 'Conversation',
    icon: MessageSquare,
    description: 'Item-specific peer-to-peer chat thread between buyer and seller.',
    keyFields: ['listingId', 'buyerId', 'sellerId', 'lastMessageSnippet', 'unreadCounts'],
    campusScope: 'Campus peer exchange'
  },
  {
    name: 'Message',
    icon: Mail,
    description: 'Immutable real-time message unit dispatched via Socket.IO and stored in Mongo.',
    keyFields: ['conversationId', 'senderId', 'content', 'mediaUrls', 'isRead'],
    campusScope: 'Private peer record'
  },
  {
    name: 'Offer',
    icon: Tag,
    description: 'Price negotiation or exchange proposal before final transaction.',
    keyFields: ['listingId', 'buyerId', 'offeredPrice', 'status', 'counterPrice'],
    campusScope: 'Listing scope'
  },
  {
    name: 'Transaction',
    icon: ArrowRightLeft,
    description: 'Physical campus meetup escrow/settlement with safe-exchange verification code.',
    keyFields: ['listingId', 'agreedPrice', 'meetupLocation', 'verificationCode', 'status'],
    campusScope: 'Physical campus meetup'
  },
  {
    name: 'Review',
    icon: Star,
    description: 'Two-way trust feedback given after successful in-person transaction.',
    keyFields: ['transactionId', 'reviewerId', 'revieweeId', 'rating', 'comment'],
    campusScope: 'Peer trust metric'
  },
  {
    name: 'Report',
    icon: ShieldAlert,
    description: 'Safety moderation flag for prohibited items, harassment, or scam attempts.',
    keyFields: ['reporterId', 'targetType', 'targetId', 'reason', 'status'],
    campusScope: 'Campus moderation'
  },
  {
    name: 'Notification',
    icon: Bell,
    description: 'Real-time and async student alerts for offers, messages, and meetups.',
    keyFields: ['recipientId', 'type', 'title', 'body', 'linkUrl', 'isRead'],
    campusScope: 'User push/in-app'
  }
];

export const ArchitecturePreview: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>('College');
  const activeModel = PROPOSED_MODELS.find(m => m.name === selectedModel) || PROPOSED_MODELS[0];
  const ActiveIcon = activeModel.icon;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-surface rounded-xl p-5">
          <div className="flex items-center space-x-2.5 text-emerald-400 mb-2">
            <FolderTree className="w-5 h-5" />
            <h3 className="font-medium text-slate-100 text-sm">Monorepo Topology</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Clean dual-tier workspace with <code className="text-slate-300">/client</code> (Vite + React 19 + Tailwind) and <code className="text-slate-300">/server</code> (Express + TypeScript + Mongoose).
          </p>
        </div>

        <div className="card-surface rounded-xl p-5">
          <div className="flex items-center space-x-2.5 text-blue-400 mb-2">
            <Code2 className="w-5 h-5" />
            <h3 className="font-medium text-slate-100 text-sm">Pipeline & Error Handling</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Centralized Express pipeline with custom <code className="text-slate-300">AppError</code>, Mongoose cast/duplicate key handlers, request logger, and uniform JSON envelopes.
          </p>
        </div>

        <div className="card-surface rounded-xl p-5">
          <div className="flex items-center space-x-2.5 text-amber-400 mb-2">
            <CheckCircle className="w-5 h-5" />
            <h3 className="font-medium text-slate-100 text-sm">Campus Boundary Engine</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Architected strictly for college domains. Every listing, offer, and transaction is partitioned by validated campus boundary.
          </p>
        </div>
      </div>

      {/* 10 Proposed Data Models Explorer */}
      <div className="card-surface rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-100">Proposed Domain Data Models (10 Entities)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Initial schema proposals designed for hyperlocal peer-to-peer campus commerce.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-900/60 px-2.5 py-1 rounded-md self-start sm:self-auto">
            Design Proposals Ready
          </span>
        </div>

        {/* Model Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
          {PROPOSED_MODELS.map((model) => {
            const Icon = model.icon;
            const isSelected = selectedModel === model.name;
            return (
              <button
                key={model.name}
                onClick={() => setSelectedModel(model.name)}
                className={`flex items-center space-x-2 p-2.5 rounded-lg text-left text-xs transition-colors border ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-600/70 text-emerald-300 font-medium'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className="truncate">{model.name}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Model Detail */}
        <div className="mt-5 p-5 bg-slate-950/60 border border-slate-800/80 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-md bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
                <ActiveIcon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-100">{activeModel.name} Model</h4>
                <p className="text-xs text-slate-400">{activeModel.description}</p>
              </div>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {activeModel.campusScope}
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block mb-2">
              Key Schema Properties & Indexes
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeModel.keyFields.map((field) => (
                <span
                  key={field}
                  className="font-mono text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
