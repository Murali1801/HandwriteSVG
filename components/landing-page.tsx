"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  PenTool,
  Sparkles,
  Download,
  Layers,
  ArrowRight,
  Star,
  Users,
  Zap,
  Menu,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { useState } from "react"

export function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const features = [
    {
      icon: PenTool,
      title: "Natural Drawing",
      description: "Draw naturally with mouse or touch, with smooth SVG path generation",
    },
    {
      icon: Sparkles,
      title: "AI-Powered",
      description: "Convert typed text to handwriting style with AI personalization",
    },
    {
      icon: Download,
      title: "Multiple Exports",
      description: "Export as SVG, PNG, PDF with customizable settings",
    },
    {
      icon: Layers,
      title: "Layer Management",
      description: "Organize your work with advanced layer controls",
    },
  ]

  const stats = [
    { icon: Users, value: "10K+", label: "Active Users" },
    { icon: Star, value: "4.9", label: "Rating" },
    { icon: Zap, value: "99.9%", label: "Uptime" },
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PenTool className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HandwriteSVG
            </span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="sm:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row absolute sm:relative top-16 sm:top-0 right-4 sm:right-0 bg-white dark:bg-gray-900 sm:bg-transparent p-4 sm:p-0 rounded-lg shadow-lg sm:shadow-none border sm:border-0 space-y-2 sm:space-y-0 sm:space-x-4`}>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="w-full sm:w-auto">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="w-full sm:w-auto">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-20">
        {/* Hero Section */}
        <section className="py-12 sm:py-20 px-4">
          <div className="container mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Handwriting
              </Badge>
              <h1 className="text-4xl sm:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Create Beautiful
                <br />
                Handwriting SVGs
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                Transform your handwriting into scalable vector graphics. Draw, edit, and export professional
                handwriting with our advanced SVG editor.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="text-lg px-8 w-full sm:w-auto">
                    Start Creating Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-lg px-8 w-full sm:w-auto">
                  Watch Demo
                </Button>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-8 mt-12 sm:mt-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center mb-4 sm:mb-0">
                  <div className="flex items-center justify-center mb-2">
                    <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2" />
                    <span className="text-2xl sm:text-3xl font-bold">{stat.value}</span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-20 px-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="container mx-auto">
            <div className="text-center mb-8 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Powerful Features</h2>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 px-4">
                Everything you need to create professional handwriting SVGs
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <feature.icon className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mb-4" />
                      <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
