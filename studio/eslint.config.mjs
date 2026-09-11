import globals from 'globals'
import studio from '@sanity/eslint-config-studio'

export default [
  ...studio,
  {
    /**
     * The seed tooling is Node, not Studio code — it runs from the command line
     * and never ships in the bundle, so it needs Node globals rather than the
     * browser ones the Studio config assumes.
     */
    files: ['seed/**/*.mjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
]
