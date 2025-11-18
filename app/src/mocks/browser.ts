import { setupWorker } from 'msw/browser';
import { templateSprint5Handlers } from './handlers/template-sprint5.handlers';
import { templatesHandlers } from './handlers/templates';

export const worker = setupWorker(...templatesHandlers, ...templateSprint5Handlers);