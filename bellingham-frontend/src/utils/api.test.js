import { describe, expect, it } from 'vitest';
import { resolveBaseURL } from './api';

describe('resolveBaseURL', () => {
  it('returns empty string when value is missing', () => {
    expect(resolveBaseURL(undefined)).toBe('');
    expect(resolveBaseURL(null)).toBe('');
  });

  it('trims whitespace and strips trailing slashes', () => {
    expect(resolveBaseURL('  https://example.com/api/  ')).toBe('https://example.com/api');
    expect(resolveBaseURL('http://localhost:8080/')).toBe('http://localhost:8080');
  });

  it('normalises a solitary slash to the empty string', () => {
    expect(resolveBaseURL('/')).toBe('');
    expect(resolveBaseURL('   /   ')).toBe('');
  });

  it('returns relative paths unchanged aside from trimming', () => {
    expect(resolveBaseURL(' api/base ')).toBe('api/base');
  });
});
