<template>
  <nav class="flex w-full flex-row items-center justify-between gap-2 border-b px-4 py-2.5">
    <div class="flex flex-row items-center gap-2">
      <nuxt-link to="/" class="flex flex-row items-center gap-2 text-sm font-semibold">
        <icon name="simple-icons:nuxt" size="20" class="text-primary" />
        <span>Singapore</span>
      </nuxt-link>

      <template v-if="userStore.user">
        <div class="h-4 w-px bg-muted" />
        <div class="flex flex-row items-center gap-2 rounded-full p-2 text-xs text-muted-foreground">
          <div class="flex size-5 items-center justify-center rounded-full bg-info/20 text-xs font-semibold text-info">
            {{ initials }}
          </div>
          {{ userStore.user.name }}
          <button class="btn h-7 px-2 text-xs" @click="signOut">
            Sign out
          </button>
        </div>
      </template>
    </div>

    <div class="flex flex-row items-center gap-2">
      <nuxt-link to="https://github.com/matimortari/singapore" class="btn">
        <icon name="simple-icons:github" size="15" />
      </nuxt-link>
      <button class="btn" @click="toggleTheme">
        <icon :name="themeIcon" size="15" />
      </button>
      <nuxt-link v-if="!userStore.user" to="/sign-in" class="btn h-8 px-3 text-sm font-medium">
        Sign in
      </nuxt-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
const { toggleTheme, themeIcon } = useTheme()
const userStore = useUserStore()
const initials = computed(() => (userStore.user?.name ?? "").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase())

onMounted(async () => {
  try {
    await userStore.getUser()
  }
  catch (err: unknown) {
    console.error("Failed to fetch user:", err)
  }
})
</script>
