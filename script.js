document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================
       Selektor-Shortcuts
       ========================================================= */
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);

    /* =========================================================
       Scroll-Reveal (modern & effizient)
       ========================================================= */
    function setupScrollReveal(selector = ".reveal") {
        const elements = document.querySelectorAll(selector);
        if (!("IntersectionObserver" in window)) {
            elements.forEach(el => el.classList.add("in-view"));
            return;
        }

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        elements.forEach(el => observer.observe(el));
    }
    setupScrollReveal();


    /* =========================================================
       Smooth Scroll to Top
       ========================================================= */
    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const topBtn = $(".top-btn");
    if (topBtn) {
        topBtn.addEventListener("click", (e) => {
            e.preventDefault();
            scrollToTop();
        });
    }


    /* =========================================================
       Lightbox (verbessert)
       ========================================================= */
    function setupLightbox() {
        const zoomable = $$("img.full, .char-box img");
        if (zoomable.length === 0) return;

        const lightbox = document.createElement("div");
        lightbox.id = "img-lightbox";
        lightbox.innerHTML = `<img src="" alt="">`;
        document.body.appendChild(lightbox);

        const img = lightbox.querySelector("img");

        zoomable.forEach(z => {
            z.style.cursor = "zoom-in";
            z.addEventListener("click", () => {
                img.src = z.src;
                img.alt = z.alt;
                lightbox.style.display = "flex";
            });
        });

        lightbox.addEventListener("click", () => {
            lightbox.style.display = "none";
        });
    }
    setupLightbox();


    /* =========================================================
       Typewriter Effekt (Story, Texte)
       ========================================================= */
    function typeWriter(element, text, speed = 35) {
        return new Promise(resolve => {
            element.textContent = "";
            let i = 0;

            function write() {
                if (i < text.length) {
                    element.textContent += text[i++];
                    setTimeout(write, speed);
                } else {
                    resolve();
                }
            }
            write();
        });
    }


    /* =========================================================
       Rotierender Text (Hero-Text)
       ========================================================= */
    function rotatingText(element, texts, interval = 5000) {
        let index = 0;
        setInterval(() => {
            index = (index + 1) % texts.length;
            element.textContent = texts[index];
        }, interval);
    }

    const heroTextEl = $("#hero-text");
    if (heroTextEl) {
        rotatingText(heroTextEl, [
            "Ein Survival-Adventure in einer zerstörten Zukunft.",
            "Baue deine Siedlung auf den Ruinen der alten Welt.",
            "Triff Entscheidungen, die über Leben und Tod entscheiden."
        ]);
    }


    /* =========================================================
       NPC-DIALOG mit Typewriter + Klick
       ========================================================= */
    async function startDialog(element, lines, speed = 35) {
        let index = 0;
        let locked = false;

        async function showLine() {
            locked = true;
            await typeWriter(element, lines[index], speed);
            locked = false;
        }

        await showLine();

        element.addEventListener("click", async () => {
            if (locked) return;

            index++;
            if (index < lines.length) {
                await showLine();
            } else {
                element.textContent = "";
            }
        });
    }


    /* =========================================================
       CUTSCENE SYSTEM (automatische Story-Sequenzen)
       ========================================================= */
    async function playScene(lines, element, delay = 1500) {
        for (let line of lines) {
            await typeWriter(element, line, 35);
            await wait(delay);
        }
        element.textContent = "";
    }


    /* =========================================================
       Countdown (z. B. für Wellenangriffe)
       ========================================================= */
    function countdown(element, seconds) {
        let counter = seconds;
        element.textContent = counter;

        const timer = setInterval(() => {
            counter--;
            element.textContent = counter;

            if (counter <= 0) {
                clearInterval(timer);
            }
        }, 1000);
    }


    /* =========================================================
       Zufällige Auswahl (Loot, Dialog, Random Events)
       ========================================================= */
    function randomItem(list) {
        return list[Math.floor(Math.random() * list.length)];
    }


    /* =========================================================
       wait() für Timing
       ========================================================= */
    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    /* =========================================================
       Navigation (Hamburger + Scroll-Effekte)
       ========================================================= */
    const nav = $("nav");
    const navToggle = $(".nav-toggle");

    function handleScroll() {
        const scrollY = window.scrollY || window.pageYOffset;

        if (scrollY > 10) nav.classList.add("nav-shadow");
        else nav.classList.remove("nav-shadow");

        if (topBtn) {
            if (scrollY > 400) {
                topBtn.style.opacity = "1";
                topBtn.style.pointerEvents = "auto";
            } else {
                topBtn.style.opacity = "0";
                topBtn.style.pointerEvents = "none";
            }
        }
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    if (navToggle) {
        navToggle.addEventListener("click", () => {
            nav.classList.toggle("nav-open");
        });
    }

    $$(".nav-links a").forEach(link => {
        link.addEventListener("click", () => {
            nav.classList.remove("nav-open");
        });
    });


    /* =========================================================
       Theme Toggle & Speicher
       ========================================================= */
    const themeToggle = $(".theme-toggle");
    const root = document.documentElement;

    const savedTheme = localStorage.getItem("taf-theme");
    if (savedTheme === "light") root.classList.add("light-theme");

function updateThemeIcon() {
    const isLight = root.classList.contains("light-theme");
    themeToggle.innerHTML = isLight ? "🌙" : "☀";
    themeToggle.style.transform = "scale(1.3)";
    setTimeout(() => themeToggle.style.transform = "scale(1)", 200);
}


    if (themeToggle) {
        updateThemeIcon();
        themeToggle.addEventListener("click", () => {
            root.classList.toggle("light-theme");

            localStorage.setItem(
                "taf-theme",
                root.classList.contains("light-theme") ? "light" : "dark"
            );

            updateThemeIcon();
        });
    }

});
