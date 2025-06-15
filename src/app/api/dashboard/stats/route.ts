import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get various statistics
    const [
      projectsInProgress,
      totalProjects,
      totalContacts,
      recentTimeEntries
    ] = await Promise.all([
      // Count projects in progress
      prisma.project.count({
        where: { status: 'IN_BEARBEITUNG' },
      }),
      // Total projects
      prisma.project.count(),
      // Total contact groups
      prisma.contactGroup.count(),
      // Count time entries from last 7 days
      prisma.timeEntry.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return NextResponse.json({
      projectsInProgress,
      totalProjects,
      totalContacts,
      recentTimeEntries,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}