<template>
  <div class="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
    <div class="card flex w-full max-w-sm flex-col items-center gap-4 py-8">
      <div class="flex size-11 items-center justify-center rounded-xl border border-muted bg-card">
        <icon name="simple-icons:nuxt" size="24" class="text-primary" />
      </div>

      <header class="text-center">
        <h2>
          Welcome back
        </h2>
        <p class="text-caption mt-1">
          Sign in to continue
        </p>
      </header>

      <div class="flex w-full flex-col gap-2.5">
        <button v-for="provider in OAUTH_PROVIDERS" :key="provider.name" class="btn" @click="navigateTo(`/api/auth/${provider.name}`, { external: true })">
          <div class="flex size-7 shrink-0 items-center justify-center rounded-md">
            <icon :name="provider.icon" size="15" />
          </div>
          <span class="text-sm font-medium">{{ provider.label }}</span>
          <icon name="ph:arrow-right-bold" size="15" class="ml-auto text-muted-foreground" />
        </button>
      </div>

      <p v-if="errorMessage" class="flex w-full items-center gap-2 rounded-md border border-danger bg-danger/10 px-3 py-2 text-sm text-danger">
        <icon name="ph:warning-circle-bold" size="15" class="shrink-0" />
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { public: { baseURL } } = useRuntimeConfig()
const route = useRoute()

const OAUTH_PROVIDERS = [
  { name: "github", label: "Sign In With GitHub", icon: "simple-icons:github" },
  { name: "google", label: "Sign In With Google", icon: "simple-icons:google" },
]

const errorMessage = computed(() => {
  const error = route.query.error as string | undefined
  if (!error) {
    return null
  }

  const messages: Record<string, string> = {
    google_oauth_failed: "Google sign in failed. Please try again.",
    github_oauth_failed: "GitHub sign in failed. Please try again.",
    session_expired: "Your session has expired. Please sign in again.",
    session_timeout: "You were signed out due to inactivity.",
  }

  return messages[error] || "Authentication failed. Please try again."
})

useHead({
  title: "Sign In",
  link: [{ rel: "canonical", href: `${baseURL}/sign-in` }],
  meta: [{ name: "description", content: "Sign In page" }],
})
</script>
