import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface YouTubeSearchResult {
    id: {
        videoId: string;
    };
    snippet: {
        title: string;
        channelTitle: string;
        thumbnails: {
            default?: { url: string };
            medium?: { url: string };
            high?: { url: string };
        };
    };
}

function decodeHtmlEntities(text: string): string {
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

// Catálogo curado de demostración con IDs reales de YouTube
const DEMO_SONGS = [
    {
        id: 'fJ9rUzIMcZQ',
        title: 'Queen - Bohemian Rhapsody (Official Video Remastered)',
        artist: 'Queen Official',
        tags: ['rock', 'queen', 'bohemian', 'classic', 'clasico', '80s', '70s'],
    },
    {
        id: 'pAgnJDJN4VA',
        title: 'AC/DC - Back In Black (Official Video)',
        artist: 'AC/DC',
        tags: ['rock', 'acdc', 'ac/dc', 'back in black', 'metal', 'hard rock'],
    },
    {
        id: '1w7OgIMMRc4',
        title: "Guns N' Roses - Sweet Child O' Mine (Official Music Video)",
        artist: "Guns N' Roses",
        tags: ['rock', 'guns n roses', 'sweet child', 'slash', 'classic'],
    },
    {
        id: 'hTWKbfoikeg',
        title: 'Nirvana - Smells Like Teen Spirit (Official Music Video)',
        artist: 'Nirvana',
        tags: ['rock', 'nirvana', 'grunge', 'smells like teen spirit', 'kurt cobain'],
    },
    {
        id: 'lDK9QqIzhwk',
        title: "Bon Jovi - Livin' On A Prayer (Official Music Video)",
        artist: 'Bon Jovi',
        tags: ['rock', 'bon jovi', 'prayer', '80s', 'classic rock'],
    },
    {
        id: 'CD-E-LDc384',
        title: 'Metallica: Enter Sandman (Official Music Video)',
        artist: 'Metallica',
        tags: ['rock', 'metal', 'metallica', 'enter sandman', 'heavy'],
    },
    {
        id: 'Kpe_tmzp0gI',
        title: 'Soda Stereo - De Música Ligera (El Último Concierto)',
        artist: 'Soda Stereo',
        tags: ['rock', 'soda stereo', 'musica ligera', 'cerati', 'rock en español', 'latino'],
    },
    {
        id: 'khbDnLRT_H8',
        title: 'Los Enanitos Verdes - Lamento Boliviano (Video Oficial)',
        artist: 'Los Enanitos Verdes',
        tags: ['rock', 'lamento boliviano', 'enanitos verdes', 'rock en español', 'latino'],
    },
    {
        id: 'Zi_XLOBDo_Y',
        title: 'Michael Jackson - Billie Jean (Official Video)',
        artist: 'Michael Jackson',
        tags: ['pop', 'michael jackson', 'billie jean', 'dance', '80s'],
    },
    {
        id: 'dvgZkm1xWPE',
        title: 'Coldplay - Viva La Vida (Official Video)',
        artist: 'Coldplay',
        tags: ['pop', 'coldplay', 'viva la vida', 'indie', 'alternative'],
    },
    {
        id: 'A_MjCqQoLLA',
        title: 'The Beatles - Hey Jude',
        artist: 'The Beatles',
        tags: ['rock', 'pop', 'beatles', 'hey jude', 'classic'],
    },
    {
        id: '5NV6Rdv1a3w',
        title: 'Daft Punk - Get Lucky (Official Audio) ft. Pharrell Williams',
        artist: 'Daft Punk',
        tags: ['electronic', 'dance', 'daft punk', 'get lucky', 'pop', 'disco'],
    },
    {
        id: 'OPf0YbXqDm0',
        title: 'Mark Ronson - Uptown Funk (Official Video) ft. Bruno Mars',
        artist: 'Mark Ronson',
        tags: ['pop', 'funk', 'uptown funk', 'bruno mars', 'dance'],
    },
    {
        id: '4NRXx6U8ABQ',
        title: 'The Weeknd - Blinding Lights (Official Music Video)',
        artist: 'The Weeknd',
        tags: ['pop', 'the weeknd', 'blinding lights', 'synthwave', 'hits'],
    },
    {
        id: 'YXnjy5YlDwk',
        title: 'Marc Anthony - Vivir Mi Vida (Official Video)',
        artist: 'Marc Anthony',
        tags: ['salsa', 'latino', 'marc anthony', 'vivir mi vida', 'tropical', 'fiesta'],
    },
    {
        id: 'kJQP7kiw5Fk',
        title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
        artist: 'Luis Fonsi',
        tags: ['reggaeton', 'latino', 'despacito', 'daddy yankee', 'pop'],
    },
];

function getDemoResults(query: string) {
    const q = query.toLowerCase().trim();
    const words = q.split(/\s+/).filter(Boolean);

    // 1. Filtrar canciones que coincidan con el término
    const matches = DEMO_SONGS.filter((s) => {
        const fullText = `${s.title} ${s.artist} ${s.tags.join(' ')}`.toLowerCase();
        return words.some((w) => fullText.includes(w));
    });

    const chosen = matches.length > 0 ? matches : DEMO_SONGS.slice(0, 6);

    return chosen.map((item) => ({
        id: item.id,
        title: item.title,
        artist: item.artist,
        thumbnail: `https://img.youtube.com/vi/${item.id}/mqdefault.jpg`,
        url: `https://www.youtube.com/watch?v=${item.id}`,
    }));
}

export async function GET(request: NextRequest) {
    // 1. Obtener y normalizar término de búsqueda en minúsculas
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get('q') || '';
    const normalizedQuery = rawQuery.trim().toLowerCase();

    if (!normalizedQuery || normalizedQuery.length < 3) {
        return NextResponse.json(
            { error: 'El término de búsqueda debe tener al menos 3 caracteres' },
            { status: 400 }
        );
    }

    // 2. Verificar caché en PostgreSQL (YoutubeSearchCache)
    try {
        const cached = await prisma.youtubeSearchCache.findUnique({
            where: { query: normalizedQuery },
        });

        if (cached && new Date(cached.expiresAt) > new Date()) {
            return NextResponse.json(cached.results, {
                headers: {
                    'x-cache': 'HIT',
                },
            });
        }
    } catch (cacheErr) {
        console.error('[Jukebox Cache] Error al verificar caché en PostgreSQL:', cacheErr);
        // Continuamos de forma no bloqueante hacia la API de YouTube
    }

    // 3. Obtener clave de API de YouTube de las variables de entorno
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

    // Si la clave no está configurada o es el valor por defecto de ejemplo,
    // activamos el catálogo de demostración para que el Jukebox funcione sin interrupciones.
    const isApiKeyMissingOrPlaceholder =
        !YOUTUBE_API_KEY ||
        YOUTUBE_API_KEY.trim() === '' ||
        YOUTUBE_API_KEY === 'tu_youtube_api_key_aqui';

    if (isApiKeyMissingOrPlaceholder) {
        console.warn(
            `[Jukebox] YOUTUBE_API_KEY no configurada. Retornando resultados del catálogo de demostración para "${normalizedQuery}".`
        );
        const demoResults = getDemoResults(normalizedQuery);
        return NextResponse.json(demoResults, {
            headers: {
                'x-jukebox-mode': 'demo-fallback',
            },
        });
    }

    // 4. Consulta a la API Oficial de YouTube Data v3
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        normalizedQuery
    )}&type=video&key=${YOUTUBE_API_KEY}&maxResults=6`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || !data.items) {
            const apiError = data?.error?.message || 'Error al comunicarse con la API de YouTube';
            console.error('Error YouTube API:', data?.error || data);

            // Si se agotó la cuota de la API (403), recurrir al catálogo de contingencia
            if (response.status === 403) {
                console.warn('[Jukebox] Cuota de YouTube API excedida (403). Usando catálogo de contingencia.');
                return NextResponse.json(getDemoResults(normalizedQuery));
            }

            return NextResponse.json({ error: apiError }, { status: response.status || 500 });
        }

        // Mapear resultados
        const results = data.items.map((item: YouTubeSearchResult) => ({
            id: item.id.videoId,
            title: decodeHtmlEntities(item.snippet.title || ''),
            artist: decodeHtmlEntities(item.snippet.channelTitle || ''),
            thumbnail:
                item.snippet.thumbnails?.medium?.url ||
                item.snippet.thumbnails?.high?.url ||
                item.snippet.thumbnails?.default?.url ||
                `https://img.youtube.com/vi/${item.id.videoId}/mqdefault.jpg`,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        }));

        // 5. Guardar en PostgreSQL caché con expiración de 7 días
        try {
            const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
            const expiresAt = new Date(Date.now() + SEVEN_DAYS_MS);

            await prisma.youtubeSearchCache.upsert({
                where: { query: normalizedQuery },
                create: {
                    query: normalizedQuery,
                    results: results,
                    expiresAt,
                },
                update: {
                    results: results,
                    expiresAt,
                },
            });
        } catch (saveError) {
            console.error('[Jukebox Cache] Error al guardar resultados en caché de PostgreSQL:', saveError);
        }

        return NextResponse.json(results, {
            headers: {
                'x-cache': 'MISS',
            },
        });
    } catch (error) {
        console.error('Error al realizar la búsqueda en YouTube API, usando catálogo fallback:', error);
        // Si hay un error de conexión con Google, entregamos el catálogo de contingencia
        return NextResponse.json(getDemoResults(normalizedQuery));
    }
}
