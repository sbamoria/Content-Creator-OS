import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Plus, VideoCamera, Users } from '@phosphor-icons/react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const WebinarManager = () => {
  const [webinars, setWebinars] = useState([]);
  const [landingPages, setLandingPages] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    landing_page_id: '',
    title: '',
    description: '',
    scheduled_date: ''
  });
  const [selectedWebinar, setSelectedWebinar] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [followUpData, setFollowUpData] = useState({
    subject: '',
    discount_percent: '',
    bonus_courses: ''
  });
  const [sendingFollowUp, setSendingFollowUp] = useState(false);

  useEffect(() => {
    fetchWebinars();
    fetchLandingPages();
  }, []);

  const fetchWebinars = async () => {
    try {
      const response = await axios.get(`${API_URL}/webinars`);
      setWebinars(response.data);
    } catch (error) {
      toast.error('Failed to load webinars');
    }
  };

  const fetchLandingPages = async () => {
    try {
      const response = await axios.get(`${API_URL}/landing-pages`);
      setLandingPages(response.data);
    } catch (error) {
      console.error('Failed to load landing pages');
    }
  };

  const fetchAttendees = async (webinarId) => {
    try {
      const response = await axios.get(`${API_URL}/webinars/${webinarId}/attendees`);
      setAttendees(response.data);
    } catch (error) {
      toast.error('Failed to load attendees');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/webinars`, formData);
      toast.success('Webinar created successfully');
      setShowCreate(false);
      setFormData({ landing_page_id: '', title: '', description: '', scheduled_date: '' });
      await fetchWebinars();
    } catch (error) {
      toast.error('Failed to create webinar');
    }
  };

  const handleSendFollowUp = async (e) => {
    e.preventDefault();
    setSendingFollowUp(true);
    try {
      const response = await axios.post(`${API_URL}/campaigns/webinar-followup`, {
        webinar_id: selectedWebinar.id,
        ...followUpData,
        discount_percent: parseFloat(followUpData.discount_percent) || 0
      });
      toast.success(response.data.message || 'Follow-up emails sent');
      setFollowUpData({ subject: '', discount_percent: '', bonus_courses: '' });
    } catch (error) {
      toast.error('Failed to send follow-up emails');
    } finally {
      setSendingFollowUp(false);
    }
  };

  const webinarSignupUrl = selectedWebinar ? `${window.location.origin}/webinar/${selectedWebinar.id}` : '';

  return (
    <Layout>
      <div data-testid="webinar-manager">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-heading font-bold text-primary mb-2">Webinar Manager</h1>
            <p className="text-zinc-600">Create and manage live webinars</p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            data-testid="create-webinar-button"
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-zinc-800 rounded-full px-6 py-3 font-medium transition-all active:scale-95"
          >
            <Plus size={20} weight="bold" />
            Create Webinar
          </button>
        </div>

        {showCreate && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 border border-surface-border shadow-sm mb-6"
          >
            <h2 className="text-xl font-heading font-semibold text-primary mb-4">New Webinar</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-700 mb-2 block">Landing Page</label>
                <select
                  value={formData.landing_page_id}
                  onChange={(e) => setFormData({ ...formData, landing_page_id: e.target.value })}
                  data-testid="webinar-landing-page-select"
                  className="w-full px-4 py-3 bg-surface-input border border-transparent focus:border-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100 rounded-lg transition-all outline-none"
                  required
                >
                  <option value="">Select landing page...</option>
                  {landingPages.map(page => (
                    <option key={page.id} value={page.id}>{page.course_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 mb-2 block">Webinar Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  data-testid="webinar-title-input"
                  className="w-full px-4 py-3 bg-surface-input border border-transparent focus:border-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100 rounded-lg transition-all outline-none"
                  placeholder="Live Masterclass: ..."
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 mb-2 block">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  data-testid="webinar-description-input"
                  className="w-full px-4 py-3 bg-surface-input border border-transparent focus:border-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100 rounded-lg transition-all outline-none"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 mb-2 block">Scheduled Date</label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  data-testid="webinar-date-input"
                  className="w-full px-4 py-3 bg-surface-input border border-transparent focus:border-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100 rounded-lg transition-all outline-none"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  data-testid="submit-webinar"
                  className="bg-primary text-primary-foreground hover:bg-zinc-800 rounded-full px-6 py-2 font-medium transition-all active:scale-95"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="bg-zinc-100 text-zinc-700 hover:bg-zinc-200 rounded-full px-6 py-2 font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {webinars.map((webinar, idx) => (
            <motion.div
              key={webinar.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => {
                setSelectedWebinar(webinar);
                fetchAttendees(webinar.id);
              }}
              data-testid={`webinar-card-${idx}`}
              className={`bg-white rounded-xl p-6 border shadow-sm hover:shadow-md transition-all cursor-pointer ${
                selectedWebinar?.id === webinar.id ? 'border-accent' : 'border-surface-border'
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <VideoCamera size={24} className="text-accent" weight="duotone" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-heading font-semibold text-primary mb-1">{webinar.title}</h3>
                  <p className="text-sm text-zinc-600 line-clamp-2">{webinar.description}</p>
                </div>
              </div>
              <p className="text-xs text-zinc-500">
                Scheduled: {new Date(webinar.scheduled_date).toLocaleString()}
              </p>
            </motion.div>
          ))}
        </div>

        {selectedWebinar && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-8 border border-surface-border shadow-sm"
          >
            <h2 className="text-2xl font-heading font-semibold text-primary mb-6">Webinar Details</h2>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-medium text-zinc-700 mb-3">Signup URL</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={webinarSignupUrl}
                    readOnly
                    data-testid="webinar-signup-url"
                    className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(webinarSignupUrl);
                      toast.success('URL copied!');
                    }}
                    className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-zinc-700 mb-3">Attendees</h3>
                <div className="flex items-center gap-2">
                  <Users size={24} className="text-accent" />
                  <span className="text-3xl font-heading font-bold text-primary">{attendees.length}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-surface-border pt-8">
              <h3 className="text-xl font-heading font-semibold text-primary mb-4">Post-Webinar Follow-up</h3>
              <p className="text-sm text-zinc-600 mb-6">Send special offers to attendees who didn't purchase</p>

              <form onSubmit={handleSendFollowUp} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-zinc-700 mb-2 block">Email Subject</label>
                  <input
                    type="text"
                    value={followUpData.subject}
                    onChange={(e) => setFollowUpData({ ...followUpData, subject: e.target.value })}
                    data-testid="followup-subject-input"
                    className="w-full px-4 py-3 bg-surface-input border border-transparent focus:border-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100 rounded-lg transition-all outline-none"
                    placeholder="Exclusive Offer Just For You"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-zinc-700 mb-2 block">Discount %</label>
                    <input
                      type="number"
                      step="0.01"
                      value={followUpData.discount_percent}
                      onChange={(e) => setFollowUpData({ ...followUpData, discount_percent: e.target.value })}
                      data-testid="discount-input"
                      className="w-full px-4 py-3 bg-surface-input border border-transparent focus:border-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100 rounded-lg transition-all outline-none"
                      placeholder="20"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-zinc-700 mb-2 block">Bonus Courses</label>
                    <input
                      type="text"
                      value={followUpData.bonus_courses}
                      onChange={(e) => setFollowUpData({ ...followUpData, bonus_courses: e.target.value })}
                      data-testid="bonus-input"
                      className="w-full px-4 py-3 bg-surface-input border border-transparent focus:border-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100 rounded-lg transition-all outline-none"
                      placeholder="Free bonus module"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={sendingFollowUp}
                  data-testid="send-followup-button"
                  className="bg-accent text-accent-foreground hover:bg-orange-700 shadow-lg shadow-orange-500/20 rounded-full px-8 py-3 font-medium transition-all active:scale-95 disabled:opacity-50"
                >
                  {sendingFollowUp ? 'Sending...' : 'Send Follow-up Emails'}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default WebinarManager;
