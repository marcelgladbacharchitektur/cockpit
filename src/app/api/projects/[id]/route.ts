import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const project = await prisma.project.findUnique({
      where: {
        id: id,
      },
      include: {
        assignments: {
          include: {
            contactGroup: true,
          },
        },
        notes: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        metadata: true,
        documents: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        timeEntries: {
          orderBy: {
            startTime: 'desc',
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Projekt nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}