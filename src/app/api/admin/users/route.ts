import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        profile: true,
        _count: {
          select: { attempts: true },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error' }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { userId, role, isActive } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID wajib diisi.' }, { status: 400 });
    }

    // Only SUPER_ADMIN can change roles
    const dataToUpdate: any = {};
    if (typeof isActive === 'boolean') {
      dataToUpdate.isActive = isActive;
    }
    if (role && admin.role === 'SUPER_ADMIN') {
      dataToUpdate.role = role;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error' }, { status: 500 });
  }
}

