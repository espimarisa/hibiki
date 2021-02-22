# Hibiki Privacy Policy

### Updated 22 February 2021

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
- Invite data (read-only): If you aren't opted out (you can do so via `h!config` if you want to), these will be used for more advanced member join logging (such as who invited someone). Data is wiped following a bot restart, and is not saved permanently anywhere. Additionally, we (the Hibiki Development Team), will never read said data.

#### Hibiki.app

In order for the dashboard to handle user authentication properly, you must sign in through Discord's OAuth2 API. This returns some information that the application uses to verify that you are who your account says you are.

- oAuth token: A read-only, signed and protected single-use token that is passed to the application to retrieve your username, user ID, avatar, and any guilds you have permission to manage. We cannot read or modify this value. If you do not wish to provide this, don't log into the dashboard.

- Your timezone and locale: This is provided using your web browser's native API `(Intl.DateTimeFormat().resolvedOptions())`. We use this so you (and other users) can see what time it is for you relative to your timezone. If you do not wish to provide this, clear your profile data or the field using `h!profile`.

#### GDPR

If you would like a dump of your user data, you can do so by running `h!gdpr`. If you're a guild owner (or someone with the `Administrator` permission), you can get your guild's data with `h!gdpr guild`.

You can delete your profile using the command (`h!profile`) or on the dashboard, and also can do-so for the guildconfig (`h!config`).
