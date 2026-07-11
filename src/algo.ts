type Dimensions = {
  width: number;
  height: number;
};

type ObjectPosition = {
  /** X-axis percentage (from 0 to 1) */
  xPercent: number;
  /** Y-axis percentage (from 0 to 1) */
  yPercent: number;
};

type CalculateCoverParams = {
  /** Dimensions of the container */
  container: Dimensions;
  /** Dimensions of the image */
  natural: Dimensions;
  /** Desired alignment (defaults to 0.5, 0.5) */
  position?: ObjectPosition;
};

type CoverResult = {
  /** Final width of the resized image */
  renderedWidth: number;
  /** Final height of the resized image */
  renderedHeight: number;
  /** X position of the image's left edge relative to the container */
  offsetX: number;
  /** Y position of the image's top edge relative to the container */
  offsetY: number;
  /** X offset ready for CSS translate(), in pixels (same as offsetX, since pixel translations are absolute) */
  translateX: number;
  /** Y offset ready for CSS translate(), in pixels (same as offsetY, since pixel translations are absolute) */
  translateY: number;
};

type CoverPercentResult = {
  /** Final width of the resized image, as a fraction of the container width (1 = 100%) */
  renderedWidthPercent: number;
  /** Final height of the resized image, as a fraction of the container height (1 = 100%) */
  renderedHeightPercent: number;
  /** X position of the image's left edge, as a fraction of the container width */
  offsetXPercent: number;
  /** Y position of the image's top edge, as a fraction of the container height */
  offsetYPercent: number;
  /** X offset ready for CSS translate(), as a fraction of the image's own rendered width */
  translateXPercent: number;
  /** Y offset ready for CSS translate(), as a fraction of the image's own rendered height */
  translateYPercent: number;
};

/**
 * Calculates the positioning and dimensions of an image using object-fit: cover and object-position.
 */
export function calculateCSSCover({
  container,
  natural,
  position = { xPercent: 0.5, yPercent: 0.5 },
}: CalculateCoverParams): CoverResult {
  // Calculate the scale factor required to cover the entire container
  const scaleX = container.width / natural.width;
  const scaleY = container.height / natural.height;
  const scale = Math.max(scaleX, scaleY);

  // Determine the final rendered size of the image
  const renderedWidth = natural.width * scale;
  const renderedHeight = natural.height * scale;

  // Calculate excess (values will be negative or zero)
  const remainingSpaceX = container.width - renderedWidth;
  const remainingSpaceY = container.height - renderedHeight;

  // Apply the object-position formula to find the final offset
  const offsetX = remainingSpaceX * position.xPercent;
  const offsetY = remainingSpaceY * position.yPercent;

  return {
    renderedWidth,
    renderedHeight,
    offsetX,
    offsetY,
    translateX: offsetX,
    translateY: offsetY,
  };
}

/**
 * Same calculation as calculateCSSCover, but every result is expressed as a
 * fraction of the container's dimensions (1 = 100%) instead of pixels.
 * Widths and X offsets are relative to the container width; heights and
 * Y offsets are relative to the container height.
 */
export function calculateCSSCoverPercent({
  container,
  natural,
  position = { xPercent: 0.5, yPercent: 0.5 },
}: CalculateCoverParams): CoverPercentResult {
  // In relative terms, only the aspect ratios matter
  const containerRatio = container.width / container.height;
  const naturalRatio = natural.width / natural.height;

  // With cover, one axis always fills the container exactly (100%) while the
  // other overflows by the ratio between the two aspect ratios
  const imageIsWider = naturalRatio > containerRatio;
  const renderedWidthPercent = imageIsWider ? naturalRatio / containerRatio : 1;
  const renderedHeightPercent = imageIsWider ? 1 : containerRatio / naturalRatio;

  // Excess relative to the container (negative or zero), then the
  // object-position formula, same as in the pixel version
  const offsetXPercent = (1 - renderedWidthPercent) * position.xPercent;
  const offsetYPercent = (1 - renderedHeightPercent) * position.yPercent;

  // translate() percentages are relative to the image itself, not the
  // container, so convert the container-relative offsets by dividing them
  // by the container-relative rendered size
  const translateXPercent = offsetXPercent / renderedWidthPercent;
  const translateYPercent = offsetYPercent / renderedHeightPercent;

  return {
    renderedWidthPercent,
    renderedHeightPercent,
    offsetXPercent,
    offsetYPercent,
    translateXPercent,
    translateYPercent,
  };
}
