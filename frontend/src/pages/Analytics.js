import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Sparkle, TrendUp } from '@phosphor-icons/react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState({});
  const [loading, setLoading] = useState(true);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API_URL}/analytics/funnel`);
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    if (!stats) return;
    setGeneratingInsights(true);

    const stages = ['lead_capture', 'intent_classification', 'webinar_signups', 'conversions'];
    const newInsights = {};

    try {
      for (const stage of stages) {
        const response = await axios.post(`${API_URL}/analytics/insights`, {
          funnel_stats: stats,
          stage
        });
        newInsights[stage] = response.data.insight;
      }
      setInsights(newInsights);
      toast.success('✅ AI insights generated successfully!');
    } catch (error) {
      console.error('Insights error:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to generate insights';
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setGeneratingInsights(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-zinc-600">Loading analytics...</p>
        </div>
      </Layout>
    );
  }

  const funnelData = [
    { name: 'Total Leads', value: stats?.total_leads || 0, color: '#3B82F6', gradient: 'url(#blueGradient)' },
    { name: 'High Intent', value: stats?.high_intent || 0, color: '#10B981', gradient: 'url(#greenGradient)' },
    { name: 'Webinar Signups', value: stats?.webinar_signups || 0, color: '#F59E0B', gradient: 'url(#orangeGradient)' },
    { name: 'Purchases', value: stats?.purchases || 0, color: '#EA580C', gradient: 'url(#redGradient)' },
  ];

  const conversionRate = stats?.total_leads > 0
    ? ((stats.purchases / stats.total_leads) * 100).toFixed(1)
    : 0;

  return (
    <Layout>
      <div data-testid="analytics-page">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-heading font-bold text-primary mb-2">Analytics Dashboard</h1>
            <p className="text-zinc-600">AI-powered insights on your conversion funnel</p>
          </div>
          <button
            onClick={generateInsights}
            disabled={generatingInsights}
            data-testid="generate-insights-button"
            className="flex items-center gap-2 bg-accent text-accent-foreground hover:bg-orange-700 shadow-lg shadow-orange-500/20 rounded-full px-6 py-3 font-medium transition-all active:scale-95 disabled:opacity-50"
          >
            <Sparkle size={20} weight="duotone" />
            {generatingInsights ? 'Generating...' : 'Generate AI Insights'}
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 border border-surface-border shadow-sm"
          >
            <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Total Leads</p>
            <p className="text-3xl font-heading font-bold text-primary">{stats?.total_leads || 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 border border-surface-border shadow-sm"
          >
            <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">High Intent</p>
            <p className="text-3xl font-heading font-bold text-emerald-600">{stats?.high_intent || 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 border border-surface-border shadow-sm"
          >
            <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Medium Intent</p>
            <p className="text-3xl font-heading font-bold text-amber-600">{stats?.medium_intent || 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 border border-surface-border shadow-sm"
          >
            <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Webinar Signups</p>
            <p className="text-3xl font-heading font-bold text-primary">{stats?.webinar_signups || 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 border border-surface-border shadow-sm"
          >
            <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Conversion Rate</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-heading font-bold text-accent">{conversionRate}%</p>
              <TrendUp size={20} className="text-accent" weight="bold" />
            </div>
          </motion.div>
        </div>

        {/* Funnel Visualization */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-8 border border-surface-border shadow-sm"
          >
            <h2 className="text-xl font-heading font-semibold text-primary mb-6">Conversion Funnel</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelData}>
                <defs>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EA580C" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#EA580C" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#52525B' }} />
                <YAxis tick={{ fontSize: 12, fill: '#52525B' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18181B', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#FAFAFA'
                  }}
                />
                <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.gradient} stroke={entry.color} strokeWidth={2} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {insights.lead_capture && (
              <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
                <div className="flex items-start gap-3">
                  <Sparkle size={20} className="text-accent mt-1" weight="duotone" />
                  <div>
                    <p className="text-xs font-medium text-accent mb-1 uppercase tracking-wider">AI Insight</p>
                    <p className="text-sm text-zinc-700">{insights.lead_capture}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-8 border border-surface-border shadow-sm"
          >
            <h2 className="text-xl font-heading font-semibold text-primary mb-6">Intent Distribution</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-zinc-700">High Intent</span>
                  <span className="text-sm font-bold text-emerald-600">{stats?.high_intent || 0}</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-4 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: `${stats?.total_leads > 0 ? (stats.high_intent / stats.total_leads * 100) : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-zinc-700">Medium Intent</span>
                  <span className="text-sm font-bold text-amber-600">{stats?.medium_intent || 0}</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-4 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-amber-600 h-full rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: `${stats?.total_leads > 0 ? (stats.medium_intent / stats.total_leads * 100) : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-zinc-700">Low Intent</span>
                  <span className="text-sm font-bold text-zinc-600">{stats?.low_intent || 0}</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-4 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-zinc-300 to-zinc-500 h-full rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: `${stats?.total_leads > 0 ? (stats.low_intent / stats.total_leads * 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {insights.intent_classification && (
              <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
                <div className="flex items-start gap-3">
                  <Sparkle size={20} className="text-accent mt-1" weight="duotone" />
                  <div>
                    <p className="text-xs font-medium text-accent mb-1 uppercase tracking-wider">AI Insight</p>
                    <p className="text-sm text-zinc-700">{insights.intent_classification}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Additional Insights */}
        <div className="grid md:grid-cols-2 gap-6">
          {insights.webinar_signups && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 border border-surface-border shadow-sm"
            >
              <h3 className="text-sm font-medium text-zinc-700 mb-3">Webinar Performance</h3>
              <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                <div className="flex items-start gap-3">
                  <Sparkle size={20} className="text-accent mt-1" weight="duotone" />
                  <div>
                    <p className="text-xs font-medium text-accent mb-1 uppercase tracking-wider">AI Insight</p>
                    <p className="text-sm text-zinc-700">{insights.webinar_signups}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {insights.conversions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 border border-surface-border shadow-sm"
            >
              <h3 className="text-sm font-medium text-zinc-700 mb-3">Conversion Optimization</h3>
              <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                <div className="flex items-start gap-3">
                  <Sparkle size={20} className="text-accent mt-1" weight="duotone" />
                  <div>
                    <p className="text-xs font-medium text-accent mb-1 uppercase tracking-wider">AI Insight</p>
                    <p className="text-sm text-zinc-700">{insights.conversions}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
