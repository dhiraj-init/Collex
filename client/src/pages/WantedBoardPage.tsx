import React, { useEffect, useState } from 'react';
import { Plus, MapPin, Target, DollarSign } from 'lucide-react';
import { wantedService, type WantedPost } from '../services/wantedService';
import { useAuth } from '../context/AuthContext';

export const WantedBoardPage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<WantedPost[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('ELECTRONICS');
  const [budgetMax, setBudgetMax] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await wantedService.getPosts(user?.college);
        setPosts(res.data);
      } catch (error) {
        console.error('Failed to load wanted posts', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [user?.college]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await wantedService.createPost({
        title,
        description,
        category,
        budgetMax: budgetMax ? Number(budgetMax) : undefined,
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setBudgetMax('');
      
      // refetch manually instead of calling the function
      try {
        setLoading(true);
        const res = await wantedService.getPosts(user?.college);
        setPosts(res.data);
      } catch (error) {
        console.error('Failed to reload posts', error);
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to create post', error);
      alert('Failed to post request');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white flex items-center gap-2">
            <Target className="w-8 h-8 text-emerald-400" />
            Wanted Board
          </h1>
          <p className="text-slate-400 mt-2">
            Can't find what you need? Post a request and sellers will come to you.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-5 h-5" />
          Post a Request
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800">
          <Target className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No active requests</h3>
          <p className="text-slate-400">Be the first to post a request on campus!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/30 transition-colors flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-medium rounded-full">
                  {post.category}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <h3 className="text-lg font-medium text-white mb-2 line-clamp-2">{post.title}</h3>
              {post.description && (
                <p className="text-slate-400 text-sm mb-4 line-clamp-3 flex-grow">{post.description}</p>
              )}
              
              <div className="flex items-center gap-2 text-emerald-400 font-medium mb-6 mt-auto">
                <DollarSign className="w-4 h-4" />
                Budget up to ₹{post.budgetMax || 'Negotiable'}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-medium text-emerald-400">
                    {post.poster?.fullName?.charAt(0) || '?'}
                  </div>
                  <div className="text-sm">
                    <div className="text-slate-200">{post.poster?.fullName}</div>
                    <div className="text-slate-500 text-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {post.poster?.college}
                    </div>
                  </div>
                </div>
                
                {user?.id !== post.poster?.id && (
                  <button className="text-sm font-medium text-emerald-400 hover:text-emerald-300">
                    I have this
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl w-full max-w-md border border-slate-800 shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 font-display">What are you looking for?</h2>
            
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Need Casio FX-991ES Calculator"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="TEXTBOOKS">Textbooks</option>
                  <option value="ELECTRONICS">Electronics</option>
                  <option value="DORM_ESSENTIALS">Dorm Essentials</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Max Budget (₹)</label>
                <input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  placeholder="e.g. 600"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Details (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Any specific edition, condition, or color?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 min-h-[100px]"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-slate-300 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium py-3 transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Post Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
