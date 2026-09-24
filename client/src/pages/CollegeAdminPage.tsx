import React, { useEffect, useState } from 'react';
import { ShieldAlert, Users, Package, PiggyBank, TrendingUp, AlertTriangle } from 'lucide-react';
import { collegeService } from '../services/collegeService';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export const CollegeAdminPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        if (user?.college) {
          const res = await collegeService.getCollegeDashboard(user.college);
          setStats(res.data);
        }
      } catch (error) {
        console.error('Failed to load dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'COLLEGE_ADMIN' || user?.role === 'SUPER_ADMIN') {
      fetchDashboard();
    }
  }, [user]);

  if (user?.role !== 'COLLEGE_ADMIN' && user?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/" replace />;
  }


  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <ShieldAlert className="w-10 h-10 text-emerald-500" />
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Campus Admin Console</h1>
          <p className="text-slate-400 mt-1">Tenant Overview for {stats.college.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Metric Cards */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium">Total Students</h3>
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{stats.stats.totalStudents}</div>
          <p className="text-emerald-400 text-sm mt-2 font-medium">
            {stats.stats.verificationRate}% Verified
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium">Active Listings</h3>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{stats.stats.activeListings}</div>
          <p className="text-slate-500 text-sm mt-2">
            {stats.stats.totalListings} total historically
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium">Est. Student Savings</h3>
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">₹{stats.stats.estimatedStudentSavings.toLocaleString()}</div>
          <p className="text-slate-500 text-sm mt-2">
            {stats.stats.completedExchanges} deals completed
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium">Moderation Queue</h3>
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{stats.stats.pendingReports}</div>
          <p className="text-red-400 text-sm mt-2 font-medium">
            Requires attention
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Popular Categories
          </h3>
          <div className="space-y-4">
            {stats.popularCategories.map((cat: any, i: number) => {
              const max = Math.max(...stats.popularCategories.map((c: any) => c.count));
              const width = `${(cat.count / max) * 100}%`;
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300 font-medium">{cat.category}</span>
                    <span className="text-slate-500">{cat.count} listings</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Meetup Spots Config Placeholder */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Safe Meetup Spots</h3>
          <p className="text-slate-400 mb-6 text-sm">
            These are the verified campus locations suggested to students when scheduling a meetup.
          </p>
          <div className="space-y-3">
            {[
              'Central Library Entrance',
              'Student Activity Centre',
              'Main Gate Security Post',
              'Hostel Warden Office'
            ].map((spot, i) => (
              <div key={i} className="px-4 py-3 bg-slate-800 rounded-xl flex items-center justify-between">
                <span className="text-slate-200 font-medium">{spot}</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md">Active</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-3 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl font-medium transition-colors">
            Configure Locations
          </button>
        </div>
      </div>
    </div>
  );
};
