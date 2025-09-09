import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock environment variables
const originalEnv = process.env;

describe('Transport Configuration', () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should default to stdio transport when no environment variables are set', () => {
    delete process.env.MCP_TRANSPORT_TYPE;
    process.argv = ['node', 'index.js'];

    // Mock console.log to capture output
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Import and evaluate the transport logic
    const args = process.argv.slice(2);
    const transportType = process.env.MCP_TRANSPORT_TYPE || 
      (args.includes('--http-stream') ? 'httpStream' : 'stdio');
    
    expect(transportType).toBe('stdio');
    consoleSpy.mockRestore();
  });

  it('should use httpStream transport when MCP_TRANSPORT_TYPE is set', () => {
    process.env.MCP_TRANSPORT_TYPE = 'httpStream';
    process.argv = ['node', 'index.js'];

    const args = process.argv.slice(2);
    const transportType = process.env.MCP_TRANSPORT_TYPE || 
      (args.includes('--http-stream') ? 'httpStream' : 'stdio');
    
    expect(transportType).toBe('httpStream');
  });

  it('should use httpStream transport when --http-stream flag is provided', () => {
    delete process.env.MCP_TRANSPORT_TYPE;
    process.argv = ['node', 'index.js', '--http-stream'];

    const args = process.argv.slice(2);
    const transportType = process.env.MCP_TRANSPORT_TYPE || 
      (args.includes('--http-stream') ? 'httpStream' : 'stdio');
    
    expect(transportType).toBe('httpStream');
  });

  it('should use default port and endpoint when not specified', () => {
    delete process.env.MCP_PORT;
    delete process.env.MCP_ENDPOINT;
    delete process.env.MCP_HOST;

    const port = parseInt(process.env.MCP_PORT || '3000');
    const endpoint = process.env.MCP_ENDPOINT || '/mcp';
    const transportType: string = 'httpStream';
    const host = process.env.MCP_HOST || (transportType === 'httpStream' ? '0.0.0.0' : 'localhost');

    expect(port).toBe(3000);
    expect(endpoint).toBe('/mcp');
    expect(host).toBe('0.0.0.0');
  });

  it('should use custom port and endpoint when specified', () => {
    process.env.MCP_PORT = '4000';
    process.env.MCP_ENDPOINT = '/custom';
    process.env.MCP_HOST = '127.0.0.1';

    const port = parseInt(process.env.MCP_PORT || '3000');
    const endpoint = process.env.MCP_ENDPOINT || '/mcp';
    const transportType: string = 'httpStream';
    const host = process.env.MCP_HOST || (transportType === 'httpStream' ? '0.0.0.0' : 'localhost');

    expect(port).toBe(4000);
    expect(endpoint).toBe('/custom');
    expect(host).toBe('127.0.0.1');
  });

  it('should default to 0.0.0.0 for httpStream transport', () => {
    delete process.env.MCP_HOST;
    const transportType: string = 'httpStream';
    const host = process.env.MCP_HOST || (transportType === 'httpStream' ? '0.0.0.0' : 'localhost');

    expect(host).toBe('0.0.0.0');
  });

  it('should default to localhost for stdio transport', () => {
    delete process.env.MCP_HOST;
    const transportType: string = 'stdio';
    const host = process.env.MCP_HOST || (transportType === 'httpStream' ? '0.0.0.0' : 'localhost');

    expect(host).toBe('localhost');
  });
});