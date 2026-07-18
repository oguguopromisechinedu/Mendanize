import "./load-env";
import { getPrisma } from '../lib/db/prisma'

const prisma = getPrisma()

async function seed() {
  console.log('[Seed] Starting database seed...')

  // Get or create an admin user for posts
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@mendanize.com' },
    update: {},
    create: {
      name: 'Mendanize Admin',
      email: 'admin@mendanize.com',
      role: 'ADMIN',
      profile: {
        create: {
          bio: 'AI and education platform founder',
        },
      },
    },
  })
  console.log('✓ Admin user created/updated:', adminUser.id)

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'ai-fundamentals' },
      update: {},
      create: {
        name: 'AI Fundamentals',
        slug: 'ai-fundamentals',
        description: 'Learn the basics of artificial intelligence and machine learning',
        icon: '🤖',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'content-creation' },
      update: {},
      create: {
        name: 'Content Creation',
        slug: 'content-creation',
        description: 'Using AI to streamline content production',
        icon: '✍️',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'business-insights' },
      update: {},
      create: {
        name: 'Business Insights',
        slug: 'business-insights',
        description: 'AI applications in modern business',
        icon: '💼',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'tutorials' },
      update: {},
      create: {
        name: 'Tutorials',
        slug: 'tutorials',
        description: 'Step-by-step guides for AI tools',
        icon: '📚',
      },
    }),
  ])
  console.log('✓ Created', categories.length, 'categories')

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: 'openai' },
      update: {},
      create: { name: 'OpenAI', slug: 'openai' },
    }),
    prisma.tag.upsert({
      where: { slug: 'chatgpt' },
      update: {},
      create: { name: 'ChatGPT', slug: 'chatgpt' },
    }),
    prisma.tag.upsert({
      where: { slug: 'machine-learning' },
      update: {},
      create: { name: 'Machine Learning', slug: 'machine-learning' },
    }),
    prisma.tag.upsert({
      where: { slug: 'productivity' },
      update: {},
      create: { name: 'Productivity', slug: 'productivity' },
    }),
    prisma.tag.upsert({
      where: { slug: 'automation' },
      update: {},
      create: { name: 'Automation', slug: 'automation' },
    }),
    prisma.tag.upsert({
      where: { slug: 'writing' },
      update: {},
      create: { name: 'Writing', slug: 'writing' },
    }),
  ])
  console.log('✓ Created', tags.length, 'tags')

  // Create sample posts
  const samplePosts = [
    {
      title: 'Getting Started with AI: A Beginner\'s Guide',
      slug: 'getting-started-with-ai-beginners-guide',
      excerpt: 'Learn the fundamentals of artificial intelligence and how it\'s transforming the world.',
      content: `# Getting Started with AI: A Beginner's Guide

Artificial Intelligence (AI) has become one of the most transformative technologies of our time. Whether you're curious about how it works or looking to leverage AI in your business, this guide will help you understand the basics.

## What is Artificial Intelligence?

AI refers to computer systems designed to perform tasks that typically require human intelligence. These tasks include:
- Learning from experience
- Recognizing patterns
- Understanding language
- Making decisions
- Solving problems

## Types of AI

### Narrow AI (Weak AI)
Most current AI systems are narrow AI, designed to excel at specific tasks like:
- Image recognition
- Natural language processing
- Playing chess or Go
- Recommendation systems

### General AI (Strong AI)
This is the theoretical AI that could understand and learn any intellectual task a human can. It doesn't exist yet but remains a goal for researchers.

## How AI Works

AI systems learn through training on large datasets. The process typically involves:
1. **Data Collection** - Gathering relevant training data
2. **Feature Engineering** - Identifying important patterns
3. **Model Training** - Teaching the AI to recognize these patterns
4. **Testing & Validation** - Verifying accuracy and performance
5. **Deployment** - Using the trained model in real-world applications

## Common AI Applications Today

- **Virtual Assistants** - Siri, Alexa, Google Assistant
- **Recommendation Systems** - Netflix, Spotify, Amazon
- **Computer Vision** - Facial recognition, medical imaging
- **Natural Language Processing** - Translation, chatbots
- **Autonomous Systems** - Self-driving cars, robots

## Getting Started with AI Tools

For beginners, there are several accessible tools:
- **ChatGPT** - Practice conversational AI
- **Google Colab** - Free Jupyter notebooks for experiments
- **Hugging Face** - Pre-built AI models
- **TensorFlow & PyTorch** - Open-source ML frameworks

## Conclusion

AI is not as mysterious as it might seem. By understanding these fundamentals, you're ready to explore more advanced topics or use AI tools in your daily work.`,
      categoryId: categories[0].id,
      authorId: adminUser.id,
      status: 'PUBLISHED' as const,
      publishedAt: new Date('2026-06-25'),
      seoTitle: 'Beginner\'s Guide to Artificial Intelligence',
      seoDescription: 'Learn the fundamentals of AI, how it works, and real-world applications.',
      seoKeywords: 'AI, artificial intelligence, machine learning, beginner guide',
      tagSlugs: ['machine-learning'],
    },
    {
      title: 'How to Use AI to 10x Your Content Production',
      slug: 'how-to-use-ai-10x-content-production',
      excerpt: 'Discover practical strategies for using AI to dramatically increase your content output without sacrificing quality.',
      content: `# How to Use AI to 10x Your Content Production

Content creators face a constant challenge: producing high-quality content consistently takes time. AI offers a solution that can dramatically increase your output.

## The Content Creation Challenge

Traditional content creation is slow:
- Research takes hours
- Writing takes days
- Editing takes even more time
- Scaling becomes impossible without a large team

## AI-Powered Solutions

### 1. Idea Generation with AI

Use AI to brainstorm content ideas based on:
- Trending topics in your industry
- Competitor content analysis
- Audience interests and pain points
- Seasonal opportunities

**Tool**: ChatGPT, Claude AI

### 2. Research Acceleration

AI can summarize articles, research papers, and datasets in seconds.

### 3. Drafting and Outlining

AI can generate first drafts, article outlines, and structure for different content types:
- Blog posts
- Social media threads
- Email campaigns
- Video scripts

### 4. Content Repurposing

One piece of content can become:
- Blog post → Social posts
- Article → Video script
- Podcast → Transcribed article
- All of the above

### 5. Editing and Optimization

AI tools can:
- Check grammar and style
- Optimize for SEO
- Adjust tone and formality
- Improve readability

## Workflow: From Idea to Publication in Hours

1. **Generate idea** (5 min with AI)
2. **Create outline** (10 min with AI assistance)
3. **Draft content** (20 min with AI + human review)
4. **Edit and optimize** (15 min with AI tools)
5. **Format and publish** (10 min manual work)

**Total: ~1 hour vs 8+ hours traditionally**

## Quality Control

Remember: AI is a tool, not a replacement. Always:
- Review AI-generated content for accuracy
- Add personal expertise and insights
- Maintain your unique voice
- Verify facts and statistics

## Tools Worth Considering

- **ChatGPT Plus** - Content generation and brainstorming
- **Claude** - Long-form writing and analysis
- **Jasper** - Content marketing specifically
- **Copy.ai** - Marketing copy
- **Grammarly** - Editing and optimization

## Realistic Expectations

You won't get 10x output by pressing a button. But with proper workflow optimization:
- 2-3x output increase is realistic immediately
- 5-10x with template systems and processes
- Quality stays high when you maintain oversight

## Conclusion

AI is transforming content creation. The winners won't be those who use AI to replace human creativity, but those who use it to amplify their impact and reach.`,
      categoryId: categories[1].id,
      authorId: adminUser.id,
      status: 'PUBLISHED' as const,
      publishedAt: new Date('2026-06-20'),
      seoTitle: '10x Your Content Production with AI Tools',
      seoDescription: 'Learn proven strategies for using AI to dramatically scale your content creation.',
      seoKeywords: 'content marketing, AI, productivity, automation',
      tagSlugs: ['openai', 'productivity', 'writing'],
    },
    {
      title: 'The Business Case for AI Investment in 2026',
      slug: 'business-case-for-ai-investment-2026',
      excerpt: 'Why forward-thinking companies are investing heavily in AI capabilities right now.',
      content: `# The Business Case for AI Investment in 2026

The question is no longer whether AI is important—it's whether your company will fall behind competitors who are already leveraging it.

## Market Reality

- 72% of executives believe AI is critical to their business
- Companies with AI report 40% faster task completion
- Early AI adopters see 3-5x ROI within 2 years
- Delayed adoption costs companies millions in lost efficiency

## Where AI Delivers Immediate ROI

### Customer Service
- 24/7 automated support
- 70% faster resolution times
- Reduced support staff costs
- Better customer satisfaction

### Sales & Marketing
- Lead scoring and prioritization
- Personalized customer experiences
- Predictive sales analytics
- Content generation at scale

### Operations
- Supply chain optimization
- Predictive maintenance
- Inventory management
- Cost reduction

### Finance & Accounting
- Automated expense processing
- Fraud detection
- Financial forecasting
- Compliance automation

## Investment Strategies

### Phase 1: Quick Wins (Months 1-3)
- Implement existing AI solutions
- Focus on high-impact, low-cost areas
- Train teams on new tools
- Expected ROI: 100-200%

### Phase 2: Integration (Months 4-9)
- Custom AI solutions for unique needs
- Data infrastructure improvements
- Cross-department implementation
- Expected ROI: 200-400%

### Phase 3: Transformation (Months 10+)
- New business models enabled by AI
- Competitive advantages
- Market leadership position
- Expected ROI: 400%+

## Real Numbers

A typical mid-market company implementing AI customer service:
- **Investment**: $150,000 year 1
- **Savings**: $500,000+ annually
- **Payback period**: 3-4 months
- **Year 2+ savings**: $400,000+

## The Cost of Waiting

Every month you delay:
- Competitors gain competitive advantage
- Employee talent leaves for AI-forward companies
- Customer expectations increase
- Implementation becomes more complex

## Getting Started

1. **Audit current processes** - Where is manual work draining resources?
2. **Identify quick wins** - Start with 2-3 high-impact areas
3. **Pilot programs** - Test before large-scale rollout
4. **Build internal expertise** - Invest in training and hiring
5. **Measure and optimize** - Track ROI, refine continuously

## Conclusion

The AI investment question for executives in 2026 is not if, but how fast can we move.`,
      categoryId: categories[2].id,
      authorId: adminUser.id,
      status: 'PUBLISHED' as const,
      publishedAt: new Date('2026-06-15'),
      seoTitle: 'Why Businesses Must Invest in AI in 2026',
      seoDescription: 'Business case for AI adoption with ROI metrics and implementation strategies.',
      seoKeywords: 'business, AI, ROI, digital transformation, enterprise',
      tagSlugs: ['automation'],
    },
    {
      title: 'ChatGPT Prompting 101: Getting Better Results',
      slug: 'chatgpt-prompting-101-better-results',
      excerpt: 'Master the art of prompting to get exceptional results from ChatGPT.',
      content: `# ChatGPT Prompting 101: Getting Better Results

The difference between good and great ChatGPT results often comes down to how you ask the question.

## The Anatomy of a Good Prompt

### 1. Be Specific
❌ Bad: "Write about AI"
✓ Good: "Write a 500-word beginner's guide to machine learning for business executives"

### 2. Provide Context
❌ Bad: "How should I market my product?"
✓ Good: "I have a SaaS tool for project management targeting small agencies. Our main competitors are Asana and Monday. How should I differentiate our marketing?"

### 3. Set Expectations
❌ Bad: "Write a blog post"
✓ Good: "Write a 1000-word blog post with an engaging headline, introduction, 3 main sections with subheadings, and a conclusion for a general audience"

### 4. Define Format
❌ Bad: "Give me tips"
✓ Good: "Give me 5 actionable tips in bullet point format with 1-2 sentence explanations each"

## Advanced Prompting Techniques

### Chain of Thought
Ask ChatGPT to explain its reasoning:
"Analyze this customer feedback and identify the top 3 issues. For each, explain your reasoning."

### Role-Playing
Give ChatGPT a role:
"You are an experienced marketing consultant. How would you help a startup with limited budget..."

### Iterative Refinement
Don't settle on the first response:
1. Get initial response
2. Ask follow-up questions
3. Request modifications
4. Refine further

### Prompt Templates

Template for content creation:
"Write a [TYPE] about [TOPIC] for [AUDIENCE]. The tone should be [TONE]. Include [KEY POINTS]. Format as [FORMAT]."

Template for analysis:
"Analyze the following [CONTENT]. Focus on [SPECIFIC ASPECTS]. Provide [REQUESTED OUTPUT]. Explain your reasoning."

## Common Mistakes to Avoid

1. **Vague requests** - ChatGPT can't read your mind
2. **Contradictory instructions** - Be clear and consistent
3. **Impossible constraints** - 5000 words in 100 words = confusion
4. **No feedback** - Tell it when it's wrong so it can improve
5. **Not iterating** - First draft is rarely perfect

## Pro Tips

- **Use examples** - Show ChatGPT what good looks like
- **Break down complexity** - Handle one problem at a time
- **Request refinements** - "Make it shorter/longer/simpler"
- **Ask why** - "Why did you choose this approach?"
- **Leverage personas** - Different roles produce different outputs

## Real Example Prompt

"You are a growth marketing expert for a B2B SaaS company. I need help writing an email campaign to reach inactive users and re-engage them.

The company is a project management tool with features for remote teams. The inactive users haven't logged in for 60+ days.

Create 3 email subject lines that:
- Create curiosity without being clickbait
- Highlight new features that solve collaboration problems
- Are appropriate for a professional context
- Are under 50 characters

For each subject line, explain why it works."

## Conclusion

Great prompting is a skill that improves with practice. Start with clear, specific requests, iterate based on results, and you'll quickly become an expert in getting the most from AI.`,
      categoryId: categories[3].id,
      authorId: adminUser.id,
      status: 'PUBLISHED' as const,
      publishedAt: new Date('2026-06-10'),
      seoTitle: 'ChatGPT Prompting Guide: Master AI Interactions',
      seoDescription: 'Learn prompting techniques to get better results from ChatGPT and AI tools.',
      seoKeywords: 'ChatGPT, prompting, AI, tips, tutorial',
      tagSlugs: ['chatgpt', 'openai', 'tutorial'],
    },
  ]

  // Create posts with tags
  for (const postData of samplePosts) {
    const { tagSlugs, ...postInfo } = postData
    
    const post = await prisma.post.upsert({
      where: { slug: postInfo.slug },
      update: postInfo,
      create: postInfo,
    })

    // Add tags
    for (const tagSlug of tagSlugs) {
      const tag = tags.find(t => t.slug === tagSlug)
      if (tag) {
        await prisma.postTag.upsert({
          where: { postId_tagId: { postId: post.id, tagId: tag.id } },
          update: {},
          create: { postId: post.id, tagId: tag.id },
        })
      }
    }

    console.log('✓ Created post:', post.slug)
  }

  // Create sample subscribers
  const subscribers = await Promise.all([
    prisma.subscriber.upsert({
      where: { email: 'subscriber1@example.com' },
      update: {},
      create: {
        email: 'subscriber1@example.com',
        name: 'John Doe',
        status: 'active',
        categories: ['ai-fundamentals', 'tutorials'],
      },
    }),
    prisma.subscriber.upsert({
      where: { email: 'subscriber2@example.com' },
      update: {},
      create: {
        email: 'subscriber2@example.com',
        name: 'Jane Smith',
        status: 'active',
        categories: ['content-creation', 'business-insights'],
      },
    }),
  ])
  console.log('✓ Created', subscribers.length, 'subscribers')

  const stats = await prisma.post.aggregate({
    _count: true,
    _sum: { viewCount: true },
  })

  console.log('\n[Seed] Database seeded successfully!')
  console.log(`Total posts: ${stats._count}`)
  console.log(`Total categories: ${categories.length}`)
  console.log(`Total tags: ${tags.length}`)
  console.log(`Total subscribers: ${subscribers.length}`)
}

seed()
  .then(() => {
    console.log('\n✓ Seed completed')
    process.exit(0)
  })
  .catch(e => {
    console.error('\n✗ Seed failed:', e)
    process.exit(1)
  })
