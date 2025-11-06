import { useMemo } from 'react';
import { useAccessibilityStore } from './store';
import { scaleIcon, scaleText } from './utils';

export const useScaledSizes = () => {
  const textSize = useAccessibilityStore((state) => state.textSize);
  const iconSize = useAccessibilityStore((state) => state.iconSize);

  return useMemo(
    () => ({
      text: (baseSize: number) => scaleText(baseSize, textSize),
      icon: (baseSize: number) => scaleIcon(baseSize, iconSize),
      textSize,
      iconSize,
    }),
    [textSize, iconSize]
  );
};