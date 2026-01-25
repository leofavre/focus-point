import type { ChangeEvent, FormEvent, RefObject } from "react";
import type { StyleProps } from "../../types";

export type ImageUploaderProps = StyleProps & {
  ref?: RefObject<HTMLInputElement | null>;
  onFormSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  onImageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};
