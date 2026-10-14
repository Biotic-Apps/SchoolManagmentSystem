/** eSchool product screens rendered by ScreenMock (CSS rebuilds, no screenshots needed). */
export type ScreenKey = "dashboard" | "attendance" | "academics" | "fees" | "parent";

/**
 * Which product screenshots have actually been supplied.
 *
 * Drop `dashboard.png`, `pos.png`, … into `public/screens/` and flip the
 * matching entry to `true`. Until then every device on the site renders the CSS
 * rebuild in `ScreenMock`, so the page is complete and quiet in the console
 * either way.
 */
export const SCREENSHOT_READY: Record<ScreenKey, boolean> = {
  dashboard: false,
  attendance: false,
  academics: false,
  fees: false,
  parent: false,
};

export const screenSrc = (key: ScreenKey) => `/screens/${key}.png`;

/**
 * A screen recording of the product, scrubbed by scroll instead of played.
 *
 * Record the app walking through Attendance → Academics → Fees → Parent portal in one
 * take, save it as `public/media/product.mp4`, and flip `ready` to true. The
 * feature sections will drive its `currentTime` from scroll position with no
 * other change. Until then they dissolve between the individual screens, which
 * reads the same way.
 *
 * Encode it for scrubbing, not for streaming: H.264, short keyframe interval
 * (`-g 12`), no audio, around 8–15 seconds, 1920×1200. A long keyframe interval
 * makes seeking stutter.
 */
export const PRODUCT_VIDEO = {
  ready: false,
  src: "/media/product.mp4",
} as const;

/** The path shown in the mock browser's address bar for each screen. */
export const SCREEN_ROUTES: Record<ScreenKey, string> = {
  dashboard: "eschool.app/dashboard",
  attendance: "eschool.app/attendance",
  academics: "eschool.app/exams/results",
  fees: "eschool.app/fees",
  parent: "eschool.app/parent",
};
