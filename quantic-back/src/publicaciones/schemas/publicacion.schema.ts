import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Publicacion {
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true, index: true })
  autor: Types.ObjectId;
  @Prop({ required: true, trim: true }) titulo: string;
  @Prop({ required: true }) mensaje: string;
  @Prop() imagen?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Usuario' }], default: [] })
  meGusta: Types.ObjectId[];
  @Prop({ default: 0 }) cantMeGusta: number;

  @Prop({ default: false }) eliminada: boolean;
}
export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
PublicacionSchema.index({ eliminada: 1, createdAt: -1 });