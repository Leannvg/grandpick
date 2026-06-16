import React, { useState, useEffect } from 'react';

// Escuchar el evento a nivel global para no perderlo si el componente se monta después de que se disparó (ej: al navegar o desloguear)
let globalDeferredPrompt = null;
if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        globalDeferredPrompt = e;
        window.dispatchEvent(new Event('pwa_installable'));
    });
}

const InstallAppBanner = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);

    useEffect(() => {
        // Verificar si la app está en modo standalone
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        
        if (isStandalone) {
            setIsVisible(false);
            return;
        }

        // Detectar iOS, ya que no dispara el evento beforeinstallprompt
        const isIOS = 
            (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

        const hasInstalled = localStorage.getItem('grandpick_app_installed') === 'true';

        if (isIOS) {
            if (!hasInstalled) {
                setIsVisible(true);
            }
        }

        const handleBeforeInstallPrompt = (e) => {
            if (e && typeof e.preventDefault === 'function') {
                e.preventDefault();
            }
            
            const promptToUse = e || globalDeferredPrompt;
            if (!promptToUse) return;

            // Guardar el evento para dispararlo luego
            setDeferredPrompt(promptToUse);
            
            const wasInstalled = localStorage.getItem('grandpick_app_installed') === 'true';
            
            if (wasInstalled) {
                // Si teníamos guardado que estaba instalada pero el navegador nos dispara este evento,
                // significa que la app fue desinstalada. Borramos la marca y volvemos a mostrar el banner.
                localStorage.removeItem('grandpick_app_installed');
                setIsVisible(true);
            } else {
                // Mostrar el banner si no está instalada
                setIsVisible(true);
            }
        };

        // Si el evento ya se disparó a nivel global antes de que este componente se montara
        if (globalDeferredPrompt) {
            handleBeforeInstallPrompt(globalDeferredPrompt);
        }

        // Escuchar cuando se dispare a nivel global mientras el componente está montado
        const onGlobalPrompt = () => handleBeforeInstallPrompt(globalDeferredPrompt);
        window.addEventListener('pwa_installable', onGlobalPrompt);
        
        // Mantener el listener original por si acaso
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
            window.removeEventListener('pwa_installable', onGlobalPrompt);
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
        <section className="install-banner">
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
