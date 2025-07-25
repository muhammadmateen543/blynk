// src/utils/viewTracker.js
export const trackUniqueView = (key, callback) => {
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, "1");
    callback();
  }
};
