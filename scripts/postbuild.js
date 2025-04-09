#!/usr/bin/env node
// fix-imports.js
import fs from 'node:fs';
import path from 'node:path';

// 配置输出目录
const distDir = './dist';

// 递归处理文件夹中的所有 JS 文件
function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath); // 递归处理子目录
    } else if (path.extname(file) === '.js') {
      fixImports(filePath);
    }
  }
}

// 修复单个文件中的导入语句
function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 匹配 import 语句中的相对路径导入，但不包含文件扩展名的情况
  const importRegex = /from\s+['"](\.[^'"]*?)['"]|import\s+['"](\.[^'"]*?)['"]/g;
  
  // 添加 .js 扩展名
  content = content.replace(importRegex, (match, importPath1, importPath2) => {
    const importPath = importPath1 || importPath2;
    
    // 如果导入路径已经有扩展名，不做修改
    if (path.extname(importPath)) {
      return match;
    }
    
    // 替换导入路径，添加 .js 扩展名
    return match.replace(importPath, `${importPath}.js`);
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed imports in: ${filePath}`);
}

// 开始处理
console.log('Fixing import paths...');
processDirectory(distDir);
console.log('Done!');