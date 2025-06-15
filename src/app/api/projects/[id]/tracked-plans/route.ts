import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for creating a tracked plan
const createTrackedPlanSchema = z.object({
  title: z.string().min(1, { message: "Plantitel ist erforderlich" }),
});

// Get all tracked plans for a project
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const trackedPlans = await prisma.trackedPlan.findMany({
      where: {
        projectId: id,
      },
      include: {
        versions: {
          orderBy: {
            versionNumber: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(trackedPlans);
  } catch (error) {
    console.error('Error fetching tracked plans:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Create a new tracked plan
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await context.params;
    const body = await request.json();
    
    // Validate input data
    const validationResult = createTrackedPlanSchema.safeParse(body);
    
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
    
    // Create tracked plan
    const trackedPlan = await prisma.trackedPlan.create({
      data: {
        projectId,
        title: data.title,
      },
    });
    
    return NextResponse.json(trackedPlan, { status: 201 });
  } catch (error) {
    console.error('Error creating tracked plan:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}