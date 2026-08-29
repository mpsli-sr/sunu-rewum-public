import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const router = Router();
const prisma = new PrismaClient();

function generatePDF(doc: jsPDF, filename: string, res: Response) {
  const pdfOutput = doc.output('arraybuffer');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(Buffer.from(pdfOutput));
}

// Export du programme 2029
router.get('/program', async (req: Request, res: Response) => {
  const sections = await prisma.programSection.findMany({
    include: { measures: true },
    orderBy: { order: 'asc' },
  });

  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('SUNU REWUM – Programme 2029', 10, 20);
  doc.setFontSize(10);
  doc.text(new Date().toLocaleDateString('fr'), 190, 20, { align: 'right' });

  let y = 35;
  sections.forEach(section => {
    doc.setFontSize(14);
    doc.text(section.title, 10, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(section.objective, 10, y);
    y += 6;
    section.measures.forEach(measure => {
      doc.text(`• ${measure.description}`, 15, y);
      y += 5;
      if (measure.budgetEstimate) {
        doc.text(`   Budget : ${measure.budgetEstimate} FCFA`, 20, y);
        y += 5;
      }
      if (measure.timeline) {
        doc.text(`   Échéance : ${measure.timeline}`, 20, y);
        y += 5;
      }
    });
    y += 5;
  });

  generatePDF(doc, 'programme-2029.pdf', res);
});

// Export des comptes (Transparence)
router.get('/transparency', async (req: Request, res: Response) => {
  const totalDonations = await prisma.transaction.aggregate({
    _sum: { amountFcfp: true },
    where: { type: 'DONATION', status: 'COMPLETED' },
  });
  const reportsCount = await prisma.report.count();

  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('SUNU REWUM – Rapport de transparence', 10, 20);
  doc.setFontSize(10);
  doc.text(new Date().toLocaleDateString('fr'), 190, 20, { align: 'right' });
  doc.setFontSize(12);
  doc.text(`Total des dons collectés : ${totalDonations._sum.amountFcfp || 0} FCFA`, 10, 40);
  doc.text(`Nombre de signalements : ${reportsCount}`, 10, 50);

  generatePDF(doc, 'transparence.pdf', res);
});

// Export de la charte signée
router.get('/charter', async (req: Request, res: Response) => {
  const charter = await prisma.ideologyPage.findUnique({ where: { slug: 'charter' } });
  const signatures = await prisma.charterSignature.count({ where: { verified: true } });

  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Charte du mouvement SUNU REWUM', 10, 20);
  doc.setFontSize(10);
  doc.text(new Date().toLocaleDateString('fr'), 190, 20, { align: 'right' });
  doc.setFontSize(11);
  const plainText = charter?.content?.replace(/<[^>]*>/g, '') || 'Charte non disponible';
  const splitText = doc.splitTextToSize(plainText, 180);
  doc.text(splitText, 10, 40);
  doc.setFontSize(12);
  const finalY = (doc as any).lastAutoTable?.finalY || 100;
  doc.text(`Nombre de signataires : ${signatures}`, 10, finalY + 10);

  generatePDF(doc, 'charte.pdf', res);
});

export default router;
