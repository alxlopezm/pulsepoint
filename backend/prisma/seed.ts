import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const businessUnits = [
  'Finance',
  'R&D',
  'Manufacturing',
  'GI',
  'Infrastructure',
  'Customer Experience',
  'Security',
]

async function main() {
  for (const name of businessUnits) {
    await prisma.businessUnit.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }
  console.log(`Seeded ${businessUnits.length} business units.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
