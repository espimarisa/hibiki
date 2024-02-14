// "Private" import loophole for global types
type PrivateEventListeners = import("discord.js").ClientEvents;

// An individual event listener
type HibikiEventListener = keyof PrivateEventListeners;
