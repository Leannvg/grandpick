import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InfoSection from '../components/InfoSection';
import '../assets/styles/information.css';

const InformationPage = ({ data, eyebrow, title, subtitle }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
    const [activeTabIndex, setActiveTabIndex] = useState(isMobile ? null : 0);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 992;
            setIsMobile(mobile);
            // Si pasamos de mobile a desktop y no hay nada seleccionado, seleccionar el primero
            if (!mobile && activeTabIndex === null) {
                setActiveTabIndex(0);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [activeTabIndex]);

    useEffect(() => {
        // Scroll to top when page changes
        window.scrollTo(0, 0);
    }, [title]);

    useEffect(() => {
        if (isDrawerOpen && isMobile) {
            document.body.classList.add("body-scroll-lock");
        } else {
            document.body.classList.remove("body-scroll-lock");
        }
        return () => document.body.classList.remove("body-scroll-lock");
    }, [isDrawerOpen, isMobile]);

    if (!data || data.length === 0) return null;

    const activeSection = activeTabIndex !== null ? data[activeTabIndex] : null;

    const handleTabClick = (index) => {
        setActiveTabIndex(index);
        if (isMobile) {
            setIsDrawerOpen(true);
        }
    };

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
                                onClick={() => handleTabClick(index)}
                            >
                                {section.title}
                            </button>
                        ))}
                    </div>
                </aside>

                <div className="info-page__content">
                    {activeSection && (
                        <div className="info-page__content-card">
                            <h2 className="info-page__section-title">{activeSection.title}</h2>
                            <InfoSection 
                                body={activeSection.body}
                                images={activeSection.images}
                            />
                        </div>
                    )}
                </div>
            </main>

            <AnimatePresence>
                {isDrawerOpen && isMobile && activeSection && (
                    <>
                        <motion.div 
                            className="info-drawer-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDrawerOpen(false)}
                        />
                        <motion.div 
                            className="info-drawer"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            drag="y"
                            dragConstraints={{ top: 0 }}
                            dragElastic={0.2}
                            onDragEnd={(_, info) => {
                                if (info.offset.y > 100) setIsDrawerOpen(false);
                            }}
                        >
                            <div className="info-drawer__header">
                                <div className="info-drawer__handle" />
                                <h2 className="info-drawer__title">{activeSection.title}</h2>
                            </div>
                            <div className="info-drawer__content">
                                <InfoSection 
                                    body={activeSection.body}
                                    images={activeSection.images}
                                />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </section>
    );
};

export default InformationPage;
