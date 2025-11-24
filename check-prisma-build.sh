#!/bin/bash

# Prisma 构建诊断脚本
# 用于检查 Prisma Query Engine 是否正确生成和配置

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Prisma 构建诊断工具"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. 检查 Prisma schema 配置
echo "1. 检查 Prisma schema 配置..."
if grep -q "binaryTargets.*rhel-openssl-3.0.x" prisma/schema.prisma; then
    echo "   ✓ binaryTargets 已配置为包含 rhel-openssl-3.0.x"
else
    echo "   ✗ binaryTargets 未正确配置"
fi
echo ""

# 2. 检查 package.json 脚本
echo "2. 检查 package.json 脚本..."
if grep -q "prisma generate" package.json; then
    echo "   ✓ postinstall 脚本包含 prisma generate"
else
    echo "   ✗ postinstall 脚本未包含 prisma generate"
fi

if grep -q "vercel-build.*prisma generate" package.json; then
    echo "   ✓ vercel-build 脚本包含 prisma generate"
else
    echo "   ✗ vercel-build 脚本未包含 prisma generate"
fi
echo ""

# 3. 检查 next.config.ts
echo "3. 检查 next.config.ts 配置..."
if grep -q "outputFileTracingIncludes" next.config.ts; then
    echo "   ✓ outputFileTracingIncludes 已配置"
else
    echo "   ✗ outputFileTracingIncludes 未配置"
fi

if grep -q "PrismaPlugin" next.config.ts; then
    echo "   ✓ PrismaPlugin 已配置"
else
    echo "   ✗ PrismaPlugin 未配置"
fi
echo ""

# 4. 尝试生成 Prisma Client
echo "4. 尝试生成 Prisma Client..."
if [ -z "$DATABASE_URL" ]; then
    echo "   ⚠ DATABASE_URL 未设置，使用临时值"
    export DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
fi

npx prisma generate --schema=./prisma/schema.prisma 2>&1 | head -20
echo ""

# 5. 检查生成的二进制文件
echo "5. 检查生成的二进制文件..."
if [ -f "node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node" ]; then
    echo "   ✓ rhel-openssl-3.0.x 二进制文件存在"
    ls -lh node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node
else
    echo "   ✗ rhel-openssl-3.0.x 二进制文件不存在"
    echo "   检查 node_modules/.prisma/client 目录内容："
    ls -la node_modules/.prisma/client/ 2>/dev/null | head -10 || echo "   目录不存在"
fi
echo ""

# 6. 检查所有生成的二进制文件
echo "6. 检查所有生成的 Query Engine 二进制文件..."
if [ -d "node_modules/.prisma/client" ]; then
    echo "   找到以下二进制文件："
    find node_modules/.prisma/client -name "libquery_engine*" -o -name "query-engine*" 2>/dev/null | while read file; do
        echo "   - $file ($(ls -lh "$file" | awk '{print $5}'))"
    done
else
    echo "   ✗ node_modules/.prisma/client 目录不存在"
fi
echo ""

# 7. 检查 Next.js 构建输出
echo "7. 检查 .next 目录（如果存在）..."
if [ -d ".next" ]; then
    echo "   ✓ .next 目录存在"
    echo "   检查 server 目录中的 Prisma 相关文件："
    find .next/server -name "*prisma*" 2>/dev/null | head -5 || echo "   未找到 Prisma 相关文件"
else
    echo "   ⚠ .next 目录不存在（需要先运行 next build）"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "诊断完成"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "下一步："
echo "1. 如果二进制文件不存在，运行: DATABASE_URL='postgresql://dummy:dummy@localhost:5432/dummy' npx prisma generate --schema=./prisma/schema.prisma"
echo "2. 提交更改并推送到 GitHub"
echo "3. 在 Vercel Dashboard 中清除构建缓存并重新部署"
echo "4. 检查 Vercel 构建日志，确认 prisma generate 成功执行"
