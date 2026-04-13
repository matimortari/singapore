export function useUIState(refreshHandler: () => Promise<void> | void) {
  const autoRefreshEnabled = ref(true)
  let refreshTimer: ReturnType<typeof setInterval> | null = null

  function formatImageSize(sizeInBytes: number) {
    if (!sizeInBytes) {
      return "0 B"
    }

    const units = ["B", "KB", "MB", "GB", "TB"]
    const unitIndex = Math.min(Math.floor(Math.log(sizeInBytes) / Math.log(1024)), units.length - 1)
    const value = sizeInBytes / 1024 ** unitIndex

    return `${value.toFixed(1)} ${units[unitIndex]}`
  }

  function syncAutoRefresh() {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }

    if (!autoRefreshEnabled.value) {
      return
    }

    refreshTimer = setInterval(() => {
      void refreshHandler()
    }, 5000)
  }

  onUnmounted(() => {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  })

  return {
    autoRefreshEnabled,
    formatImageSize,
    syncAutoRefresh,
  }
}
