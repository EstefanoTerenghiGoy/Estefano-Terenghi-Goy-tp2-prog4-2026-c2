import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    });
  }

  // Sube el archivo (que está en memoria) a la carpeta indicada y devuelve la URL https
  async subirArchivo(file: Express.Multer.File, carpeta: string): Promise<string> {
    const uri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const resultado = await cloudinary.uploader.upload(uri, {
      folder: carpeta,
      public_id: `${Date.now()}`,
    });
    return resultado.secure_url; //url HTTPS en vez de HTTP (secure)
  }
}
