// Ensures static assets in `public/` resolve correctly for both root and sub-path deployments
export const getAssetUrl = (assetPath: string): string => {
  const normalizedPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  const base = import.meta.env.BASE_URL ?? '/';
  const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
  return `${baseWithSlash}${normalizedPath}`;
};
