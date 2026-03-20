import styled from "@emotion/styled";

export const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: none;
  touch-action: none;
  user-select: none;
  background-color: var(--color-zero);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    touch-action: none;
    user-select: none;
  }
`;

export const FocusableImage = styled.div`
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: auto;

  @media (pointer: fine) {
    &:focus-visible {
      outline: 0.25rem solid var(--color-glow);
      outline-offset: 0;
    }
  }
`;
