import { Type } from "class-transformer";
import { IsNumber, IsOptional, Min } from "class-validator";

export class PaginationParams{
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    skip?: number; //cuantos elementos vamos a saltar

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number; //cantidad de elementos que vamos a obtener de la bd  
}