"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  PenTool,
  Plus,
  Search,
  Settings,
  LogOut,
  FileText,
  Clock,
  Trash2,
  Edit2,
  Sparkles,
  ArrowRight,
  Menu,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth-context"
import { projectService } from "@/lib/firestore"

interface DashboardProps {
  user: any
  onCreateNew: () => void
  onEditProject: (project: any) => void
  onLogout: () => void
  onOpenGenerator: () => void
}

export function Dashboard({ user, onCreateNew, onEditProject, onLogout, onOpenGenerator }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [recentProjects, setRecentProjects] = useState<any[]>([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { logOut } = useAuth()

  useEffect(() => {
    const loadProjects = async () => {
      if (!user?.uid) return
      
      try {
        setLoading(true)
        const userProjects = await projectService.getUserProjects(user.uid)
        setProjects(userProjects || [])
        setRecentProjects(userProjects?.slice(0, 5) || [])
      } catch (error) {
        console.error("Error loading projects:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [user?.uid])

  const handleLogout = async () => {
    try {
      await logOut()
      onLogout()
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
            <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row absolute sm:relative top-16 sm:top-0 right-4 sm:right-0 bg-white dark:bg-gray-900 sm:bg-transparent p-4 sm:p-0 rounded-lg shadow-lg sm:shadow-none border sm:border-0`}>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full sm:w-auto">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
                  </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-2xl sm:text-4xl font-bold mb-2">
              Welcome back, {user?.displayName || "User"}!
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Create beautiful handwriting SVGs with our AI-powered editor
            </p>
          </motion.div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <PenTool className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                  New Project
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">
                  Start a new handwriting project from scratch
                </p>
                <Button onClick={onCreateNew} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Project
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-600" />
                  AI Generator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">
                  Generate handwriting SVGs using our AI model
                </p>
                <Button onClick={onOpenGenerator} variant="secondary" className="w-full">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Open Generator
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Projects Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
              <h2 className="text-xl sm:text-2xl font-bold">Your Projects</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                  type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
              />
          </div>
        </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-300">Loading projects...</p>
                    </div>
            ) : projects.length === 0 ? (
              <Card>
                <CardContent className="py-8 sm:py-12 text-center">
                  <PenTool className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">No projects yet</h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">
                    Create your first handwriting project to get started
                  </p>
                  <Button onClick={onCreateNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Project
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base sm:text-lg">{project.name}</CardTitle>
                            <Badge variant="secondary" className="text-xs">
                          {new Date(project.createdAt).toLocaleDateString()}
                            </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Last edited: {new Date(project.updatedAt).toLocaleDateString()}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs sm:text-sm"
                            onClick={() => onEditProject(project)}
                          >
                            <Edit2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs sm:text-sm"
                            onClick={() => {
                              // Delete project logic
                            }}
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
              ))}
            </div>
            )}
          </div>

          {/* Recent Activity */}
          {recentProjects.length > 0 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Recent Activity</h2>
            <Card>
                <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                    {recentProjects.map((project) => (
                      <div
                      key={project.id}
                        className="flex items-center justify-between py-2"
                    >
                        <div className="flex items-center space-x-3">
                          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        <div>
                            <p className="text-sm sm:text-base font-medium">{project.name}</p>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                              Last edited: {new Date(project.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditProject(project)}
                        >
                          <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
