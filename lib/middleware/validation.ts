// ---------------------------------------------------------------------------
// String sanitization helpers
// ---------------------------------------------------------------------------

/**
 * Strips HTML tags and potentially dangerous characters from a string.
 * Prevents XSS attacks in user-submitted text fields.
 */
export function sanitizeString(input: string): string {
    return input
        .replace(/<[^>]*>/g, '')      // strip HTML tags
        .replace(/javascript:/gi, '') // remove javascript: protocol
        .replace(/on\w+\s*=/gi, '')   // remove event handlers (onclick=, etc.)
        .trim();
}

/**
 * Checks whether a value contains SQL/NoSQL injection patterns.
 * Returns true if the value looks safe, false if suspicious.
 */
export function validateNoInjection(value: string): boolean {
    const dangerousPatterns = [
        /(\$where|\$ne|\$gt|\$lt|\$gte|\$lte|\$in|\$nin|\$or|\$and|\$not|\$nor)/i, // Firestore/MongoDB operators
        /(DROP|DELETE|INSERT|UPDATE|SELECT|UNION|ALTER|CREATE|EXEC|EXECUTE)\s/i,    // SQL keywords
        /('|--|\/\*|\*\/|;)/,                                                         // SQL comment / string terminators
    ];
    return !dangerousPatterns.some((re) => re.test(value));
}

/**
 * Sanitizes all string values in a plain object (one level deep).
 */
export function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            result[key] = sanitizeString(value);
        } else {
            result[key] = value;
        }
    }
    return result;
}

// ---------------------------------------------------------------------------
// Schema-based body validation
// ---------------------------------------------------------------------------

type FieldValidator = {
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
};

export type ValidationSchema = Record<string, FieldValidator>;

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

/**
 * Validates a request body against a simple schema.
 */
export function validateBody(
    body: Record<string, unknown>,
    schema: ValidationSchema
): ValidationResult {
    const errors: string[] = [];

    for (const [field, rules] of Object.entries(schema)) {
        const value = body[field];

        if (rules.required && (value === undefined || value === null || value === '')) {
            errors.push(`"${field}" is required.`);
            continue;
        }

        if (value === undefined || value === null) continue;

        if (rules.type) {
            const actualType = Array.isArray(value) ? 'array' : typeof value;
            if (actualType !== rules.type) {
                errors.push(`"${field}" must be of type ${rules.type}.`);
                continue;
            }
        }

        if (typeof value === 'string') {
            if (rules.minLength !== undefined && value.length < rules.minLength) {
                errors.push(`"${field}" must be at least ${rules.minLength} characters.`);
            }
            if (rules.maxLength !== undefined && value.length > rules.maxLength) {
                errors.push(`"${field}" must be at most ${rules.maxLength} characters.`);
            }
            if (rules.pattern && !rules.pattern.test(value)) {
                errors.push(`"${field}" has an invalid format.`);
            }
            if (!validateNoInjection(value)) {
                errors.push(`"${field}" contains invalid characters.`);
            }
        }

        if (typeof value === 'number') {
            if (rules.min !== undefined && value < rules.min) {
                errors.push(`"${field}" must be at least ${rules.min}.`);
            }
            if (rules.max !== undefined && value > rules.max) {
                errors.push(`"${field}" must be at most ${rules.max}.`);
            }
        }
    }

    return { valid: errors.length === 0, errors };
}
