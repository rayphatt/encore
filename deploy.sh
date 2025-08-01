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
VITE_USE_MOCK_DATA=false

# Spotify API Credentials (for direct artist links)
VITE_SPOTIFY_CLIENT_ID=daafeb9e982844319cc6006868adda87
VITE_SPOTIFY_CLIENT_SECRET=3eb779de1d7d4f84b04eda0f269a40e2

# Optional API Keys (for enhanced features)
# VITE_LASTFM_API_KEY=your_lastfm_api_key_here
# VITE_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
EOF
    echo "✅ .env file created with Spotify credentials"
else
    echo "✅ .env file already exists"
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "📝 Creating .env.production file..."
    cat > .env.production << EOF
# Production Environment Variables
VITE_USE_MOCK_DATA=false

# Spotify API Credentials (for direct artist links)
VITE_SPOTIFY_CLIENT_ID=daafeb9e982844319cc6006868adda87
VITE_SPOTIFY_CLIENT_SECRET=3eb779de1d7d4f84b04eda0f269a40e2

# Optional API Keys (for enhanced features)
# VITE_LASTFM_API_KEY=your_lastfm_api_key_here
# VITE_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
EOF
    echo "✅ .env.production file created with Spotify credentials"
else
    echo "✅ .env.production file already exists"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Create a GitHub repository and push your code"
echo "2. Deploy to Vercel (frontend only - no backend needed)"
echo "3. Configure Firebase for production"
echo "4. Test your deployment"
echo ""
echo "📚 See DEPLOYMENT.md for detailed instructions" 