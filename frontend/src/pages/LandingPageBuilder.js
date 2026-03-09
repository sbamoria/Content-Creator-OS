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
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [generatedPage, setGeneratedPage] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState('');

  const handleGeneratePreview = async (e) => {
    e.preventDefault();
    setGeneratingPreview(true);

    try {
      // Fetch background image from Unsplash based on course topic
      const keywords = formData.course_name.toLowerCase().split(' ').slice(0, 2).join(' ');
      let bgImage = '';
      
      try {
        const imageResponse = await axios.get(`https://api.unsplash.com/photos/random`, {
          params: {
            query: keywords || 'education',
            orientation: 'landscape',
            client_id: 'FsB7LAAkKBI_kUA0f9FO3SOPbRPzO-eexGhKMEYk-Z0'
          }
        });
        bgImage = imageResponse.data.urls.regular;
      } catch (imgError) {
        console.error('Unsplash error:', imgError);
        bgImage = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200';
      }
      
      setBackgroundImage(bgImage);

      // Generate form fields with AI
      const response = await axios.post(`${API_URL}/landing-pages`, {
        ...formData,
        course_price: parseFloat(formData.course_price)
      });
      
      setPreviewData(response.data);
      toast.success('✨ Preview generated! Review and click "Create Landing Page" to publish.');
    } catch (error) {
      console.error('Preview generation error:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to generate preview';
      toast.error(`❌ Error: ${errorMsg}`);
    } finally {
      setGeneratingPreview(false);
    }
  };

  const handleCreateLandingPage = () => {
    if (!previewData) {
      toast.error('Generate preview first');
      return;
    }
    
    setGeneratedPage(previewData);
    setPreviewData(null);
    toast.success('Landing page created! Share the URL with your audience.');
    setFormData({
      course_name: '',
      course_description: '',
      instructor_name: '',
      target_audience: '',
      course_price: ''
    });
    setBackgroundImage('');
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

            <form onSubmit={handleGeneratePreview} className="space-y-4">
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
                disabled={generatingPreview}
                data-testid="generate-preview-button"
                className="w-full bg-primary text-primary-foreground hover:bg-zinc-800 rounded-full py-3 font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {generatingPreview ? 'Generating Preview...' : 'Generate Preview with AI'}
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-8 border border-surface-border shadow-sm"
          >
            <h2 className="text-xl font-heading font-semibold text-primary mb-6">Preview</h2>

            {previewData ? (
              <div data-testid="preview-section">
                <div 
                  className="bg-cover bg-center rounded-lg p-6 mb-4 relative"
                  style={{ backgroundImage: `url(${backgroundImage})`, minHeight: '200px' }}
                >
                  <div className="absolute inset-0 bg-black/50 rounded-lg"></div>
                  <div className="relative z-10 text-white">
                    <h3 className="text-2xl font-heading font-bold mb-2">{previewData.course_name}</h3>
                    <p className="text-sm mb-3">{previewData.course_description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span>By {previewData.instructor_name}</span>
                      <span className="text-accent font-bold text-lg">${previewData.course_price}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-zinc-700 mb-3">AI-Generated Form Fields:</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {previewData.generated_form_fields.map((field, idx) => (
                      <div key={idx} className="bg-zinc-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-zinc-900">{field.label}</p>
                        <p className="text-xs text-zinc-500">{field.type} {field.required && '(Required)'}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreateLandingPage}
                  data-testid="create-landing-page-button"
                  className="w-full bg-accent text-accent-foreground hover:bg-orange-700 shadow-lg shadow-orange-500/20 rounded-full py-3 font-medium transition-all active:scale-95"
                >
                  Create Landing Page
                </button>
              </div>
            ) : generatedPage ? (
              <div data-testid="generated-page-preview">
                <div 
                  className="bg-cover bg-center rounded-lg p-6 mb-4 relative"
                  style={{ backgroundImage: `url(${backgroundImage})`, minHeight: '200px' }}
                >
                  <div className="absolute inset-0 bg-black/50 rounded-lg"></div>
                  <div className="relative z-10 text-white">
                    <h3 className="text-2xl font-heading font-bold mb-2">{generatedPage.course_name}</h3>
                    <p className="text-sm mb-3">{generatedPage.course_description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span>By {generatedPage.instructor_name}</span>
                      <span className="text-accent font-bold text-lg">${generatedPage.course_price}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-accent/10 rounded-lg p-4">
                  <p className="text-sm font-medium text-zinc-700 mb-2">Public Lead Form URL:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/lead/${generatedPage.id}`}
                      readOnly
                      data-testid="lead-form-url"
                      className="flex-1 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/lead/${generatedPage.id}`);
                        toast.success('URL copied to clipboard!');
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
