import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsDateString, IsMilitaryTime, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";

export class AdressToUpdate{
    @ApiProperty({
        example: 'Bolgheri',
        required: false,
        description: 'Es el alias de la dirección utilizada, por ejemplo el nombre de un salón de fiestas.'
    })
    @IsOptional()
    @IsString({
        message: '$property#El alias no tiene el formato correcto.'
    })
    public alias?: string;

    @ApiProperty({
        example: 'San Martin',
        required: false,
        description: 'Es el nombre de la calle donde queda la dirección.'
    })
    @IsOptional()
    @IsString({
        message: '$property#El nombre de la calle solo puede contener letras y números.'
    })
    public street?: string;

    @ApiProperty({
        example: 3645,
        required: false,
        description: 'Es la altura donde queda la dirección.'
    })
    @IsOptional()
    @IsNumber({},{
        message: '$property#La altura de la calle solo puede contener números'
    })
    public number?: number;

    @ApiProperty({
        example: 'Villa Allende',
        required: false,
        description: 'Es la ciudad donde queda la dirección.'
    })
    @IsOptional()
    @IsString({
        message: '$property#La ciudad solo puede contener letras y números'
    })
    public city?: string;
}

export class TypeUpdateEvent{
    @ApiProperty({
        example: 'Casamiento',
        required: false,
        description: 'Es el nombre del tipo de evento.'
    })
    @IsOptional()
    @IsString({
        message: '$property#El nombre no es válido'
    })
    public name?: string;

    @ApiProperty({
        example: true,
        required: false,
        description: 'Es una bandera que indica si el evento es o no privado.'
    })
    @IsOptional()
    @IsBoolean({
        message: '$property#La privacidad del tipo de evento no es válido.'
    })
    public is_private?: boolean;

    @ApiProperty({
        required: false,
        description: 'Es la descripción del tipo de evento.'
    })
    @IsOptional()
    @IsString({
        message: '$property#La descripción no es válida.'
    })
    public description?: string;
}

export class UpdateEventDTO{
    @ApiProperty({
        example: '631516c39b6b86b5a973e836',
        required: true,
        description: 'El id del evento a actualizar'
    })
    @IsNotEmpty({
        message: '$property#El id del evento no puede estar vacío.'
    })
    @IsString({
        message: '$property#El id del evento no es válido.'
    })
    public event_id: string;

    @ApiProperty({
        example: 'Casamiento Cami y Kako',
        required: false,
        description: 'Es el nombre del evento que se llevará a cabo.'
    })
    @IsOptional()
    @IsString({
        message: '$property#El titulo del evento no es válido.'
    })
    @MaxLength(50, {
        message: 'property#El título debe ser menor a 50 caracteres.'
    })
    public title?: string;

    @ApiProperty({
        example: '2023-09-15',
        required: false,
        description: 'Es la fecha en la cual iniciará el evento.'
    })
    @IsOptional()
    @IsDateString({},{
        message: '$property#La fecha de inicio no tiene el formato correcto.'
    })
    public start_date?: string;

    @ApiProperty({
        example: '19:00:00',
        required: false,
        description: 'Es la hora en la cual iniciará el evento.'
    })
    @IsOptional()
    @IsMilitaryTime({
        message: '$property#La hora de inicio no posee el formato válido.'
    })
    public start_time: string;

    @ApiProperty({
        example: '2023-09-16',
        required: false,
        description: 'Es la fecha en la cual finalizará el evento.'
    })
    @IsOptional()
    @IsDateString({},{
        message: '$property#La fecha de fin no tiene el formato correcto.'
    })
    public end_date?: string;

    @ApiProperty({
        example: '05:00:00',
        required: false,
        description: 'Es la hora en la cual finalizará el evento.'
    })
    @IsOptional()
    @IsMilitaryTime({
        message: '$property#La hora de fin no posee el formato válido.'
    })
    public end_time?: string;
    
    @ApiProperty({
        example: 'Fiesta de casamiento de Camila Bermejo y Joaquin Costamagna.',
        required: false,
        description: 'Es la descripción del evento que se llevará a cabo.'
    })
    @IsOptional()
    @IsString({
        message: '$property#La descripción del evento no es válida.'
    })
    @MaxLength(500, {
        message: '$property#Ha superado el máximo de caracteres permitidos.'
    })
    public description?: string;

    @ApiProperty({
        example: {alias: 'Bolgheri', street: 'San Martin', number: 3645, city: 'Villa Allende'},
        required: false,
        description: 'Es la dirección donde se llevará a cabo el evento.'
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => AdressToUpdate)
    public address?: AdressToUpdate;


    @ApiProperty({
        example: {name: 'Casamiento',is_private: true, description: 'Fiesta de casamiento privada para más de 300 personas.'},
        required: false,
        description: 'Es el tipo de evento que se llevara a cabo.'
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => TypeUpdateEvent)
    public type?: TypeUpdateEvent;

}

