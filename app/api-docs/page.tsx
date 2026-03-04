'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import { useEffect, useState } from 'react';

// Dynamically import SwaggerUI to avoid SSR issues with its browser dependencies
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto py-8">
                <SwaggerUI url="/openapi.json" />
            </div>
        </div>
    );
}
