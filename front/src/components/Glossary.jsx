import React, { useState, useEffect, useRef } from 'react';
import glosaryData from '../data/glosary.json';
import '../assets/styles/glossary.css';
import glosaryIcon from '../assets/icons/glosary.png';

const Glossary = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [terms, setTerms] = useState([]);
  const popupRef = useRef(null);
  const inputRef = useRef(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  useEffect(() => {
    if (isOpen && !isMobile && inputRef.current) {
        inputRef.current.focus();
    }
  }, [isOpen, isMobile]);

  useEffect(() => {
    const flattened = [];
    for (const [category, categoryTerms] of Object.entries(glosaryData)) {
        for (const [term, definition] of Object.entries(categoryTerms)) {
            flattened.push({ term, definition, category });
        }
    }
    setTerms(flattened);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target) && !event.target.closest('.glossary-toggle-btn')) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
        document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.body.style.overflow = '';
    };
  }, [isOpen]);

  const filteredTerms = terms.filter(item => 
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glossary-container">
      <div className={`glossary-popup ${isOpen ? 'show' : ''}`} ref={popupRef}>
        <div className="glossary-list">
          {filteredTerms.length > 0 ? (
              filteredTerms.map((item, index) => (
              <div className="glossary-item" key={index}>
                  <div className="glossary-term">{item.term}</div>
                  <div className="glossary-def">{item.definition}</div>
              </div>
              ))
          ) : (
              <div className="glossary-no-results">No se encontraron resultados</div>
          )}
        </div>
        <div className="glossary-search">
          <input 
            type="text" 
            placeholder="Buscar en el glosario..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            ref={inputRef}
          />
        </div>
      </div>
      <div className={`glossary-overlay ${isOpen ? 'show' : ''}`}></div>
      <button className={`glossary-toggle-btn ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <img src={glosaryIcon} alt="Glosario" />
      </button>
    </div>
  );
};

export default Glossary;
