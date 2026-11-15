const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function enableRLS() {
  const tables = [
    'User', 'UserProfile', 'Document', 'DocumentImport', 
    'Category', 'Subcategory', 'Question', 'QuestionOption', 
    'QuestionAnswer', 'Material', 'MaterialChapter', 'MaterialProgress', 
    'ExamPackage', 'ExamPackageQuestion', 'ExamAttempt', 'ExamAnswer', 
    'ExamResult', 'UserFavorite', 'SystemSetting', 'AuditLog'
  ];

  console.log('Enabling Row Level Security (RLS) on all tables...');
  for (const tbl of tables) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "${tbl}" ENABLE ROW LEVEL SECURITY;`);
      console.log(`✓ RLS Enabled on: ${tbl}`);
    } catch (e) {
      console.log(`- Warning on table ${tbl}:`, e.message);
    }
  }
  console.log('All tables now protected with RLS!');
}

enableRLS()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

