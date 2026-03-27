# Chatverlauf - Game Webseite Projekt

## Konversation vom 4. Januar 2026

---

## 1. Sichere PDO Login-Funktion

**Anfrage**: Schreibe mir eine sichere PDO Login-Funktion

### Antwort - Sichere Login-Funktion in PHP:

```php
<?php
session_start();

class LoginHandler {
    private $pdo;
    private $dbHost = 'localhost';
    private $dbName = 'deine_db';
    private $dbUser = 'db_user';
    private $dbPass = 'db_password';
    
    public function __construct() {
        try {
            $this->pdo = new PDO(
                "mysql:host=" . $this->dbHost . ";dbname=" . $this->dbName . ";charset=utf8mb4",
                $this->dbUser,
                $this->dbPass,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch (PDOException $e) {
            die('Datenbankfehler: ' . $e->getMessage());
        }
    }
    
    public function login($email, $password) {
        // Input-Validierung
        if (empty($email) || empty($password)) {
            return ['success' => false, 'message' => 'Email und Passwort erforderlich'];
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['success' => false, 'message' => 'Ungültige Email-Adresse'];
        }
        
        try {
            // Prepared Statement gegen SQL-Injection
            $stmt = $this->pdo->prepare('SELECT id, email, password, username FROM users WHERE email = ? LIMIT 1');
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            
            // Rate Limiting (optional, aber wichtig)
            if ($this->isRateLimited($email)) {
                return ['success' => false, 'message' => 'Zu viele Login-Versuche. Bitte später versuchen.'];
            }
            
            if (!$user) {
                $this->logFailedAttempt($email);
                return ['success' => false, 'message' => 'Email oder Passwort ungültig'];
            }
            
            // Passwort mit password_verify überprüfen
            if (!password_verify($password, $user['password'])) {
                $this->logFailedAttempt($email);
                return ['success' => false, 'message' => 'Email oder Passwort ungültig'];
            }
            
            // Session setzen
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['email'] = $user['email'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['login_time'] = time();
            
            // Session regenerieren (Session Fixation Prevention)
            session_regenerate_id(true);
            
            // Failed Attempts löschen
            $this->clearFailedAttempts($email);
            
            return ['success' => true, 'message' => 'Erfolgreich angemeldet'];
            
        } catch (PDOException $e) {
            error_log('Login Fehler: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Ein Fehler ist aufgetreten'];
        }
    }
    
    public function register($email, $password, $username) {
        if (empty($email) || empty($password) || empty($username)) {
            return ['success' => false, 'message' => 'Alle Felder erforderlich'];
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['success' => false, 'message' => 'Ungültige Email'];
        }
        
        if (strlen($password) < 8) {
            return ['success' => false, 'message' => 'Passwort muss mindestens 8 Zeichen lang sein'];
        }
        
        try {
            // Passwort hashen mit bcrypt
            $passwordHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
            
            $stmt = $this->pdo->prepare('INSERT INTO users (email, password, username) VALUES (?, ?, ?)');
            $stmt->execute([$email, $passwordHash, $username]);
            
            return ['success' => true, 'message' => 'Registrierung erfolgreich'];
            
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'Duplicate') !== false) {
                return ['success' => false, 'message' => 'Email bereits registriert'];
            }
            return ['success' => false, 'message' => 'Registrierung fehlgeschlagen'];
        }
    }
    
    public function logout() {
        $_SESSION = [];
        session_destroy();
        setcookie(session_name(), '', time() - 3600, '/');
    }
    
    private function isRateLimited($email, $maxAttempts = 5, $timeWindow = 900) {
        // Speichere failed attempts z.B. in Datei oder DB
        $failedFile = __DIR__ . '/logs/failed_' . md5($email) . '.txt';
        
        if (file_exists($failedFile)) {
            $data = json_decode(file_get_contents($failedFile), true);
            if ((time() - $data['last_attempt']) < $timeWindow && $data['attempts'] >= $maxAttempts) {
                return true;
            }
        }
        return false;
    }
    
    private function logFailedAttempt($email) {
        $failedFile = __DIR__ . '/logs/failed_' . md5($email) . '.txt';
        $data = ['attempts' => 1, 'last_attempt' => time()];
        
        if (file_exists($failedFile)) {
            $data = json_decode(file_get_contents($failedFile), true);
            $data['attempts']++;
            $data['last_attempt'] = time();
        }
        
        @file_put_contents($failedFile, json_encode($data));
    }
    
    private function clearFailedAttempts($email) {
        $failedFile = __DIR__ . '/logs/failed_' . md5($email) . '.txt';
        if (file_exists($failedFile)) {
            unlink($failedFile);
        }
    }
}

// Verwendungsbeispiel:
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $handler = new LoginHandler();
    
    if (isset($_POST['login'])) {
        $result = $handler->login($_POST['email'], $_POST['password']);
    } elseif (isset($_POST['register'])) {
        $result = $handler->register($_POST['email'], $_POST['password'], $_POST['username']);
    }
    
    header('Content-Type: application/json');
    echo json_encode($result);
    exit;
}
?>
```

**Wichtige Sicherheitsmerkmale:**
- ✅ **Prepared Statements** - Schutz vor SQL-Injection
- ✅ **password_hash()** - Sichere Passwort-Speicherung mit Bcrypt
- ✅ **Session Regeneration** - Schutz vor Session Fixation
- ✅ **Rate Limiting** - Schutz vor Brute-Force-Angriffen
- ✅ **Input-Validierung** - Email und Passwort-Länge
- ✅ **Error Handling** - Generische Fehlermeldungen

---

## 2. Technische Erklärung der Game-Webseite

**Anfrage**: Kannst du meine Code für Game Webseite erklären, was ich hier benutzt habe und wie das aussieht technisch?

### Projekt-Struktur

```
c:\Users\nooro\6.Semester\projket_internet_technologie_GDD\
├── charaktere.html
├── index.html
├── api/
│   ├── db.php              → SQLite Datenbankverbindung
│   ├── login.php           → Session-basierter Login
│   ├── me.php              → Profil-Abruf
│   └── register.php        → Benutzer-Registrierung
├── public/
│   ├── app.js              → Login/Register JavaScript
│   ├── charaktere.html     → Charaktere-Übersicht
│   ├── charaktere.json     → Charaktere-Daten
│   ├── datenschutz.html    → Datenschutz-Seite
│   ├── index.html          → Startseite
│   ├── login.html          → Login-Formular
│   ├── mechaniken.html     → Spielmechaniken
│   ├── orte.html           → Locations
│   ├── orte.json           → Orte-Daten
│   ├── profil.html         → Benutzer-Profil
│   ├── register.html       → Registrierungs-Formular
│   ├── script.js           → Haupt-JavaScript (Tema, i18n, Navigation)
│   ├── story.html          → Story & Team
│   ├── story.json          → Story-Inhalte
│   ├── style.css           → Responsive Design
│   ├── updates.json        → Game Updates/News
│   └── pictures/           → Bilder-Assets
└── TafCms/                 → CMS-System (C#/.NET)
```

### Architektur & Technologie-Stack

#### **Backend (PHP + SQLite)**

**db.php** - Datenbankverbindung:
```php
<?php
declare(strict_types=1);

$dbPath = __DIR__ . '/../users.db';

$db = new PDO('sqlite:' . $dbPath, null, null, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

// Simple schema bootstrap for the users table
$db->exec("
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)");
?>
```

**login.php** - Session-basierter Login:
```php
<?php
declare(strict_types=1);

session_set_cookie_params([
    'lifetime' => 86400 * 7, // one week
    'path' => '/',
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/db.php';

function respond(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    respond(['error' => 'Keine Daten erhalten'], 400);
}

$email = strtolower(trim($data['email'] ?? ''));
$passwordPlain = $data['password'] ?? '';

if ($email === '' || $passwordPlain === '') {
    respond(['error' => 'E-Mail und Passwort sind erforderlich'], 400);
}

$stmt = $db->prepare('SELECT id, name, email, password FROM users WHERE email = :email LIMIT 1');
$stmt->execute([':email' => $email]);
$user = $stmt->fetch();

if (!$user || !password_verify($passwordPlain, $user['password'])) {
    respond(['error' => 'E-Mail oder Passwort ist falsch'], 401);
}

$_SESSION['user_id'] = (int) $user['id'];

respond([
    'success' => true,
    'name' => $user['name'],
    'email' => $user['email'],
]);
?>
```

#### **Frontend - HTML (index.html)**

Struktur:
```html
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="The After Life: Survival-Adventure auf einer Insel...">
    <meta name="keywords" content="The After Life, Survival Game, Indie Game...">
    <meta property="og:title" content="The After Life - Game Projekt">
    <title>The After Life - Game Projekt</title>
    <link rel="stylesheet" href="style.css">
    <script>
        window.API_BASE = "/api";
    </script>
</head>
<body id="top">
    <!-- Navigation mit Hamburger-Menu -->
    <nav aria-label="Hauptnavigation">
        <button class="nav-toggle" aria-label="Menue oeffnen">Menu</button>
        <div class="nav-links">
            <a href="index.html" class="active">Ueberblick</a>
            <a href="charaktere.html">Charaktere</a>
            <a href="orte.html">Orte</a>
            <a href="mechaniken.html">Spielmechaniken</a>
            <a href="story.html">Story & Team</a>
            <a href="datenschutz.html">Datenschutz</a>
        </div>
        
        <!-- Theme-Umschalter -->
        <button class="theme-toggle" aria-label="Design umschalten">MOON</button>
        
        <!-- Account-Menü -->
        <div class="account-menu">
            <button type="button" class="account-toggle button secondary">Konto</button>
            <div class="account-dropdown">
                <a href="login.html" class="login">Anmelden</a>
                <a href="register.html" class="register">Konto erstellen</a>
                <a href="profil.html" class="profile">Profil</a>
            </div>
        </div>
    </nav>
</body>
</html>
```

#### **Frontend - JavaScript (script.js)**

Hauptmerkmale:

1. **Selektor-Shortcuts:**
```javascript
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

window.API_BASE = window.API_BASE || "/api";
```

2. **Internationalisierung (i18n) - Deutsch & Englisch:**
```javascript
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
    en: { /* English translations */ }
};

let currentLang = localStorage.getItem("taf-lang") === "en" ? "en" : "de";
```

3. **Sprach-Umschaltung & DOM-Update:**
Dynamisches Übersetzen von HTML-Elementen basierend auf den definierten Selektoren.

#### **Frontend - JavaScript (app.js)**

API-Kommunikation:
```javascript
(function () {
  const API_BASE = window.API_BASE || "/api";

  // Asynchrone POST-Anfragen an die API
  async function apiPost(endpoint, payload) {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",  // Session-Cookies senden
      body: JSON.stringify(payload || {})
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data.error || `Fehler (${res.status})`;
      throw new Error(msg);
    }
    return data;
  }

  // Registrierungs-Handler
  async function handleRegister(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn && (submitBtn.disabled = true);

    try {
      const password = form.password.value;
      const confirm = form.confirmPassword ? form.confirmPassword.value : "";
      if (confirm && password !== confirm) {
        throw new Error("Passwoerter stimmen nicht ueberein");
      }

      const payload = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        password
      };
      await apiPost("register.php", payload);
      window.location.href = "profil.html";
    } catch (err) {
      alert(err.message || "Registrierung fehlgeschlagen");
    } finally {
      submitBtn && (submitBtn.disabled = false);
    }
  }

  // Login-Handler
  async function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn && (submitBtn.disabled = true);

    try {
      const payload = {
        email: form.email.value.trim(),
        password: form.password.value
      };
      await apiPost("login.php", payload);
      window.location.href = "profil.html";
    } catch (err) {
      alert(err.message || "Login fehlgeschlagen");
    } finally {
      submitBtn && (submitBtn.disabled = false);
    }
  }
})();
```

#### **Frontend - CSS (style.css)**

Design-System mit CSS Custom Properties:

```css
/* Theme & Tokens */
:root {
  --nav-height: 72px;
  --space: clamp(1rem, 1vw + 0.5rem, 1.5rem);
  --radius: 10px;
  --shadow-soft: 0 12px 30px rgba(0,0,0,0.25);
  --shadow-strong: 0 18px 40px rgba(0,0,0,0.35);
  --ease: 200ms ease;

  /* Dark Theme (Default) */
  --color-bg: #0d1117;
  --color-surface: #161b22;
  --color-surface-2: #1f2530;
  --color-text: #e6e9ef;
  --color-text-muted: #9aa4b5;
  --color-accent: #e63946;        /* Rot */
  --color-link: #6ab0ff;
  --color-border: #2a3140;
  --color-hero-overlay: rgba(0,0,0,0.55);

  font-family: "Space Grotesk", "Inter", "Segoe UI", Arial, sans-serif;
  color-scheme: dark;
}

/* Light Theme */
:root.light-theme {
  --color-bg: #f4f6fb;
  --color-surface: #ffffff;
  --color-surface-2: #f0f2f7;
  --color-text: #0f172a;
  --color-text-muted: #445066;
  --color-border: #d8dde8;
  --color-hero-overlay: rgba(0,0,0,0.35);
  color-scheme: light;
}

/* Global Base */
* { box-sizing: border-box; }
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100%;
  overflow-x: hidden;
}
```

### Login-Flow (Workflow)

1. **Benutzer navigiert zu `login.html`**
2. **Formular wird gefüllt** (Email + Passwort)
3. **JavaScript (app.js) fängt Submit ab** mit `event.preventDefault()`
4. **FETCH API sendet JSON-Daten an `api/login.php`**:
   - `credentials: "include"` → Session-Cookie wird mitgesendet
5. **PHP (login.php) führt aus:**
   - Session-Cookie mit HTTPOnly & SameSite=Lax setzen
   - Email normalisieren (trim, lowercase)
   - Prepared Statement ausführen (SQL-Injection-Schutz)
   - Passwort mit `password_verify()` überprüfen
   - Session-ID setzen: `$_SESSION['user_id']`
   - JSON-Response zurückgeben
6. **JavaScript erhält Response** und leitet zu `profil.html` weiter
7. **Profil-Seite lädt** und ruft `api/me.php` auf
8. **Server überprüft Session** und zeigt Benutzer-Daten

### Daten-Struktur (JSON-Dateien)

**charaktere.json**, **orte.json**, **story.json**, **updates.json:**
- Enthalten Spiel-Inhalte
- Werden von `script.js` mit Fetch geladen
- Dynamisch in HTML-Seiten eingefügt
- Unterstützen mehrsprachige Inhalte

### Sicherheitsmerkmale ✅

- **HTTPOnly Cookies** - JavaScript kann nicht auf Session zugreifen
- **SameSite=Lax** - CSRF-Schutz
- **Prepared Statements** - SQL-Injection-Schutz
- **password_verify()** - Sichere Passwort-Verifizierung
- **Input-Normalisierung** - Trim & Lowercase
- **Error-Handling** - Keine sensiblen Daten in Fehlermeldungen
- **Meta-Tags** - SEO und Social Media Sharing (Open Graph)
- **Responsive Design** - Mobile-First Ansatz

### Technologie-Zusammenfassung

| Bereich | Technologie |
|---------|-----------|
| **Backend** | PHP 7.4+ |
| **Datenbank** | SQLite (dateibasiert) |
| **Frontend** | Vanilla JavaScript (kein Framework) |
| **Styling** | CSS3 mit Custom Properties |
| **Icons** | Wahrscheinlich Material Icons / Font Awesome |
| **CMS** | ASP.NET Core (TafCms Ordner) |
| **API-Format** | RESTful JSON |
| **Session-Management** | PHP Sessions |
| **Password-Hashing** | bcrypt (via password_hash) |

---

## Workspace-Informationen

**Pfad**: `c:\Users\nooro\6.Semester\projket_internet_technologie_GDD`

**Struktur:**
```
charaktere.html
index.html
api/
  db.php
  login.php
  me.php
  register.php
public/
  app.js
  charaktere.html
  charaktere.json
  datenschutz.html
  index.html
  login.html
  mechaniken.html
  orte.html
  orte.json
  profil.html
  register.html
  script.js
  story.html
  story.json
  style.css
  updates.json
  pictures/
TafCms/
  appsettings.Development.json
  appsettings.json
  Program.cs
  TafCms.csproj
  obj/
    project.assets.json
    TafCms.csproj.nuget.dgspec.json
    TafCms.csproj.nuget.g.props
    TafCms.csproj.nuget.g.targets
  Properties/
    launchSettings.json
  Views/
    _ViewImports.cshtml
    Partials/
      blockgrid/
        area.cshtml
        areas.cshtml
        default.cshtml
        items.cshtml
      blocklist/
        default.cshtml
      singleblock/
        default.cshtml
  wwwroot/
```

---

**Erstellt:** 4. Januar 2026
**Projekt**: The After Life - Game Webseite
**Sprache**: Deutsch mit Englisch-Support
