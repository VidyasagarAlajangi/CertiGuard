/**
 * Converts LibreOffice Draw coordinates (in cm, top-left origin)
 * to pdf-lib coordinates (in pt, bottom-left origin).
 *
 * @param {number} cmX - X position in centimeters (from left)
 * @param {number} cmY - Y position in centimeters (from top)
 * @param {number} pageHeight - Height of the PDF page in points
 * @returns {{ x: number, y: number }} Converted coordinates in points
 */
export function convertCmToPdfCoords(cmX, cmY, pageHeight) {
    const CM_TO_PT = 28.35;
    const x = cmX * CM_TO_PT;
    const yFromTop = cmY * CM_TO_PT;
    const y = pageHeight - yFromTop;
    return { x, y };
  }
  