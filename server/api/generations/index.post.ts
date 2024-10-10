import { getAuth } from '#clerk';
import { ElevenLabs, ElevenLabsClient } from 'elevenlabs';
import { PinataSDK } from 'pinata';
import { v4 } from 'uuid';

interface Request {
  title: string;
  content: string;
}

export default eventHandler(async (event) => {
  const { userId } = getAuth(event);
  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const db = useDatabase();
  if (!db) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Database not found',
    });
  }

  const { toBlob } = useStreamToBlob();
  const config = useRuntimeConfig();
  const payload = await readBody<Request>(event);
  const id = v4();

  const pinata = new PinataSDK({
    pinataJwt: config.pinataJwt,
    pinataGateway: config.pinataGateway,
  });

  const elevenlabs = new ElevenLabsClient({
    apiKey: config.elevenlabsApiKey,
  });

  const audio = await elevenlabs.generate({
    voice: 'D38z5RcWu1voky8WS1ja',
    text: payload.content,
    output_format: ElevenLabs.OutputFormat.Mp32205032,
    model_id: 'eleven_multilingual_v2',
  });

  const blob = await toBlob(audio);
  const file = new File([blob], `${userId}-${id}`, { type: 'audio/mpeg' });
  const upload = await pinata.upload.file(file);

  const generation = {
    id,
    userId,
    title: payload.title,
    content: payload.content,
    audioId: upload.cid,
    createAt: new Date(),
  };

  await db.insert(tables.generations).values(generation);
  return generation;
});
