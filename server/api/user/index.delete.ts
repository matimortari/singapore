export default defineEventHandler(async (event) => {
  const user = await getUserFromSession(event)

  await db.user.delete({ where: { id: user.id } })
  await clearUserSession(event)

  return { success: true, message: "User deleted successfully" }
})
