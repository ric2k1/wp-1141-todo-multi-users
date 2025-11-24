#!/bin/bash

# Vercel 部署诊断脚本
# 用于快速检查常见的部署问题

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Vercel 部署诊断工具${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if DATABASE_URL is set
echo -e "${YELLOW}1. 检查环境变量...${NC}"
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "   ${RED}✗ DATABASE_URL 未设置${NC}"
    echo -e "   ${YELLOW}   请在 .env 文件中设置 DATABASE_URL 或作为环境变量${NC}"
else
    echo -e "   ${GREEN}✓ DATABASE_URL 已设置${NC}"
    # Mask password in URL for display
    masked_url=$(echo "$DATABASE_URL" | sed -E 's|://([^:]+):([^@]+)@|://\1:***@|')
    echo -e "   ${BLUE}   数据库: $masked_url${NC}"
fi

if [ -z "$NEXTAUTH_URL" ]; then
    echo -e "   ${YELLOW}⚠ NEXTAUTH_URL 未设置（将使用默认值）${NC}"
else
    echo -e "   ${GREEN}✓ NEXTAUTH_URL 已设置: $NEXTAUTH_URL${NC}"
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    echo -e "   ${YELLOW}⚠ NEXTAUTH_SECRET 未设置${NC}"
else
    echo -e "   ${GREEN}✓ NEXTAUTH_SECRET 已设置${NC}"
fi

echo ""

# Check Prisma setup
echo -e "${YELLOW}2. 检查 Prisma 配置...${NC}"
if [ -f "prisma/schema.prisma" ]; then
    echo -e "   ${GREEN}✓ Prisma schema 文件存在${NC}"
else
    echo -e "   ${RED}✗ Prisma schema 文件不存在${NC}"
    exit 1
fi

# Check if Prisma Client is generated
if [ -d "node_modules/.prisma/client" ] || [ -d "node_modules/@prisma/client" ]; then
    echo -e "   ${GREEN}✓ Prisma Client 已生成${NC}"
else
    echo -e "   ${YELLOW}⚠ Prisma Client 未生成，正在生成...${NC}"
    npx prisma generate
    echo -e "   ${GREEN}✓ Prisma Client 生成完成${NC}"
fi

echo ""

# Test database connection
echo -e "${YELLOW}3. 测试数据库连接...${NC}"
if [ -z "$DATABASE_URL" ]; then
    echo -e "   ${RED}✗ 无法测试：DATABASE_URL 未设置${NC}"
else
    # Use prisma db pull to test connection (more reliable)
    if DATABASE_URL="$DATABASE_URL" npx prisma db pull --print >/dev/null 2>&1; then
        echo -e "   ${GREEN}✓ 数据库连接成功${NC}"
    else
        echo -e "   ${RED}✗ 数据库连接失败${NC}"
        echo -e "   ${YELLOW}   请检查 DATABASE_URL 是否正确${NC}"
        echo -e "   ${YELLOW}   测试命令: DATABASE_URL=\"你的URL\" npx prisma db pull${NC}"
    fi
fi

echo ""

# Check if migrations are needed
echo -e "${YELLOW}4. 检查数据库迁移...${NC}"
if [ -z "$DATABASE_URL" ]; then
    echo -e "   ${YELLOW}⚠ 跳过：DATABASE_URL 未设置${NC}"
else
    if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
        echo -e "   ${GREEN}✓ 迁移文件存在${NC}"
        migration_count=$(find prisma/migrations -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')
        echo -e "   ${BLUE}   找到 $migration_count 个迁移${NC}"
    else
        echo -e "   ${YELLOW}⚠ 未找到迁移文件${NC}"
        echo -e "   ${YELLOW}   运行: npx prisma migrate dev${NC}"
    fi
fi

echo ""

# Check if tables exist
echo -e "${YELLOW}5. 检查数据库表...${NC}"
if [ -z "$DATABASE_URL" ]; then
    echo -e "   ${YELLOW}⚠ 跳过：DATABASE_URL 未设置${NC}"
else
    # Use prisma db pull to check if User table exists
    schema_output=$(DATABASE_URL="$DATABASE_URL" npx prisma db pull --print 2>/dev/null)
    if echo "$schema_output" | grep -q "model User"; then
        echo -e "   ${GREEN}✓ User 表存在${NC}"
        # Check if table has required fields
        if echo "$schema_output" | grep -q "alias.*String.*@unique"; then
            echo -e "   ${GREEN}✓ User 表结构正确${NC}"
        fi
    else
        echo -e "   ${RED}✗ User 表不存在或无法访问${NC}"
        echo -e "   ${YELLOW}   运行: DATABASE_URL=\"你的URL\" npx prisma migrate deploy${NC}"
    fi
    
    # Check Todo table
    if echo "$schema_output" | grep -q "model Todo"; then
        echo -e "   ${GREEN}✓ Todo 表存在${NC}"
    else
        echo -e "   ${YELLOW}⚠ Todo 表不存在（如果未使用可能正常）${NC}"
    fi
fi

echo ""

# Check package.json scripts
echo -e "${YELLOW}6. 检查构建配置...${NC}"
if grep -q '"vercel-build"' package.json; then
    echo -e "   ${GREEN}✓ vercel-build 脚本已配置${NC}"
    vercel_build=$(grep '"vercel-build"' package.json | sed 's/.*"vercel-build": "\(.*\)".*/\1/')
    echo -e "   ${BLUE}   内容: $vercel_build${NC}"
    
    if echo "$vercel_build" | grep -q "prisma generate"; then
        echo -e "   ${GREEN}✓ 包含 prisma generate${NC}"
    else
        echo -e "   ${YELLOW}⚠ 不包含 prisma generate${NC}"
    fi
    
    if echo "$vercel_build" | grep -q "prisma migrate"; then
        echo -e "   ${GREEN}✓ 包含数据库迁移${NC}"
    else
        echo -e "   ${YELLOW}⚠ 不包含数据库迁移${NC}"
    fi
else
    echo -e "   ${RED}✗ vercel-build 脚本未配置${NC}"
fi

echo ""

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}诊断完成${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}下一步：${NC}"
echo -e "1. 如果发现问题，请查看 ${GREEN}docs/VERCEL_ERROR_DIAGNOSIS.md${NC} 获取详细解决方案"
echo -e "2. 查看 Vercel Dashboard 的日志获取更多信息"
echo -e "3. 确保所有环境变量在 Vercel 中已正确设置"
echo ""
