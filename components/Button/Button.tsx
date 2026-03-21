import type { ComponentPropsWithoutRef, MouseEvent } from "react";
import { useCallback, useEffectEvent } from "react";
import { parseBooleanAttr } from "@/src/helpers/parseBooleanAttr";
import { ButtonText, Container, Control, Shadow, ShadowMask, Wrapper } from "./Button.styled";
import type { ButtonProps } from "./types";

export function Button({
  toggled,
  onToggle,
  onClick,
  onFocus,
  onBlur,
  "aria-label": ariaLabel,
  children,
  ref,
  type,
  scale,
  disabled,
  toggleable,
  grow,
  ...rest
}: ButtonProps) {
  const stableOnClick = useEffectEvent((event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
  });

  const stableOnToggle = useEffectEvent((toggled: boolean) => {
    onToggle?.(toggled);
  });

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      stableOnClick(event);
      if (toggleable) stableOnToggle(toggled);
    },
    [toggled, toggleable],
  );

  return (
    <Wrapper
      ref={ref}
      data-toggleable={parseBooleanAttr(toggleable)}
      data-grow={parseBooleanAttr(grow)}
      aria-label={ariaLabel}
      aria-pressed={toggled}
      onClick={disabled ? undefined : handleClick}
      onFocus={disabled ? undefined : onFocus}
      onBlur={disabled ? undefined : onBlur}
      type={type}
      disabled={disabled}
      data-scale={scale}
      {...rest}
    >
      <Container>
        <ShadowMask>
          <Shadow />
        </ShadowMask>
        <Control>{children}</Control>
      </Container>
    </Wrapper>
  );
}

Button.ButtonText = ButtonText;

export type ButtonComponent = typeof Button & {
  ButtonText: typeof ButtonText;
};

export type ButtonButtonTextProps = ComponentPropsWithoutRef<typeof ButtonText>;
