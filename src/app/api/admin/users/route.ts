import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();

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

    return NextResponse.json({
      users,
      currentAdmin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();

    if (admin.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Hanya Super Administrator yang berhak menambahkan akun baru.' },
        { status: 403 }
      );
    }

    const { name, email, password, role, phone, province, educationLevel } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Nama lengkap, email, kata sandi, dan role wajib diisi.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Kata sandi minimal 6 karakter.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Alamat email ini sudah terdaftar di sistem.' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: role as 'SUPER_ADMIN' | 'ADMIN' | 'USER',
        profile: {
          create: {
            phone: phone ? phone.trim() : null,
            province: province ? province.trim() : null,
            educationLevel: educationLevel ? educationLevel.trim() : null,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        profile: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'Akun pengguna berhasil ditambahkan.',
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: error.message || 'Error' }, { status: 500 });
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

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID wajib diisi.' }, { status: 400 });
    }

    // Protection: Cannot delete own account
    if (userId === admin.id) {
      return NextResponse.json(
        { error: 'Anda tidak dapat menghapus akun Anda sendiri.' },
        { status: 400 }
      );
    }

    // Only SUPER_ADMIN can delete users
    if (admin.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Hanya Super Administrator yang berhak menghapus akun.' },
        { status: 403 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    // Cascade delete related records
    await prisma.userProfile.deleteMany({ where: { userId } });
    await prisma.userFavorite.deleteMany({ where: { userId } });
    await prisma.materialProgress.deleteMany({ where: { userId } });
    await prisma.examAttempt.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({
      success: true,
      message: `Akun ${targetUser.name} (${targetUser.email}) berhasil dihapus.`,
    });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: error.message || 'Error' }, { status: 500 });
  }
}

