#!/bin/bash

# Todo Multi-Users - User Management Script
# Usage: ./todo-add-user.sh add <name> <provider>
#        ./todo-add-user.sh remove <name>
#        ./todo-add-user.sh list

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Database URL from .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL not found in .env file${NC}"
    exit 1
fi

# Function to show usage
show_usage() {
    echo "Usage:"
    echo "  ./todo-add-user.sh add <alias> <provider>    # Add a new user with OAuth authorization"
    echo "  ./todo-add-user.sh remove <alias>            # Remove a user"
    echo "  ./todo-add-user.sh list                      # List all users"
    echo ""
    echo "Providers: google, github, facebook"
    echo ""
    echo "The 'add' command will:"
    echo "  1. Create a user record with the specified alias"
    echo "  2. Open a browser for OAuth authorization with the provider"
    echo "  3. Complete the setup once OAuth authorization is successful"
    echo ""
    echo "Examples:"
    echo "  ./todo-add-user.sh add john google     # User 'john' will login via Google OAuth"
    echo "  ./todo-add-user.sh add alice github    # User 'alice' will login via GitHub OAuth"
    echo "  ./todo-add-user.sh remove john         # Remove user 'john'"
    echo "  ./todo-add-user.sh list                # Show all users and their authorization status"
}

# Function to add user
add_user() {
    local alias="$1"
    local provider="$2"
    
    if [ -z "$alias" ] || [ -z "$provider" ]; then
        echo -e "${RED}Error: Both alias and provider are required${NC}"
        show_usage
        exit 1
    fi
    
    # Validate provider
    if [[ ! "$provider" =~ ^(google|github|facebook)$ ]]; then
        echo -e "${RED}Error: Provider must be one of: google, github, facebook${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}Creating user record and initiating OAuth authorization...${NC}"
    
    # Call the authorization API
    local base_url="${NEXTAUTH_URL:-http://localhost:3000}"
    local response=$(curl -s -w "\n%{http_code}" -X POST "$base_url/api/auth/authorize" \
        -H "Content-Type: application/json" \
        -d "{\"alias\":\"$alias\",\"provider\":\"$provider\"}")
    
    # Split response body and status code
    local http_code=$(echo "$response" | tail -n1)
    local response_body=$(echo "$response" | sed '$d')
    
    # Check HTTP status code
    if [ "$http_code" != "200" ]; then
        local error_msg=$(echo "$response_body" | node -e "
try {
  const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
  console.log(data.error || 'Unknown error');
} catch (e) {
  console.log('Failed to parse error response');
}
" 2>/dev/null)
        
        echo -e "${RED}Error: $error_msg${NC}"
        
        if [ "$http_code" = "409" ]; then
            echo -e "${YELLOW}User '$alias' already exists. Use a different alias or remove the existing user first.${NC}"
        fi
        exit 1
    fi
    
    # Extract auth URL from successful response
    local auth_url=$(echo "$response_body" | node -e "
const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
console.log(data.authUrl || '');
" 2>/dev/null)
    
    echo -e "${GREEN}✓ User record created for alias '$alias'${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}IMPORTANT: OAuth Authorization Required${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "To complete the setup for user '${GREEN}$alias${NC}', please:"
    echo ""
    echo -e "1. Open the following URL in your browser:"
    echo -e "   ${GREEN}$auth_url${NC}"
    echo ""
    echo -e "2. Login with your ${GREEN}$provider${NC} account"
    echo ""
    echo -e "3. Grant the necessary permissions"
    echo ""
    echo -e "4. You will see a success page when authorization is complete"
    echo ""
    echo -e "${YELLOW}Note: The user '$alias' will not be able to login until OAuth authorization is completed.${NC}"
    echo ""
    
    # Try to open the URL in the default browser (macOS/Linux) only if URL is not empty
    if [ -n "$auth_url" ]; then
        if command -v open >/dev/null 2>&1; then
            echo -e "${YELLOW}Opening browser automatically...${NC}"
            open "$auth_url"
        elif command -v xdg-open >/dev/null 2>&1; then
            echo -e "${YELLOW}Opening browser automatically...${NC}"
            xdg-open "$auth_url"
        else
            echo -e "${YELLOW}Please copy and paste the URL above into your browser.${NC}"
        fi
    else
        echo -e "${RED}Error: No authorization URL was generated. Please check server logs.${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}Setup initiated successfully!${NC}"
}

# Function to remove user
remove_user() {
    local alias="$1"
    
    if [ -z "$alias" ]; then
        echo -e "${RED}Error: User alias is required${NC}"
        show_usage
        exit 1
    fi
    
    # Check if user exists
    local existing_user=$(node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const user = await prisma.user.findUnique({ where: { alias: '$alias' } });
    console.log(user ? 'EXISTS' : 'NOT_EXISTS');
  } catch (error) {
    console.log('ERROR');
  } finally {
    await prisma.\$disconnect();
  }
})();
" 2>/dev/null)
    
    if [ "$existing_user" != "EXISTS" ]; then
        echo -e "${YELLOW}Warning: User with alias '$alias' not found${NC}"
        exit 1
    fi
    
    # Remove user from database
    local sql="DELETE FROM \"User\" WHERE alias = '$alias';"
    
    npx prisma db execute --schema prisma/schema.prisma --stdin <<< "$sql"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ User '$alias' removed successfully${NC}"
    else
        echo -e "${RED}Error: Failed to remove user '$alias'${NC}"
        exit 1
    fi
}

# Function to list users
list_users() {
    echo -e "${YELLOW}Registered Users:${NC}"
    echo "===================================="
    
    local result=$(node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { 
        alias: true, 
        provider: true, 
        isAuthorized: true,
        oauthName: true,
        createdAt: true 
      }
    });
    
    if (users.length === 0) {
      console.log('EMPTY');
    } else {
      users.forEach(user => {
        const date = user.createdAt.toISOString().split('T')[0];
        const status = user.isAuthorized ? 'Authorized' : 'Pending';
        const oauthName = user.oauthName || 'N/A';
        console.log(\`\${user.alias}|\${user.provider}|\${status}|\${oauthName}|\${date}\`);
      });
    }
  } catch (error) {
    console.log('ERROR');
  } finally {
    await prisma.\$disconnect();
  }
})();
" 2>/dev/null)
    
    if [ -z "$result" ] || [ "$result" = "EMPTY" ] || [ "$result" = "ERROR" ]; then
        echo -e "${YELLOW}No users found${NC}"
    else
        echo "Alias         Provider      Status        OAuth Name    Created"
        echo "-----         --------      ------        ----------    -------"
        echo "$result" | column -t -s '|'
    fi
}

# Main script logic
case "$1" in
    "add")
        add_user "$2" "$3"
        ;;
    "remove")
        remove_user "$2"
        ;;
    "list")
        list_users
        ;;
    "")
        echo -e "${RED}Error: Command is required${NC}"
        show_usage
        exit 1
        ;;
    *)
        echo -e "${RED}Error: Unknown command '$1'${NC}"
        show_usage
        exit 1
        ;;
esac
