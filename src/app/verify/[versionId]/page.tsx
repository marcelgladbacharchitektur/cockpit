import { PrismaClient } from '@prisma/client';
import { CheckCircle2, XCircle, Download } from 'lucide-react';
import Link from 'next/link';

const prisma = new PrismaClient();

interface VerifyPageProps {
  params: Promise<{ versionId: string }>;
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { versionId } = await params;

  try {
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
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
          <div className="text-center">
            <XCircle className="w-32 h-32 text-red-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-red-600 mb-4">
              PLAN NICHT GEFUNDEN
            </h1>
            <p className="text-xl text-gray-600">
              Der gescannte QR-Code ist ungültig oder wurde entfernt.
            </p>
          </div>
        </div>
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
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
          <div className="text-center">
            <XCircle className="w-32 h-32 text-red-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-red-600 mb-4">
              FEHLER
            </h1>
            <p className="text-xl text-gray-600">
              Keine aktuelle Version gefunden.
            </p>
          </div>
        </div>
      );
    }

    const isLatest = scannedVersion.id === latestVersion.id;

    if (isLatest) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-green-50 p-8">
          <div className="text-center max-w-2xl">
            <CheckCircle2 className="w-32 h-32 text-green-500 mx-auto mb-6" />
            <h1 className="text-5xl font-bold text-green-600 mb-8">
              PLAN IST AKTUELL
            </h1>
            
            <div className="bg-white rounded-lg shadow-lg p-8 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Projekt</p>
                  <p className="text-lg font-semibold">
                    {scannedVersion.trackedPlan.project.projectNumber} - {scannedVersion.trackedPlan.project.name}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Plan</p>
                  <p className="text-lg font-semibold">
                    {scannedVersion.trackedPlan.title}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Version</p>
                  <p className="text-lg font-semibold">
                    Version {scannedVersion.versionNumber}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Erstellt am</p>
                  <p className="text-lg font-semibold">
                    {new Date(scannedVersion.createdAt).toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-gray-600">
              <p className="text-lg">
                Sie arbeiten mit der aktuellen Version dieses Plans.
              </p>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-8">
          <div className="text-center max-w-2xl">
            <XCircle className="w-32 h-32 text-red-500 mx-auto mb-6" />
            <h1 className="text-5xl font-bold text-red-600 mb-8">
              ACHTUNG: PLAN VERALTET
            </h1>
            
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="border-l-4 border-red-500 pl-4">
                  <h3 className="text-lg font-semibold text-red-600 mb-3">
                    Ihre Version (VERALTET)
                  </h3>
                  <p className="text-gray-600 mb-1">
                    Version {scannedVersion.versionNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    vom {new Date(scannedVersion.createdAt).toLocaleDateString('de-DE')}
                  </p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="text-lg font-semibold text-green-600 mb-3">
                    Aktuelle Version
                  </h3>
                  <p className="text-gray-600 mb-1">
                    Version {latestVersion.versionNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    vom {new Date(latestVersion.createdAt).toLocaleDateString('de-DE')}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-500 mb-1">Projekt</p>
                <p className="font-semibold">
                  {scannedVersion.trackedPlan.project.projectNumber} - {scannedVersion.trackedPlan.project.name}
                </p>
                <p className="text-sm text-gray-500 mt-2 mb-1">Plan</p>
                <p className="font-semibold">
                  {scannedVersion.trackedPlan.title}
                </p>
              </div>
            </div>
            
            <Link
              href={`/api/public/plan-download/${latestVersion.id}`}
              className="inline-flex items-center gap-3 bg-green-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-green-700 transition-colors"
            >
              <Download className="w-6 h-6" />
              Aktuellen Plan (V{latestVersion.versionNumber}) herunterladen
            </Link>
            
            <div className="mt-8 text-red-600 font-semibold">
              <p className="text-lg">
                ⚠️ Sie arbeiten mit einer veralteten Planversion!
              </p>
              <p className="text-base mt-2">
                Bitte laden Sie die aktuelle Version herunter.
              </p>
            </div>
          </div>
        </div>
      );
    }
  } catch (error) {
    console.error('Error verifying plan:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
        <div className="text-center">
          <XCircle className="w-32 h-32 text-red-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-red-600 mb-4">
            FEHLER
          </h1>
          <p className="text-xl text-gray-600">
            Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.
          </p>
        </div>
      </div>
    );
  }
}