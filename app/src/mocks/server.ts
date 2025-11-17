import { setupServer } from 'msw/node';
import { templatesHandlers } from './handlers/templates';

export const server = setupServer(...templatesHandlers);