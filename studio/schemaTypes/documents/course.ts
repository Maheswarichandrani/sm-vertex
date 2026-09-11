import {defineArrayMember, defineField, defineType} from 'sanity'
import {BookIcon} from '@sanity/icons/Book'

import {uniqueSlug} from '../lib/uniqueSlug'

/**
 * The top of the content model.
 *
 * Carries no duration or lesson count of its own: both are summed from the
 * lessons its modules reference, so they cannot drift out of date.
 */
export const course = defineType({
  name: 'course',
  title: 'Course',
  type: 'document',
  icon: BookIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'marketing', title: 'Marketing'},
    {name: 'curriculum', title: 'Curriculum'},
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'content',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required().custom(uniqueSlug('course')),
    }),
    defineField({
      name: 'summary',
      type: 'text',
      group: 'content',
      rows: 3,
      validation: (rule) => rule.required().max(280),
    }),
    defineField({
      name: 'instructor',
      type: 'reference',
      group: 'content',
      to: [{type: 'instructor'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      type: 'reference',
      group: 'content',
      to: [{type: 'category'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      group: 'marketing',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          validation: (rule) => rule.required().warning('Alt text is important for accessibility'),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'level',
      type: 'string',
      group: 'marketing',
      options: {
        list: [
          {title: 'Beginner', value: 'beginner'},
          {title: 'Intermediate', value: 'intermediate'},
          {title: 'Advanced', value: 'advanced'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'price',
      type: 'number',
      group: 'marketing',
      description: 'In whole currency units. 0 means free.',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'popular',
      type: 'boolean',
      group: 'marketing',
      description: 'Shows the popular badge and sorts the course to the front of the catalog.',
      initialValue: false,
    }),
    defineField({
      name: 'studentCount',
      title: 'Students (for display)',
      type: 'number',
      group: 'marketing',
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: 'learningOutcomes',
      title: "What you'll learn",
      type: 'array',
      group: 'marketing',
      of: [defineArrayMember({type: 'learningOutcome'})],
      validation: (rule) => rule.max(6),
    }),
    defineField({
      name: 'modules',
      type: 'array',
      group: 'curriculum',
      of: [defineArrayMember({type: 'module'})],
      description: 'In teaching order. "Module 5" comes from this order, not from a stored number.',
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {title: 'title', instructor: 'instructor.name', media: 'coverImage'},
    prepare({title, instructor, media}) {
      return {title, media, subtitle: instructor ?? 'No instructor'}
    },
  },
})
