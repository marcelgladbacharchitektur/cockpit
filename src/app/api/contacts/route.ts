import { PrismaClient, ContactCategory } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for creating a contact
const createContactSchema = z.object({
  group: z.object({
    name: z.string().min(1, { message: "Gruppenname darf nicht leer sein." }),
    category: z.nativeEnum(ContactCategory),
    website: z.string().url().optional().nullable(),
  }),
  address: z.object({
    street: z.string().optional().nullable(),
    houseNumber: z.string().optional().nullable(),
    postalCode: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    label: z.string().optional(),
  }),
  persons: z.array(z.object({
    titlePrefix: z.string().optional().nullable(),
    firstName: z.string().min(1, { message: "Vorname ist erforderlich." }),
    lastName: z.string().min(1, { message: "Nachname ist erforderlich." }),
    titleSuffix: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    phone: z.string().optional().nullable(),
  })).min(1, { message: "Mindestens eine Person ist erforderlich." }),
});

export async function GET() {
  try {
    const contactGroups = await prisma.contactGroup.findMany({
      include: {
        persons: {
          select: {
            id: true,
            titlePrefix: true,
            firstName: true,
            lastName: true,
            titleSuffix: true,
          },
        },
        addresses: {
          select: {
            id: true,
            street: true,
            houseNumber: true,
            postalCode: true,
            city: true,
            label: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(contactGroups, { status: 200 });
  } catch (error) {
    console.error('Error fetching contact groups:', error);
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
    const validationResult = createContactSchema.safeParse(body);
    
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
    
    // Use transaction to ensure all data is created together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create ContactGroup
      const contactGroup = await tx.contactGroup.create({
        data: {
          name: data.group.name,
          category: data.group.category,
          website: data.group.website,
        },
      });
      
      // 2. Create Address if any data provided
      if (data.address.street || data.address.city || data.address.postalCode) {
        await tx.address.create({
          data: {
            street: data.address.street,
            houseNumber: data.address.houseNumber,
            postalCode: data.address.postalCode,
            city: data.address.city,
            country: data.address.country,
            label: data.address.label || 'Hauptadresse',
            contactGroupId: contactGroup.id,
          },
        });
      }
      
      // 3. Create Persons with their contact info
      for (const personData of data.persons) {
        const person = await tx.person.create({
          data: {
            titlePrefix: personData.titlePrefix,
            firstName: personData.firstName,
            lastName: personData.lastName,
            titleSuffix: personData.titleSuffix,
            contactGroupId: contactGroup.id,
          },
        });
        
        // Create email if provided
        if (personData.email) {
          await tx.emailAddress.create({
            data: {
              email: personData.email,
              label: 'Geschäftlich',
              personId: person.id,
            },
          });
        }
        
        // Create phone if provided
        if (personData.phone) {
          await tx.phoneNumber.create({
            data: {
              phone: personData.phone,
              label: 'Geschäftlich',
              personId: person.id,
            },
          });
        }
      }
      
      return contactGroup;
    });
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating contact group:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}