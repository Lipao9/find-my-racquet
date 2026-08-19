"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Ad personalisation consent, stored locally.
 *
 * Deliberately *not* a cookie: nothing server-side needs to read it, and a
 * localStorage value never rides along on requests to the CDN, so it cannot
 * fragment the cache for statically generated racquet pages.
 *
 * Scope note for later: this covers LGPD, where contextual (non-personalised)
 * ads are defensible without prior consent. It is **not** an IAB TCF CMP, and
 * Google requires a certified CMP to serve ads to EEA/UK visitors at all. When
 * `/en` starts drawing meaningful European traffic, this module is the seam to
 * swap for one — the components only ever ask it for a tri-state.
 */
export type AdConsent = "granted" | "denied";

const STORAGE_KEY = "raqmatch.ads-consent";

/** Lets every mounted `useAdConsent` react to a choice made in the banner. */
const CHANGE_EVENT = "raqmatch:ads-consent";

export function readConsent(): AdConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "granted" || stored === "denied" ? stored : null;
  } catch {
    // Safari in Lockdown/private mode throws on localStorage access. Treating
    // that as "no choice recorded" degrades to non-personalised ads, which is
    // the safe direction to fail in.
    return null;
  }
}

export function writeConsent(consent: AdConsent): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, consent);
  } catch {
    // Choice still applies to this page view via the event below.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export interface AdConsentState {
  consent: AdConsent | null;
  /**
   * False until the effect has read storage. Callers must not decide anything
   * on the first render: the server rendered without access to localStorage, so
   * branching on `consent` before this flips would be a hydration mismatch.
   */
  ready: boolean;
  decide: (consent: AdConsent) => void;
}

export function useAdConsent(): AdConsentState {
  const [state, setState] = useState<{
    consent: AdConsent | null;
    ready: boolean;
  }>({ consent: null, ready: false });

  useEffect(() => {
    const sync = () => setState({ consent: readConsent(), ready: true });
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    return () => window.removeEventListener(CHANGE_EVENT, sync);
  }, []);

  const decide = useCallback((consent: AdConsent) => writeConsent(consent), []);

  return { ...state, decide };
}
