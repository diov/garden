import { PkmSSG } from './entry'
import { generateRoutes } from './routes'

const routers = await generateRoutes()
export const createApp = PkmSSG(routers)
