"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react'

interface DecisionFormProps {
  onSubmit: (data: any) => void
  isLoading?: boolean
}

const defaultPriorities = [
  { name: 'Career Growth', weight: 8, description: 'Professional development opportunities' },
  { name: 'Work-Life Balance', weight: 7, description: 'Time for personal life and hobbies' },
  { name: 'Financial Stability', weight: 6, description: 'Income security and benefits' },
  { name: 'Personal Fulfillment', weight: 9, description: 'Sense of purpose and satisfaction' },
  { name: 'Learning Opportunity', weight: 7, description: 'Chance to acquire new skills' },
]

export function DecisionForm({ onSubmit, isLoading = false }: DecisionFormProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    context: '',
    options: ['', ''],
    priorities: defaultPriorities,
  })

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }

  const addOption = () => {
    if (formData.options.length < 5) {
      setFormData({ ...formData, options: [...formData.options, ''] })
    }
  }

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index)
      setFormData({ ...formData, options: newOptions })
    }
  }

  const updatePriorityWeight = (index: number, weight: number) => {
    const newPriorities = [...formData.priorities]
    newPriorities[index].weight = weight
    setFormData({ ...formData, priorities: newPriorities })
  }

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      options: formData.options.filter(opt => opt.trim() !== '')
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex justify-center mb-8">
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {stepNumber}
            </div>
            {stepNumber < 3 && (
              <div
                className={`w-16 h-1 mx-2 ${
                  step > stepNumber ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Decision Context */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>What decision are you facing?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Decision Title
                  </label>
                  <Input
                    placeholder="e.g., Career change, Relocation, Education path"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Context & Considerations
                  </label>
                  <Textarea
                    placeholder="Describe your current situation, constraints, and what matters most to you..."
                    rows={4}
                    value={formData.context}
                    onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setStep(2)} disabled={!formData.title.trim()}>
                    Next <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Options */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>What are your options?</CardTitle>
                <p className="text-sm text-muted-foreground">
                  List 2-5 options you're considering
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                    />
                    {formData.options.length > 2 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeOption(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {formData.options.length < 5 && (
                  <Button variant="outline" onClick={addOption}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </Button>
                )}
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back
                  </Button>
                  <Button 
                    onClick={() => setStep(3)}
                    disabled={formData.options.filter(opt => opt.trim()).length < 2}
                  >
                    Next <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Priorities */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>What matters most to you?</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Rate the importance of each priority (1-10)
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {formData.priorities.map((priority, index) => (
                  <div key={priority.name} className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{priority.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {priority.description}
                        </p>
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {priority.weight}
                      </div>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={priority.weight}
                      onChange={(e) => updatePriorityWeight(index, parseInt(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Less Important</span>
                      <span>More Important</span>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back
                  </Button>
                  <Button onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? 'Analyzing...' : 'Get AI Analysis'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}