import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function Icon({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" {...props}>
      {children}
    </svg>
  )
}

export function PlayIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11.1-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14z" />
    </Icon>
  )
}

export function PauseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="6" y="4.5" width="4" height="15" rx="1" />
      <rect x="14" y="4.5" width="4" height="15" rx="1" />
    </Icon>
  )
}

export function PreviousIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="5" y="5" width="2.5" height="14" rx="1" />
      <path d="M19 6.1v11.8a1 1 0 0 1-1.55.83l-8.6-5.9a1 1 0 0 1 0-1.66l8.6-5.9A1 1 0 0 1 19 6.1z" />
    </Icon>
  )
}

export function NextIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="16.5" y="5" width="2.5" height="14" rx="1" />
      <path d="M5 6.1v11.8a1 1 0 0 0 1.55.83l8.6-5.9a1 1 0 0 0 0-1.66l-8.6-5.9A1 1 0 0 0 5 6.1z" />
    </Icon>
  )
}

export function VolumeIcon({ level, ...props }: IconProps & { level: number }) {
  return (
    <Icon {...props}>
      <path d="M3 9.5v5a1 1 0 0 0 1 1h3l4.4 3.7a1 1 0 0 0 1.6-.8V5.6a1 1 0 0 0-1.6-.8L7 8.5H4a1 1 0 0 0-1 1z" />
      {level > 0 && (
        <path d="M15.5 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      )}
      {level > 0.5 && (
        <path d="M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      )}
    </Icon>
  )
}

export function MutedIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 9.5v5a1 1 0 0 0 1 1h3l4.4 3.7a1 1 0 0 0 1.6-.8V5.6a1 1 0 0 0-1.6-.8L7 8.5H4a1 1 0 0 0-1 1z" />
      <path d="M16 9.5l5 5m0-5l-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Icon>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </Icon>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6.5 6.5l11 11m0-11l-11 11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Icon>
  )
}

export function MusicIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M19 3v12.2a3.5 3.5 0 1 1-2-3.16V7.3l-8 1.8v8.1a3.5 3.5 0 1 1-2-3.16V5.5L19 3z" />
    </Icon>
  )
}
