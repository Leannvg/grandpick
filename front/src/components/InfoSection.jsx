import React, { useState } from 'react';
import { getImageUrl } from '../utils/cloudinary';

const InfoSection = ({ body, images, tabs }) => {
    const [activeInnerTab, setActiveInnerTab] = useState(0);
    return (
        <div className="info-section">
            <div 
                className="info-section__body"
                dangerouslySetInnerHTML={{ __html: body }}
            />
            
            {images && images.length > 0 && (
                <div className="info-section__images">
                    {images.map((img, index) => (
                        <img 
                            key={index}
                            src={getImageUrl(img)} 
                            alt={`content-image-${index + 1}`} 
                            className="info-section__img"
                        />
                    ))}
                </div>
            )}

            {tabs && tabs.length > 0 && (
                <div className="info-section__inner-tabs-container">
                    <div className="info-section__inner-tabs">
                        {tabs.map((tab, index) => (
                            <button
                                key={index}
                                className={`info-section__inner-tab ${activeInnerTab === index ? 'is-active' : ''}`}
                                onClick={() => setActiveInnerTab(index)}
                            >
                                <span className="inner-tab-id">{tab.id}</span>
                                <span className="inner-tab-title">{tab.title}</span>
                            </button>
                        ))}
                    </div>
                    
                    {tabs[activeInnerTab] && (
                        <div className="info-section__inner-content">
                            <div 
                                className="info-section__body"
                                dangerouslySetInnerHTML={{ __html: tabs[activeInnerTab].body }}
                            />
                            {tabs[activeInnerTab].images && tabs[activeInnerTab].images.length > 0 && (
                                <div className="info-section__images">
                                    {tabs[activeInnerTab].images.map((img, index) => (
                                        <img 
                                            key={index}
                                            src={getImageUrl(img)} 
                                            alt={`tab-image-${index + 1}`} 
                                            className="info-section__img"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default InfoSection;
