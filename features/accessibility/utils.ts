import type { IconSizeType, TextSizeType } from './store';

const TEXT_SIZE_MULTIPLIERS: Record<TextSizeType, number> = {
  small: 0.85,
  medium: 1.0,
  large: 1.2,
};

const ICON_SIZE_MULTIPLIERS: Record<IconSizeType, number> = {
  default: 1.0,
  medium: 1.25,
  large: 1.5,
};

export function scaleText(baseSize: number, textSize: TextSizeType): number {
  const multiplier = TEXT_SIZE_MULTIPLIERS[textSize];
  return Math.round(baseSize * multiplier);
}

export function scaleIcon(baseSize: number, iconSize: IconSizeType): number {
  const multiplier = ICON_SIZE_MULTIPLIERS[iconSize];
  return Math.round(baseSize * multiplier);
}