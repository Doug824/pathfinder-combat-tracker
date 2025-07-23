import React, { useState, useEffect } from 'react';
import { templateService } from '../../services/templateService';
import { bestiaryService } from '../../services/bestiaryService';
import TemplateEditor from './TemplateEditor';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import './Campaign.css';

const TemplateManager = ({ campaign, onClose, onCreatureCreated }) => {
  const { currentUser } = useFirebaseAuth();
  const [templates, setTemplates] = useState([]);
  const [creatures, setCreatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [selectedCreature, setSelectedCreature] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);

  // Load templates and creatures
  useEffect(() => {
    loadData();
  }, [campaign.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [templatesData, creaturesData] = await Promise.all([
        templateService.getCampaignTemplates(campaign.id),
        bestiaryService.getCampaignCreatures(campaign.id)
      ]);
      
      setTemplates(templatesData);
      setCreatures(creaturesData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load templates and creatures');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowEditor(true);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await templateService.deleteTemplate(campaign.id, templateId);
        setTemplates(prev => prev.filter(t => t.id !== templateId));
      } catch (err) {
        console.error('Error deleting template:', err);
        setError('Failed to delete template');
      }
    }
  };

  const handleSaveTemplate = async (templateData) => {
    try {
      if (editingTemplate) {
        const updatedTemplate = await templateService.updateTemplate(
          campaign.id,
          editingTemplate.id,
          templateData
        );
        setTemplates(prev => prev.map(t => 
          t.id === editingTemplate.id ? { ...t, ...updatedTemplate } : t
        ));
      } else {
        const newTemplate = await templateService.addTemplate(
          campaign.id,
          templateData,
          currentUser.uid
        );
        setTemplates(prev => [newTemplate, ...prev]);
      }
      setShowEditor(false);
      setEditingTemplate(null);
    } catch (err) {
      console.error('Error saving template:', err);
      throw err;
    }
  };

  const handleCreateDefaultTemplates = async () => {
    try {
      const defaultTemplates = templateService.getDefaultTemplates();
      const promises = defaultTemplates.map(templateData => 
        templateService.addTemplate(campaign.id, templateData, currentUser.uid)
      );
      
      const newTemplates = await Promise.all(promises);
      setTemplates(prev => [...newTemplates, ...prev]);
    } catch (err) {
      console.error('Error creating default templates:', err);
      setError('Failed to create default templates');
    }
  };

  const handleApplyTemplate = (template, creature) => {
    setSelectedCreature({ template, creature });
    setShowApplyModal(true);
  };

  const handleConfirmApply = async () => {
    if (!selectedCreature) return;
    
    try {
      setApplying(true);
      const { template, creature } = selectedCreature;
      
      // Apply template to creature
      const modifiedCreature = templateService.applyTemplateToCreature(creature, template);
      
      // Save the modified creature as a new creature
      const savedCreature = await bestiaryService.addCreature(
        campaign.id,
        modifiedCreature,
        currentUser.uid
      );
      
      setCreatures(prev => [savedCreature, ...prev]);
      setShowApplyModal(false);
      setSelectedCreature(null);
      
      // Refresh the main bestiary
      if (onCreatureCreated) {
        onCreatureCreated();
      }
    } catch (err) {
      console.error('Error applying template:', err);
      setError('Failed to apply template to creature');
    } finally {
      setApplying(false);
    }
  };

  const handleDuplicateCreature = async (creature) => {
    try {
      // Create a clean copy of the creature without Firebase-specific fields
      const {
        id,
        uploadedAt,
        createdAt,
        updatedAt,
        ...cleanCreature
      } = creature;
      
      const duplicatedCreature = {
        ...cleanCreature,
        name: `${creature.name} (Copy)`,
        appliedTemplates: creature.appliedTemplates || []
      };
      
      const savedCreature = await bestiaryService.addCreature(
        campaign.id,
        duplicatedCreature,
        currentUser.uid
      );
      
      setCreatures(prev => [savedCreature, ...prev]);
      
      // Refresh the main bestiary
      if (onCreatureCreated) {
        onCreatureCreated();
      }
    } catch (err) {
      console.error('Error duplicating creature:', err);
      setError('Failed to duplicate creature');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-black/60 backdrop-blur-md rounded-lg border-2 border-amber-700/50 p-8">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-amber-700/30 border-t-amber-400 rounded-full animate-spin mb-4"></div>
            <p className="text-amber-300 text-lg font-fantasy">Loading templates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-black/60 backdrop-blur-md rounded-lg border-2 border-amber-700/50 max-w-7xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-amber-700/30 sticky top-0 bg-black/60 backdrop-blur-md z-10">
            <h2 className="text-3xl font-fantasy font-bold text-amber-400">Template Manager</h2>
            <button 
              className="text-amber-300 hover:text-amber-100 text-3xl leading-none transition-colors duration-300"
              onClick={onClose}
            >
              ×
            </button>
          </div>

          {error && (
            <div className="bg-red-900/60 border border-red-700/50 rounded-lg p-4 m-6">
              <p className="text-red-300 mb-2">{error}</p>
              <button 
                onClick={() => setError('')}
                className="bg-red-700/80 hover:bg-red-600/90 text-red-100 px-3 py-1 rounded transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="p-6">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-fantasy font-bold text-amber-400">Creature Templates</h3>
                <div className="flex gap-3">
                  <button 
                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-4 py-2 rounded-lg font-fantasy font-semibold transition-all duration-300 transform hover:scale-105"
                    onClick={handleCreateTemplate}
                  >
                    ➕ Create Template
                  </button>
                  {templates.length === 0 && (
                    <button 
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-fantasy font-semibold transition-all duration-300 transform hover:scale-105"
                      onClick={handleCreateDefaultTemplates}
                    >
                      📋 Add Default Templates
                    </button>
                  )}
                </div>
              </div>

              {templates.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-8xl mb-6 text-amber-400">🔧</div>
                  <h4 className="text-2xl font-fantasy font-bold text-amber-400 mb-4">No Templates Yet</h4>
                  <p className="text-amber-300 text-lg">Create your first template or add default templates to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map(template => (
                    <div key={template.id} className="bg-black/40 backdrop-blur-md rounded-lg border border-amber-700/30 p-4 hover:bg-black/60 transition-all duration-200">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-lg font-fantasy font-bold text-amber-300">{template.name}</h4>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditTemplate(template)}
                            className="text-amber-400 hover:text-amber-300 w-7 h-7 rounded-full hover:bg-amber-900/50 transition-all duration-200 flex items-center justify-center"
                            title="Edit Template"
                          >
                            ✎
                          </button>
                          <button 
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="text-red-400 hover:text-red-300 w-7 h-7 rounded-full hover:bg-red-900/50 transition-all duration-200 flex items-center justify-center"
                            title="Delete Template"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      <p className="text-amber-200/80 text-sm mb-4">{template.description}</p>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-black/30 rounded border border-amber-700/20 p-2 text-center">
                          <span className="text-amber-400 text-xs font-fantasy font-semibold block">CR</span>
                          <span className="text-amber-100 font-fantasy">
                            {template.modifications?.challengeRatingModifier > 0 ? '+' : ''}
                            {template.modifications?.challengeRatingModifier || 0}
                          </span>
                        </div>
                        <div className="bg-black/30 rounded border border-amber-700/20 p-2 text-center">
                          <span className="text-amber-400 text-xs font-fantasy font-semibold block">HP</span>
                          <span className="text-amber-100 font-fantasy">
                            {template.modifications?.hitPointsModifier > 0 ? '+' : ''}
                            {template.modifications?.hitPointsModifier || 0}
                          </span>
                        </div>
                        <div className="bg-black/30 rounded border border-amber-700/20 p-2 text-center">
                          <span className="text-amber-400 text-xs font-fantasy font-semibold block">AC</span>
                          <span className="text-amber-100 font-fantasy">
                            {template.modifications?.armorClassModifier > 0 ? '+' : ''}
                            {template.modifications?.armorClassModifier || 0}
                          </span>
                        </div>
                      </div>
                      {template.modifications?.addedAbilities?.length > 0 && (
                        <div className="bg-emerald-900/30 border border-emerald-600/50 rounded p-2">
                          <span className="text-emerald-300 text-xs font-fantasy font-semibold">Abilities: </span>
                          <span className="text-emerald-100 font-fantasy font-bold">
                            {template.modifications.addedAbilities.length}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-amber-700/30 pt-8">
              <div className="mb-6">
                <h3 className="text-2xl font-fantasy font-bold text-amber-400">Campaign Creatures</h3>
                <p className="text-amber-300 text-sm">Apply templates to existing creatures or duplicate them</p>
              </div>
              {creatures.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-8xl mb-6 text-amber-400">🐉</div>
                  <h4 className="text-2xl font-fantasy font-bold text-amber-400 mb-4">No Creatures</h4>
                  <p className="text-amber-300 text-lg">No creatures in campaign bestiary yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {creatures.map(creature => (
                    <div key={creature.id} className="bg-black/40 backdrop-blur-md rounded-lg border border-amber-700/30 p-4 hover:bg-black/60 transition-all duration-200">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-lg font-fantasy font-bold text-amber-300">{creature.name}</h4>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleDuplicateCreature(creature)}
                            className="text-blue-400 hover:text-blue-300 w-7 h-7 rounded-full hover:bg-blue-900/50 transition-all duration-200 flex items-center justify-center"
                            title="Duplicate Creature"
                          >
                            ⧉
                          </button>
                          {templates.length > 0 && (
                            <div className="relative group">
                              <button className="text-purple-400 hover:text-purple-300 px-3 py-1 rounded border border-purple-600/50 hover:bg-purple-900/50 transition-all duration-200 text-sm font-fantasy">
                                Apply Template ▼
                              </button>
                              <div className="absolute right-0 top-full mt-1 bg-black/80 backdrop-blur-md border border-amber-700/30 rounded-lg shadow-lg z-20 min-w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                {templates.map(template => (
                                  <button
                                    key={template.id}
                                    onClick={() => handleApplyTemplate(template, creature)}
                                    className="block w-full text-left px-3 py-2 text-amber-200 hover:bg-amber-700/20 transition-colors first:rounded-t-lg last:rounded-b-lg"
                                  >
                                    {template.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-black/30 rounded border border-amber-700/20 p-2">
                          <span className="text-amber-400 text-xs font-fantasy font-semibold block">{creature.type}</span>
                          <span className="text-amber-100 text-sm font-fantasy">CR {creature.challenge_rating}</span>
                        </div>
                        <div className="bg-black/30 rounded border border-amber-700/20 p-2">
                          <span className="text-amber-400 text-xs font-fantasy font-semibold block">AC {creature.armor_class}</span>
                          <span className="text-amber-100 text-sm font-fantasy">HP {creature.hit_points}</span>
                        </div>
                      </div>
                      {creature.appliedTemplates?.length > 0 && (
                        <div className="bg-purple-900/30 border border-purple-600/50 rounded p-2">
                          <span className="text-purple-300 text-xs font-fantasy font-semibold block mb-1">Applied Templates:</span>
                          <div className="flex flex-wrap gap-1">
                            {creature.appliedTemplates.map((appliedTemplate, index) => (
                              <span key={index} className="bg-purple-700/60 text-purple-100 px-2 py-1 rounded text-xs font-fantasy">
                                {appliedTemplate.templateName}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showEditor && (
        <TemplateEditor
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onClose={() => {
            setShowEditor(false);
            setEditingTemplate(null);
          }}
        />
      )}

      {showApplyModal && selectedCreature && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-black/60 backdrop-blur-md rounded-lg border-2 border-amber-700/50 max-w-lg w-full mx-4">
            <div className="p-6">
              <h3 className="text-2xl font-fantasy font-bold text-amber-400 mb-4">Apply Template</h3>
              <p className="text-amber-200 mb-4">
                Apply <strong className="text-amber-100">{selectedCreature.template.name}</strong> template to{' '}
                <strong className="text-amber-100">{selectedCreature.creature.name}</strong>?
              </p>
              <p className="text-amber-300 text-sm mb-3">
                This will create a new creature with the following modifications:
              </p>
              <div className="bg-black/40 rounded-lg border border-amber-700/30 p-4 mb-6">
                <ul className="space-y-2">
                  {selectedCreature.template.modifications?.challengeRatingModifier !== 0 && (
                    <li className="text-amber-200 flex justify-between">
                      <span>Challenge Rating:</span>
                      <span className="font-fantasy font-bold">{selectedCreature.template.modifications.challengeRatingModifier > 0 ? '+' : ''}{selectedCreature.template.modifications.challengeRatingModifier}</span>
                    </li>
                  )}
                  {selectedCreature.template.modifications?.hitPointsModifier !== 0 && (
                    <li className="text-amber-200 flex justify-between">
                      <span>Hit Points:</span>
                      <span className="font-fantasy font-bold">{selectedCreature.template.modifications.hitPointsModifier > 0 ? '+' : ''}{selectedCreature.template.modifications.hitPointsModifier}</span>
                    </li>
                  )}
                  {selectedCreature.template.modifications?.armorClassModifier !== 0 && (
                    <li className="text-amber-200 flex justify-between">
                      <span>Armor Class:</span>
                      <span className="font-fantasy font-bold">{selectedCreature.template.modifications.armorClassModifier > 0 ? '+' : ''}{selectedCreature.template.modifications.armorClassModifier}</span>
                    </li>
                  )}
                  {selectedCreature.template.modifications?.addedAbilities?.length > 0 && (
                    <li className="text-amber-200 flex justify-between">
                      <span>New Abilities:</span>
                      <span className="font-fantasy font-bold">{selectedCreature.template.modifications.addedAbilities.length}</span>
                    </li>
                  )}
                </ul>
              </div>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setShowApplyModal(false)}
                  disabled={applying}
                  className="bg-gray-700/80 hover:bg-gray-600/90 text-gray-100 px-6 py-2 rounded-lg font-fantasy font-semibold transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmApply}
                  disabled={applying}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-6 py-2 rounded-lg font-fantasy font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying ? 'Applying...' : 'Apply Template'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TemplateManager;