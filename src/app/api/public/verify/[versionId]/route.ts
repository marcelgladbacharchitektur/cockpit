import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  context: { params: Promise<{ versionId: string }> }
) {
  try {
    const { versionId } = await context.params;
    
    // Find the scanned plan version
    const scannedVersion = await prisma.planVersion.findUnique({
      where: { id: versionId },
      include: {
        trackedPlan: {
          include: {
            project: {
              select: {
                id: true,
                projectNumber: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!scannedVersion) {
      return NextResponse.json(
        { error: 'Plan-Version nicht gefunden' },
        { status: 404 }
      );
    }

    // Find the latest version of this plan
    const latestVersion = await prisma.planVersion.findFirst({
      where: {
        trackedPlanId: scannedVersion.trackedPlanId,
      },
      orderBy: {
        versionNumber: 'desc',
      },
    });

    if (!latestVersion) {
      // This should not happen, but handle it gracefully
      return NextResponse.json(
        { error: 'Keine aktuelle Version gefunden' },
        { status: 500 }
      );
    }

    // Compare versions
    const isLatest = scannedVersion.id === latestVersion.id;

    if (isLatest) {
      return NextResponse.json({
        status: 'AKTUELL',
        planTitle: scannedVersion.trackedPlan.title,
        planVersion: scannedVersion.versionNumber,
        project: {
          id: scannedVersion.trackedPlan.project.id,
          projectNumber: scannedVersion.trackedPlan.project.projectNumber,
          name: scannedVersion.trackedPlan.project.name,
        },
        createdAt: scannedVersion.createdAt,
      });
    } else {
      return NextResponse.json({
        status: 'VERALTET',
        planTitle: scannedVersion.trackedPlan.title,
        scannedVersion: scannedVersion.versionNumber,
        scannedDate: scannedVersion.createdAt,
        currentVersion: latestVersion.versionNumber,
        currentDate: latestVersion.createdAt,
        currentVersionId: latestVersion.id,
        project: {
          id: scannedVersion.trackedPlan.project.id,
          projectNumber: scannedVersion.trackedPlan.project.projectNumber,
          name: scannedVersion.trackedPlan.project.name,
        },
      });
    }
  } catch (error) {
    console.error('Error verifying plan:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}