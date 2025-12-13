document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================
       Selektor-Shortcuts
       ========================================================= */
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);

    /* =========================================================
       AJAX-Helper mit einfachem Cache
       ========================================================= */
    const fetchCache = {};
    async function fetchJSON(url) {
        if (fetchCache[url]) return fetchCache[url];
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status} beim Laden von ${url}`);
        const data = await res.json();
        fetchCache[url] = data;
        return data;
    }

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
            "Ein Survival-Adventure in einer zerstoerten Zukunft.",
            "Baue deine Siedlung auf den Ruinen der alten Welt.",
            "Triff Entscheidungen, die ueber Leben und Tod entscheiden."
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
        const isLight = root.classList.contains('light-theme');
        themeToggle.innerHTML = isLight ? 'SUN' : 'MOON';
        themeToggle.style.transform = 'scale(1.1)';
        setTimeout(() => themeToggle.style.transform = 'scale(1)', 200);
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

    /* =========================================================
       Charakter-Details via AJAX
       ========================================================= */
    function initCharakterDetails() {
        const buttons = $$(".load-char");
        if (!buttons.length) return;

        buttons.forEach(btn => {
            btn.addEventListener("click", async () => {
                const charId = btn.dataset.charId;
                const card = btn.closest(".char-box");
                const target = card.querySelector(".char-details");
                const defaultLabel = btn.textContent;

                btn.disabled = true;
                btn.textContent = "Lade...";
                target.innerHTML = `<p class="muted">Lade Details...</p>`;

                try {
                    const data = await fetchJSON("charaktere.json");
                    const char = data.find(c => c.id === charId);
                    if (!char) throw new Error("Charakter nicht gefunden");

                    target.innerHTML = `
                        <p class="muted">${char.rolle} - ${char.alter} Jahre</p>
                        <p>${char.details}</p>
                    `;
                } catch (error) {
                    console.error(error);
                    target.innerHTML = `<p class="error-text">Konnte Charakterdaten nicht laden.</p>`;
                } finally {
                    btn.disabled = false;
                    btn.textContent = defaultLabel;
                }
            });
        });
    }

    /* =========================================================
       Story-Abschnitte nachladen
       ========================================================= */
    function initStoryLoader() {
        const btn = $("#story-load-btn");
        const container = $("#story-dynamic");
        if (!btn || !container) return;

        let loaded = false;
        btn.addEventListener("click", async () => {
            if (loaded) return;
            const defaultLabel = btn.textContent;
            btn.disabled = true;
            btn.textContent = "Laedt...";
            container.innerHTML = `<p class="muted">Story wird geladen...</p>`;

            try {
                const data = await fetchJSON("story.json");
                container.innerHTML = "";

                data.abschnitte.forEach(abschnitt => {
                    const card = document.createElement("article");
                    card.className = "story-card";
                    card.innerHTML = `
                        <h3>${abschnitt.titel}</h3>
                        <p>${abschnitt.text}</p>
                    `;
                    container.appendChild(card);
                });

                btn.textContent = "Story geladen";
                loaded = true;
            } catch (error) {
                console.error(error);
                container.innerHTML = `<p class="error-text">Story konnte nicht geladen werden.</p>`;
                btn.disabled = false;
                btn.textContent = defaultLabel;
            }
        });
    }

    /* =========================================================
       Orte dynamisch laden
       ========================================================= */
    function initOrteLoader() {
        const nav = $("#orte-nav");
        const detail = $("#ort-detail");
        if (!nav || !detail) return;

        const renderOrt = (ort) => {
            detail.innerHTML = `
                <article class="ort-card-inner">
                    <img src="${ort.bild}" alt="${ort.name}" loading="lazy">
                    <div>
                        <h3>${ort.name}</h3>
                        <p>${ort.beschreibung}</p>
                    </div>
                </article>
            `;
        };

        fetchJSON("orte.json")
            .then(orte => {
                nav.innerHTML = "";
                orte.forEach((ort, index) => {
                    const button = document.createElement("button");
                    button.className = "pill";
                    button.textContent = ort.name;
                    button.dataset.ortId = ort.id;

                    button.addEventListener("click", () => {
                        nav.querySelectorAll("button").forEach(b => b.classList.remove("active"));
                        button.classList.add("active");
                        renderOrt(ort);
                    });

                    nav.appendChild(button);

                    if (index === 0) {
                        button.classList.add("active");
                        renderOrt(ort);
                    }
                });
            })
            .catch(error => {
                console.error(error);
                nav.innerHTML = `<p class="error-text">Orte konnten nicht geladen werden.</p>`;
            });
    }

    /* =========================================================
       Fake-News / Updates
       ========================================================= */
    function initNewsFeed() {
        const feed = $("#news-feed");
        if (!feed) return;

        fetchJSON("updates.json")
            .then(items => {
                feed.innerHTML = items.map(item => `
                    <article class="news-card">
                        <p class="muted">${item.datum}</p>
                        <h3>${item.titel}</h3>
                        <p>${item.text}</p>
                    </article>
                `).join("");
            })
            .catch(error => {
                console.error(error);
                feed.innerHTML = `<p class="error-text">Updates konnten nicht geladen werden.</p>`;
            });
    }

    /* =========================================================
       Formular ohne Reload
       ========================================================= */
    function initFeedbackForm() {
        const form = $("#feedback-form");
        const status = $("#feedback-status");
        if (!form || !status) return;

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const submitBtn = form.querySelector("button[type='submit']");
            const nameField = form.querySelector("[name='name']");
            const name = (nameField?.value || "Explorer").trim();

            status.textContent = "Sende...";
            submitBtn.disabled = true;

            setTimeout(() => {
                status.textContent = `Danke, ${name}! Dein Feedback wurde gespeichert (Demo).`;
                form.reset();
                submitBtn.disabled = false;
            }, 800);
        });
    }

    // Init der neuen AJAX-Features
    initCharakterDetails();
    initStoryLoader();
    initOrteLoader();
    initNewsFeed();
    initFeedbackForm();

});



