import React, { useState } from 'react';
import { getUIIcon, getDiceIcon, getCampaignIcon, getStoryIcon } from '../../utils/epicIcons';
import './HeroLandingPage.css';

const HeroLandingPage = ({ onGetStarted }) => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      id: 'campaign',
      icon: getCampaignIcon('adventure'),
      title: 'Epic Campaign Management',
      description: 'Organize your adventures with powerful tools for world-building, NPCs, and story tracking.',
      benefits: ['Hierarchical note organization', 'Real-time collaboration', 'Rich campaign timeline']
    },
    {
      id: 'creatures',
      icon: '🐲',
      title: 'Advanced Creature Library',
      description: 'Build, manage, and deploy creatures with intelligent PDF parsing and template systems.',
      benefits: ['Automated stat block parsing', 'Creature templates', 'Combat-ready cards']
    },
    {
      id: 'characters',
      icon: '🧙‍♂️',
      title: 'Character Excellence',
      description: 'Complete character management with dynamic stat tracking and combat abilities.',
      benefits: ['Real-time stat calculations', 'Gear and buff management', 'Combat ability tracking']
    },
    {
      id: 'collaboration',
      icon: '🤝',
      title: 'Seamless Collaboration',
      description: 'Connect players and DMs with real-time updates and shared campaign access.',
      benefits: ['Multi-user campaigns', 'Role-based permissions', 'Instant synchronization']
    }
  ];

  const testimonials = [
    {
      name: 'Sarah the Chronicler',
      role: 'Veteran DM',
      quote: 'Hero\'s Ledger transformed how I run my campaigns. The organization tools are incredible!',
      rating: 5
    },
    {
      name: 'Marcus Stormwind',
      role: 'Player & DM',
      quote: 'Finally, a tool that understands the epic nature of our adventures. Simply outstanding.',
      rating: 5
    },
    {
      name: 'Luna Nightweaver',
      role: 'Campaign Organizer',
      quote: 'The collaboration features made our remote games feel like we\'re all at the same table.',
      rating: 5
    }
  ];

  const stats = [
    { value: 'Beta', label: 'Development Stage' },
    { value: 'Free', label: 'Forever' },
    { value: 'Open', label: 'Source' },
    { value: 'Epic', label: 'Adventures' }
  ];

  return (
    <div className="hero-landing">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">{getDiceIcon('d20')}</span>
            <span>The Ultimate Pathfinder Companion</span>
          </div>
          
          <h1 className="hero-title">
            Forge <span className="gradient-text">Legendary</span> Adventures
          </h1>
          
          <p className="hero-description">
            Hero's Ledger is the premier campaign management platform for Pathfinder and D&D. 
            Build worlds, manage creatures, track characters, and create unforgettable adventures 
            with tools designed for epic storytelling.
          </p>
          
          <div className="hero-actions">
            <button 
              className="epic-button hero-cta"
              onClick={onGetStarted}
            >
              <span className="button-icon">⚔️</span>
              Begin Your Adventure
            </button>
            
            <button className="demo-button">
              <span className="button-icon">{getUIIcon('info')}</span>
              Watch Demo
            </button>
          </div>
          
          <div className="hero-stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="hero-cards">
            <div className="hero-card creature-card-demo">
              <div className="card-header">
                <span className="card-icon">🐲</span>
                <h3>Ancient Red Dragon</h3>
              </div>
              <div className="card-stats">
                <span className="cr-badge">CR 17</span>
                <span className="hp-badge">546 HP</span>
              </div>
              <div className="card-content">
                <div className="stat-line">
                  <strong>AC:</strong> 22 | <strong>Speed:</strong> 40 ft, fly 80 ft
                </div>
                <div className="stat-line">
                  <strong>STR:</strong> 30 | <strong>DEX:</strong> 10 | <strong>CON:</strong> 29
                </div>
                <div className="abilities">
                  <strong>Fire Breath:</strong> 70 ft cone, 91 (26d6) fire damage
                </div>
              </div>
            </div>
            
            <div className="hero-card character-card-demo">
              <div className="card-header">
                <span className="card-icon">🧙‍♂️</span>
                <h3>Valeria Stormcaller</h3>
              </div>
              <div className="card-stats">
                <span className="level-badge">Level 12</span>
                <span className="class-badge">Wizard</span>
              </div>
              <div className="card-content">
                <div className="stat-line">
                  <strong>HP:</strong> 78/78 | <strong>AC:</strong> 15 | <strong>Speed:</strong> 30 ft
                </div>
                <div className="stat-line">
                  <strong>Spells:</strong> Fireball, Lightning Bolt, Counterspell
                </div>
              </div>
            </div>
            
            <div className="hero-card note-card-demo">
              <div className="card-header">
                <span className="card-icon">📜</span>
                <h3>The Lost Crown</h3>
              </div>
              <div className="card-content">
                <p><strong>Location:</strong> Shadowfell Ruins</p>
                <p><strong>Clue:</strong> "Where shadows dance and ancients weep, the crown of kings lies buried deep."</p>
                <p><strong>Reward:</strong> +3 Crown of Command</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Powerful Tools for Epic Adventures</h2>
          <p>Everything you need to create, manage, and run legendary campaigns</p>
        </div>
        
        <div className="features-showcase">
          <div className="feature-tabs">
            {features.map((feature, index) => (
              <button
                key={feature.id}
                className={`feature-tab ${activeFeature === index ? 'active' : ''}`}
                onClick={() => setActiveFeature(index)}
              >
                <span className="tab-icon">{feature.icon}</span>
                <span className="tab-title">{feature.title}</span>
              </button>
            ))}
          </div>
          
          <div className="feature-content">
            <div className="feature-info">
              <h3>{features[activeFeature].title}</h3>
              <p>{features[activeFeature].description}</p>
              <ul className="feature-benefits">
                {features[activeFeature].benefits.map((benefit, index) => (
                  <li key={index}>
                    <span className="benefit-icon">{getUIIcon('success')}</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="feature-visual">
              <div className="feature-mockup">
                <div className="mockup-header">
                  <div className="mockup-controls">
                    <span className="control"></span>
                    <span className="control"></span>
                    <span className="control"></span>
                  </div>
                  <div className="mockup-title">Hero's Ledger</div>
                </div>
                <div className="mockup-content">
                  <div className="mockup-feature">
                    <span className="feature-icon">{features[activeFeature].icon}</span>
                    <div className="feature-text">
                      <h4>{features[activeFeature].title}</h4>
                      <p>Experience the power of organized campaign management</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2>Loved by Adventurers Everywhere</h2>
          <p>Join thousands of DMs and players who've elevated their campaigns</p>
        </div>
        
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="star">⭐</span>
                ))}
              </div>
              <blockquote className="testimonial-quote">
                "{testimonial.quote}"
              </blockquote>
              <div className="testimonial-author">
                <strong>{testimonial.name}</strong>
                <span className="author-role">{testimonial.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Begin Your Epic Journey?</h2>
          <p>Join thousands of adventurers who've transformed their campaigns with Hero's Ledger</p>
          
          <div className="cta-actions">
            <button 
              className="epic-button cta-primary"
              onClick={onGetStarted}
            >
              <span className="button-icon">🎲</span>
              Start Your Adventure
            </button>
            
            <div className="cta-features">
              <div className="cta-feature">
                <span className="feature-icon">{getUIIcon('success')}</span>
                <span>Free to start</span>
              </div>
              <div className="cta-feature">
                <span className="feature-icon">{getUIIcon('success')}</span>
                <span>No credit card required</span>
              </div>
              <div className="cta-feature">
                <span className="feature-icon">{getUIIcon('success')}</span>
                <span>Ready in minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroLandingPage;