export function getSolidBlurDataUrl(color = "#0f172a") {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="9" viewBox="0 0 16 9">
      <rect width="16" height="9" fill="${color}" />
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
