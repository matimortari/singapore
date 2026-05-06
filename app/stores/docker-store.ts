export const useDockerStore = defineStore("docker", () => {
  const snapshot = ref<{ snapshot: DockerSnapshot }["snapshot"] | null>(null)
  const pending = ref(false)
  const pendingActionId = ref<string | null>(null)
  const errorMessage = ref("")

  async function refreshSnapshot() {
    if (pending.value) {
      return
    }

    pending.value = true

    try {
      const data = await $fetch<{ snapshot: DockerSnapshot }>("/api/docker", { method: "GET", credentials: "include" })
      snapshot.value = data.snapshot
      errorMessage.value = ""
    }
    catch (err: unknown) {
      errorMessage.value = (err as { data?: { message?: string }, statusMessage?: string })?.data?.message || (err as { statusMessage?: string })?.statusMessage || "Unable to fetch Docker data"
    }
    finally {
      pending.value = false
    }
  }

  async function runContainerAction(containerId: string, action: DockerContainerAction) {
    pendingActionId.value = containerId
    errorMessage.value = ""

    try {
      await $fetch(`/api/docker/container/${encodeURIComponent(containerId)}`, { method: "POST", credentials: "include", body: { action } })
      await refreshSnapshot()
    }
    catch (err: unknown) {
      errorMessage.value = (err as { data?: { message?: string }, statusMessage?: string })?.data?.message || (err as { statusMessage?: string })?.statusMessage || `Unable to ${action} container`
    }
    finally {
      pendingActionId.value = null
    }
  }

  return {
    snapshot,
    pending,
    pendingActionId,
    errorMessage,
    refreshSnapshot,
    runContainerAction,
  }
})
