"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useStore } from '@/lib/store'
import { v4 as uuidv4 } from 'uuid'
import { Industry } from '@/types'
import { 
  Building2, 
  Laptop, 
  Palette, 
  Stethoscope, 
  GraduationCap, 
  ShoppingCart, 
  Hammer, 
  Car, 
  Utensils, 
  Plane,
  Edit2,
  Trash2,
  Plus,
  ArrowLeft
} from 'lucide-react'

const industryIcons = {
  building2: <Building2 className="w-5 h-5" />,
  laptop: <Laptop className="w-5 h-5" />,
  palette: <Palette className="w-5 h-5" />,
  stethoscope: <Stethoscope className="w-5 h-5" />,
  graduationCap: <GraduationCap className="w-5 h-5" />,
  shoppingCart: <ShoppingCart className="w-5 h-5" />,
  hammer: <Hammer className="w-5 h-5" />,
  car: <Car className="w-5 h-5" />,
  utensils: <Utensils className="w-5 h-5" />,
  plane: <Plane className="w-5 h-5" />
}

const industryColors = [
  '#3B82F6', // 蓝色
  '#10B981', // 绿色
  '#F59E0B', // 黄色
  '#EF4444', // 红色
  '#8B5CF6', // 紫色
  '#06B6D4', // 青色
  '#F97316', // 橙色
  '#84CC16', // 柠檬绿
  '#EC4899', // 粉色
  '#6B7280'  // 灰色
]

interface IndustryManagerProps {
  onBack?: () => void
}

export function IndustryManager({ onBack }: IndustryManagerProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null)
  const [newIndustry, setNewIndustry] = useState({
    name: '',
    description: '',
    color: industryColors[0],
    icon: 'building2'
  })
  
  const industries = useStore((state) => state.industries)
  const projects = useStore((state) => state.projects)
  const addIndustry = useStore((state) => state.addIndustry)
  const updateIndustry = useStore((state) => state.updateIndustry)
  const deleteIndustry = useStore((state) => state.deleteIndustry)
  
  const handleCreateIndustry = () => {
    if (!newIndustry.name.trim()) return
    
    const industry: Industry = {
      id: uuidv4(),
      name: newIndustry.name,
      description: newIndustry.description,
      color: newIndustry.color,
      icon: newIndustry.icon,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    if (editingIndustry) {
      updateIndustry(editingIndustry.id, {
        ...industry,
        id: editingIndustry.id,
        createdAt: editingIndustry.createdAt
      })
      setEditingIndustry(null)
    } else {
      addIndustry(industry)
    }
    
    setNewIndustry({ name: '', description: '', color: industryColors[0], icon: 'building2' })
    setIsCreating(false)
  }
  
  const startEditIndustry = (industry: Industry) => {
    setEditingIndustry(industry)
    setNewIndustry({
      name: industry.name,
      description: industry.description || '',
      color: industry.color,
      icon: industry.icon
    })
    setIsCreating(true)
  }
  
  const getProjectCount = (industryId: string) => {
    return projects.filter(p => p.industryId === industryId).length
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              返回
            </Button>
          )}
          <h2 className="text-xl font-semibold">行业管理</h2>
        </div>
        <Button onClick={() => {
          setIsCreating(!isCreating)
          if (!isCreating) {
            setEditingIndustry(null)
            setNewIndustry({ name: '', description: '', color: industryColors[0], icon: 'building2' })
          }
        }}>
          {isCreating ? '取消' : '新建行业'}
        </Button>
      </div>
      
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingIndustry ? '编辑行业' : '新建行业'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">行业名称</label>
              <Input
                placeholder="如：科技互联网、教育培训等"
                value={newIndustry.name}
                onChange={(e) => setNewIndustry({ ...newIndustry, name: e.target.value })}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">行业描述</label>
              <textarea
                placeholder="描述这个行业的特点..."
                value={newIndustry.description}
                onChange={(e) => setNewIndustry({ ...newIndustry, description: e.target.value })}
                className="mt-1 w-full min-h-[80px] p-2 border rounded-md text-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">主题色</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {industryColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewIndustry({ ...newIndustry, color })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newIndustry.color === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">行业图标</label>
                <div className="mt-1 grid grid-cols-5 gap-2">
                  {Object.entries(industryIcons).map(([key, icon]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setNewIndustry({ ...newIndustry, icon: key })}
                      className={`p-2 rounded border ${
                        newIndustry.icon === key ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <Button onClick={handleCreateIndustry} className="w-full">
              {editingIndustry ? '保存修改' : '创建行业'}
            </Button>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {industries.map((industry) => (
          <Card key={industry.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: industry.color + '20', color: industry.color }}
                  >
                    {industryIcons[industry.icon as keyof typeof industryIcons]}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{industry.name}</CardTitle>
                    <CardDescription className="mt-1">{industry.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <span>关联项目：{getProjectCount(industry.id)} 个</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEditIndustry(industry)}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  编辑
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteIndustry(industry.id)}
                  className="text-destructive hover:text-destructive"
                  disabled={getProjectCount(industry.id) > 0}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  删除
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {industries.length === 0 && !isCreating && (
        <div className="text-center py-8">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">暂无行业分类</p>
          <p className="text-sm text-muted-foreground mt-1">
            创建行业分类来更好地组织你的项目
          </p>
        </div>
      )}
    </div>
  )
}