/*
  This checks and compares member's roles.
*/

module.exports = (member1, member2) => {
  if (member1.guild !== member2.guild) return;
  // Owners
  if (member1.guild.ownerID === member1.id) return true;
  if (member1.guild.ownerID === member2.id) return false;
  // Member's roles
  if (member1.roles.length === 0) return false;
  if (member2.roles.length === 0) return true;
  let member1Roles = member1.roles.map(r => member1.guild.roles.get(r));
  let member2Roles = member2.roles.map(r => member2.guild.roles.get(r));
  member1Roles = member1Roles.sort((a, b) => b.position - a.position);
  member2Roles = member2Roles.sort((a, b) => b.position - a.position);
  return member1Roles[0].position > member2Roles[0].position;
};
