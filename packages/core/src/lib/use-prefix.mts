import { AsyncResource } from 'node:async_hooks';
import { useState } from './use-state.mjs';
import { useEffect } from './use-effect.mjs';
import { makeTheme } from './make-theme.mjs';
import type { Theme, Status } from './theme.mjs';

export function usePrefix({
  status = 'idle',
  theme,
}: {
  status?: Status;
  theme?: Theme;
}): string {
  const [showLoader, setShowLoader] = useState(false);
  const [tick, setTick] = useState(0);
  const { prefix, spinner } = makeTheme(theme);

  useEffect((): void | (() => unknown) => {
    if (status === 'loading') {
      let tickInterval: NodeJS.Timeout | undefined;
      let inc = -1;
      // Delay displaying spinner by 300ms, to avoid flickering
      const delayTimeout = setTimeout(
        AsyncResource.bind(() => {
          setShowLoader(true);

          tickInterval = setInterval(
            AsyncResource.bind(() => {
              inc = inc + 1;
              setTick(inc % spinner.frames.length);
            }),
            spinner.interval,
          );
        }),
        300,
      );

      return () => {
        clearTimeout(delayTimeout);
        clearInterval(tickInterval);
      };
    } else {
      setShowLoader(false);
    }
  }, [status]);

  if (showLoader) {
    return spinner.frames[tick]!;
  }

  return typeof prefix === 'string' ? prefix : prefix(status);
}
