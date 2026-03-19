import styled from "@emotion/styled";

export const Container = styled.div`
  container-type: inline-size;
  container-name: aspect-ratio-slider;
  width: 100%;
`;

export const Wrapper = styled.div`
  width: 100%;
  box-sizing: border-box;
  height: 4rem;

  [data-component="AspectRatioControl"] {
    position: relative;
  }

  [data-component="AspectRatioRuler"] {
    position: relative;
    margin-left: calc(var(--thumb-radius));
    margin-right: calc(var(--thumb-radius) + 1px);
    margin-top: calc((var(--thumb-diameter) / -2) + (var(--runner-thickness) / 2));
    pointer-events: none;
  }
`;
