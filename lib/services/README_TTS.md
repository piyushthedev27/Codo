# Text-to-Speech Service

The TTS service provides text-to-speech conversion with automatic caching for the CODO platform.

## Features

- **OpenAI TTS Integration**: Uses OpenAI's TTS API for high-quality audio generation
- **Automatic Caching**: 7-day cache TTL to reduce API costs and improve performance
- **Multiple Voices**: Support for all OpenAI TTS voices (alloy, echo, fable, onyx, nova, shimmer)
- **Quality Options**: Support for both standard (tts-1) and HD (tts-1-hd) models
- **Cinema Integration**: Convenience method for converting cinema narration to speech

## Usage

### Basic Text-to-Speech

```typescript
import { textToSpeech } from '@/lib/services/ttsService';

const result = await textToSpeech({
    text: 'Hello, world!',
    voice: 'alloy',  // optional, defaults to 'alloy'
    model: 'tts-1'   // optional, defaults to 'tts-1'
});

// result.audio is a Buffer containing the MP3 audio
// result.cached indicates if the audio was served from cache
// result.contentType is 'audio/mpeg'
```

### Cinema Narration

```typescript
import { cinemaToSpeech } from '@/lib/services/ttsService';

const result = await cinemaToSpeech(
    'Welcome to this code explanation!',
    'nova'  // optional voice
);
```

### Cache Management

```typescript
import { 
    invalidateTTSCache, 
    clearTTSCache, 
    getTTSCacheStats 
} from '@/lib/services/ttsService';

// Invalidate specific text
invalidateTTSCache('Hello, world!', 'alloy', 'tts-1');

// Clear all cached audio
clearTTSCache();

// Get cache statistics
const stats = getTTSCacheStats();
console.log(`Cache size: ${stats.size} entries`);
console.log(`Total bytes: ${stats.totalBytes}`);
```

## API Route

The TTS service is exposed via the `/api/cinema/tts` endpoint:

```typescript
POST /api/cinema/tts
Authorization: Bearer <firebase-id-token>
Content-Type: application/json

{
    "text": "Hello, world!",
    "voice": "alloy",  // optional
    "model": "tts-1"   // optional
}

Response:
- Status: 200
- Content-Type: audio/mpeg
- Headers:
  - X-Cache-Status: HIT or MISS
  - Content-Length: <audio-size>
- Body: MP3 audio data
```

## Configuration

Set the `OPENAI_API_KEY` environment variable:

```bash
OPENAI_API_KEY=sk-...
```

## Caching Strategy

- **Cache Key**: Generated from normalized text + voice + model
- **TTL**: 7 days (same as cinema scripts)
- **Cleanup**: Automatic cleanup runs every 24 hours
- **Normalization**: Text is normalized (lowercase, trimmed, spaces collapsed) for cache key generation

## Limitations

- Maximum text length: 4096 characters (OpenAI limit)
- Supported voices: alloy, echo, fable, onyx, nova, shimmer
- Supported models: tts-1 (standard), tts-1-hd (high definition)

## Cost Optimization

- Use `tts-1` model for cinema (standard quality) to reduce costs
- Cache automatically prevents regenerating audio for the same text
- 7-day TTL balances cost savings with storage requirements

## Testing

The service includes comprehensive unit tests:

```bash
npm test -- __tests__/services/ttsService.test.ts
```

API route tests:

```bash
npm test -- __tests__/api/cinema/tts.test.ts
```
