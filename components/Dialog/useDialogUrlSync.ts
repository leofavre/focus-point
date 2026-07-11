/**
 * Hook that syncs dialog open state with a URL search parameter.
 * App-agnostic: the consumer supplies how to read and update the URL
 * (e.g. via Vike, React Router, or window.location).
 *
 * @returns open and onOpenChange to pass to a controlled Dialog.
 */
export function useDialogUrlSync(options: {
  getParamInUrl: () => boolean;
  setParamInUrl: (present: boolean) => void;
}): { open: boolean; onOpenChange: (open: boolean) => void } {
  const { getParamInUrl, setParamInUrl } = options;

  const open = getParamInUrl();

  const onOpenChange = (next: boolean) => {
    setParamInUrl(next);
  };

  return { open, onOpenChange };
}
