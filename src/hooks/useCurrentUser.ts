import { useMemo } from 'react';

export interface CurrentUser {
  displayName: string;
  initials: string;
  role: string;
}

/**
 * Returns the signed-in user to show in the app header.
 *
 * Power Apps Code Apps does not yet ship a first-party "get current user"
 * API (tracked upstream: https://github.com/microsoft/PowerAppsCodeApps/issues/89),
 * so this is a placeholder. When Microsoft adds one (or once you wire up your
 * own MSAL/Entra ID lookup or a Dataverse WhoAmI call), swap the body of this
 * hook for the real lookup — every component that calls useCurrentUser() will
 * pick it up automatically.
 */
export function useCurrentUser(): CurrentUser {
  return useMemo(
    () => ({
      displayName: 'Fleet Administrator',
      initials: 'FA',
      role: 'Administrator',
    }),
    []
  );
}
