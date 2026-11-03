import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Comentario {
    @Prop({ type: Types.ObjectId, ref: 'Publicacion', required: true })
    publicacion: Types.ObjectId;
    @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
    autor: Types.ObjectId;
    @Prop({ required: true }) mensaje: string;
    @Prop({ default: false }) modificado: boolean;
}
export const ComentarioSchema = SchemaFactory.createForClass(Comentario);
ComentarioSchema.index({ publicacion: 1, createdAt: -1 });