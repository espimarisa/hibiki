import * as Sentry from "@sentry/nextjs";

// TODO: Sanitize this
Sentry.init({
  environment: process.env.NODE_ENV,
  release: process.env.npm_package_version,
  // eslint-disable-next-line import/namespace
  integrations: [new Sentry.Replay()],
  tracesSampleRate: 0.2,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
});
