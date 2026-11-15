import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone, province, educationLevel } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nama lengkap, email, dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Kata sandi minimal 6 karakter.' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email ini sudah terdaftar. Silakan login.' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: 'USER',
        profile: {
          create: {
            phone: phone || null,
            province: province || null,
            educationLevel: educationLevel || null,
          },
        },
      },
    });

    const tokenPayload = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as 'USER',
    };

    const token = signToken(tokenPayload);

    const response = NextResponse.json({
      success: true,
      user: tokenPayload,
      message: 'Registrasi berhasil.',
    });

    response.cookies.set('siapasn_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Gagal melakukan pendaftaran akun.' },
      { status: 500 }
    );
  }
}

