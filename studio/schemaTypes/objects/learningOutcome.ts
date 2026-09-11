import {defineField, defineType} from 'sanity'
import {CheckmarkCircleIcon} from '@sanity/icons/CheckmarkCircle'

/**
 * One row of a course's "what you'll learn" section.
 *
 * Embedded, not a document: an outcome only means anything next to the course
 * that promises it, and no two courses share one.
 */
export const learningOutcome = defineType({
  name: 'learningOutcome',
  title: 'Learning outcome',
  type: 'object',
  icon: CheckmarkCircleIcon,
  fields: [
    defineField({
      name: 'icon',
      type: 'string',
      description: 'Name of the icon the site renders beside this outcome.',
      options: {
        list: [
          {title: 'Rocket', value: 'rocket'},
          {title: 'Layers', value: 'layers'},
          {title: 'Bolt', value: 'bolt'},
          {title: 'Shield', value: 'shield'},
          {title: 'Chart', value: 'chart'},
          {title: 'Terminal', value: 'terminal'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required().max(160),
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'description'},
  },
})
