import { 
    textToSpeech, 
    cinemaToSpeech,
    invalidateTTSCache,
    clearTTSCache,
    getTTSCacheStats,
    stopCleanupInterval,
    resetOpenAIClient
} from '@/lib/services/ttsService';
import OpenAI from 'openai';

// Mock OpenAI
jest.mock('openai');

describe('TTS Service', () => {
    let mockCreate: jest.Mock;

    beforeEach(() => {
        // Clear cache and reset client before each test
        clearTTSCache();
        resetOpenAIClient();
        
        // Mock OpenAI audio.speech.create
        mockCreate = jest.fn();
        (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
            audio: {
                speech: {
                    create: mockCreate
                }
            }
        } as any));

        // Set up environment variable
        process.env.OPENAI_API_KEY = 'test-api-key';
    });

    afterEach(() => {
        jest.clearAllMocks();
        resetOpenAIClient();
    });

    afterAll(() => {
        stopCleanupInterval();
    });

    describe('textToSpeech', () => {
        it('should generate audio from text', async () => {
            const mockAudioBuffer = Buffer.from('mock-audio-data');
            mockCreate.mockResolvedValue({
                arrayBuffer: async () => mockAudioBuffer.buffer
            });

            const result = await textToSpeech({
                text: 'Hello, world!'
            });

            expect(result.audio).toBeInstanceOf(Buffer);
            expect(result.contentType).toBe('audio/mpeg');
            expect(result.cached).toBe(false);
            expect(mockCreate).toHaveBeenCalledWith({
                model: 'tts-1',
                voice: 'alloy',
                input: 'Hello, world!'
            });
        });

        it('should use custom voice and model', async () => {
            const mockAudioBuffer = Buffer.from('mock-audio-data');
            mockCreate.mockResolvedValue({
                arrayBuffer: async () => mockAudioBuffer.buffer
            });

            await textToSpeech({
                text: 'Hello, world!',
                voice: 'nova',
                model: 'tts-1-hd'
            });

            expect(mockCreate).toHaveBeenCalledWith({
                model: 'tts-1-hd',
                voice: 'nova',
                input: 'Hello, world!'
            });
        });

        it('should throw error for empty text', async () => {
            await expect(textToSpeech({ text: '' }))
                .rejects.toThrow('Text is required for TTS generation');
        });

        it('should throw error for text exceeding 4096 characters', async () => {
            const longText = 'a'.repeat(4097);
            await expect(textToSpeech({ text: longText }))
                .rejects.toThrow('Text exceeds maximum length of 4096 characters');
        });

        it('should throw error when OPENAI_API_KEY is not set', async () => {
            delete process.env.OPENAI_API_KEY;
            resetOpenAIClient(); // Reset to force re-initialization
            
            await expect(textToSpeech({ text: 'Hello' }))
                .rejects.toThrow('OPENAI_API_KEY environment variable is not set');
            
            // Restore for other tests
            process.env.OPENAI_API_KEY = 'test-api-key';
        });
    });

    describe('caching', () => {
        it('should cache generated audio', async () => {
            const mockAudioBuffer = Buffer.from('mock-audio-data');
            mockCreate.mockResolvedValue({
                arrayBuffer: async () => mockAudioBuffer.buffer
            });

            // First call - should generate
            const result1 = await textToSpeech({ text: 'Hello, world!' });
            expect(result1.cached).toBe(false);
            expect(mockCreate).toHaveBeenCalledTimes(1);

            // Second call - should use cache
            const result2 = await textToSpeech({ text: 'Hello, world!' });
            expect(result2.cached).toBe(true);
            expect(mockCreate).toHaveBeenCalledTimes(1); // Still only called once
            expect(result2.audio).toEqual(result1.audio);
        });

        it('should cache separately for different voices', async () => {
            const mockAudioBuffer = Buffer.from('mock-audio-data');
            mockCreate.mockResolvedValue({
                arrayBuffer: async () => mockAudioBuffer.buffer
            });

            await textToSpeech({ text: 'Hello', voice: 'alloy' });
            await textToSpeech({ text: 'Hello', voice: 'nova' });

            expect(mockCreate).toHaveBeenCalledTimes(2);
        });

        it('should cache separately for different models', async () => {
            const mockAudioBuffer = Buffer.from('mock-audio-data');
            mockCreate.mockResolvedValue({
                arrayBuffer: async () => mockAudioBuffer.buffer
            });

            await textToSpeech({ text: 'Hello', model: 'tts-1' });
            await textToSpeech({ text: 'Hello', model: 'tts-1-hd' });

            expect(mockCreate).toHaveBeenCalledTimes(2);
        });

        it('should normalize text for caching', async () => {
            const mockAudioBuffer = Buffer.from('mock-audio-data');
            mockCreate.mockResolvedValue({
                arrayBuffer: async () => mockAudioBuffer.buffer
            });

            // These should use the same cache entry
            await textToSpeech({ text: 'Hello  World' });
            await textToSpeech({ text: 'hello  world' });
            await textToSpeech({ text: '  Hello  World  ' });

            // Should only call API once due to normalization
            expect(mockCreate).toHaveBeenCalledTimes(1);
        });

        it('should invalidate specific cache entry', async () => {
            const mockAudioBuffer = Buffer.from('mock-audio-data');
            mockCreate.mockResolvedValue({
                arrayBuffer: async () => mockAudioBuffer.buffer
            });

            await textToSpeech({ text: 'Hello' });
            expect(mockCreate).toHaveBeenCalledTimes(1);

            invalidateTTSCache('Hello');

            await textToSpeech({ text: 'Hello' });
            expect(mockCreate).toHaveBeenCalledTimes(2);
        });

        it('should clear all cache entries', async () => {
            const mockAudioBuffer = Buffer.from('mock-audio-data');
            mockCreate.mockResolvedValue({
                arrayBuffer: async () => mockAudioBuffer.buffer
            });

            await textToSpeech({ text: 'Hello' });
            await textToSpeech({ text: 'World' });
            
            const stats1 = getTTSCacheStats();
            expect(stats1.size).toBe(2);

            clearTTSCache();

            const stats2 = getTTSCacheStats();
            expect(stats2.size).toBe(0);
        });
    });

    describe('cinemaToSpeech', () => {
        it('should convert cinema narration to speech', async () => {
            const mockAudioBuffer = Buffer.from('mock-audio-data');
            mockCreate.mockResolvedValue({
                arrayBuffer: async () => mockAudioBuffer.buffer
            });

            const narration = 'Welcome to this code explanation!';
            const result = await cinemaToSpeech(narration);

            expect(result.audio).toBeInstanceOf(Buffer);
            expect(result.contentType).toBe('audio/mpeg');
            expect(mockCreate).toHaveBeenCalledWith({
                model: 'tts-1',
                voice: 'alloy',
                input: narration
            });
        });

        it('should use custom voice for cinema', async () => {
            const mockAudioBuffer = Buffer.from('mock-audio-data');
            mockCreate.mockResolvedValue({
                arrayBuffer: async () => mockAudioBuffer.buffer
            });

            await cinemaToSpeech('Hello', 'nova');

            expect(mockCreate).toHaveBeenCalledWith({
                model: 'tts-1',
                voice: 'nova',
                input: 'Hello'
            });
        });
    });

    describe('cache statistics', () => {
        it('should track cache size and total bytes', async () => {
            const mockAudioBuffer1 = Buffer.from('audio-data-1');
            const mockAudioBuffer2 = Buffer.from('audio-data-2-longer');
            
            mockCreate
                .mockResolvedValueOnce({
                    arrayBuffer: async () => mockAudioBuffer1.buffer.slice(0, mockAudioBuffer1.length)
                })
                .mockResolvedValueOnce({
                    arrayBuffer: async () => mockAudioBuffer2.buffer.slice(0, mockAudioBuffer2.length)
                });

            await textToSpeech({ text: 'First' });
            await textToSpeech({ text: 'Second' });

            const stats = getTTSCacheStats();
            expect(stats.size).toBe(2);
            expect(stats.totalBytes).toBeGreaterThan(0);
        });
    });
});
