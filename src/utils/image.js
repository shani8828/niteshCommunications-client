const UPLOAD_SEGMENT = "/image/upload/";

/**
 * Ask Cloudinary for a resized, auto-format (AVIF/WebP), auto-quality version
 * of an uploaded image instead of the full-size original.
 * Non-Cloudinary URLs (e.g. local upload fallbacks) are returned unchanged.
 */
export const cldUrl = (url, width) => {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes(UPLOAD_SEGMENT)) {
    return url;
  }
  const [base, rest] = url.split(UPLOAD_SEGMENT);
  return `${base}${UPLOAD_SEGMENT}f_auto,q_auto,c_limit,w_${width}/${rest}`;
};

/**
 * srcset for an image shown at roughly `width` CSS pixels, so high-DPI phones
 * get a sharp 2x version and everyone else gets the 1x one.
 */
export const cldSrcSet = (url, width) => {
  const oneX = cldUrl(url, width);
  if (oneX === url) return undefined;
  return `${oneX} 1x, ${cldUrl(url, width * 2)} 2x`;
};

/**
 * Width-based srcset for images whose rendered size depends on the viewport
 * (e.g. full-width banners). Use together with a `sizes` attribute.
 */
export const cldResponsiveSrcSet = (url, widths) => {
  if (cldUrl(url, widths[0]) === url) return undefined;
  return widths.map((w) => `${cldUrl(url, w)} ${w}w`).join(", ");
};
