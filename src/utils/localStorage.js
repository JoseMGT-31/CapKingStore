export const safeJSON = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

export const setItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getItem = (key, fallback = null) => {
  return safeJSON(key, fallback);
};

export const removeItem = (key) => {
  localStorage.removeItem(key);
};
