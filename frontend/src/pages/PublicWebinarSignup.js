import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { CheckCircle, VideoCamera } from '@phosphor-icons/react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PublicWebinarSignup = () => {
  const { webinarId } = useParams();
  const [webinar, setWebinar] = useState(null);
  const [landingPage, setLandingPage] = useState(null);
  const [leads, setLeads] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchWebinar = async () => {
      try {
        const response = await axios.get(`${API_URL}/webinars/${webinarId}`);
        setWebinar(response.data);

        // Fetch landing page
        const pageResponse = await axios.get(`${API_URL}/landing-pages/${response.data.landing_page_id}`);
        setLandingPage(pageResponse.data);

        // Fetch leads for this landing page
        const leadsResponse = await axios.get(`${API_URL}/leads?landing_page_id=${response.data.landing_page_id}`);
        setLeads(leadsResponse.data);
      } catch (error) {
        toast.error('Webinar not found');
      } finally {
        setLoading(false);
      }
    };

    fetchWebinar();
  }, [webinarId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(`${API_URL}/webinars/${webinarId}/signup`, {
        lead_id: selectedLeadId
      });
      setSubmitted(true);
      toast.success('You\'re registered for the webinar!');
    } catch (error) {
      toast.error('Failed to register');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-subtle">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!webinar) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-subtle">
        <div className="text-center">
          <p className="text-zinc-600">Webinar not found</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-subtle p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <CheckCircle size={64} className="text-emerald-500 mx-auto mb-4" weight="duotone" />
          <h2 className="text-3xl font-heading font-bold text-primary mb-3">You're Registered!</h2>
          <p className="text-zinc-600 mb-4">We'll send you the webinar link closer to the date.</p>
          <div className="bg-white rounded-lg p-4 border border-surface-border">
            <p className="text-sm text-zinc-500 mb-1">Scheduled for</p>
            <p className="text-lg font-heading font-semibold text-primary">
              {new Date(webinar.scheduled_date).toLocaleString()}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-subtle py-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
        data-testid="public-webinar-signup"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-surface-border mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center">
              <VideoCamera size={32} className="text-accent" weight="duotone" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold text-primary mb-1">{webinar.title}</h1>
              <p className="text-sm text-zinc-500">{new Date(webinar.scheduled_date).toLocaleString()}</p>
            </div>
          </div>

          <p className="text-zinc-600 leading-relaxed mb-6">{webinar.description}</p>

          {landingPage && (
            <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-200">
              <p className="text-sm font-medium text-zinc-700 mb-2">Course Details</p>
              <h3 className="text-lg font-heading font-semibold text-primary mb-1">{landingPage.course_name}</h3>
              <p className="text-sm text-zinc-600">{landingPage.course_description}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-surface-border">
          <h2 className="text-2xl font-heading font-semibold text-primary mb-6">Reserve Your Spot</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-2 block">
                Select Your Profile <span className="text-accent">*</span>
              </label>
              <p className="text-xs text-zinc-500 mb-3">
                If you've already submitted your interest, select your profile below. Otherwise, please fill out the landing page form first.
              </p>
              <select
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                data-testid="lead-select"
                className="w-full px-4 py-3 bg-surface-input border border-transparent focus:border-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100 rounded-lg transition-all outline-none"
                required
              >
                <option value="">Choose your profile...</option>
                {leads.map(lead => (
                  <option key={lead.id} value={lead.id}>
                    {lead.responses.full_name || lead.responses.name || 'Anonymous'} ({lead.responses.email})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              data-testid="submit-webinar-signup"
              className="w-full bg-accent text-accent-foreground hover:bg-orange-700 shadow-lg shadow-orange-500/20 rounded-full py-4 text-lg font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {submitting ? 'Registering...' : 'Register for Webinar'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default PublicWebinarSignup;
