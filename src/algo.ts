export type ObjectFit = "cover" | "contain" | "fill" | "none" | "scale-down";

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

type CalculateObjectFitParams = {
  /** Dimensions of the container */
  container: Dimensions;
  /** Dimensions of the image */
  natural: Dimensions;
  /** Fit strategy (defaults to "cover") */
  fit?: ObjectFit;
  /** Desired alignment (defaults to 0.5, 0.5) */
  position?: ObjectPosition;
};

type ObjectFitResult = {
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

type ObjectFitPercentResult = {
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
 * Calculates the positioning and dimensions of an image using object-fit (cover or contain)
 * and object-position.
 */
export function calculateCSSObjectFit({
  container,
  natural,
  fit = "cover",
  position = { xPercent: 0.5, yPercent: 0.5 },
}: CalculateObjectFitParams): ObjectFitResult {
  const scaleX = container.width / natural.width;
  const scaleY = container.height / natural.height;

  // Every fit except fill preserves the aspect ratio (same scale on both
  // axes); fill stretches each axis to the container independently
  let scaleW: number;
  let scaleH: number;

  switch (fit) {
    case "cover":
      // Largest factor wins: the image fills the container and overflows
      scaleW = scaleH = Math.max(scaleX, scaleY);
      break;
    case "contain":
      // Smallest factor wins: the image fits entirely inside the container
      scaleW = scaleH = Math.min(scaleX, scaleY);
      break;
    case "fill":
      scaleW = scaleX;
      scaleH = scaleY;
      break;
    case "none":
      // The image keeps its natural size
      scaleW = scaleH = 1;
      break;
    case "scale-down":
      // Behaves as none or contain, whichever results in a smaller image
      scaleW = scaleH = Math.min(1, scaleX, scaleY);
      break;
  }

  // Determine the final rendered size of the image
  const renderedWidth = natural.width * scaleW;
  const renderedHeight = natural.height * scaleH;

  // Calculate remaining space (negative for the overflowing axis with cover,
  // positive for the leftover axis with contain)
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
 * Same calculation as calculateCSSObjectFit, but every result is expressed as a
 * fraction of the container's dimensions (1 = 100%) instead of pixels.
 * Widths and X offsets are relative to the container width; heights and
 * Y offsets are relative to the container height.
 */
export function calculateCSSObjectFitPercent({
  container,
  natural,
  fit = "cover",
  position = { xPercent: 0.5, yPercent: 0.5 },
}: CalculateObjectFitParams): ObjectFitPercentResult {
  // For cover, contain and fill only the aspect ratios matter; none and
  // scale-down also depend on the image's absolute natural size
  const containerRatio = container.width / container.height;
  const naturalRatio = natural.width / natural.height;
  const imageIsWider = naturalRatio > containerRatio;

  // For cover and contain one axis always matches the container exactly
  // (100%): with cover it is the axis where the image is proportionally
  // smaller (the other overflows), with contain it is the axis where it is
  // proportionally larger (the other falls short). The remaining axis
  // differs by the ratio between the aspect ratios.
  const containWidthPercent = imageIsWider ? 1 : naturalRatio / containerRatio;
  const containHeightPercent = imageIsWider ? containerRatio / naturalRatio : 1;
  const noneWidthPercent = natural.width / container.width;
  const noneHeightPercent = natural.height / container.height;

  let renderedWidthPercent: number;
  let renderedHeightPercent: number;

  switch (fit) {
    case "cover":
      renderedWidthPercent = imageIsWider ? naturalRatio / containerRatio : 1;
      renderedHeightPercent = imageIsWider ? 1 : containerRatio / naturalRatio;
      break;
    case "contain":
      renderedWidthPercent = containWidthPercent;
      renderedHeightPercent = containHeightPercent;
      break;
    case "fill":
      renderedWidthPercent = 1;
      renderedHeightPercent = 1;
      break;
    case "none":
      renderedWidthPercent = noneWidthPercent;
      renderedHeightPercent = noneHeightPercent;
      break;
    case "scale-down":
      // Behaves as none or contain, whichever results in a smaller image;
      // both preserve the aspect ratio, so comparing one axis is enough
      if (noneWidthPercent <= containWidthPercent) {
        renderedWidthPercent = noneWidthPercent;
        renderedHeightPercent = noneHeightPercent;
      } else {
        renderedWidthPercent = containWidthPercent;
        renderedHeightPercent = containHeightPercent;
      }
      break;
  }

  // Remaining space relative to the container, then the object-position
  // formula, same as in the pixel version
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
