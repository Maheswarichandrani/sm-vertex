import {defineField, defineType} from 'sanity'
import {BulbOutlineIcon} from '@sanity/icons/BulbOutline'

/**
 * One line of a lesson's "in this lesson you will" list.
 *
 * Also what search returns as a lesson result's key points (AGENTS.md §11),
 * so keep each one a single specific claim rather than a paragraph.
 */
export const keyPoint = defineType({
  name: 'keyPoint',
  title: 'Key point',
  type: 'object',
  icon: BulbOutlineIcon,
  fields: [
    defineField({
      name: 'text',
      type: 'string',
      validation: (rule) => rule.required().max(120),
    }),
  ],
  preview: {
    select: {title: 'text'},
  },
})
