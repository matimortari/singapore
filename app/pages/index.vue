<template>
  <main class="mx-auto flex w-full max-w-5xl flex-col gap-5 p-4 md:p-8">
    <header class="card flex flex-col gap-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h1>
            Overview
          </h1>
          <p class="text-caption">
            Proxied from the Docker Engine socket via server API.
          </p>
        </div>
        <button class="btn flex items-center gap-2 px-4 py-2 text-sm" :disabled="pending" @click="refreshSnapshot">
          <icon :name="pending ? 'line-md:loading-alt-loop' : 'ph:arrows-clockwise-bold'" :size="15" />
          {{ pending ? "Loading" : "Refresh" }}
        </button>
      </div>

      <label class="inline-flex w-fit cursor-pointer items-center gap-2 rounded-md border border-muted bg-card px-3 py-1.5 text-xs text-muted-foreground">
        <span class="size-2 rounded-full transition-colors" :class="autoRefreshEnabled ? 'bg-success' : 'bg-muted-foreground/40'" />
        <input v-model="autoRefreshEnabled" type="checkbox" class="sr-only">
        Live auto-refresh every 5s
      </label>
    </header>

    <section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <article class="card flex flex-col gap-1">
        <p class="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          Engine
        </p>
        <p class="text-base font-medium">
          {{ snapshot?.serverVersion || "—" }}
        </p>
      </article>
      <article class="card flex flex-col gap-1">
        <p class="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          Containers
        </p>
        <p class="text-2xl font-medium">
          {{ snapshot?.stats.containersTotal ?? 0 }}
        </p>
      </article>
      <article class="card flex flex-col gap-1">
        <p class="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          Running
        </p>
        <p class="text-2xl font-medium text-success">
          {{ snapshot?.stats.containersRunning ?? 0 }}
        </p>
      </article>
      <article class="card flex flex-col gap-1">
        <p class="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          Images
        </p>
        <p class="text-2xl font-medium">
          {{ snapshot?.stats.imagesTotal ?? 0 }}
        </p>
      </article>
    </section>

    <section class="grid gap-4 lg:grid-cols-2">
      <article class="card flex min-h-56 flex-col gap-3">
        <div class="flex items-center justify-between">
          <h2>
            Containers
          </h2>
          <span class="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
            {{ snapshot?.containers.length ?? 0 }}
          </span>
        </div>

        <p v-if="!snapshot?.containers.length" class="text-caption">
          No containers found.
        </p>

        <ul v-else class="flex flex-col gap-2">
          <li v-for="container in snapshot.containers" :key="container.id" class="flex flex-col gap-1.5 rounded-md bg-muted/40 p-4">
            <div class="flex items-center justify-between gap-2">
              <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="containerStateMap[container.state]?.badge ?? 'border border-muted text-muted-foreground'">
                {{ container.state }}
              </span>
            </div>
            <p class="text-xs text-muted-foreground">
              {{ container.name }} - {{ container.image }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{ container.status }}
            </p>
            <div class="mt-1 flex flex-wrap gap-1.5">
              <button
                v-for="action in (containerStateMap[container.state]?.actions ?? [])" :key="action.label"
                class="btn h-7 px-2.5 text-xs" :class="action.class"
                :disabled="pendingActionId === container.id" @click="runContainerAction(container.id, action.action)"
              >
                {{ action.label }}
              </button>
            </div>
          </li>
        </ul>
      </article>

      <article class="card flex min-h-56 flex-col gap-3">
        <div class="flex items-center justify-between">
          <h2>
            Images
          </h2>
          <span class="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"> {{ snapshot?.images.length ?? 0 }}</span>
        </div>

        <p v-if="!snapshot?.images.length" class="text-caption">
          No images found.
        </p>

        <ul v-else class="flex flex-col gap-2">
          <li v-for="image in snapshot.images" :key="image.id" class="flex items-center gap-3 rounded-md bg-muted/40 p-3">
            <div class="flex size-7 shrink-0 items-center justify-center rounded-md border border-muted bg-card">
              <icon name="ph:cube-duotone" :size="15" class="text-muted-foreground" />
            </div>
            <div class="flex min-w-0 flex-1 flex-col gap-0.5">
              <p class="truncate text-xs font-medium">
                {{ image.tags[0] }}
              </p>
              <p class="truncate text-xs text-muted-foreground">
                {{ image.id.slice(0, 19) }}…
              </p>
            </div>
            <span class="shrink-0 text-xs text-muted-foreground">{{ formatImageSize(image.size) }}</span>
          </li>
        </ul>
      </article>
    </section>

    <p v-if="errorMessage" class="flex items-center gap-2 rounded-md border border-danger bg-danger/10 p-2 text-sm text-danger">
      <icon name="ph:warning-circle-bold" :size="15" class="shrink-0" />
      {{ errorMessage }}
    </p>
  </main>
</template>

<script setup lang="ts">
interface ContainerAction { label: string, action: DockerContainerAction, class?: string }
type ContainerStateMap = Record<DockerContainerInfo["state"], { badge: string, actions: ContainerAction[] }>

const containerStateMap: ContainerStateMap = {
  running: { badge: "bg-success/10 text-success", actions: [{ label: "Restart", action: "restart" }, { label: "Stop", action: "stop", class: "text-danger border-danger/40" }] },
  exited: { badge: "border border-muted text-muted-foreground", actions: [{ label: "Start", action: "start" }] },
  paused: { badge: "border border-muted text-muted-foreground", actions: [{ label: "Start", action: "start" }] },
  restarting: { badge: "bg-warning/10 text-warning", actions: [] },
  dead: { badge: "bg-danger/10 text-danger", actions: [{ label: "Start", action: "start" }] },
  created: { badge: "border border-muted text-muted-foreground", actions: [{ label: "Start", action: "start" }] },
}

const { public: { baseURL } } = useRuntimeConfig()
const dockerStore = useDockerStore()
const { snapshot, pending, pendingActionId, errorMessage } = storeToRefs(dockerStore)
const { autoRefreshEnabled, formatImageSize, syncAutoRefresh } = useUIState(() => dockerStore.refreshSnapshot())
const { refreshSnapshot, runContainerAction } = dockerStore

onMounted(async () => {
  syncAutoRefresh()
  await refreshSnapshot()
})

watch(autoRefreshEnabled, () => syncAutoRefresh())

useHead({
  title: "Home",
  link: [{ rel: "canonical", href: baseURL ? `${baseURL}` : undefined }].filter(Boolean) as any,
  meta: [{ name: "description", content: "Docker dashboard home page." }],
})
</script>
