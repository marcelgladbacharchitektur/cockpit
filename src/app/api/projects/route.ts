import { PrismaClient, ProjectStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for creating a project
const createProjectSchema = z.object({
  name: z.string().min(1, { message: "Projektname darf nicht leer sein." }).max(255),
  status: z.nativeEnum(ProjectStatus),
  budget: z.number().positive().optional(),
  plotArea: z.number().positive().optional(),
});

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        projectNumber: true,
        name: true,
        status: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input data
    const validationResult = createProjectSchema.safeParse(body);
    
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
    
    // Get current year (last 2 digits)
    const currentYear = new Date().getFullYear().toString().slice(-2);
    
    // Find the last project of the current year
    const lastProject = await prisma.project.findFirst({
      where: {
        projectNumber: {
          startsWith: `${currentYear}-`,
        },
      },
      orderBy: {
        projectNumber: 'desc',
      },
    });
    
    // Determine next project number
    let nextNumber = 1;
    if (lastProject) {
      const lastNumber = parseInt(lastProject.projectNumber.split('-')[1]);
      nextNumber = lastNumber + 1;
    }
    
    // Format project number as JJ-NNN
    const projectNumber = `${currentYear}-${nextNumber.toString().padStart(3, '0')}`;
    
    // Create new project
    const newProject = await prisma.project.create({
      data: {
        projectNumber,
        name: data.name,
        status: data.status,
        budget: data.budget,
        plotArea: data.plotArea,
      },
    });
    
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}