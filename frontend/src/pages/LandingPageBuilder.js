import { useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Sparkle } from '@phosphor-icons/react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LandingPageBuilder = () => {
  const [formData, setFormData] = useState({
    course_name: '',
    course_description: '',
    instructor_name: '',
    target_audience: '',
    course_price: ''
  });
  const [loading, setLoading] = useState(false);
  const [generatedPage, setGeneratedPage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/landing-pages`, {
        ...formData,
        course_price: parseFloat(formData.course_price)
      });
      setGeneratedPage(response.data);
      toast.success('Landing page created with AI-generated form!');
      setFormData({
        course_name: '',
        course_description: '',
        instructor_name: '',
        target_audience: '',
        course_price: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create landing page');
    } finally {
      setLoading(false);
    }
  };

  const leadFormUrl = generatedPage ? `${window.location.origin}/lead/${generatedPage.id}` : '';

  return (
    <Layout>
      <div data-testid="landing-page-builder">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-primary mb-2">Landing Page Builder</h1>
          <p className="text-zinc-600">AI will generate a custom lead capture form based on your course details</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-8 border border-surface-border shadow-sm"
          >
            <div className="flex items-center gap-2 mb-6">
              <Sparkle size={24} className="text-accent" weight="duotone" />
              <h2 className="text-xl font-heading font-semibold text-primary">Course Details</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-700 mb-2 block">Course Name</label>
                <input
                  type="text"
                  value={formData.course_name}
                  onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                  data-testid="course-name-input"
                  className="w-full px-4 py-3 bg-surface-input border border-transparent focus:border-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100 rounded-lg transition-all outline-none"
                  placeholder="e.g., Master Python Programming"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 mb-2 block">Course Description</label>
                <textarea
                  value={formData.course_description}
                  onChange={(e) => setFormData({ ...formData, course_description: e.target.value })}
                  data-testid="course-description-input"
                  className="w-full px-4 py-3 bg-surface-input border border-transparent focus:border-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100 rounded-lg transition-all outline-none"
                  rows="4"
                  placeholder="Describe what students will learn..."
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 mb-2 block">Instructor Name</label>
                <input
                  type="text"
                  value={formData.instructor_name}
                  onChange={(e) => setFormData({ ...formData, instructor_name: e.target.value })}
                  data-testid="instructor-name-input"
                  className="w-full px-4 py-3 bg-surface-input border border-transparent focus:border-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100 rounded-lg transition-all outline-none"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 mb-2 block">Target Audience</label>
                <input
                  type="text"
                  value={formData.target_audience}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                  data-testid="target-audience-input"
                  className="w-full px-4 py-3 bg-surface-input border border-transparent focus:border-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100 rounded-lg transition-all outline-none"
                  placeholder="e.g., Beginner developers"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 mb-2 block">Course Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.course_price}
                  onChange={(e) => setFormData({ ...formData, course_price: e.target.value })}
                  data-testid="course-price-input"
                  className="w-full px-4 py-3 bg-surface-input border border-transparent focus:border-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100 rounded-lg transition-all outline-none"
                  placeholder="99.00"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                data-testid="generate-landing-page-button"
                className="w-full bg-primary text-primary-foreground hover:bg-zinc-800 rounded-full py-3 font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? 'Generating with AI...' : 'Generate Landing Page'}
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-8 border border-surface-border shadow-sm"
          >
            <h2 className="text-xl font-heading font-semibold text-primary mb-6">Preview</h2>

            {generatedPage ? (
              <div data-testid="generated-page-preview">
                <div className="bg-zinc-50 rounded-lg p-6 mb-4">
                  <h3 className="text-lg font-heading font-semibold text-primary mb-2">{generatedPage.course_name}</h3>
                  <p className="text-sm text-zinc-600 mb-3">{generatedPage.course_description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-600">By {generatedPage.instructor_name}</span>
                    <span className="text-accent font-bold">${generatedPage.course_price}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-zinc-700 mb-3">AI-Generated Form Fields:</h4>
                  <div className="space-y-2">
                    {generatedPage.generated_form_fields.map((field, idx) => (
                      <div key={idx} className="bg-zinc-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-zinc-900">{field.label}</p>
                        <p className="text-xs text-zinc-500">{field.type} {field.required && '(Required)'}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-accent/10 rounded-lg p-4">
                  <p className="text-sm font-medium text-zinc-700 mb-2">Public Lead Form URL:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={leadFormUrl}
                      readOnly
                      data-testid="lead-form-url"
                      className="flex-1 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(leadFormUrl);
                        toast.success('URL copied!');
                      }}
                      data-testid="copy-url-button"
                      className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-xs font-medium hover:bg-orange-700 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Sparkle size={48} className="text-zinc-300 mx-auto mb-4" />
                <p className="text-zinc-500">Fill out the form to generate your landing page</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default LandingPageBuilder;
