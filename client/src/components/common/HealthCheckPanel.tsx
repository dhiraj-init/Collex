import React, { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiError } from '../../services/apiClient';
import type { HealthData } from '../../types';
import { env } from '../../config/env';
import { 
  Activity, 
  Database, 
  Server, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Clock
} from 'lucide-react';

export const HealthCheckPanel: React.FC = () => {
  const [data, setData] = useState<HealthData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const performFetch = useCallback(async () => {
    setError(null);
    try {
      const response = await apiClient.getHealth();
      setData(response.data);
      setLastChecked(new Date());
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`${err.message} (HTTP ${err.statusCode})`);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to connect to backend server');
      }
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadInitialHealth = async () => {
      try {
        const response = await apiClient.getHealth();
        if (isMounted) {
          setData(response.data);
          setLastChecked(new Date());
        }
      } catch (err) {
        if (isMounted) {
          if (err instanceof ApiError) {
            setError(`${err.message} (HTTP ${err.statusCode})`);
          } else {
            setError(err instanceof Error ? err.message : 'Failed to connect to backend server');
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadInitialHealth();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleManualRefresh = async () => {
    setIsLoading(true);
    await performFetch();
  };

  const formatUptime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-slate-100">Live Backend Diagnostics</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Endpoint: <code className="font-mono text-slate-300 bg-slate-800/80 px-1.5 py-0.5 rounded text-[11px]">{env.apiUrl}/health</code>
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={isLoading}
          className="inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Checking...' : 'Refresh Status'}</span>
        </button>
      </div>

      {/* Loading State */}
      {isLoading && !data && (
        <div className="py-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-500 mb-2" />
          <p className="text-xs">Querying Collex API health check endpoint...</p>
        </div>
      )}

      {/* Error / Offline State */}
      {error && (
        <div className="mt-5 p-4 rounded-lg bg-red-950/40 border border-red-900/60 text-red-200">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-medium text-red-300">Backend Server Unreachable</p>
              <p className="text-red-400/90">{error}</p>
              <div className="mt-3 pt-2 border-t border-red-900/40 text-[11px] text-red-400/80">
                To start the backend server, open a terminal and run:
                <pre className="font-mono bg-slate-900/80 p-2 rounded mt-1.5 text-slate-300 border border-slate-800">
                  npm run dev:server
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success / Degraded State */}
      {data && (
        <div className="mt-5 space-y-5">
          {/* Top Status Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* API Status */}
            <div className="bg-slate-800/50 border border-slate-800 p-3.5 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">API Status</span>
                <Server className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-2 flex items-center space-x-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-medium text-slate-100 uppercase tracking-wider">{data.status}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">{data.service} v{data.version}</p>
            </div>

            {/* Database Status */}
            <div className="bg-slate-800/50 border border-slate-800 p-3.5 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">MongoDB Atlas / Local</span>
                <Database className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-2 flex items-center space-x-2">
                {data.database.connected ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-300">Connected</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-amber-300">Degraded (Offline)</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">State: {data.database.state} (code {data.database.code})</p>
            </div>

            {/* Server Uptime */}
            <div className="bg-slate-800/50 border border-slate-800 p-3.5 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Process Uptime</span>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-2 text-sm font-medium text-slate-100 font-mono">
                {formatUptime(data.uptimeSeconds)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Node {data.system.nodeVersion} on {data.system.platform}</p>
            </div>
          </div>

          {/* Memory & System Details */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[11px] uppercase tracking-wider mb-1">Environment</span>
              <span className="text-slate-200 font-semibold px-2 py-0.5 rounded bg-slate-800 text-[11px]">
                {data.environment}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] uppercase tracking-wider mb-1">Memory (RSS)</span>
              <span className="text-slate-300">{data.system.memoryUsageMB.rss} MB</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] uppercase tracking-wider mb-1">Heap Used</span>
              <span className="text-slate-300">{data.system.memoryUsageMB.heapUsed} MB</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] uppercase tracking-wider mb-1">Heap Total</span>
              <span className="text-slate-300">{data.system.memoryUsageMB.heapTotal} MB</span>
            </div>
          </div>

          {lastChecked && (
            <p className="text-[11px] text-slate-500 text-right">
              Last checked: {lastChecked.toLocaleTimeString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
