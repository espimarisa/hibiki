# Hibiki Privacy Policy
## Updated 17 September 2020

This Privacy Policy applies to personal information collected through jiktim's ("we", "us", or "our") "Hibiki" Discord application and website, "hibiki.app". If you have any questions, please contact a developer or email `espi@lesbian.codes` with your inquiry. Additionally, this is not 100% legally binding and pretty informal.

Do note that this applies to the **official** instance of Hibiki (493904957523623936). Other instances may not respect this.

## Information we collect

### hibiki.app
We require certain information for authentication. The information we collect does not reveal your specific identity (like your name, email, address, or IP). Additionally, some data is provided in the configuration dashboard, but nothing personally identifiable.

Collected for authentication:

- oAuth tokens: a read-only, encrypted &amp; signed one-use token in order to verify the Discord account belongs to you. You can control the information we can get from the token, however, for proper authentication to work you must provide "user" and "guilds". This is stored in order to properly authenticate a user and is necessary for logging-in via Discord. If you do not wish to provide this, do not sign in to the dashboard. Additionally, your token is invalidated and deleted upon logout (https://hibiki.app/logout/).

- A user cookie to identify that (you) are the currently authenticated user is saved in your browser. This is encrypted, signed, and secure. If you don't want this stored anymore, you can logout at https://hibiki.app/logout. Additionally, another cookie (csrf) verifies that form submissions are legitimate and you aren't being phished.

Collected for features:

- Your timezone and locale information. This is provided using your web browser's native API (Intl.DateTimeFormat().resolvedOptions()) and doesn't contain anything personally identifiable, but contains your timezone and locale. We currently only read the timezone part, however. If you don't wish to use this data, head over to https://hibiki.app/manage/profile and delete your profile data. Don't save the changes, they're deleted automatically. Additionally, any profile edits will save this data. Your current time is displayed on your profile when a user runs h!profile.

### Hibiki Bot Application
We collect very little information, however, for some configurations and functionality to work, we need to collect the following:

- User &amp; Server ID: a unique number for every Discord server ("guild") and user, this is stored in order to know which server should be modified and to verify if the user is authorized to modify the server. This is non-personal information and can be accessed by anyone. If you do not wish to provide this, do not use our bot, or even Discord as it's public.

- Command Responses: some commands, such as the con fig or createCommand commands, ask for a response. We will store the msg.content data in order to send that response at a later time.

### Closure
We do not, and never will, sell or redistribute any user or guild data. If you wish for us to remove all data belonging to you or your guild, contact one of the developers or email `espi@lesbian.codes`. Additionally, we do not view any sensitive information (oAuth tokens, for example) and keep your data secure.
