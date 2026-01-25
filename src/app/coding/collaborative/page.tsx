import { CollaborativeCodeEditor } from '@/components/coding/CollaborativeCodeEditor'
import { CursorPresence } from './components/CursorPresence'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Code, MessageSquare } from 'lucide-react'

export default function CollaborativeCodingPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Collaborative Code Canvas
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Code with AI peers in real-time. See their cursors, compare approaches, and learn from different coding styles.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            Real-time Collaboration
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Code className="w-3 h-3" />
            Live Code Comparison
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            AI Peer Suggestions
          </Badge>
        </div>
      </div>

      {/* Main Collaborative Editor */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">JavaScript Challenge: Array Methods</h2>
            <Badge variant="outline">Beginner Level</Badge>
          </div>
          <p className="text-muted-foreground">
            Implement a function that filters and transforms an array of numbers. Your AI peers Sarah and Alex are working on this too!
          </p>
          
          <CollaborativeCodeEditor
            initialCode={`// Challenge: Filter even numbers and double them
// Input: [1, 2, 3, 4, 5, 6]
// Expected output: [4, 8, 12]

function processNumbers(numbers) {
  // Your code here
  
}

// Test your function
const input = [1, 2, 3, 4, 5, 6];
const result = processNumbers(input);
console.log(result); // Should output: [4, 8, 12]`}
            language="javascript"
            height="500px"
            enableCollaboration={true}
            challengeId="array-methods-1"
          />
        </div>
      </Card>

      {/* Cursor Presence Demo */}
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Live Cursor Presence</h2>
          <p className="text-muted-foreground">
            Watch how AI peers move their cursors and type in real-time during collaborative sessions.
          </p>
          <CursorPresence />
        </div>
      </Card>

      {/* Features Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-blue-500" />
          <h3 className="text-lg font-semibold mb-2">Real-time Cursors</h3>
          <p className="text-sm text-muted-foreground">
            See where your AI peers are working with live cursor positions and typing indicators.
          </p>
        </Card>
        
        <Card className="p-6 text-center">
          <Code className="w-12 h-12 mx-auto mb-4 text-green-500" />
          <h3 className="text-lg font-semibold mb-2">Code Comparison</h3>
          <p className="text-sm text-muted-foreground">
            Compare different approaches side-by-side and learn from various coding styles.
          </p>
        </Card>
        
        <Card className="p-6 text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-purple-500" />
          <h3 className="text-lg font-semibold mb-2">Smart Suggestions</h3>
          <p className="text-sm text-muted-foreground">
            Get contextual suggestions and spot potential bugs with AI peer feedback.
          </p>
        </Card>
      </div>
    </div>
  )
}