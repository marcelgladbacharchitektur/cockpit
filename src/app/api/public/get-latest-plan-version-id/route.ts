import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const projectNumber = searchParams.get('projectNumber');
    const planTitle = searchParams.get('planTitle');

    if (!projectNumber || !planTitle) {
      return NextResponse.json(
        { error: 'Projektnummer und Plantitel sind erforderlich' },
        { status: 400 }
      );
    }

    // Find project by project number
    const project = await prisma.project.findUnique({
      where: { projectNumber },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Projekt nicht gefunden' },
        { status: 404 }
      );
    }

    // Find tracked plan by title and project
    const trackedPlan = await prisma.trackedPlan.findFirst({
      where: {
        projectId: project.id,
        title: planTitle,
      },
      select: { id: true },
    });

    if (!trackedPlan) {
      return NextResponse.json(
        { error: 'Plantyp nicht gefunden' },
        { status: 404 }
      );
    }

    // Find latest version of this plan
    const latestVersion = await prisma.planVersion.findFirst({
      where: {
        trackedPlanId: trackedPlan.id,
      },
      orderBy: {
        versionNumber: 'desc',
      },
      select: {
        id: true,
        versionNumber: true,
      },
    });

    if (!latestVersion) {
      return NextResponse.json(
        { error: 'Keine Version gefunden' },
        { status: 404 }
      );
    }

    // Return the version ID and number
    return NextResponse.json({
      versionId: latestVersion.id,
      versionNumber: latestVersion.versionNumber,
    });
  } catch (error) {
    console.error('Error getting latest plan version:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}