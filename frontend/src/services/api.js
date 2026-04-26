/**
 * Realizuje autentizační požadavek pro získání přístupového tokenu (JWT).
 * Využívá formát x-www-form-urlencoded vyžadovaný standardem OAuth2 Password Flow.
 */
export const login = async (email, password) => {
  // Konstrukce datového těla ve formátu formulářových parametrů.
  const formData = new URLSearchParams();
  formData.append('username', email); // FastAPI standardně očekává klíč 'username'.
  formData.append('password', password);

  const response = await fetch(`/token`, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  // Validace úspěšnosti odpovědi. Při chybě vyvolá výjimku s textem pro UI.
  if (!response.ok) {
    throw new Error('Chyba při přihlášení. Zkontrolujte e-mail a heslo.');
  }

  // Deserializace JSON odpovědi a návrat přístupového tokenu.
  const data = await response.json();
  return data.access_token;
};

/**
 * Získá data o identitě aktuálně autentizovaného uživatele.
 * Vyžaduje platný Bearer token v hlavičce požadavku.
 */
export const fetchCurrentUser = async (token) => {
  const response = await fetch(`/users/me`, {
    method: 'GET',
    headers: {
      // Předání autorizačního tokenu pro přístup k chráněnému zdroji.
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Chyba při načítání dat uživatele.');
  }

  // Návrat asynchronně zpracovaného JSON objektu s daty uživatele.
  return response.json();
};