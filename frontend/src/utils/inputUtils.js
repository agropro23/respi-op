// Utility functions for input field handling

/**
 * Prevents arrow key navigation in number input fields
 * @param {KeyboardEvent} e - The keyboard event
 */
export const preventArrowKeys = (e) => {
  // Prevent arrow keys (up, down, left, right)
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    e.preventDefault();
  }
};

/**
 * Prevents non-numeric input in number fields
 * @param {KeyboardEvent} e - The keyboard event
 */
export const preventNonNumeric = (e) => {
  // Allow: backspace, delete, tab, escape, enter, and numbers
  if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
      // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true) ||
      // Allow numbers and decimal point
      (e.keyCode >= 35 && e.keyCode <= 40) ||
      (e.keyCode >= 48 && e.keyCode <= 57) ||
      (e.keyCode >= 96 && e.keyCode <= 105) ||
      e.key === '.') {
    return;
  }
  e.preventDefault();
};

/**
 * Combined handler for number input fields
 * Prevents both arrow keys and non-numeric input
 * @param {KeyboardEvent} e - The keyboard event
 */
export const handleNumberInput = (e) => {
  preventArrowKeys(e);
  preventNonNumeric(e);
}; 