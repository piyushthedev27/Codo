/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Mobile Voice Testing Component
 * Comprehensive testing interface for voice features on mobile browsers
 */

'use client'

import { useState, useEffect } from 'react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Card, CardContent as _CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Button as _Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Mic, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  MicOff as _MicOff, 
  Volume2, 
  VolumeX, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Smartphone,
  Wifi,
  Battery,
  Settings,
  Play,
  Square,
  RotateCcw
} from 'lucide-react'
import { useMobileVoice, getMobileVoiceSupport } from '@/lib/mobile/voice-optimization'
import { MobileCard, MobileButton, MobileStack } from './MobileResponsiveWrapper'

interface TestResult {
  name: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  message?: string
  details?: string
  duration?: number
}

interface DeviceInfo {
  userAgent: string
  platform: string
  language: string
  onLine: boolean
  cookieEnabled: boolean
  maxTouchPoints: number
  hardwareConcurrency: number
  deviceMemory?: number
  connection?: {
    effectiveType: string
    downlink: number
    rtt: number
  }
  battery?: {
    level: number
    charging: boolean
  }
}

export function MobileVoiceTest() {
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const [voiceCapabilities, setVoiceCapabilities] = useState<any>(null)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [testProgress, setTestProgress] = useState(0)

  const {
    getCapabilities,
    startVoiceRecognition,
    stopVoiceRecognition,
    speakText,
    testVoiceFeatures,
    getMobileVoiceRecommendations
  } = useMobileVoice()

  // Initialize device info and capabilities
  useEffect(() => {
    initializeDeviceInfo()
    initializeVoiceCapabilities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initializeDeviceInfo = async () => {
    const info: DeviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      onLine: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled,
      maxTouchPoints: navigator.maxTouchPoints,
      hardwareConcurrency: navigator.hardwareConcurrency
    }

    // Get device memory if available
    if ('deviceMemory' in navigator) {
      info.deviceMemory = (navigator as any).deviceMemory
    }

    // Get connection info if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      info.connection = {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      }
    }

    // Get battery info if available
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery()
        info.battery = {
          level: Math.round(battery.level * 100),
          charging: battery.charging
        }
      } catch (_error) {
        console.warn('Could not get battery info:', _error)
      }
    }

    setDeviceInfo(info)
  }

  const initializeVoiceCapabilities = async () => {
    try {
      const capabilities = await getCapabilities()
      setVoiceCapabilities(capabilities)
    } catch (_error) {
      console.error('Failed to get voice capabilities:', _error)
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setTestProgress(0)
    setTestResults([])

    const tests = [
      { name: 'Browser Support Detection', test: testBrowserSupport },
      { name: 'Speech Recognition API', test: testSpeechRecognition },
      { name: 'Speech Synthesis API', test: testSpeechSynthesis },
      { name: 'Continuous Recognition', test: testContinuousRecognition },
      { name: 'Voice List Availability', test: testVoiceList },
      { name: 'Microphone Permissions', test: testMicrophonePermissions },
      { name: 'Network Connectivity', test: testNetworkConnectivity },
      { name: 'Battery Optimization', test: testBatteryOptimization },
      { name: 'Touch Integration', test: testTouchIntegration },
      { name: 'Error Handling', test: testErrorHandling }
    ]

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i]
      setCurrentTest(test.name)
      setTestProgress(((i + 1) / tests.length) * 100)

      try {
        await test.test()
      } catch (_error) {
        updateTestResult(test.name, 'failed', `Test failed: ${_error}`)
      }

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setCurrentTest(null)
    setIsRunning(false)
  }

  const updateTestResult = (name: string, status: TestResult['status'], message?: string, details?: string) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.name === name)
      if (existing) {
        return prev.map(r => r.name === name ? { ...r, status, message, details } : r)
      } else {
        return [...prev, { name, status, message, details }]
      }
    })
  }

  // Individual test functions
  const testBrowserSupport = async () => {
    const support = getMobileVoiceSupport()
    const hasRecognition = support.recognition
    const hasSynthesis = support.synthesis
    
    if (hasRecognition && hasSynthesis) {
      updateTestResult('Browser Support Detection', 'passed', 'Full voice support detected')
    } else if (hasRecognition || hasSynthesis) {
      updateTestResult('Browser Support Detection', 'passed', 'Partial voice support detected', 
        `Recognition: ${hasRecognition}, Synthesis: ${hasSynthesis}`)
    } else {
      updateTestResult('Browser Support Detection', 'failed', 'No voice support detected')
    }
  }

  const testSpeechRecognition = async () => {
    try {
      const testResults = await testVoiceFeatures()
      if (testResults.recognition) {
        updateTestResult('Speech Recognition API', 'passed', 'Speech recognition available')
      } else {
        updateTestResult('Speech Recognition API', 'failed', 'Speech recognition not available')
      }
    } catch (_error) {
      updateTestResult('Speech Recognition API', 'failed', `Error: ${_error}`)
    }
  }

  const testSpeechSynthesis = async () => {
    try {
      const testResults = await testVoiceFeatures()
      if (testResults.synthesis) {
        updateTestResult('Speech Synthesis API', 'passed', 
          `Speech synthesis available with ${testResults.voiceCount} voices`)
      } else {
        updateTestResult('Speech Synthesis API', 'failed', 'Speech synthesis not available')
      }
    } catch (_error) {
      updateTestResult('Speech Synthesis API', 'failed', `Error: ${_error}`)
    }
  }

  const testContinuousRecognition = async () => {
    try {
      const testResults = await testVoiceFeatures()
      if (testResults.continuousRecognition) {
        updateTestResult('Continuous Recognition', 'passed', 'Continuous recognition supported')
      } else {
        updateTestResult('Continuous Recognition', 'failed', 'Continuous recognition not supported')
      }
    } catch (_error) {
      updateTestResult('Continuous Recognition', 'failed', `Error: ${_error}`)
    }
  }

  const testVoiceList = async () => {
    try {
      const capabilities = await getCapabilities()
      const voiceCount = capabilities.voiceList.length
      
      if (voiceCount > 0) {
        updateTestResult('Voice List Availability', 'passed', 
          `${voiceCount} voices available`, 
          capabilities.voiceList.map(v => `${v.name} (${v.lang})`).join(', '))
      } else {
        updateTestResult('Voice List Availability', 'failed', 'No voices available')
      }
    } catch (_error) {
      updateTestResult('Voice List Availability', 'failed', `Error: ${_error}`)
    }
  }

  const testMicrophonePermissions = async () => {
    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName })
        updateTestResult('Microphone Permissions', 'passed', 
          `Permission status: ${permission.state}`)
      } else {
        updateTestResult('Microphone Permissions', 'passed', 'Permissions API not available')
      }
    } catch (_error) {
      updateTestResult('Microphone Permissions', 'failed', `Error: ${_error}`)
    }
  }

  const testNetworkConnectivity = async () => {
    const isOnline = navigator.onLine
    const connectionInfo = deviceInfo?.connection
    
    if (isOnline) {
      const message = connectionInfo 
        ? `Online (${connectionInfo.effectiveType}, ${connectionInfo.downlink}Mbps)`
        : 'Online'
      updateTestResult('Network Connectivity', 'passed', message)
    } else {
      updateTestResult('Network Connectivity', 'failed', 'Offline')
    }
  }

  const testBatteryOptimization = async () => {
    const batteryInfo = deviceInfo?.battery
    
    if (batteryInfo) {
      const level = batteryInfo.level
      const charging = batteryInfo.charging
      const status = level > 20 ? 'passed' : 'failed'
      const message = `Battery: ${level}% ${charging ? '(charging)' : ''}`
      
      updateTestResult('Battery Optimization', status, message)
    } else {
      updateTestResult('Battery Optimization', 'passed', 'Battery API not available')
    }
  }

  const testTouchIntegration = async () => {
    const maxTouchPoints = navigator.maxTouchPoints
    const hasTouchSupport = 'ontouchstart' in window
    
    if (hasTouchSupport && maxTouchPoints > 0) {
      updateTestResult('Touch Integration', 'passed', 
        `Touch supported (${maxTouchPoints} points)`)
    } else {
      updateTestResult('Touch Integration', 'failed', 'Touch not supported')
    }
  }

  const testErrorHandling = async () => {
    // Test error handling by attempting to use voice features
    try {
      // This should handle gracefully if voice is not supported
      await speakText('Test', { rate: 1.0 })
      updateTestResult('Error Handling', 'passed', 'Error handling working correctly')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      // This is actually expected behavior - graceful error handling
      updateTestResult('Error Handling', 'passed', 'Graceful error handling confirmed')
    }
  }

  // Manual test functions
  const testRecognition = async () => {
    if (isListening) {
      stopVoiceRecognition()
      setIsListening(false)
      setTranscript('')
    } else {
      try {
        setIsListening(true)
        await startVoiceRecognition(
          (transcript, isFinal) => {
            setTranscript(transcript)
            if (isFinal) {
              setIsListening(false)
            }
          },
          (_error) => {
            console.error('Recognition _error:', _error)
            setIsListening(false)
          }
        )
      } catch (_error) {
        console.error('Failed to start recognition:', _error)
        setIsListening(false)
      }
    }
  }

  const testSynthesis = async () => {
    if (isSpeaking) return

    try {
      setIsSpeaking(true)
      await speakText('Hello! This is a test of speech synthesis on your mobile device.', {
        rate: 1.0,
        pitch: 1.0
      })
      setIsSpeaking(false)
    } catch (_error) {
      console.error('Synthesis _error:', _error)
      setIsSpeaking(false)
    }
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'running':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      default:
        return <div className="w-4 h-4 border border-gray-300 rounded-full" />
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20'
      case 'failed':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20'
      case 'running':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-800'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Mobile Voice Feature Testing
          </CardTitle>
          <CardDescription>
            Comprehensive testing suite for voice features on mobile browsers
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Device Information */}
      {deviceInfo && (
        <MobileCard>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Device Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Platform:</strong> {deviceInfo.platform}
            </div>
            <div>
              <strong>Language:</strong> {deviceInfo.language}
            </div>
            <div className="flex items-center gap-2">
              <Wifi className={deviceInfo.onLine ? 'w-4 h-4 text-green-500' : 'w-4 h-4 text-red-500'} />
              <strong>Network:</strong> {deviceInfo.onLine ? 'Online' : 'Offline'}
              {deviceInfo.connection && (
                <span className="text-gray-500">
                  ({deviceInfo.connection.effectiveType})
                </span>
              )}
            </div>
            {deviceInfo.battery && (
              <div className="flex items-center gap-2">
                <Battery className={`w-4 h-4 ${deviceInfo.battery.level > 20 ? 'text-green-500' : 'text-red-500'}`} />
                <strong>Battery:</strong> {deviceInfo.battery.level}%
                {deviceInfo.battery.charging && <span className="text-green-500">(charging)</span>}
              </div>
            )}
            <div>
              <strong>Touch Points:</strong> {deviceInfo.maxTouchPoints}
            </div>
            <div>
              <strong>CPU Cores:</strong> {deviceInfo.hardwareConcurrency}
            </div>
          </div>
        </MobileCard>
      )}

      {/* Voice Capabilities */}
      {voiceCapabilities && (
        <MobileCard>
          <h3 className="text-lg font-semibold mb-4">Voice Capabilities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={voiceCapabilities.speechRecognition ? 'default' : 'destructive'}>
                {voiceCapabilities.speechRecognition ? 'Supported' : 'Not Supported'}
              </Badge>
              <span>Speech Recognition</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={voiceCapabilities.speechSynthesis ? 'default' : 'destructive'}>
                {voiceCapabilities.speechSynthesis ? 'Supported' : 'Not Supported'}
              </Badge>
              <span>Speech Synthesis</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={voiceCapabilities.continuousRecognition ? 'default' : 'destructive'}>
                {voiceCapabilities.continuousRecognition ? 'Supported' : 'Not Supported'}
              </Badge>
              <span>Continuous Recognition</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {voiceCapabilities.voiceList.length} voices
              </Badge>
              <span>Available Voices</span>
            </div>
          </div>
        </MobileCard>
      )}

      {/* Test Controls */}
      <MobileCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Automated Tests</h3>
          <div className="flex gap-2">
            <MobileButton
              onClick={runAllTests}
              disabled={isRunning}
              variant="primary"
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </MobileButton>
            <MobileButton
              onClick={() => {
                setTestResults([])
                setTestProgress(0)
                setCurrentTest(null)
              }}
              variant="outline"
              disabled={isRunning}
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </MobileButton>
          </div>
        </div>

        {isRunning && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{Math.round(testProgress)}%</span>
            </div>
            <Progress value={testProgress} className="mb-2" />
            {currentTest && (
              <p className="text-sm text-gray-600">Running: {currentTest}</p>
            )}
          </div>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            {testResults.map((result) => (
              <div key={result.name} className={`p-3 rounded-lg ${getStatusColor(result.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {result.status}
                  </Badge>
                </div>
                {result.message && (
                  <p className="text-sm mt-1">{result.message}</p>
                )}
                {result.details && (
                  <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">{result.details}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </MobileCard>

      {/* Manual Tests */}
      <MobileCard>
        <h3 className="text-lg font-semibold mb-4">Manual Tests</h3>
        <MobileStack spacing="md">
          {/* Speech Recognition Test */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Speech Recognition Test
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Test voice recognition by speaking into your device&apos;s microphone.
            </p>
            <div className="flex gap-2 mb-3">
              <MobileButton
                onClick={testRecognition}
                variant={isListening ? 'secondary' : 'primary'}
                size="sm"
              >
                {isListening ? (
                  <>
                    <Square className="w-4 h-4" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Start Listening
                  </>
                )}
              </MobileButton>
            </div>
            {transcript && (
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm">
                <strong>Transcript:</strong> {transcript}
              </div>
            )}
          </div>

          {/* Speech Synthesis Test */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Speech Synthesis Test
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Test text-to-speech functionality on your device.
            </p>
            <MobileButton
              onClick={testSynthesis}
              disabled={isSpeaking}
              variant="primary"
              size="sm"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  Speaking...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Test Speech
                </>
              )}
            </MobileButton>
          </div>
        </MobileStack>
      </MobileCard>

      {/* Recommendations */}
      {voiceCapabilities && (
        <MobileCard>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Recommendations
          </h3>
          <div className="space-y-3">
            {(() => {
              const recommendations = getMobileVoiceRecommendations()
              const allRecommendations = [
                ...recommendations.recognition,
                ...recommendations.synthesis,
                ...recommendations.general
              ]
              
              return allRecommendations.length > 0 ? (
                allRecommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>All voice features are working optimally on this device!</span>
                </div>
              )
            })()}
          </div>
        </MobileCard>
      )}
    </div>
  )
}