import styled from "@emotion/styled";

export const Wrapper = styled.button`
  --scale: 1;

  &[data-scale="2"] {
    --scale: 2;
  }

  --shadow-offset: calc(0.25rem * var(--scale));
  --transform-in: translate(0, 0);
  --transform-out: translate(var(--shadow-offset), var(--shadow-offset));

  --button-color-solid: var(--color-neutral);
  --button-color-background: var(--color-zero);
  --button-color-hover: var(--color-neutral-tint-10);
  --button-color-disabled: var(--color-neutral-tint-30);
  
  position: relative;
  display: block;
  box-sizing: border-box;
  appearance: none;
  padding: 0;
  margin: 0;
  border: none;
  background: none;

  &:focus-visible {
    outline: none;
  }

  &[data-grow] {
    width: 100%;
  }
`;

export const Container = styled.span`
  display: contents;

  ${Wrapper}[data-grow] & {
    display: block;
    container-type: inline-size;
  }
`;

export const Control = styled.span`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: calc(var(--base-line-025x) * var(--scale));
  min-width: calc((var(--base-line) + var(--base-line-05x)) * var(--scale));
  height: calc(2rem * var(--scale));
  padding: 0 calc(var(--base-line-05x) * var(--scale)) 0 calc(var(--base-line-025x) * var(--scale));
  box-sizing: border-box;
  background-color: var(--button-color-background);
  border: calc(1px * var(--scale)) solid var(--button-color-solid);
  color: var(--button-color-solid);
  cursor: pointer;
  font: inherit;
  font-size: calc(14 / 16 * 1rem * var(--scale));
  white-space: nowrap;
  width: 100%;
  appearance: none;
  user-select: none;
  touch-action: none;
  transition: background-color 66ms ease-in-out, transform 66ms ease-in-out;
  transform: var(--transform-in);

  @media (hover: hover) {
    ${Wrapper}:hover:not(:disabled) & {
      background-color: var(--button-color-hover);
    }
  
    ${Wrapper}:active:not(:disabled) & {
      transform: var(--transform-out);
    }
  }

  ${Wrapper}:not([data-toggleable]):active & {
    transform: var(--transform-out);
  }

  ${Wrapper}[data-toggleable][aria-pressed="true"] & {
    transform: var(--transform-out);

    @media (hover: hover) {
      ${Wrapper}:active:not(:disabled) & {
        transform: var(--transform-in);
      }
    }
  }

  ${Wrapper}:disabled & {
    transition: none;
    border-color: var(--button-color-disabled);
    color: var(--button-color-disabled);
    cursor: default;
  }

  ${Wrapper}:focus-visible & {
    outline: calc(0.25rem * var(--scale)) solid var(--color-glow);
    border-radius: 0rem;
    outline-offset: 0;
  }

  svg {
    width: calc(var(--base-line) * var(--scale));
    height: calc(var(--base-line) * var(--scale));
    flex-shrink: 0;
  }

  /* calc won't work in the container query */
  @container (max-width: 6rem) {
    padding: 0 calc(var(--base-line-025x) * var(--scale));
    & > svg { margin: auto; }
    & > span { display: none; }
  }

  /* calc won't work in the container query */
  ${Wrapper}[data-scale=2] & {
    @container (max-width: 12rem) {
      padding: 0 calc(var(--base-line-025x) * var(--scale));
      & > svg { margin: auto; }
      & > span { display: none; }
    }
  }
`;

export const Shadow = styled.span`
  display: block;
  position: absolute;
  inset: 0;
  transform: var(--transform-out);
  background-color: var(--button-color-solid);

  ${Wrapper}:disabled & {
    background-color: var(--button-color-disabled);
  }
`;

export const ButtonText = styled.span``;
