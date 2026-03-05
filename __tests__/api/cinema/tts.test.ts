import { POST } from '@/app/api/cinema/tts/route';
import { adminAuth } from '@/lib/firebase/admin';
import { textToSpeech, clearTTSCache, resetOpenAIClient, stopCleanupInterval } from '@/lib/services/ttsService';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/lib/firebase/admin');
jest.mock('@/lib/services/ttsService');

describe('POST /api/cinema/tts', () => {
    const mockVerifyIdToken = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (adminAuth as jest.Mock).mockReturnValue({
            verifyIdToken: mockVerifyIdToken
        });
    });

    afterAll(() => {
        // Ensure cleanup interval is stopped
        if (stopCleanupInterval) {
            (stopCleanupInterval as jest.Mock).mockImplementation(() => {});
        }
    });

    it('should return 401 if no authorization header', async () => {
        const req = new NextRequest('http://localhost:3000/api/cinema/tts', {
            method: 'POST',
            body: JSON.stringify({ text: 'Hello' })
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toContain('Unauthorized');
    });

    it('should return 401 if authorization header is invalid', async () => {
        const req = new NextRequest('http://localhost:3000/api/cinema/tts', {
            method: 'POST',
            headers: {
                'Authorization': 'InvalidToken'
            },
            body: JSON.stringify({ text: 'Hello' })
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toContain('Unauthorized');
    });

    it('should return 400 if text is missing', async () => {
        mockVerifyIdToken.mockResolvedValue({ uid: 'test-user' });

        const req = new NextRequest('http://localhost:3000/api/cinema/tts', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer valid-token'
            },
            body: JSON.stringify({})
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('text');
    });

    it('should generate audio successfully', async () => {
        mockVerifyIdToken.mockResolvedValue({ uid: 'test-user' });
        
        const mockAudioBuffer = Buffer.from('mock-audio-data');
        (textToSpeech as jest.Mock).mockResolvedValue({
            audio: mockAudioBuffer,
            contentType: 'audio/mpeg',
            cached: false
        });

        const req = new NextRequest('http://localhost:3000/api/cinema/tts', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer valid-token'
            },
            body: JSON.stringify({ text: 'Hello, world!' })
        });

        const response = await POST(req);

        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toBe('audio/mpeg');
        expect(response.headers.get('X-Cached')).toBe('false');
        expect(textToSpeech).toHaveBeenCalledWith({
            text: 'Hello, world!'
        });
    });

    it('should support custom voice and model', async () => {
        mockVerifyIdToken.mockResolvedValue({ uid: 'test-user' });
        
        const mockAudioBuffer = Buffer.from('mock-audio-data');
        (textToSpeech as jest.Mock).mockResolvedValue({
            audio: mockAudioBuffer,
            contentType: 'audio/mpeg',
            cached: false
        });

        const req = new NextRequest('http://localhost:3000/api/cinema/tts', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer valid-token'
            },
            body: JSON.stringify({ 
                text: 'Hello, world!',
                voice: 'nova',
                model: 'tts-1-hd'
            })
        });

        const response = await POST(req);

        expect(response.status).toBe(200);
        expect(textToSpeech).toHaveBeenCalledWith({
            text: 'Hello, world!',
            voice: 'nova',
            model: 'tts-1-hd'
        });
    });

    it('should indicate cache hit in headers', async () => {
        mockVerifyIdToken.mockResolvedValue({ uid: 'test-user' });
        
        const mockAudioBuffer = Buffer.from('mock-audio-data');
        (textToSpeech as jest.Mock).mockResolvedValue({
            audio: mockAudioBuffer,
            contentType: 'audio/mpeg',
            cached: true
        });

        const req = new NextRequest('http://localhost:3000/api/cinema/tts', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer valid-token'
            },
            body: JSON.stringify({ text: 'Hello, world!' })
        });

        const response = await POST(req);

        expect(response.status).toBe(200);
        expect(response.headers.get('X-Cached')).toBe('true');
    });

    it('should handle service errors', async () => {
        mockVerifyIdToken.mockResolvedValue({ uid: 'test-user' });
        
        (textToSpeech as jest.Mock).mockRejectedValue(new Error('TTS service error'));

        const req = new NextRequest('http://localhost:3000/api/cinema/tts', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer valid-token'
            },
            body: JSON.stringify({ text: 'Hello, world!' })
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toContain('Failed to generate audio');
        expect(data.details).toBe('TTS service error');
    });
});
