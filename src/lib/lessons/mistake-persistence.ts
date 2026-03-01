import { supabase } from '@/lib/database/supabase-client'

export interface MistakeEntry {
    userId: string
    errorType: string
    errorMessage: string
    codeContext: string
    language: string
    severity: 'low' | 'medium' | 'high'
}

export class MistakePersistenceManager {
    /**
     * Track a new mistake in the database
     */
    static async trackMistake(entry: MistakeEntry) {
        // 1. Check if this pattern already exists for the user
        const { data: existingPattern } = await supabase
            .from('mistake_patterns')
            .select('id, frequency')
            .eq('user_id', entry.userId)
            .eq('error_type', entry.errorType)
            .maybeSingle()

        if (existingPattern) {
            // 2. Update existing pattern frequency
            await supabase
                .from('mistake_patterns')
                .update({
                    frequency: existingPattern.frequency + 1,
                    last_occurrence: new Date().toISOString(),
                    code_context: entry.codeContext,
                    error_message: entry.errorMessage
                })
                .eq('id', existingPattern.id)
        } else {
            // 3. Insert new pattern
            await supabase
                .from('mistake_patterns')
                .insert({
                    user_id: entry.userId,
                    error_type: entry.errorType,
                    error_message: entry.errorMessage,
                    code_context: entry.codeContext,
                    language: entry.language,
                    frequency: 1,
                    last_occurrence: new Date().toISOString()
                })
        }

        // 4. Log the activity in the learning history
        await supabase.from('learning_activities').insert({
            user_id: entry.userId,
            activity_type: 'mistake_analysis',
            title: `Analyzed ${entry.errorType}`,
            description: entry.errorMessage.substring(0, 100),
            metadata: { severity: entry.severity }
        })
    }

    /**
     * Fetch persistent mistake history for a user
     */
    static async getMistakeHistory(userId: string) {
        const { data, error } = await supabase
            .from('mistake_patterns')
            .select('*')
            .eq('user_id', userId)
            .order('last_occurrence', { ascending: false })
            .limit(10)

        return { data, error }
    }
}
