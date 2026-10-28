/** Counts in-app route changes since the page was loaded (client-only). */
let count = 0;
export const markNavigation = () => {
  count += 1;
};
/** True when there is an earlier in-app page to go back to. */
export const hasInAppHistory = () => count > 1;
