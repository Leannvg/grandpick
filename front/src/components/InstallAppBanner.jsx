import React, { useState, useEffect } from 'react';

const InstallAppBanner = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);

    useEffect(() => {
        // Verificar si la app ya está instalada o en modo standalone
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        const hasInstalled = localStorage.getItem('grandpick_app_installed') === 'true';
        
        if (isStandalone || hasInstalled) {
            setIsVisible(false);
            return;
        }

        // Detectar iOS, ya que no dispara el evento beforeinstallprompt
        const isIOS = 
            (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

        if (isIOS) {
            setIsVisible(true);
        }

        const handleBeforeInstallPrompt = (e) => {
            // Prevenir el banner de instalación automático de Chrome
            e.preventDefault();
            // Guardar el evento para dispararlo luego
            setDeferredPrompt(e);
            // Mostrar el banner solo cuando sabemos que se puede instalar
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Ocultar si el usuario instaló la app
        const handleAppInstalled = () => {
            setDeferredPrompt(null);
            setIsVisible(false);
            setShowInstructions(false);
            localStorage.setItem('grandpick_app_installed', 'true');
        };
        
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setIsVisible(false);
                localStorage.setItem('grandpick_app_installed', 'true');
            }
            
            setDeferredPrompt(null);
        } else {
            // Si el navegador bloqueó el prompt (ej: lo desinstaló antes) o es iOS, mostramos instrucciones
            setShowInstructions(true);
        }
    };

    if (!isVisible) return null;

    return (
        <section className="install-banner" style={{ position: 'relative' }}>
            <button 
                onClick={() => {
                    setIsVisible(false);
                    localStorage.setItem('grandpick_app_installed', 'true');
                }}
                style={{ 
                    position: 'absolute', 
                    top: '10px', 
                    right: '10px', 
                    background: 'none', 
                    border: 'none', 
                    color: 'white', 
                    opacity: 0.6, 
                    cursor: 'pointer', 
                    fontSize: '18px',
                    padding: '5px',
                    zIndex: 2
                }}
                aria-label="Cerrar banner"
            >
                ✕
            </button>
            <div className="container">
                {!showInstructions ? (
                    <div className="install-banner__content">
                        <div className="install-banner__text">
                            <h3 className="install-banner__title">Llevá GRANDPICK con vos</h3>
                            <p className="install-banner__desc">Instalá la aplicación para recibir notificaciones de las carreras y acceder más rápido.</p>
                        </div>
                        <button onClick={handleInstallClick} className="btn-install">
                            Instalar App
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <div className="install-banner__content">
                        <div className="install-banner__text" style={{ textAlign: 'left' }}>
                            <h3 className="install-banner__title" style={{ marginBottom: '16px' }}>Instalación manual</h3>
                            <ul className="install-banner__desc" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
                                <li>📱 <strong>iOS (Safari):</strong> Toca Compartir y selecciona "Agregar a inicio".</li>
                                <li>🤖 <strong>Android (Chrome):</strong> Toca los 3 puntos (⋮) y selecciona "Instalar aplicación".</li>
                                <li>💻 <strong>PC:</strong> Toca el ícono de instalación en la barra de direcciones del navegador.</li>
                            </ul>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '140px' }}>
                            <button onClick={() => setShowInstructions(false)} className="btn-install" style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.5)', boxShadow: 'none' }}>
                                Volver
                            </button>
                            <button 
                                onClick={() => {
                                    setIsVisible(false);
                                    localStorage.setItem('grandpick_app_installed', 'true');
                                }} 
                                className="btn-install" 
                                style={{ backgroundColor: 'transparent', border: 'none', boxShadow: 'none', fontSize: '0.85rem', opacity: 0.8, padding: '8px' }}
                            >
                                Ya la instalé
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default InstallAppBanner;
