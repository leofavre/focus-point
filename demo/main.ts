import {
  calculateCSSObjectFit,
  calculateCSSObjectFitPercent,
  type ObjectFit,
} from "../src/algo.ts";

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

async function applyFitPixels(image: HTMLImageElement, fit: ObjectFit): Promise<void> {
  const { container, natural } = await measure(image);

  const { renderedWidth, renderedHeight, translateX, translateY } = calculateCSSObjectFit({
    container,
    natural,
    fit,
    position: POSITION,
  });

  image.style.width = `${renderedWidth}px`;
  image.style.height = `${renderedHeight}px`;
  image.style.transform = `translate(${translateX}px, ${translateY}px)`;
}

async function applyFitPercent(image: HTMLImageElement, fit: ObjectFit): Promise<void> {
  const { container, natural } = await measure(image);

  const { renderedWidthPercent, translateXPercent, translateYPercent } =
    calculateCSSObjectFitPercent({
      container,
      natural,
      fit,
      position: POSITION,
    });

  // Only the axis that matches the container (100%) needs to be set; the
  // other axis follows from the image's intrinsic aspect ratio. Clear both
  // first because the filling axis changes when the fit changes.
  image.style.width = "";
  image.style.height = "";

  if (renderedWidthPercent === 1) {
    image.style.width = "100%";
  } else {
    image.style.height = "100%";
  }

  image.style.transform = `translate(${translateXPercent * 100}%, ${translateYPercent * 100}%)`;
}

function applyFitEverywhere(fit: ObjectFit): void {
  for (const image of document.querySelectorAll<HTMLImageElement>(".css-fit img")) {
    image.style.objectFit = fit;
  }

  for (const image of document.querySelectorAll<HTMLImageElement>("img.js-px")) {
    applyFitPixels(image, fit);
  }

  for (const image of document.querySelectorAll<HTMLImageElement>("img.js-percent")) {
    applyFitPercent(image, fit);
  }
}

function requireToggleButton(): HTMLButtonElement {
  const button = document.querySelector<HTMLButtonElement>("#toggle-fit");

  if (!button) {
    throw new Error("#toggle-fit not found");
  }

  return button;
}

const toggleButton = requireToggleButton();

let currentFit: ObjectFit = "cover";

function render(): void {
  toggleButton.textContent = `object-fit: ${currentFit}`;
  applyFitEverywhere(currentFit);
}

toggleButton.addEventListener("click", () => {
  currentFit = currentFit === "cover" ? "contain" : "cover";
  render();
});

render();
