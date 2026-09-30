import { useId, type CSSProperties } from 'react'
import { toPercent } from '../lib/volume'

interface VolumeSliderProps {
  label: string
  value: number
  max: number
  step?: number
  /** Draws a tick on the track at this value (e.g. 100% on a slider that goes to 200%). */
  marker?: number
  /** Visually hide the label (it's still read by screen readers). */
  hideLabel?: boolean
  disabled?: boolean
  onChange: (value: number) => void
}

export function VolumeSlider({
  label,
  value,
  max,
  step = 0.01,
  marker,
  hideLabel = false,
  disabled = false,
  onChange,
}: VolumeSliderProps) {
  const id = useId()

  return (
    <div className="volume-slider">
      <label htmlFor={id} className={hideLabel ? 'visually-hidden' : 'volume-slider__label'}>
        {label}
      </label>
      <span
        className={marker === undefined ? 'range-wrap' : 'range-wrap range-wrap--marked'}
        style={{ '--marker-ratio': marker === undefined ? undefined : marker / max } as CSSProperties}
      >
        <input
          id={id}
          type="range"
          className="range"
          min={0}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-valuetext={toPercent(value)}
          style={{ '--fill': `${(value / max) * 100}%` } as CSSProperties}
          onChange={(event) => onChange(Number(event.currentTarget.value))}
        />
      </span>
      <output htmlFor={id} className="volume-slider__value">
        {toPercent(value)}
      </output>
    </div>
  )
}
