
import { NextRequest, NextResponse } from 'next/server';

// Definimos una interfaz para la respuesta que esperamos de la API de YouTube
interface YouTubeSearchResult {
    id: {
        videoId: string;
    };
    snippet: {
        title: string;
        channelTitle: string;
        thumbnails: {
            default: {
                url: string;
            };
        };
    };
}

export async function GET(request: NextRequest) {
    // 1. Obtenemos el término de búsqueda de los parámetros de la URL
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'El término de búsqueda es requerido' }, { status: 400 });
    }

    // 2. Obtenemos la clave de API de las variables de entorno (¡nunca la pongas directamente en el código!)
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

    if (!YOUTUBE_API_KEY) {
        console.error('Error: La clave de API de YouTube no está configurada en .env');
        return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${YOUTUBE_API_KEY}&maxResults=5`;

    try {
        // 3. Hacemos la llamada a la API de YouTube
        const response = await fetch(url);
        const data = await response.json();

        // Si la API de YouTube devuelve un error o no contiene items, lanzamos un error descriptivo
        if (!response.ok || !data.items) {
            console.error('Error de la API de YouTube:', data.error || data);
            return NextResponse.json({ error: 'Error al contactar la API de YouTube' }, { status: response.status || 500 });
        }

        // 4. Mapeamos la respuesta para quedarnos solo con los datos que necesitamos
        const results = data.items.map((item: YouTubeSearchResult) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            artist: item.snippet.channelTitle, // Usamos el nombre del canal como artista
            thumbnail: item.snippet.thumbnails.default.url,
        }));

        return NextResponse.json(results);
    } catch (error) {
        console.error('Error al buscar en YouTube:', error);
        return NextResponse.json({ error: 'Error al contactar la API de YouTube' }, { status: 500 });
    }
}