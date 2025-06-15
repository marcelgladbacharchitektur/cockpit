import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'webdav';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for version upload
const uploadVersionSchema = z.object({
  versionNumber: z.string().transform(Number),
  description: z.string().optional(),
});

// Upload a new plan version
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ trackedPlanId: string }> }
) {
  try {
    const { trackedPlanId } = await context.params;
    
    // Check if tracked plan exists with project info
    const trackedPlan = await prisma.trackedPlan.findUnique({
      where: { id: trackedPlanId },
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
    
    if (!trackedPlan) {
      return NextResponse.json(
        { error: 'Plantyp nicht gefunden' },
        { status: 404 }
      );
    }
    
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const versionNumber = formData.get('versionNumber') as string;
    const description = formData.get('description') as string | null;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Keine Datei hochgeladen' },
        { status: 400 }
      );
    }
    
    // Validate input
    const validationResult = uploadVersionSchema.safeParse({
      versionNumber,
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
    
    // Check if version number already exists
    const existingVersion = await prisma.planVersion.findFirst({
      where: {
        trackedPlanId,
        versionNumber: validationResult.data.versionNumber,
      },
    });
    
    if (existingVersion) {
      return NextResponse.json(
        { error: 'Diese Versionsnummer existiert bereits' },
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
    const projectFolder = `/Projekte/${trackedPlan.project.projectNumber}`;
    const plansFolder = `${projectFolder}/Pläne`;
    const planTypeFolder = `${plansFolder}/${trackedPlan.title}`;
    const versionFolder = `${planTypeFolder}/V${validationResult.data.versionNumber}`;
    
    try {
      // Try to create folders (will fail silently if they already exist)
      await webdavClient.createDirectory('/Projekte').catch(() => {});
      await webdavClient.createDirectory(projectFolder).catch(() => {});
      await webdavClient.createDirectory(plansFolder).catch(() => {});
      await webdavClient.createDirectory(planTypeFolder).catch(() => {});
      await webdavClient.createDirectory(versionFolder).catch(() => {});
    } catch (error) {
      console.error('Error creating directories:', error);
    }
    
    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const fileName = `${trackedPlan.project.projectNumber}_${trackedPlan.title}_V${validationResult.data.versionNumber}_${timestamp}.pdf`;
    const filePath = `${versionFolder}/${fileName}`;
    
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
    const planVersion = await prisma.planVersion.create({
      data: {
        trackedPlanId,
        versionNumber: validationResult.data.versionNumber,
        description: validationResult.data.description,
        filePath,
      },
    });
    
    return NextResponse.json(planVersion, { status: 201 });
  } catch (error) {
    console.error('Error uploading plan version:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}