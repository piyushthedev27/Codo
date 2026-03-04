import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { getUserDashboardData } from '@/lib/services/progressService';

export async function GET(
    req: NextRequest,
    { params }: { params: { userId: string } }
) {
    const { userId } = params;

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth().verifyIdToken(token);

        if (decodedToken.uid !== userId && !decodedToken.admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const dashboardData = await getUserDashboardData(userId);
        if (!dashboardData) {
            return NextResponse.json({ error: 'Dashboard data not found' }, { status: 404 });
        }
        return NextResponse.json({ ...dashboardData });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        console.error('User dashboard error:', error);
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
