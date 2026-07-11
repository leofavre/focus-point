import { calculateCSSCover, calculateCSSCoverPercent } from "../src/algo.ts";

const POSITION = { xPercent: 0.25, yPercent: 0.25 };

type Measurements = {
  container: { width: number; height: number };
  natural: { width: number; height: number };
};

async function measure(image: HTMLImageElement): Promise<Measurements> {
  await image.decode();

  const container = image.parentElement;

  if (!container) {
    throw new Error("Image has no container");
  }

  return {
    container: {
      width: container.clientWidth,
      height: container.clientHeight,
    },
    natural: {
      width: image.naturalWidth,
      height: image.naturalHeight,
    },
  };
}

async function applyCoverPixels(image: HTMLImageElement): Promise<void> {
  const { container, natural } = await measure(image);

  const { renderedWidth, renderedHeight, translateX, translateY } = calculateCSSCover({
    container,
    natural,
    position: POSITION,
  });

  image.style.width = `${renderedWidth}px`;
  image.style.height = `${renderedHeight}px`;
  image.style.transform = `translate(${translateX}px, ${translateY}px)`;
}

async function applyCoverPercent(image: HTMLImageElement): Promise<void> {
  const { container, natural } = await measure(image);

  const { renderedWidthPercent, translateXPercent, translateYPercent } = calculateCSSCoverPercent({
    container,
    natural,
    position: POSITION,
  });

  // Only the axis that fills the container (100%) needs to be set; the
  // overflowing axis follows from the image's intrinsic aspect ratio
  if (renderedWidthPercent === 1) {
    image.style.width = "100%";
  } else {
    image.style.height = "100%";
  }

  image.style.transform = `translate(${translateXPercent * 100}%, ${translateYPercent * 100}%)`;
}

for (const image of document.querySelectorAll<HTMLImageElement>("img.js-px")) {
  applyCoverPixels(image);
}

for (const image of document.querySelectorAll<HTMLImageElement>("img.js-percent")) {
  applyCoverPercent(image);
}
