import React from 'react';
import { getImageUrl } from '../utils/cloudinary';

const InfoSection = ({ body, images }) => {
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
        </div>
    );
};

export default InfoSection;
