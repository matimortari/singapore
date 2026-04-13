<template>
  <main class="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-8">
    <header class="card flex flex-col gap-4">
      <div class="flex items-center justify-between gap-3">
        <h1>
          Overview
        </h1>

        <button class="btn-primary min-w-28" :disabled="pending" @click="refreshSnapshot">
          <icon :name="pending ? 'line-md:loading-alt-loop' : 'ph:arrows-clockwise-bold'" :size="18" />
          <span>{{ pending ? "Loading" : "Refresh" }}</span>
        </button>
      </div>

      <p class="text-caption">
        Fetches data from your server API, which proxies the Docker Engine socket.
      </p>

      <label class="inline-flex w-fit items-center gap-2 rounded-md border border-muted px-3 py-1.5 text-sm">
        <input v-model="autoRefreshEnabled" type="checkbox" class="size-4">
        Live auto-refresh (5s)
      </label>
    </header>

    <section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <article class="card">
        <p class="text-caption">
          Server Version
        </p>
        <p class="text-lg font-bold">
          {{ snapshot?.serverVersion || "-" }}
        </p>
      </article>

      <article class="card">
        <p class="text-caption">
          Containers
        </p>
        <p class="text-lg font-bold">
          {{ snapshot?.stats.containersTotal ?? 0 }}
        </p>
      </article>

      <article class="card">
        <p class="text-caption">
          Running
        </p>
        <p class="text-lg font-bold text-success">
          {{ snapshot?.stats.containersRunning ?? 0 }}
        </p>
      </article>

      <article class="card">
        <p class="text-caption">
          Images
        </p>
        <p class="text-lg font-bold">
          {{ snapshot?.stats.imagesTotal ?? 0 }}
        </p>
      </article>
    </section>

    <section class="grid gap-4 lg:grid-cols-2">
      <article class="card min-h-56">
        <h2 class="mb-2">
          Containers
        </h2>

        <p v-if="!snapshot?.containers.length" class="text-caption">
          No containers found.
        </p>

        <ul v-else class="space-y-2">
          <li v-for="container in snapshot.containers" :key="container.id" class="rounded-md border border-muted p-2">
            <div class="flex items-center justify-between gap-3">
              <p class="font-semibold">
                {{ container.name }}
              </p>
              <span class="text-caption" :class="container.state === 'running' ? 'text-success!' : ''">{{ container.state }}</span>
            </div>
            <p class="text-caption">
              {{ container.image }}
            </p>
            <p class="text-caption">
              {{ container.status }}
            </p>

            <div class="mt-2 flex flex-wrap gap-2">
              <button class="btn h-8 px-2 text-xs" :disabled="pendingActionId === container.id" @click="runContainerAction(container.id, 'start')">
                Start
              </button>
              <button class="btn h-8 px-2 text-xs" :disabled="pendingActionId === container.id" @click="runContainerAction(container.id, 'stop')">
                Stop
              </button>
              <button class="btn h-8 px-2 text-xs" :disabled="pendingActionId === container.id" @click="runContainerAction(container.id, 'restart')">
                Restart
              </button>
            </div>
          </li>
        </ul>
      </article>

      <article class="card min-h-56">
        <h2 class="mb-2">
          Images
        </h2>

        <p v-if="!snapshot?.images.length" class="text-caption">
          No images found.
        </p>

        <ul v-else class="space-y-2">
          <li v-for="image in snapshot.images" :key="image.id" class="rounded-md border border-muted p-2">
            <p class="font-semibold break-all">
              {{ image.tags[0] }}
            </p>
            <p class="text-caption">
              {{ formatImageSize(image.size) }}
            </p>
            <p class="text-caption break-all">
              {{ image.id }}
            </p>
          </li>
        </ul>
      </article>
    </section>

    <p v-if="errorMessage" class="rounded-md border border-danger bg-danger/10 px-3 py-2 text-sm text-danger">
      {{ errorMessage }}
    </p>
  </main>
</template>

<script setup lang="ts">
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
