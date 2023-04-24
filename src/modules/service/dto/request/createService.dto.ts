import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import { ObjectId } from "mongodb";

export class ServiceAddressDto{
    @ApiProperty({
        example: 'Bolgheri',
        required: false,
        description: 'Es el alias de la dirección utilizada, por ejemplo el nombre de un salón de fiestas.'
    })
    @IsOptional()
    @IsString({
        message: 'alias#El valor del alias de la dirección no es válido.'
    })
    public alias?: string;

    @ApiProperty({
        example: 'San Martin',
        required: true,
        description: 'Es el nombre de la calle donde queda la dirección.'
    })
    @IsNotEmpty({
        message: 'street#La calle de la dirección no puede estar vacía.'
    })
    @IsString({
        message: 'street#El valor ingresado en la calle de la dirección no es válida.'
    })
    public street: string;

    @ApiProperty({
        example: 3645,
        required: true,
        description: 'Es la altura donde queda la dirección.'
    })
    @IsNotEmpty({
        message: 'number#El número de la dirección no puede estar vacío.'
    })
    @IsNumber({}, {
        message: 'number#El valor ingresado en el número de la dirección no es válido.'
    })
    public number: number;

    @ApiProperty({
        example: 'Villa Allende',
        required: true,
        description: 'Es la ciudad donde queda la dirección.'
    })
    @IsNotEmpty({
        message: 'city#La ciudad de la dirección no puede estar vacía.'
    })
    @IsString({
        message: 'city#El valor ingresado en la ciudad de la dirección no es válida.'
    })
    public city: string;

    @ApiProperty({
        example: 'Córdoba',
        required: true,
        description: 'Es la provincia donde queda la dirección.'
    })
    @IsNotEmpty({
        message: 'province#La provincia de la dirección no puede estar vacía.'
    })
    @IsString({
        message: 'province#El valor ingresado en la provincia de la dirección no es válida.'
    })
    public province: string;

    @ApiProperty({
        example: 'Argentina',
        required: true,
        description: 'Es el país donde queda la dirección.'
    })
    @IsNotEmpty({
        message: 'country#El país de la dirección no puede estar vacío.'
    })
    @IsString({
        message: 'country#El valor ingresado en la ciudad de la dirección no es válida.'
    })
    public country: string;

    @ApiProperty({
        example: '-31.4035°, -64.206272°',
        required: true,
        description: 'Son las coordenadas de la dirección.'
    })
    @IsNotEmpty({
        message: 'coordinates#Las coordenadas de la dirección no pueden estar vacías.'
    })
    @IsString({
        message: 'coordinates#El valor ingresado en las coordenadas de la dirección no es válida.'
    })
    public coordinates: string;
}

export class CreateServiceDto{
    
    @ApiProperty({
        example: 'Baños Quimicos',
        required: true,
        description: 'Es el nombre del servicio.'
    })
    @IsNotEmpty({
        message: '$property#El nombre del servicio no puede estar vacío.'
    })
    @IsString({
        message: '$property#El valor ingresado en el nombre del servicio no es válido.'
    })
    @MaxLength(50, {
        message: '$property#El nombre del servicio no puede ser mayor a 50 caracteres.'
    })
    public name: string;

    @ApiProperty({
        example: 'Baños quimicos de plastico de 1,4x2 metros.',
        required: false,
        description: 'Es la descripción del servicio.'
    })
    @IsNotEmpty({
        message: '$property#La descripción del servicio no puede estar vacía.'
    })
    @IsString({
        message: '$property#El valor ingresado en la descripción del servicio no es válido.'
    })
    @MaxLength(500, {
        message: '$property#La descripción del servicio no puede ser mayor a 500 caracteres.'
    })
    public description: string;

    @ApiProperty({
        example: 'base64',
        required: true,
        description: 'Es la foto del servicio.'
    })
    @IsOptional()
    @IsString({
        message: '$property#El valor ingresado en la foto del servicio no es válido.'
    })
    public photo?: string;

    @ApiProperty({
        example: 'Disponible todos los dias de la semana a toda hora.',
        required: true,
        description: 'Es la foto del servicio.'
    })
    @IsNotEmpty({
        message: '$property#La disponibilidad del servicio no puede estar vacía.'
    })
    @IsString({
        message: '$property#El valor ingresado en la disponibilidad del servicio no es válida.'
    })
    @MaxLength(500, {
        message: '$property#La disponibilidad del servicio no puede ser mayor a 500 caracteres.'
    })
    public availability: string;

    @ApiProperty({
        example: {alias: 'Casa', street: 'San Martin', number: 3645, city: 'Villa Allende', province: 'Córdoba', country: 'Argentina', coordenates: '-31.4035°, -64.206272°'},
        required: true,
        description: 'Es la dirección del prestador de servicio.'
    })
    @IsNotEmpty({
        message: '$property#El valor ingresado en la dirección del servicio no puede estar vacía.'
    })
    @ValidateNested()
    @Type(() => ServiceAddressDto)
    public address: ServiceAddressDto;    

    @ApiProperty({
        example: 100,
        required: false,
        description: 'Es el rango en kilometros donde presta el servicio.'
    })
    @IsOptional()
    @IsNumber({},{
        message: '$property#El rango de cobertura debe ser un número.'
    })
    public range?: number;

    @ApiProperty({
        example: 10000,
        required: false,
        description: 'Es el precio del servicio.'
    })
    @IsOptional()
    @IsNumber({},{
        message: '$property#El precio debe ser un número.'
    })
    public price?: number;

    @ApiProperty({
        example: "Seguridad e higiene",
        required: true,
        description: 'Es el tipo de servicio a brindar.'
    })
    @IsNotEmpty({
        message: '$property#El tipo del servicio no puede estar vacío.'
    })
    @IsString({
        message: '$property#El valor ingresado en el tipo del servicio no es válido.'
    })
    public type: string;

    @ApiProperty({
        example: "Baños quimicos SA",
        required: false,
        description: 'Es un alias opcional que puede utilizar el proveedor de servicios.'
    })
    @IsOptional()
    @IsString({
        message: '$property#El valor ingresado en el proveedor no es válido-'
    })
    @MaxLength(100, {
        message: '$property#El alias del proveedor de servicios no puede ser mayor a 100 caracteres.'
    })
    public providerString?: string;

    @ApiProperty({
        example: "ObjectId(6317c1a96c3c794b8d3663ed)",
        required: false,
        description: 'Es el user_id del proveedor del servicio.'
    })
    @IsOptional()
    public provider: ObjectId;

    @ApiProperty({
        example: true,
        required: true,
        description: 'Indica si el servicio está activo para ser visible por el resto de usuarios.'
    })
    @IsNotEmpty({
        message: '$property#La visibilidad del servicio no puede estar vacía.'
    })
    @IsBoolean({
        message: '$property#El valor ingresado en la visibilidad del servicio no es válido.'
    })
    public visible: boolean;

    @ApiProperty({
        example: "351 6899668",
        required: true,
        description: 'Es el telefono de contacto del proveedor de servicios.'
    })
    @IsNotEmpty({
        message: '$property#El número de contacto del servicio es requerido.'
    })
    @IsString({
        message: '$property#El número de contacto no es válido.'
    })
    public contact_number: string;

    @ApiProperty({
        example: "bañosquimicos@gmail.com",
        required: true,
        description: 'Es el mail de contacto del proveedor de servicios'
    })
    @IsNotEmpty({
        message: '$property#El email de contacto no puede estar vacío.'
    })
    @IsEmail({},{
        message: '$property#El email no tiene el formato correcto.'
    })
    public contact_email: string;

    @ApiProperty({
        example: 4,
        required: false,
        description: 'Es la calificación del servicio.'
    })
    @IsOptional()
    @IsNumber({},{
        message: '$property#El valor ingresado en el rating no es válido.'
    })
    public rating?: number;
    
}