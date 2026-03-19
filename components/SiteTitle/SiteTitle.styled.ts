import styled from "@emotion/styled";

export const StyledTitle = styled.h1`
  font-family: "Sono", monospace;
  font-optical-sizing: auto;
  font-size: calc(21 / 16 * 1rem);
  font-weight: 300;
  text-transform: uppercase;
  word-spacing: -0.5ch;
  color: var(--color-neutral);
  grid-row: 1;
  grid-column: 2 / -2;
  z-index: 10;
  margin: 0;
  margin-top: var(--base-line-05x);
  padding: 0;

  a {
    text-decoration: none;
    color: inherit;
  }
`;
