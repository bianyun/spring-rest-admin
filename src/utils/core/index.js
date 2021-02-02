export function isString(str) {
  return str && typeof str.valueOf() === 'string'
}

export const random = (a = 1, b = 0) => {
  const lower = Math.min(a, b);
  const upper = Math.max(a, b);
  return lower + Math.random() * (upper - lower);
};

export const randomInt = (a = 1, b = 0) => {
  const lower = Math.ceil(Math.min(a, b));
  const upper = Math.floor(Math.max(a, b));
  return Math.floor(lower + Math.random() * (upper - lower + 1))
};

export function tempCreateATagAndClick(path) {
  const aTag = document.createElement('a');
  aTag.setAttribute('href', path);
  aTag.setAttribute('target', '_blank');
  aTag.setAttribute('rel', 'noopener');
  document.body.appendChild(aTag);
  aTag.click();
  document.body.removeChild(aTag)
}

