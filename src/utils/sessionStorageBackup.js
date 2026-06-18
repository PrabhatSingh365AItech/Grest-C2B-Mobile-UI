// Backup and restore sessionStorage using localStorage to survive WebView restarts/reloads
// on memory-constrained Android devices when taking pictures/uploading.

const SESSION_BACKUP_KEY = 'session_backup_';

// 1. Restore backup on startup
try {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(SESSION_BACKUP_KEY)) {
      const originalKey = key.slice(SESSION_BACKUP_KEY.length);
      // Only restore if sessionStorage doesn't already have it
      if (sessionStorage.getItem(originalKey) === null) {
        sessionStorage.setItem(originalKey, localStorage.getItem(key));
      }
    }
  }
  console.log('[SessionBackup] Session storage restored successfully.');
} catch (e) {
  console.error('[SessionBackup] Failed to restore sessionStorage backup:', e);
}

// 2. Intercept sessionStorage modifications to update localStorage backups
const originalSetItem = sessionStorage.setItem;
sessionStorage.setItem = function (key, value) {
  try {
    originalSetItem.apply(this, arguments);
    localStorage.setItem(SESSION_BACKUP_KEY + key, value);
  } catch (e) {
    console.error(`[SessionBackup] Failed to backup sessionStorage item for key "${key}":`, e);
  }
};

const originalRemoveItem = sessionStorage.removeItem;
sessionStorage.removeItem = function (key) {
  try {
    originalRemoveItem.apply(this, arguments);
    localStorage.removeItem(SESSION_BACKUP_KEY + key);
  } catch (e) {
    console.error(`[SessionBackup] Failed to remove sessionStorage backup for key "${key}":`, e);
  }
};

const originalClear = sessionStorage.clear;
sessionStorage.clear = function () {
  try {
    originalClear.apply(this, arguments);
    // Remove all session backup keys from localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(SESSION_BACKUP_KEY)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (e) {
    console.error('[SessionBackup] Failed to clear sessionStorage backup:', e);
  }
};
