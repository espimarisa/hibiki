/*
  Valid setup items & their info.
*/

module.exports = [{
  id: "agreeChannel",
  label: "Agree Channel",
  type: "channelID",
}, {
  id: "agreeRole",
  label: "Agree Role",
  type: "roleID",
}, {
  label: "AntiInvite",
  id: "antiInvite",
  type: "bool",
}, {
  label: "AntiSpam",
  id: "antiSpam",
  type: "bool",
}, {
  id: "assignableRoles",
  label: "Assignable Roles",
  type: "roleArray",
}, {
  id: "autoRoles",
  label: "Automatic Roles",
  type: "roleArray",
  maximum: 5,
}, {
  label: "Disabled Categories",
  id: "disabledCategories",
  type: "array",
}, {
  label: "Disabled Commands",
  id: "disabledCmds",
  type: "array",
}, {
  label: "Invite Punishment",
  id: "invitePunishments",
  type: "punishment",
}, {
  id: "leaveJoin",
  label: "Leave/Join Channel",
  type: "channelID",
}, {
  id: "joinMessage",
  label: "Join Message",
  type: "string",
}, {
  id: "leaveMessage",
  label: "Leave Message",
  type: "string",
}, {
  id: "eventLogging",
  label: "Event Logging Channel",
  type: "channelID",
}, {
  id: "messageLogging",
  label: "Message Logging Channel",
  type: "channelID",
}, {
  id: "memberLogging",
  label: "Member Logging Channel",
  type: "channelID",
}, {
  id: "modLogging",
  label: "Mod Logging Channel",
  type: "channelID",
}, {
  id: "mutedRole",
  label: "Muted Role",
  type: "roleID",
}, {
  id: "staffRole",
  label: "Staff Role",
  type: "roleID",
}, {
  id: "pinAmount",
  label: "Pin Amount",
  type: "number",
}, {
  id: "pinChannel",
  label: "Pin Channel",
  type: "channelID",
}, {
  id: "pinEmoji",
  label: "Pin Emoji",
  type: "emoji",
}, {
  id: "pinSelfPinning",
  label: "Self Pinning",
  type: "bool",
}, {
  label: "Prefix",
  id: "prefix",
  type: "string",
  minimum: 1,
  maximum: 15,
}, {
  label: "Punishment Message",
  id: "msgOnPunishment",
  type: "bool",
}, {
  label: "Spam Punishments",
  id: "spamPunishments",
  type: "punishment",
}, {
  label: "Spam Threshold",
  id: "spamThreshold",
  minimum: 5,
  maximum: 10,
}, {
  id: "verifiedRole",
  label: "Verified Role",
  type: "roleID",
}];
