import path from "path";
import fs from "fs-extra";

/**
 * From picgo, remove plugin version when register plugin name
 * 1. petgpt-plugin-xxx@1.0.0 -> petgpt-plugin-xxx
 * 2. @xxx/petgpt-plugin-xxx@1.0.0 -> @xxx/petgpt-plugin-xxx
 * @param nameOrPath
 * @param scope
 */
export const removePluginVersion = (nameOrPath: string, scope: boolean = false): string => {
    if (!nameOrPath.includes('@')) {
        return nameOrPath
    } else {
        let reg = /(.+\/)?(petgpt-plugin-\w+)(@.+)*/
        // if is a scope pkg
        if (scope) {
            reg = /(.+\/)?(^@[^/]+\/petgpt-plugin-\w+)(@.+)*/
        }
        const matchArr = nameOrPath.match(reg)
        if (!matchArr) {
            console.warn('can not remove plugin version')
            return nameOrPath
        } else {
            return matchArr[2]
        }
    }
}

/**
 * handle transform the path to unix style
 * for example
 * 1. C:\\xxx\\xxx -> C:/xxx/xxx
 * 2. /xxx/xxx -> /xxx/xxx
 * @param path
 */
export const handleUnixStylePath = (pathStr: string): string => {
    const pathArr = pathStr.split(path.sep)
    return pathArr.join('/')
}

/**
 * detect the input string's type
 * for example
 * 1. @xxx/petgpt-plugin-xxx -> scope
 * 2. petgpt-plugin-xxx -> normal
 * 3. xxx -> simple
 * 4. not exists or is a path -> unknown
 * @param name
 */
export const getPluginNameType = (name: string): IPluginNameType => {
    if (/^@[^/]+\/petgpt-plugin-/.test(name)) {
        return 'scope'
    } else if (name.startsWith('petgpt-plugin-')) {
        return 'normal'
    } else if (isSimpleName(name)) {
        return 'simple'
    }
    return 'unknown'
}

/**
 * detect the input string is a simple plugin name or not
 * for example
 * 1. xxx -> true
 * 2. /Usr/xx/xxxx/petgpt-plugin-xxx -> false
 * @param name pluginNameOrPath
 */
export const isSimpleName = (nameOrPath: string): boolean => {
    if (path.isAbsolute(nameOrPath)) {
        return false
    }
    const pluginPath = path.join(process.cwd(), nameOrPath)
    if (fs.existsSync(pluginPath)) {
        return false
    }
    if (nameOrPath.includes('/') || nameOrPath.includes('\\')) {
        return false
    }
    return true
}

/**
 * complete plugin name to full name
 * for example:
 * 1. xxx -> petgpt-plugin-xxx
 * 2. petgpt-plugin-xxx -> petgpt-plugin-xxx
 * @param name pluginSimpleName
 * @param scope pluginScope
 */
export const handleCompletePluginName = (name: string, scope = ''): string => {
    if (scope) {
        return `@${scope}/petgpt-plugin-${name}`
    } else {
        return `petgpt-plugin-${name}`
    }
}

/**
 * get the normal plugin name
 * for example:
 * 1. petgpt-plugin-xxx -> petgpt-plugin-xxx
 * 2. @xxx/petgpt-plugin-xxx -> @xxx/petgpt-plugin-xxx
 * 3. ./xxxx/petgpt-plugin-xxx -> petgpt-plugin-xxx
 * 4. /absolutePath/.../petgpt-plugin-xxx -> petgpt-plugin-xxx
 * 5. an exception: [package.json's name] !== [folder name]
 * then use [package.json's name], usually match the scope package.
 * 6. if plugin name has version: petgpt-plugin-xxx@x.x.x then remove the version
 * @param nameOrPath
 * @param logger
 */
export const getNormalPluginName = (nameOrPath: string, logger: Console = console): string => {
    const pluginNameType = getPluginNameType(nameOrPath)
    switch (pluginNameType) {
        case 'normal':
            return removePluginVersion(nameOrPath)
        case 'scope':
            return removePluginVersion(nameOrPath, true)
        case 'simple':
            return removePluginVersion(handleCompletePluginName(nameOrPath))
        default: {
            // now, the nameOrPath must be path
            // the nameOrPath here will be ensured with unix style
            // we need to find the package.json's name cause npm using the name in package.json's name filed
            if (!fs.existsSync(nameOrPath)) {
                logger.warn(`Can't find plugin: ${nameOrPath}`)
                return ''
            }
            const packageJSONPath = path.posix.join(nameOrPath, 'package.json')
            if (!fs.existsSync(packageJSONPath)) {
                logger.warn(`Can't find plugin: ${nameOrPath}`)
                return ''
            } else {
                const pkg = fs.readJSONSync(packageJSONPath) || {}
                if (!pkg.name?.includes('petgpt-plugin-')) {
                    logger.warn(`The plugin package.json's name filed is ${pkg.name as string || 'empty'}, need to include the prefix: petgpt-plugin-`)
                    return ''
                }
                return pkg.name
            }
        }
    }
}

/**
 * handle install/uninstall/update plugin name or path
 * for example
 * 1. petgpt-plugin-xxx -> petgpt-plugin-xxx
 * 2. @xxx/petgpt-plugin-xxx -> @xxx/petgpt-plugin-xxx
 * 3. xxx -> petgpt-plugin-xxx
 * 4. ./xxxx/petgpt-plugin-xxx -> /absolutePath/.../xxxx/petgpt-plugin-xxx
 * 5. /absolutePath/.../petgpt-plugin-xxx -> /absolutePath/.../petgpt-plugin-xxx
 * @param nameOrPath pluginName or pluginPath
 * @param logger
 */
export const getProcessPluginName = (nameOrPath: string, logger: Console = console): string => {
    const pluginNameType = getPluginNameType(nameOrPath)
    switch (pluginNameType) {
        case 'normal':
        case 'scope':
            return nameOrPath
        case 'simple':
            return handleCompletePluginName(nameOrPath)
        default: {
            // now, the pluginNameType is unknow here
            // 1. check if is an absolute path
            let pluginPath = nameOrPath
            if (path.isAbsolute(nameOrPath) && fs.existsSync(nameOrPath)) {
                return handleUnixStylePath(pluginPath)
            }
            // 2. check if is a relative path
            pluginPath = path.join(process.cwd(), nameOrPath)
            if (fs.existsSync(pluginPath)) {
                return handleUnixStylePath(pluginPath)
            }
            // 3. invalid nameOrPath
            logger.warn(`Can't find plugin ${nameOrPath}`)
            return ''
        }
    }
}


/**
 * streamline the full plugin name to a simple one
 * for example:
 * 1. petgpt-plugin-xxx -> xxx
 * 2. @xxx/petgpt-plugin-yyy -> yyy
 * @param name pluginFullName
 */
export const handleStreamlinePluginName = (name: string) => {
    if (/^@[^/]+\/petgpt-plugin-/.test(name)) {
        return name.replace(/^@[^/]+\/petgpt-plugin-/, '')
    } else {
        return name.replace(/petgpt-plugin-/, '')
    }
}
