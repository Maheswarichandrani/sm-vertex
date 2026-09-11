import {defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons/Link'

/** A link offered alongside a lesson: docs, a repo, a download. */
export const resource = defineType({
  name: 'resource',
  title: 'Resource',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'type',
      type: 'string',
      options: {
        list: [
          {title: 'Documentation', value: 'documentation'},
          {title: 'Article', value: 'article'},
          {title: 'Video', value: 'video'},
          {title: 'Download', value: 'download'},
          {title: 'Repository', value: 'repository'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'url',
      type: 'url',
      validation: (rule) =>
        rule.required().uri({scheme: ['https']}).error('Must be an https:// URL'),
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'type'},
  },
})
