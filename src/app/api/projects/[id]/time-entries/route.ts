import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for creating a time entry
const createTimeEntrySchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  description: z.string().min(1, { message: "Beschreibung ist erforderlich" }),
});

// Get all time entries for a project
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        projectId: id,
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    // Calculate total hours
    const totalMinutes = timeEntries.reduce((sum, entry) => {
      const start = new Date(entry.startTime);
      const end = new Date(entry.endTime);
      const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
      return sum + diffMinutes;
    }, 0);

    const totalHours = Math.round(totalMinutes / 60 * 100) / 100; // Round to 2 decimal places

    return NextResponse.json({
      entries: timeEntries,
      totalHours,
    });
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Create a new time entry
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await context.params;
    const body = await request.json();
    
    // Validate input data
    const validationResult = createTimeEntrySchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Ungültige Eingabedaten',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }
    
    const data = validationResult.data;
    
    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    
    if (!project) {
      return NextResponse.json(
        { error: 'Projekt nicht gefunden' },
        { status: 404 }
      );
    }
    
    // Validate that endTime is after startTime
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    
    if (endTime <= startTime) {
      return NextResponse.json(
        { error: 'Endzeit muss nach der Startzeit liegen' },
        { status: 400 }
      );
    }
    
    // Create time entry
    const timeEntry = await prisma.timeEntry.create({
      data: {
        projectId,
        startTime,
        endTime,
        description: data.description,
      },
    });
    
    return NextResponse.json(timeEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating time entry:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}