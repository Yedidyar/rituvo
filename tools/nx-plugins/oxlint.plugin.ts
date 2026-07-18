import { dirname } from 'node:path'

export interface OxlintPluginOptions {
  lintTargetName?: string
  lintFixTargetName?: string
  formatTargetName?: string
  formatCheckTargetName?: string
}

const defaultOptions: Required<OxlintPluginOptions> = {
  lintTargetName: 'lint',
  lintFixTargetName: 'lint:fix',
  formatTargetName: 'format',
  formatCheckTargetName: 'format:check',
}

/**
 * Infers oxlint and oxfmt targets for workspace apps and packages.
 * Target configuration comes from `targetDefaults` in nx.json.
 */
export const createNodesV2 = [
  '{apps,packages}/*/package.json',
  async (configFiles: string[], options: OxlintPluginOptions = {}) => {
    const resolvedOptions = { ...defaultOptions, ...options }

    return configFiles.map((configFile) => {
      const projectRoot = dirname(configFile)

      return [
        configFile,
        {
          projects: {
            [projectRoot]: {
              targets: {
                [resolvedOptions.lintTargetName]: {},
                [resolvedOptions.lintFixTargetName]: {},
                [resolvedOptions.formatTargetName]: {},
                [resolvedOptions.formatCheckTargetName]: {},
              },
            },
          },
        },
      ] as const
    })
  },
]
