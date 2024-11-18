// Storage utilities
export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

export const setStorageItem = (key: string, value: any): void => {
  localStorage.setItem(key, JSON.stringify(value));
};