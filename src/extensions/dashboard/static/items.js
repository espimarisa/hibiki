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
  id: "antiInvite",
  label: "AntiInvite",
  type: "bool",
}, {
  id: "antiSpam",
  label: "AntiSpam",
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
  id: "disabledCategories",
  label: "Disabled Categories",
  type: "array",
}, {
  id: "disabledCmds",
  label: "Disabled Commands",
  type: "array",
}, {
  id: "invitePunishments",
  label: "Invite Punishment",
  type: "punishment",
}, {
  id: "leaveJoin",
  label: "Leave/Join Channel",
  type: "channelID",
}, {
  id: "joinMessage",
  label: "Join Message",
  type: "string",
  minimum: 1,
  maximum: 100,
}, {
  id: "leaveMessage",
  label: "Leave Message",
  type: "string",
  minimum: 1,
  maximum: 100,
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
  id: "msgOnPunishment",
  label: "Punishment Message",
  type: "bool",
}, {
  id: "mutedRole",
  label: "Muted Role",
  type: "roleID",
}, {
  id: "snipingEnable",
  label: "Message Sniping",
  type: "bool",
}, {
  id: "snipingIgnore",
  label: "Ignored Snipe Channels",
  type: "channelArray",
}, {
  id: "snipingInvites",
  label: "Invite Sniping",
  type: "bool",
}, {
  id: "snipingPermission",
  label: "Sniping Permission",
  type: "bool",
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
  id: "prefix",
  label: "Prefix",
  type: "string",
  minimum: 1,
  maximum: 15,
}, {
  id: "spamPunishments",
  label: "Spam Punishments",
  type: "punishment",
}, {
  id: "spamThreshold",
  label: "Spam Threshold",
  minimum: 5,
  maximum: 10,
}, {
  id: "verifiedRole",
  label: "Verified Role",
  type: "roleID",
}];
