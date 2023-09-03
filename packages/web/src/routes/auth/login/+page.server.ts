export async function load(event) {
  const session = await event.locals.getSession();

  return {
    session,
  };
}
