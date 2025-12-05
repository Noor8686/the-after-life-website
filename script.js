// script.js

document.addEventListener('DOMContentLoaded', () => {
    /* ============================
       SCROLL-REVEAL (Klasse .reveal)
       ============================ */
    const revealElements = document.querySelectorAll('.reveal');

    if (revealElements.length > 0 && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        revealElements.forEach(el => observer.observe(el));
    } else {
        // Fallback: falls kein IntersectionObserver vorhanden ist
        revealElements.forEach(el => el.classList.add('in-view'));
    }

    /* ============================
       NAV-SHADOW & "TOP"-BUTTON
       ============================ */
    const nav    = document.querySelector('nav');
    const topBtn = document.querySelector('.top-btn');

    const handleScroll = () => {
        const scrollY = window.scrollY || window.pageYOffset;

        // Nav-Schatten
        if (nav) {
            if (scrollY > 10) {
                nav.classList.add('nav-shadow');
            } else {
                nav.classList.remove('nav-shadow');
            }
        }

        // Top-Button ein-/ausblenden
        if (topBtn) {
            if (scrollY > 400) {
                topBtn.style.opacity = '1';
                topBtn.style.pointerEvents = 'auto';
            } else {
                topBtn.style.opacity = '0';
                topBtn.style.pointerEvents = 'none';
            }
        }
    };

    // Direkt beim Laden einmal aufrufen
    handleScroll();
    window.addEventListener('scroll', handleScroll);
});
