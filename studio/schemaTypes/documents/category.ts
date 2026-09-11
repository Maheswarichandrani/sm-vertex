import {defineField, defineType} from 'sanity'
import {TagIcon} from '@sanity/icons/Tag'

import {uniqueSlug} from '../lib/uniqueSlug'

export const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required().custom(uniqueSlug('category')),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().max(240),
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'description'},
  },
})
