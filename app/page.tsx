"use client"

import { useState } from "react"
import { LandingPage } from "@/components/landing-page"
import { Dashboard } from "@/components/dashboard"
import { CanvasWorkspace } from "@/components/canvas-workspace"
import { HandwritingGenerator } from "@/components/HandwritingGenerator"
import { ThemeProvider } from "@/components/theme-provider"

export default function App() {
  const [currentView, setCurrentView] = useState<"landing" | "dashboard" | "canvas" | "generator">("landing")
  const [user, setUser] = useState<any>(null)
  const [currentProject, setCurrentProject] = useState<any>(null)

  const handleCreateNew = () => {
    setCurrentProject({ id: Date.now(), name: "Untitled", created: new Date() })
    setCurrentView("canvas")
  }

  const handleEditProject = (project: any) => {
    setCurrentProject(project)
    setCurrentView("canvas")
  }

  const handleBackToDashboard = () => {
    setCurrentView("dashboard")
    setCurrentProject(null)
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="handwriting-theme">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {currentView === "landing" && <LandingPage />}
        {currentView === "dashboard" && (
          <Dashboard
            user={user}
            onCreateNew={handleCreateNew}
            onEditProject={handleEditProject}
            onLogout={() => {
              setUser(null)
              setCurrentView("landing")
            }}
            onOpenGenerator={() => setCurrentView("generator")}
          />
        )}
        {currentView === "canvas" && <CanvasWorkspace project={currentProject} onBack={handleBackToDashboard} />}
        {currentView === "generator" && (
          <div className="p-4">
            <div className="mb-4">
              <button
                onClick={() => setCurrentView("dashboard")}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                ← Back to Dashboard
              </button>
            </div>
            <HandwritingGenerator />
          </div>
        )}
      </div>
    </ThemeProvider>
  )
}
