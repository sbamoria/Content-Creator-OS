import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { PaperPlaneTilt } from '@phosphor-icons/react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const EmailCampaigns = () => {
  const [segments, setSegments] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [formData, setFormData] = useState({
    segment_id: '',
    subject: '',
    html_content: ''
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [segmentsRes, campaignsRes] = await Promise.all([
          axios.get(`${API_URL}/segments`),
          axios.get(`${API_URL}/campaigns`)
        ]);
        setSegments(segmentsRes.data);
        setCampaigns(campaignsRes.data);
      } catch (error) {
        toast.error('Failed to load data');
      }
    };
    fetchData();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      const response = await axios.post(`${API_URL}/campaigns/broadcast`, formData);
      toast.success(response.data.message || 'Campaign sent successfully!');
      setFormData({ segment_id: '', subject: '', html_content: '' });
      
      // Refresh campaign history
      const campaignsRes = await axios.get(`${API_URL}/campaigns`);
      setCampaigns(campaignsRes.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send campaign');
    } finally {
      setSending(false);
    }
  };

  const selectedSegment = segments.find(s => s.id === formData.segment_id);

  return (
    <Layout>
      <div data-testid="email-campaigns">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-primary mb-2">Email Campaigns</h1>
          <p className="text-zinc-600">Broadcast emails to your segments</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-8 border border-surface-border shadow-sm"
          >
            <h2 className="text-xl font-heading font-semibold text-primary mb-6">Campaign Details</h2>

            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-700 mb-2 block">Select Segment</label>
                <select
                  value={formData.segment_id}
                  onChange={(e) => setFormData({ ...formData, segment_id: e.target.value })}
                  data-testid="segment-select"
                  className="w-full px-4 py-3 bg-surface-input border border-transparent focus:border-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100 rounded-lg transition-all outline-none"
                  required
                >
                  <option value="">Choose a segment...</option>
                  {segments.map(seg => (
                    <option key={seg.id} value={seg.id}>
                      {seg.name} ({seg.lead_ids.length} leads)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 mb-2 block">Email Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  data-testid="email-subject-input"
                  className="w-full px-4 py-3 bg-surface-input border border-transparent focus:border-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100 rounded-lg transition-all outline-none"
                  placeholder="Your amazing course is waiting..."
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 mb-2 block">Email Content (HTML)</label>
                <textarea
                  value={formData.html_content}
                  onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                  data-testid="email-content-textarea"
                  className="w-full px-4 py-3 bg-surface-input border border-transparent focus:border-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100 rounded-lg transition-all outline-none font-mono text-sm"
                  rows="12"
                  placeholder="<h2>Hi there!</h2><p>We have an exciting update...</p>"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                data-testid="send-broadcast-button"
                className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground hover:bg-orange-700 shadow-lg shadow-orange-500/20 rounded-full py-3 font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperPlaneTilt size={20} weight="duotone" />
                {sending ? 'Sending...' : 'Send Broadcast'}
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-8 border border-surface-border shadow-sm"
          >
            <h2 className="text-xl font-heading font-semibold text-primary mb-6">Preview</h2>

            {selectedSegment ? (
              <div className="space-y-4">
                <div className="bg-zinc-50 rounded-lg p-4">
                  <p className="text-xs text-zinc-500 mb-1">Recipients</p>
                  <p className="text-lg font-heading font-semibold text-primary">
                    {selectedSegment.name}
                  </p>
                  <p className="text-sm text-zinc-600">{selectedSegment.lead_ids.length} leads</p>
                </div>

                {formData.subject && (
                  <div className="bg-zinc-50 rounded-lg p-4">
                    <p className="text-xs text-zinc-500 mb-1">Subject</p>
                    <p className="text-sm text-zinc-900">{formData.subject}</p>
                  </div>
                )}

                {formData.html_content && (
                  <div className="bg-zinc-50 rounded-lg p-4">
                    <p className="text-xs text-zinc-500 mb-3">Content Preview</p>
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: formData.html_content }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <PaperPlaneTilt size={48} className="text-zinc-300 mx-auto mb-4" />
                <p className="text-zinc-500">Select a segment to preview</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Campaign History */}
      {campaigns.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-8 border border-surface-border shadow-sm mt-8"
        >
          <h2 className="text-xl font-heading font-semibold text-primary mb-6">Campaign History</h2>
          <div className="space-y-4">
            {campaigns.map((campaign, idx) => (
              <div key={campaign.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-zinc-900">{campaign.subject}</h3>
                  <p className="text-sm text-zinc-600">Segment: {campaign.segment_name}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {new Date(campaign.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-heading font-bold text-primary">{campaign.sent_count}</p>
                  <p className="text-xs text-zinc-500">emails sent</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </Layout>
  );
};

export default EmailCampaigns;
