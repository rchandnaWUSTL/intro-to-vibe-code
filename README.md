# VibeShip - AI Startup Generator

Generate viral AI startup ideas with one click. VibeShip is a minimalist web application that creates creative, compelling, and Twitter-ready startup ideas that users can instantly share.

## Features

- **One-Click Generation**: Generate AI startup ideas instantly
- **Dark Mode by Default**: Modern, eye-friendly design
- **Responsive Design**: Works on all device sizes
- **Social Sharing**: Share your startup idea directly on X (Twitter)
- **Rate Limiting**: Prevents abuse with a cooldown system

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/intro-to-vibe-code.git
cd intro-to-vibe-code
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment on Vercel

### Option 1: Deploy with Environment Variables

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Add your OpenAI API key as an environment variable in the Vercel dashboard:
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key
4. Deploy

### Option 2: Deploy without OpenAI API Key

The application will work without an OpenAI API key by using fallback startup ideas. This is useful for demo purposes or if you don't have an API key.

## Technologies Used

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui components
- OpenAI API (optional)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built by [Roshan](https://x.com/roshanchandna)
