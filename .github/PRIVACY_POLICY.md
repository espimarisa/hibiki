# Hibiki Privacy Policy

### Updated 23 December 2020

This privacy policy applies to all information collected by the main "Hibiki" Discord application and website. If you have any questions or concerns, contact a developer.

Do note that while this applies for the **official** Hibiki instance `(493904957523623936)`, other instances of Hibiki may not respect this. You're advised to use the main instance.

## Information Collected

#### Bot Application

Hibiki (the bot application) does not log any personally identifiable information (PII). However, in order for some modules to work, we need to retrieve some data.

**Required for functionality**:

- User ID: Hibiki reads your unique 16-18 digit Discord user ID to read your user config and know who to tag/mention.
- Guild ID: Hibiki reads the current guild's config to read the guildconfig and know what to do/run or what not to do.

This information is **NOT** identifiable and is publically viewable through Discord's open API. If you have a problem with this, do not use our application.

Additionally, some modules may need to collect the following:

- Message data: Data in message responses that the application reads to store a response for some modules (example: welcome messages).

#### Hibiki.app

In order for the dashboard to handle user authentication properly, you must sign in through Discord's oAuth2 API. This returns some information that the application uses to verify that you are who your account says you are.

- oAuth token: A read-only, signed and protected single-use token that is passed to the application to retrieve your username, user ID, avatar, and any guilds you have permission to manage. We cannot read or modify this value. If you do not wish to provide this, don't log into the dashboard.

- Your timezone and locale: This is provided using your web browser's native API `(Intl.DateTimeFormat().resolvedOptions())`. We use this so you (and other users) can see what time it is for you relative to your timezone. If you do not wish to provide this, clear your profile data.

#### GDPR

If you would like a dump of your user data, you can do so every 30 days by running `h!gdpr` or doing so through the profile dashboard.
