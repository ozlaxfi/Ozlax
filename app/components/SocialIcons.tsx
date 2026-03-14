import type { ReactNode } from "react";

const cleanUrl = (value: string | undefined, fallback: string) => (value || fallback).trim();

export const SOCIAL_LINKS = [
  {
    href: cleanUrl(process.env.NEXT_PUBLIC_DISCORD, "https://discord.gg/hZ4BE84qc3"),
    label: "Discord",
    description: "Join the builder channel and follow protocol progress in public.",
  },
  {
    href: cleanUrl(process.env.NEXT_PUBLIC_TWITTER, "https://x.com/OzlaxHQ"),
    label: "X",
    description: "Follow release notes, deployment milestones, and protocol updates.",
  },
  {
    href: cleanUrl(process.env.NEXT_PUBLIC_TELEGRAM, "https://t.me/ozlaxfi"),
    label: "Telegram",
    description: "Keep up with the community conversation and shipping cadence.",
  },
] as const;

type SocialLabel = (typeof SOCIAL_LINKS)[number]["label"];

export function SocialIcon({ label }: { label: SocialLabel }) {
  const icons: Record<SocialLabel, ReactNode> = {
    Discord: (
      <path d="M20.3 5.5A16.7 16.7 0 0 0 16.2 4a11.6 11.6 0 0 0-.5 1l-.2.5a15.4 15.4 0 0 0-7 0l-.2-.5c-.2-.4-.3-.7-.5-1A16.7 16.7 0 0 0 3.7 5.5 18.4 18.4 0 0 0 1 17.8a16.9 16.9 0 0 0 5 2.5l1.1-1.8a10.8 10.8 0 0 1-1.7-.8l.4-.3a11.9 11.9 0 0 0 10.4 0l.4.3c-.5.3-1.1.6-1.7.8l1.1 1.8a16.9 16.9 0 0 0 5-2.5 18.4 18.4 0 0 0-2.7-12.3ZM8.2 15.4c-.9 0-1.6-.8-1.6-1.8S7.3 12 8.2 12s1.7.8 1.6 1.7c0 1-.7 1.8-1.6 1.8Zm7.6 0c-.9 0-1.6-.8-1.6-1.8S14.9 12 15.8 12s1.7.8 1.6 1.7c0 1-.7 1.8-1.6 1.8Z" />
    ),
    X: <path d="M18.9 2H22l-6.8 7.8L23 22h-6.1l-4.8-6.3L6.6 22H3.5l7.3-8.4L1 2h6.3l4.3 5.7L18.9 2Zm-1.1 18h1.7L6.4 3.8H4.6L17.8 20Z" />,
    Telegram: <path d="m21.9 4.4-3.2 15.1c-.2 1.1-.9 1.4-1.8.9l-4.9-3.6-2.4 2.3c-.3.3-.6.6-1.1.6l.4-5.1 9.4-8.5c.4-.3-.1-.5-.6-.1L6.1 13.1l-4.8-1.5c-1-.3-1-.9.2-1.4l18.7-7.2c.9-.3 1.7.2 1.4 1.4Z" />,
  };

  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {icons[label]}
    </svg>
  );
}

type RowProps = {
  className?: string;
  linkClassName?: string;
};

export function SocialIconRow({ className = "social-links", linkClassName = "social-link" }: RowProps) {
  return (
    <div className={className}>
      {SOCIAL_LINKS.map((item) => (
        <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className={linkClassName} aria-label={item.label}>
          <SocialIcon label={item.label} />
        </a>
      ))}
    </div>
  );
}
