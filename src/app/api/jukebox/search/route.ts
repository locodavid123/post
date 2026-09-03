import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(request: NextRequest) {
    // 1. Obtener término de búsqueda
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || !query.trim()) {
        return NextResponse.json({ error: 'El término de búsqueda es requerido' }, { status: 400 });
    }

    // 2. Obtener clave de API de YouTube de las variables de entorno
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

    if (!YOUTUBE_API_KEY) {
        console.error('Error: La clave YOUTUBE_API_KEY no está configurada en .env');
        return NextResponse.json(
            { error: 'La clave de la API de YouTube no está configurada en el servidor (YOUTUBE_API_KEY).' },
            { status: 500 }
        );
    }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        query.trim()
    )}&type=video&key=${YOUTUBE_API_KEY}&maxResults=6`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || !data.items) {
            const apiError = data?.error?.message || 'Error al comunicarse con la API de YouTube';
            console.error('Error YouTube API:', data?.error || data);
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

        return NextResponse.json(results);
    } catch (error) {
        console.error('Error al realizar la búsqueda en YouTube:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor al buscar canciones en YouTube.' },
            { status: 500 }
        );
    }
}