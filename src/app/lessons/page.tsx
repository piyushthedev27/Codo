/**
 * Lessons Browse Page - Redesigned
 * Modern, user-friendly lesson discovery interface
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  BookOpen, Clock, Search, Play, Users, Sparkles, Award, Code, Zap,
  TrendingUp, CheckCircle2, Star, Filter, ArrowRight, Target, Brain
} from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'

interface Lesson {
  id: string
  title: string
  description: string
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string
  recommendedBy?: string
  xpReward: number
  enrolled?: number
  icon?: string
  progress?: number
  rating?: number
  sections?: number
}

const sampleLessons: Lesson[] = [
  {
    id: 'react-hooks-intro',
    title: 'Introduction to React Hooks',
    description: 'Learn the fundamentals of React Hooks including useState, useEffect, and custom hooks. Master modern React patterns.',
    duration: '2 hours',
    difficulty: 'intermediate',
    category: 'React',
    recommendedBy: 'sarah',
    xpReward: 150,
    enrolled: 1234,
    icon: '⚛️',
    progress: 33,
    rating: 4.8,
    sections: 3
  },
  {
    id: 'javascript-async',
    title: 'Mastering Async JavaScript',
    description: 'Deep dive into Promises, async/await, and handling asynchronous operations like a pro.',
    duration: '3 hours',
    difficulty: 'intermediate',
    category: 'JavaScript',
    recommendedBy: 'alex',
    xpReward: 200,
    enrolled: 2156,
    icon: '⚡',
    rating: 4.9,
    sections: 5
  },
  {
    id: 'typescript-basics',
    title: 'TypeScript Fundamentals',
    description: 'Get started with TypeScript: types, interfaces, generics, and type safety for robust applications.',
    duration: '2.5 hours',
    difficulty: 'beginner',
    category: 'TypeScript',
    recommendedBy: 'jordan',
    xpReward: 120,
    enrolled: 3421,
    icon: '📘',
    rating: 4.7,
    sections: 4
  },
  {
    id: 'react-state-management',
    title: 'React State Management',
    description: 'Learn Context API, Redux, Zustand, and modern state management patterns for scalable apps.',
    duration: '4 hours',
    difficulty: 'advanced',
    category: 'React',
    xpReward: 250,
    enrolled: 892,
    icon: '🎯',
    rating: 4.6,
    sections: 6
  },
  {
    id: 'css-grid-flexbox',
    title: 'CSS Grid & Flexbox Mastery',
    description: 'Master modern CSS layouts with Grid and Flexbox. Build responsive, beautiful interfaces.',
    duration: '2 hours',
    difficulty: 'beginner',
    category: 'CSS',
    recommendedBy: 'sarah',
    xpReward: 100,
    enrolled: 4532,
    icon: '🎨',
    progress: 100,
    rating: 4.9,
    sections: 3
  },
  {
    id: 'nodejs-apis',
    title: 'Building REST APIs with Node.js',
    description: 'Create scalable backend APIs using Node.js, Express, and best practices for production.',
    duration: '5 hours',
    difficulty: 'intermediate',
    category: 'Node.js',
    recommendedBy: 'jordan',
    xpReward: 300,
    enrolled: 1876,
    icon: '🚀',
    rating: 4.8,
    sections: 7
  },
  {
    id: 'nextjs-fullstack',
    title: 'Full-Stack Next.js Development',
    description: 'Build modern full-stack applications with Next.js 14+, Server Components, and App Router.',
    duration: '6 hours',
    difficulty: 'advanced',
    category: 'Next.js',
    recommendedBy: 'alex',
    xpReward: 350,
    enrolled: 1543,
    icon: '▲',
    rating: 4.9,
    sections: 8
  },
  {
    id: 'tailwind-design',
    title: 'Tailwind CSS Design System',
    description: 'Create beautiful, consistent UIs with Tailwind CSS. Learn utility-first design principles.',
    duration: '3 hours',
    difficulty: 'beginner',
    category: 'CSS',
    xpReward: 130,
    enrolled: 2987,
    icon: '🌊',
    rating: 4.7,
    sections: 4
  },
  {
    id: 'graphql-basics',
    title: 'GraphQL Fundamentals',
    description: 'Learn GraphQL queries, mutations, subscriptions, and build efficient APIs.',
    duration: '4 hours',
    difficulty: 'intermediate',
    category: 'GraphQL',
    recommendedBy: 'sarah',
    xpReward: 220,
    enrolled: 1234,
    icon: '◆',
    rating: 4.6,
    sections: 5
  }
]

export default function LessonsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'xp'>('popular')
  const [showFilters, setShowFilters] = useState(false)

  const categories = ['all', ...Array.from(new Set(sampleLessons.map(l => l.category)))]

  const filteredLessons = sampleLessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDifficulty = selectedDifficulty === 'all' || lesson.difficulty === selectedDifficulty
    const matchesCategory = selectedCategory === 'all' || lesson.category === selectedCategory
    return matchesSearch && matchesDifficulty && matchesCategory
  }).sort((a, b) => {
    if (sortBy === 'popular') return (b.enrolled || 0) - (a.enrolled || 0)
    if (sortBy === 'xp') return b.xpReward - a.xpReward
    return 0
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
      case 'intermediate': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
      case 'advanced': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20'
    }
  }

  const getCategoryGradient = (category: string) => {
    switch (category) {
      case 'React': return 'from-cyan-500 to-blue-500'
      case 'JavaScript': return 'from-yellow-500 to-orange-500'
      case 'TypeScript': return 'from-blue-500 to-indigo-500'
      case 'CSS': return 'from-pink-500 to-purple-500'
      case 'Node.js': return 'from-green-500 to-emerald-500'
      case 'Next.js': return 'from-gray-800 to-gray-600'
      case 'GraphQL': return 'from-pink-600 to-purple-600'
      default: return 'from-gray-500 to-slate-500'
    }
  }

  const totalLessons = sampleLessons.length
  const completedLessons = sampleLessons.filter(l => l.progress === 100).length
  const inProgressLessons = sampleLessons.filter(l => l.progress && l.progress > 0 && l.progress < 100).length
  const totalXP = sampleLessons.reduce((sum, l) => sum + l.xpReward, 0)

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 md:p-10 text-white shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-bold uppercase tracking-wider">Your Learning Journey</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
              Explore Lessons
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl mb-8 leading-relaxed">
              Master programming with AI-powered lessons, interactive challenges, and personalized guidance from your AI peers.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-black">{totalLessons}</div>
                </div>
                <div className="text-sm text-blue-100 font-medium">Total Lessons</div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div className="text-3xl font-black">{completedLessons}</div>
                </div>
                <div className="text-sm text-blue-100 font-medium">Completed</div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/30 flex items-center justify-center">
                    <Target className="w-5 h-5 text-amber-300" />
                  </div>
                  <div className="text-3xl font-black">{inProgressLessons}</div>
                </div>
                <div className="text-sm text-blue-100 font-medium">In Progress</div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/30 flex items-center justify-center">
                    <Award className="w-5 h-5 text-purple-300" />
                  </div>
                  <div className="text-3xl font-black">{totalXP}</div>
                </div>
                <div className="text-sm text-blue-100 font-medium">Total XP</div>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -ml-32 -mb-32" />
        </div>

        {/* Search and Filters */}
        <Card className="border-2 shadow-lg">
          <CardContent className="p-6">
            {/* Search Bar */}
            <div className="relative group mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10" />
              <Input
                placeholder="Search lessons by title, topic, or technology..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-base border-2 focus:border-blue-500 rounded-xl"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 md:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Filters Row */}
            <div className={`space-y-4 ${showFilters ? 'block' : 'hidden md:block'}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Difficulty Filter */}
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-3 block uppercase tracking-wider flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Difficulty Level
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {['all', 'beginner', 'intermediate', 'advanced'].map((level) => (
                      <Button
                        key={level}
                        size="sm"
                        variant={selectedDifficulty === level ? 'default' : 'outline'}
                        onClick={() => setSelectedDifficulty(level)}
                        className="capitalize rounded-lg font-semibold"
                      >
                        {level === 'all' ? 'All Levels' : level}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-3 block uppercase tracking-wider flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    Category
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {categories.slice(0, 5).map((cat) => (
                      <Button
                        key={cat}
                        size="sm"
                        variant={selectedCategory === cat ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory(cat)}
                        className="capitalize rounded-lg font-semibold"
                      >
                        {cat === 'all' ? 'All Topics' : cat}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-3 block uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Sort By
                  </label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={sortBy === 'popular' ? 'default' : 'outline'}
                      onClick={() => setSortBy('popular')}
                      className="rounded-lg font-semibold"
                    >
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Popular
                    </Button>
                    <Button
                      size="sm"
                      variant={sortBy === 'xp' ? 'default' : 'outline'}
                      onClick={() => setSortBy('xp')}
                      className="rounded-lg font-semibold"
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      XP
                    </Button>
                  </div>
                </div>
              </div>

              {/* Active Filters Summary */}
              {(searchQuery || selectedDifficulty !== 'all' || selectedCategory !== 'all') && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {filteredLessons.length} lesson{filteredLessons.length !== 1 ? 's' : ''} found
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedDifficulty('all')
                      setSelectedCategory('all')
                    }}
                    className="ml-auto text-blue-600 hover:text-blue-700"
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => (
            <Card
              key={lesson.id}
              className="group relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-blue-500/50"
            >
              {/* Gradient Accent */}
              <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${getCategoryGradient(lesson.category)}`} />

              {/* Progress Bar (if in progress) */}
              {lesson.progress && lesson.progress > 0 && lesson.progress < 100 && (
                <div className="absolute top-2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${lesson.progress}%` }}
                  />
                </div>
              )}

              {/* Completed Badge */}
              {lesson.progress === 100 && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-emerald-500 text-white border-0 shadow-lg">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                </div>
              )}

              {/* Icon Badge */}
              <div className="absolute top-4 right-4 w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center text-3xl border-2 border-gray-200 dark:border-gray-700 group-hover:scale-110 transition-transform duration-300">
                {lesson.icon}
              </div>

              <CardHeader className="pb-4 pt-6">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={`${getDifficultyColor(lesson.difficulty)} border font-bold px-3 py-1.5 text-xs uppercase tracking-wide`}>
                    {lesson.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-black group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                  {lesson.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                  {lesson.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Stats Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold">{lesson.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                    <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="font-black text-amber-600 dark:text-amber-400">+{lesson.xpReward} XP</span>
                  </div>
                </div>

                {/* Category & Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{lesson.category}</span>
                  </div>
                  {lesson.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-bold">{lesson.rating}</span>
                    </div>
                  )}
                </div>

                {/* Sections Count */}
                {lesson.sections && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="font-medium">{lesson.sections} sections</span>
                  </div>
                )}

                {/* Recommended By */}
                {lesson.recommendedBy && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-100 dark:border-blue-900/30">
                    <Avatar peerId={lesson.recommendedBy} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Recommended by</div>
                      <div className="text-sm font-black capitalize">{lesson.recommendedBy}</div>
                    </div>
                  </div>
                )}

                {/* Enrolled Count */}
                {lesson.enrolled && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Users className="w-3.5 h-3.5" />
                    <span className="font-semibold">{lesson.enrolled.toLocaleString()} students enrolled</span>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  className="w-full group/btn font-bold rounded-xl h-11"
                  onClick={() => window.location.href = `/lessons/${lesson.id}`}
                >
                  {lesson.progress && lesson.progress > 0 && lesson.progress < 100 ? (
                    <>
                      Continue Learning
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </>
                  ) : lesson.progress === 100 ? (
                    <>
                      Review Lesson
                      <CheckCircle2 className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Learning
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredLessons.length === 0 && (
          <Card className="p-16 border-dashed border-2">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-3xl font-black mb-3">
                No lessons found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg max-w-md mx-auto">
                Try adjusting your search or filters to find what you&apos;re looking for
              </p>
              <Button
                size="lg"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedDifficulty('all')
                  setSelectedCategory('all')
                }}
                className="font-bold"
              >
                Clear All Filters
              </Button>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
