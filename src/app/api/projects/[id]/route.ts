import { PrismaClient, ProjectStatus, ProjectType, ProjectSector } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for updating a project
const updateProjectSchema = z.object({
  name: z.string().min(1).max(255),
  status: z.nativeEnum(ProjectStatus),
  budget: z.number().positive().optional().nullable(),
  description: z.string().optional().nullable(),
  projectType: z.nativeEnum(ProjectType).optional().nullable(),
  projectSector: z.nativeEnum(ProjectSector).optional().nullable(),
  parcelNumber: z.string().optional().nullable(),
  plotAddress: z.string().optional().nullable(),
  plotArea: z.number().positive().optional().nullable(),
  cadastralCommunity: z.string().optional().nullable(),
  registrationNumber: z.string().optional().nullable(),
  zoning: z.string().optional().nullable(),
  plotNotes: z.string().optional().nullable(),
});

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

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    // Validate input data
    const validationResult = updateProjectSchema.safeParse(body);
    
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
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });
    
    if (!existingProject) {
      return NextResponse.json(
        { error: 'Projekt nicht gefunden' },
        { status: 404 }
      );
    }
    
    // Update project
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        name: data.name,
        status: data.status,
        budget: data.budget,
        description: data.description,
        projectType: data.projectType,
        projectSector: data.projectSector,
        parcelNumber: data.parcelNumber,
        plotAddress: data.plotAddress,
        plotArea: data.plotArea,
        cadastralCommunity: data.cadastralCommunity,
        registrationNumber: data.registrationNumber,
        zoning: data.zoning,
        plotNotes: data.plotNotes,
      },
    });
    
    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });
    
    if (!existingProject) {
      return NextResponse.json(
        { error: 'Projekt nicht gefunden' },
        { status: 404 }
      );
    }
    
    // Delete project (cascading delete will remove all related data)
    await prisma.project.delete({
      where: { id },
    });
    
    return NextResponse.json(
      { message: 'Projekt erfolgreich gelöscht' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}