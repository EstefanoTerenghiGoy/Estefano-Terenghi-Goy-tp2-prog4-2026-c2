import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service.js';

@Module({
  providers: [CloudinaryService],
  exports: [CloudinaryService], // para que lo usen otros módulos
})
export class CloudinaryModule {}
