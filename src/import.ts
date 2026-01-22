import module from 'node:module'
import * as path from 'node:path'
import * as url from 'node:url'
import * as fs from 'node:fs'

type Hooks = NonNullable<Parameters<typeof module.registerHooks>[0]>
type ResolveHook = Hooks['resolve']
type LoadHook = Hooks['load']

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const __console = path.resolve(__dirname, '..', 'utils', 'console.ts')

let importUrls: URL[] = []
main()

/**
 *
 */
function main () : void {
  /**
   * @see https://nodejs.org/api/module.html#synchronous-resolvespecifier-context-nextresolve
   */
  const resolve: ResolveHook = (specifier, context, nextResolve) => {
    const importUrlStrings = importUrls.map(u => u.toString())
    if (!(importUrlStrings.includes(specifier))) return nextResolve(specifier, context)

    const specifierUrl = new URL(specifier);
    if (specifierUrl.searchParams.has('cachebuster') || specifierUrl.searchParams.has('load')) return nextResolve(specifier, context);

    specifierUrl.searchParams.set('cachebuster', fs.statSync(url.fileURLToPath(specifierUrl)).mtimeMs.toString())
    return { url: specifierUrl.toString(), format: 'tool-import', shortCircuit: true }
  }

  /**
   * @see https://nodejs.org/api/module.html#synchronous-loadurl-context-nextload
   */
  const load: LoadHook = (specifierUrl, context, nextLoad) => {
    if (context.format !== 'tool-import') return nextLoad(specifierUrl, context);

    const specifierUrlObj = new URL(specifierUrl)
    specifierUrlObj.searchParams.set('load', 'true')

    const root = url.fileURLToPath(new URL('.', specifierUrl))
    const consolePath = path.relative(root, __console)

    return {
      format: 'module',
      shortCircuit: true,
      source: [
        // console is now globally overloaded, this could have been done already in a side-effect
        // but this way is less likely to cause issues if something imports this file accidentally.
        `global.console = (await import('${consolePath}')).default;`,
        `export * from '${specifierUrlObj.toString()}';`,
        `export { default } from '${specifierUrlObj.toString()}';`,
      ].join('\n')
    }
  }

  module.registerHooks({ resolve, load })
}

/**
 *
 */
export async function onToolListChanged (toolUrls: URL[]) : Promise<void> {
  importUrls = toolUrls
}
