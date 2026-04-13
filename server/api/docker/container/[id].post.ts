const ALLOWED_ACTIONS: DockerContainerAction[] = ["start", "stop", "restart"]

export default defineEventHandler(async (event) => {
  await getUserFromSession(event)

  const containerId = getRouterParam(event, "id")
  if (!containerId) {
    throw createError({ statusCode: 400, statusMessage: "Missing container id" })
  }

  const body = await readBody<{ action?: DockerContainerAction }>(event)
  if (!body?.action || !ALLOWED_ACTIONS.includes(body.action)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid action. Use start, stop, or restart." })
  }

  try {
    await runDockerContainerAction(containerId, body.action)
    return { ok: true, action: body.action, containerId }
  }
  catch (err: unknown) {
    throw createError({ statusCode: 503, statusMessage: "Docker action failed", data: { message: err instanceof Error ? err.message : "Unknown Docker action error" } })
  }
})
