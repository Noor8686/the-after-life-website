document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================
       Selektor-Shortcuts
       ========================================================= */
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);

    /* =========================================================
       API Basis-URL (Frontend konfigurierbar)
       ========================================================= */
    window.API_BASE = window.API_BASE || "https://localhost:44357/api/auth";

    /* =========================================================
       Sprachen / i18n (DE/EN)
       ========================================================= */
    const translations = {
        de: {
            "nav.menu": "Menu",
            "nav.overview": "Ueberblick",
            "nav.characters": "Charaktere",
            "nav.places": "Orte",
            "nav.mechanics": "Spielmechaniken",
            "nav.story": "Story & Team",
            "nav.privacy": "Datenschutz",
            "nav.login": "Login",
            "nav.register": "Registrieren",
            "nav.account": "Konto",
            "nav.profile": "Profil",
            "hero.headline": "Willkommen in der Welt von The After Life",
            "hero.texts": [
                "Ein Survival-Adventure in einer zerstoerten Zukunft.",
                "Baue deine Siedlung auf den Ruinen der alten Welt.",
                "Triff Entscheidungen, die ueber Leben und Tod entscheiden."
            ],
            "hero.btn.characters": "Charaktere",
            "hero.btn.places": "Orte ansehen",
            "profile.loading": "Lade Profil...",
            "profile.loggedIn": "Eingeloggt als: {name} ({email})"
        },
        en: {
            "nav.menu": "Menu",
            "nav.overview": "Overview",
            "nav.characters": "Characters",
            "nav.places": "Locations",
            "nav.mechanics": "Game Mechanics",
            "nav.story": "Story & Team",
            "nav.privacy": "Privacy",
            "nav.login": "Login",
            "nav.register": "Sign up",
            "nav.account": "Account",
            "nav.profile": "Profile",
            "hero.headline": "Welcome to the world of The After Life",
            "hero.texts": [
                "A survival adventure in a ruined future.",
                "Build your settlement on the ruins of the old world.",
                "Make choices that decide over life and death."
            ],
            "hero.btn.characters": "Characters",
            "hero.btn.places": "Explore locations",
            "profile.loading": "Loading profile...",
            "profile.loggedIn": "Logged in as: {name} ({email})"
        }
    };
    let currentLang = localStorage.getItem("taf-lang") === "en" ? "en" : "de";
    const i18nSelectors = {
        ".nav-toggle": "nav.menu",
        ".nav-links a[href$='index.html']": "nav.overview",
        ".nav-links a[href$='charaktere.html']": "nav.characters",
        ".nav-links a[href$='orte.html']": "nav.places",
        ".nav-links a[href$='mechaniken.html']": "nav.mechanics",
        ".nav-links a[href$='story.html']": "nav.story",
        ".nav-links a[href$='datenschutz.html']": "nav.privacy",
        ".account-toggle": "nav.account",
        ".account-dropdown .login": "nav.login",
        ".account-dropdown .register": "nav.register",
        ".account-dropdown .profile": "nav.profile",
        ".hero h2": "hero.headline",
        ".hero .hero-buttons .primary": "hero.btn.characters",
        ".hero .hero-buttons .secondary": "hero.btn.places",
        "#meInfo": "profile.loading"
    };
    const heroTextEl = $("#hero-text");
    let heroRotationId = null;
    let langSwitcher;

    function translateKey(key, fallback) {
        const dict = translations[currentLang] || translations.de;
        if (dict[key] !== undefined) return dict[key];
        if (translations.de[key] !== undefined) return translations.de[key];
        return fallback;
    }

    function formatTemplate(template, vars = {}) {
        if (typeof template !== "string") return template;
        return template.replace(/\{(\w+)\}/g, (match, key) => vars[key] ?? match);
    }

    function applyStaticTranslations() {
        Object.entries(i18nSelectors).forEach(([selector, key]) => {
            document.querySelectorAll(selector).forEach(el => {
                const value = translateKey(key);
                if (typeof value === "string") {
                    el.textContent = value;
                }
            });
        });
    }

    function startHeroRotation() {
        if (!heroTextEl) return;
        if (heroRotationId) clearInterval(heroRotationId);
        const texts = translateKey("hero.texts");
        if (!Array.isArray(texts) || texts.length === 0) return;
        heroRotationId = rotatingText(heroTextEl, texts, 5000);
    }

    function updateLanguageButtons() {
        if (!langSwitcher) return;
        langSwitcher.querySelectorAll("button[data-lang]").forEach(btn => {
            const active = btn.dataset.lang === currentLang;
            btn.classList.toggle("active", active);
            btn.setAttribute("aria-pressed", active ? "true" : "false");
        });
    }

    function applyTranslations(lang = currentLang) {
        if (!translations[lang]) lang = "de";
        currentLang = lang;
        localStorage.setItem("taf-lang", currentLang);
        document.documentElement.lang = currentLang;
        applyStaticTranslations();
        startHeroRotation();
        updateLanguageButtons();
    }

    function setupLanguageSwitcher() {
        const nav = document.querySelector("nav");
        if (!nav) return;
        langSwitcher = nav.querySelector(".lang-switch");
        if (!langSwitcher) {
            langSwitcher = document.createElement("div");
            langSwitcher.className = "lang-switch";
            langSwitcher.innerHTML = `
                <button type="button" data-lang="de">DE</button>
                <button type="button" data-lang="en">EN</button>
            `;
            const themeToggleEl = nav.querySelector(".theme-toggle");
            if (themeToggleEl) {
                themeToggleEl.insertAdjacentElement("beforebegin", langSwitcher);
            } else {
                nav.appendChild(langSwitcher);
            }
        }

        langSwitcher.querySelectorAll("button[data-lang]").forEach(btn => {
            btn.addEventListener("click", () => applyTranslations(btn.dataset.lang || "de"));
        });

        updateLanguageButtons();
    }

    function setupAuthLinks() {
        const nav = document.querySelector("nav");
        if (!nav || nav.querySelector(".account-menu")) return;

        const menu = document.createElement("div");
        menu.className = "account-menu";
        menu.innerHTML = `
            <button type="button" class="account-toggle button secondary">Konto</button>
            <div class="account-dropdown">
                <a href="login.html" class="login">Anmelden</a>
                <a href="register.html" class="register">Konto erstellen</a>
                <a href="profil.html" class="profile">Profil</a>
            </div>
        `;

        const themeToggleEl = nav.querySelector(".theme-toggle");
        if (themeToggleEl) {
            themeToggleEl.insertAdjacentElement("afterend", menu);
        } else {
            nav.appendChild(menu);
        }

        const toggle = menu.querySelector(".account-toggle");
        const dropdown = menu.querySelector(".account-dropdown");

        function closeMenu() {
            menu.classList.remove("open");
        }

        toggle.addEventListener("click", (e) => {
            e.stopPropagation();
            menu.classList.toggle("open");
        });

        dropdown.addEventListener("click", (e) => e.stopPropagation());
        document.addEventListener("click", (e) => {
            if (!menu.contains(e.target)) closeMenu();
        });
    }

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
        element.textContent = texts[0] || "";
        return setInterval(() => {
            index = (index + 1) % texts.length;
            element.textContent = texts[index];
        }, interval);
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
       Countdown (z. B. fuer Wellenangriffe)
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
       Zufaellige Auswahl (Loot, Dialog, Random Events)
       ========================================================= */
    function randomItem(list) {
        return list[Math.floor(Math.random() * list.length)];
    }


    /* =========================================================
       wait() fuer Timing
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
                target.textContent = "Lade Daten...";

                try {
                    const data = await fetchJSON("charaktere.json");
                    const char = data.find(c => c.id === charId);
                    if (!char) throw new Error("Charakter nicht gefunden");

                    target.innerHTML = `
                        <p class="muted">${char.rolle} - ${char.alter} Jahre</p>
                        <p>${char.details}</p>
                    `;
                    target.classList.add("fade-in");
                } catch (error) {
                    console.error(error);
                    target.textContent = "Fehler beim Laden der Daten";
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
            container.textContent = "Lade Daten...";

            try {
                const data = await fetchJSON("story.json");
                container.innerHTML = "";

                data.abschnitte.forEach(abschnitt => {
                    const card = document.createElement("article");
                    card.className = "story-card fade-in";
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
                container.textContent = "Fehler beim Laden der Daten";
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
                <article class="ort-card-inner fade-in">
                    <img src="${ort.bild}" alt="${ort.name}" loading="lazy">
                    <div>
                        <h3>${ort.name}</h3>
                        <p>${ort.beschreibung}</p>
                    </div>
                </article>
            `;
        };

        nav.textContent = "Lade Daten...";
        detail.textContent = "Ort wird geladen...";
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
                nav.textContent = "Fehler beim Laden der Daten";
                detail.textContent = "";
            });
    }

    /* =========================================================
       Fake-News / Updates
       ========================================================= */
    function initNewsFeed() {
        const feed = $("#news-feed");
        if (!feed) return;

        feed.textContent = "Lade Daten...";
        fetchJSON("updates.json")
            .then(items => {
                feed.innerHTML = items.map(item => `
                    <article class="news-card fade-in">
                        <p class="muted">${item.datum}</p>
                        <h3>${item.titel}</h3>
                        <p>${item.text}</p>
                    </article>
                `).join("");
            })
            .catch(error => {
                console.error(error);
                feed.textContent = "Fehler beim Laden der Daten";
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

    setupLanguageSwitcher();
    setupAuthLinks();
    applyTranslations(currentLang);
    window.tafI18n = {
        get lang() { return currentLang; },
        t: (key, fallback) => translateKey(key, fallback),
        format: formatTemplate,
        setLang: (lang) => applyTranslations(lang)
    };

});









async function checkMe() {
  const api = window.API_BASE || "https://localhost:44357/api/auth";
  const res = await fetch(`${api}/me`, {
    credentials: "include"
  });

  if (!res.ok) {
    // nicht eingeloggt -> zurueck zum Login
    window.location.href = "login.html";
    return;
  }

  const me = await res.json();
  const infoTarget = document.getElementById("meInfo");
  const i18n = window.tafI18n;
  if (infoTarget) {
    const template = i18n?.t
      ? i18n.t("profile.loggedIn", "Eingeloggt als: {name} ({email})")
      : "Eingeloggt als: {name} ({email})";
    const text = i18n?.format
      ? i18n.format(template, { name: me.name, email: me.email })
      : `Eingeloggt als: ${me.name} (${me.email})`;
    infoTarget.innerText = text;
  } else {
    console.log("Eingeloggt als:", me.name, me.email);
  }
}
