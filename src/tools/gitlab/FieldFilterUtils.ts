/**
 * 过滤响应字段
 * @param data 需要过滤的数据
 * @param fields 要保留的字段路径列表
 * @returns 过滤后的数据，保留与指定字段路径匹配的值
 */
export function filterResponseFields<T>(data: T, fields: string[]): T extends any[]
  ? Array<Record<string, unknown>>
  : Record<string, unknown> {
  // 处理数组情况，递归调用每个元素
  if (Array.isArray(data)) {
    const result = data.map((item) => filterResponseFields(item, fields));
    return result as T extends any[] ? Array<Record<string, unknown>> : Record<string, unknown>;
  }

  // 处理普通对象
  const result: Record<string, unknown> = {};
  for (const path of fields) {
    const value = getValueByPath(data, path);
    if (value === undefined) {
      // 一旦遇到不存在的字段，返回原始数据
      return data as T extends any[] ? Array<Record<string, unknown>> : Record<string, unknown>;
    }
    setValueByPath(result, path, value);
  }
  return result as T extends any[] ? Array<Record<string, unknown>> : Record<string, unknown>;
}

function getValueByPath(obj: any, path: string) {
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