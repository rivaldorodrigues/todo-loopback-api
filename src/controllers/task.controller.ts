import {inject} from '@loopback/core';
import {
  Request,
  RestBindings,
  get,
  post,
  getModelSchemaRef,
  requestBody,
  del,
  param,
  put
} from '@loopback/rest';
import {Task} from '../models';
import { v4 as uuidv4 } from 'uuid';

const tasks = new Map<string, Task>();

export class TaskController {

  constructor(@inject(RestBindings.Http.REQUEST) private req: Request) {}

  @get('/tasks/{id}', {
    responses: {
      '200': {
        description: 'Task model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Task, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<Task | undefined> {
    return tasks.get(id);
  }

  @get('/tasks', {
    responses: {
      '200': {
        description: 'Array of Task model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Task, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(): Promise<Task[]> {
    return Array.from( tasks.values() );
  }

  @post('/tasks', {
    responses: {
      '200': {
        description: 'Task model instance',
        content: {'application/json': {schema: getModelSchemaRef(Task)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Task, {
            title: 'New Task',
            exclude: ['id'],
          }),
        },
      },
    })
    task: Omit<Task, 'id'>,
  ): Promise<Task> {

    const newTask = new Task();
    newTask.id = uuidv4();
    newTask.description = task.description;
    newTask.completed = task.completed;

    tasks.set(newTask.id!, newTask);
    return newTask;
  }

  @put('/tasks/{id}', {
    responses: {
      '204': {
        description: 'Task PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() task: Task,
  ): Promise<void> {
    tasks.set(id, task);
  }

  @del('/tasks/{id}', {
    responses: {
      '204': {
        description: 'Task DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    tasks.delete(id);
  }
}
