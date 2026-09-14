import { GithubLogo } from "@phosphor-icons/react/dist/ssr";

export default function SiteFooter() {
  return (
    <footer className="border-t border-ctp-surface0">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 font-mono text-xs text-ctp-subtext0 sm:flex-row sm:px-6">
        <span>
          shrinkray<span className="text-ctp-mauve">_</span> · mit · files never leave your browser
        </span>
        <span className="flex items-center gap-3">
          <span>next.js + ffmpeg-wasm</span>
          <a
            href="https://github.com/kiraadityaa/shrinkray"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="ShrinkRay on GitHub"
            className="transition hover:text-ctp-text"
          >
            <GithubLogo size={16} aria-hidden />
          </a>
        </span>
      </div>
    </footer>
  );
}
