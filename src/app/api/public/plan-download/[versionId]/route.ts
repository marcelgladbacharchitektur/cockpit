import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { createClient } from 'webdav';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  context: { params: Promise<{ versionId: string }> }
) {
  try {
    const { versionId } = await context.params;
    
    // Fetch plan version from database
    const planVersion = await prisma.planVersion.findUnique({
      where: { id: versionId },
      include: {
        trackedPlan: {
          include: {
            project: true,
          },
        },
      },
    });
    
    if (!planVersion) {
      return NextResponse.json(
        { error: 'Plan-Version nicht gefunden' },
        { status: 404 }
      );
    }
    
    // Initialize WebDAV client
    const webdavClient = createClient(
      process.env.NEXTCLOUD_URL || '',
      {
        username: process.env.NEXTCLOUD_USERNAME || '',
        password: process.env.NEXTCLOUD_PASSWORD || '',
      }
    );
    
    try {
      // Download file from Nextcloud
      const fileBuffer = await webdavClient.getFileContents(planVersion.filePath) as Buffer;
      
      // Generate filename
      const fileName = `${planVersion.trackedPlan.project.projectNumber}_${planVersion.trackedPlan.title}_V${planVersion.versionNumber}.pdf`;
      
      // Set appropriate headers for file download
      const headers = new Headers();
      headers.set('Content-Type', 'application/pdf');
      headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
      headers.set('Content-Length', fileBuffer.length.toString());
      
      return new NextResponse(fileBuffer, {
        status: 200,
        headers,
      });
    } catch (error) {
      console.error('Error downloading from Nextcloud:', error);
      return NextResponse.json(
        { error: 'Fehler beim Herunterladen der Datei' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in plan download:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}