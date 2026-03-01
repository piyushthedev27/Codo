/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Supabase Realtime Collaboration Manager
 * Handles real-time code synchronization and cursor presence
 */

import { supabase } from '../database/supabase-client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface CursorPosition {
    userId: string
    userName: string
    line: number
    column: number
    isTyping: boolean
    color?: string
}

export interface CodeUpdate {
    userId: string
    code: string
    cursor?: {
        line: number
        column: number
    }
}

export class CollaborationManager {
    private channel: RealtimeChannel | null = null
    private sessionId: string
    private userId: string
    private userName: string
    private callbacks: {
        onCodeUpdate?: (update: CodeUpdate) => void
        onCursorUpdate?: (cursors: CursorPosition[]) => void
    }

    constructor(sessionId: string, userId: string, userName: string) {
        this.sessionId = sessionId
        this.userId = userId
        this.userName = userName
        this.callbacks = {}
    }

    /**
     * Initialize the real-time session
     */
    async join(): Promise<void> {
        const channelName = `collab:${this.sessionId}`

        this.channel = supabase.channel(channelName, {
            config: {
                presence: {
                    key: this.userId,
                },
            },
        })

        // Track presence (cursors and active users)
        this.channel
            .on('presence', { event: 'sync' }, () => {
                const newState = this.channel!.presenceState()
                const cursors: CursorPosition[] = []

                Object.keys(newState).forEach((key) => {
                    const presence: any = newState[key][0]
                    if (presence.cursor) {
                        cursors.push({
                            userId: key,
                            userName: presence.userName,
                            line: presence.cursor.line,
                            column: presence.cursor.column,
                            isTyping: presence.cursor.isTyping,
                            color: presence.color
                        })
                    }
                })

                if (this.callbacks.onCursorUpdate) {
                    this.callbacks.onCursorUpdate(cursors)
                }
            })
            .on('broadcast', { event: 'code_update' }, ({ payload }) => {
                if (payload.userId !== this.userId && this.callbacks.onCodeUpdate) {
                    this.callbacks.onCodeUpdate(payload)
                }
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`[Collab] Joined session: ${this.sessionId}`)
                    await this.updatePresence({ line: 1, column: 1, isTyping: false })
                }
            })
    }

    /**
     * Leave the real-time session
     */
    async leave(): Promise<void> {
        if (this.channel) {
            await supabase.removeChannel(this.channel)
            this.channel = null
        }
    }

    /**
     * Broadcast code updates to other participants
     */
    broadcastCode(code: string, cursor?: { line: number; column: number }): void {
        if (!this.channel) return

        this.channel.send({
            type: 'broadcast',
            event: 'code_update',
            payload: {
                userId: this.userId,
                code,
                cursor,
                timestamp: new Date().toISOString()
            },
        })
    }

    /**
     * Update the user's presence (cursor position and typing status)
     */
    async updatePresence(cursor: { line: number; column: number; isTyping: boolean }): Promise<void> {
        if (!this.channel) return

        await this.channel.track({
            userName: this.userName,
            cursor,
            userId: this.userId,
            color: this.getUserColor(this.userId)
        })
    }

    /**
     * Register callbacks for updates
     */
    onUpdates(callbacks: {
        onCodeUpdate?: (update: CodeUpdate) => void
        onCursorUpdate?: (cursors: CursorPosition[]) => void
    }): void {
        this.callbacks = { ...this.callbacks, ...callbacks }
    }

    /**
     * Generate a stable color for a user based on their ID
     */
    private getUserColor(userId: string): string {
        const colors = [
            '#3b82f6', // blue
            '#ec4899', // pink
            '#10b981', // emerald
            '#f59e0b', // amber
            '#8b5cf6', // violet
            '#ef4444'  // red
        ]

        // Simple hash to select a color
        let hash = 0
        for (let i = 0; i < userId.length; i++) {
            hash = userId.charCodeAt(i) + ((hash << 5) - hash)
        }

        return colors[Math.abs(hash) % colors.length]
    }
}
