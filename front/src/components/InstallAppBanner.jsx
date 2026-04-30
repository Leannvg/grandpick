import React, { useState, useEffect } from 'react';

const InstallAppBanner = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Verificar si la app ya está instalada o en modo standalone
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        if (isStandalone) {
            setIsVisible(false);
            return;
        }

        const handleBeforeInstallPrompt = (e) => {
            // Prevenir el banner de instalación automático de Chrome
            e.preventDefault();
            // Guardar el evento para dispararlo luego
            setDeferredPrompt(e);
            // Mostrar nuestro propio botón/banner
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Ocultar si el usuario instaló la app
        const handleAppInstalled = () => {
            setDeferredPrompt(null);
            setIsVisible(false);
        };
        
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setIsVisible(false);
        }
        
        setDeferredPrompt(null);
    };

    if (!isVisible) return null;

    return (
        <section className="install-banner">
            <div className="container">
                <div className="install-banner__content">
                    <div className="install-banner__text">
                        <h3 className="install-banner__title">Llevá GrandPick con vos</h3>
                        <p className="install-banner__desc">Instalá la aplicación para recibir notificaciones de las carreras y acceder más rápido.</p>
                    </div>
                    <button onClick={handleInstallClick} className="btn-install">
                        Instalar App
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default InstallAppBanner;
