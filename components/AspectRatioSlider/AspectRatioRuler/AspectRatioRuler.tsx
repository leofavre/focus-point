import { Item, Label, List } from "./AspectRatioRuler.styled";
import type { AspectRatioRulerProps } from "./types";

export function AspectRatioRuler({ ref, aspectRatioList, ...rest }: AspectRatioRulerProps) {
  return (
    <List data-component="AspectRatioRuler" ref={ref} {...rest}>
      {aspectRatioList.map(({ key, displayName, position }) => {
        return (
          <Item key={key} data-key={key} css={{ "--position": `${position * 100}%` }}>
            <Label>{displayName}</Label>
          </Item>
        );
      })}
    </List>
  );
}
