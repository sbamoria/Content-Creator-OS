import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Plus, Users } from '@phosphor-icons/react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Segments = () => {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingSegment, setEditingSegment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    intent_filter: ''
  });

  const fetchSegments = async () => {
    try {
      const response = await axios.get(`${API_URL}/segments`);
      setSegments(response.data);
    } catch (error) {
      toast.error('Failed to load segments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (editingSegment) {
        await axios.put(`${API_URL}/segments/${editingSegment.id}`, formData);
        toast.success('Segment updated successfully');
      } else {
        await axios.post(`${API_URL}/segments`, formData);
        toast.success('Segment created successfully');
      }
      setShowCreate(false);
      setEditingSegment(null);
      setFormData({ name: '', intent_filter: '' });
      await fetchSegments();
    } catch (error) {
      toast.error(`Failed to ${editingSegment ? 'update' : 'create'} segment`);
    }
  };

  const handleEdit = (segment) => {
    setEditingSegment(segment);
    setFormData({
      name: segment.name,
      intent_filter: segment.intent_filter || ''
    });
    setShowCreate(true);
  };

  return (
    <Layout>
      <div data-testid="segments-page">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-heading font-bold text-primary mb-2">Segments</h1>
            <p className="text-zinc-600">Organize leads into targeted cohorts</p>
          </div>
          <button
            onClick={() => {
              setShowCreate(!showCreate);
              setEditingSegment(null);
              setFormData({ name: '', intent_filter: '' });
            }}
            data-testid="create-segment-button"
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-zinc-800 rounded-full px-6 py-3 font-medium transition-all active:scale-95"
          >
            <Plus size={20} weight="bold" />
            Create Segment
          </button>
        </div>

        {showCreate && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 border border-surface-border shadow-sm mb-6"
          >
            <h2 className="text-xl font-heading font-semibold text-primary mb-4">{editingSegment ? 'Edit Segment' : 'New Segment'}</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-700 mb-2 block">Segment Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="segment-name-input"
                  className="w-full px-4 py-3 bg-surface-input border border-transparent focus:border-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100 rounded-lg transition-all outline-none"
                  placeholder="e.g., High Intent Leads"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 mb-2 block">Intent Filter (Optional)</label>
                <select
                  value={formData.intent_filter}
                  onChange={(e) => setFormData({ ...formData, intent_filter: e.target.value })}
                  data-testid="intent-filter-select"
                  className="w-full px-4 py-3 bg-surface-input border border-transparent focus:border-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100 rounded-lg transition-all outline-none"
                >
                  <option value="">All Leads</option>
                  <option value="high">High Intent Only</option>
                  <option value="medium">Medium Intent Only</option>
                  <option value="low">Low Intent Only</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  data-testid="submit-segment"
                  className="bg-primary text-primary-foreground hover:bg-zinc-800 rounded-full px-6 py-2 font-medium transition-all active:scale-95"
                >
                  {editingSegment ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreate(false);
                    setEditingSegment(null);
                    setFormData({ name: '', intent_filter: '' });
                  }}
                  className="bg-zinc-100 text-zinc-700 hover:bg-zinc-200 rounded-full px-6 py-2 font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-zinc-600">Loading segments...</p>
          </div>
        ) : segments.length === 0 ? (
          <div className="bg-white rounded-xl p-12 border border-surface-border text-center">
            <Users size={48} className="text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-500">No segments created yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {segments.map((segment, idx) => (
              <motion.div
                key={segment.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                data-testid={`segment-card-${idx}`}
                className="bg-white rounded-xl p-6 border border-surface-border shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-heading font-semibold text-primary flex-1">{segment.name}</h3>
                  <div className="flex items-center gap-2">
                    {segment.intent_filter && (
                      <span className="px-2 py-1 rounded-full bg-zinc-100 text-zinc-600 text-xs font-medium">
                        {segment.intent_filter}
                      </span>
                    )}
                    <button
                      onClick={() => handleEdit(segment)}
                      className="text-sm text-zinc-600 hover:text-primary transition-colors"
                      data-testid={`edit-segment-${idx}`}
                    >
                      Edit
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-zinc-600">
                  <Users size={20} />
                  <span className="text-2xl font-heading font-bold text-primary">{segment.lead_ids.length}</span>
                  <span className="text-sm">leads</span>
                </div>
                <p className="text-xs text-zinc-500 mt-4">
                  Created {new Date(segment.created_at).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Segments;
