'use client'

import { useState } from 'react'
import { AnalysisResult } from '@/types'
import { AlertTriangle, Code, TestTube, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface AnalysisResultsProps {
  results: AnalysisResult
}

export function AnalysisResults({ results }: AnalysisResultsProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['rootCause']))
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set())

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItems(prev => new Set(prev).add(id))
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
      }, 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400'
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 space-y-4">
      <div className="flex items-center justify-between border-b dark:border-gray-700 pb-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Analysis Results
        </h2>
        <div className={`text-sm font-medium ${getConfidenceColor(results.confidence)}`}>
          {Math.round(results.confidence * 100)}% confidence
        </div>
      </div>

      {/* Root Cause */}
      <div className="space-y-2">
        <button
          onClick={() => toggleSection('rootCause')}
          className="flex items-center gap-2 w-full text-left"
        >
          {expandedSections.has('rootCause') ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span className="font-medium">Root Cause</span>
        </button>
        
        {expandedSections.has('rootCause') && (
          <div className="ml-6 p-3 bg-red-50 dark:bg-red-900/20 rounded border-l-4 border-red-500">
            <p className="text-gray-700 dark:text-gray-300">{results.rootCause}</p>
            {results.affectedComponents.length > 0 && (
              <div className="mt-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Affected Components:
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {results.affectedComponents.map((component, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded"
                    >
                      {component}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Suggested Fixes */}
      <div className="space-y-2">
        <button
          onClick={() => toggleSection('fixes')}
          className="flex items-center gap-2 w-full text-left"
        >
          {expandedSections.has('fixes') ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <Code className="w-4 h-4 text-blue-500" />
          <span className="font-medium">Suggested Fixes ({results.suggestedFixes.length})</span>
        </button>
        
        {expandedSections.has('fixes') && (
          <div className="ml-6 space-y-3">
            {results.suggestedFixes.map((fix) => (
              <div key={fix.id} className="border dark:border-gray-700 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {fix.description}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(fix.priority)}`}>
                        {fix.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {fix.explanation}
                    </p>
                    {fix.filePath && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        File: {fix.filePath}
                      </p>
                    )}
                  </div>
                  {fix.code && (
                    <button
                      onClick={() => copyToClipboard(fix.code!, `fix-${fix.id}`)}
                      className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {copiedItems.has(`fix-${fix.id}`) ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
                
                {fix.code && (
                  <div className="mt-2">
                    <SyntaxHighlighter
                      language="typescript"
                      style={tomorrow}
                      className="text-xs rounded"
                    >
                      {fix.code}
                    </SyntaxHighlighter>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unit Tests */}
      {results.unitTests.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => toggleSection('tests')}
            className="flex items-center gap-2 w-full text-left"
          >
            {expandedSections.has('tests') ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <TestTube className="w-4 h-4 text-green-500" />
            <span className="font-medium">Unit Tests ({results.unitTests.length})</span>
          </button>
          
          {expandedSections.has('tests') && (
            <div className="ml-6 space-y-3">
              {results.unitTests.map((test) => (
                <div key={test.id} className="border dark:border-gray-700 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {test.description}
                        </span>
                        <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded">
                          {test.framework}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        File: {test.filePath}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(test.code, `test-${test.id}`)}
                      className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {copiedItems.has(`test-${test.id}`) ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  
                  <div className="mt-2">
                    <SyntaxHighlighter
                      language="typescript"
                      style={tomorrow}
                      className="text-xs rounded"
                    >
                      {test.code}
                    </SyntaxHighlighter>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reasoning */}
      <div className="space-y-2">
        <button
          onClick={() => toggleSection('reasoning')}
          className="flex items-center gap-2 w-full text-left"
        >
          {expandedSections.has('reasoning') ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <span className="font-medium">Analysis Reasoning</span>
        </button>
        
        {expandedSections.has('reasoning') && (
          <div className="ml-6 p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {results.reasoning}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
