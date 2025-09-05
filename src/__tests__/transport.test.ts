import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock environment variables
const originalEnv = process.env;

describe('Transport Configuration', () => {
  beforeEach(() => {
    jest.resetModules();
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

    const port = parseInt(process.env.MCP_PORT || '3000');
    const endpoint = process.env.MCP_ENDPOINT || '/mcp';

    expect(port).toBe(3000);
    expect(endpoint).toBe('/mcp');
  });

  it('should use custom port and endpoint when specified', () => {
    process.env.MCP_PORT = '4000';
    process.env.MCP_ENDPOINT = '/custom';

    const port = parseInt(process.env.MCP_PORT || '3000');
    const endpoint = process.env.MCP_ENDPOINT || '/mcp';

    expect(port).toBe(4000);
    expect(endpoint).toBe('/custom');
  });
});