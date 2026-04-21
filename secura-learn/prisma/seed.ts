import { PrismaClient, Role, LessonType, CampaignStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // ─── Clean existing data (order matters for FK constraints) ───────────────
  await prisma.phishingAttempt.deleteMany()
  await prisma.phishingCampaign.deleteMany()
  await prisma.lessonProgress.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.quizQuestion.deleteMany()
  await prisma.quiz.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.module.deleteMany()
  await prisma.course.deleteMany()
  await prisma.user.deleteMany()
  await prisma.organization.deleteMany()

  // ─── Organizations ────────────────────────────────────────────────────────
  const acmeCorp = await prisma.organization.create({
    data: {
      clerkOrgId: 'org_acme_seed_001',
      name: 'Acme Corporation',
      slug: 'acme-corporation',
    },
  })

  const techStartup = await prisma.organization.create({
    data: {
      clerkOrgId: 'org_techstartup_seed_002',
      name: 'TechStartup Inc.',
      slug: 'techstartup-inc',
    },
  })

  console.log('✅ Organizations created')

  // ─── Users ────────────────────────────────────────────────────────────────
  const adminAlice = await prisma.user.create({
    data: {
      clerkUserId: 'user_admin_alice_001',
      email: 'alice@acme.com',
      firstName: 'Alice',
      lastName: 'Johnson',
      role: Role.ADMIN,
      organizationId: acmeCorp.id,
    },
  })

  const adminBob = await prisma.user.create({
    data: {
      clerkUserId: 'user_admin_bob_002',
      email: 'bob@techstartup.com',
      firstName: 'Bob',
      lastName: 'Smith',
      role: Role.ADMIN,
      organizationId: techStartup.id,
    },
  })

  const learnerCarol = await prisma.user.create({
    data: {
      clerkUserId: 'user_learner_carol_003',
      email: 'carol@acme.com',
      firstName: 'Carol',
      lastName: 'Williams',
      role: Role.LEARNER,
      organizationId: acmeCorp.id,
    },
  })

  const learnerDave = await prisma.user.create({
    data: {
      clerkUserId: 'user_learner_dave_004',
      email: 'dave@techstartup.com',
      firstName: 'Dave',
      lastName: 'Brown',
      role: Role.LEARNER,
      organizationId: techStartup.id,
    },
  })

  console.log('✅ Users created')

  // ─── Course 1: Phishing Basics ────────────────────────────────────────────
  const course1 = await prisma.course.create({
    data: {
      organizationId: acmeCorp.id,
      title: 'Phishing Basics',
      description: 'Learn to identify and avoid phishing attacks in the workplace.',
      isPublished: true,
      createdById: adminAlice.id,
    },
  })

  const c1m1 = await prisma.module.create({
    data: { courseId: course1.id, title: 'What is Phishing?', order: 1 },
  })
  const c1m2 = await prisma.module.create({
    data: { courseId: course1.id, title: 'Recognising Phishing Emails', order: 2 },
  })

  const c1m1l1 = await prisma.lesson.create({
    data: {
      moduleId: c1m1.id, title: 'Introduction to Phishing',
      type: LessonType.VIDEO, videoUrl: 'https://example.com/phishing-intro.mp4',
      durationMinutes: 8, order: 1,
    },
  })
  const c1m1l2 = await prisma.lesson.create({
    data: {
      moduleId: c1m1.id, title: 'Types of Phishing Attacks',
      type: LessonType.READING,
      content: 'Phishing comes in many forms: spear phishing, whaling, smishing, and vishing...',
      order: 2,
    },
  })
  const c1m2l1 = await prisma.lesson.create({
    data: {
      moduleId: c1m2.id, title: 'Red Flags in Emails',
      type: LessonType.TEXT,
      content: 'Look for mismatched sender addresses, urgent language, and suspicious links.',
      order: 1,
    },
  })
  const c1m2l2 = await prisma.lesson.create({
    data: {
      moduleId: c1m2.id, title: 'Phishing Basics Quiz',
      type: LessonType.QUIZ, order: 2,
    },
  })

  const quiz1 = await prisma.quiz.create({
    data: { lessonId: c1m2l2.id, title: 'Phishing Basics Assessment', passingScore: 75 },
  })
  await prisma.quizQuestion.createMany({
    data: [
      {
        quizId: quiz1.id, order: 1,
        questionText: 'What is the most common goal of a phishing attack?',
        options: [
          { text: 'Steal credentials or sensitive data', isCorrect: true },
          { text: 'Improve network performance', isCorrect: false },
          { text: 'Send marketing emails', isCorrect: false },
          { text: 'Update software automatically', isCorrect: false },
        ],
      },
      {
        quizId: quiz1.id, order: 2,
        questionText: 'Which of the following is a red flag in a phishing email?',
        options: [
          { text: 'Email from your CEO\'s verified address', isCorrect: false },
          { text: 'Urgent request to click a link and verify your password', isCorrect: true },
          { text: 'A newsletter you subscribed to', isCorrect: false },
          { text: 'A calendar invite from a colleague', isCorrect: false },
        ],
      },
      {
        quizId: quiz1.id, order: 3,
        questionText: 'What should you do if you receive a suspicious email?',
        options: [
          { text: 'Click the link to see if it is safe', isCorrect: false },
          { text: 'Forward it to all colleagues as a warning', isCorrect: false },
          { text: 'Report it to your IT/security team', isCorrect: true },
          { text: 'Reply asking the sender to confirm their identity', isCorrect: false },
        ],
      },
      {
        quizId: quiz1.id, order: 4,
        questionText: 'Spear phishing differs from regular phishing because it:',
        options: [
          { text: 'Uses phone calls instead of email', isCorrect: false },
          { text: 'Targets a specific individual or organisation', isCorrect: true },
          { text: 'Only targets financial institutions', isCorrect: false },
          { text: 'Is always sent from a known contact', isCorrect: false },
        ],
      },
    ],
  })

  console.log('✅ Course 1 (Phishing Basics) created')

  // ─── Course 2: Password Security ─────────────────────────────────────────
  const course2 = await prisma.course.create({
    data: {
      organizationId: acmeCorp.id,
      title: 'Password Security',
      description: 'Best practices for creating and managing strong passwords.',
      isPublished: true,
      createdById: adminAlice.id,
    },
  })

  const c2m1 = await prisma.module.create({
    data: { courseId: course2.id, title: 'Password Fundamentals', order: 1 },
  })
  const c2m2 = await prisma.module.create({
    data: { courseId: course2.id, title: 'Password Managers & MFA', order: 2 },
  })

  await prisma.lesson.create({
    data: {
      moduleId: c2m1.id, title: 'Why Passwords Matter',
      type: LessonType.VIDEO, videoUrl: 'https://example.com/passwords-intro.mp4',
      durationMinutes: 6, order: 1,
    },
  })
  await prisma.lesson.create({
    data: {
      moduleId: c2m1.id, title: 'Creating Strong Passwords',
      type: LessonType.READING,
      content: 'A strong password is at least 12 characters long and includes uppercase, lowercase, numbers, and symbols...',
      order: 2,
    },
  })
  await prisma.lesson.create({
    data: {
      moduleId: c2m2.id, title: 'Using a Password Manager',
      type: LessonType.TEXT,
      content: 'Password managers store and generate unique passwords for every site...',
      order: 1,
    },
  })
  const c2m2l2 = await prisma.lesson.create({
    data: {
      moduleId: c2m2.id, title: 'Password Security Quiz',
      type: LessonType.QUIZ, order: 2,
    },
  })

  const quiz2 = await prisma.quiz.create({
    data: { lessonId: c2m2l2.id, title: 'Password Security Assessment', passingScore: 80 },
  })
  await prisma.quizQuestion.createMany({
    data: [
      {
        quizId: quiz2.id, order: 1,
        questionText: 'What is the minimum recommended password length?',
        options: [
          { text: '6 characters', isCorrect: false },
          { text: '8 characters', isCorrect: false },
          { text: '12 characters', isCorrect: true },
          { text: '20 characters', isCorrect: false },
        ],
      },
      {
        quizId: quiz2.id, order: 2,
        questionText: 'Which of the following is the strongest password?',
        options: [
          { text: 'password123', isCorrect: false },
          { text: 'MyDog2020', isCorrect: false },
          { text: 'Tr0ub4dor&3', isCorrect: false },
          { text: 'xK#9mP!qL2@nR7', isCorrect: true },
        ],
      },
      {
        quizId: quiz2.id, order: 3,
        questionText: 'What does MFA stand for?',
        options: [
          { text: 'Multiple Factor Authentication', isCorrect: false },
          { text: 'Multi-Factor Authentication', isCorrect: true },
          { text: 'Managed File Access', isCorrect: false },
          { text: 'Master Firewall Access', isCorrect: false },
        ],
      },
      {
        quizId: quiz2.id, order: 4,
        questionText: 'You should use the same password for multiple accounts to:',
        options: [
          { text: 'Make it easier to remember', isCorrect: false },
          { text: 'Reduce the risk of being hacked', isCorrect: false },
          { text: 'Never — each account should have a unique password', isCorrect: true },
          { text: 'Save time when logging in', isCorrect: false },
        ],
      },
    ],
  })

  console.log('✅ Course 2 (Password Security) created')

  // ─── Course 3: Social Engineering ────────────────────────────────────────
  const course3 = await prisma.course.create({
    data: {
      organizationId: techStartup.id,
      title: 'Social Engineering',
      description: 'Understand how attackers manipulate people to gain unauthorised access.',
      isPublished: true,
      createdById: adminBob.id,
    },
  })

  const c3m1 = await prisma.module.create({
    data: { courseId: course3.id, title: 'Social Engineering Tactics', order: 1 },
  })
  const c3m2 = await prisma.module.create({
    data: { courseId: course3.id, title: 'Defending Against Manipulation', order: 2 },
  })

  await prisma.lesson.create({
    data: {
      moduleId: c3m1.id, title: 'What is Social Engineering?',
      type: LessonType.VIDEO, videoUrl: 'https://example.com/social-eng-intro.mp4',
      durationMinutes: 10, order: 1,
    },
  })
  await prisma.lesson.create({
    data: {
      moduleId: c3m1.id, title: 'Pretexting and Impersonation',
      type: LessonType.READING,
      content: 'Pretexting involves creating a fabricated scenario to extract information...',
      order: 2,
    },
  })
  await prisma.lesson.create({
    data: {
      moduleId: c3m2.id, title: 'Building a Security-Aware Culture',
      type: LessonType.TEXT,
      content: 'The best defence against social engineering is a well-trained workforce...',
      order: 1,
    },
  })
  const c3m2l2 = await prisma.lesson.create({
    data: {
      moduleId: c3m2.id, title: 'Social Engineering Quiz',
      type: LessonType.QUIZ, order: 2,
    },
  })

  const quiz3 = await prisma.quiz.create({
    data: { lessonId: c3m2l2.id, title: 'Social Engineering Assessment', passingScore: 80 },
  })
  await prisma.quizQuestion.createMany({
    data: [
      {
        quizId: quiz3.id, order: 1,
        questionText: 'Social engineering attacks primarily exploit:',
        options: [
          { text: 'Software vulnerabilities', isCorrect: false },
          { text: 'Human psychology and trust', isCorrect: true },
          { text: 'Network infrastructure weaknesses', isCorrect: false },
          { text: 'Outdated operating systems', isCorrect: false },
        ],
      },
      {
        quizId: quiz3.id, order: 2,
        questionText: 'An attacker calls pretending to be IT support and asks for your password. This is:',
        options: [
          { text: 'A legitimate IT request', isCorrect: false },
          { text: 'Vishing (voice phishing)', isCorrect: true },
          { text: 'A routine security audit', isCorrect: false },
          { text: 'Smishing', isCorrect: false },
        ],
      },
      {
        quizId: quiz3.id, order: 3,
        questionText: 'What is "tailgating" in physical security?',
        options: [
          { text: 'Following someone closely on the motorway', isCorrect: false },
          { text: 'Gaining physical access by following an authorised person through a secure door', isCorrect: true },
          { text: 'Sending emails from a mobile device', isCorrect: false },
          { text: 'Monitoring network traffic', isCorrect: false },
        ],
      },
      {
        quizId: quiz3.id, order: 4,
        questionText: 'The best response when someone pressures you to bypass security procedures is to:',
        options: [
          { text: 'Comply to avoid conflict', isCorrect: false },
          { text: 'Ask a colleague to handle it', isCorrect: false },
          { text: 'Refuse and report the incident to security', isCorrect: true },
          { text: 'Verify their identity by asking their name', isCorrect: false },
        ],
      },
    ],
  })

  console.log('✅ Course 3 (Social Engineering) created')

  // ─── Enrollments & Progress ───────────────────────────────────────────────
  const enrollment1 = await prisma.enrollment.create({
    data: {
      userId: learnerCarol.id,
      courseId: course1.id,
      progressPercentage: 75,
    },
  })

  // Carol has completed the first 3 lessons of course 1
  await prisma.lessonProgress.createMany({
    data: [
      {
        enrollmentId: enrollment1.id, lessonId: c1m1l1.id,
        completed: true, completedAt: new Date('2025-03-10T10:00:00Z'),
        lastAccessedAt: new Date('2025-03-10T10:00:00Z'),
      },
      {
        enrollmentId: enrollment1.id, lessonId: c1m1l2.id,
        completed: true, completedAt: new Date('2025-03-11T09:30:00Z'),
        lastAccessedAt: new Date('2025-03-11T09:30:00Z'),
      },
      {
        enrollmentId: enrollment1.id, lessonId: c1m2l1.id,
        completed: true, completedAt: new Date('2025-03-12T14:00:00Z'),
        lastAccessedAt: new Date('2025-03-12T14:00:00Z'),
      },
      {
        enrollmentId: enrollment1.id, lessonId: c1m2l2.id,
        completed: false, lastAccessedAt: new Date('2025-03-13T11:00:00Z'),
      },
    ],
  })

  const enrollment2 = await prisma.enrollment.create({
    data: {
      userId: learnerCarol.id,
      courseId: course2.id,
      progressPercentage: 0,
    },
  })
  // Carol just enrolled in course 2, no progress yet

  const enrollment3 = await prisma.enrollment.create({
    data: {
      userId: learnerDave.id,
      courseId: course3.id,
      progressPercentage: 100,
      completedAt: new Date('2025-04-01T16:00:00Z'),
    },
  })

  console.log('✅ Enrollments and progress created')

  // ─── Phishing Campaigns ───────────────────────────────────────────────────
  const campaign1 = await prisma.phishingCampaign.create({
    data: {
      organizationId: acmeCorp.id,
      title: 'Q1 2025 Phishing Simulation',
      description: 'Simulated credential-harvesting email targeting all Acme staff.',
      status: CampaignStatus.COMPLETED,
      sentAt: new Date('2025-01-15T09:00:00Z'),
      createdById: adminAlice.id,
    },
  })

  const campaign2 = await prisma.phishingCampaign.create({
    data: {
      organizationId: acmeCorp.id,
      title: 'Q2 2025 Phishing Simulation',
      description: 'Follow-up simulation targeting users who clicked in Q1.',
      status: CampaignStatus.RUNNING,
      sentAt: new Date('2025-04-10T09:00:00Z'),
      createdById: adminAlice.id,
    },
  })

  await prisma.phishingAttempt.createMany({
    data: [
      {
        campaignId: campaign1.id, userId: learnerCarol.id,
        opened: true, clicked: true, clickedAt: new Date('2025-01-15T10:23:00Z'),
        reported: false,
      },
      {
        campaignId: campaign1.id, userId: adminAlice.id,
        opened: true, clicked: false, reported: true,
        reportedAt: new Date('2025-01-15T09:45:00Z'),
      },
      {
        campaignId: campaign2.id, userId: learnerCarol.id,
        opened: true, clicked: false, reported: false,
      },
      {
        campaignId: campaign2.id, userId: adminAlice.id,
        opened: false, clicked: false, reported: false,
      },
      {
        campaignId: campaign1.id, userId: learnerDave.id,
        opened: true, clicked: false, reported: true,
        reportedAt: new Date('2025-01-15T11:00:00Z'),
      },
    ],
  })

  console.log('✅ Phishing campaigns and attempts created')

  // ─── Summary ──────────────────────────────────────────────────────────────
  const counts = {
    organizations: await prisma.organization.count(),
    users: await prisma.user.count(),
    courses: await prisma.course.count(),
    modules: await prisma.module.count(),
    lessons: await prisma.lesson.count(),
    quizzes: await prisma.quiz.count(),
    quizQuestions: await prisma.quizQuestion.count(),
    enrollments: await prisma.enrollment.count(),
    lessonProgress: await prisma.lessonProgress.count(),
    campaigns: await prisma.phishingCampaign.count(),
    attempts: await prisma.phishingAttempt.count(),
  }

  console.log('\n📊 Seed summary:')
  Object.entries(counts).forEach(([model, count]) => {
    console.log(`   ${model}: ${count}`)
  })
  console.log('\n🎉 Seed complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
