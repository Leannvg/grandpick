import React, { useEffect } from 'react';
import InfoSection from '../components/InfoSection';
import '../assets/styles/information.css';

const InformationPage = ({ data, eyebrow, title, subtitle }) => {
    
    useEffect(() => {
        // Scroll to top when page changes
        window.scrollTo(0, 0);
    }, [title]);

    if (!data) return null;

    return (
        <div className="info-page">
            <header className="info-page__header">
                <div className="container">
                    {eyebrow && <span className="info-page__eyebrow">{eyebrow}</span>}
                    <h1 className="info-page__title">{title}</h1>
                    {subtitle && <p className="info-page__subtitle">{subtitle}</p>}
                </div>
            </header>

            <main className="info-page__main">
                <div className="container">
                    {data.map((section, index) => (
                        <InfoSection 
                            key={index}
                            title={section.title}
                            body={section.body}
                            images={section.images}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
};

export default InformationPage;
