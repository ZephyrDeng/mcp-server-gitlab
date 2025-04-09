import { z } from "zod";

/**
 * 获取字段过滤参数的 zod schema
 * 
 * 输入支持：
 * - undefined
 * - 字符串（逗号分隔字段路径）
 * - 字符串数组
 * 
 * 输出统一为字符串数组，自动去除空白项
 */
export function createFieldsSchema() {
  const stringArraySchema = z.array(z.string().trim()).refine(
    arr => arr.every(s => s.length > 0),
    { message: "字段路径不能为空字符串" }
  );

  const commaSeparatedStringSchema = z.string().trim();

  return z
    .union([stringArraySchema, commaSeparatedStringSchema])
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      if (Array.isArray(val)) {
        return val.filter((s) => s.trim().length > 0);
      }
      // 字符串，按逗号切分，去除空白项
      return val
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    })
    .describe(
      `需要返回的字段路径数组，支持数组或逗号分隔字符串，用于过滤 API 响应字段。
示例：
- ["id", "name", "owner.username"]
- "id,name,owner.username"
- undefined`
    );
}