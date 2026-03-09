import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Sparkle, FunnelSimple } from '@phosphor-icons/react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LeadManagement = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classifying, setClassifying] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchLeads = async () => {
    try {
      const response = await axios.get(`${API_URL}/leads`);
      setLeads(response.data);
    } catch (error) {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleClassify = async () => {
    setClassifying(true);
    try {
      const response = await axios.post(`${API_URL}/leads/classify`);
      toast.success(response.data.message || 'Leads classified successfully');
      await fetchLeads();
    } catch (error) {
      toast.error('Failed to classify leads');
    } finally {
      setClassifying(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (filter === 'all') return true;
    return lead.intent_level === filter;
  });

  const getIntentBadge = (level) => {
    const styles = {
      high: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      medium: 'bg-amber-100 text-amber-700 border-amber-200',
      low: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    };
    return styles[level] || 'bg-zinc-100 text-zinc-600 border-zinc-200';
  };

  return (
    <Layout>
      <div data-testid="lead-management">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-heading font-bold text-primary mb-2">Lead Management</h1>
            <p className="text-zinc-600">AI-powered intent classification</p>
          </div>
          <button
            onClick={handleClassify}
            disabled={classifying}
            data-testid="classify-leads-button"
            className="flex items-center gap-2 bg-accent text-accent-foreground hover:bg-orange-700 shadow-lg shadow-orange-500/20 rounded-full px-6 py-3 font-medium transition-all active:scale-95 disabled:opacity-50"
          >
            <Sparkle size={20} weight="duotone" />
            {classifying ? 'Classifying...' : 'Classify Leads with AI'}
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 border border-surface-border shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FunnelSimple size={20} className="text-zinc-600" />
            <h3 className="text-sm font-medium text-zinc-700">Filter by Intent</h3>
          </div>
          <div className="flex gap-2">
            {['all', 'high', 'medium', 'low'].map(level => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                data-testid={`filter-${level}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === level
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-zinc-600">Loading leads...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="bg-white rounded-xl p-12 border border-surface-border text-center">
            <p className="text-zinc-500">No leads found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredLeads.map((lead, idx) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                data-testid={`lead-card-${idx}`}
                className="bg-white rounded-xl p-6 border border-surface-border shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-heading font-semibold text-primary">
                        {lead.responses.full_name || lead.responses.name || 'Anonymous'}
                      </h3>
                      {lead.intent_level && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getIntentBadge(lead.intent_level)}`}>
                          {lead.intent_level.toUpperCase()} INTENT
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-600">{lead.responses.email}</p>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(lead.responses).map(([key, value]) => {
                    if (key === 'full_name' || key === 'name' || key === 'email') return null;
                    return (
                      <div key={key}>
                        <p className="text-xs text-zinc-500 mb-1">{key.replace(/_/g, ' ').toUpperCase()}</p>
                        <p className="text-sm text-zinc-900">{value}</p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LeadManagement;
