import * as Sentry from "@sentry/nextjs";

// TODO: Sanitize this
Sentry.init({
  environment: process.env.NODE_ENV,
  release: process.env.npm_package_version,
  tracesSampleRate: 0.2,
});
