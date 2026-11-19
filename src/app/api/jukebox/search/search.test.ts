import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import prisma from '../../../../lib/prisma';
import { GET } from './route';
import { NextRequest } from 'next/server';

describe('Jukebox Search & Cache', () => {
  const testQuery = 'testrockolacache';

  beforeEach(async () => {
    // Limpiar entrada de prueba en caso de ejecuciones previas
    await prisma.youtubeSearchCache.deleteMany({
      where: { query: testQuery },
    });
  });

  afterAll(async () => {
    await prisma.youtubeSearchCache.deleteMany({
      where: { query: testQuery },
    });
  });

  it('rejects queries shorter than 3 characters', async () => {
    const req = new NextRequest('http://localhost:3000/api/jukebox/search?q=ab');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('serves cached results from PostgreSQL without querying YouTube API', async () => {
    const mockResults = [
      {
        id: 'mockVideo123',
        title: 'Mock Song Title',
        artist: 'Mock Artist',
        thumbnail: 'https://img.youtube.com/vi/mockVideo123/mqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=mockVideo123',
      },
    ];

    // Insertar en la tabla de caché de Prisma
    await prisma.youtubeSearchCache.create({
      data: {
        query: testQuery,
        results: mockResults,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const req = new NextRequest(`http://localhost:3000/api/jukebox/search?q=${testQuery.toUpperCase()}`);
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('x-cache')).toBe('HIT');

    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].id).toBe('mockVideo123');
    expect(data[0].title).toBe('Mock Song Title');
  });

  it('does not use expired cache results', async () => {
    const mockResults = [{ id: 'oldMock', title: 'Old Song' }];

    // Crear entrada expirada
    await prisma.youtubeSearchCache.create({
      data: {
        query: testQuery,
        results: mockResults,
        expiresAt: new Date(Date.now() - 1000), // Expirado hace un segundo
      },
    });

    const req = new NextRequest(`http://localhost:3000/api/jukebox/search?q=${testQuery}`);
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('x-cache')).not.toBe('HIT');
  });
});
