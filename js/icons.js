/**
 * Simple geometric line icons (24x24, stroke-based) used across the calendar.
 * Not the UN emblem — original geometric glyphs inspired by the Ten Principles
 * issue-area pictograms, kept deliberately simple.
 */
window.UNGCNL_ICONS = (function () {
  var S = 'fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"';

  return {
    /* Scope icons */
    pin:
      '<svg viewBox="0 0 24 24" ' + S + ' aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    share:
      '<svg viewBox="0 0 24 24" ' + S + ' aria-hidden="true"><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="5.5" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="M8.3 10.8 15.7 6.9M8.3 13.2l7.4 3.9"/></svg>',
    globe:
      '<svg viewBox="0 0 24 24" ' + S + ' aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.3 4 5.3 4 8.5s-1.4 6.2-4 8.5c-2.6-2.3-4-5.3-4-8.5s1.4-6.2 4-8.5Z"/></svg>',

    /* Theme (Ten Principles issue-area) icons */
    humanRights:
      '<svg viewBox="0 0 24 24" ' + S + ' aria-hidden="true"><path d="M12 4v3.2"/><path d="M5 8.5h14"/><path d="M5 8.5 2.5 14a2.5 2.5 0 0 0 5 0L5 8.5Z"/><path d="M19 8.5 16.5 14a2.5 2.5 0 0 0 5 0L19 8.5Z"/><path d="M8 21h8M12 7.2V21"/></svg>',
    labour:
      '<svg viewBox="0 0 24 24" ' + S + ' aria-hidden="true"><path d="M14.7 6.3a3 3 0 1 0-4.24 4.24l-7 7 2.83 2.83 7-7a3 3 0 0 0 4.24-4.24l-2.12 2.12-2.12-.71-.71-2.12 2.12-2.12Z"/></svg>',
    environment:
      '<svg viewBox="0 0 24 24" ' + S + ' aria-hidden="true"><path d="M6 20c-1-6 2-13 13-14 1 9-5 13-11 13-.7 0-1.4 0-2-.2Z"/><path d="M8 19c2-3 5-6 10-9"/></svg>',
    anticorruption:
      '<svg viewBox="0 0 24 24" ' + S + ' aria-hidden="true"><path d="M12 3.5 19 6v5.5c0 4.6-2.9 8-7 9-4.1-1-7-4.4-7-9V6l7-2.5Z"/><path d="m9.3 12.7 1.9 1.9 3.6-3.6"/></svg>',
    other:
      '<svg viewBox="0 0 24 24" ' + S + ' aria-hidden="true"><path d="M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9"/></svg>',

    /* UI icons */
    chevronLeft:
      '<svg viewBox="0 0 24 24" ' + S + ' aria-hidden="true"><path d="M15 5 8 12l7 7"/></svg>',
    chevronRight:
      '<svg viewBox="0 0 24 24" ' + S + ' aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>',
    close:
      '<svg viewBox="0 0 24 24" ' + S + ' aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    reset:
      '<svg viewBox="0 0 24 24" ' + S + ' aria-hidden="true"><path d="M4 12a8 8 0 1 1 2.6 5.9"/><path d="M4 19v-5h5"/></svg>',
    sun:
      '<svg viewBox="0 0 24 24" ' + S + ' aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.3M12 19.2v2.3M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.3M19.2 12h2.3M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/></svg>',
    moon:
      '<svg viewBox="0 0 24 24" ' + S + ' aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z"/></svg>',
    arrow:
      '<svg viewBox="0 0 24 24" ' + S + ' aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    external:
      '<svg viewBox="0 0 24 24" ' + S + ' aria-hidden="true"><path d="M9 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"/><path d="M14 4h6v6M10 14 20 4"/></svg>',
    calendar:
      '<svg viewBox="0 0 24 24" ' + S + ' aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="1.5"/><path d="M3.5 9.5h17M8 3v3.6M16 3v3.6"/></svg>',
    search:
      '<svg viewBox="0 0 24 24" ' + S + ' aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.8-4.8"/></svg>',
    document:
      '<svg viewBox="0 0 24 24" ' + S + ' aria-hidden="true"><path d="M6.5 3h7l4 4v13.5a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M13 3v4.5h4.5M8.5 12.5h7M8.5 16h5"/></svg>'
  };
})();
