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
  };
}
