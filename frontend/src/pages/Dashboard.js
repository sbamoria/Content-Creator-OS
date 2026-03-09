import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Plus, Users, Envelope, ChartLine, Sparkle } from '@phosphor-icons/react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    landingPages: 0,
    totalLeads: 0,
    segments: 0,
    webinars: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [pages, leads, segments, webinars] = await Promise.all([
          axios.get(`${API_URL}/landing-pages`),
          axios.get(`${API_URL}/leads`),
          axios.get(`${API_URL}/segments`),
          axios.get(`${API_URL}/webinars`)
        ]);

        setStats({
          landingPages: pages.data.length,
          totalLeads: leads.data.length,
          segments: segments.data.length,
          webinars: webinars.data.length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    { label: 'Landing Pages', value: stats.landingPages, icon: Plus, color: 'bg-blue-500', path: '/builder' },
    { label: 'Total Leads', value: stats.totalLeads, icon: Users, color: 'bg-emerald-500', path: '/leads' },
    { label: 'Segments', value: stats.segments, icon: Envelope, color: 'bg-purple-500', path: '/segments' },
    { label: 'Webinars', value: stats.webinars, icon: ChartLine, color: 'bg-orange-500', path: '/webinars' },
  ];

  return (
    <Layout>
      <div data-testid="dashboard">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-primary mb-2">Welcome Back</h1>
          <p className="text-zinc-600">Here's your monetization overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => navigate(card.path)}
                data-testid={`stat-card-${card.label.toLowerCase().replace(' ', '-')}`}
                className="bg-white border border-zinc-100 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl p-6 cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                    <Icon size={24} weight="duotone" />
                  </div>
                </div>
                <h3 className="text-sm text-zinc-600 mb-1">{card.label}</h3>
                <p className="text-3xl font-heading font-bold text-primary">{card.value}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-8 border border-surface-border shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <Sparkle size={24} className="text-accent" weight="duotone" />
              <h2 className="text-xl font-heading font-semibold text-primary">Quick Actions</h2>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/builder')}
                data-testid="quick-create-landing-page"
                className="w-full text-left px-4 py-3 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition-colors"
              >
                <p className="font-medium text-zinc-900">Create Landing Page</p>
                <p className="text-sm text-zinc-600">Build AI-powered lead capture forms</p>
              </button>
              <button
                onClick={() => navigate('/leads')}
                data-testid="quick-classify-leads"
                className="w-full text-left px-4 py-3 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition-colors"
              >
                <p className="font-medium text-zinc-900">Classify Leads</p>
                <p className="text-sm text-zinc-600">AI-powered intent detection</p>
              </button>
              <button
                onClick={() => navigate('/analytics')}
                data-testid="quick-view-analytics"
                className="w-full text-left px-4 py-3 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition-colors"
              >
                <p className="font-medium text-zinc-900">View Analytics</p>
                <p className="text-sm text-zinc-600">Get AI insights on your funnel</p>
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-primary to-zinc-700 rounded-xl p-8 text-white shadow-lg"
          >
            <h2 className="text-2xl font-heading font-bold mb-3">AI-Powered Platform</h2>
            <p className="text-zinc-200 mb-6 leading-relaxed">
              MonetizeFlow uses advanced AI to generate landing pages, classify lead intent, and provide actionable insights to maximize your conversions.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent"></div>
                <p className="text-sm text-zinc-200">AI Lead Form Generation</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent"></div>
                <p className="text-sm text-zinc-200">Smart Intent Classification</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent"></div>
                <p className="text-sm text-zinc-200">Conversion Insights</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
