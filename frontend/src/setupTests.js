import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

// React Router 7 uses these browser globals, which JSDOM does not provide.
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
