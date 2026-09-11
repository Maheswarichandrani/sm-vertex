import {category} from './documents/category'
import {course} from './documents/course'
import {instructor} from './documents/instructor'
import {lesson} from './documents/lesson'
import {keyPoint} from './objects/keyPoint'
import {learningOutcome} from './objects/learningOutcome'
import {module} from './objects/module'
import {resource} from './objects/resource'

export const schemaTypes = [
  // Documents
  course,
  lesson,
  instructor,
  category,
  // Objects embedded in the documents above
  module,
  learningOutcome,
  keyPoint,
  resource,
]
