(function () {
  const API_BASE = window.API_BASE || "/api";

  async function apiPost(endpoint, payload) {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload || {})
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data.error || `Fehler (${res.status})`;
      throw new Error(msg);
    }
    return data;
  }

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

  async function fetchMe() {
    const res = await fetch(`${API_BASE}/me.php`, { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Nicht eingeloggt");
    }
    return data;
  }

  async function handleProfile() {
    const infoTarget = document.getElementById("meInfo");
    if (!infoTarget) return;
    try {
      const me = await fetchMe();
      const i18n = window.tafI18n;
      const template = i18n?.t
        ? i18n.t("profile.loggedIn", "Eingeloggt als: {name} ({email})")
        : "Eingeloggt als: {name} ({email})";
      const text = i18n?.format
        ? i18n.format(template, { name: me.name, email: me.email })
        : `Eingeloggt als: ${me.name} (${me.email})`;
      infoTarget.innerText = text;
    } catch (err) {
      window.location.href = "login.html";
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");
    registerForm?.addEventListener("submit", handleRegister);
    loginForm?.addEventListener("submit", handleLogin);
    handleProfile();
  });

  // Expose helpers if needed elsewhere
  window.appAuth = { register: handleRegister, login: handleLogin, me: fetchMe };
})();
