"use client"

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, FolderOpen, Building2 } from 'lucide-react'
import { Project, Industry } from '@/types'
import { cn } from '@/lib/utils'

interface ProjectSelectProps {
  value: string | undefined
  onChange: (value: string | undefined) => void
  projects: Project[]
  industries: Industry[]
  className?: string
}

export function ProjectSelect({ value, onChange, projects, industries, className }: ProjectSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const selectedProject = value ? projects.find(p => p.id === value) : null
  const selectedIndustry = selectedProject?.industryId 
    ? industries.find(i => i.id === selectedProject.industryId) 
    : null
  
  // 按行业分组项目
  const projectsByIndustry = projects.reduce((acc, project) => {
    const industryId = project.industryId || 'no-industry'
    if (!acc[industryId]) {
      acc[industryId] = []
    }
    acc[industryId].push(project)
    return acc
  }, {} as Record<string, Project[]>)
  
  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 border rounded-md bg-white hover:bg-gray-50 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedProject ? (
            <>
              <FolderOpen className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="truncate">{selectedProject.name}</span>
              {selectedIndustry && (
                <>
                  <span className="text-gray-400">•</span>
                  <Building2 
                    className="w-4 h-4 flex-shrink-0" 
                    style={{ color: selectedIndustry.color }}
                  />
                  <span 
                    className="text-sm truncate"
                    style={{ color: selectedIndustry.color }}
                  >
                    {selectedIndustry.name}
                  </span>
                </>
              )}
            </>
          ) : (
            <span className="text-gray-500">选择项目</span>
          )}
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 text-gray-400 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-64 overflow-y-auto">
          <button
            type="button"
            onClick={() => {
              onChange(undefined)
              setIsOpen(false)
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-50 text-gray-500"
          >
            无
          </button>
          
          {/* 无行业的项目 */}
          {projectsByIndustry['no-industry'] && (
            <div>
              <div className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50">
                未分类
              </div>
              {projectsByIndustry['no-industry'].map(project => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => {
                    onChange(project.id)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2",
                    value === project.id && "bg-blue-50"
                  )}
                >
                  <FolderOpen className="w-4 h-4 text-blue-600" />
                  <span>{project.name}</span>
                </button>
              ))}
            </div>
          )}
          
          {/* 按行业分组的项目 */}
          {industries.map(industry => {
            const industryProjects = projectsByIndustry[industry.id]
            if (!industryProjects || industryProjects.length === 0) return null
            
            return (
              <div key={industry.id}>
                <div 
                  className="px-3 py-1 text-xs font-medium bg-gray-50 flex items-center gap-2"
                  style={{ backgroundColor: `${industry.color}10`, color: industry.color }}
                >
                  <Building2 className="w-3 h-3" />
                  {industry.name}
                </div>
                {industryProjects.map(project => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => {
                      onChange(project.id)
                      setIsOpen(false)
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 pl-8",
                      value === project.id && "bg-blue-50"
                    )}
                  >
                    <FolderOpen className="w-4 h-4 text-blue-600" />
                    <span>{project.name}</span>
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}