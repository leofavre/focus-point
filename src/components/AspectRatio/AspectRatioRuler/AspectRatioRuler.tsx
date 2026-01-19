import clsx from "clsx";
import type { AspectRatioRulerProps } from "./types";

export function AspectRatioRuler({ aspectRatioList, className, ...rest }: AspectRatioRulerProps) {
  const min = aspectRatioList.at(0)?.preciseValue ?? 1;
  const max = aspectRatioList.at(-1)?.preciseValue ?? 1;

  return (
    <ul className={clsx("relative flex items-start text-xs text-gray-500", className)} {...rest}>
      {aspectRatioList.map(({ name, preciseValue }) => {
        const left = `${((preciseValue - min) / (max - min)) * 100}%`;

        return (
          <li
            key={name}
            className={`w-px flex flex-col justify-center absolute text-sideways-lr`}
            style={{ left }}
          >
            <span className="flex flew-row flex-nowrap items-center after:content-[''] after:mb-1 after:inline-block after:w-px after:h-3 after:bg-gray-500 after:align-middle">
              {name}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
