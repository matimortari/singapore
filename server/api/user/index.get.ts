export default defineEventHandler(async (event) => {
  const user = await getUserFromSession(event)
  if (!user) {
    throw createError({ status: 404, message: "User not found" })
  }

  const userData = await db.user.findUnique({ where: { id: user.id } })

  return { userData }
})
