import { PrismaClient, DocumentType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'webdav';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for document upload
const uploadDocumentSchema = z.object({
  documentType: z.nativeEnum(DocumentType),
  description: z.string().optional(),
});

// Get documents for a project
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const documents = await prisma.projectDocument.findMany({
      where: {
        projectId: id,
      },
      orderBy: [
        { documentType: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Upload a new document
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await context.params;
    
    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { 
        id: true, 
        projectNumber: true,
        name: true,
      },
    });
    
    if (!project) {
      return NextResponse.json(
        { error: 'Projekt nicht gefunden' },
        { status: 404 }
      );
    }
    
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const documentType = formData.get('documentType') as string;
    const description = formData.get('description') as string | null;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Keine Datei hochgeladen' },
        { status: 400 }
      );
    }
    
    // Validate input
    const validationResult = uploadDocumentSchema.safeParse({
      documentType,
      description,
    });
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Ungültige Eingabedaten',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }
    
    // Check file type (only PDFs allowed)
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Nur PDF-Dateien sind erlaubt' },
        { status: 400 }
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
    
    // Create folder structure in Nextcloud
    const projectFolder = `/Projekte/${project.projectNumber}`;
    const documentsFolder = `${projectFolder}/Dokumente`;
    
    try {
      // Try to create folders (will fail silently if they already exist)
      await webdavClient.createDirectory('/Projekte').catch(() => {});
      await webdavClient.createDirectory(projectFolder).catch(() => {});
      await webdavClient.createDirectory(documentsFolder).catch(() => {});
    } catch (error) {
      console.error('Error creating directories:', error);
    }
    
    // Generate unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${sanitizedFileName}`;
    const filePath = `${documentsFolder}/${fileName}`;
    
    // Convert File to Buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload file to Nextcloud
    try {
      await webdavClient.putFileContents(filePath, buffer);
    } catch (error) {
      console.error('Error uploading to Nextcloud:', error);
      return NextResponse.json(
        { error: 'Fehler beim Hochladen der Datei' },
        { status: 500 }
      );
    }
    
    // Create database entry
    const document = await prisma.projectDocument.create({
      data: {
        projectId,
        documentType: validationResult.data.documentType,
        fileName: file.name,
        filePath,
        fileSize: file.size,
        description: validationResult.data.description,
        version: 1,
      },
    });
    
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}