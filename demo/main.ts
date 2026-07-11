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

  const { renderedWidthPercent, renderedHeightPercent, translateXPercent, translateYPercent } =
    calculateCSSObjectFitPercent({
      container,
      natural,
      fit,
      position: POSITION,
    });

  // When the fit preserves the aspect ratio, setting one axis is enough:
  // the other follows from the image's intrinsic proportions. Only fill
  // distorts the image, so it is the only fit that needs both axes set.
  // Clear both first because the set axis changes when the fit changes.
  image.style.width = "";
  image.style.height = "";

  if (fit === "fill") {
    image.style.width = "100%";
    image.style.height = "100%";
  } else if (renderedHeightPercent === 1) {
    image.style.height = "100%";
  } else {
    image.style.width = `${renderedWidthPercent * 100}%`;
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

const FIT_VALUES: readonly ObjectFit[] = ["cover", "contain", "fill", "none", "scale-down"];

function parseFit(value: string): ObjectFit {
  const fit = FIT_VALUES.find((candidate) => candidate === value);

  if (!fit) {
    throw new Error(`Unknown object-fit value: ${value}`);
  }

  return fit;
}

function requireFitSelect(): HTMLSelectElement {
  const select = document.querySelector<HTMLSelectElement>("#fit-select");

  if (!select) {
    throw new Error("#fit-select not found");
  }

  return select;
}

const fitSelect = requireFitSelect();

fitSelect.addEventListener("change", () => {
  applyFitEverywhere(parseFit(fitSelect.value));
});

applyFitEverywhere(parseFit(fitSelect.value));
