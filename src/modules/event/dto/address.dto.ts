import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class AddressDto {
    @ApiProperty({
        example: 'Bolgheri',
        required: false,
        description: 'Es el alias de la dirección utilizada, por ejemplo el nombre de un salón de fiestas.'
    })
    @IsOptional()
    @IsString({
        message: '$property#El valor del alias de la dirección no es válido.'
    })
    public alias?: string;

    @ApiProperty({
        example: 'San Martin',
        required: true,
        description: 'Es el nombre de la calle donde queda la dirección.'
    })
    @IsNotEmpty({
        message: '$property#La calle de la dirección no puede estar vacía.'
    })
    @IsString({
        message: '$property#El valor ingresado en la calle de la dirección no es válida.'
    })
    public street: string;

    @ApiProperty({
        example: 3645,
        required: true,
        description: 'Es la altura donde queda la dirección.'
    })
    @IsNotEmpty({
        message: '$property#El número de la dirección no puede estar vacío.'
    })
    @IsNumber({}, {
        message: '$property#El valor ingresado en el número de la dirección no es válido.'
    })
    public number: number;

    @ApiProperty({
        example: 'Villa Allende',
        required: true,
        description: 'Es la ciudad donde queda la dirección.'
    })
    @IsNotEmpty({
        message: '$property#La ciudad de la dirección no puede estar vacía.'
    })
    @IsString({
        message: '$property#El valor ingresado en la ciudad de la dirección no es válida.'
    })
    public city: string;

    @ApiProperty({
        example: 'Córdoba',
        required: true,
        description: 'Es la provincia donde queda la dirección.'
    })
    @IsOptional()
    @IsString({
        message: '$property#El valor ingresado en la provincia de la dirección no es válida.'
    })
    public province?: string;

    @ApiProperty({
        example: 'Argentina',
        required: true,
        description: 'Es el país donde queda la dirección.'
    })
    @IsOptional()
    @IsString({
        message: '$property#El valor ingresado en la ciudad de la dirección no es válida.'
    })
    public country?: string;

    @ApiProperty({
        example: '-31.4035°, -64.206272°',
        required: true,
        description: 'Son las coordenadas de la dirección.'
    })
    @IsOptional()
    @IsString({
        message: '$property#El valor ingresado en las coordenadas de la dirección no es válida.'
    })
    public coordinates?: string;
}
