import {defineArrayMember, defineField, defineType} from 'sanity'
import {PlayIcon} from '@sanity/icons/Play'

import {uniqueSlug} from '../lib/uniqueSlug'

/**
 * A single video lesson.
 *
 * Deliberately does not store its parent course (AGENTS.md §8) — a lesson is
 * reached from a course's module list, and the course is derived back with a
 * reverse reference. Storing it both ways invites the two to disagree.
 */
export const lesson = defineType({
  name: 'lesson',
  title: 'Lesson',
  type: 'document',
  icon: PlayIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'video', title: 'Video'},
    {name: 'extras', title: 'Notes & resources'},
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
      validation: (rule) => rule.required().custom(uniqueSlug('lesson')),
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      group: 'video',
      description:
        'YouTube, Vimeo or Bunny. The provider is read from this URL — it is not stored separately.',
      validation: (rule) =>
        rule.required().uri({scheme: ['https']}).error('Must be an https:// URL'),
    }),
    defineField({
      name: 'poster',
      title: 'Poster image',
      type: 'image',
      group: 'video',
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
      name: 'durationSeconds',
      title: 'Duration (seconds)',
      type: 'number',
      group: 'video',
      description:
        'Whole seconds. The site formats it, and a course adds these up for its total runtime.',
      validation: (rule) => rule.required().integer().positive(),
    }),
    defineField({
      name: 'freePreview',
      title: 'Free preview',
      type: 'boolean',
      group: 'content',
      description: 'A label only. It does not grant or restrict access (AGENTS.md §7).',
      initialValue: false,
    }),
    defineField({
      name: 'studentCount',
      title: 'Students (for display)',
      type: 'number',
      group: 'content',
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: 'notes',
      type: 'array',
      group: 'extras',
      of: [defineArrayMember({type: 'block'})],
      description: 'Structured rich text, never markdown (AGENTS.md §7).',
    }),
    defineField({
      name: 'keyPoints',
      title: 'Key points',
      type: 'array',
      group: 'extras',
      of: [defineArrayMember({type: 'keyPoint'})],
      description: 'The "in this lesson you will" list. Search surfaces these too.',
      validation: (rule) => rule.max(6),
    }),
    defineField({
      name: 'proTip',
      title: 'Pro tip',
      type: 'text',
      group: 'extras',
      rows: 3,
      validation: (rule) => rule.max(320),
    }),
    defineField({
      name: 'resources',
      type: 'array',
      group: 'extras',
      of: [defineArrayMember({type: 'resource'})],
    }),
  ],
  preview: {
    select: {title: 'title', media: 'poster', durationSeconds: 'durationSeconds'},
    prepare({title, media, durationSeconds}) {
      const minutes = durationSeconds ? Math.round(durationSeconds / 60) : null
      return {title, media, subtitle: minutes ? `${minutes} min` : 'No duration set'}
    },
  },
})
