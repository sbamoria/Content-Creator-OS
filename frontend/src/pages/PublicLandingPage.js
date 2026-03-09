import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { CheckCircle, VideoCamera } from '@phosphor-icons/react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PublicLandingPage = () => {
  const { pageId } = useParams();
  const [landingPage, setLandingPage] = useState(null);
  const [webinars, setWebinars] = useState([]);
  const [formData, setFormData] = useState({});
  const [selectedWebinar, setSelectedWebinar] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [leadId, setLeadId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/landing-pages/${pageId}`);
        setLandingPage(response.data);
        
        // Fetch webinars for this landing page
        const webinarsRes = await axios.get(`${API_URL}/webinars?landing_page_id=${pageId}`);
        setWebinars(webinarsRes.data);

        // Fetch background image
        const keywords = response.data.course_name.toLowerCase().split(' ').slice(0, 2).join(' ');
        try {
          const imageResponse = await axios.get(`https://api.unsplash.com/photos/random`, {
            params: {
              query: keywords || 'education',
              orientation: 'landscape',
              client_id: 'FsB7LAAkKBI_kUA0f9FO3SOPbRPzO-eexGhKMEYk-Z0'
            }
          });
          setBackgroundImage(imageResponse.data.urls.regular);
        } catch {
          // Fallback image
          setBackgroundImage('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200');
        }
        
        const initialData = {};
        response.data.generated_form_fields.forEach(field => {
          initialData[field.name] = '';
        });
        setFormData(initialData);
      } catch (error) {
        toast.error('Landing page not found');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pageId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Submit lead
      const leadRes = await axios.post(`${API_URL}/leads`, {
        landing_page_id: pageId,
        responses: formData
      });
      
      const newLeadId = leadRes.data.id;
      setLeadId(newLeadId);
      
      // If webinar selected, sign up automatically
      if (selectedWebinar) {
        await axios.post(`${API_URL}/webinars/${selectedWebinar}/signup`, {
          lead_id: newLeadId
        });
        toast.success('Successfully registered for webinar!');
      }
      
      setSubmitted(true);
      toast.success('Thank you for your interest! We\'ll contact you soon.');
    } catch (error) {
      toast.error('Submission failed. Please try again.');
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

  if (!landingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-subtle">
        <div className="text-center">
          <p className="text-zinc-600">Landing page not found</p>
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
          <h2 className="text-3xl font-heading font-bold text-primary mb-3">Thank You!</h2>
          <p className="text-zinc-600 mb-4">We've received your information and will contact you soon.</p>
          {selectedWebinar && (
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
              <VideoCamera size={32} className="text-accent mx-auto mb-2" weight="duotone" />
              <p className="text-sm text-zinc-700">You're also registered for the upcoming webinar!</p>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-subtle">
      {/* Hero Section with Background */}
      <div 
        className="relative bg-cover bg-center py-20 px-6"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/50"></div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto relative z-10 text-center"
        >
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-6">
            {landingPage.course_name}
          </h1>
          <p className="text-xl text-white/90 leading-relaxed mb-8 max-w-2xl mx-auto">
            {landingPage.course_description}
          </p>
          <div className="flex items-center justify-center gap-8 text-white">
            <div>
              <p className="text-sm text-white/70 mb-1">Instructor</p>
              <p className="text-lg font-medium">{landingPage.instructor_name}</p>
            </div>
            <div className="w-px h-12 bg-white/30"></div>
            <div>
              <p className="text-sm text-white/70 mb-1">Investment</p>
              <p className="text-3xl font-heading font-bold text-accent">${landingPage.course_price}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Form Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl mx-auto px-6 py-12"
        data-testid="public-landing-page"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-surface-border">
          <h2 className="text-3xl font-heading font-bold text-primary mb-2">Get Started Today</h2>
          <p className="text-zinc-600 mb-8">Fill out the form below and we'll be in touch with next steps.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {landingPage.generated_form_fields.map((field, idx) => (
              <div key={idx}>
                <label className="text-sm font-medium text-zinc-700 mb-2 block">
                  {field.label} {field.required && <span className="text-accent">*</span>}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    data-testid={`form-field-${field.name}`}
                    className="w-full px-4 py-3 bg-surface-input border border-transparent focus:border-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100 rounded-lg transition-all outline-none"
                    required={field.required}
                  >
                    <option value="">Select...</option>
                    {field.options?.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    data-testid={`form-field-${field.name}`}
                    className="w-full px-4 py-3 bg-surface-input border border-transparent focus:border-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100 rounded-lg transition-all outline-none"
                    rows="4"
                    required={field.required}
                  />
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    data-testid={`form-field-${field.name}`}
                    className="w-full px-4 py-3 bg-surface-input border border-transparent focus:border-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100 rounded-lg transition-all outline-none"
                    required={field.required}
                  />
                )}
              </div>
            ))}

            {/* Webinar Integration */}
            {webinars.length > 0 && (
              <div className="pt-4 border-t border-surface-border">
                <label className="text-sm font-medium text-zinc-700 mb-3 block flex items-center gap-2">
                  <VideoCamera size={20} className="text-accent" weight="duotone" />
                  Sign up for an upcoming webinar (Optional)
                </label>
                <select
                  value={selectedWebinar}
                  onChange={(e) => setSelectedWebinar(e.target.value)}
                  data-testid="webinar-select"
                  className="w-full px-4 py-3 bg-surface-input border border-transparent focus:border-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100 rounded-lg transition-all outline-none"
                >
                  <option value="">No webinar (skip this step)</option>
                  {webinars.map(webinar => (
                    <option key={webinar.id} value={webinar.id}>
                      {webinar.title} - {new Date(webinar.scheduled_date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              data-testid="submit-lead-form"
              className="w-full bg-accent text-accent-foreground hover:bg-orange-700 shadow-lg shadow-orange-500/20 rounded-full py-4 text-lg font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              {submitting ? 'Submitting...' : 'Get Started Now'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default PublicLandingPage;
