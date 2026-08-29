import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const ministries = [
    {
      name: 'Ministère de l\'Intérieur',
      budget: 250,
      description: 'Sécurité publique, élections',
      directors: [
        { name: 'Général Mamadou Ndiaye', title: 'Directeur de la Police Nationale' },
        { name: 'Commandant Aïssatou Diallo', title: 'Directrice de la Protection Civile' },
      ],
    },
    {
      name: 'Ministère des Finances',
      budget: 500,
      description: 'Budget, impôts, trésor',
      directors: [
        { name: 'Amadou Ba', title: 'Directeur Général des Impôts' },
        { name: 'Marième Faye', title: 'Directrice du Trésor' },
        { name: 'Ousmane Sonko', title: 'Directeur du Budget' },
      ],
    },
    {
      name: 'Ministère de l\'Éducation',
      budget: 700,
      description: 'Enseignement primaire, secondaire, universitaire',
      directors: [
        { name: 'Professor Ibrahima Fall', title: 'Directeur de l\'Enseignement Supérieur' },
        { name: 'Sophie Mendy', title: 'Directrice de l\'Éducation de Base' },
      ],
    },
    {
      name: 'Ministère de la Santé',
      budget: 350,
      description: 'Hôpitaux, prévention, pharmacie',
      directors: [
        { name: 'Dr. Oumar Sarr', title: 'Directeur de la Santé Publique' },
        { name: 'Dr. Fatoumata Bâ', title: 'Directrice des Hôpitaux' },
      ],
    },
    {
      name: 'Ministère de l\'Agriculture',
      budget: 400,
      description: 'Agriculture, élevage, pêche',
      directors: [
        { name: 'Moussa Diop', title: 'Directeur de l\'Agriculture' },
        { name: 'Aminata Sow', title: 'Directrice de l\'Élevage' },
        { name: 'Cheikh Niang', title: 'Directeur de la Pêche' },
      ],
    },
    {
      name: 'Ministère de la Justice',
      budget: 150,
      description: 'Justice, droits humains',
      directors: [
        { name: 'Magistrat Malick Coulibaly', title: 'Directeur des Affaires Judiciaires' },
        { name: 'Ndèye Ndiaye', title: 'Directrice des Droits Humains' },
      ],
    },
    {
      name: 'Ministère des Affaires Étrangères',
      budget: 200,
      description: 'Diplomatie, consulats',
      directors: [
        { name: 'Ambassadeur Saliou Dieng', title: 'Directeur des Relations Bilatérales' },
        { name: 'Mariama Guèye', title: 'Directrice des Affaires Consulaires' },
      ],
    },
    {
      name: 'Ministère des Forces Armées',
      budget: 600,
      description: 'Défense, armée',
      directors: [
        { name: 'Général Cheikh Wade', title: 'Chef d\'État-Major' },
        { name: 'Colonel Fatou Diouf', title: 'Directrice du Renseignement' },
      ],
    },
    {
      name: 'Ministère de l\'Économie Numérique',
      budget: 300,
      description: 'Digital, télécoms, innovation',
      directors: [
        { name: 'Mouhamed Diop', title: 'Directeur de l\'Innovation' },
        { name: 'Aïda Mbaye', title: 'Directrice de la Transformation Numérique' },
      ],
    },
    {
      name: 'Ministère de l\'Environnement',
      budget: 180,
      description: 'Écologie, forêts, développement durable',
      directors: [
        { name: 'Dr. Baba Dioum', title: 'Directeur des Parcs Nationaux' },
        { name: 'Rokhaya Niang', title: 'Directrice de l\'Éducation Environnementale' },
      ],
    },
    {
      name: 'Ministère de la Jeunesse et des Sports',
      budget: 120,
      description: 'Jeunesse, sports, loisirs',
      directors: [
        { name: 'Youssou Ndour', title: 'Directeur des Sports' },
        { name: 'Aminata Fall', title: 'Directrice de la Jeunesse' },
      ],
    },
    {
      name: 'Ministère de la Culture',
      budget: 100,
      description: 'Culture, patrimoine, arts',
      directors: [
        { name: 'Ousmane Sow', title: 'Directeur du Patrimoine' },
        { name: 'Ndeye Fatou Diop', title: 'Directrice des Arts' },
      ],
    },
    {
      name: 'Ministère de la Femme et de la Famille',
      budget: 130,
      description: 'Promotion féminine, protection de l\'enfance',
      directors: [
        { name: 'Ndèye Awa Diop', title: 'Directrice de la Promotion Féminine' },
        { name: 'Aminata Bâ', title: 'Directrice de la Famille' },
      ],
    },
  ];

  for (const ministry of ministries) {
    const created = await prisma.ministry.upsert({
      where: { name: ministry.name },
      update: { budget: ministry.budget, description: ministry.description },
      create: {
        name: ministry.name,
        budget: ministry.budget,
        description: ministry.description,
      },
    });

    for (const director of ministry.directors) {
      await prisma.director.upsert({
        where: { id: director.name }, // nom unique temporaire
        update: { title: director.title, ministryId: created.id },
        create: {
          name: director.name,
          title: director.title,
          ministryId: created.id,
        },
      });
    }
  }

  console.log('✅ 13 ministères et leurs directeurs insérés.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
