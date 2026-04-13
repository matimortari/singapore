export default defineEventHandler(async (event) => {
  try {
    await getUserFromSession(event)
    const snapshot = await getDockerSnapshot()
    return { snapshot }
  }
  catch (err: unknown) {
    throw createError({ statusCode: 503, statusMessage: "Docker daemon unavailable", data: { message: err instanceof Error ? err.message : "Unknown Docker error" } })
  }
})
