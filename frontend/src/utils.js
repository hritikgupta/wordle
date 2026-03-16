// Letter color states
export const LETTER_STATES = {
  CORRECT: 'green',
  PRESENT: 'yellow',
  ABSENT: 'gray',
  UNANSWERED: 'white',
};

export function getTileColor(state) {
  switch (state) {
    case 'green':
      return 'bg-green-500';
    case 'yellow':
      return 'bg-yellow-400';
    case 'gray':
      return 'bg-gray-400';
    default:
      return 'bg-white border-2 border-gray-300';
  }
}

export function getKeyboardKeyColor(letter, allGuesses) {
  const colors = { green: 0, yellow: 0, gray: 0 };

  for (const guess of allGuesses) {
    for (let i = 0; i < guess.guess.length; i++) {
      if (guess.guess[i] === letter) {
        const state = guess.feedback[i];
        if (state === 'green') {
          return 'bg-green-500 text-white';
        }
        if (state === 'yellow') {
          colors.yellow = 1;
        } else if (state === 'gray') {
          colors.gray = 1;
        }
      }
    }
  }

  if (colors.yellow) return 'bg-yellow-400 text-white';
  if (colors.gray) return 'bg-gray-400 text-white';
  return 'bg-gray-200';
}

export function formatTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}

export function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}

export const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
];
