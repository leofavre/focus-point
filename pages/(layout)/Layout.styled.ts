import styled from "@emotion/styled";

/** Shared full-width message (loading, errors) in the main content area. */
export const LayoutMessage = styled.h3`
  grid-column: 1 / -1;
  grid-row: 1 / -2;
  margin: auto;
`;

/** Centered container for interactive content (e.g. Choose Image button) in the main content area. */
export const LayoutCenter = styled.div`
  grid-column: 1 / -1;
  grid-row: 1 / -2;
  margin: auto;
  z-index: 8;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--base-line-2x);
`;

/** Header row; display: contents so title and privacy link are laid out on the main grid. */
export const LayoutHeader = styled.header`
  display: contents;
`;

/** Wrapper for header links (shortcuts, privacy); positioned on the main grid, aligned top/end. */
export const HeaderLinks = styled.span`
  grid-row: 1;
  grid-column: 2 / -2;
  align-self: start;
  justify-self: end;
  margin-top: var(--base-line-05x);
  z-index: 10;
  display: flex;
  gap: var(--base-line-1x);
`;

/** Link in the header (shortcuts, privacy). */
export const PrivacyLink = styled.a`
  font-size: calc(14 / 16 * 1rem);
  color: var(--color-neutral);
  text-decoration: none;

  &:hover {
    color: var(--color-loud);
  }
`;

/** Wrapper for bottom bar controls; display: contents preserves parent grid layout. */
export const EditorControlsNav = styled.nav`
  display: contents;
`;

export const LayoutGrid = styled.main`
  position: relative;
  display: grid;

  grid-template-columns:
    minmax(var(--base-line-05x), 1fr)
    minmax(0, 14ch)
    minmax(0, 14ch)
    minmax(8rem, 50rem)
    minmax(0, 14ch)
    minmax(0, 14ch)
    minmax(var(--base-line-05x), 1fr);

  grid-template-rows: 8rem 1fr auto;
  overflow: hidden;
  gap: var(--base-line-05x);
  margin: 0;
  width: 100dvw;
  min-height: 100dvh;

  [data-component="FocalPointEditor"] {
    grid-row: 1 / 3;
    grid-column: 1 / -1;
    overflow: hidden;
  }

  [data-component="CodeSnippet"] {
    grid-row: 2 / 4;
    grid-column: 2 / -2;
    margin: auto auto 0 auto;
    width: clamp(25rem, 100dvw, 40rem);
  }

  [data-component="AspectRatioSlider"] {
    position: relative;
    grid-row: 3;
    grid-column: 4;
    margin-left: auto;
    margin-right: auto;
    max-width: 1200px;
  }

  [data-component="FocalPointButton"] {
    position: relative;
    grid-row: 3;
    grid-column: 2;
    margin-bottom: auto;
  }

  [data-component="ImageOverflowButton"] {
    position: relative;
    grid-row: 3;
    grid-column: 3;
    margin-bottom: auto;
  }

  [data-component="CodeSnippetButton"] {
    position: relative;
    grid-row: 3;
    grid-column: 5;
    margin-bottom: auto;
  }

  [data-component="ImageUploaderButton"] {
    position: relative;
    grid-row: 3;
    grid-column: 6;
    margin-bottom: auto;
  }

  [data-component="ImageUploaderButton"] {
    z-index: 8;
  }

  [data-component="FocalPoint"] {
    z-index: 5;
  }

  [data-component="HowToUse"] {
    z-index: 3;
  }

  @media (aspect-ratio: 4/5), (max-aspect-ratio: 4/5) {
    grid-template-columns:
      minmax(var(--base-line-05x), 1fr)
      minmax(0, 16ch)
      minmax(0, 16ch)
      minmax(0, 16ch)
      minmax(var(--base-line-05x), 1fr);

    grid-template-rows: 8rem 1fr auto 4rem;

    [data-component="AspectRatioSlider"] {
      grid-column: 2 / -2;
      width: calc(100% + var(--thumb-diameter));
      margin-left: calc(var(--thumb-radius) * -1);
    }

    [data-component="FocalPointButton"],
    [data-component="ImageOverflowButton"],
    [data-component="CodeSnippetButton"],
    [data-component="ImageUploaderButton"] {
      grid-row: 4;
    }

    [data-component="CodeSnippetButton"] {
      grid-column: 4;
    }

    [data-component="ImageUploaderButton"] {
      grid-column: 5;
      display: none;
    }
  }
`;
