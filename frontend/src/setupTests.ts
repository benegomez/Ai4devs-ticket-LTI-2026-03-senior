// Polyfill Web APIs needed by react-router v7 under Jest 27 / jsdom
import { TextEncoder, TextDecoder } from 'util';
Object.assign(global, { TextEncoder, TextDecoder });

// jest-dom extends expect with DOM matchers (toBeInTheDocument, etc.)
import '@testing-library/jest-dom';
