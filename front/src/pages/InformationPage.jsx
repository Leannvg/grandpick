import React, { useEffect, useState } from 'react';
import InfoSection from '../components/InfoSection';
import '../assets/styles/information.css';

const InformationPage = ({ data, eyebrow, title, subtitle }) => {
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    
    useEffect(() => {
        // Scroll to top when page changes
        window.scrollTo(0, 0);
    }, [title]);

    if (!data || data.length === 0) return null;

    const activeSection = data[activeTabIndex];

    return (
        <section className="info-page page-section container">
            <header className="page-header text-center">
                {eyebrow && <p className="section-label">{eyebrow}</p>}
                <h1 className="section-title">{title}</h1>
                {subtitle && <p className="section-subtitle">{subtitle}</p>}
            </header>

            <main className="info-page__container">
                <aside className="info-page__sidebar">
                    <div className="info-page__tabs">
                        {data.map((section, index) => (
                            <button
                                key={index}
                                className={`info-page__tab ${activeTabIndex === index ? 'is-active' : ''}`}
                                onClick={() => setActiveTabIndex(index)}
                            >
                                {section.title}
                            </button>
                        ))}
                    </div>
                </aside>

                <div className="info-page__content">
                    <div className="info-page__content-card">
                        <h2 className="info-page__section-title">{activeSection.title}</h2>
                        <InfoSection 
                            body={activeSection.body}
                            images={activeSection.images}
                        />
                    </div>
                </div>
            </main>
        </section>
    );
};

export default InformationPage;
