import styled from "@emotion/styled";

export const List = styled.ul`
  font-family: "Sono", monospace;

  position: relative;
  display: flex;
  margin: 0;
  align-items: flex-start;
  font-size: 0.75rem;
  color: var(--color-neutral);
`;

export const Item = styled.li`
  direction: ltr;
  width: 1px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: absolute;
  writing-mode: sideways-lr;
  left: var(--position);

  :dir(rtl) {
    left: unset;
    right: calc(var(--position) - 1px);
  }

  &[data-key="original"] {
    top: calc(var(--runner-thickness) * -3);
    color: var(--color-loud);
  }
`;

export const Label = styled.span`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;

  &::after {
    content: "";
    margin-bottom: 0.25rem;
    display: inline-block;
    width: 1px;
    height: var(--base-line-05x);
    background-color: var(--color-neutral);
    vertical-align: middle;
  }

  [data-key="original"] > &::after {
    height: calc(var(--base-line-05x) + var(--runner-thickness) * 3);
    background-color: var(--color-loud);
  }
`;
