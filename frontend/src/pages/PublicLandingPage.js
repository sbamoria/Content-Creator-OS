import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { CheckCircle } from '@phosphor-icons/react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PublicLandingPage = () => {
  const { pageId } = useParams();
  const [landingPage, setLandingPage] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchLandingPage = async () => {
      try {
        const response = await axios.get(`${API_URL}/landing-pages/${pageId}`);
        setLandingPage(response.data);
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

    fetchLandingPage();
  }, [pageId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(`${API_URL}/leads`, {
        landing_page_id: pageId,
        responses: formData
      });
      setSubmitted(true);
      toast.success('Thank you! We\'ll be in touch soon.');
    } catch (error) {
      toast.error('Failed to submit form');
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
          <p className="text-zinc-600">We've received your information and will contact you soon.</p>
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
        data-testid="public-landing-page"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-surface-border mb-6">
          <h1 className="text-4xl font-heading font-bold text-primary mb-4">{landingPage.course_name}</h1>
          <p className="text-zinc-600 leading-relaxed mb-4">{landingPage.course_description}</p>
          <div className="flex items-center justify-between py-4 border-t border-surface-border">
            <div>
              <p className="text-sm text-zinc-500">Instructor</p>
              <p className="font-medium text-zinc-900">{landingPage.instructor_name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-zinc-500">Price</p>
              <p className="text-2xl font-heading font-bold text-accent">${landingPage.course_price}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-surface-border">
          <h2 className="text-2xl font-heading font-semibold text-primary mb-6">Get Started Today</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={submitting}
              data-testid="submit-lead-form"
              className="w-full bg-accent text-accent-foreground hover:bg-orange-700 shadow-lg shadow-orange-500/20 rounded-full py-4 text-lg font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default PublicLandingPage;
