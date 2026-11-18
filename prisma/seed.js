const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || `postgres://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || '123456'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'ecopost'}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando siembra de datos en PostgreSQL...');

  // 1. Crear o asegurar negocio demo
  const business = await prisma.business.upsert({
    where: { code: 'demo' },
    update: {},
    create: {
      name: 'EcoPOS Demo',
      code: 'demo',
      phone: '555-0199',
      address: 'Av. Gastronómica #100',
      enableJukebox: true,
      enableQrOrders: true,
    },
  });
  console.log('✔ Negocio verificado:', business.name, `(${business.code})`);

  // 2. Crear o asegurar usuario Administrador vinculado al negocio
  const email = process.env.ADMIN_EMAIL || 'admin@ecopost.local';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const hash = await bcrypt.hash(password, 10);

  const adminUser = await prisma.user.upsert({
    where: { email },
    update: {
      businessId: business.id,
      role: 'ADMIN',
    },
    create: {
      email,
      name: 'Administrador EcoPOS',
      password: hash,
      role: 'ADMIN',
      businessId: business.id,
    },
  });
  console.log('✔ Usuario administrador listo:', adminUser.email);

  // 3. Crear Categorías en la base de datos
  const categoriesData = [
    { name: 'Hamburguesas', icon: '🍔' },
    { name: 'Entradas', icon: '🍟' },
    { name: 'Bebidas', icon: '🍺' },
    { name: 'Postres', icon: '🍰' },
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.upsert({
      where: {
        businessId_name: {
          businessId: business.id,
          name: cat.name,
        },
      },
      update: { icon: cat.icon },
      create: {
        businessId: business.id,
        name: cat.name,
        icon: cat.icon,
      },
    });
    categoryMap[cat.name] = createdCat.id;
  }
  console.log('✔ Categorías sembradas.');

  // 4. Crear Productos iniciales en PostgreSQL
  const initialProducts = [
    {
      name: 'Hamburguesa EcoClassic',
      category: 'Hamburguesas',
      price: 12.50,
      stock: 'disponible',
      description: 'Carne de res premium 150g, queso cheddar derretido, lechuga orgánica, tomate fresco y salsa especial.',
    },
    {
      name: 'Hamburguesa Doble Bacon',
      category: 'Hamburguesas',
      price: 15.00,
      stock: 'disponible',
      description: 'Doble carne angus, doble tocineta crocante, queso monterey jack y salsa barbacoa ahumada.',
    },
    {
      name: 'Papas Fritas Crujientes',
      category: 'Entradas',
      price: 4.50,
      stock: 'disponible',
      description: 'Papas cortadas a mano con sal marina y pimentón ahumado.',
    },
    {
      name: 'Aros de Cebolla Crujientes',
      category: 'Entradas',
      price: 5.50,
      stock: 'disponible',
      description: 'Aros de cebolla rebozados en panko con alioli de ajo asado.',
    },
    {
      name: 'Alitas BBQ Glaseadas',
      category: 'Entradas',
      price: 8.00,
      stock: 'disponible',
      description: '6 alitas bañadas en salsa BBQ artesanal ahumada.',
    },
    {
      name: 'Cerveza Artesanal IPA',
      category: 'Bebidas',
      price: 5.00,
      stock: 'disponible',
      description: 'Cerveza artesanal de la casa, notas intensas de lúpulo y cítricos.',
    },
    {
      name: 'Refresco de Cola de la Casa',
      category: 'Bebidas',
      price: 2.50,
      stock: 'disponible',
      description: 'Bebida refrescante carbonatada con toques naturales de cola.',
    },
    {
      name: 'Agua Mineral sin Gas',
      category: 'Bebidas',
      price: 2.00,
      stock: 'disponible',
      description: 'Agua purificada de manantial 500ml.',
    },
    {
      name: 'Volcán de Chocolate',
      category: 'Postres',
      price: 6.00,
      stock: 'disponible',
      description: 'Bizcocho tibio de chocolate relleno de fudge derretido con helado de vainilla.',
    },
  ];

  for (const p of initialProducts) {
    const existing = await prisma.product.findFirst({
      where: {
        businessId: business.id,
        name: p.name,
      },
    });

    if (!existing) {
      await prisma.product.create({
        data: {
          businessId: business.id,
          name: p.name,
          category: p.category,
          price: p.price,
          stock: p.stock,
          description: p.description,
          categoryId: categoryMap[p.category] || null,
        },
      });
    }
  }
  console.log('✔ Productos sembrados en PostgreSQL.');

  // 5. Crear 12 Mesas iniciales en TableSession
  const initialTables = [
    { number: 1, capacity: 4, status: 'occupied', waiter: 'Sofia G.', guestCount: 2, comment: 'Cerca a la ventana' },
    { number: 2, capacity: 2, status: 'free', waiter: null, guestCount: 1, comment: null },
    { number: 3, capacity: 4, status: 'free', waiter: null, guestCount: 1, comment: null },
    { number: 4, capacity: 6, status: 'free', waiter: null, guestCount: 1, comment: null },
    { number: 5, capacity: 2, status: 'free', waiter: null, guestCount: 1, comment: null },
    { number: 6, capacity: 8, status: 'occupied', waiter: 'Juan M.', guestCount: 6, comment: 'Reunión de cumpleaños' },
    { number: 7, capacity: 4, status: 'free', waiter: null, guestCount: 1, comment: null },
    { number: 8, capacity: 4, status: 'free', waiter: null, guestCount: 1, comment: null },
    { number: 9, capacity: 2, status: 'free', waiter: null, guestCount: 1, comment: null },
    { number: 10, capacity: 6, status: 'free', waiter: null, guestCount: 1, comment: null },
    { number: 11, capacity: 4, status: 'free', waiter: null, guestCount: 1, comment: null },
    { number: 12, capacity: 4, status: 'free', waiter: null, guestCount: 1, comment: null },
  ];

  for (const t of initialTables) {
    await prisma.tableSession.upsert({
      where: {
        businessId_tableId: {
          businessId: business.id,
          tableId: String(t.number),
        },
      },
      update: {
        capacity: t.capacity,
      },
      create: {
        businessId: business.id,
        tableId: String(t.number),
        nickname: `Mesa ${t.number}`,
        capacity: t.capacity,
        status: t.status,
        waiter: t.waiter,
        guestCount: t.guestCount,
        comment: t.comment,
      },
    });
  }
  console.log('✔ Mesas 1 a 12 sembradas en PostgreSQL.');

  console.log('✨ Base de datos poblada exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error sembrando base de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
