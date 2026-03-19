import styled from "@emotion/styled";

export const Slider = styled.div`
  --color-start: var(--color-neutral);
  --color-end: var(--color-neutral);

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--base-line-05x);
  width: 100%;

  input {
    position: relative;
    margin: 0;
    padding: 0;
    width: 100%;
    height: var(--thumb-diameter);
    background: transparent;
    border-radius: 0;
    appearance: none;
    cursor: pointer;
    outline: none;
    opacity: 1;

    &:focus-visible::before {
      content: "";
      position: absolute;
      display: block;
      inset: calc(var(--thumb-radius) - (var(--runner-thickness) / 2)) var(--thumb-radius);
      z-index: 0;
      outline: 0.25rem solid var(--color-glow);
      border-radius: 0rem;
      outline-offset: 0;
    }

    /* Track styling - WebKit (Chrome, Safari, Edge) */
    &::-webkit-slider-runnable-track {
      position: relative;
      width: 100%;
      height: var(--runner-thickness);
      background: linear-gradient(
        to right,
        transparent 0%,
        transparent calc(var(--thumb-radius)),
        var(--color-start) calc(var(--thumb-radius)),
        var(--color-start) calc(var(--thumb-radius) + (100% - var(--thumb-diameter)) * var(--thumb-initial-position)),
        var(--color-end) calc(var(--thumb-radius) + (100% - var(--thumb-diameter)) * var(--thumb-initial-position)),
        var(--color-end) calc(100% - var(--thumb-radius)),
        transparent calc(100% - var(--thumb-radius)),
        transparent 100%
      );
      z-index: 1;
    }

    /* Track styling - Firefox */
    &::-moz-range-track {
      position: relative;
      width: 100%;
      height: var(--runner-thickness);
      background: linear-gradient(
        to right,
        transparent 0%,
        transparent calc(var(--thumb-radius)),
        var(--color-start) calc(var(--thumb-radius)),
        var(--color-start) calc(var(--thumb-radius) + (100% - var(--thumb-diameter)) * var(--thumb-initial-position)),
        var(--color-end) calc(var(--thumb-radius) + (100% - var(--thumb-diameter)) * var(--thumb-initial-position)),
        var(--color-end) calc(100% - var(--thumb-radius)),
        transparent calc(100% - var(--thumb-radius)),
        transparent 100%
      );
      z-index: 1;
    }

    /* Thumb styling - WebKit (Chrome, Safari, Edge) */
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: var(--thumb-diameter);
      height: var(--thumb-diameter);
      background-color: var(--color-neutral);
      mask-image: url("/runner.svg");
      mask-size: 16px 10px;
      mask-repeat: no-repeat;
      mask-position: top center;
      border: none;
      border-radius: 0;
      box-shadow: none;
      cursor: pointer;
      margin-top: calc((var(--thumb-diameter) - var(--runner-thickness)) / -2);
      visibility: var(--thumb-visibility, hidden);
    }

    /* Thumb styling - Firefox */
    &::-moz-range-thumb {
      -moz-appearance: none;
      width: var(--thumb-diameter);
      height: var(--thumb-diameter);
      background-color: var(--color-neutral);
      mask-image: url("/runner.svg");
      mask-size: 16px 10px;
      mask-repeat: no-repeat;
      mask-position: top center;
      border: none;
      border-radius: 0;
      box-shadow: none;
      cursor: pointer;
      visibility: var(--thumb-visibility, hidden);
    }

    /* Thumb styling - iOS Safari */
    &::-webkit-slider-thumb:active {
      outline: none;
      border: none;
    }

    /* Thumb styling - Firefox active state */
    &::-moz-range-thumb:active {
      outline: none;
      border: none;
    }

    &:focus {
      outline: none;
    }

    &:focus::-webkit-slider-thumb {
      outline: none;
      border: none;
    }

    &:focus::-moz-range-thumb {
      outline: none;
      border: none;
    }
  }

  input:disabled {
    opacity: 1;
  }
`;
