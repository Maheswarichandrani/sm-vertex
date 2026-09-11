import {defineArrayMember, defineField, defineType} from 'sanity'
import {FolderIcon} from '@sanity/icons/Folder'

/**
 * A section of a course.
 *
 * Embedded in the course, never its own document (AGENTS.md §8): a module has
 * no meaning apart from the course it sits in, and its position in the array
 * is what produces "Module 5" on the site. Nothing here stores that number.
 */
export const module = defineType({
  name: 'module',
  title: 'Module',
  type: 'object',
  icon: FolderIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      type: 'text',
      rows: 2,
      description: 'One or two sentences on what this module covers.',
      validation: (rule) => rule.required().max(240),
    }),
    defineField({
      name: 'lessons',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'lesson'}]})],
      description:
        'In teaching order. Search quality depends on these genuinely covering the module topic.',
      validation: (rule) => rule.required().min(1).unique(),
    }),
  ],
  preview: {
    select: {title: 'title', lessons: 'lessons'},
    prepare({title, lessons}) {
      const count = lessons?.length ?? 0
      return {
        title,
        subtitle: `${count} ${count === 1 ? 'lesson' : 'lessons'}`,
      }
    },
  },
})
