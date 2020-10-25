import fs from 'fs'
import path from 'path'
import express from 'express'

const router = express.Router()
const indexJs = path.basename(__filename)

const isSubRouteFile = (file) => {
    return (file.indexOf('.') !== 0) && 
        (file !== indexJs) && 
        file.slice(-9) === ".route.js"
}

const useRoute = (routeFile) => {
    let routerName = routeFile.split('.')[0]
    if (routerName === "index") {
        routerName = ""
    }

    router.use(
        `/${routerName}`, 
        require(`./${routeFile}`).default)
}

fs.readdirSync(__dirname)
    .filter(file => isSubRouteFile(file))
    .forEach(routeFile => useRoute(routeFile))

export default router