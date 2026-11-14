import React from 'react';
import { PhraseItem } from '../types/index';
import Phrases from './Phrases';
import { FaCalculator, FaClock, FaLightbulb, FaInfoCircle } from 'react-icons/fa';

interface NumbersAndTimeProps {
  numbersData: PhraseItem[];
  timeData: PhraseItem[];
  activeTab: 'numbers' | 'time';
  onTabChange: (tab: 'numbers' | 'time') => void;
}

const NumbersAndTime: React.FC<NumbersAndTimeProps> = ({
  numbersData,
  timeData,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="numbers-and-time-section">
      <div className="section-tab-container">
        <div className="section-tab-bar" role="tablist" aria-label="Numbers and Time Navigation">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'numbers'}
            className={`section-tab-btn ${activeTab === 'numbers' ? 'active' : ''}`}
            onClick={() => onTabChange('numbers')}
          >
            <FaCalculator className="tab-btn-icon" aria-hidden="true" />
            <span>Numbers</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'time'}
            className={`section-tab-btn ${activeTab === 'time' ? 'active' : ''}`}
            onClick={() => onTabChange('time')}
          >
            <FaClock className="tab-btn-icon" aria-hidden="true" />
            <span>Telling Time</span>
          </button>
        </div>
      </div>

      {activeTab === 'numbers' && (
        <div className="time-grammar-guide">
          <div className="guide-header">
            <FaLightbulb className="guide-icon" aria-hidden="true" />
            <h3>French Counting Tips (70, 80 &amp; 90)</h3>
          </div>
          <div className="guide-grid">
            <div className="guide-card">
              <span className="guide-badge">70–79</span>
              <h4>Base-60 (Soixante-dix)</h4>
              <p>In standard French, 70 combines 60 + 10:</p>
              <ul>
                <li><strong>70:</strong> <em>soixante-dix</em> (60 + 10)</li>
                <li><strong>71:</strong> <em>soixante-et-onze</em> (60 + 11)</li>
                <li><strong>75:</strong> <em>soixante-quinze</em> (60 + 15)</li>
              </ul>
            </div>

            <div className="guide-card">
              <span className="guide-badge">80–89</span>
              <h4>Four Twenties (Quatre-vingts)</h4>
              <p>80 literally means &quot;four twenties&quot; (4 × 20):</p>
              <ul>
                <li><strong>80:</strong> <em>quatre-vingts</em> (keeps final -s)</li>
                <li><strong>81:</strong> <em>quatre-vingt-un</em> (drops -s before numbers)</li>
              </ul>
            </div>

            <div className="guide-card">
              <span className="guide-badge">90–99</span>
              <h4>80 + Teen (Quatre-vingt-dix)</h4>
              <p>90 builds on 80 plus 10–19:</p>
              <ul>
                <li><strong>90:</strong> <em>quatre-vingt-dix</em> (80 + 10)</li>
                <li><strong>95:</strong> <em>quatre-vingt-quinze</em> (80 + 15)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'time' && (
        <div className="time-grammar-guide">
          <div className="guide-header">
            <FaLightbulb className="guide-icon" aria-hidden="true" />
            <h3>French Time Grammar Rules</h3>
          </div>
          <div className="guide-grid">
            <div className="guide-card">
              <span className="guide-badge">Rule 1</span>
              <h4>Il est ... heure(s)</h4>
              <p>Always include <em>heure</em> (singular for 1:00, plural for 2+):</p>
              <ul>
                <li><strong>1:00:</strong> <em>Il est une heure</em></li>
                <li><strong>2:00+:</strong> <em>Il est deux heures</em></li>
                <li><strong>12:00:</strong> <em>Il est midi</em> (noon) / <em>minuit</em> (midnight)</li>
              </ul>
            </div>

            <div className="guide-card">
              <span className="guide-badge">Rule 2</span>
              <h4>Quarters &amp; Half Hours</h4>
              <p>Everyday French uses conversational fractions:</p>
              <ul>
                <li><strong>:15:</strong> <em>et quart</em> (quarter past)</li>
                <li><strong>:30:</strong> <em>et demie</em> (half past)</li>
                <li><strong>:45:</strong> <em>moins le quart</em> (quarter to next hour)</li>
              </ul>
            </div>

            <div className="guide-card">
              <span className="guide-badge">Rule 3</span>
              <h4>24-Hour Clock &amp; Asking Time</h4>
              <p>Train stations, flights, and appointments use 24h time:</p>
              <ul>
                <li><strong>Quelle heure est-il ?</strong> — &quot;What time is it?&quot;</li>
                <li><strong>À quelle heure ?</strong> — &quot;At what time?&quot;</li>
                <li><strong>14h30:</strong> <em>quatorze heures trente</em> (2:30 PM)</li>
              </ul>
            </div>
          </div>
          <div className="guide-footer-hint">
            <FaInfoCircle aria-hidden="true" />
            <span>All phrases below feature native French neural audio recordings. Tap any card to reveal phonetics and translation!</span>
          </div>
        </div>
      )}

      {activeTab === 'numbers' ? (
        <Phrases
          data={numbersData}
          title="French Numbers (0–1,000)"
          contentType="numbers"
        />
      ) : (
        <Phrases
          data={timeData}
          title="Telling Time & Time Phrases"
          contentType="time"
        />
      )}
    </div>
  );
};

export default NumbersAndTime;
