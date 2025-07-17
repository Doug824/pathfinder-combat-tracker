import React, { useState, useEffect } from 'react';
import { templateService } from '../../services/templateService';
import { bestiaryService } from '../../services/bestiaryService';
import TemplateEditor from './TemplateEditor';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import './Campaign.css';

const TemplateManager = ({ campaign, onClose }) => {
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
    } catch (err) {
      console.error('Error duplicating creature:', err);
      setError('Failed to duplicate creature');
    }
  };

  if (loading) {
    return (
      <div className="template-manager-overlay">
        <div className="template-manager-content">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading templates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="template-manager-overlay">
        <div className="template-manager-content">
          <div className="template-header">
            <h2>Template Manager</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={() => setError('')}>Dismiss</button>
            </div>
          )}

          <div className="template-content">
            <div className="template-section">
              <div className="section-header">
                <h3>Creature Templates</h3>
                <div className="section-actions">
                  <button 
                    className="create-button"
                    onClick={handleCreateTemplate}
                  >
                    Create Template
                  </button>
                  {templates.length === 0 && (
                    <button 
                      className="default-button"
                      onClick={handleCreateDefaultTemplates}
                    >
                      Add Default Templates
                    </button>
                  )}
                </div>
              </div>

              {templates.length === 0 ? (
                <div className="empty-state">
                  <p>No templates created yet. Create your first template or add default templates to get started.</p>
                </div>
              ) : (
                <div className="templates-grid">
                  {templates.map(template => (
                    <div key={template.id} className="template-card">
                      <div className="template-card-header">
                        <h4>{template.name}</h4>
                        <div className="template-actions">
                          <button 
                            onClick={() => handleEditTemplate(template)}
                            className="edit-button"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="delete-button"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="template-description">{template.description}</p>
                      <div className="template-stats">
                        <div className="stat-item">
                          <span className="stat-label">CR:</span>
                          <span className="stat-value">
                            {template.modifications?.challengeRatingModifier > 0 ? '+' : ''}
                            {template.modifications?.challengeRatingModifier || 0}
                          </span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">HP:</span>
                          <span className="stat-value">
                            {template.modifications?.hitPointsModifier > 0 ? '+' : ''}
                            {template.modifications?.hitPointsModifier || 0}
                          </span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">AC:</span>
                          <span className="stat-value">
                            {template.modifications?.armorClassModifier > 0 ? '+' : ''}
                            {template.modifications?.armorClassModifier || 0}
                          </span>
                        </div>
                      </div>
                      {template.modifications?.addedAbilities?.length > 0 && (
                        <div className="template-abilities">
                          <span className="abilities-label">Abilities:</span>
                          <span className="abilities-count">
                            {template.modifications.addedAbilities.length}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="template-section">
              <div className="section-header">
                <h3>Campaign Creatures</h3>
              </div>
              {creatures.length === 0 ? (
                <div className="empty-state">
                  <p>No creatures in campaign bestiary yet.</p>
                </div>
              ) : (
                <div className="creatures-grid">
                  {creatures.map(creature => (
                    <div key={creature.id} className="creature-card">
                      <div className="creature-card-header">
                        <h4>{creature.name}</h4>
                        <div className="creature-actions">
                          <button 
                            onClick={() => handleDuplicateCreature(creature)}
                            className="duplicate-button"
                            title="Duplicate Creature"
                          >
                            ⧉
                          </button>
                          {templates.length > 0 && (
                            <div className="template-apply-dropdown">
                              <button className="apply-template-button">
                                Apply Template ▼
                              </button>
                              <div className="template-dropdown-content">
                                {templates.map(template => (
                                  <button
                                    key={template.id}
                                    onClick={() => handleApplyTemplate(template, creature)}
                                    className="template-option"
                                  >
                                    {template.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="creature-stats">
                        <span className="creature-type">{creature.type}</span>
                        <span className="creature-cr">CR {creature.challenge_rating}</span>
                        <span className="creature-ac">AC {creature.armor_class}</span>
                        <span className="creature-hp">HP {creature.hit_points}</span>
                      </div>
                      {creature.appliedTemplates?.length > 0 && (
                        <div className="applied-templates">
                          <span className="templates-label">Templates:</span>
                          {creature.appliedTemplates.map((appliedTemplate, index) => (
                            <span key={index} className="applied-template-tag">
                              {appliedTemplate.templateName}
                            </span>
                          ))}
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
        <div className="apply-modal-overlay">
          <div className="apply-modal">
            <h3>Apply Template</h3>
            <p>
              Apply <strong>{selectedCreature.template.name}</strong> template to{' '}
              <strong>{selectedCreature.creature.name}</strong>?
            </p>
            <p className="template-preview">
              This will create a new creature with the following modifications:
            </p>
            <ul className="modifications-list">
              {selectedCreature.template.modifications?.challengeRatingModifier !== 0 && (
                <li>Challenge Rating: {selectedCreature.template.modifications.challengeRatingModifier > 0 ? '+' : ''}{selectedCreature.template.modifications.challengeRatingModifier}</li>
              )}
              {selectedCreature.template.modifications?.hitPointsModifier !== 0 && (
                <li>Hit Points: {selectedCreature.template.modifications.hitPointsModifier > 0 ? '+' : ''}{selectedCreature.template.modifications.hitPointsModifier}</li>
              )}
              {selectedCreature.template.modifications?.armorClassModifier !== 0 && (
                <li>Armor Class: {selectedCreature.template.modifications.armorClassModifier > 0 ? '+' : ''}{selectedCreature.template.modifications.armorClassModifier}</li>
              )}
              {selectedCreature.template.modifications?.addedAbilities?.length > 0 && (
                <li>New Abilities: {selectedCreature.template.modifications.addedAbilities.length}</li>
              )}
            </ul>
            <div className="modal-actions">
              <button 
                onClick={() => setShowApplyModal(false)}
                disabled={applying}
                className="cancel-button"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmApply}
                disabled={applying}
                className="confirm-button"
              >
                {applying ? 'Applying...' : 'Apply Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TemplateManager;