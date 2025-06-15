import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { createClient } from 'webdav';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  context: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await context.params;
    
    // Fetch document metadata from database
    const document = await prisma.projectDocument.findUnique({
      where: { id: documentId },
      include: {
        project: {
          select: {
            id: true,
            projectNumber: true,
            name: true,
          },
        },
      },
    });
    
    if (!document) {
      return NextResponse.json(
        { error: 'Dokument nicht gefunden' },
        { status: 404 }
      );
    }
    
    // TODO: Here you would check user permissions
    // For now, we allow access to all documents
    
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
      const fileBuffer = await webdavClient.getFileContents(document.filePath) as Buffer;
      
      // Set appropriate headers for file download
      const headers = new Headers();
      headers.set('Content-Type', 'application/pdf');
      headers.set('Content-Disposition', `attachment; filename="${document.fileName}"`);
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
    console.error('Error in document download:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}