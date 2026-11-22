export async function enviarImagemParaImgBB(uri: string, base64?: string | null) {
  const apiKey = process.env.EXPO_PUBLIC_IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error('O envio de imagens não está configurado. Remova a foto para registrar a denúncia sem anexo ou configure o serviço de imagens.');
  }

  let image = base64;
  if (!image) {
    const response = await fetch(uri);
    const blob = await response.blob();
    image = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result).split(',')[1] ?? '');
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  if (!image) throw new Error('Não foi possível preparar a imagem.');

  const form = new FormData();
  form.append('key', apiKey);
  form.append('image', image);

  const response = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: form,
  });
  const result = await response.json();
  if (!response.ok || !result?.data?.url) {
    throw new Error(result?.error?.message ?? 'Não foi possível enviar a imagem.');
  }
  return String(result.data.url);
}
