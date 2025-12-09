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

    /* ============================
       Mobile Navigation (Hamburger)
       ============================ */
    const navToggle = document.querySelector('.nav-toggle');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            const parentNav = navToggle.closest('nav') || nav;
            if (parentNav) {
                parentNav.classList.toggle('nav-open');
            }
        });
    }

    if (nav) {
        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('nav-open');
            });
        });
    }

    /* ============================
       Rotierender Hero-Text
       (nur auf index.html vorhanden)
       ============================ */
    const heroTextEl = document.querySelector('#hero-text');

    if (heroTextEl) {
        const heroTexts = [
            'Ein Survival-Adventure in einer zerstörten Zukunft.',
            'Baue deine Siedlung auf den Ruinen der alten Welt.',
            'Triff Entscheidungen, die über Leben und Tod entscheiden.',
        ];

        let index = 0;

        setInterval(() => {
            index = (index + 1) % heroTexts.length;
            heroTextEl.textContent = heroTexts[index];
        }, 5000); // alle 5 Sekunden wechseln
    }

    /* ============================
       Bild-Lightbox für Charakter- und Ortsbilder
       ============================ */
    const zoomableImages = document.querySelectorAll('img.full, .char-box img');

    if (zoomableImages.length > 0) {
        const lightbox = document.createElement('div');
        lightbox.id = 'img-lightbox';
        lightbox.innerHTML = '<img src="" alt="">';
        document.body.appendChild(lightbox);

        const lightboxImg = lightbox.querySelector('img');

        // alle großen Bilder auf der Seite anklickbar machen
        zoomableImages.forEach(img => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', () => {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt || '';
                lightbox.style.display = 'flex';
            });
        });

        // Klick auf das Overlay schließt die Lightbox
        lightbox.addEventListener('click', () => {
            lightbox.style.display = 'none';
        });
    }

    /* ============================
       Theme-Umschalter (Dark/Light)
       ============================ */
    const themeToggle = document.querySelector('.theme-toggle');
    const root        = document.documentElement; // <html>

    // gespeichertes Theme aus localStorage laden
    const savedTheme = localStorage.getItem('taf-theme');

    if (savedTheme === 'light') {
        root.classList.add('light-theme');
    }

    if (themeToggle) {
        const updateToggleLabel = () => {
            if (root.classList.contains('light-theme')) {
                themeToggle.textContent = '🌙';
                themeToggle.title = 'Dunkles Design aktivieren';
            } else {
                themeToggle.textContent = '☀';
                themeToggle.title = 'Helles Design aktivieren';
            }
        };

        updateToggleLabel();

        themeToggle.addEventListener('click', () => {
            root.classList.toggle('light-theme');

            const mode = root.classList.contains('light-theme') ? 'light' : 'dark';
            localStorage.setItem('taf-theme', mode);

            updateToggleLabel();
        });
    }
});
