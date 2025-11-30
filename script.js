// script.js

document.addEventListener('DOMContentLoaded', () => {
    /* ============================
       SCROLL-REVEAL (Klasse .reveal)
       ============================ */
    const revealElements = document.querySelectorAll('.reveal');

    if (revealElements.length > 0) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        revealElements.forEach(el => observer.observe(el));
    }

    /* ============================
       NAV-SHADOW BEI SCROLL
       (nutzt dein CSS: nav.nav-shadow)
       ============================ */
    const nav = document.querySelector('nav');

    if (nav) {
        const updateNavShadow = () => {
            if (window.scrollY > 10) {
                nav.classList.add('nav-shadow');
            } else {
                nav.classList.remove('nav-shadow');
            }
        };

        updateNavShadow();              // direkt beim Laden
        window.addEventListener('scroll', updateNavShadow);
    }

    /* ============================
       "Top"-Button ein-/ausblenden
       ============================ */
    const topBtn = document.querySelector('.top-btn');

    if (topBtn) {
        const toggleTopButton = () => {
            if (window.scrollY > 400) {
                topBtn.style.opacity = '1';
                topBtn.style.pointerEvents = 'auto';
            } else {
                topBtn.style.opacity = '0';
                topBtn.style.pointerEvents = 'none';
            }
        };

        toggleTopButton();
        window.addEventListener('scroll', toggleTopButton);
    }
});
