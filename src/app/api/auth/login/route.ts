import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Email atau kata sandi tidak cocok.' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Email atau kata sandi tidak cocok.' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Akun Anda telah dinonaktifkan oleh administrator.' },
        { status: 403 }
      );
    }

    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as 'SUPER_ADMIN' | 'ADMIN' | 'USER',
    };

    const token = signToken(tokenPayload);

    const response = NextResponse.json({
      success: true,
      user: tokenPayload,
      message: 'Login berhasil.',
    });

    response.cookies.set('siapasn_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat login.' },
      { status: 500 }
    );
  }
}

