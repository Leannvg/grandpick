import React from 'react';
import { getImageUrl } from '../utils/cloudinary';

const InfoSection = ({ title, body, images }) => {
    return (
        <section className="info-section">
            <div className="info-section__label-wrapper">
                <div className="info-section__label">
                    {title}
                </div>
            </div>
            
            <div className="info-section__content">
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
                                alt={`${title} - ${index + 1}`} 
                                className="info-section__img"
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default InfoSection;
