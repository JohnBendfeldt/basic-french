import React, { useRef } from 'react';
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
  const numbersTabRef = useRef<HTMLButtonElement>(null);
  const timeTabRef = useRef<HTMLButtonElement>(null);

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const nextTab = activeTab === 'numbers' ? 'time' : 'numbers';
      onTabChange(nextTab);
      if (nextTab === 'numbers') {
        numbersTabRef.current?.focus();
      } else {
        timeTabRef.current?.focus();
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      onTabChange('numbers');
      numbersTabRef.current?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      onTabChange('time');
      timeTabRef.current?.focus();
    }
  };

  return (
    <div className="numbers-and-time-section">
      <div className="section-tab-container">
        <div
          className="section-tab-bar"
          role="tablist"
          aria-label="Numbers and Time sections"
          onKeyDown={handleTabKeyDown}
        >
          <button
            ref={numbersTabRef}
            id="tab-numbers"
            type="button"
            role="tab"
            aria-selected={activeTab === 'numbers'}
            aria-controls="panel-numbers"
            tabIndex={activeTab === 'numbers' ? 0 : -1}
            className={`section-tab-btn ${activeTab === 'numbers' ? 'active' : ''}`}
            onClick={() => onTabChange('numbers')}
          >
            <FaCalculator className="tab-btn-icon" aria-hidden="true" />
            <span>Numbers</span>
          </button>
          <button
            ref={timeTabRef}
            id="tab-time"
            type="button"
            role="tab"
            aria-selected={activeTab === 'time'}
            aria-controls="panel-time"
            tabIndex={activeTab === 'time' ? 0 : -1}
            className={`section-tab-btn ${activeTab === 'time' ? 'active' : ''}`}
            onClick={() => onTabChange('time')}
          >
            <FaClock className="tab-btn-icon" aria-hidden="true" />
            <span>Telling Time</span>
          </button>
        </div>
      </div>

      <div
        id="panel-numbers"
        role="tabpanel"
        aria-labelledby="tab-numbers"
        hidden={activeTab !== 'numbers'}
      >
        {activeTab === 'numbers' && (
          <>
            <div className="time-grammar-guide">
              <div className="guide-header">
                <FaLightbulb className="guide-icon" aria-hidden="true" />
                <h3>French Counting Tips (70, 80 &amp; 90)</h3>
              </div>
              <div className="guide-grid">
                <div className="guide-card">
                  <span className="guide-badge">70–79</span>
                  <h4>
                    Base-60 (<span lang="fr">Soixante-dix</span>)
                  </h4>
                  <p>In standard French, 70 combines 60 + 10:</p>
                  <ul>
                    <li>
                      <strong>70:</strong> <em lang="fr">soixante-dix</em> (60 + 10)
                    </li>
                    <li>
                      <strong>71:</strong> <em lang="fr">soixante-et-onze</em> (60 + 11)
                    </li>
                    <li>
                      <strong>75:</strong> <em lang="fr">soixante-quinze</em> (60 + 15)
                    </li>
                  </ul>
                </div>

                <div className="guide-card">
                  <span className="guide-badge">80–89</span>
                  <h4>
                    Four Twenties (<span lang="fr">Quatre-vingts</span>)
                  </h4>
                  <p>80 literally means &quot;four twenties&quot; (4 × 20):</p>
                  <ul>
                    <li>
                      <strong>80:</strong> <em lang="fr">quatre-vingts</em> (keeps final -s)
                    </li>
                    <li>
                      <strong>81:</strong> <em lang="fr">quatre-vingt-un</em> (drops -s before numbers)
                    </li>
                  </ul>
                </div>

                <div className="guide-card">
                  <span className="guide-badge">90–99</span>
                  <h4>
                    80 + Teen (<span lang="fr">Quatre-vingt-dix</span>)
                  </h4>
                  <p>90 builds on 80 plus 10–19:</p>
                  <ul>
                    <li>
                      <strong>90:</strong> <em lang="fr">quatre-vingt-dix</em> (80 + 10)
                    </li>
                    <li>
                      <strong>95:</strong> <em lang="fr">quatre-vingt-quinze</em> (80 + 15)
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <Phrases
              data={numbersData}
              title="French Numbers (0–1,000)"
              contentType="numbers"
            />
          </>
        )}
      </div>

      <div
        id="panel-time"
        role="tabpanel"
        aria-labelledby="tab-time"
        hidden={activeTab !== 'time'}
      >
        {activeTab === 'time' && (
          <>
            <div className="time-grammar-guide">
              <div className="guide-header">
                <FaLightbulb className="guide-icon" aria-hidden="true" />
                <h3>French Time Grammar Rules</h3>
              </div>
              <div className="guide-grid">
                <div className="guide-card">
                  <span className="guide-badge">Rule 1</span>
                  <h4 lang="fr">Il est ... heure(s)</h4>
                  <p>
                    Include <em lang="fr">heure</em> (singular for 1:00, plural for 2+; omitted with{' '}
                    <em lang="fr">midi</em> / <em lang="fr">minuit</em>):
                  </p>
                  <ul>
                    <li>
                      <strong>1:00:</strong> <em lang="fr">Il est une heure</em>
                    </li>
                    <li>
                      <strong>2:00+:</strong> <em lang="fr">Il est deux heures</em>
                    </li>
                    <li>
                      <strong>12:00:</strong> <em lang="fr">Il est midi</em> (noon) /{' '}
                      <em lang="fr">minuit</em> (midnight)
                    </li>
                  </ul>
                </div>

                <div className="guide-card">
                  <span className="guide-badge">Rule 2</span>
                  <h4>Quarters &amp; Half Hours</h4>
                  <p>Everyday French uses conversational fractions:</p>
                  <ul>
                    <li>
                      <strong>:15:</strong> <em lang="fr">et quart</em> (quarter past)
                    </li>
                    <li>
                      <strong>:30:</strong> <em lang="fr">et demie</em> (half past)
                    </li>
                    <li>
                      <strong>:45:</strong> <em lang="fr">moins le quart</em> (quarter to next hour)
                    </li>
                  </ul>
                </div>

                <div className="guide-card">
                  <span className="guide-badge">Rule 3</span>
                  <h4>24-Hour Clock &amp; Asking Time</h4>
                  <p>Train stations, flights, and appointments use 24h time:</p>
                  <ul>
                    <li>
                      <strong lang="fr">Quelle heure est-il ?</strong> — &quot;What time is it?&quot;
                    </li>
                    <li>
                      <strong lang="fr">À quelle heure ?</strong> — &quot;At what time?&quot;
                    </li>
                    <li>
                      <strong>14h30:</strong> <em lang="fr">quatorze heures trente</em> (2:30 PM)
                    </li>
                  </ul>
                </div>
              </div>
              <div className="guide-footer-hint">
                <FaInfoCircle aria-hidden="true" />
                <span>
                  All phrases below feature native French neural audio recordings. Tap any card to reveal phonetics and translation!
                </span>
              </div>
            </div>

            <Phrases
              data={timeData}
              title="Telling Time & Time Phrases"
              contentType="time"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default NumbersAndTime;
