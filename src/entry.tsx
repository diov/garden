import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import type { RouteObject } from 'react-router-dom'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

export function PkmSSG(routers: RouteObject[]) {
  const isServer = typeof window === 'undefined'

  async function createApp(server: boolean) {
    const router = server
      ? undefined
      : createBrowserRouter(routers)

    return {
      routes: routers,
      router,
    }
  }

  if (!isServer) {
    (async () => {
      const { router } = await createApp(false)
      const app = (
        <StrictMode>
          <RouterProvider router={router!} />
        </StrictMode>
      )
      createRoot(document.getElementById('root') as HTMLDivElement).render(app)
    })()
  }

  return createApp
}
