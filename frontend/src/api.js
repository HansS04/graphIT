


export const login = async (email, password) => {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await fetch(`/token`, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (!response.ok) {
    throw new Error('Chyba při přihlášení. Zkontrolujte e-mail a heslo.');
  }

  const data = await response.json();
  return data.access_token;
};

export const fetchCurrentUser = async (token) => {
  const response = await fetch(`/users/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Chyba při načítání dat uživatele.');
  }

  return response.json();
};