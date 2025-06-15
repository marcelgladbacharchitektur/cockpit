import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get the 5 most recent project notes
    const recentNotes = await prisma.projectNote.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            projectNumber: true,
          },
        },
      },
    });

    return NextResponse.json(recentNotes);
  } catch (error) {
    console.error('Error fetching recent notes:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}