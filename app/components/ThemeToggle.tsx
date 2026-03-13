type Props = {
  theme: "dark" | "light";
  onToggle: () => void;
  ready: boolean;
};

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={path} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ThemeToggle({ theme, onToggle, ready }: Props) {
  return (
    <button type="button" className="theme-button" aria-label="Toggle theme" onClick={onToggle}>
      {ready && theme === "light" ? (
        <Icon path="M12 3v2.2M12 18.8V21M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M3 12h2.2M18.8 12H21M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      ) : (
        <Icon path="M20 15.2A7.8 7.8 0 1 1 8.8 4 6.2 6.2 0 0 0 20 15.2Z" />
      )}
    </button>
  );
}
