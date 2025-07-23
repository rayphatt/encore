#!/bin/bash

echo "🚀 Encore Deployment Script"
echo "=========================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit for deployment"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Frontend Environment Variables
VITE_API_BASE_URL=http://localhost:3000
VITE_USE_MOCK_DATA=true

# Backend Environment Variables
JWT_SECRET=your_secure_jwt_secret_here
PORT=3000
NODE_ENV=development
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "📝 Creating .env.production file..."
    cat > .env.production << EOF
# Production Environment Variables
# Update VITE_API_BASE_URL with your Railway backend URL after deployment
VITE_API_BASE_URL=https://your-railway-backend-url.railway.app
VITE_USE_MOCK_DATA=false
EOF
    echo "✅ .env.production file created"
else
    echo "✅ .env.production file already exists"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Create a GitHub repository and push your code"
echo "2. Follow the DEPLOYMENT.md guide to deploy to Vercel and Railway"
echo "3. Update your domain DNS settings"
echo "4. Test your deployment at https://join-encore.com"
echo ""
echo "📚 See DEPLOYMENT.md for detailed instructions" 