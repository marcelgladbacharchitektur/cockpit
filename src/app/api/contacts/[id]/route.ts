import { PrismaClient, ContactCategory } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for updating a contact
const updateContactSchema = z.object({
  group: z.object({
    name: z.string().min(1, { message: "Gruppenname darf nicht leer sein." }),
    category: z.nativeEnum(ContactCategory),
    website: z.string().url().optional().nullable(),
  }),
  addresses: z.array(z.object({
    id: z.string().optional(),
    street: z.string().optional().nullable(),
    houseNumber: z.string().optional().nullable(),
    postalCode: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    label: z.string().optional(),
  })),
  persons: z.array(z.object({
    id: z.string().optional(),
    titlePrefix: z.string().optional().nullable(),
    firstName: z.string().min(1, { message: "Vorname ist erforderlich." }),
    lastName: z.string().min(1, { message: "Nachname ist erforderlich." }),
    titleSuffix: z.string().optional().nullable(),
    emails: z.array(z.object({
      id: z.string().optional(),
      email: z.string().email(),
      label: z.string(),
    })),
    phones: z.array(z.object({
      id: z.string().optional(),
      phone: z.string(),
      label: z.string(),
    })),
  })),
  deletions: z.object({
    addresses: z.array(z.string()),
    persons: z.array(z.string()),
  }).optional(),
});

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const contactGroup = await prisma.contactGroup.findUnique({
      where: {
        id: id,
      },
      include: {
        persons: {
          include: {
            emails: true,
            phones: true,
          },
        },
        addresses: true,
        metadata: true,
        assignments: {
          include: {
            project: {
              select: {
                id: true,
                projectNumber: true,
                name: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!contactGroup) {
      return NextResponse.json(
        { error: 'Kontakt nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json(contactGroup);
  } catch (error) {
    console.error('Error fetching contact group:', error);
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
    const validationResult = updateContactSchema.safeParse(body);
    
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
    
    // Check if contact group exists
    const existingGroup = await prisma.contactGroup.findUnique({
      where: { id },
      include: {
        persons: {
          include: {
            emails: true,
            phones: true,
          },
        },
        addresses: true,
      },
    });
    
    if (!existingGroup) {
      return NextResponse.json(
        { error: 'Kontakt nicht gefunden' },
        { status: 404 }
      );
    }
    
    // Use transaction to ensure all updates happen together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update ContactGroup
      const updatedGroup = await tx.contactGroup.update({
        where: { id },
        data: {
          name: data.group.name,
          category: data.group.category,
          website: data.group.website,
        },
      });
      
      // 2. Handle deletions first
      if (data.deletions) {
        // Delete persons (this will cascade delete emails and phones)
        if (data.deletions.persons.length > 0) {
          await tx.person.deleteMany({
            where: {
              id: { in: data.deletions.persons },
              contactGroupId: id,
            },
          });
        }
        
        // Delete addresses
        if (data.deletions.addresses.length > 0) {
          await tx.address.deleteMany({
            where: {
              id: { in: data.deletions.addresses },
              contactGroupId: id,
            },
          });
        }
      }
      
      // 3. Handle addresses - update existing or create new
      for (const addressData of data.addresses) {
        if (addressData.id) {
          // Update existing address
          await tx.address.update({
            where: { id: addressData.id },
            data: {
              street: addressData.street,
              houseNumber: addressData.houseNumber,
              postalCode: addressData.postalCode,
              city: addressData.city,
              country: addressData.country,
              label: addressData.label || 'Hauptadresse',
            },
          });
        } else if (addressData.street || addressData.city || addressData.postalCode) {
          // Create new address only if some data is provided
          await tx.address.create({
            data: {
              street: addressData.street,
              houseNumber: addressData.houseNumber,
              postalCode: addressData.postalCode,
              city: addressData.city,
              country: addressData.country,
              label: addressData.label || 'Zusätzliche Adresse',
              contactGroupId: id,
            },
          });
        }
      }
      
      // 4. Handle persons with their contact info
      for (const personData of data.persons) {
        let personId: string;
        
        if (personData.id) {
          // Update existing person
          await tx.person.update({
            where: { id: personData.id },
            data: {
              titlePrefix: personData.titlePrefix,
              firstName: personData.firstName,
              lastName: personData.lastName,
              titleSuffix: personData.titleSuffix,
            },
          });
          personId = personData.id;
          
          // Delete all existing emails and phones for this person
          // (easier than trying to match and update)
          await tx.emailAddress.deleteMany({
            where: { personId },
          });
          await tx.phoneNumber.deleteMany({
            where: { personId },
          });
        } else {
          // Create new person
          const newPerson = await tx.person.create({
            data: {
              titlePrefix: personData.titlePrefix,
              firstName: personData.firstName,
              lastName: personData.lastName,
              titleSuffix: personData.titleSuffix,
              contactGroupId: id,
            },
          });
          personId = newPerson.id;
        }
        
        // Create emails
        for (const emailData of personData.emails) {
          await tx.emailAddress.create({
            data: {
              email: emailData.email,
              label: emailData.label,
              personId,
            },
          });
        }
        
        // Create phones
        for (const phoneData of personData.phones) {
          await tx.phoneNumber.create({
            data: {
              phone: phoneData.phone,
              label: phoneData.label,
              personId,
            },
          });
        }
      }
      
      return updatedGroup;
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating contact group:', error);
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
    
    // Check if contact group exists
    const existingGroup = await prisma.contactGroup.findUnique({
      where: { id },
    });
    
    if (!existingGroup) {
      return NextResponse.json(
        { error: 'Kontakt nicht gefunden' },
        { status: 404 }
      );
    }
    
    // Delete the contact group
    // Thanks to our Prisma schema with cascading deletes,
    // all related persons, addresses, emails, phones, and project assignments
    // will be automatically deleted
    await prisma.contactGroup.delete({
      where: { id },
    });
    
    return NextResponse.json(
      { message: 'Kontaktgruppe erfolgreich gelöscht' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting contact group:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}