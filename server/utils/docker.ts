import { Buffer } from "node:buffer"
import { request } from "node:http"

function isHttpEndpoint(socketPath: string): boolean {
  return socketPath.startsWith("http://") || socketPath.startsWith("https://")
}

async function dockerRequestHttp<T>(baseUrl: string, path: string, method: string): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, { method })
  const body = await res.text()
  if (!res.ok) {
    throw new Error(`Docker API error (${res.status}): ${body || "No response body"}`)
  }

  try {
    return body ? JSON.parse(body) as T : ({} as T)
  }
  catch {
    throw new Error("Docker API returned non-JSON response")
  }
}

async function dockerRequestSocket<T>(socketPath: string, path: string, method: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const req = request({ socketPath, path, method }, (res) => {
      const chunks: Uint8Array[] = []

      res.on("data", chunk => chunks.push(chunk))
      res.on("end", () => {
        const body = Buffer.concat(chunks).toString("utf8")
        if ((res.statusCode ?? 500) >= 400) {
          return reject(new Error(`Docker API error (${res.statusCode}): ${body || "No response body"}`))
        }

        try {
          resolve(body ? JSON.parse(body) as T : ({} as T))
        }
        catch {
          reject(new Error("Docker API returned non-JSON response"))
        }
      })
    })

    req.on("error", reject)
    req.end()
  })
}

async function dockerRequest<T>({ path, method = "GET" }: DockerRequestOptions): Promise<T> {
  const { dockerSocketPath } = useRuntimeConfig()

  return isHttpEndpoint(dockerSocketPath) ? dockerRequestHttp<T>(dockerSocketPath, path, method) : dockerRequestSocket<T>(dockerSocketPath, path, method)
}

export async function getDockerSnapshot(): Promise<DockerSnapshot> {
  const [versionData, containersData, imagesData] = await Promise.all([
    dockerRequest<{ Version: string }>({ path: "/version" }),
    dockerRequest<Array<{ Id: string, Names: string[], Image: string, State: string, Status: string }>>({ path: "/containers/json?all=1" }),
    dockerRequest<Array<{ Id: string, RepoTags: string[] | null, Size: number }>>({ path: "/images/json" }),
  ])

  const containers = containersData.map(container => ({
    id: container.Id,
    name: container.Names?.[0]?.replace(/^\//, "") || "unknown",
    image: container.Image,
    state: container.State,
    status: container.Status,
  }))

  const images = imagesData.map(image => ({ id: image.Id, tags: image.RepoTags ?? ["<none>:<none>"], size: image.Size }))

  return {
    serverVersion: versionData.Version,
    containers,
    images,
    stats: {
      containersTotal: containers.length,
      containersRunning: containers.filter(container => container.state === "running").length,
      containersExited: containers.filter(container => container.state === "exited").length,
      imagesTotal: images.length,
    },
  }
}

export async function runDockerContainerAction(containerId: string, action: DockerContainerAction) {
  const encodedId = encodeURIComponent(containerId)
  await dockerRequest<Record<string, never>>({
    path: `/containers/${encodedId}/${action}`,
    method: "POST",
  })
}
