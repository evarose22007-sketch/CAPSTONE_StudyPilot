/** Small line icons. Decorative unless given a label by the parent. */
const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
};

export const HomeIcon = () => (
  <svg {...base}>
    <path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z" />
  </svg>
);

export const ListIcon = () => (
  <svg {...base}>
    <path d="M9 7h11M9 12h11M9 17h11" />
    <path d="M4 7l1 1 2-2M4 12l1 1 2-2M4 17l1 1 2-2" />
  </svg>
);

export const BookIcon = () => (
  <svg {...base}>
    <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" />
    <path d="M5 17a3 3 0 0 1 3-3h11" />
  </svg>
);

export const LogoutIcon = () => (
  <svg {...base}>
    <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10" />
  </svg>
);

export const PlusIcon = () => (
  <svg {...base}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const EditIcon = () => (
  <svg {...base}>
    <path d="M4 20l1-4L16 5l3 3L8 19z" />
  </svg>
);

export const TrashIcon = () => (
  <svg {...base}>
    <path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13" />
  </svg>
);

export const CloseIcon = () => (
  <svg {...base}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const CheckIcon = () => (
  <svg {...base} strokeWidth={2.6}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

export const Logo = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <rect width="32" height="32" rx="7" fill="var(--ink)" />
    <path
      d="M7 21.5c3.5-.6 6.6-2.4 9.4-5.4M16.4 16.1l7.8-7.6 1.6 1.6-7.6 7.8-2.6.8z"
      fill="none"
      stroke="var(--highlight)"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
