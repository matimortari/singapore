interface User {
  id: string
  name: string
  email: string
  image?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
}

interface Toast {
  id: string
  message: string
  type: "success" | "error" | "warning" | "info"
  duration?: number
}

interface DockerRequestOptions {
  path: string
  method?: "GET" | "POST" | "PUT" | "DELETE"
}

type DockerContainerAction = "start" | "stop" | "restart"

interface DockerContainerInfo {
  id: string
  name: string
  image: string
  state: string
  status: string
}

interface DockerImageInfo {
  id: string
  tags: string[]
  size: number
}

interface DockerSnapshot {
  serverVersion: string
  containers: DockerContainerInfo[]
  images: DockerImageInfo[]
  stats: {
    containersTotal: number
    containersRunning: number
    containersExited: number
    imagesTotal: number
  }
}
