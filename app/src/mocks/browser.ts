import { setupWorker } from 'msw/browser';
import { templatesHandlers } from './handlers/templates';

export const worker = setupWorker(...templatesHandlers);