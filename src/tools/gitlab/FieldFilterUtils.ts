import { z } from "zod";

export function filterResponseFields(data: any, fields: string[]): any {
  const result: Record<string, any> = {};
  for (const path of fields) {
    const value = getValueByPath(data, path);
    setValueByPath(result, path, value === undefined ? {} : value);
  }
  return result;
}

function getValueByPath(obj: any, path: string): any {
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let current = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    current = current[part];
  }
  return current;
}

function setValueByPath(obj: any, path: string, value: any) {
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current)) {
      current[part] = /^\d+$/.test(parts[i + 1]) ? [] : {};
    }
    current = current[part];
    // 修复：数组索引未命中时，填充空对象，避免稀疏数组
    if (Array.isArray(current) && /^\d+$/.test(parts[i + 1])) {
      const index = parseInt(parts[i + 1], 10);
      while (current.length <= index) {
        current.push({});
      }
    }
  }
  current[parts[parts.length - 1]] = value;
}

export function collectPathInfo(obj: any): { allPaths: string[], suggestedPaths: string[] } {
  const allPaths: string[] = [];
  const suggestedPaths: string[] = [];

  function traverse(value: any, path: string, depth: number) {
    if (depth > 5) return;
    if (Array.isArray(value)) {
      if (value.length > 0) {
        traverse(value[0], `${path}[0]`, depth + 1);
      }
    } else if (value !== null && typeof value === 'object') {
      for (const key of Object.keys(value)) {
        traverse(value[key], path ? `${path}.${key}` : key, depth + 1);
      }
    } else {
      allPaths.push(path);
      if (depth <= 3) {
        suggestedPaths.push(path);
      }
    }
  }

  traverse(obj, '', 0);
  return { allPaths, suggestedPaths };
}

export function preprocessFieldPaths(operation: string, fields: string[]): string[] {
  return fields.map(f => f.trim());
}

export function guessFieldPaths(operation: string, field: string): string[] {
  // 简单实现，未来可根据 operation 智能猜测
  return [field];
}