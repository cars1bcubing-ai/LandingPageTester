@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500&display=swap");

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --ink: #0a0a0f;
  --surface: #111118;
  --card: #16161f;
  --border: #1e1e2e;
  --accent: #7c6af7;
  --muted: #4a4a6a;
  --text: #e2e2f0;
  --text-dim: #8888aa;
}

* {
  box-sizing: border-box;
}

html, body {
  background: var(--ink);
  color: var(--text);
  font-family: "DM Sans", sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Noise texture overlay */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 0;
  opacity: 0.4;
}

.animate-fade-up {
  animation: fade-up 0.5s ease forwards;
  opacity: 0;
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.delay-1 { animation-delay: 0.05s; }
.delay-2 { animation-delay: 0.12s; }
.delay-3 { animation-delay: 0.2s; }
.delay-4 { animation-delay: 0.28s; }
.delay-5 { animation-delay: 0.36s; }
.delay-6 { animation-delay: 0.44s; }

/* Score bar animation */
.score-bar-inner {
  transition: width 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Glow on accent elements */
.accent-glow {
  box-shadow: 0 0 24px rgba(124, 106, 247, 0.25);
}

/* Scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--ink); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
